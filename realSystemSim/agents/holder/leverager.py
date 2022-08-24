from agents.holder.a_cdp_holder import *
from realSystemSim.constants import LEVERAGER
from utils.exchange import *
from accounts import accounts

class Leverager(CDP_Holder):

    def calculate_cr(self, ext_data: ExtData, price_station: PriceStation):
        return self.cdp_position.calculate_cr(ext_data, price_station)

    def boost(self, ext_data: ExtData, price_station: PriceStation, pool: Pool):
        self.cdp_position.dfs_boost_position(ext_data, price_station, pool)

    def repay(self, ext_data: ExtData, price_station: PriceStation, pool: Pool):
        self.cdp_position.dfs_repay_position(ext_data, price_station, pool)

    def close_position(self):
        self.opened_position = False
        self.cdp_position.close_position(self.name, self.address, self.private_key)

    def open_position(self, ext_data:ExtData, price_station: PriceStation, pool: Pool):
        CDP_Holder.open_position(self, ext_data, price_station, pool)

    def liquidation(self):
        self.opened_position = False
        self.debt_noi = 0

def update_leverager(agents, price_station: PriceStation, pool: Pool, ext_data: ExtData):
    update_holder(agents, price_station, pool, ext_data, 'leverager', LEVERAGER)

def create_leveragers(agents):
    for i in range(LEVERAGER.ACCOUNTS_START, LEVERAGER.ACCOUNTS_END):
        name = 'leverager' + str(i - LEVERAGER.ACCOUNTS_START)
        account = accounts[i]
        agents[name] = Leverager(name, account['account'], account['private_key'], LEVERAGER)