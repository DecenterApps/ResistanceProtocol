from agents.trader.a_trader import Trader, update_trader
from utils.constants import *
from classes.pool import *
from classes.price_station import *
from classes.eth_data import *
import numpy as np

import random

class Price_Trader(Trader):
    def __init__(self, name, eth, noi, perc_amount, relative_gap):
        Trader.__init__(self, name, eth, noi)
        self.perc_amount = perc_amount
        self.relative_gap = relative_gap

    def terminate_condition(self, price_station):
        relative_gap = np.abs(price_station.mp - price_station.rp) / price_station.rp
        return relative_gap < self.relative_gap

    def buy_noi_condition(self, price_station):
        return price_station.mp < price_station.rp and self.eth > 0.00001

    def buy_eth_condition(self, price_station):
        return price_station.mp > price_station.rp and self.noi > 0.00001

def update_price_trader(agents, price_station: PriceStation, pool: Pool, eth_data: ETHData):
    update_trader(agents, price_station, pool, eth_data, 'price_trader', PRICE_TRADER)

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