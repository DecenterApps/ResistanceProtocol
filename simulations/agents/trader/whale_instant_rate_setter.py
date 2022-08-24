from agents.trader.a_trader import *
import numpy as np

class Whale_Instant_Rate_Setter(Trader):
    def __init__(self, name, eth, noi, rr_values: tuple):
        Trader.__init__(self, name, eth, noi)
        self.rr_low = rr_values[0]
        self.rr_high = rr_values[1]
    
    def terminate_condition(self, price_station):
        if (price_station.rr > self.rr_low and price_station.rr < self.rr_high) or \
           (price_station.rr <= self.rr_low and price_station.mp <= price_station.rp) or \
           (price_station.rr >= self.rr_high and price_station.mp >= price_station.rp):
            return True
        return False

    def buy_noi_condition(self, price_station):
        return price_station.rr < self.rr_low and self.eth > 0.001

    def buy_eth_condition(self, price_station):
        return price_station.rr > self.rr_high and self.noi > 0.001

def update_whale_instant_rate_setter(agents, price_station: PriceStation, pool: Pool, ext_data: ExtData):
    update_trader(agents, price_station, pool ,ext_data, 'whale_instant_rate_setter', WHALE_INSTANT_RATE_SETTER)

def create_new_whale_instant_rate_setter(name, eth_amount, noi_amount):
    return Whale_Instant_Rate_Setter(name, eth_amount, noi_amount, get_whale_instant_rate_setter_relative_gap())

def create_whale_instant_rate_setters(agents):
    for i in range(WHALE_INSTANT_RATE_SETTER.NUM):
        name = 'whale_instant_rate_setter' + str(i)
        agents[name] = create_new_whale_instant_rate_setter(name, WHALE_INSTANT_RATE_SETTER.ETH_AMOUNT, WHALE_INSTANT_RATE_SETTER.NOI_AMOUNT)

# redemption rate value limits when whale rate setter is activated
def get_whale_instant_rate_setter_relative_gap() -> tuple:
    p = np.random.random()
    if p < WHALE_INSTANT_RATE_SETTER.BOUND_HIGH:
        return REDEMPTION_RATES.LOW_RR
    p -= WHALE_INSTANT_RATE_SETTER.BOUND_HIGH
    if p < WHALE_INSTANT_RATE_SETTER.BOUND_MID:
        return REDEMPTION_RATES.MID_RR
    return REDEMPTION_RATES.HIGH_RR