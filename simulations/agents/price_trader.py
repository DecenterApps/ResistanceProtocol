from utils.constants import *
from classes.pool import *
from classes.price_station import *
from classes.eth_data import *
import numpy as np

import random

class Price_Trader:
    def __init__(self, name, eth, noi, perc_amount, relative_gap):
        self.name = name
        self.eth = eth
        self.noi = noi
        self.perc_amount = perc_amount
        self.relative_gap = relative_gap

def update_price_trader(previous_state, agents, price_station: PriceStation, pool: Pool, eth_data: ETHData):
    if PRICE_TRADER.NUM == 0:
        return
    i = random.randint(0, PRICE_TRADER.NUM - 1)
    # print('update_price_trader' + i)

    name = 'price_trader' + str(i)
    trader: Price_Trader = previous_state['agents'][name]
    relative_gap = np.abs(
        price_station.mp - price_station.rp) / price_station.rp
    if relative_gap < trader.relative_gap or pool.eth < 0.1:
        agents[name] = create_modified_price_trader(trader, 0, 0)
        return
    
    eth_add_trader = 0
    noi_add_trader = 0
    if price_station.mp < price_station.rp:
        # buy noi, sell eth
        eth_add, noi_add = pool.put_eth_get_noi(+1*trader.eth * trader.perc_amount, price_station, eth_data)
        eth_add_trader = -eth_add
        noi_add_trader = noi_add
    
    elif price_station.mp > price_station.rp:
        # buy eth, sell noi
        eth_add, noi_add = pool.put_noi_get_eth(trader.noi * trader.perc_amount, price_station, eth_data)
        eth_add_trader = eth_add
        noi_add_trader = -noi_add

    # TODO ako nema dovoljno para u poolu da uzme deo ili nesto tako(zbog velikih tradera)
    agents[name] = create_modified_price_trader(trader, eth_add_trader, noi_add_trader)

def calculate_traders_amount(previous_state):
    noi_sum = 0
    eth_sum = 0
    for i in range(PRICE_TRADER.NUM):
        name = 'price_trader' + str(i)
        trader: Price_Trader = previous_state['agents'][name]
        eth_sum += trader.eth
        noi_sum += trader.noi
    return eth_sum, noi_sum

def create_new_price_trader(name, eth_amount, noi_amount):
    return Price_Trader(name, eth_amount, noi_amount, get_price_trader_perc_amount(), get_price_trader_relative_gap())

def create_modified_price_trader(trader: Price_Trader, eth_add, noi_add):
    return Price_Trader(trader.name, trader.eth + eth_add, trader.noi + noi_add, trader.perc_amount, trader.relative_gap)

def create_price_traders(agents):
    for i in range(PRICE_TRADER.NUM):
        name = 'price_trader' + str(i)
        agents[name] = create_new_price_trader(name, PRICE_TRADER.ETH_AMOUNT, PRICE_TRADER.NOI_AMOUNT)

# percentage of traders resource when trading
def get_price_trader_perc_amount() -> float:
    p = np.random.random()
    if p < PRICE_TRADER.RISKY:
        return 0.9
    p -= PRICE_TRADER.RISKY
    if p < PRICE_TRADER.MODERATE:
        return 0.7
    return 0.3

# relative difference between redemption price and market price when trader is activated


def get_price_trader_relative_gap():
    p = np.random.random()
    if p < PRICE_TRADER.BOUND_HIGH:
        return 0.03
    p -= PRICE_TRADER.BOUND_HIGH
    if p < PRICE_TRADER.BOUND_MID:
        return 0.06
    return 0.1