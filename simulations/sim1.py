from cadCAD.engine import Executor
from cadCAD.engine import ExecutionMode, ExecutionContext
from cadCAD.configuration.utils import config_sim
from cadCAD.configuration import Experiment
from cadCAD import configs
import pandas as pd
import csv
import numpy as np
from classes.eth_data import *
from classes.graph import *
from classes.price_station import *
from classes.pool import *
from agents.leverager import *
from agents.rate_trader import *
from agents.price_trader import *
from agents.safe_owner import *
from utils.constants import *
from utils.exchange import *

exp = Experiment()

price_station = PriceStation(2, 2, 1, 0)
eth_data = ETHData()
agents = dict()

create_price_traders(agents)
create_rate_traders(agents)
create_leveragers(agents)
create_safe_owners(agents)

genesis_states = {'agents': agents}

pool = Pool(POOL.ETH_AMOUNT, POOL.NOI_AMOUNT)
graph = Graph()

graph.eth = [pool.eth]
graph.noi = [pool.noi]

with open('dataset/eth_dollar.csv', 'r') as csvfile:
    eth_dollar = list(csv.reader(csvfile))[0]
    eth_data.eth_dollar = [float(i) for i in eth_dollar]

def add_to_graph(previous_state):
    global price_station, graph
    graph.m_prices.append(price_station.mp)
    graph.r_prices.append(price_station.rp)
    graph.eth.append(pool.eth)
    graph.noi.append(pool.noi)
    graph.pool_ratio.append(pool.eth / (pool.eth + pool.noi))

    eth_amount, noi_amount = calculate_traders_amount(previous_state)
    graph.trader_money_ratio.append(eth_amount / (noi_amount+1e-10))


def update_agents(params, substep, state_history, previous_state, policy_input):
    global agents
    ret = agents
    
    # print(previous_state['timestep'])

    eth_data.set_parameters(substep, previous_state)
    price_station.get_fresh_mp(pool, eth_data)
    price_station.calculate_redemption_price(graph)
    add_to_graph(previous_state)

    total_sum = LEVERAGER.NUM + PRICE_TRADER.NUM + RATE_TRADER.NUM + SAFE_OWNER.NUM
    
    for i in range(total_sum // 2):
        p = np.random.random()
        if i % 2 == 0:
            if p < RATE_TRADER.NUM / (RATE_TRADER.NUM + PRICE_TRADER.NUM):
                update_rate_trader(previous_state, agents, price_station, pool, eth_data)
            else:
                update_price_trader(previous_state, agents, price_station, pool, eth_data)
            continue

        if p < LEVERAGER.NUM / (total_sum):
            update_leverager(previous_state, agents, price_station, pool, eth_data)
            continue
        p -= LEVERAGER.NUM / (total_sum)
        if p < RATE_TRADER.NUM / (total_sum):
            update_rate_trader(previous_state, agents, price_station, pool, eth_data)
            continue
        p -= RATE_TRADER.NUM / (total_sum)
        if p < PRICE_TRADER.NUM / (total_sum):
            update_price_trader(previous_state, agents, price_station, pool, eth_data)
            continue
        update_safe_owner(previous_state, agents, price_station, pool, eth_data)
    return ('agents', ret)

partial_state_update_blocks = [
    { 
        'label': 'Market Simulation',
        'policies': { # We'll ignore policies for now
        },
        'variables': { # The following state variables will be updated simultaneously
            'agents': update_agents,
        }
    }
]

sim_config_dict = {
    'T': range(999),
    'N': 1,
    # 'M': ,
}

c = config_sim(sim_config_dict)
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# The configurations above are then packaged into a `Configuration` object
del configs[:]
exp.append_configs(initial_state=genesis_states,  # dict containing variable names and initial values
                   # dict containing state update functions
                   partial_state_update_blocks=partial_state_update_blocks,
                   sim_configs=c  # preprocessed dictionaries containing simulation parameters
                   )

exec_mode = ExecutionMode()
local_mode_ctx = ExecutionContext(exec_mode.multi_proc)

# Pass the configuration object inside an array
simulation = Executor(exec_context=local_mode_ctx, configs=exp.configs)
# The `execute()` method returns a tuple; its first elements contains the raw results
raw_system_events, tensor_field, sessions = simulation.execute()

simulation_result = pd.DataFrame(raw_system_events)
simulation_result.set_index(['subset', 'run', 'timestep', 'substep'])

graph.plot()
