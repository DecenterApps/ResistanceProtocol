from classes.ext_data import ExtData
from classes.pool import Pool
from controllers.pi_controller import updateRedemptionPrice, computeRate

class PriceStation:
    def __init__(self, market_price, redemption_price, redemption_rate, accumulated_leak, graph):
        # market price
        self.mp = market_price
        # redemption price
        self.rp = redemption_price
        # redemption rate
        self.rr = redemption_rate
        # accumulated_leak
        self.accumulated_leak = accumulated_leak
        self.graph = graph
    
    def update_mp(self, pool: Pool, ext_data: ExtData) -> float:
        eth_value = ext_data.get_eth_value()
        self.mp =  eth_value * pool.eth / pool.noi
        self.graph.add_to_graph(self, pool)

        if pool.eth <= 0 or pool.noi <= 0:
            assert False, "ASSERT 05, pool values negative"
    
    def get_fresh_mp(self, pool: Pool, ext_data: ExtData):
        self.update_mp(pool, ext_data)
        return self.mp

    def calculate_redemption_price(self):
        rr = self.calculate_redemption_rate()

        self.rp = updateRedemptionPrice(self.rp, rr)
        self.rr = rr

    def calculate_redemption_rate(self):
        rr = computeRate(self.mp, self.rp, self.accumulated_leak)
        return rr
    
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