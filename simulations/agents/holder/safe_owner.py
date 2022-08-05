from agents.holder.a_cdp_holder import *
from utils.exchange import *

class Safe_Owner(CDP_Holder):

    def calculate_cr(self, eth_data: ETHData, price_station: PriceStation):
        return self.cdp_position.calculate_cr(eth_data, price_station)

    def boost(self, eth_data: ETHData, price_station: PriceStation, pool: Pool):
        self.cdp_position.boost_position(eth_data, price_station, pool)

    def repay(self, eth_data: ETHData, price_station: PriceStation, pool: Pool):
        self.cdp_position.repay_position(eth_data, price_station, pool)
    
    # def liquidation(self):
    #     self.opened_position = False
    #     self.debt_noi = 0

def update_safe_owner(agents, price_station: PriceStation, pool: Pool, eth_data: ETHData):
    update_holder(agents, price_station, pool, eth_data, 'safe_owner', SAFE_OWNER)

def create_new_safe_owner(name, eth_amount):
    diff, cr = get_holder_values(SAFE_OWNER)
    perc_amount = get_holder_perc_amount(SAFE_OWNER)
    relative_gap = get_holder_relative_gap(SAFE_OWNER)
    return Safe_Owner(name, eth_amount, perc_amount, cr, max(LIQUIDATION_RATIO, cr - diff), cr + diff, relative_gap)

def create_safe_owners(agents):
    for i in range(SAFE_OWNER.NUM):
        name = 'safe_owner' + str(i)
        agents[name] = create_new_safe_owner(name, SAFE_OWNER.ETH_AMOUNT)