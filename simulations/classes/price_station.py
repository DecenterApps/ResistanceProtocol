from classes.eth_data import ETHData
from classes.pool import Pool
from pi_controller import updateRedemptionPrice, computeRate

class PriceStation:
    def __init__(self, market_price, redemption_price, accumulated_leak):
        # market price
        self.mp = market_price
        # redemption price
        self.rp = redemption_price
        # accumulated_leak
        self.accumulated_leak = accumulated_leak
    
    def update_mp(self, substep, previous_state, pool: Pool, eth_data: ETHData) -> float:
        eth_value = eth_data.get_eth_value(substep, previous_state)
        self.mp =  eth_value * pool.eth / pool.noi
    
    def get_fresh_mp(self, substep, previous_state, pool: Pool, eth_data: ETHData):
        self.update_mp(substep, previous_state, pool, eth_data)
        return self.mp

    def calculate_redemption_price(self):
        rr = self.calculate_redemption_rate()
        self.rp = updateRedemptionPrice(self.rp, rr)

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