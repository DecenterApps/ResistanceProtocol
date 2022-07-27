from utils.constants import *
import numpy as np

class Trader:
    def __init__(self, name, eth, noi, perc_amount, relative_gap):
        self.name = name
        self.eth = eth
        self.noi = noi
        self.perc_amount = perc_amount
        self.relative_gap = relative_gap

def create_new_trader(name, eth_amount, noi_amount):
    return Trader(name, eth_amount, noi_amount, get_trader_perc_amount(), get_trader_relative_gap())

def create_modified_trader(trader: Trader, eth_add, noi_add):
    return Trader(trader.name, trader.eth - eth_add, trader.noi - noi_add, trader.perc_amount, trader.relative_gap)

# percentage of traders resource when trading
def get_trader_perc_amount() -> float:
    p = np.random.random()
    if p < PERC_RISKY_TRADERS:
        return 0.9
    p -= PERC_RISKY_TRADERS
    if p < PERC_MODERATE_TRADERS:
        return 0.7
    return 0.3

# relative difference between redemption price and market price when trader is activated


def get_trader_relative_gap():
    p = np.random.random()
    if p < PERCENT_BOUND_HIGH:
        return 0.03
    p -= PERCENT_BOUND_HIGH
    if p < PERCENT_BOUND_MID:
        return 0.06
    return 0.1