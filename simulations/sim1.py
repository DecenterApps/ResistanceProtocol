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
PERC_RISKY_TRADERS = 0.2
PERC_MODERATE_TRADERS = 0.3
PERC_SAFE_TRADERS = 1 - PERC_MODERATE_TRADERS - PERC_RISKY_TRADERS

PERCENT_BOUND_HIGH = 0.2
PERCENT_BOUND_MID = 0.3
PERCENT_BOUND_LOW = 1 - PERCENT_BOUND_HIGH - PERCENT_BOUND_MID
MONTE_CARLO_SIMULATIONS = 1

eth_noi_pool = {'eth': 100, 'noi': 10000}


genesis_states = {
}


class Trader:
    def __init__(self, name, eth, noi, perc_amount, relative_gap):
        self.name = name
        self.eth = eth
        self.noi = noi
        self.perc_amount = perc_amount
        self.relative_gap = relative_gap

# percentage of traders resource when trading
def get_trader_perc_amount() -> float:
    p = np.random.random()
    if p < PERC_RISKY_TRADERS:
        return 0.9
    p -= PERC_RISKY_TRADERS
    if p < PERC_MODERATE_TRADERS:
        return 0.7
    return 0.3

# relative difference between redemption price and market price when trader is activated
def get_trader_relative_gap():
    p = np.random.random()
    if p < PERCENT_BOUND_HIGH:
        return 0.02
    p -= PERCENT_BOUND_HIGH
    if p < PERCENT_BOUND_MID:
        return 0.06
    return 0.1


traders = dict()
for i in range(NUM_TRADERS):
    name = 'trader' + str(i)
    perc_amount = get_trader_perc_amount()
    relative_gap = get_trader_relative_gap()
    traders[name] = Trader(name, 100, 100, perc_amount, relative_gap)

genesis_states['agents'] = {'traders': traders}


eth_dollar = []
eth_amount_graph = [eth_noi_pool['eth']]
noi_amount_graph = [eth_noi_pool['noi']]
market_prices = []
redemption_prices = []

with open('dataset/eth_dollar.csv', 'r') as csvfile:
    eth_dollar = list(csv.reader(csvfile))[0]
    eth_dollar = [float(i) for i in eth_dollar]


def get_current_timestep(cur_substep, previous_state):
    if cur_substep == 1:
        return previous_state['timestep']+1
    return previous_state['timestep']


def create_trader(trader: Trader, eth_add, noi_add):
    return Trader(trader.name, trader.eth - eth_add, trader.noi - noi_add, trader.perc_amount, trader.relative_gap)

def exchange_noi_to_eth(noi_value):
    return noi_value * eth_noi_pool['noi'] / eth_noi_pool['eth']

def exchange_eth_to_noi(eth_value):
    return eth_value * eth_noi_pool['eth'] / eth_noi_pool['noi']


def update_traders(substep,  previous_state, policy_input):
    eth_value = eth_dollar[get_current_timestep(substep, previous_state)]
    ret = dict()
    for i in range(NUM_TRADERS):
        name = 'trader' + str(i)
        trader = previous_state['agents']['traders'][name]
        noi_mp = calculate_market_price(substep, previous_state, False)
        noi_rp = calculate_redemption_price()
        relative_gap = abs(noi_mp - noi_rp) / noi_mp
        if relative_gap < trader.relative_gap:
            ret[name] = create_trader(trader, 0, 0)
            continue

        # buy eth
        noi_add = +1*trader.noi * trader.perc_amount # value of noi to be added to pool
        eth_add = -1*exchange_noi_to_eth(noi_add) # value of eth to be added to pool
        if noi_mp < noi_rp:
            # buy noi
            eth_add = +1*trader.eth * trader.perc_amount
            noi_add = -1*exchange_eth_to_noi(eth_add)
            
        if (eth_noi_pool['noi'] + noi_add <= 0
        or eth_noi_pool['eth'] + eth_add <= 0
        or trader.eth - eth_add <= 0
        or trader.noi - noi_add <= 0):
            eth_add = 0
            noi_add = 0
        eth_noi_pool['eth'] += eth_add
        eth_noi_pool['noi'] += noi_add
        ret[name] = create_trader(trader, eth_add, noi_add)
    eth_amount_graph.append(eth_noi_pool['eth'])
    noi_amount_graph.append(eth_noi_pool['noi'])
    return ret


def calculate_market_price(substep, previous_state, write: bool) -> float:
    value = eth_noi_pool['eth']/eth_noi_pool['noi'] * \
        eth_dollar[get_current_timestep(substep, previous_state)]
    if write:
        market_prices.append(value)
        redemption_prices.append(100)
    return value

def calculate_redemption_price():
    return 100


def update_agents(params, substep, state_history,  previous_state, policy_input):
    calculate_market_price(substep, previous_state, True)
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


simulation_result = pd.DataFrame(raw_system_events)
simulation_result.set_index(['subset', 'run', 'timestep', 'substep'])

# print(noi_amount)
plt.figure()
# plt.plot(noi_amount_graph)
# plt.plot(eth_amount_graph)
plt.plot(market_prices)
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
