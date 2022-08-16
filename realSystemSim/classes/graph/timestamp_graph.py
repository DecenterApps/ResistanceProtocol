import matplotlib.pyplot as plt
from agents.price_trader import *
from classes.graph.a_graph import Graph
from agents.agent_utils import *
import sys
sys.path.append("..")
from classes.ext_data import *

class Timestamp_Graph(Graph):

    def __init__(self, agent_utils: Agent_Utils):
        Graph.__init__(self)
        self.agent_utils = agent_utils
        self.agent_balances = dict()
        for i in range(len(agent_utils.names)):
            self.agent_balances[agent_utils.names[i]] = agent_utils.agents_dict[agent_utils.names[i]]['graph']

    def add_to_graph(self, previous_state, price_station, pool):
        Graph.add_to_graph(self, price_station, pool)

        self.agent_utils.calculate_all_amounts(previous_state)
    
    def plot(self, ext_data: ExtData):
        Graph.plotGraph1(self, 'images/timestamp_graph.png', ext_data, 'timestamp_graph')
        self.plot_agents_balance()


    def plot_agents_balance(self):
        cnt = len(self.agent_utils.names)
        figure, axis = plt.subplots(cnt, 2, figsize=(12,12))
        self.plot_axis(axis, 0, cnt, 'eth')
        self.plot_axis(axis, 1, cnt, 'noi')
        plt.tight_layout()

        plt.savefig('images/agents.png')

    def plot_axis(self, axis, index, cnt, token_name):
        for i in range(cnt):
            axis[i][index].plot(self.agent_balances[self.agent_utils.names[i]][token_name])
            axis[i][index].set_title(self.agent_utils.names[i] + "_" + token_name)