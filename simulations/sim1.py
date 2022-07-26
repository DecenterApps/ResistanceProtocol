from cadCAD.engine import Executor
from cadCAD.engine import ExecutionMode, ExecutionContext
from cadCAD.configuration.utils import config_sim
from cadCAD.configuration import Experiment
from cadCAD import configs
import pandas as pd
import matplotlib.pyplot as plt
import dataframe_image as dfi
import csv

exp = Experiment()

genesis_states = {
    'trader': {'eth':100,'noi':100},
    # 'trader': 100,
    'pool_eth': 100000,
    'pool_noi': 10000000,
}


eth_dollar = []
eth_amount = []
noi_amount = []

with open('dataset/eth_dollar.csv', 'r') as csvfile:
    eth_dollar = list(csv.reader(csvfile))[0]
    eth_dollar = [float(i) for i in eth_dollar]


# print(params)

def get_current_timestep(cur_substep, previous_state):
    if cur_substep == 1:
        return previous_state['timestep']+1
    return previous_state['timestep']

def update_trader(params, substep, state_history,  previous_state, policy_input):
    y = 'trader'
    # return (y, {'eth': 100, 'noi': 100})
    eth_value = eth_dollar[get_current_timestep(substep, previous_state)]
    print()
    eth_add = -1
    noi_add = +1
    if eth_value < 1000:
        eth_add = + 1
        noi_add = - 1
    # print(type(previous_state['trader']['eth']))
    eth_amount.append(previous_state['trader']['eth'] + eth_add)
    noi_amount.append(previous_state['trader']['noi'] + noi_add)
    return (y, {'eth':previous_state['trader']['eth'] + eth_add, 'noi':previous_state['trader']['noi'] + noi_add})

partial_state_update_blocks = [
    {
        'policies': {  
        },
        'variables': {  # The following state variables will be updated simultaneously
            'trader': update_trader
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
local_mode_ctx = ExecutionContext(exec_mode.local_mode)


# Pass the configuration object inside an array
simulation = Executor(exec_context=local_mode_ctx, configs=exp.configs)
# The `execute()` method returns a tuple; its first elements contains the raw results
raw_system_events, tensor_field, sessions = simulation.execute()


simulation_result = pd.DataFrame(raw_system_events)
simulation_result.set_index(['subset', 'run', 'timestep', 'substep'])

plt.figure()
plt.plot(noi_amount)
plt.plot(eth_amount)
plt.legend(['noi', 'eth'])
plt.savefig('novi_lol.png')

# plt.figure()
# # plt.plot(simulation_result)
# # # plt.show()
# plt.savefig('test.png')

# simulation_result.plot('timestep', ['box_A', 'box_B'], grid=True,
#                        colormap='RdYlGn',
#                        xticks=list(
#                            simulation_result['timestep'].drop_duplicates()),
#                        yticks=list(range(1+(simulation_result['box_A']+simulation_result['box_B']).max())))
