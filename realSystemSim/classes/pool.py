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

    def put_eth_get_noi(self, eth_add, trader):
        tx = ExchangePool.functions.putEthGetNoi().buildTransaction(
            {
                'from': trader.address,
                'nonce': web3.eth.get_transaction_count(trader.address),
                "value": web3.toWei(eth_add, "ether"),
            }
        )
        send_tx(tx, trader.private_key, trader.name, True)

    def put_noi_get_eth(self, noi_add, trader):
        approveTx = ExchangePool.functions.approve(ExchangePool.address, web3.toWei(noi_add)).buildTransaction(
            {
                'from': trader.address,
                'nonce': web3.eth.get_transaction_count(trader.address),
            }
        )
        send_tx(approveTx, trader.private_key, trader.name, True)

        tx = ExchangePool.functions.putNoiGetEth(web3.toWei(noi_add)).buildTransaction(
            {
                'from': trader.address,
                'nonce': web3.eth.get_transaction_count(trader.address),
            }
        )
        send_tx(tx, trader.private_key, trader.name, True)

    # given the resulting eth, calculates how much noi should agent put into the pool

    def how_much_noi_for_eth(self, eth_add) -> float:
        return web3.fromWei(ExchangePool.functions.howMuchNoiForEth(eth_add).call())

    # given the resulting noi, calculates how much eth should agent put into the pool
    def how_much_eth_for_noi(self, noi_add) -> float:
        return web3.fromWei(ExchangePool.functions.howMuchEthForNoi(noi_add).call())
