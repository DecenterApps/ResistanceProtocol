from abc import ABC, abstractmethod
from classes.cdp_position import *
from classes.eth_data import ETHData
from classes.price_station import PriceStation
import random
 
class CDP_Holder(ABC):

    def __init__(self, name, eth_amount, perc_amount, initial_cr, repay_cr, boost_cr, relative_gap):
        self.name = name
        self.relative_gap = relative_gap
        self.eth_amount = eth_amount
        self.perc_amount = perc_amount
        self.initial_cr = initial_cr
        self.repay_cr = repay_cr
        self.boost_cr = boost_cr
        self.opened_position = False
        self.cdp_position: CDP_Position = None
    
    def calculate_cr(self, eth_data: ETHData, price_station: PriceStation):
        return self.cdp_position.calculate_cr(eth_data, price_station)
    
    @abstractmethod
    def boost(self, eth_data: ETHData, price_station: PriceStation, pool: Pool):
        pass

    @abstractmethod
    def repay(self, eth_data: ETHData, price_station: PriceStation, pool: Pool):
        pass

    def close_position(self, eth_data: ETHData, price_station: PriceStation, pool: Pool):
        self.opened_position = False
        self.eth_amount += self.cdp_position.close_position(self.debt_noi, eth_data, price_station, pool)
        self.debt_noi = 0

    def open_position(self, eth_data:ETHData, price_station: PriceStation, pool: Pool):
        self.opened_position = True
        collateral = self.eth_amount * self.perc_amount
        self.eth_amount -= collateral
        self.debt_noi = price_station.get_amount_of_noi_for_rp_value(
            collateral) / self.initial_cr
        self.cdp_position = CDP_Position(
            collateral, self.debt_noi, self.initial_cr, self.repay_cr, self.boost_cr)

        added_eth, added_noi = pool.put_noi_get_eth(self.debt_noi, price_station, eth_data)
        return added_eth, added_noi

    def liquidation(self):
        self.opened_position = False
        self.debt_noi = 0


def update_holder(previous_state, agents, price_station: PriceStation, pool: Pool, eth_data: ETHData, name_literal, CONST):
    leverager: bool = False
    if name_literal == 'leverager':
        leverager = True
    if CONST.NUM == 0:
        return
    i = random.randint(0, CONST.NUM - 1)
    name = name_literal + str(i)
    holder: CDP_Holder = previous_state['agents'][name]
    relative_gap = np.abs(
        price_station.mp - price_station.rp) / price_station.rp

    if holder.opened_position:
        current_cr = holder.cdp_position.calculate_cr(eth_data, price_station)
        if current_cr < LIQUIDATION_RATIO and leverager:
            leverager.liquidation()
        else:
            if relative_gap > holder.relative_gap and price_station.rp > price_station.mp and leverager:
                holder.close_position(eth_data, price_station, pool)
            elif current_cr > holder.boost_cr:
                holder.boost(eth_data, price_station, pool)
            elif current_cr < holder.repay_cr:
                holder.repay(eth_data, price_station, pool)
    else:
        
        if relative_gap > holder.relative_gap and price_station.rp < price_station.mp:
            holder.open_position(eth_data, price_station, pool)
    
    agents[name] = holder

def get_holder_values(CONST):
    p = np.random.random()
    if p < CONST.RISKY:
        return CONST.R_DIFF, CONST.R_CR
    p -= CONST.RISKY
    if p < CONST.MODERATE:
        return CONST.M_DIFF, CONST.M_CR
    return CONST.S_DIFF, CONST.S_CR

# percentage of eth amount that is used for collateral of a leverager
def get_holder_perc_amount(CONST) -> float:
    p = np.random.random()
    if p < CONST.R_COLLATERAL:
        return 0.95
    p -= CONST.R_COLLATERAL
    if p < CONST.M_COLLATERAL:
        return 0.7
    return 0.45

# difference between redemption price and market price when leverager opens/closes a position
def get_holder_relative_gap(CONST):
    p = np.random.random()
    if p < CONST.RELATIVE_GAP_RISKY:
        return 0.02
    p -= CONST.RELATIVE_GAP_RISKY
    if p < CONST.RELATIVE_GAP_MODERATE:
        return 0.05
    return 0.1