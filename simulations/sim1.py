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
from agents.agent_utlis import *
from tqdm import tqdm

exp = Experiment()

pool = Pool(POOL.ETH_AMOUNT, POOL.NOI_AMOUNT)

agent_utils: Agent_Utils = Agent_Utils()

timestamp_graph = Timestamp_Graph(agent_utils)
full_graph = Full_Graph()

price_station = PriceStation(2, 2, 1, full_graph)
ext_data = ExtData()
agents = dict()

agent_utils.create_agents(agents)

genesis_states = {'agents': agents}

ext_data.eth_dollar = get_data_from_csv('dataset/twap_eth_dollar.csv')
ext_data.cpi_value = get_data_from_csv('dataset/cpi_value.csv')

br = [0]*len(agent_utils.nums)

pbar = tqdm(total=SIMULATION_TIMESTAMPS)

def update_agents(params, substep, state_history, previous_state, policy_input):
    global br, agents
    ret = agents

    ext_data.set_parameters(substep, previous_state)
    ext_data.set_fresh_eth_prediction()
    price_station.get_fresh_mp(pool, ext_data)
    price_station.calculate_redemption_price(ext_data)
    timestamp_graph.add_to_graph(previous_state, price_station, pool)

    names = agent_utils.names
    nums = agent_utils.nums
    total_sum = agent_utils.total_sum

    update_whale_longterm_price_setter(agents, price_station, pool, ext_data)

    for i in range(agent_utils.total_sum // 2):
        p = np.random.random()
        if i % 2 == 0:
            if RATE_TRADER.NUM + PRICE_TRADER.NUM > 0 and p < RATE_TRADER.NUM / (RATE_TRADER.NUM + PRICE_TRADER.NUM):
                update_rate_trader(agents, price_station, pool, ext_data)
            else:
                update_price_trader(agents, price_station, pool, ext_data)
            continue
        for i in range(len(nums)):
            if p < nums[i] / total_sum:
                agent_utils.agents_dict[names[i]]['update'](agents, price_station, pool, ext_data)
                br[i] += 1
                break
            p -= nums[i] / total_sum
    
    pbar.update(1)

    return ('agents', ret)

partial_state_update_blocks = [
    { 
        'label': 'Market Simulation',
        'policies': {
        },
        'variables': {
            'agents': update_agents,
        }
    }
]

sim_config_dict = {
    'T': range(SIMULATION_TIMESTAMPS),  # about 4 months
    'N': 1,
    # 'M': ,
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

pbar.close()


simulation_result = pd.DataFrame(raw_system_events)
simulation_result.set_index(['subset', 'run', 'timestep', 'substep'])

full_graph.plot(ext_data)
timestamp_graph.plot(ext_data)

print(br)