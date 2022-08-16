import pandas as pd
import numpy as np
from classes.graph.a_graph import *
from classes.price_station import *
from classes.graph.timestamp_graph import Timestamp_Graph
from classes.graph.full_graph import Full_Graph
from constants import *
from agents.agent_utils import Agent_Utils
from utils.util_functions import get_data_from_csv
from utils.exchange import *
from agents.price_trader import *
from agents.rate_trader import *
from tqdm import tqdm

pool = Pool()

agent_utils: Agent_Utils = Agent_Utils()

timestamp_graph = Timestamp_Graph(agent_utils)
full_graph = Full_Graph()

price_station = PriceStation(full_graph)
ext_data = ExtData()
agents = dict()

agent_utils.create_agents(agents)

genesis_states = {'agents': agents}

ext_data.eth_dollar = get_data_from_csv('dataset/twap_eth_dollar.csv')
ext_data.cpi_value = get_data_from_csv('dataset/cpi_value.csv')

br = [0]*len(agent_utils.nums)

def update_agents(timestamp):
    global br, agents, price_station

    ext_data.set_parameters(timestamp)
    ext_data.set_fresh_eth_prediction()
    # timestamp_graph.add_to_graph(timestamp, price_station, pool)

    names = agent_utils.names
    nums = agent_utils.nums
    total_sum = agent_utils.total_sum

    # update_whale_longterm_price_setter(agents, price_station, pool, ext_data)

    for i in range(agent_utils.total_sum // 2):
        p = np.random.random()
        if i % 2 == 0:
            if RATE_TRADER_NUM + PRICE_TRADER_NUM > 0 and p < RATE_TRADER_NUM / (RATE_TRADER_NUM + PRICE_TRADER_NUM):
                update_rate_trader(agents, price_station, pool)
            else:
                update_price_trader(agents, price_station, pool)
            continue
        for i in range(len(nums)):
            if p < nums[i] / total_sum:
                agent_utils.agents_dict[names[i]]['update'](agents, price_station, pool)
                br[i] += 1
                break
            p -= nums[i] / total_sum
    
    pbar.update(1)

pbar = tqdm(total=SIMULATION_TIMESTAMPS)

for i in range(SIMULATION_TIMESTAMPS):
    update_agents(i)

pbar.close()

full_graph.plot(ext_data)
timestamp_graph.plot(ext_data)

print(br)