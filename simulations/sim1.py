from cadCAD.engine import Executor
from cadCAD.engine import ExecutionMode, ExecutionContext
from cadCAD.configuration.utils import config_sim
from cadCAD.configuration import Experiment
from cadCAD import configs
import pandas as pd
import matplotlib.pyplot as plt
import dataframe_image as dfi

exp = Experiment()

genesis_states = {
    'usr1': 10,
    'usr2': 10,
    'usr3': 10,
    'usr4': 10,
    'usr5': 10
}


def update_A(params, step, sH, s, _input):
    y = 'box_A'
    add_to_A = 0
    if (s['box_A'] > s['box_B']):
        add_to_A = -1
    elif (s['box_A'] < s['box_B']):
        add_to_A = 1
    x = s['box_A'] + add_to_A
    return (y, x)


def update_B(params, step, sH, s, _input):
    y = 'box_B'
    add_to_B = 0
    if (s['box_B'] > s['box_A']):
        add_to_B = -1
    elif (s['box_B'] < s['box_A']):
        add_to_B = 1
    x = s['box_B'] + add_to_B
    return (y, x)


partial_state_update_blocks = [
    {
        'policies': {  # We'll ignore policies for now
        },
        'variables': {  # The following state variables will be updated simultaneously
            'box_A': update_A,
            'box_B': update_B
        }
    }
]

sim_config_dict = {
    'T': range(10),
    'N': 1,
    # 'M': {}
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
# plt.plot(simulation_result)
# plt.show()
# plt.savefig('lol.png')

plt.figure()
plt.plot(simulation_result)
# plt.show()
plt.savefig('test.png')

simulation_result.plot('timestep', ['box_A', 'box_B'], grid=True,
                       colormap='RdYlGn',
                       xticks=list(
                           simulation_result['timestep'].drop_duplicates()),
                       yticks=list(range(1+(simulation_result['box_A']+simulation_result['box_B']).max())))
