from classes.eth_data import ETHData
from classes.pool import Pool
from pi_controller import updateRedemptionPrice, computeRate
from classes.graph import Graph

class PriceStation:
    def __init__(self, market_price, redemption_price, redemption_rate, accumulated_leak):
        # market price
        self.mp = market_price
        # redemption price
        self.rp = redemption_price
        # redemption rate
        self.rr = redemption_rate
        # accumulated_leak
        self.accumulated_leak = accumulated_leak
    
    def update_mp(self, pool: Pool, eth_data: ETHData) -> float:
        eth_value = eth_data.get_eth_value()
        self.mp =  eth_value * pool.eth / pool.noi
        if pool.eth <= 0 or pool.noi <= 0:
            print("ASSERT 02, Pool not working", pool.eth, pool.noi)
    
    def get_fresh_mp(self, pool: Pool, eth_data: ETHData):
        self.update_mp(pool, eth_data)
        return self.mp

    def calculate_redemption_price(self, graph: Graph):
        rr = self.calculate_redemption_rate()
        graph.redemption_rate.append(rr)
        graph.redemption_rate_up.append(1+1e-8*0.5)
        graph.redemption_rate_down.append(1+1e-8*-0.5)

        # print('redemption rate', rr)
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