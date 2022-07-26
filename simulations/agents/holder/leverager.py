from agents.holder.a_cdp_holder import *
from utils.exchange import *

class Leverager(CDP_Holder):

    def calculate_cr(self, ext_data: ExtData, price_station: PriceStation):
        return self.cdp_position.calculate_cr(ext_data, price_station)

    def boost(self, ext_data: ExtData, price_station: PriceStation, pool: Pool):
        if not self.cdp_position.dfs_boost_position(ext_data, price_station, pool):
            self.liquidation(pool,price_station, ext_data)

    def repay(self, ext_data: ExtData, price_station: PriceStation, pool: Pool):
        if not self.cdp_position.dfs_repay_position(ext_data, price_station, pool):
            self.liquidation(pool,price_station, ext_data)

    def close_position(self, ext_data: ExtData, price_station: PriceStation, pool: Pool):
        self.opened_position = False
        self.eth += self.cdp_position.close_position(self.debt_noi, ext_data, price_station, pool)
        self.debt_noi = 0

    def open_position(self, ext_data:ExtData, price_station: PriceStation, pool: Pool):
        added_eth, added_noi = CDP_Holder.open_position(self, ext_data, price_station, pool)
        self.eth += added_eth
        self.debt_noi = self.debt_noi - added_noi

    def liquidation(self, pool: Pool,price_station, ext_data):
        self.opened_position = False
        eth_add, _ = pool.put_noi_get_eth(max(0,self.cdp_position.debt_noi), price_station, ext_data)
        self.eth += eth_add
        self.debt_noi = 0
        self.noi = 0

def update_leverager(agents, price_station: PriceStation, pool: Pool, ext_data: ExtData):
    update_holder(agents, price_station, pool, ext_data, 'leverager', LEVERAGER)

def create_new_leverager(name, eth_amount):
    return Leverager(name, eth_amount, LEVERAGER)

def create_leveragers(agents):
    for i in range(LEVERAGER.NUM):
        name = 'leverager' + str(i)
        agents[name] = create_new_leverager(name, LEVERAGER.ETH_AMOUNT)