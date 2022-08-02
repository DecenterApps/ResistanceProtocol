from utils.constants import *
from classes.pool import *
from classes.price_station import *
from classes.eth_data import *
import numpy as np

import random

class Rate_Trader:
    def __init__(self, name, eth, noi, perc_amount, rr_low, rr_high):
        self.name = name
        self.eth = eth
        self.noi = noi
        self.perc_amount = perc_amount
        self.rr_low = rr_low
        self.rr_high = rr_high

def update_rate_trader(previous_state, agents, price_station: PriceStation, pool: Pool, eth_data: ETHData):
    if RATE_TRADER.NUM == 0:
        return
    i = random.randint(0, RATE_TRADER.NUM - 1)
    name = 'rate_trader' + str(i)
    trader: Rate_Trader = previous_state['agents'][name]
    if (price_station.rr > trader.rr_low and price_station.rr < trader.rr_high) or pool.eth < 0.1:
        agents[name] = create_modified_rate_trader(trader, 0, 0)
        return
    
    eth_add_trader = 0
    noi_add_trader = 0
    if price_station.rr < trader.rr_low and price_station.mp > price_station.rp:
        # sell noi, buy eth
        eth_add, noi_add = pool.put_noi_get_eth(trader.noi * trader.perc_amount, price_station, eth_data)
        eth_add_trader = eth_add
        noi_add_trader = -noi_add
    
    elif price_station.rr > trader.rr_high and price_station.mp < price_station.rp:
        # sell eth, buy noi
        eth_add, noi_add = pool.put_eth_get_noi(+1*trader.eth * trader.perc_amount, price_station, eth_data)
        eth_add_trader = -eth_add
        noi_add_trader = noi_add

    # TODO ako nema dovoljno para u poolu da uzme deo ili nesto tako(zbog velikih tradera)
    agents[name] = create_modified_rate_trader(trader, eth_add_trader, noi_add_trader)

def create_new_rate_trader(name, eth_amount, noi_amount):
    rr_low, rr_high = get_rate_trader_apy_bound()
    return Rate_Trader(name, eth_amount, noi_amount, get_rate_trader_perc_amount(), rr_low, rr_high)

def create_modified_rate_trader(trader: Rate_Trader, eth_add, noi_add):
    return Rate_Trader(trader.name, trader.eth + eth_add, trader.noi + noi_add, trader.perc_amount, trader.rr_low, trader.rr_high)

def create_rate_traders(agents):
    for i in range(RATE_TRADER.NUM):
        name = 'rate_trader' + str(i)
        agents[name] = create_new_rate_trader(name, RATE_TRADER.ETH_AMOUNT, RATE_TRADER.NOI_AMOUNT)

# percentage of traders resource when trading
def get_rate_trader_perc_amount() -> float:
    p = np.random.random()
    if p < RATE_TRADER.RISKY:
        return 0.9
    p -= RATE_TRADER.RISKY
    if p < RATE_TRADER.MODERATE:
        return 0.7
    return 0.3

# maximum/minimum redemption rate when trader is activated
def get_rate_trader_apy_bound():
    p = np.random.random()
    c = 0
    if p < RATE_TRADER.RR_HIGH:
        c = 0.2
    else:
        p -= RATE_TRADER.RR_HIGH
        if p < RATE_TRADER.RR_HIGH:
            c = 0.5
        else:
            c = 0.9
    return 1 + 1e-8*(-c), 1 + 1e-8*c