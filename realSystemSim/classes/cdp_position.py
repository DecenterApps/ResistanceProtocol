from json.encoder import INFINITY
from classes.price_station import *
from realSystemSim.agents.a_trader import NoiContract
from realSystemSim.utils.send_tx import send_tx
from constants import *
import numpy as np

from backend.CDPManager import *
from backend.NOI import *

web3 = Web3(Web3.HTTPProvider())

CDPManager = web3.eth.contract(
    address=ADDRESS_CDPMANAGER, abi=ABI_CDPMANAGER)

NoiContract = web3.eth.contract(
    address=ADDRESS_NOI, abi=ABI_NOI)

class CDP_Position:
    def __init__(self, index, stable_cr, repay_cr, boost_cr):
        self.index = index
        self.stable_cr = stable_cr
        self.repay_cr = repay_cr
        self.boost_cr = boost_cr

    def calculate_cr(self):
        return web3.fromWei(CDPManager.functions.getCR(self.index).call(), 'ether')

    def getCollateralEth(self):
        print(CDPManager.functions.getOneCDP(self.index).call())
        return 1 #CDPManager.functions.getOneCDP(self.index).call()

    def getDebtNoi(self):
        return CDPManager.functions.getDebtWithSF(self.index).call()/1e18
    
    def dfs_boost_position(self, ext_data: ExtData, price_station: PriceStation, pool: Pool):
        a = self.stable_cr * price_station.getRp()
        doll = ext_data.get_eth_value()
        b = a*(self.getDebtNoi() + pool.getNoi()) - doll*(self.getCollateralEth() + pool.getEth())
        c = pool.getNoi()*(a*self.getDebtNoi() - doll*self.getCollateralEth())
        noi_amount = (-b + np.sqrt(b**2 - 4*a*c)) / (2*a)
        pool.put_noi_get_eth(noi_amount, price_station, ext_data)

        if np.abs(self.calculate_cr() - self.stable_cr) > 0.01:
            assert False, "ASSERT 02, not correct boost "

        return
    
    def dfs_repay_position(self, ext_data: ExtData, price_station: PriceStation, pool: Pool):
        eth_total_val = ext_data.get_eth_value_for_amount(self.getCollateralEth())
        noi_total_val = price_station.get_rp_value_for_amount(self.getDebtNoi())

        if noi_total_val == 0:
            # print("can't repay position, because it's empty")
            return
        
        doll = ext_data.get_eth_value()
        a = doll
        b = self.stable_cr * price_station.getRp() * (self.getDebtNoi() - pool.getNoi()) + doll * (pool.getEth() - self.getCollateralEth())
        c = pool.getEth() * (self.stable_cr * price_station.getRp() * self.getDebtNoi() - doll * self.getCollateralEth())
        eth_amount = (-b - np.sqrt(b**2 - 4*a*c)) / (2*a)
        eth_amount, noi_amount = pool.put_eth_get_noi(eth_amount, price_station, ext_data)

        self.collateral_eth -= eth_amount
        self.debt_noi -= noi_amount
        if self.collateral_eth < 0 or self.debt_noi < 0:
            assert False, "values are negative"
        if np.abs(self.calculate_cr(ext_data, price_station) - self.stable_cr) > 0.01:
            assert False, "ASSERT 03, not correct repay"
        
        return

    def boost_position(self, ext_data: ExtData, price_station: PriceStation, pool: Pool):
        cr = self.calculate_cr()
        if cr < self.boost_cr:
            return
        noi_add = ext_data.get_eth_value_for_amount(self.collateral_eth) / price_station.rp / self.stable_cr - self.debt_noi
        eth_amount, noi_am = pool.put_noi_get_eth(noi_add, price_station, ext_data)
        if np.abs(noi_add - noi_am) > 0.00001:
            assert False, "ASSERT 04, not correct boost"
        self.debt_noi += noi_am

        return

    def repay_position(self, ext_data: ExtData, price_station: PriceStation, pool: Pool):
        cr = self.calculate_cr()
        if cr > self.repay_cr:
            return
        noi_add = self.debt_noi - ext_data.get_eth_value_for_amount(self.collateral_eth) / price_station.rp / self.stable_cr
        eth_amount = pool.how_much_eth_for_noi(noi_add)
        eth_amount, noi_am = pool.put_eth_get_noi(eth_amount, price_station, ext_data)
        if np.abs(noi_add - noi_am) > 0.00001:
            assert False, "ASSERT 03, not correct repayment"
        
        self.debt_noi -= noi_am
        if np.abs(self.calculate_cr(ext_data, price_station) - self.stable_cr) > 0.01:
            assert False, "ASSERT 03.1, not correct repayment"
        
        return
    

    def close_position(self, name, address, private_key):
        print(name + ' closing position...')
        try:
            debt = self.getDebtNoi() + 0.1
            tx = NoiContract.functions.approve(CDPManager.address, debt*1e18).buildTransaction(
                {
                    'from': address,
                    'nonce': web3.eth.get_transaction_count(address),
                }
            )
            send_tx(tx, private_key)
            tx = CDPManager.functions.repayAndCloseCDP(self.index).buildTransaction(
                {
                    'from': address,
                    'nonce': web3.eth.get_transaction_count(address),
                }
            )
            send_tx(tx, private_key)
        except Exception as e:
            print('Tx close_position failed!')
            print(e)

    
    #TODO jel treba ovo
    # def liquidation(self, ext_data: ExtData, price_station: PriceStation, pool: Pool):
