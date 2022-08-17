from agents.holder.leverager import *
from agents.holder.safe_owner import *
from agents.trader.price_trader import *
from agents.trader.rate_trader import *
from agents.trader.whale_instant_price_setter import *
from agents.trader.whale_instant_rate_setter import *
from agents.trader.noi_truster import *
from agents.trader.random_trader import *
from agents.trader.whale_longterm_price_setter import *
from utils.constants import names as agent_names

def get_agents_dict():
    return {
        'rate_trader': {
            'num': RATE_TRADER.NUM,
            'create': create_rate_traders,
            'update': update_rate_trader,
            'graph': {
                'eth': [],
                'noi': [],
            },
        },
        'price_trader': {
            'num': PRICE_TRADER.NUM,
            'create': create_price_traders,
            'update': update_price_trader,
            'graph': {
                'eth': [],
                'noi': [],
            },
        },
        'leverager': {
            'num': LEVERAGER.NUM,
            'create': create_leveragers,
            'update': update_leverager,
            'graph': {
                'eth': [],
                'noi': [],
            },
        },
        'safe_owner': {
            'num': SAFE_OWNER.NUM,
            'create': create_safe_owners,
            'update': update_safe_owner,
            'graph': {
                'eth': [],
                'noi': [],
            },
        },
        'whale_instant_price_setter': {
            'num': WHALE_INSTANT_PRICE_SETTER.NUM,
            'create': create_whale_instant_price_setters,
            'update': update_whale_instant_price_setter,
            'graph': {
                'eth': [],
                'noi': [],
            },
        },
        'whale_instant_rate_setter': {
            'num': WHALE_INSTANT_RATE_SETTER.NUM,
            'create': create_whale_instant_rate_setters,
            'update': update_whale_instant_rate_setter,
            'graph': {
                'eth': [],
                'noi': [],
            },
        },
        'noi_truster': {
            'num': NOI_TRUSTER.NUM,
            'create': create_noi_trusters,
            'update': update_noi_truster,
            'graph': {
                'eth': [],
                'noi': [],
            },
        },
        'random_trader': {
            'num': RANDOM_TRADER.NUM,
            'create': create_random_traders,
            'update': update_random_trader,
            'graph': {
                'eth': [],
                'noi': [],
            },
        },
        'whale_longterm_price_setter': {
            'num': WHALE_LONGTERM_PRICE_SETTER.NUM,
            'create': create_whale_longterm_price_setters,
            'update': update_whale_longterm_price_setter,
            'graph': {
                'eth': [],
                'noi': [],
            },
        }
    }
names = agent_names

class Agent_Utils:
    def __init__(self):
        self.nums = nums
        self.names = names
        self.agents_dict = get_agents_dict()

    def calculate_all_amounts(self, agents):
        for i in range(len(names)):
            eth, noi = calculate_agents_amount(agents, names[i], nums[i])
            self.agents_dict[names[i]]['graph']['eth'].append(eth)
            self.agents_dict[names[i]]['graph']['noi'].append(noi)

    
    def create_agents(self, agents):
        for i in range(len(names)):
            self.agents_dict[names[i]]['create'](agents)

def calculate_agents_amount(agents, agent_name, num):
    eth_sum = 0
    noi_sum = 0
    for i in range(num):
        name = agent_name + str(i)
        agent = agents[name]
        eth_sum += agent.eth
        noi_sum += agent.noi
        if isinstance(agent, CDP_Holder) and agent.opened_position:
            noi_sum += agent.cdp_position.debt_noi
            eth_sum += agent.cdp_position.collateral_eth
    return eth_sum, noi_sum