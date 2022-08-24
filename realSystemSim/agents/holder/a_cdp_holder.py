from abc import ABC, abstractmethod
from backend.NOI import *
from classes.cdp_position import *
import random

from realSystemSim.classes.cdp_position import CDP_Position
from realSystemSim.classes.pool import Pool
from realSystemSim.classes.price_station import PriceStation
from realSystemSim.constants import LIQUIDATION_RATIO
from realSystemSim.utils.send_tx import send_tx
 
web3 = Web3(Web3.HTTPProvider())

CDPManager = web3.eth.contract(address=ADDRESS_CDPMANAGER, abi=ABI_CDPMANAGER)
NoiContract = web3.eth.contract(address=ADDRESS_NOI, abi=ABI_NOI)

class CDP_Holder(ABC):

    def __init__(self, name, address, private_key, CONST):
        self.name = name
        self.address = address
        self.private_key = private_key
        self.relative_gap = get_holder_relative_gap(CONST)
        self.perc_amount = get_holder_perc_amount(CONST)
        self.prediction_time = get_holder_prediction(CONST)
        self.prediction_threshold = get_holder_prediction_threshold(CONST)
        self.initial_cr, self.repay_cr, self.boost_cr = get_collateral_ratios(CONST)
        self.opened_position = False
        self.cdp_position: CDP_Position = None
    
    def getEth(self):
        return web3.fromWei(web3.eth.get_balance(self.address), 'ether')

    def getNoi(self):
        return web3.fromWei(NoiContract.functions.balanceOf(self.address).call(), 'ether')    

    def calculate_cr(self):
        return self.cdp_position.calculate_cr()
    
    @abstractmethod
    def boost(self, ext_data: ExtData, price_station: PriceStation, pool: Pool):
        pass

    @abstractmethod
    def repay(self, ext_data: ExtData, price_station: PriceStation, pool: Pool):
        pass

    def close_position(self):
        self.opened_position = False
        self.cdp_position.close_position(self.name, self.address, self.private_key)

    def open_position(self, ext_data:ExtData, price_station: PriceStation, pool: Pool):
        self.opened_position = True

        print(self.name + ' opening position...')
        try:
            collateral = Decimal(self.getEth()) * Decimal(self.perc_amount)
            tx = NoiContract.functions.approve(CDPManager.address, int(collateral*Decimal(1e18))).buildTransaction(
                {
                    'from': self.address,
                    'nonce': web3.eth.get_transaction_count(self.address),
                }
            )
            send_tx(tx, self.private_key)

            tx = CDPManager.functions.openCDPandMint(self.address, int(collateral*Decimal(1e18))).buildTransaction(
                {
                    'from': self.address,
                    'nonce': web3.eth.get_transaction_count(self.address),
                    'value': web3.toWei(collateral, "ether")
                }
            )
            send_tx(tx, self.private_key)

            cdp_index = CDPManager.functions.cdpi().call()
            self.cdp_position = CDP_Position(cdp_index, self.initial_cr, self.repay_cr, self.boost_cr)

            to_mint = price_station.get_amount_of_noi_for_rp_value(ext_data.get_eth_value_for_amount(collateral)) / self.initial_cr
            pool.put_noi_get_eth(to_mint, self.name, self.address, self.private_key)
        except Exception as e:
            print('Tx open_position failed!')
            print(e)

    def liquidation(self):
        self.opened_position = False

def update_holder(agents, price_station: PriceStation, pool: Pool, ext_data: ExtData, name_literal, CONST):
    leverager: bool = False
    if name_literal == 'leverager':
        leverager = True
    if CONST.ACCOUNTS_END-CONST.ACCOUNTS_START == 0:
        return
    i = random.randint(0, CONST.ACCOUNTS_END-CONST.ACCOUNTS_START - 1)
    name = name_literal + str(i)
    holder: CDP_Holder = agents[name]
    relative_gap = np.abs(
        price_station.getMp() - price_station.getRp()) / price_station.getRp()
    
    predicted_eth_price = ext_data.get_predicted_eth_price(holder.prediction_time)
    curr_eth_price = ext_data.get_eth_value()
    relative_eth_difference = 0 if predicted_eth_price == 0 else abs((predicted_eth_price - curr_eth_price) / curr_eth_price)
    relative_eth_difference *= CONST.PREDICTION_STRENGTH

    if holder.opened_position:
        current_cr = holder.cdp_position.calculate_cr()
        if current_cr < LIQUIDATION_RATIO and leverager:
            holder.liquidation()
        else:
            if (relative_gap > holder.relative_gap and price_station.getRp() > price_station.getMp() and leverager) or \
               (relative_eth_difference > holder.prediction_threshold and predicted_eth_price < curr_eth_price):
                holder.close_position(ext_data, price_station, pool)
            elif current_cr > holder.boost_cr:
                holder.boost(ext_data, price_station, pool)
            elif current_cr < holder.repay_cr:
                holder.repay(ext_data, price_station, pool)
    else:
        
        if (relative_gap > holder.relative_gap and price_station.getRp() < price_station.getMp() and holder.getEth() > 0) or \
            (relative_eth_difference > holder.prediction_threshold and predicted_eth_price > curr_eth_price):
            holder.open_position(ext_data, price_station, pool)
    
    agents[name] = holder

def get_holder_values(CONST):
    p = np.random.random()
    if p < CONST.RISKY:
        return CONST.R_DIFF, CONST.R_CR
    p -= CONST.RISKY
    if p < CONST.MODERATE:
        return CONST.M_DIFF, CONST.M_CR
    return CONST.S_DIFF, CONST.S_CR

# percentage of eth amount that is used for collateral of a holder
def get_holder_perc_amount(CONST) -> float:
    p = np.random.random()
    if p < CONST.R_COLLATERAL:
        return 0.95
    p -= CONST.R_COLLATERAL
    if p < CONST.M_COLLATERAL:
        return 0.7
    return 0.45

# difference between redemption price and market price when holder opens/closes a position
def get_holder_relative_gap(CONST):
    p = np.random.random()
    if p < CONST.RELATIVE_GAP_RISKY:
        return 0.02
    p -= CONST.RELATIVE_GAP_RISKY
    if p < CONST.RELATIVE_GAP_MODERATE:
        return 0.05
    return 0.1

# returns initial collateral ratio, repayment ratio and boost ratio of a cdp holder
def get_collateral_ratios(CONST):
    diff, cr = get_holder_values(CONST)
    init_cr = cr
    repay_cr = max(LIQUIDATION_RATIO, cr - diff)
    boost_cr = cr + diff
    return init_cr, repay_cr, boost_cr

def get_holder_prediction(CONST):
    p = np.random.random()
    if p < CONST.PREDICTION_FAR:
        return 300
    p -= CONST.PREDICTION_FAR
    if p < CONST.PREDICTION_MID:
        return 150
    p -= CONST.PREDICTION_MID
    return 50

def get_holder_prediction_threshold(CONST):
    p = np.random.random()
    if p < CONST.PREDICTION_THRESHOLD_HIGH:
        return 0.3
    p -= CONST.PREDICTION_THRESHOLD_HIGH
    if p < CONST.PREDICTION_THRESHOLD_MID:
        return 0.15
    p -= CONST.PREDICTION_THRESHOLD_MID
    return 0.09