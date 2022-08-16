from .price_trader import create_price_traders, update_price_trader
from .rate_trader import create_rate_traders, update_rate_trader
import sys
sys.path.append("..")
from constants import *
import numpy as np

def get_agents_dict():
    return {
        'rate_trader': {
            'num': RATE_TRADER_NUM,
            'create': create_rate_traders,
            'update': update_rate_trader,
            'graph': {
                'eth': [],
                'noi': [],
            },
        },
        'price_trader': {
            'num': PRICE_TRADER_NUM,
            'create': create_price_traders,
            'update': update_price_trader,
            'graph': {
                'eth': [],
                'noi': [],
            },
        }
    }

nums = [RATE_TRADER_NUM, PRICE_TRADER_NUM]
total_sum = np.sum(nums)
names = ['rate_trader', 'price_trader']

class Agent_Utils:
    def __init__(self):
        self.nums = nums
        self.total_sum = total_sum
        self.names = names
        self.agents_dict = get_agents_dict()

    def calculate_all_amounts(self, previous_state):
        for i in range(len(names)):
            eth, noi = calculate_agents_amount(previous_state, names[i], nums[i])
            self.agents_dict[names[i]]['graph']['eth'].append(eth)
            self.agents_dict[names[i]]['graph']['noi'].append(noi)

    
    def create_agents(self, agents):
        for i in range(len(names)):
            self.agents_dict[names[i]]['create'](agents)

def calculate_agents_amount(previous_state, agent_name, num):
    eth_sum = 0
    noi_sum = 0
    for i in range(num):
        name = agent_name + str(i)
        agent = previous_state['agents'][name]
        eth_sum += agent.getEth()
        noi_sum += agent.getNoi()
        # if isinstance(agent, CDP_Holder) and agent.opened_position:
        #     noi_sum += agent.cdp_position.debt_noi
        #     eth_sum += agent.cdp_position.collateral_eth
    return eth_sum, noi_sum