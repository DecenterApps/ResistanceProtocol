from types import NoneType
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


def handle_open_cdp(event):
    e = json.loads(Web3.toJSON(event))
    print("=== CDP OPEN ===")
    print(e["args"]["_cdpIndex"])
    db.child("cdps").child(e["args"]["_user"]).child(e["args"]["_cdpIndex"]).set(
        {"cdpId": e["args"]["_cdpIndex"], "owner": e["args"]["_user"], "col": e["args"]["_amount"], "debt": 0, "sf": 0,"cr":0})


def handle_close_cdp(event):
    e = json.loads(Web3.toJSON(event))
    print("=== CDP CLOSE ===")
    print(e["args"]["_cdpIndex"])
    db.child("cdps").child(e["args"]["_user"]).child(
        e["args"]["_cdpIndex"]).remove()


def handle_mint(event):
    e = json.loads(Web3.toJSON(event))
    print("=== MINT ===")
    print(e["args"]["_cdpIndex"])
    oldEntery = db.child("cdps").child(
        e["args"]["_from"]).child(e["args"]["_cdpIndex"]).get()
    print(oldEntery.val()["debt"]+e["args"]["_amount"])
    db.child("cdps").child(e["args"]["_from"]).child(e["args"]["_cdpIndex"]).update(
        {"debt": oldEntery.val()["debt"]+e["args"]["_amount"]})


def handle_repay(event):
    e = json.loads(Web3.toJSON(event))
    print("=== MINT ===")
    print(e["args"]["_cdpIndex"])
    oldEntery = db.child("cdps").child(
        e["args"]["_from"]).child(e["args"]["_cdpIndex"]).get()
    db.child("cdps").child(e["args"]["_from"]).child(e["args"]["_cdpIndex"]).update(
        {"debt": oldEntery.val()["debt"]-e["args"]["_amount"]})

def handle_withdraw(event):
    e = json.loads(Web3.toJSON(event))
    print("=== WITHDRAW ===")
    print(e["args"]["_cdpIndex"])
    oldEntery = db.child("cdps").child(
        e["args"]["_user"]).child(e["args"]["_cdpIndex"]).get()
    db.child("cdps").child(e["args"]["_user"]).child(e["args"]["_cdpIndex"]).update(
        {"col": oldEntery.val()["col"]-e["args"]["_amount"]})

def handle_boost(event):
    e = json.loads(Web3.toJSON(event))
    print("=== WITHDRAW ===")
    print(e["args"]["_cdpIndex"])
    oldEntery = db.child("cdps").child(
        e["args"]["_user"]).child(e["args"]["_cdpIndex"]).get()
    db.child("cdps").child(e["args"]["_user"]).child(e["args"]["_cdpIndex"]).update(
        {"col": oldEntery.val()["col"]+e["args"]["_amount"]})


def calculate_sf(contract):
    all_users = db.child("cdps").get()
    try:
        for user in all_users.val().keys():
            user_cdps = db.child("cdps").child(user).get()
            if(type(user_cdps.val())==type([])):
                for cdp in user_cdps.val():
                    if(cdp!=None):
                        res=contract.functions.getOnlySF(int(cdp["cdpId"])).call()
                        db.child("cdps").child(user).child(cdp["cdpId"]).update(
                            {"sf": res})
            else:
                for cdpId in user_cdps.val().keys():
                    res=contract.functions.getOnlySF(int(cdpId)).call()
                    db.child("cdps").child(user).child(cdpId).update(
                        {"sf": res})
    except:
        return

def update_cr(contract):
    all_users = db.child("cdps").get()
    try:
        for user in all_users.val().keys():
            user_cdps = db.child("cdps").child(user).get()
            if(type(user_cdps.val())==type([])):
                for cdp in user_cdps.val():
                    if(cdp!=None):
                        res=contract.functions.getCR(int(cdp["cdpId"])).call()
                        db.child("cdps").child(user).child(cdp["cdpId"]).update(
                            {"cr": res})
            else:
                for cdpId in user_cdps.val().keys():
                    res=contract.functions.getCR(int(cdpId)).call()
                    db.child("cdps").child(user).child(cdpId).update(
                        {"cr": res})
    except:
        return


async def cdp_open_loop(event_filter, poll_interval):
    while True:
        for CDPOpen in event_filter.get_new_entries():
            handle_open_cdp(CDPOpen)
        await asyncio.sleep(poll_interval)


async def cdp_close_loop(event_filter, poll_interval):
    while True:
        for CDPClose in event_filter.get_new_entries():
            handle_close_cdp(CDPClose)
        await asyncio.sleep(poll_interval)


async def mint_loop(event_filter, poll_interval):
    while True:
        for MintCDP in event_filter.get_new_entries():
            handle_mint(MintCDP)
        await asyncio.sleep(poll_interval)


async def repay_loop(event_filter, poll_interval):
    while True:
        for RepayCDP in event_filter.get_new_entries():
            handle_repay(RepayCDP)
        await asyncio.sleep(poll_interval)

async def withdraw_loop(event_filter, poll_interval):
    while True:
        for WithdrawCollateral in event_filter.get_new_entries():
            handle_withdraw(WithdrawCollateral)
        await asyncio.sleep(poll_interval)

async def boost_loop(event_filter, poll_interval):
    while True:
        for TransferCollateral in event_filter.get_new_entries():
            handle_boost(TransferCollateral)
        await asyncio.sleep(poll_interval)

async def calculate_sf_loop(contract, poll_interval):
    while True:
        calculate_sf(contract)
        await asyncio.sleep(poll_interval)

async def update_cr_loop(contract, poll_interval):
    while True:
        update_cr(contract)
        await asyncio.sleep(poll_interval)


def main():
    contract = web3.eth.contract(
        address=CDPManager.ADDRESS_CDPMANAGER, abi=CDPManager.ABI_CDPMANAGER)
    event_filter_cdp_open = contract.events.CDPOpen.createFilter(
        fromBlock='latest')
    event_filter_cdp_close = contract.events.CDPClose.createFilter(
        fromBlock='latest')
    event_filter_mint = contract.events.MintCDP.createFilter(
        fromBlock='latest')
    event_filter_repay = contract.events.RepayCDP.createFilter(
        fromBlock='latest')
    event_filter_withdraw = contract.events.WithdrawCollateral.createFilter(
        fromBlock='latest')
    event_filter_boost = contract.events.TransferCollateral.createFilter(
        fromBlock='latest')
    #block_filter = web3.eth.filter('latest')
    # tx_filter = web3.eth.filter('pending')
    loop = asyncio.get_event_loop()
    try:
        loop.run_until_complete(
            asyncio.gather(
                cdp_open_loop(event_filter_cdp_open, 2),
                cdp_close_loop(event_filter_cdp_close, 2),
                mint_loop(event_filter_mint, 2),
                repay_loop(event_filter_repay, 2),
                withdraw_loop(event_filter_withdraw, 2),
                boost_loop(event_filter_boost, 2),
                calculate_sf_loop(contract, 10),
                update_cr_loop(contract, 10),
            ))
        # log_loop(block_filter, 2),
        # log_loop(tx_filter, 2)))
    finally:
        # close loop to free up system resources
        loop.close()


if __name__ == "__main__":
    main()
