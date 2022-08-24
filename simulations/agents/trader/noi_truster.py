from agents.trader.a_trader import *
import numpy as np

class Noi_Truster(Trader):
    def __init__(self, name, eth, noi, perc_amount, relative_gap):
        Trader.__init__(self, name, eth, noi)
        self.perc_amount = perc_amount
        self.relative_gap = relative_gap

    def terminate_condition(self, price_station):
        relative_gap = np.abs(price_station.mp - price_station.rp) / price_station.rp
        return relative_gap < self.relative_gap or price_station.mp > price_station.rp

    def buy_noi_condition(self, price_station):
        return price_station.mp < price_station.rp and self.eth > 0.00001

    def buy_eth_condition(self, price_station):
        return False

def update_noi_truster(agents, price_station: PriceStation, pool: Pool, ext_data: ExtData):
    update_trader(agents, price_station, pool, ext_data, 'noi_truster', NOI_TRUSTER)

def create_new_noi_truster(name, eth_amount, noi_amount):
    return Noi_Truster(name, eth_amount, noi_amount, get_noi_truster_perc_amount(), get_noi_truster_relative_gap())

def create_noi_trusters(agents):
    for i in range(NOI_TRUSTER.NUM):
        name = 'noi_truster' + str(i)
        agents[name] = create_new_noi_truster(name, NOI_TRUSTER.ETH_AMOUNT, NOI_TRUSTER.NOI_AMOUNT)

# percentage of trusters resource when buying noi
def get_noi_truster_perc_amount() -> float:
    p = np.random.random()
    if p < NOI_TRUSTER.RISKY:
        return 0.7
    p -= NOI_TRUSTER.RISKY
    if p < NOI_TRUSTER.MODERATE:
        return 0.4
    return 0.2

# relative difference between redemption price and market price when noi truster is activated
def get_noi_truster_relative_gap():
    p = np.random.random()
    if p < NOI_TRUSTER.BOUND_HIGH:
        return 0
    p -= NOI_TRUSTER.BOUND_HIGH
    if p < NOI_TRUSTER.BOUND_MID:
        return 0.03
    return 0.6