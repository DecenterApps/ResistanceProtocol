from agents.price_trader import *
from classes.graph.a_graph import Graph
import matplotlib.pyplot as plt
import sys
sys.path.append("..")
from classes.ext_data import *

class Full_Graph(Graph):
    
    def __init__(self):
        Graph.__init__(self)
        self.w_cpi = []
        self.w_stable = []
        self.rr_cpi = []
        self.rr_stable = []
    
    def add_to_graph(self, price_station, pool):
        Graph.add_to_graph(self, price_station, pool)
    
    def add_rates(self, w_cpi1, w_stable1, rr_cpi1, rr_stable1):
        self.w_cpi.append(w_cpi1)
        self.w_stable.append(w_stable1)
        self.rr_cpi.append(rr_cpi1)
        self.rr_stable.append(rr_stable1)

    def plot(self, ext_data: ExtData):
        Graph.plotGraph1(self, 'images/full_graph.png', ext_data, 'full_graph')
        self.plot_controllers('images/controller_values.png')

    def plot_controllers(self, filename):
        figure, axis = plt.subplots(2, 1, figsize=(15,8))
        axis[0].plot(self.w_stable)
        axis[0].plot(self.w_cpi)
        axis[0].set_title("Weights of controllers")
        axis[0].legend(['weight stable controller', 'weight cpi controller'])

        axis[1].plot(self.rr_stable)
        axis[1].plot(self.rr_cpi)
        axis[1].set_title("RR-s of controllers")
        axis[1].legend(['rr stable controller', 'rr cpi controller'])

        plt.tight_layout()

        plt.savefig(filename)