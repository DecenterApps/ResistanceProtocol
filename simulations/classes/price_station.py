from classes.ext_data import ExtData
from classes.pool import Pool
from controllers.fuzzy_module import calculate_rp_and_rr
from utils.constants import TWAP_TIMESTAMPS

class PriceStation:
    def __init__(self, market_price, redemption_price, redemption_rate, graph):
        # market price
        self.mp = market_price
        # redemption price
        self.rp = redemption_price
        # redemption rate
        self.rr = redemption_rate
        # accumulated_leak_stable
        self.accumulated_leak_stable = 0.999
        # accumulated_leak_cpi
        self.accumulated_leak_cpi = 0.999
        self.graph = graph
        self.market_twap = market_price
        self.market_sum = 0
        self.num_steps = 0
    
    def update_mp(self, pool: Pool, ext_data: ExtData) -> float:
        eth_value = ext_data.get_eth_value()
        self.mp =  eth_value * pool.eth / pool.noi
        
        self.graph.add_to_graph(self, pool)

        self.market_twap = self.calculate_market_twap()

        if pool.eth <= 0 or pool.noi <= 0:
            assert False, "ASSERT 05, pool values negative"

    def calculate_market_twap(self):
        if self.num_steps >= TWAP_TIMESTAMPS:
            self.market_sum -= self.graph.m_prices[len(self.graph.m_prices)-TWAP_TIMESTAMPS]

        self.market_sum += self.mp
        self.num_steps = min(self.num_steps+1, TWAP_TIMESTAMPS)
        return self.market_sum / self.num_steps
    
    def get_fresh_mp(self, pool: Pool, ext_data: ExtData):
        self.update_mp(pool, ext_data)
        return self.mp

    def calculate_redemption_price(self, ext_data: ExtData):
        self.rp, self.rr = calculate_rp_and_rr(self.market_twap, self.rp, self.accumulated_leak_stable, self.accumulated_leak_cpi, ext_data, self.graph)
    
    #returns the value of noi in usd with market price
    #input: amount of noi
    #output: dollar value of noi with market price
    def get_mp_value_for_amount(self, noi_amount):
        return noi_amount * self.mp

    #returns the value of noi in usd with redemption price
    #input: amount of noi
    #output: dollar value of noi with redemption price
    def get_rp_value_for_amount(self, noi_amount):
        return noi_amount * self.rp
    
    #input: amount of dollars
    #output: amount of noi that can be purchased with redemption_price
    def get_amount_of_noi_for_rp_value(self, dollar_amount):
        return dollar_amount / self.rp

    #input: amount of dollars
    #output: amount of noi that can be purchased with market_price
    def get_amount_of_noi_for_mp_value(self, dollar_amount):
        return dollar_amount / self.mp