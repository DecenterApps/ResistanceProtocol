class PriceStation:
    def __init__(self, market_price, redemption_price, accumulated_leak):
        # market price
        self.mp = market_price
        # redemption price
        self.rp = redemption_price
        # accumulated_leak
        self.accumulated_leak = accumulated_leak

class Pool:
    def __init__(self, eth_amount:float, noi_amount:float):
        self.noi = noi_amount
        self.eth = eth_amount

class DataStation:
    def __init__(self):
        self.eth_dollar = []

class Graph:
    def __init__(self):
        self.eth = []
        self.noi = []
        self.r_prices = []
        self.m_prices = []