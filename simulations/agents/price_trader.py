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

def update_price_trader(agents, price_station: PriceStation, pool: Pool, eth_data: ETHData):
    if PRICE_TRADER.NUM == 0:
        return
    i = random.randint(0, PRICE_TRADER.NUM - 1)
    # print('update_price_trader' + i)

    name = 'price_trader' + str(i)
    trader: Price_Trader = agents[name]
    relative_gap = np.abs(
        price_station.mp - price_station.rp) / price_station.rp
    if relative_gap < trader.relative_gap:
        return
    
    eth_add_trader = 0
    noi_add_trader = 0
    if price_station.mp < price_station.rp and trader.eth > 0.00001:
        # buy noi, sell eth
        eth_add, noi_add = pool.put_eth_get_noi(+1*trader.eth * trader.perc_amount, price_station, eth_data)
        eth_add_trader = -eth_add
        noi_add_trader = noi_add
    
    elif price_station.mp > price_station.rp and trader.noi > 0.00001:
        # buy eth, sell noi
        eth_add, noi_add = pool.put_noi_get_eth(trader.noi * trader.perc_amount, price_station, eth_data)
        eth_add_trader = eth_add
        noi_add_trader = -noi_add

    trader.eth += eth_add_trader
    trader.noi += noi_add_trader

def create_new_price_trader(name, eth_amount, noi_amount):
    return Price_Trader(name, eth_amount, noi_amount, get_price_trader_perc_amount(), get_price_trader_relative_gap())

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