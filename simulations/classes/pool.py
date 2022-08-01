from classes.eth_data import ETHData
from typing import Tuple

NUM_BATCHES = 1

class Pool:
    def __init__(self, eth_amount:float, noi_amount:float):
        self.noi = noi_amount
        self.eth = eth_amount
    
    def change_pool(self, eth_add, noi_add, price_station, eth_data: ETHData):
        self.eth += eth_add
        self.noi += noi_add
        price_station.update_mp(self, eth_data)
    
    # returns eth and noi amount of how much the pool has been changed(absolute value)
    def put_eth_get_noi(self, eth_add, price_station, eth_data: ETHData) -> Tuple[float, float]:
        noi_sum = 0
        eth_val = eth_add / NUM_BATCHES
        for i in range(NUM_BATCHES):
            #value of one noi in eth
            one_noi = self.eth / self.noi

            noi_amount = eth_val / one_noi
            if self.noi - noi_amount <= 0:
                print("not enough noi")
                return i*eth_val, noi_sum
            
            noi_sum += noi_amount

            self.change_pool(eth_val, -noi_amount, price_station, eth_data)
        return eth_add, noi_sum

    # returns eth and noi amount of how much the pool has been changed(absolute value)
    def put_noi_get_eth(self, noi_add, price_station, eth_data: ETHData) -> Tuple[float, float]:
        eth_sum = 0
        noi_val = noi_add / NUM_BATCHES
        for i in range(NUM_BATCHES):
            #value of one noi in eth
            one_eth = self.noi / self.eth
            
            eth_amount = noi_val / one_eth
            if self.eth - eth_amount <= 0:
                print("not enough eth")
                return eth_sum, i * noi_val
            
            eth_sum += eth_amount

            self.change_pool(-eth_amount, noi_val, price_station, eth_data)
        return eth_sum, noi_add