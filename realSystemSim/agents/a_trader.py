from email.headerregistry import Address
from web3 import Web3
from abc import ABC, abstractmethod
import random
import sys
sys.path.append('../../')
sys.path.append('../')
from backend.NOI import *
sys.path.append("..")
from classes.pool import Pool
from classes.price_station import PriceStation
from decimal import *

web3 = Web3(Web3.HTTPProvider())

NoiContract = web3.eth.contract(address=ADDRESS_NOI, abi=ABI_NOI)

class Trader(ABC):
    def __init__(self, name, address, private_key):
        self.name = name
        self.address = address
        self.private_key = private_key
        self.perc_amount = 1

    @abstractmethod
    def terminate_condition(self, price_station: PriceStation):
        pass

    @abstractmethod
    def buy_noi_condition(self, price_station: PriceStation):
        pass

    @abstractmethod
    def buy_eth_condition(self, price_station: PriceStation):
        pass

    def getEth(self):
        return web3.fromWei(web3.eth.get_balance(self.address), 'ether')

    def getNoi(self):
        return web3.fromWei(NoiContract.functions.balanceOf(self.address).call(), 'ether')


def update_trader(agents, price_station: PriceStation, pool: Pool, literal_name, CONST):
    num = CONST.ACCOUNTS_END - CONST.ACCOUNTS_START
    if num == 0:
        return
    i = random.randint(0, num - 1)

    name = literal_name + str(i)
    trader: Trader = agents[name]
    
    if trader.terminate_condition(price_station):
        return
    
    if trader.buy_noi_condition(price_station):
        # buy noi, sell eth
        pool.put_eth_get_noi(Decimal(trader.getEth())*Decimal(trader.perc_amount), trader)
    
    elif trader.buy_eth_condition(price_station):
        # buy eth, sell noi
        pool.put_noi_get_eth(trader.getNoi()*trader.perc_amount, trader)

