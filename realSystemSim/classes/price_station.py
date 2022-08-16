from classes.ext_data import ExtData
from classes.pool import Pool
from web3 import Web3

import sys
sys.path.append('../../')
sys.path.append('../')
from backend.ExchangePoolSimMock import *
from backend.MarketTwapFeed import *
from backend.RateSetter import *

web3 = Web3(Web3.HTTPProvider())

ExchangePool = web3.eth.contract(
    address=ADDRESS_EXCHANGEPOOLSIMMOCK, abi=ABI_EXCHANGEPOOLSIMMOCK)
marketTwapFeed = web3.eth.contract(
    address=ADDRESS_MARKETTWAPFEED, abi=ABI_MARKETTWAPFEED)
rateSetter = web3.eth.contract(
    address=ADDRESS_RATESETTER, abi=ABI_RATESETTER)


class PriceStation:
    def __init__(self, graph):
        # accumulated_leak_stable
        self.accumulated_leak_stable = 0.999
        # accumulated_leak_cpi
        self.accumulated_leak_cpi = 0.999
        self.graph = graph
        self.market_sum = 0
        self.num_steps = 0

    def getMp(self):
        rez = ExchangePool.functions.getNoiMarketPrice().call()
        return web3.fromWei(ExchangePool.functions.getNoiMarketPrice().call(), 'ether')

    def getRp(self):
        return web3.fromWei(web3.fromWei(rateSetter.functions.getRedemptionPrice().call(), 'ether'), 'ether')

    def getRr(self):
        return web3.fromWei(web3.fromWei(rateSetter.functions.getRedemptionPrice().call(), 'ether'), 'ether')

    def getMarketTwap(self):
        return rateSetter.functions.getTwap().call()/1e10

    # returns the value of noi in usd with market price
    # input: amount of noi
    # output: dollar value of noi with market price
    def get_mp_value_for_amount(self, noi_amount):
        return noi_amount * self.getMp()

    # returns the value of noi in usd with redemption price
    # input: amount of noi
    # output: dollar value of noi with redemption price
    def get_rp_value_for_amount(self, noi_amount):
        return noi_amount * self.getRp()

    # input: amount of dollars
    # output: amount of noi that can be purchased with redemption_price
    def get_amount_of_noi_for_rp_value(self, dollar_amount):
        return dollar_amount / self.getRp()

    # input: amount of dollars
    # output: amount of noi that can be purchased with market_price
    def get_amount_of_noi_for_mp_value(self, dollar_amount):
        return dollar_amount / self.getMp()
