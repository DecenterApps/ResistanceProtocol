from agents.trader.a_trader import *
import numpy as np

class Whale_Longterm_Price_Setter(Trader):
    def __init__(self, name, eth, noi, target_perc, period):
        Trader.__init__(self, name, eth, noi)
        self.open_position = False
        self.sealed_position = False
        self.buy_noi = False
        self.init_position = False
        self.target_perc = target_perc
        self.period = period

    def terminate_condition(self, price_station):
        if self.sealed_position:
            return True
        if not self.open_position:
            p = np.random.random()
            if p > 0.005:
                return True
            self.open_position = True
            self.init_position = True
            if price_station.mp > price_station.rp:
                self.buy_noi = True
            return False

        if self.eth < 0.0001 and self.buy_noi:
            self.sealed_position = True
            return True
        if self.noi < 0.0001 and not self.buy_noi:
            self.sealed_position = True
            return True
        return False

    def buy_noi_condition(self, price_station):
        if not self.buy_noi or self.eth < 0.0001:
            return False
        if self.init_position:
            self.init_position = False
            self.perc_amount = 0.2
            self.max_val = self.eth * (1-self.perc_amount) / self.period
            return True
        curr_perc = (price_station.mp - price_station.rp) / price_station.rp
        q = (self.target_perc - curr_perc) * 5
        if q > 1:
            q = 1
        if q < 0:
            q = 0
        if self.max_val * q > self.eth:
            self.perc_amount = 1
            self.sealed_position = True
        else:
            self.perc_amount = (self.max_val * q) / self.eth
        return True

    def buy_eth_condition(self, price_station):
        if self.buy_noi or self.noi < 0.0001:
            return False
        if self.init_position:
            self.init_position = False
            self.perc_amount = 0.1
            self.max_val = self.noi * (1-self.perc_amount) / self.period
            return True
        curr_perc = (price_station.rp - price_station.mp) / price_station.rp
        q = (self.target_perc - curr_perc) * 5
        if q > 1:
            q = 1
        if q < 0:
            q = 0
        if self.max_val * q > self.noi:
            self.perc_amount = 1
            self.sealed_position = True
        else:
            self.perc_amount = (self.max_val * q) / self.noi
        return True

def update_whale_longterm_price_setter(agents, price_station: PriceStation, pool: Pool, ext_data: ExtData):
    update_trader(agents, price_station, pool, ext_data, 'whale_longterm_price_setter', WHALE_LONGTERM_PRICE_SETTER)

def create_new_whale_longterm_price_setter(name, eth_amount, noi_amount, target_perc, period):
    return Whale_Longterm_Price_Setter(name, eth_amount, noi_amount, target_perc, period)

def create_whale_longterm_price_setters(agents):
    for i in range(WHALE_LONGTERM_PRICE_SETTER.NUM):
        name = 'whale_longterm_price_setter' + str(i)
        agents[name] = create_new_whale_longterm_price_setter(name, WHALE_LONGTERM_PRICE_SETTER.ETH_AMOUNT,
        WHALE_LONGTERM_PRICE_SETTER.NOI_AMOUNT, get_whale_targetted_perc(), get_whale_activity_period())

# targetted difference between market price and redemption price
def get_whale_targetted_perc():
    p = np.random.random()
    if p < WHALE_LONGTERM_PRICE_SETTER.BOUND_HIGH:
        return 0.07
    p -= WHALE_LONGTERM_PRICE_SETTER.BOUND_HIGH
    if p < WHALE_LONGTERM_PRICE_SETTER.BOUND_MID:
        return 0.12
    return 0.20

def get_whale_activity_period():
    p = np.random.random()
    if p < WHALE_LONGTERM_PRICE_SETTER.SHORT_PERIOD:
        return 10
    p -= WHALE_LONGTERM_PRICE_SETTER.SHORT_PERIOD
    if p < WHALE_LONGTERM_PRICE_SETTER.MID_PERIOD:
        return 25
    return 50