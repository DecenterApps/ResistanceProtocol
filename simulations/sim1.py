from cadCAD.engine import Executor
from cadCAD.engine import ExecutionMode, ExecutionContext
from cadCAD.configuration.utils import config_sim
from cadCAD.configuration import Experiment
from cadCAD import configs
import pandas as pd
import matplotlib.pyplot as plt
import csv
import numpy as np
import pi_controller
from utils.eth_data import *
from utils.classes import *
from utils.constants import *
from trader import *
from utils.exchange import *
from utils.pool import Pool

exp = Experiment()

genesis_states = {}

traders = dict()
for i in range(NUM_TRADERS):
    name = 'trader' + str(i)
    traders[name] = create_new_trader(name, ETH_AMOUNT_TRADER, NOI_AMOUNT_TRADER)

genesis_states['agents'] = {'traders': traders}

price_station = PriceStation(3, 3, 0)
eth_data = ETHData()

pool = Pool(ETH_AMOUNT_POOL, NOI_AMOUNT_POOL)
graph = Graph()

graph.eth = [pool.eth]
graph.noi = [pool.noi]

with open('dataset/eth_dollar.csv', 'r') as csvfile:
    eth_dollar = list(csv.reader(csvfile))[0]
    eth_data.eth_dollar = [float(i) for i in eth_dollar]


def update_traders(substep,  previous_state, policy_input):
    ret = dict()
    price_station.calculate_redemption_price()
    add_to_graph()
    print(previous_state['timestep'])
    for i in range(NUM_TRADERS):
        name = 'trader' + str(i)
        trader:Trader = previous_state['agents']['traders'][name]
        relative_gap = pi_controller.absolute(price_station.mp - price_station.rp) / price_station.rp
        if relative_gap < trader.relative_gap or pool.eth < 0.1:
            ret[name] = create_modified_trader(trader, 0, 0)
            continue
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
            #TODO ako nema dovoljno para u poolu da uzme deo ili nesto tako(zbog velikih tradera)
            eth_add = 0
            noi_add = 0
        pool.change_pool(substep, previous_state, eth_add, noi_add, price_station, eth_data)
        ret[name] = create_modified_trader(trader, eth_add, noi_add)
    graph.eth.append(pool.eth)
    graph.noi.append(pool.noi)
    return ret

def add_to_graph():
    global price_station, graph
    graph.m_prices.append(price_station.mp)
    graph.r_prices.append(price_station.rp)


def update_agents(params, substep, state_history,  previous_state, policy_input):
    price_station.get_fresh_mp(substep, previous_state, pool, eth_data)
    return ('agents', {'traders': update_traders(substep,  previous_state, policy_input)})


partial_state_update_blocks = [
    {
        'policies': {
        },
        'variables': {
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
0

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

plt.figure()
plt.plot(graph.m_prices[:100])
plt.plot(graph.r_prices[:100])
plt.legend(['market price', 'redemption price'])
plt.savefig('images/noviji_lol.png')


# plt.figure()
# # plt.plot(simulation_result)
# # # plt.show()
# plt.savefig('test.png')

# simulation_result.plot('timestep', ['box_A', 'box_B'], grid=True,
#                        colormap='RdYlGn',
#                        xticks=list(
#                            simulation_result['timestep'].drop_duplicates()),
#                        yticks=list(range(1+(simulation_result['box_A']+simulation_result['box_B']).max())))
