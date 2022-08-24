from agents.a_trader import *
import numpy as np
sys.path.append("..")
from accounts import accounts
from realSystemSim.constants import NOI_TRUSTER


class Noi_Truster(Trader):
    def __init__(self, name, eth, noi, perc_amount, relative_gap):
        Trader.__init__(self, name, eth, noi)
        self.perc_amount = perc_amount
        self.relative_gap = relative_gap

    def terminate_condition(self, price_station):
        relative_gap = np.abs(price_station.getMp() -
                              price_station.getRp()) / price_station.getRp()
        return relative_gap < self.relative_gap or price_station.getMp() > price_station.getRp()

    def buy_noi_condition(self, price_station):
        return price_station.getMp() < price_station.getRp() and self.getEth() > 0.00001

    def buy_eth_condition(self, price_station):
        return False


def update_noi_truster(agents, price_station: PriceStation, pool: Pool, ext_data):
    update_trader(agents, price_station, pool, 'noi_truster', NOI_TRUSTER)


def create_new_noi_truster(name, eth_amount, noi_amount):
    return Noi_Truster(name, eth_amount, noi_amount, get_noi_truster_perc_amount(), get_noi_truster_relative_gap())


def create_noi_trusters(agents):
    for i in range(NOI_TRUSTER.ACCOUNTS_START, NOI_TRUSTER.ACCOUNTS_END):
        name = 'noi_truster' + str(i - NOI_TRUSTER.ACCOUNTS_START)
        account = accounts[i]
        agents[name] = create_new_noi_truster(
            name, account['account'], account['private_key'])

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
