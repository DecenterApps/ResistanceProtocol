import numpy as np
import sys
sys.path.append("..")
from constants import RATE_TRADER, REDEMPTION_RATES
from classes.pool import Pool
from classes.price_station import PriceStation
from agents.a_trader import *
from accounts import accounts


class Rate_Trader(Trader):
    def __init__(self, name, address, private_key, perc_amount, rr_low, rr_high):
        Trader.__init__(self, name, address, private_key)
        self.perc_amount = perc_amount
        self.rr_low = rr_low
        self.rr_high = rr_high

    def terminate_condition(self, price_station):
        return price_station.getRr() > self.rr_low and price_station.getRr() < self.rr_high

    def buy_noi_condition(self, price_station):
        return price_station.getRr() > self.rr_high and price_station.getMp() < price_station.getRp() and self.getEth() > 0.0001

    def buy_eth_condition(self, price_station):
        return price_station.getRr() < self.rr_low and price_station.getMp() > price_station.getRp() and self.getNoi() > 0.0001


def update_rate_trader(agents, price_station: PriceStation, pool: Pool, ext_data):
    update_trader(agents, price_station, pool, 'rate_trader', RATE_TRADER)


def create_new_rate_trader(name, address, private_key):
    rr_low, rr_high = get_rate_trader_apy_bound()
    return Rate_Trader(name, address, private_key, get_rate_trader_perc_amount(), rr_low, rr_high)


def create_rate_traders(agents):
    for i in range(RATE_TRADER.ACCOUNTS_START, RATE_TRADER.ACCOUNTS_END):
        name = 'rate_trader' + str(i-RATE_TRADER.ACCOUNTS_START)
        account = accounts[i]
        agents[name] = create_new_rate_trader(
            name, account['account'], account['private_key'])

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
    if p < RATE_TRADER.RR_HIGH:
        return REDEMPTION_RATES.LOW_RR[0], REDEMPTION_RATES.LOW_RR[1]

    p -= RATE_TRADER.RR_HIGH
    if p < RATE_TRADER.RR_MID:
        return REDEMPTION_RATES.MID_RR[0], REDEMPTION_RATES.MID_RR[1]

    return REDEMPTION_RATES.HIGH_RR[0], REDEMPTION_RATES.HIGH_RR[1]
