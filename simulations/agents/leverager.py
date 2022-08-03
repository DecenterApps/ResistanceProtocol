from classes.price_station import PriceStation
from classes.eth_data import ETHData
from agents.a_cdp_holder import *
from utils.constants import *
from utils.exchange import *
import numpy as np
import random

class Leverager(CDP_Holder):

    def calculate_cr(self, eth_data: ETHData, price_station: PriceStation):
        return self.cdp_position.calculate_cr(eth_data, price_station)

    def boost(self, eth_data: ETHData, price_station: PriceStation, pool: Pool):
        self.cdp_position.dfs_boost_position(eth_data, price_station, pool)

    def repay(self, eth_data: ETHData, price_station: PriceStation, pool: Pool):
        self.cdp_position.dfs_repay_position(eth_data, price_station, pool)

    def close_position(self, eth_data: ETHData, price_station: PriceStation, pool: Pool):
        self.opened_position = False
        self.eth_amount += self.cdp_position.close_position(self.debt_noi, eth_data, price_station, pool)
        self.debt_noi = 0

    def open_position(self, eth_data:ETHData, price_station: PriceStation, pool: Pool):
        added_eth, added_noi = CDP_Holder.open_position(self, eth_data, price_station, pool)
        self.eth_amount += added_eth
        self.debt_noi = self.debt_noi - added_noi

    def liquidation(self):
        self.opened_position = False
        self.debt_noi = 0

def update_leverager(previous_state, agents, price_station: PriceStation, pool: Pool, eth_data: ETHData):
    if LEVERAGER.NUM == 0:
        return
    i = random.randint(0, LEVERAGER.NUM - 1)
    name = 'leverager' + str(i)
    leverager: Leverager = previous_state['agents'][name]
    relative_gap = np.abs(
        price_station.mp - price_station.rp) / price_station.rp

    if leverager.opened_position:
        current_cr = leverager.cdp_position.calculate_cr(eth_data, price_station)
        if current_cr < LIQUIDATION_RATIO:
            leverager.liquidation()
        else:
            if relative_gap > leverager.relative_gap and price_station.rp > price_station.mp:
                leverager.close_position(eth_data, price_station, pool)
            elif current_cr > leverager.boost_cr:
                leverager.boost(eth_data, price_station, pool)
            elif current_cr < leverager.repay_cr:
                leverager.repay(eth_data, price_station, pool)
    else:
        
        if relative_gap > leverager.relative_gap and price_station.rp < price_station.mp:
            leverager.open_position(eth_data, price_station, pool)
    
    agents[name] = leverager

def create_new_leverager(name, eth_amount):
    diff, cr = get_holder_values(LEVERAGER)
    perc_amount = get_holder_perc_amount(LEVERAGER)
    relative_gap = get_holder_relative_gap(LEVERAGER)
    return Leverager(name, eth_amount, perc_amount, cr, max(LIQUIDATION_RATIO, cr - diff), cr + diff, relative_gap)

def create_leveragers(agents):
    for i in range(LEVERAGER.NUM):
        name = 'leverager' + str(i)
        agents[name] = create_new_leverager(name, LEVERAGER.ETH_AMOUNT)

def update_leverager(previous_state, agents, price_station: PriceStation, pool: Pool, eth_data: ETHData):
    update_holder(previous_state, agents, price_station, pool, eth_data, 'leverager', LEVERAGER, True)