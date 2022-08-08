import matplotlib.pyplot as plt
from classes.ext_data import ExtData
from utils.constants import REDEMPTION_RATES

class Graph:
    def __init__(self):
        self.eth = []
        self.noi = []
        self.r_prices = []
        self.m_prices = []
        self.pool_ratio = []
        self.trader_money_ratio = []
        self.redemption_rate = []
        self.redemption_rate_up = []
        self.redemption_rate_down = []
        self.relative_gap_mp_rp = []


    def add_to_graph(self, price_station, pool):
        self.m_prices.append(price_station.mp)
        self.r_prices.append(price_station.rp)
        self.eth.append(pool.eth)
        self.noi.append(pool.noi)
        self.pool_ratio.append(pool.eth / (pool.eth + pool.noi))
        self.relative_gap_mp_rp.append((price_station.mp - price_station.rp) / price_station.rp)
        self.redemption_rate.append(price_station.rr)
        self.redemption_rate_down.append(REDEMPTION_RATES.LOW_RR[0])
        self.redemption_rate_up.append(REDEMPTION_RATES.LOW_RR[1])
    
    def plot(self):
        self.plotGraph1()
        self.plotGraph2()
    
    def plotGraph1(self, filename, ext_data: ExtData):
        figure, axis = plt.subplots(2, 2, figsize=(15,8))
        axis[0, 0].plot(self.m_prices)
        axis[0,0].plot(self.r_prices)
        axis[0,0].plot(ext_data.cpi_value)
        axis[0,0].legend(['market price', 'redemption price', 'cpi'])
        axis[0, 0].set_title("Market price, Redemption price, Inflation value")
        
        # axis[0, 1].plot(self.pool_ratio)
        # axis[0, 1].set_title("Pool ratio")


        axis[1, 0].plot(self.relative_gap_mp_rp)
        # axis[0,0].legend(['relative gap mp-rp'])
        axis[1, 0].set_title("Relative gap mp-rp")
        
        # axis[1, 1].plot(self.eth)
        # axis[1, 1].plot(self.noi)
        # axis[1, 1].set_title("Amount of tokens in pool")
        # axis[1, 1].legend(['eth amount', 'noi amount'])

        axis[0, 1].plot(self.eth)
        axis[0, 1].set_title("Amount of eth in pool")
        axis[0, 1].legend(['eth amount'])

        # axis[1, 1].plot(self.noi)
        # axis[1, 1].set_title("Amount of noi in pool")
        # axis[1, 1].legend(['noi amount'])

        axis[1, 1].plot(self.redemption_rate)
        axis[1, 1].plot(self.redemption_rate_up)
        axis[1, 1].plot(self.redemption_rate_down)
        axis[1, 1].set_title("Redemption rate")
        axis[1, 1].legend(['redemption rate'])

        plt.tight_layout()

        plt.savefig(filename)


    def plotGraph2(self):
        return
        figure, axis = plt.subplots(2, 2, figsize=(15,8))
        axis[1, 0].plot(self.trader_money_ratio)
        axis[1, 0].set_title("Trader money ratio")

        plt.tight_layout()

        plt.savefig('images/graph2.png')