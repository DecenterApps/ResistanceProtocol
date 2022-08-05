from agents.trader.a_trader import *
import numpy as np

class Rate_Trader(Trader):
    def __init__(self, name, eth, noi, perc_amount, rr_low, rr_high):
        Trader.__init__(self, name, eth, noi)
        self.perc_amount = perc_amount
        self.rr_low = rr_low
        self.rr_high = rr_high

    def terminate_condition(self, price_station):
        return price_station.rr > self.rr_low and price_station.rr < self.rr_high

    def buy_noi_condition(self, price_station):
        return price_station.rr > self.rr_high and price_station.mp < price_station.rp and self.eth > 0.0001

    def buy_eth_condition(self, price_station):
        return price_station.rr < self.rr_low and price_station.mp > price_station.rp and self.noi > 0.0001

def update_rate_trader(agents, price_station: PriceStation, pool: Pool, eth_data: ETHData):
    update_trader(agents, price_station, pool, eth_data, 'rate_trader', RATE_TRADER)

def create_new_rate_trader(name, eth_amount, noi_amount):
    rr_low, rr_high = get_rate_trader_apy_bound()
    return Rate_Trader(name, eth_amount, noi_amount, get_rate_trader_perc_amount(), rr_low, rr_high)

def create_rate_traders(agents):
    for i in range(RATE_TRADER.NUM):
        name = 'rate_trader' + str(i)
        agents[name] = create_new_rate_trader(name, RATE_TRADER.ETH_AMOUNT, RATE_TRADER.NOI_AMOUNT)

# percentage of traders resource when trading
def get_rate_trader_perc_amount() -> float:
    p = np.random.random()
    if p < RATE_TRADER.RISKY:
        return 0.9
    p -= RATE_TRADER.RISKY
    if p < RATE_TRADER.MODERATE:
        return 0.7
    return 0.3

# maximum/minimum redemption rate when trader is activated
def get_rate_trader_apy_bound():
    p = np.random.random()
    if p < RATE_TRADER.RR_HIGH:
        return REDEMPTION_RATES.LOW_RR[0], REDEMPTION_RATES.LOW_RR[1]
    
    p -= RATE_TRADER.RR_HIGH
    if p < RATE_TRADER.RR_MID:
        return REDEMPTION_RATES.MID_RR[0], REDEMPTION_RATES.MID_RR[1]
    
    return REDEMPTION_RATES.HIGH_RR[0], REDEMPTION_RATES.HIGH_RR[1]