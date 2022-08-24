from asyncio import constants
from web3 import Web3
from typing import Tuple

from classes.ext_data import ExtData

import sys
sys.path.append('../../')
sys.path.append('../')
from utils.send_tx import send_tx
from backend.ExchangePoolSimMock import *

from backend.NOI import *

NUM_BATCHES = 1

web3 = Web3(Web3.HTTPProvider())

ExchangePool = web3.eth.contract(
    address=ADDRESS_EXCHANGEPOOLSIMMOCK, abi=ABI_EXCHANGEPOOLSIMMOCK)
NoiContract = web3.eth.contract(address=ADDRESS_NOI, abi=ABI_NOI)

class Pool:
    def __init__(self):
        pass

    def put_eth_get_noi(self, eth_add, name, address, private_key):
        print(name + ' buying NOI...')
        print('with eth amount: ', eth_add)
        try:
            tx = ExchangePool.functions.putEthGetNoi().buildTransaction(
                {
                    'from': address,
                    'nonce': web3.eth.get_transaction_count(address),
                    "value": web3.toWei(eth_add, "ether"),
                }
            )
            send_tx(tx, private_key)
        except Exception as e:
            print('Tx put_eth_get_noi failed!')
            print(e)

    def put_noi_get_eth(self, noi_add, name, address, private_key):
        print(name + ' selling NOI...')
        print('amount: ', noi_add)
        try:
            approveTx = NoiContract.functions.approve(ExchangePool.address, web3.toWei(noi_add, 'ether')).buildTransaction(
                {
                    'from': address,
                    'nonce': web3.eth.get_transaction_count(address),
                }
            )
            send_tx(approveTx, private_key)

            tx = ExchangePool.functions.putNoiGetEth(web3.toWei(noi_add, 'ether')).buildTransaction(
                {
                    'from': address,
                    'nonce': web3.eth.get_transaction_count(address),
                }
            )
            send_tx(tx, private_key)
        except Exception as e:
            print('Tx put_noi_get_eth failed!')
            print(e)

    # given the resulting eth, calculates how much noi should agent put into the pool

    def how_much_noi_for_eth(self, eth_add) -> float:
        return web3.fromWei(ExchangePool.functions.howMuchNoiForEth(eth_add).call(), 'ether')

    # given the resulting noi, calculates how much eth should agent put into the pool
    def how_much_eth_for_noi(self, noi_add) -> float:
        return web3.fromWei(ExchangePool.functions.howMuchEthForNoi(noi_add).call(), 'ether')

    def getEth(self):
        return web3.fromWei(web3.eth.get_balance(ExchangePool.address), 'ether')

    def getNoi(self):
        return web3.fromWei(NoiContract.functions.balanceOf(ExchangePool.address).call(), 'ether')
