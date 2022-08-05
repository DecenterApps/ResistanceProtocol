from agents.holder.leverager import *
from agents.holder.safe_owner import *
from agents.trader.price_trader import *
from agents.trader.rate_trader import *
from agents.trader.whale_instant_price_setter import *
from agents.trader.whale_instant_rate_setter import *
from utils.constants import *

def get_agents_dict():
    return {
        'rate_trader': {
            'num': RATE_TRADER.NUM,
            'create': create_rate_traders,
            'update': update_rate_trader,
            'graph': [],
        },
        'price_trader': {
            'num': PRICE_TRADER.NUM,
            'create': create_price_traders,
            'update': update_price_trader,
            'graph': [],
        },
        'leverager': {
            'num': LEVERAGER.NUM,
            'create': create_leveragers,
            'update': update_leverager,
            'graph': [],
        },
        'safe_owner': {
            'num': SAFE_OWNER.NUM,
            'create': create_safe_owners,
            'update': update_safe_owner,
            'graph': [],
        },
        'whale_instant_price_setter': {
            'num': WHALE_INSTANT_PRICE_SETTER.NUM,
            'create': create_whale_instant_price_setters,
            'update': update_whale_instant_price_setter,
            'graph': [],
        },
        'whale_instant_rate_setter': {
            'num': WHALE_INSTANT_RATE_SETTER.NUM,
            'create': create_whale_instant_rate_setters,
            'update': update_whale_instant_rate_setter,
            'graph': [],
        },
    }

nums = [RATE_TRADER.NUM, PRICE_TRADER.NUM, LEVERAGER.NUM, SAFE_OWNER.NUM, WHALE_INSTANT_PRICE_SETTER.NUM, WHALE_INSTANT_RATE_SETTER.NUM]
total_sum = np.sum(nums)
names = ['rate_trader', 'price_trader', 'leverager', 'safe_owner', 'whale_instant_price_setter', 'whale_instant_rate_setter']

class Agent_Utils:
    def __init__(self):
        self.nums = nums
        self.total_sum = total_sum
        self.names = names
        self.agents_dict = get_agents_dict()

    def calculate_all_amounts(self, previous_state):
        for i in range(len(names)):
            eth = calculate_agents_amount(previous_state, names[i], nums[i])
            self.agents_dict[names[i]]['graph'].append(eth)
    
    def create_agents(self, agents):
        for i in range(len(names)):
            self.agents_dict[names[i]]['create'](agents)

def calculate_agents_amount(previous_state, agent_name, num):
    eth_sum = 0
    for i in range(num):
        name = agent_name + str(i)
        agent = previous_state['agents'][name]
        eth_sum += agent.eth
        if isinstance(agent, CDP_Holder) and agent.opened_position:
            eth_sum += agent.cdp_position.collateral_eth

    return eth_sum

