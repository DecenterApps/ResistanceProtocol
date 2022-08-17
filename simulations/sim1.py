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
from utils.util_functions import get_data_from_csv
from utils.exchange import *
from agents.agent_utils import *
from utils.constants import *
from tqdm import tqdm

INIT_REDEMPTION_PRICE = 2

ext_data = ExtData()
ext_data.eth_dollar = get_data_from_csv('dataset/simulation_data/eth_dollar.csv')
ext_data.format_cpi_values(INIT_REDEMPTION_PRICE, get_data_from_csv('dataset/simulation_data/cpi_value.csv'))

exp = Experiment()

genesis_states = {'sim': {
    'agents': None,
    'pool': None,
    'price_station': None,
    'timestamp_graph': None,
    'full_graph': None,
    'agent_utils': None,
    'br': None,
}
}

pbar = tqdm(total=SIMULATION_TIMESTAMPS)

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

def plot_graphs(full_graph, timestamp_graph, br):
    global ext_data
    full_graph.plot(ext_data)
    timestamp_graph.plot(ext_data)
    print(br)

def set_previous_values(previous_state):
    agents = previous_state['sim']['agents']
    pool: Pool = previous_state['sim']['pool']
    price_station: PriceStation = previous_state['sim']['price_station']
    timestamp_graph: Timestamp_Graph = previous_state['sim']['timestamp_graph']
    full_graph: Full_Graph = previous_state['sim']['full_graph']
    agent_utils: Agent_Utils = previous_state['sim']['agent_utils']
    br = previous_state['sim']['br']
    return (agents, pool, price_station, timestamp_graph, full_graph, agent_utils, br)

def update_agents(params, substep, state_history, previous_state, policy_input):

    if previous_state['timestep'] == 0:
        update_constants(params['parameters'])
        agents, pool, price_station, timestamp_graph, full_graph, agent_utils, br = init_state()
        pbar.clear()
    else:
        agents, pool, price_station, timestamp_graph, full_graph, agent_utils, br = set_previous_values(previous_state)

    ext_data.set_parameters(substep, previous_state)
    ext_data.set_fresh_eth_prediction()
    price_station.get_fresh_mp(pool, ext_data)
    price_station.calculate_redemption_price(ext_data)
    timestamp_graph.add_to_graph(agents, price_station, pool)

    total_sum = np.sum(nums)

    update_whale_longterm_price_setter(agents, price_station, pool, ext_data)
    
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

    pbar.update(1)

    if previous_state['timestep'] == SIMULATION_TIMESTAMPS - 1:
        plot_graphs(full_graph, timestamp_graph, br)

    return ('sim', {'agents': agents,
                    'pool': pool,
                    'price_station': price_station,
                    'timestamp_graph': timestamp_graph,
                    'full_graph': full_graph,
                    'agent_utils': agent_utils,
                    'br': br})

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
        'parameters': [
            {
                'random_trader': 0,
            },
            {
                'random_trader': 10,
            }
        ]
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