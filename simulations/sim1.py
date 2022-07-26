from cadCAD.engine import Executor
from cadCAD.engine import ExecutionMode, ExecutionContext
from cadCAD.configuration.utils import config_sim
from cadCAD.configuration import Experiment
from cadCAD import configs
import pandas as pd
import matplotlib.pyplot as plt
import csv
import numpy as np

exp = Experiment()

NUM_TRADERS = 20
PERC_RISKY_TRADERS = 0.4
MONTE_CARLO_SIMULATIONS = 10

eth_noi_pool = {'eth': 100, 'noi': 1000}


genesis_states = {
    'pool_eth': 100000,
    'pool_noi': 10000000,
}


def get_chance(probability):
    p = np.random.random()
    print(p)
    return p < probability


traders = dict()
for i in range(NUM_TRADERS):
    name = 'trader' + str(i)
    trader_type = 'safe'
    if get_chance(PERC_RISKY_TRADERS):
        trader_type = 'risky'
    traders[name] = {'eth': 100, 'noi': 100, 'type': trader_type}
genesis_states['agents'] = {'traders': traders}


eth_dollar = []
eth_amount_graph = [eth_noi_pool['eth']]
noi_amount_graph = [eth_noi_pool['noi']]
market_values = []

with open('dataset/eth_dollar.csv', 'r') as csvfile:
    eth_dollar = list(csv.reader(csvfile))[0]
    eth_dollar = [float(i) for i in eth_dollar]


def get_current_timestep(cur_substep, previous_state):
    if cur_substep == 1:
        return previous_state['timestep']+1
    return previous_state['timestep']


def update_traders(params, substep, state_history,  previous_state, policy_input):
    # print('params: ', params)
    # print('substep: ', substep)
    # print('state_history: ', state_history)
    # print('previous_state: ', previous_state)
    # print('policy_input: ', policy_input)
    eth_value = eth_dollar[get_current_timestep(substep, previous_state)]
    ret = dict()
    for i in range(NUM_TRADERS):
        name = 'trader' + str(i)
        eth_add = -1
        noi_add = +1
        if eth_value < 1000:
            eth_add = + 1
            noi_add = - 1
        if previous_state['agents']['traders'][name]['type'] == 'safe':
            eth_add *= 3
            noi_add *= 3
        if eth_noi_pool['noi'] + noi_add <= 0 or eth_noi_pool['eth'] + eth_add <= 0:
            eth_add = 0
            noi_add = 0
        eth_noi_pool['eth'] += eth_add
        eth_noi_pool['noi'] += noi_add
        ret[name] = {'eth': previous_state['agents']['traders'][name]['eth'] + eth_add, 'noi': previous_state['agents']['traders']
                     [name]['noi'] + noi_add, 'type': previous_state['agents']['traders'][name]['type']}
    eth_amount_graph.append(eth_noi_pool['eth'])
    noi_amount_graph.append(eth_noi_pool['noi'])
    return ret

def calculate_price(params, substep, state_history, previous_state):
    value = eth_noi_pool['noi']/eth_noi_pool['eth'] * eth_dollar[get_current_timestep(substep, previous_state)]
    market_values.append(value)

def update_agents(params, substep, state_history,  previous_state, policy_input):
    calculate_price(params, substep, state_history, previous_state)
    return ('agents', {'traders': update_traders(params, substep, state_history,  previous_state, policy_input)})



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


simulation_result = pd.DataFrame(raw_system_events)
simulation_result.set_index(['subset', 'run', 'timestep', 'substep'])

# print(noi_amount)
plt.figure()
# plt.plot(noi_amount_graph)
# plt.plot(eth_amount_graph)
plt.plot(market_values)
plt.legend(['noi', 'eth'])
plt.savefig('images/novi_lol.png')

# plt.figure()
# # plt.plot(simulation_result)
# # # plt.show()
# plt.savefig('test.png')

# simulation_result.plot('timestep', ['box_A', 'box_B'], grid=True,
#                        colormap='RdYlGn',
#                        xticks=list(
#                            simulation_result['timestep'].drop_duplicates()),
#                        yticks=list(range(1+(simulation_result['box_A']+simulation_result['box_B']).max())))
