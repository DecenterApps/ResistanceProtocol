from classes.ext_data import ExtData
from typing import Tuple

NUM_BATCHES = 1

class Pool:
    def __init__(self, eth_amount:float, noi_amount:float):
        self.noi = noi_amount
        self.eth = eth_amount
        self.cnt = 0
    
    # returns eth and noi amount of how much the pool has been changed(absolute value)
    def put_eth_get_noi(self, eth_add, price_station, ext_data: ExtData) -> Tuple[float, float]:
        if eth_add < 0:
            assert False, "eth_add must be positive"
        noi_sum = 0
        eth_val = eth_add / NUM_BATCHES
        for i in range(NUM_BATCHES):

            self.eth += eth_val
            noi_val = self.noi / self.eth * eth_val
            self.noi -= noi_val
            noi_sum += noi_val

        price_station.update_mp(self, ext_data)
        self.cnt += 1
        return eth_add, noi_sum

    # returns eth and noi amount of how much the pool has been changed(absolute value)
    def put_noi_get_eth(self, noi_add, price_station, ext_data: ExtData) -> Tuple[float, float]:
        if noi_add < 0:
            assert False, "noi_add must be positive"
        eth_sum = 0
        noi_val = noi_add / NUM_BATCHES
        for i in range(NUM_BATCHES):

            self.noi += noi_val
            eth_val = self.eth / self.noi * noi_val
            self.eth -= eth_val
            eth_sum += eth_val

        price_station.update_mp(self, ext_data)
        self.cnt += 1
        return eth_sum, noi_add
    
    #given the resulting eth, calculates how much noi should agent put into the pool
    def how_much_noi_for_eth(self, eth_add) -> float:
        if eth_add >= self.eth:
            print('nema para u poolu')
            return 0
        noi_val = self.noi * eth_add / (self.eth - eth_add)
        return noi_val

    #given the resulting noi, calculates how much eth should agent put into the pool
    def how_much_eth_for_noi(self, noi_add) -> float:
        if noi_add >= self.noi:
            print('nema para u poolu')
            return 0
        eth_val = self.eth * noi_add / (self.noi - noi_add)
        return eth_val