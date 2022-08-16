from utils.constants import *
from classes.price_station import *
from abc import ABC, abstractmethod

import random

class Trader(ABC):
    def __init__(self, name, eth, noi):
        self.name = name
        self.eth = eth
        self.noi = noi
        self.perc_amount = 1

    @abstractmethod
    def terminate_condition(self, price_station: PriceStation):
        pass

    @abstractmethod
    def buy_noi_condition(self, price_station: PriceStation):
        pass

    @abstractmethod
    def buy_eth_condition(self, price_station: PriceStation):
        pass

def update_trader(agents, price_station: PriceStation, pool: Pool, ext_data: ExtData, literal_name, CONST):
    if CONST.NUM == 0:
        return
    i = random.randint(0, CONST.NUM - 1)

    name = literal_name + str(i)
    trader: Trader = agents[name]
    
    if trader.terminate_condition(price_station):
        return
    
    eth_add_trader = 0
    noi_add_trader = 0
    if trader.buy_noi_condition(price_station):
        # buy noi, sell eth
        eth_add, noi_add = pool.put_eth_get_noi(+1*trader.eth*trader.perc_amount, price_station, ext_data)
        eth_add_trader = -eth_add
        noi_add_trader = noi_add
        # print('buy noi', noi_add)
    
    elif trader.buy_eth_condition(price_station):
        # buy eth, sell noi
        eth_add, noi_add = pool.put_noi_get_eth(trader.noi*trader.perc_amount, price_station, ext_data)
        eth_add_trader = eth_add
        noi_add_trader = -noi_add
        # print('sell noi', -noi_add)
    

    trader.eth += eth_add_trader
    trader.noi += noi_add_trader