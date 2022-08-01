from cadCAD.engine import Executor
from cadCAD.engine import ExecutionMode, ExecutionContext
from cadCAD.configuration.utils import config_sim
from cadCAD.configuration import Experiment
from cadCAD import configs
import pandas as pd
import matplotlib.pyplot as plt
import csv
import numpy as np
import random
import pi_controller
from classes.eth_data import *
from classes.util_classes import *
from classes.price_station import *
from agents.leverager import Leverager, create_new_leverager
from utils.constants import *
from agents.trader import *
from utils.exchange import *
from classes.pool import *

exp = Experiment()

price_station = PriceStation(2, 2, 0)
eth_data = ETHData()

agents = dict()

traders = dict()
for i in range(TRADER.NUM):
    name = 'trader' + str(i)
    traders[name] = create_new_trader(
        name, TRADER.ETH_AMOUNT, TRADER.NOI_AMOUNT)
    agents[name] = traders[name]

leveragers = dict()
for i in range(LEVERAGER.NUM):
    name = 'leverager' + str(i)
    leveragers[name] = create_new_leverager(
        name, LEVERAGER.ETH_AMOUNT, price_station)
    agents[name] = leveragers[name]

genesis_states = {'agents': agents}

pool = Pool(POOL.ETH_AMOUNT, POOL.NOI_AMOUNT)
graph = Graph()

graph.eth = [pool.eth]
graph.noi = [pool.noi]

with open('dataset/eth_dollar.csv', 'r') as csvfile:
    eth_dollar = list(csv.reader(csvfile))[0]
    eth_data.eth_dollar = [float(i) for i in eth_dollar]


def update_trader(substep,  previous_state, policy_input):
    if TRADER.NUM == 0:
        return
    i = random.randint(0, TRADER.NUM - 1)
    name = 'trader' + str(i)
    trader: Trader = previous_state['agents'][name]
    relative_gap = pi_controller.absolute(
        price_station.mp - price_station.rp) / price_station.rp
    if relative_gap < trader.relative_gap or pool.eth < 0.1:
        agents[name] = create_modified_trader(trader, 0, 0)
        return
    # buy eth, sell noi
    noi_add = +1*trader.noi * trader.perc_amount  # value of noi to be added to pool
    # value of eth to be added to pool
    eth_add = -1*exchange_noi_to_eth(noi_add, pool)
    if price_station.mp < price_station.rp:
        # buy noi, sell eth
        eth_add = +1*trader.eth * trader.perc_amount
        noi_add = -1*exchange_eth_to_noi(eth_add, pool)

    if (pool.noi + noi_add <= 0
        or pool.eth + eth_add <= 0
        or trader.eth - eth_add <= 0
            or trader.noi - noi_add <= 0):
        # TODO ako nema dovoljno para u poolu da uzme deo ili nesto tako(zbog velikih tradera)
        eth_add = 0
        noi_add = 0
    pool.change_pool(substep, previous_state, eth_add,
                        noi_add, price_station, eth_data)
    agents[name] = create_modified_trader(trader, eth_add, noi_add)

global_max_relative_gap = 0

def update_leverager(substep, previous_state, policy_input):
    global global_max_relative_gap
    if LEVERAGER.NUM == 0:
        return
    i = random.randint(0, LEVERAGER.NUM - 1)
    name = 'leverager' + str(i)
    leverager: Leverager = previous_state['agents'][name]
    relative_gap = pi_controller.absolute(
        price_station.mp - price_station.rp) / price_station.rp
    
    if price_station.mp > price_station.rp:
        global_max_relative_gap = max(relative_gap, global_max_relative_gap)

    if leverager.opened_position:
        current_cr = leverager.cdp_position.calculate_cr(substep, previous_state, eth_data, price_station)
        if current_cr < LIQUIDATION_RATIO:
            leverager.liquidation()
        else:
            if relative_gap > leverager.relative_gap and price_station.rp > price_station.mp:
                leverager.close_position(substep, previous_state, eth_data, price_station, pool)
            elif current_cr > leverager.boost_cr:
                leverager.boost(substep, previous_state, eth_data, price_station, pool)
            elif current_cr < leverager.repay_cr:
                leverager.repay(substep, previous_state, eth_data, price_station, pool)
    else:
        
        if relative_gap > leverager.relative_gap and price_station.rp < price_station.mp:
            leverager.open_position(substep, previous_state, eth_data, price_station, pool)
    
    agents[name] = leverager


def add_to_graph():
    global price_station, graph
    graph.m_prices.append(price_station.mp)
    graph.r_prices.append(price_station.rp)


def update_agents(params, substep, state_history, previous_state, policy_input):
    global agents
    ret = agents
    
    print(previous_state['timestep'])
    price_station.get_fresh_mp(substep, previous_state, pool, eth_data)
    price_station.calculate_redemption_price()
    add_to_graph()
    graph.eth.append(pool.eth)
    graph.noi.append(pool.noi)
    
    for _ in range((LEVERAGER.NUM + TRADER.NUM) // 2):
        p = np.random.random()
        if p < 0.1:
            update_leverager(substep, previous_state, policy_input)
        else:
            update_trader(substep, previous_state, policy_input)
    return ('agents', ret)

partial_state_update_blocks = [
    { 
        'label': 'Marble Update',
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

print(global_max_relative_gap)


simulation_result = pd.DataFrame(raw_system_events)
simulation_result.set_index(['subset', 'run', 'timestep', 'substep'])

# print(noi_amount)
plt.figure()

plt.plot(graph.eth)
plt.plot(graph.noi)
plt.legend(['noi amount', 'eth amount'])

plt.savefig('images/amounts.png')

plt.figure()

plt.plot(graph.m_prices)
plt.plot(graph.r_prices)
plt.legend(['market price', 'redemption price'])

plt.savefig('images/novi_lol.png')

# plt.figure()
# plt.plot(graph.m_prices[:100])
# plt.plot(graph.r_prices[:100])
# plt.legend(['market price', 'redemption price'])
# plt.savefig('images/noviji_lol.png')
