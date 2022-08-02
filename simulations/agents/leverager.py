from classes.cdp_position import CDP_Position
from classes.price_station import PriceStation
from classes.eth_data import ETHData
from utils.constants import *
from utils.exchange import *
import numpy as np
import random


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

    def calculate_cr(self, eth_data: ETHData, price_station: PriceStation):
        return self.cdp_position.calculate_cr(eth_data, price_station)

    def boost(self, eth_data: ETHData, price_station: PriceStation, pool: Pool):
        self.cdp_position.boost_position(eth_data, price_station, pool)

    def repay(self, eth_data: ETHData, price_station: PriceStation, pool: Pool):
        self.cdp_position.repay_position(eth_data, price_station, pool)

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
        self.eth_amount += added_eth
        self.debt_noi = self.debt_noi - added_noi
        # TODO drop noi on market, done

    def liquidation(self):
        self.opened_position = False
        self.debt_noi = 0

def update_leverager(previous_state, agents, price_station: PriceStation, pool: Pool, eth_data: ETHData):
    if LEVERAGER.NUM == 0:
        return
    i = random.randint(0, LEVERAGER.NUM - 1)
    name = 'leverager' + str(i)
    leverager: Leverager = previous_state['agents'][name]
    relative_gap = np.abs(
        price_station.mp - price_station.rp) / price_station.rp

    if leverager.opened_position:
        current_cr = leverager.cdp_position.calculate_cr(eth_data, price_station)
        if current_cr < LIQUIDATION_RATIO:
            leverager.liquidation()
        else:
            if relative_gap > leverager.relative_gap and price_station.rp > price_station.mp:
                leverager.close_position(eth_data, price_station, pool)
            elif current_cr > leverager.boost_cr:
                leverager.boost(eth_data, price_station, pool)
            elif current_cr < leverager.repay_cr:
                leverager.repay(eth_data, price_station, pool)
    else:
        
        if relative_gap > leverager.relative_gap and price_station.rp < price_station.mp:
            leverager.open_position(eth_data, price_station, pool)
    
    agents[name] = leverager

def create_new_leverager(name, eth_amount):
    diff, cr = get_leverager_values()
    perc_amount = get_leverager_perc_amount()
    relative_gap = get_leverager_relative_gap()
    return Leverager(name, eth_amount, perc_amount, cr, max(LIQUIDATION_RATIO, cr - diff), cr + diff, relative_gap)

def create_leveragers(agents):
    for i in range(LEVERAGER.NUM):
        name = 'leverager' + str(i)
        agents[name] = create_new_leverager(name, LEVERAGER.ETH_AMOUNT)

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
