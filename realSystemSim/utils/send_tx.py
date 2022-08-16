from web3 import Web3

web3 = Web3(Web3.HTTPProvider())


def print_receipt(receipt):
    # print(receipt)
    print('form: ' + receipt['from'])
    print('to: ' + receipt['to'])
    print('blockNumber: ' + str(receipt['blockNumber']))


def send_tx(tx, private_key):
    print('=====================================')
    try:
        tx_create = web3.eth.account.sign_transaction(
            tx, private_key)

        tx_hash = web3.eth.send_raw_transaction(tx_create.rawTransaction)

        tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        print_receipt(tx_receipt)
    except:
        print(f'Tx failed')
    print('=====================================')
