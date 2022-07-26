import matplotlib.pyplot as plt
from agents.trader.price_trader import *
from classes.graph.a_graph import Graph
from agents.agent_utils import *

class Timestamp_Graph(Graph):

    def __init__(self, agent_utils: Agent_Utils):
        Graph.__init__(self)
        self.agent_utils = agent_utils
        self.agent_balances = dict()
        for i in range(len(agent_utils.names)):
            self.agent_balances[agent_utils.names[i]] = agent_utils.agents_dict[agent_utils.names[i]]['graph']

    def add_to_graph(self, agents, price_station, pool):
        Graph.add_to_graph(self, price_station, pool)

        self.agent_utils.calculate_all_amounts(agents)
    
    def plot(self, ext_data: ExtData):
        Graph.plotGraph1(self, 'images/timestamp_graph.png', ext_data, 'timestamp_graph')
        self.plot_agents_balance()

    def save_main_axis(self, ext_data: ExtData):
        return self.m_prices, self.r_prices, ext_data.cpi_value[0:len(self.r_prices)-1]
        # axis.plot(self.m_prices)
        # axis.plot(self.r_prices, color='red')
        # axis.plot(ext_data.cpi_value[0:len(self.r_prices)-1], color='greenyellow')
        # axis.legend(['market price', 'redemption price', 'cpi'])
        # axis.set_title("Market price, Redemption price, Inflation value")
        # return axis
        
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