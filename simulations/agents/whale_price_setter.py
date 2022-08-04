from utils.constants import *
from classes.pool import *
from classes.price_station import *
from classes.eth_data import *
import numpy as np

import random

class Whale_Price_Setter:
    def __init__(self, name, eth, noi, relative_gap):
        self.name = name
        self.eth = eth
        self.noi = noi
        self.relative_gap = relative_gap

def update_whale_price_setter(agents, price_station: PriceStation, pool: Pool, eth_data: ETHData):
    if WHALE_PRICE_SETTER.NUM == 0:
        return
    i = random.randint(0, WHALE_PRICE_SETTER.NUM - 1)

    name = 'whale_price_setter' + str(i)
    # print('gasgas')
    trader: Whale_Price_Setter = agents[name]
    relative_gap = np.abs(
        price_station.mp - price_station.rp) / price_station.rp
    # print(relative_gap)
    if relative_gap < trader.relative_gap:
        return
    
    eth_add_trader = 0
    noi_add_trader = 0
    if price_station.mp < price_station.rp and trader.eth > 0.001:
        # buy noi, sell eth
        eth_add, noi_add = pool.put_eth_get_noi(+1*trader.eth, price_station, eth_data)
        eth_add_trader = -eth_add
        noi_add_trader = noi_add
    
    elif price_station.mp > price_station.rp and trader.noi > 0.001:
        # buy eth, sell noi
        eth_add, noi_add = pool.put_noi_get_eth(trader.noi, price_station, eth_data)
        eth_add_trader = eth_add
        noi_add_trader = -noi_add

    trader.eth += eth_add_trader
    trader.noi += noi_add_trader

def create_new_whale_price_setter(name, eth_amount, noi_amount):
    return Whale_Price_Setter(name, eth_amount, noi_amount, get_whale_price_setter_relative_gap())

def create_whale_price_setters(agents):
    for i in range(WHALE_PRICE_SETTER.NUM):
        name = 'whale_price_setter' + str(i)
        agents[name] = create_new_whale_price_setter(name, WHALE_PRICE_SETTER.ETH_AMOUNT, WHALE_PRICE_SETTER.NOI_AMOUNT)

# percentage of traders resource when trading
def get_whale_price_setter_perc_amount() -> float:
    p = np.random.random()
    if p < WHALE_PRICE_SETTER.RISKY:
        return 0.9
    p -= WHALE_PRICE_SETTER.RISKY
    if p < WHALE_PRICE_SETTER.MODERATE:
        return 0.7
    return 0.3

# relative difference between redemption price and market price when whale is activated
def get_whale_price_setter_relative_gap():
    p = np.random.random()
    if p < WHALE_PRICE_SETTER.BOUND_HIGH:
        return 0.015
    p -= WHALE_PRICE_SETTER.BOUND_HIGH
    if p < WHALE_PRICE_SETTER.BOUND_MID:
        return 0.07
    return 0.12