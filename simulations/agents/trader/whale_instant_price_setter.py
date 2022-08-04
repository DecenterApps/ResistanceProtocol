from agents.trader.a_trader import *
from utils.constants import *
from classes.pool import *
from classes.price_station import *
from classes.eth_data import *
import numpy as np

class Whale_Instant_Price_Setter(Trader):
    def __init__(self, name, eth, noi, relative_gap):
        Trader.__init__(self, name, eth, noi)
        self.relative_gap = relative_gap

    def terminate_condition(self, price_station):
        relative_gap = np.abs(price_station.mp - price_station.rp) / price_station.rp
        return relative_gap < self.relative_gap

    def buy_noi_condition(self, price_station):
        return price_station.mp < price_station.rp and self.eth > 0.001

    def buy_eth_condition(self, price_station):
        return price_station.mp > price_station.rp and self.noi > 0.001

def update_whale_instant_price_setter(agents, price_station: PriceStation, pool: Pool, eth_data: ETHData):
    update_trader(agents, price_station, pool ,eth_data, 'whale_instant_price_setter', WHALE_INSTANT_PRICE_SETTER)

def create_new_whale_instant_price_setter(name, eth_amount, noi_amount):
    return Whale_Instant_Price_Setter(name, eth_amount, noi_amount, get_whale_instant_price_setter_relative_gap())

def create_whale_instant_price_setters(agents):
    for i in range(WHALE_INSTANT_PRICE_SETTER.NUM):
        name = 'whale_instant_price_setter' + str(i)
        agents[name] = create_new_whale_instant_price_setter(name, WHALE_INSTANT_PRICE_SETTER.ETH_AMOUNT, WHALE_INSTANT_PRICE_SETTER.NOI_AMOUNT)

# relative difference between redemption price and market price when whale is activated
def get_whale_instant_price_setter_relative_gap():
    p = np.random.random()
    if p < WHALE_INSTANT_PRICE_SETTER.BOUND_HIGH:
        return 0.015
    p -= WHALE_INSTANT_PRICE_SETTER.BOUND_HIGH
    if p < WHALE_INSTANT_PRICE_SETTER.BOUND_MID:
        return 0.07
    return 0.12