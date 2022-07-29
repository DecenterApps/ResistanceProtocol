from utils.eth_data import ETHData
from utils.pool import Pool
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
    
    def get_mp_value_for_amount(self, noi_amount):
        return noi_amount * self.mp

    def get_rp_value_for_amount(self, noi_amount):
        return noi_amount * self.rp