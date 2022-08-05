from agents.holder.a_cdp_holder import *
from utils.exchange import *

class Leverager(CDP_Holder):

    def calculate_cr(self, eth_data: ETHData, price_station: PriceStation):
        return self.cdp_position.calculate_cr(eth_data, price_station)

    def boost(self, eth_data: ETHData, price_station: PriceStation, pool: Pool):
        self.cdp_position.dfs_boost_position(eth_data, price_station, pool)

    def repay(self, eth_data: ETHData, price_station: PriceStation, pool: Pool):
        self.cdp_position.dfs_repay_position(eth_data, price_station, pool)

    def close_position(self, eth_data: ETHData, price_station: PriceStation, pool: Pool):
        self.opened_position = False
        self.eth += self.cdp_position.close_position(self.debt_noi, eth_data, price_station, pool)
        self.debt_noi = 0

    def open_position(self, eth_data:ETHData, price_station: PriceStation, pool: Pool):
        added_eth, added_noi = CDP_Holder.open_position(self, eth_data, price_station, pool)
        self.eth += added_eth
        self.debt_noi = self.debt_noi - added_noi

    def liquidation(self):
        self.opened_position = False
        self.debt_noi = 0

def update_leverager(agents, price_station: PriceStation, pool: Pool, eth_data: ETHData):
    update_holder(agents, price_station, pool, eth_data, 'leverager', LEVERAGER)

def create_new_leverager(name, eth_amount):
    diff, cr = get_holder_values(LEVERAGER)
    perc_amount = get_holder_perc_amount(LEVERAGER)
    relative_gap = get_holder_relative_gap(LEVERAGER)
    return Leverager(name, eth_amount, perc_amount, cr, max(LIQUIDATION_RATIO, cr - diff), cr + diff, relative_gap)

def create_leveragers(agents):
    for i in range(LEVERAGER.NUM):
        name = 'leverager' + str(i)
        agents[name] = create_new_leverager(name, LEVERAGER.ETH_AMOUNT)