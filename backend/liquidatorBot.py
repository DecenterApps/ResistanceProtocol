from asyncio import constants
from distutils import dep_util
from logging import lastResort
from web3 import Web3
from apscheduler.schedulers.background import BackgroundScheduler, BlockingScheduler
import operator
import Liquidator
import CDPManager
import RateSetter
import NOI
import MarketTwapFeed

eventLoopInterval = 2

minimumBalance = 100000000000000000  # 0.1 ETH

FeeChangeRate = 0.02

lastBlock = -1

CDPList = {}

# account_from = {
#     'address': sys.argv[0],
#     'private_key': sys.argv[1],
# }

account_from = {
    'address': '0xe429D6Dd9297B9918Eb466E46b6Dc60a6aFcfd8b',
    'private_key': '0xde17c30d0392dc61a93e6258f890b568e9e79d7e5f63c0aa8cbb4b20d6430805',
}

scheduler = BackgroundScheduler()
web3 = Web3(Web3.HTTPProvider())

# setup contracts
noiContract = web3.eth.contract(address=NOI.ADDRESS_NOI, abi=NOI.ABI_NOI)
liquidatorContract = web3.eth.contract(
    address=Liquidator.ADDRESS_LIQUIDATOR, abi=Liquidator.ABI_LIQUIDATOR)

cdpManagerContract = web3.eth.contract(
    address=CDPManager.ADDRESS_CDPMANAGER, abi=CDPManager.ABI_CDPMANAGER)

marketTwapFeed = web3.eth.contract(
    address=MarketTwapFeed.ADDRESS_MARKETTWAPFEED, abi=MarketTwapFeed.ABI_MARKETTWAPFEED)


def liquidateCDP(cdpIndex, amount):
    print("Approving Coins...")
    try:
        approve_tx = noiContract.functions.approve(cdpManagerContract.address, amount).buildTransaction(
            {
                'from': account_from['address'],
                'nonce': web3.eth.get_transaction_count(account_from['address']),
            }
        )
        tx_signed = web3.eth.account.sign_transaction(
            approve_tx, account_from['private_key'])
        tx_hash = web3.eth.send_raw_transaction(tx_signed.rawTransaction)
        tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        print(
            f'Approving successful with hash: {tx_receipt.transactionHash.hex()}')
    except:
        print('Failed to approve amount!')
        return

    print(f'Liquidating CDP...')
    try:
        liquidate_tx = liquidatorContract.functions.liquidateCDP(cdpIndex).buildTransaction(
            {
                'from': account_from['address'],
                'nonce': web3.eth.get_transaction_count(account_from['address']),
            }
        )

        tx_signed = web3.eth.account.sign_transaction(
            liquidate_tx, account_from['private_key'])

        tx_hash = web3.eth.send_raw_transaction(tx_signed.rawTransaction)

        tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        print(
            f'Liquidation successful with hash: { tx_receipt.transactionHash.hex() }')
        balance = web3.eth.get_balance(account_from['address'])
        print(f'New Bot Wallet Balance: {web3.fromWei(balance, "ether")} ETH')
    except:
        print('Tx failed')


def checkCDPsForLiquidation():
    global FeeChangeRate
    print("Checking CDPs for liquidation...")
    for cdpKey in CDPList:
        cdpIndex = CDPList[cdpKey]['_cdpIndex']
        status = liquidatorContract.functions.isEligibleForLiquidation(
            cdpIndex).call()
        if status == True:
            print("Liquidating cdp with index " + str(cdpIndex))
            debtToPay = cdpManagerContract.functions.getDebtWithSF(
                cdpIndex).call()
            print(debtToPay)
            debtToPay = int(debtToPay) + int(debtToPay*FeeChangeRate)
            print(debtToPay)
            liquidateCDP(cdpIndex, debtToPay)


def fetchEvents():
    global lastBlock

    if lastBlock == web3.eth.blockNumber:
        return

    lastBlock += 1

    CDPOpenEvent = cdpManagerContract.events.CDPOpen.createFilter(
        fromBlock=lastBlock)
    CDPCloseEvent = cdpManagerContract.events.CDPClose.createFilter(
        fromBlock=lastBlock)
    UpdateValuesEvent = marketTwapFeed.events.UpdateValues.createFilter(
        fromBlock=lastBlock)

    events = CDPOpenEvent.get_all_entries() + CDPCloseEvent.get_all_entries() + \
        UpdateValuesEvent.get_all_entries()

    eventsSorted = sorted(events, key=lambda d: d['blockNumber'])

    for event in eventsSorted:
        lastBlock = event['blockNumber']
        # print(Web3.toJSON(event))
        if event['event'] == 'CDPOpen':
            indx = event['args']['_cdpIndex']
            print(event['event'] + ' with index ' + str(indx))
            CDPList[indx] = event['args']
            # print(CDPList[indx])
        elif event['event'] == 'CDPClose':
            indx = event['args']['_cdpIndex']
            print(event['event'] + ' with index ' + str(indx))
            # print(CDPList[indx])
            del CDPList[indx]
        elif event['event'] == 'UpdateValues':
            checkCDPsForLiquidation()


if __name__ == "__main__":

    scheduler = BlockingScheduler()
    scheduler.add_job(func=fetchEvents, trigger="interval",
                      seconds=eventLoopInterval)
    scheduler.start()
