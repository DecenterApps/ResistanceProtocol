from agents.trader.a_trader import *
import numpy as np

class Random_Trader(Trader):

    def terminate_condition(self, price_station):
        return False

    def buy_noi_condition(self, price_station):
        if self.eth < 0.00001:
            return False
        p = np.random.random()
        if p > 0.05:
            return False
        self.perc_amount = np.random.random()
        return True

    def buy_eth_condition(self, price_station):
        if self.noi < 0.00001:
            return False
        p = np.random.random()
        if p > 0.05:
            return False
        self.perc_amount = np.random.random()
        return True

def update_random_trader(agents, price_station: PriceStation, pool: Pool, eth_data: ETHData):
    update_trader(agents, price_station, pool, eth_data, 'random_trader', RANDOM_TRADER)

def create_new_random_trader(name, eth_amount, noi_amount):
    return Random_Trader(name, eth_amount, noi_amount)

def create_random_traders(agents):
    for i in range(RANDOM_TRADER.NUM):
        name = 'random_trader' + str(i)
        agents[name] = create_new_random_trader(name, RANDOM_TRADER.ETH_AMOUNT, RANDOM_TRADER.NOI_AMOUNT)