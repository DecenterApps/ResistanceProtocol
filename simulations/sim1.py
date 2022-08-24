from cadCAD.engine import Executor
from cadCAD.engine import ExecutionMode, ExecutionContext
from cadCAD.configuration.utils import config_sim
from cadCAD.configuration import Experiment
from cadCAD import configs
import pandas as pd
import numpy as np
from classes.graph.a_graph import *
from classes.price_station import *
from classes.graph.timestamp_graph import Timestamp_Graph
from classes.graph.full_graph import Full_Graph
from utils.util_functions import *
from utils.exchange import *
from agents.agent_utils import *
from utils.constants import *
from tqdm import tqdm
from parameters import parameters
import csv

INIT_REDEMPTION_PRICE = 2

ext_data = ExtData()
ext_data.eth_dollar = get_data_from_csv('dataset/simulation_data/eth_dollar.csv')
ext_data.format_cpi_values(INIT_REDEMPTION_PRICE, get_data_from_csv('dataset/simulation_data/cpi_value.csv'))
ext_data.eth_prediction = get_data_from_csv('dataset/simulation_data/predicted_data.csv')

exp = Experiment()

genesis_states = {'sim': {} }

pbar = tqdm(total=SIMULATION_TIMESTAMPS)

f = open('dataset/graphs.csv', "w+")
f.close()

def init_state():
    agents = dict()
    starting_price = ext_data.eth_dollar[0]
    update_one_eth(starting_price/2)
    pool = Pool(POOL.ETH_AMOUNT, POOL.NOI_AMOUNT)
    agent_utils: Agent_Utils = Agent_Utils()
    timestamp_graph = Timestamp_Graph(agent_utils)
    full_graph = Full_Graph()
    price_station = PriceStation(2, INIT_REDEMPTION_PRICE, 1, full_graph)
    agent_utils.create_agents(agents)
    br = [0]*len(agent_utils.nums)
    return (agents, pool, price_station, timestamp_graph, full_graph, agent_utils, br)

def set_previous_values(previous_state):
    agents = previous_state['sim']['agents']
    pool: Pool = previous_state['sim']['pool']
    price_station: PriceStation = previous_state['sim']['price_station']
    timestamp_graph: Timestamp_Graph = previous_state['sim']['timestamp_graph']
    full_graph: Full_Graph = previous_state['sim']['full_graph']
    agent_utils: Agent_Utils = previous_state['sim']['agent_utils']
    br = previous_state['sim']['br']
    return (agents, pool, price_station, timestamp_graph, full_graph, agent_utils, br)

def plot_graphs(timestamp_graph, full_graph, br):
    global ext_data
    full_graph.plot(ext_data)
    timestamp_graph.plot(ext_data)
    print(br)

agents, pool, price_station, timestamp_graph, full_graph, agent_utils, br = init_state()

def update_agents(params, substep, state_history, previous_state, policy_input):
    global agents, pool, price_station, timestamp_graph, full_graph, agent_utils, br

    if previous_state['timestep'] == 0:
        print(params)
        if 'parameters' in params:
            # print('LOL')        
            update_constants(params['parameters'])
            agents, pool, price_station, timestamp_graph, full_graph, agent_utils, br = init_state()
        pbar.clear()

    ext_data.set_parameters(substep, previous_state)
    price_station.get_fresh_mp(pool, ext_data)
    price_station.calculate_redemption_price(ext_data)
    timestamp_graph.add_to_graph(agents, price_station, pool)

    update_whale_longterm_price_setter(agents, price_station, pool, ext_data)
    
    total_sum = np.sum(nums)
    # print(nums)
    for i in range(total_sum // 2):
        p = np.random.random()
        if i % 2 == 0:
            if RATE_TRADER.NUM + PRICE_TRADER.NUM > 0 and p < RATE_TRADER.NUM / (RATE_TRADER.NUM + PRICE_TRADER.NUM):
                update_rate_trader(agents, price_station, pool, ext_data)
            else:
                update_price_trader(agents, price_station, pool, ext_data)
            continue
        for i in range(len(agent_utils.nums)):
            if p < agent_utils.nums[i] / total_sum:
                agent_utils.agents_dict[agent_utils.names[i]]['update'](agents, price_station, pool, ext_data)
                br[i] += 1
                break
            p -= agent_utils.nums[i] / total_sum

    if previous_state['timestep'] == SIMULATION_TIMESTAMPS - 1:
        plot_graphs(full_graph, timestamp_graph, br)
        with open('dataset/graphs.csv', 'a') as f:
            writer = csv.writer(f)
            one, two, three = timestamp_graph.save_main_axis(ext_data)
            writer.writerow([one, two, three])
            one, two, three = full_graph.save_main_axis(ext_data)
            writer.writerow([one, two, three])
    
    pbar.update(1)

    return ('sim', {})

partial_state_update_blocks = [
    {
        'label': 'Market Simulation',
        'policies': {
        },
        'variables': {
            'sim': update_agents,
        }
    }
]

sim_config_dict = {
    'T': range(SIMULATION_TIMESTAMPS),
    'N': 1,
    'M': {
        'parameters':
            parameters
    }
}

c = config_sim(sim_config_dict)
del configs[:]
exp.append_configs(initial_state=genesis_states,
                   partial_state_update_blocks=partial_state_update_blocks,
                   sim_configs=c
                   )

exec_mode = ExecutionMode()
local_mode_ctx = ExecutionContext(exec_mode.multi_proc)

simulation = Executor(exec_context=local_mode_ctx, configs=exp.configs)

raw_system_events, tensor_field, sessions = simulation.execute()

simulation_result = pd.DataFrame(raw_system_events)
simulation_result.set_index(['subset', 'run', 'timestep', 'substep'])

plot_all_graphs()
print(agent_utils.names)