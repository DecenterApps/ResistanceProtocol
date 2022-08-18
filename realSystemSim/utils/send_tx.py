from web3 import Web3

web3 = Web3(Web3.HTTPProvider())


def print_receipt(tx, receipt):
    # print(receipt)
    # print(tx)
    print('form: ' + receipt['from'])
    print('to: ' + receipt['to'])
    print('value: ' + str(web3.fromWei(tx['value'], 'ether')))
    print('blockNumber: ' + str(receipt['blockNumber']))


def send_tx(tx, private_key, message, log):
    print('=====================================')
    print(message)
    try:
        tx_create = web3.eth.account.sign_transaction(
            tx, private_key)

        tx_hash = web3.eth.send_raw_transaction(tx_create.rawTransaction)

        tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        if(log):
            print_receipt(tx, tx_receipt)
    except:
        print(f'Tx failed')
    print('=====================================')
