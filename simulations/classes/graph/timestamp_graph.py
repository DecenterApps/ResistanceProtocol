import matplotlib.pyplot as plt
from agents.price_trader import *
from classes.graph.a_graph import Graph

class Timestamp_Graph(Graph):

    def add_to_graph(self, previous_state, price_station, pool):
        # self.m_prices.append(price_station.mp)
        # self.r_prices.append(price_station.rp)
        # self.eth.append(pool.eth)
        # self.noi.append(pool.noi)
        # self.pool_ratio.append(pool.eth / (pool.eth + pool.noi))
        # self.relative_gap_mp_rp.append((price_station.mp - price_station.rp) / price_station.rp)
        Graph.add_to_graph(self, price_station, pool)
        eth_amount, noi_amount = calculate_traders_amount(previous_state)
        self.trader_money_ratio.append(eth_amount / (noi_amount+1e-10))
    
    def plot(self):
        Graph.plotGraph1(self, 'images/timestamp_graph.png')
    

    def plotGraph2(self):
        return
        figure, axis = plt.subplots(2, 2, figsize=(15,8))
        axis[1, 0].plot(self.trader_money_ratio)
        axis[1, 0].set_title("Trader money ratio")

        plt.tight_layout()

        plt.savefig('images/graph2.png')