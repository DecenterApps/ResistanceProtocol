from dotenv import load_dotenv
import os
import pyrebase
from web3 import Web3
import asyncio
import CDPManager
import json

load_dotenv()

web3 = Web3(Web3.HTTPProvider())

FIREBASE_API = os.getenv('FIREBASE_API')

firebaseConfig = {
    'apiKey': FIREBASE_API,
    'authDomain': "resistanceprotocol.firebaseapp.com",
    'databaseURL': "https://resistanceprotocol-default-rtdb.europe-west1.firebasedatabase.app",
    'projectId': "resistanceprotocol",
    'storageBucket': "resistanceprotocol.appspot.com",
    'messagingSenderId': "384010337601",
    'appId': "1:384010337601:web:ab300045fe9139d28cb5c0",
    "serviceAccount": "../backend/service.json",
}

firebase = pyrebase.initialize_app(firebaseConfig)
db = firebase.database()

def handle_event(event):
    e=json.loads(Web3.toJSON(event))
    print(e["args"]["_cdpId"])
    db.child("cdps").child(e["args"]["_user"]).child(e["args"]["_cdpId"]).set({"cdpId":e["args"]["_cdpId"],"owner":e["args"]["_user"],"col": e["args"]["_value"],"debt":0})


async def log_loop(event_filter, poll_interval):
    while True:
        print("Test")
        for CDPOpen in event_filter.get_new_entries():
            handle_event(CDPOpen)
        await asyncio.sleep(poll_interval)


def main():
    contract = web3.eth.contract(address=CDPManager.ADDRESS_CDPMANAGER, abi=CDPManager.ABI_CDPMANAGER)
    event_filter = contract.events.CDPOpen.createFilter(fromBlock='latest')
    #block_filter = web3.eth.filter('latest')
    # tx_filter = web3.eth.filter('pending')
    loop = asyncio.get_event_loop()
    try:
        loop.run_until_complete(
            asyncio.gather(
                log_loop(event_filter, 2)))
                # log_loop(block_filter, 2),
                # log_loop(tx_filter, 2)))
    finally:
        # close loop to free up system resources
        loop.close()


if __name__ == "__main__":
    main()
