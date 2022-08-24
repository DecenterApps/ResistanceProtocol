from classes.price_station import *
from utils.constants import *
import numpy as np

class CDP_Position:
    def __init__(self, collateral_eth, debt_noi, stable_cr, repay_cr, boost_cr):
        self.collateral_eth = collateral_eth
        self.debt_noi = debt_noi
        self.stable_cr = stable_cr
        self.repay_cr = repay_cr
        self.boost_cr = boost_cr

    def calculate_cr(self, ext_data: ExtData, price_station: PriceStation):
        eth_total_val = ext_data.get_eth_value_for_amount(self.collateral_eth)
        noi_total_val = price_station.get_rp_value_for_amount(self.debt_noi)
        if noi_total_val == 0:
            return INF
        return eth_total_val / noi_total_val
    
    def dfs_boost_position(self, ext_data: ExtData, price_station: PriceStation, pool: Pool):
        eth_total_val = ext_data.get_eth_value_for_amount(self.collateral_eth)
        noi_total_val = price_station.get_rp_value_for_amount(self.debt_noi)
        if noi_total_val != 0 and eth_total_val / noi_total_val < self.boost_cr:
            # print("can't boost position, because it's too low")
            return
        
        a = self.stable_cr * price_station.rp
        doll = ext_data.get_eth_value()
        b = a*(self.debt_noi + pool.noi) - doll*(self.collateral_eth + pool.eth)
        c = pool.noi*(a*self.debt_noi - doll*self.collateral_eth)
        noi_amount = (-b + np.sqrt(b**2 - 4*a*c)) / (2*a)
        eth_amount, noi_amount = pool.put_noi_get_eth(noi_amount, price_station, ext_data)
        self.collateral_eth += eth_amount
        self.debt_noi += noi_amount

        if np.abs(self.calculate_cr(ext_data, price_station) - self.stable_cr) > 0.01:
            assert False, "ASSERT 02, not correct boost "

        return
    
    def dfs_repay_position(self, ext_data: ExtData, price_station: PriceStation, pool: Pool):
        eth_total_val = ext_data.get_eth_value_for_amount(self.collateral_eth)
        noi_total_val = price_station.get_rp_value_for_amount(self.debt_noi)

        if noi_total_val == 0:
            # print("can't repay position, because it's empty")
            return
        
        doll = ext_data.get_eth_value()
        a = doll
        b = self.stable_cr * price_station.rp * (self.debt_noi - pool.noi) + doll * (pool.eth - self.collateral_eth)
        c = pool.eth * (self.stable_cr * price_station.rp * self.debt_noi - doll * self.collateral_eth)
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
        cr = self.calculate_cr(ext_data, price_station)
        if cr < self.boost_cr:
            return
        noi_add = ext_data.get_eth_value_for_amount(self.collateral_eth) / price_station.rp / self.stable_cr - self.debt_noi
        eth_amount, noi_am = pool.put_noi_get_eth(noi_add, price_station, ext_data)
        if np.abs(noi_add - noi_am) > 0.00001:
            assert False, "ASSERT 04, not correct boost"
        self.debt_noi += noi_am

        return

    def repay_position(self, ext_data: ExtData, price_station: PriceStation, pool: Pool):
        cr = self.calculate_cr(ext_data, price_station)
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
    
    #returns eth value to the position owner
    def close_position(self, total_noi_val, ext_data: ExtData, price_station: PriceStation, pool: Pool):
        if total_noi_val >= self.debt_noi:
            noi_add = total_noi_val - self.debt_noi
            added_eth, added_noi = pool.put_noi_get_eth(noi_add, price_station, ext_data)
            return self.collateral_eth + added_eth
        diff_noi = self.debt_noi - total_noi_val
        
        eth_amount = pool.how_much_eth_for_noi(diff_noi)

        eth_amount, noi_am = pool.put_eth_get_noi(eth_amount, price_station, ext_data)
        if abs(noi_am - diff_noi) > 0.0001:
            assert False, ("ASSERT 01, POSITION NOT CLOSED", noi_am - diff_noi)
        left_collateral = self.collateral_eth - eth_amount
        return left_collateral
    
    #TODO jel treba ovo
    # def liquidation(self, ext_data: ExtData, price_station: PriceStation, pool: Pool):
