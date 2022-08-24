from agents.a_trader import *
import numpy as np
import sys
sys.path.append("..")
from accounts import accounts

from realSystemSim.constants import RANDOM_TRADER, RANDOM_TRADER_NUM

class Random_Trader(Trader):

    def terminate_condition(self, price_station):
        return False

    def buy_noi_condition(self, price_station):
        if self.getEth() < 0.00001:
            return False
        p = np.random.random()
        if p > 0.05:
            return False
        self.perc_amount = np.random.random()
        return True

    def buy_eth_condition(self, price_station):
        if self.getNoi() < 0.00001:
            return False
        p = np.random.random()
        if p > 0.05:
            return False
        self.perc_amount = np.random.random()
        return True

def update_random_trader(agents, price_station: PriceStation, pool: Pool, ext_data):
    update_trader(agents, price_station, pool, 'random_trader', RANDOM_TRADER)

def create_new_random_trader(name, account, private_key):
    return Random_Trader(name, account, private_key)

def create_random_traders(agents):
    for i in range(RANDOM_TRADER.ACCOUNTS_START, RANDOM_TRADER.ACCOUNTS_END):
        name = 'random_trader' + str(i - RANDOM_TRADER.ACCOUNTS_START)
        account = accounts[i]
        agents[name] = create_new_random_trader(name, account['account'], account['private_key'])