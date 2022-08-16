import numpy as np
from agents.a_trader import *
import sys
sys.path.append("..")
from constants import PRICE_TRADER
from accounts import accounts


class Price_Trader(Trader):
    def __init__(self, name, address, private_key, perc_amount, relative_gap):
        Trader.__init__(self, name, address, private_key)
        self.perc_amount = perc_amount
        self.relative_gap = relative_gap

    def terminate_condition(self, price_station):
        relative_gap = np.abs(
            price_station.getMp() - price_station.getRp()) / price_station.getRp()
        return relative_gap < self.relative_gap

    def buy_noi_condition(self, price_station):
        return price_station.getMp() < price_station.getRp() and self.getEth() > 0.00001

    def buy_eth_condition(self, price_station):
        return price_station.getMp() > price_station.getRp() and self.getNoi() > 0.00001


def update_price_trader(agents, price_station: PriceStation, pool: Pool):
    update_trader(agents, price_station, pool, 'price_trader', PRICE_TRADER)


def create_new_price_trader(name, address, private_key):
    return Price_Trader(name, address, private_key, get_price_trader_perc_amount(), get_price_trader_relative_gap())


def create_price_traders(agents):
    for i in range(PRICE_TRADER.ACCOUNTS_START, PRICE_TRADER.ACCOUNTS_END):
        name = 'price_trader' + str(i)
        account = accounts[i]
        agents[name] = create_new_price_trader(
            name, account['account'], account['private_key'])

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
        return 0.02
    p -= PRICE_TRADER.BOUND_HIGH
    if p < PRICE_TRADER.BOUND_MID:
        return 0.04
    return 0.08
