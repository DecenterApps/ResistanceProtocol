import matplotlib.pyplot as plt
from agents.price_trader import *
from classes.graph.a_graph import Graph

class Full_Graph(Graph):
    
    def plot(self):
        Graph.plotGraph1(self, 'images/full_graph.png')
        # self.plotGraph2()


    def plotGraph2(self):
        return
        figure, axis = plt.subplots(2, 2, figsize=(15,8))
        axis[1, 0].plot(self.trader_money_ratio)
        axis[1, 0].set_title("Trader money ratio")

        plt.tight_layout()

        plt.savefig('images/graph2.png')