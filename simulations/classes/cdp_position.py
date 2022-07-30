from classes.eth_data import ETHData
from classes.price_station import PriceStation
from utils.exchange import exchange_noi_to_eth
from utils.constants import *
from classes.pool import Pool

class CDP_Position:
    def __init__(self, collateral_eth, debt_noi, stable_cr, repay_cr, boost_cr):
        self.collateral_eth = collateral_eth
        self.debt_noi = debt_noi
        self.stable_cr = stable_cr
        self.repay_cr = repay_cr
        self.boost_cr = boost_cr

    def calculate_cr(self, substep, previous_state, eth_data: ETHData, price_station: PriceStation):
        eth_total_val = eth_data.get_eth_value_for_amount(self.collateral_eth, substep, previous_state)
        noi_total_val = price_station.get_rp_value_for_amount(self.debt_noi)
        if noi_total_val == 0:
            return INF
        return eth_total_val / noi_total_val
    
    def boost_position(self, substep, previous_state, eth_data: ETHData, price_station: PriceStation, pool: Pool):
        eth_total_val = eth_data.get_eth_value_for_amount(self.collateral_eth, substep, previous_state)
        noi_total_val = price_station.get_rp_value_for_amount(self.debt_noi)
        if noi_total_val != 0 and eth_total_val / noi_total_val < self.boost_cr:
            print("can't boost position, because it's too low")
            return
        
        # this amount is going to be added to both collateral and debt
        # this is the amount in dollars
        x = (eth_total_val - noi_total_val * self.stable_cr) / (self.stable_cr - 1)
        noi_amount = price_station.get_amount_of_noi_for_rp_value(x)
        eth_amount = pool.put_noi_get_eth(substep, previous_state, noi_amount, price_station, eth_data)
        
        self.collateral_eth += eth_amount
        self.debt_noi += noi_amount
        # print("boosted position")
        # print("targeted cr: ", self.stable_cr, "real cr: ", self.calculate_cr(substep, previous_state, eth_data, price_station))
        return
    
    def repay_position(self, substep, previous_state, eth_data: ETHData, price_station: PriceStation, pool: Pool):
        eth_total_val = eth_data.get_eth_value_for_amount(self.collateral_eth, substep, previous_state)
        noi_total_val = price_station.get_rp_value_for_amount(self.debt_noi)

        if noi_total_val == 0:
            print("can't repay position, because it's empty")
            return
        
        x = (self.stable_cr * noi_total_val - eth_total_val) / (self.stable_cr - 1)
        eth_amount = eth_data.get_eth_amount_for_value(x, substep, previous_state)
        noi_amount = pool.put_eth_get_noi(substep, previous_state, eth_amount, price_station, eth_data)

        self.collateral_eth -= eth_amount
        self.debt_noi -= noi_amount
        # print("repaid position")
        # print("targeted cr: ", self.stable_cr, "real cr: ", self.calculate_cr(substep, previous_state, eth_data, price_station))
        return
    
    #returns eth value to the position owner
    def close_position(self, substep, total_noi_val, previous_state, eth_data: ETHData, price_station: PriceStation, pool: Pool):
        if total_noi_val >= self.debt_noi:
            noi_add = total_noi_val - self.debt_noi
            return self.collateral_eth + pool.put_noi_get_eth(substep, previous_state, noi_add, price_station, eth_data)
        diff_noi = self.debt_noi - total_noi_val
        eth_amount = exchange_noi_to_eth(diff_noi, pool)
        noi_am = pool.put_eth_get_noi(substep, previous_state, eth_amount, price_station, eth_data)
        # print('closed position')
        # print('diff', diff_noi, 'real noi', noi_am)
        left_collateral = self.collateral_eth - eth_amount
        # print('left collateral', left_collateral)
        return left_collateral
    
    #TODO jel treba ovo
    # def liquidation(self, substep, previous_state, eth_data: ETHData, price_station: PriceStation, pool: Pool):
    #     return pool.put_noi_get_eth(substep, previous_state, self.debt_noi, price_station, eth_data)
