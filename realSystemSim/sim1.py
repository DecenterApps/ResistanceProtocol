
from audioop import add
from accounts import *
from utils.send_tx import send_tx
import pandas as pd
import numpy as np
from classes.graph.a_graph import *
from classes.price_station import *
from classes.graph.timestamp_graph import Timestamp_Graph
from classes.graph.full_graph import Full_Graph
from constants import *
from agents.agent_utils import Agent_Utils
from utils.util_functions import get_data_from_csv
from utils.exchange import *
from agents.price_trader import *
from agents.rate_trader import *
from tqdm import tqdm
from utils.update_system import *
import matplotlib.pyplot as plt
import sys
sys.path.append('../../')
sys.path.append('../')
from backend.EthPriceFeedMock import *
from backend.RateSetter import *
from backend.ExchangePoolSimMock import *
from backend.MarketTwapFeed import *
from backend.EthTwapFeed import *
pool = Pool()

agent_utils: Agent_Utils = Agent_Utils()

timestamp_graph = Timestamp_Graph(agent_utils)
full_graph = Full_Graph()

price_station = PriceStation(full_graph)
ext_data = ExtData()
agents = dict()

agent_utils.create_agents(agents)

genesis_states = {'agents': agents}

ext_data.eth_dollar = get_data_from_csv('dataset/twap_eth_dollar.csv')
ext_data.cpi_value = get_data_from_csv('dataset/cpi_value.csv')

EthPriceFeedMock = web3.eth.contract(
    address=ADDRESS_ETHPRICEFEEDMOCK, abi=ABI_ETHPRICEFEEDMOCK)

RateSetter = web3.eth.contract(address=ADDRESS_RATESETTER, abi=ABI_RATESETTER)

ExchangePool = web3.eth.contract(
    address=ADDRESS_EXCHANGEPOOLSIMMOCK, abi=ABI_EXCHANGEPOOLSIMMOCK)

marketTwapFeed = web3.eth.contract(address=ADDRESS_MARKETTWAPFEED, abi=ABI_MARKETTWAPFEED)
ethTwapFeed = web3.eth.contract(address=ADDRESS_ETHTWAPFEED, abi=ABI_ETHTWAPFEED)

br = [0]*len(agent_utils.nums)

mp_arr = []
mp_twap_arr = []

rp_arr = []
rr_arr = []

def getValues():
    mp_contract = marketTwapFeed.functions.getMarketPrice().call()/1e8
    mp_pool = ExchangePool.functions.getNoiMarketPrice().call()/1e8

    mp_twap = marketTwapFeed.functions.getTwap().call()
    eth_twap = ethTwapFeed.functions.getTwap().call()

    rp = RateSetter.functions.getRedemptionPrice().call()/1e27
    rr = RateSetter.functions.getRedemptionRate().call()/1e27

    print('================================')
    print('New Eth Price: ' + str(ext_data.get_eth_value()))
    # print('Market Price From Contract: ' + str(mp_contract))
    print('Market Price: ' + str(mp_pool))
    print('Redemption Price: ' + str(rp))
    print('Redemption Rate: ' + str(rr))
    print('================================')
    print('Market Twap Val: ' + str(mp_twap/1e8))
    print('Eth Twap Val: ' + str(eth_twap/1e8))
    print('================================')

def plot_graphs(timestamp_graph, full_graph, br):
    global ext_data
    full_graph.plot(ext_data)
    timestamp_graph.plot(ext_data)

pbar = tqdm(total=SIMULATION_TIMESTAMPS)

def update_agents(timestamp):
    global br, agents, price_station

    web3.provider.make_request("evm_increaseTime", [3660])

    ext_data.set_parameters(timestamp)

    tx = EthPriceFeedMock.functions.setPrice(int(ext_data.get_eth_value()*1e8)).buildTransaction(
        {
            'from': accounts[99]['account'],
            'nonce': web3.eth.get_transaction_count(accounts[99]['account']),
        }
    )
    getValues()
    send_tx(tx, accounts[99]['private_key'])
    updateSystem()

    mp = ExchangePool.functions.getNoiMarketPrice().call()/1e8
    mp_twap = marketTwapFeed.functions.getTwap().call()/1e8
    rp = RateSetter.functions.getRedemptionPrice().call()/1e27
    rr = RateSetter.functions.getRedemptionRate().call()/1e27

    mp_arr.append(mp)
    mp_twap_arr.append(mp_twap)
    rp_arr.append(rp)
    # rr_arr.append(rr)
    plot_graph()

    # ext_data.set_fresh_eth_prediction()
    timestamp_graph.add_to_graph(price_station, pool, agents)

    names = agent_utils.names
    nums = agent_utils.nums
    total_sum = agent_utils.total_sum

    # update_whale_longterm_price_setter(agents, price_station, pool, ext_data)

    for i in range(agent_utils.total_sum // 2):
        p = np.random.random()
        if i % 2 == 0:
            if RATE_TRADER_NUM + PRICE_TRADER_NUM > 0 and p < RATE_TRADER_NUM / (RATE_TRADER_NUM + PRICE_TRADER_NUM):

                update_rate_trader(agents, price_station, pool, ext_data)
            else:
                update_price_trader(agents, price_station, pool, ext_data)
            continue
        for i in range(len(nums)):
            if p < nums[i] / total_sum:
                agent_utils.agents_dict[names[i]]['update'](
                    agents, price_station, pool, ext_data)
                br[i] += 1
                break
            p -= nums[i] / total_sum

    plot_graphs(full_graph, timestamp_graph, br)

    pbar.update(1)


def plot_graph():
    figure, axis = plt.subplots(1, 1, figsize=(15,8))
    axis.plot(mp_arr)
    axis.plot(mp_twap_arr)
    axis.plot(rp_arr)
    axis.plot(rr_arr)
    axis.legend(['market price', 'market twap', 'redemption price', 'redemption rate'])
    axis.set_title("Market price, Market Twap, Redemption price, Redemption rate")

    plt.tight_layout()

    plt.savefig('plot.png')
    figure.clear()
    plt.close('all')

full_graph.plot(ext_data)
timestamp_graph.plot(ext_data)

print(br)

def setupTwap():
    print("Setting up twap...")
    for i in range(24):
            web3.provider.make_request("evm_increaseTime", [3660])

            ext_data.set_parameters(i)

            tx = EthPriceFeedMock.functions.setPrice(int(ext_data.get_eth_value()*1e8)).buildTransaction(
                {
                    'from': accounts[99]['account'],
                    'nonce': web3.eth.get_transaction_count(accounts[99]['account']),
                }
            )
            # getValues()
            send_tx(tx, accounts[99]['private_key'])
            updateSystem()

def main():
    # setupTwap()
    for i in range(SIMULATION_TIMESTAMPS):
        update_agents(i)
    pbar.close()

if __name__ == "__main__":
    main()