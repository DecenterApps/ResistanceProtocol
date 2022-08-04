import matplotlib.pyplot as plt
from agents.price_trader import *
from classes.graph.a_graph import Graph
from agents.agent_utlis import *

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
    
    def plot(self):
        Graph.plotGraph1(self, 'images/timestamp_graph.png')
        self.plotGraph2()

    def plotGraph2(self):
        cnt = len(self.agent_utils.names)
        figure, axis = plt.subplots(cnt, 1, figsize=(8,12))
        for i in range(cnt):
            axis[i].plot(self.agent_balances[self.agent_utils.names[i]])
            axis[i].set_title(self.agent_utils.names[i])
        plt.tight_layout()

        plt.savefig('images/agents.png')