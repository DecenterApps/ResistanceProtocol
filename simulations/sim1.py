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
    'pool_eth': 100000,
    'pool_noi': 10000000,
}


eth_dollar = []

with open('dataset/eth_dollar.csv', 'r') as csvfile:
    eth_dollar = list(csv.reader(csvfile))[0]
    eth_dollar = [float(i) for i in eth_dollar]

# print(eth_dollar)
params = {
    'eth_dollar': eth_dollar,
}

# print(params)

def get_current_timestep(cur_substep, previous_state):
    return 1
    # if cur_substep == 1:
    #     return previous_state['timestep']+1
    # return previous_state['timestep']

def update_trader(params, substep, state_history,  previous_state, policy_input):
    y = 'trader'
    eth_value = params['eth_dollar'][get_current_timestep(substep, previous_state)]
    eth_value = 0
    noi_value = 0
    if eth_value > 1000:
        eth_value = eth_value - 1
        noi_value = noi_value + 1
    else:
        eth_value = eth_value + 1
        noi_value = noi_value - 1
    return (y, [previous_state['trader']['pool_eth'] + eth_value, previous_state['trader']['pool_noi'] + noi_value])

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
    'T': range(50),
    'N': 1,
    'M': {'lol': 1}, 
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

print(simulation_result)
plt.plot(simulation_result)
plt.show()
plt.savefig('lol.png')

plt.figure()
# plt.plot(simulation_result)
# # plt.show()
plt.savefig('test.png')

# simulation_result.plot('timestep', ['box_A', 'box_B'], grid=True,
#                        colormap='RdYlGn',
#                        xticks=list(
#                            simulation_result['timestep'].drop_duplicates()),
#                        yticks=list(range(1+(simulation_result['box_A']+simulation_result['box_B']).max())))
