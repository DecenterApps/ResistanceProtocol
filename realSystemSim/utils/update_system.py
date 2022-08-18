from web3 import Web3
import sys
sys.path.append('../../')
sys.path.append('../')
from accounts import *
from backend.MarketTwapFeed import *
from accounts import *

web3 = Web3(Web3.HTTPProvider())

# setup contracts
marketTwapFeedContract = web3.eth.contract(
    address=ADDRESS_MARKETTWAPFEED, abi=ABI_MARKETTWAPFEED)


def updateSystem():
    try:
        update_tx = marketTwapFeedContract.functions.update().buildTransaction(
            {
                'from': accounts[99]['account'],
                'nonce': web3.eth.get_transaction_count(accounts[99]['account']),
            }
        )

        tx_create = web3.eth.account.sign_transaction(
            update_tx, accounts[99]['private_key'])

        tx_hash = web3.eth.send_raw_transaction(tx_create.rawTransaction)
    except:
        print(f'Failed to update loop!')