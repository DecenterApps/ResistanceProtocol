from web3 import Web3
from apscheduler.schedulers.background import BackgroundScheduler
import asyncio
import sys
import MarketTwapFeed
import Treasury


updateScheduleId = "1"
baseUpdateInterval = 5  # seconds
delay = 5

eventLoopInterval = 2

minimumBalance = 100000000000000000 # 0.1 ETH

# account_from = {
#     'address': sys.argv[0],
#     'private_key': sys.argv[1],
# }

account_from = {
    'address': '0xCb6886243066f4387D2e8B768bEaEeFc70F02467',
    'private_key': '0xf3e7f5e73b07bff30c33ff891ade437061e86be13bbc1c5fe0438e807f704979',
}


scheduler = BackgroundScheduler()
web3 = Web3(Web3.HTTPProvider())

# setup contracts
marketTwapFeedContract = web3.eth.contract(
    address=MarketTwapFeed.ADDRESS_MARKETTWAPFEED, abi=MarketTwapFeed.ABI_MARKETTWAPFEED)
treasuryContract = web3.eth.contract(
    address=Treasury.ADDRESS_TREASURY, abi=Treasury.ABI_TREASURY)


def updateLoop():
    web3.provider.make_request("evm_increaseTime", [3660])
    
    print(f'Attempting to send tx...')
    try:
        update_tx = marketTwapFeedContract.functions.update().buildTransaction(
            {
                'from': account_from['address'],
                'nonce': web3.eth.get_transaction_count(account_from['address']),
            }
        )

        tx_create = web3.eth.account.sign_transaction(
            update_tx, account_from['private_key'])

        tx_hash = web3.eth.send_raw_transaction(tx_create.rawTransaction)

        tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        print(f'Tx successful with hash: { tx_receipt.transactionHash.hex() }')
    except:
        print(f'Tx failed')

    balance = web3.eth.get_balance(account_from['address'])

    print(f'Bot Wallet Balance: {web3.fromWei(balance, "ether")} ETH')

    if(balance < minimumBalance):
        fetchFunds()


def fetchFunds():
    print("fetching funds...")
    try:
        update_tx = treasuryContract.functions.getFunds(100000000000000000).buildTransaction(
            {
                'from': account_from['address'],
                'nonce': web3.eth.get_transaction_count(account_from['address']),
            }
        )

        tx_create = web3.eth.account.sign_transaction(
            update_tx, account_from['private_key'])

        tx_hash = web3.eth.send_raw_transaction(tx_create.rawTransaction)

        tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        print(f'Fetching successful with hash: { tx_receipt.transactionHash.hex() }')
    except:
        print(f'Fetching failed')


def handle_event(event):
    # print(Web3.toJSON(event))
    if(account_from['address'] != event['args']['from']):
        print("Contract was updated by an external party!")
        scheduler.remove_job(updateScheduleId)
        scheduler.add_job(lambda: updateLoop(), trigger="interval",
                          seconds=baseUpdateInterval + delay, id=updateScheduleId)


async def log_loop(event_filter, poll_interval):
    while True:
        for UpdateValues in event_filter.get_new_entries():
            handle_event(UpdateValues)
        await asyncio.sleep(poll_interval)


def setupSchedulerLoop():

    scheduler.add_job(lambda: updateLoop(), trigger="interval",
                      seconds=baseUpdateInterval + delay, id=updateScheduleId)
    scheduler.start()


def setupEventLoop():
    event_filter = marketTwapFeedContract.events.UpdateValues.createFilter(
        fromBlock='latest')

    loop = asyncio.get_event_loop()
    try:
        loop.run_until_complete(
            asyncio.gather(
                log_loop(event_filter, eventLoopInterval)))
    finally:
        loop.close()


if __name__ == "__main__":
    setupSchedulerLoop()
    setupEventLoop()
