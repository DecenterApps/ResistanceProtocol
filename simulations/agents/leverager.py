from classes.cdp_position import CDP_Position
from classes.price_station import PriceStation
from classes.eth_data import ETHData
from utils.constants import *
from utils.exchange import *
import numpy as np


class Leverager:
    def __init__(self, name, eth_amount, perc_amount, initial_cr, repay_cr, boost_cr, relative_gap):
        # print('leverager created', 'name', name, 'eth_amount', eth_amount, 'perc_amount', perc_amount,
        #       'initial_cr', initial_cr, 'repay_cr', repay_cr, 'boost_cr', boost_cr, 'relative_gap', relative_gap)
        self.name = name
        self.relative_gap = relative_gap
        self.eth_amount = eth_amount
        self.perc_amount = perc_amount
        self.initial_cr = initial_cr
        self.repay_cr = repay_cr
        self.boost_cr = boost_cr
        self.opened_position = False

    def calculate_cr(self, substep, previous_state, eth_data: ETHData, price_station: PriceStation):
        return self.cdp_position.calculate_cr(substep, previous_state, eth_data, price_station)

    def boost(self, substep, previous_state, eth_data: ETHData, price_station: PriceStation, pool: Pool):
        self.cdp_position.boost_position(
            substep, previous_state, eth_data, price_station, pool)

    def repay(self, substep, previous_state, eth_data: ETHData, price_station: PriceStation, pool: Pool):
        self.cdp_position.repay_position(
            substep, previous_state, eth_data, price_station, pool)

    def close_position(self, substep, previous_state, eth_data: ETHData, price_station: PriceStation, pool: Pool):
        self.opened_position = False
        self.eth_amount += self.cdp_position.close_position(
            substep, self.debt_noi, previous_state, eth_data, price_station, pool)
        self.debt_noi = 0

    def open_position(self, substep, previous_state, eth_data:ETHData, price_station: PriceStation, pool: Pool):
        self.opened_position = True
        collateral = self.eth_amount * self.perc_amount
        self.eth_amount -= collateral
        self.debt_noi = price_station.get_amount_of_noi_for_rp_value(
            collateral) / self.initial_cr
        self.cdp_position = CDP_Position(
            collateral, self.debt_noi, self.initial_cr, self.repay_cr, self.boost_cr)
            # 
        self.eth_amount += pool.put_noi_get_eth(substep, previous_state, self.debt_noi, price_station, eth_data)
        self.debt_noi = 0
        # TODO drop noi on market, done

    def liquidation(self):
        self.opened_position = False
        self.debt_noi = 0


def create_new_leverager(name, eth_amount, price_station: PriceStation):
    diff, cr = get_leverager_values()
    perc_amount = get_leverager_perc_amount()
    relative_gap = get_leverager_relative_gap()
    return Leverager(name, eth_amount, perc_amount, cr, max(LIQUIDATION_RATIO, cr - diff), cr + diff, relative_gap)


def get_leverager_values():
    p = np.random.random()
    if p < LEVERAGER.RISKY:
        return LEVERAGER.R_DIFF, LEVERAGER.R_CR
    p -= LEVERAGER.RISKY
    if p < LEVERAGER.MODERATE:
        return LEVERAGER.M_DIFF, LEVERAGER.M_CR
    return LEVERAGER.S_DIFF, LEVERAGER.S_CR

# relative difference between redemption price and market price when trader is activated


def get_leverager_perc_amount() -> float:
    p = np.random.random()
    if p < LEVERAGER.R_COLLATERAL:
        return 0.95
    p -= LEVERAGER.R_COLLATERAL
    if p < LEVERAGER.M_COLLATERAL:
        return 0.7
    return 0.45

# difference between redemption price and market price when leverager opens/closes a position


def get_leverager_relative_gap():
    p = np.random.random()
    if p < LEVERAGER.RELATIVE_GAP_RISKY:
        return 0.02
    p -= LEVERAGER.RELATIVE_GAP_RISKY
    if p < LEVERAGER.RELATIVE_GAP_MODERATE:
        return 0.05
    return 0.1
