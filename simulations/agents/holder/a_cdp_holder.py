from abc import ABC, abstractmethod
from classes.cdp_position import *
import random
 
class CDP_Holder(ABC):

    def __init__(self, name, eth, CONST):
        self.name = name
        self.relative_gap = get_holder_relative_gap(CONST)
        self.perc_amount = get_holder_perc_amount(CONST)
        self.prediction_time = get_holder_prediction(CONST)
        self.prediction_threshold = get_holder_prediction_threshold(CONST)
        self.eth = eth
        self.noi = 0
        self.initial_cr, self.repay_cr, self.boost_cr = get_collateral_ratios(CONST)
        self.opened_position = False
        self.cdp_position: CDP_Position = None
    
    def calculate_cr(self, ext_data: ExtData, price_station: PriceStation):
        return self.cdp_position.calculate_cr(ext_data, price_station)
    
    @abstractmethod
    def boost(self, ext_data: ExtData, price_station: PriceStation, pool: Pool):
        pass

    @abstractmethod
    def repay(self, ext_data: ExtData, price_station: PriceStation, pool: Pool):
        pass

    def close_position(self, ext_data: ExtData, price_station: PriceStation, pool: Pool):
        self.opened_position = False
        self.eth += self.cdp_position.close_position(self.debt_noi, ext_data, price_station, pool)
        self.debt_noi = 0

    def open_position(self, ext_data:ExtData, price_station: PriceStation, pool: Pool):
        self.opened_position = True
        collateral = self.eth * self.perc_amount
        self.eth -= collateral
        self.debt_noi = price_station.get_amount_of_noi_for_rp_value(ext_data.get_eth_value_for_amount(collateral)) / self.initial_cr
        self.cdp_position = CDP_Position(collateral, self.debt_noi, self.initial_cr, self.repay_cr, self.boost_cr)

        added_eth, added_noi = pool.put_noi_get_eth(self.debt_noi, price_station, ext_data)
        return added_eth, added_noi

    def liquidation(self):
        self.opened_position = False
        self.debt_noi = 0

def update_holder(agents, price_station: PriceStation, pool: Pool, ext_data: ExtData, name_literal, CONST):
    leverager: bool = False
    if name_literal == 'leverager':
        leverager = True
    if CONST.NUM == 0:
        return
    i = random.randint(0, CONST.NUM - 1)
    name = name_literal + str(i)
    holder: CDP_Holder = agents[name]
    relative_gap = np.abs(
        price_station.mp - price_station.rp) / price_station.rp
    
    predicted_eth_price = ext_data.get_predicted_eth_price(holder.prediction_time)
    curr_eth_price = ext_data.get_eth_value()
    relative_eth_difference = 0 if predicted_eth_price == 0 else abs((predicted_eth_price - curr_eth_price) / curr_eth_price)
    relative_eth_difference *= CONST.PREDICTION_STRENGTH

    if holder.opened_position:
        current_cr = holder.cdp_position.calculate_cr(ext_data, price_station)
        if current_cr < LIQUIDATION_RATIO and leverager:
            holder.liquidation()
        else:
            if (relative_gap > holder.relative_gap and price_station.rp > price_station.mp and leverager) or \
               (relative_eth_difference > holder.prediction_threshold and predicted_eth_price < curr_eth_price):
                holder.close_position(ext_data, price_station, pool)
            elif current_cr > holder.boost_cr:
                holder.boost(ext_data, price_station, pool)
            elif current_cr < holder.repay_cr:
                holder.repay(ext_data, price_station, pool)
    else:
        
        if (relative_gap > holder.relative_gap and price_station.rp < price_station.mp and holder.eth > 0) or \
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