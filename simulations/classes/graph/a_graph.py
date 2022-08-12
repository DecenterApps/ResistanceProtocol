import matplotlib.pyplot as plt
from classes.ext_data import ExtData
from utils.constants import REDEMPTION_RATES
import numpy as np

class Graph:
    def __init__(self):
        self.eth = []
        self.noi = []
        self.r_prices = []
        self.m_prices = []
        self.market_twap_prices = []
        self.pool_ratio = []
        self.trader_money_ratio = []
        self.redemption_rate = []
        self.rr_coef = [REDEMPTION_RATES.MIN_RR, REDEMPTION_RATES.LOW_RR, REDEMPTION_RATES.MID_RR, REDEMPTION_RATES.HIGH_RR]
        self.rr_colors = ['green', 'yellow', 'orange', 'red']
        self.relative_gap_mp_rp = []


    def add_to_graph(self, price_station, pool):
        self.m_prices.append(price_station.mp)
        self.market_twap_prices.append(price_station.market_twap)
        self.r_prices.append(price_station.rp)
        self.eth.append(pool.eth)
        self.noi.append(pool.noi)
        self.pool_ratio.append(pool.eth / (pool.eth + pool.noi))
        self.relative_gap_mp_rp.append((price_station.mp - price_station.rp) / price_station.rp)
        self.redemption_rate.append(price_station.rr)
    
    def plot(self):
        self.plotGraph1()
        self.plotGraph2()
    
    def plotGraph1(self, filename, ext_data: ExtData, graph_name):
        figure, axis = plt.subplots(2, 2, figsize=(15,8))
        axis[0, 0].plot(self.m_prices)
        axis[0,0].plot(self.r_prices, color='red')
        if graph_name == 'timestamp_graph':
            axis[0,0].plot(ext_data.cpi_value, color='greenyellow')
            axis[0,0].legend(['market price', 'redemption price', 'cpi'])
            axis[0, 0].set_title("Market price, Redemption price, Inflation value")
        
        else:
            axis[0,0].plot(self.market_twap_prices, color='greenyellow')
            axis[0,0].legend(['market price', 'redemption price', 'market twap price'])
            axis[0, 0].set_title("Market price, Redemption price, Market twap price")

        axis[1, 0].plot(self.relative_gap_mp_rp)
        # axis[0,0].legend(['relative gap mp-rp'])
        axis[1, 0].set_title("Relative gap mp-rp")

        axis[0, 1].plot(self.eth)
        axis[0, 1].set_title("Amount of eth in pool")
        axis[0, 1].legend(['eth amount'])

        axis[1, 1].plot(self.redemption_rate)
        arr_size = len(self.redemption_rate)
        for i in range(len(self.rr_coef)):
            axis[1, 1].plot(np.full(arr_size, self.rr_coef[i][0]), label='rr_down_' + str(i), color=self.rr_colors[i])
            axis[1, 1].plot(np.full(arr_size, self.rr_coef[i][1]), label='rr_up_' + str(i), color=self.rr_colors[i])

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

@np.vectorize
def constant_function(x):
    return x