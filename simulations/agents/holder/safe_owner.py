from agents.holder.a_cdp_holder import *
from utils.exchange import *

class Safe_Owner(CDP_Holder):

    def calculate_cr(self, ext_data: ExtData, price_station: PriceStation):
        return self.cdp_position.calculate_cr(ext_data, price_station)

    def boost(self, ext_data: ExtData, price_station: PriceStation, pool: Pool):
        self.cdp_position.boost_position(ext_data, price_station, pool)

    def repay(self, ext_data: ExtData, price_station: PriceStation, pool: Pool):
        self.cdp_position.repay_position(ext_data, price_station, pool)
    
    # def liquidation(self):
    #     self.opened_position = False
    #     self.debt_noi = 0

def update_safe_owner(agents, price_station: PriceStation, pool: Pool, ext_data: ExtData):
    update_holder(agents, price_station, pool, ext_data, 'safe_owner', SAFE_OWNER)

def create_new_safe_owner(name, eth_amount):
    return Safe_Owner(name, eth_amount, SAFE_OWNER)

def create_safe_owners(agents):
    for i in range(SAFE_OWNER.NUM):
        name = 'safe_owner' + str(i)
        agents[name] = create_new_safe_owner(name, SAFE_OWNER.ETH_AMOUNT)