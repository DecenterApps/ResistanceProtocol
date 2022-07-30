from classes.eth_data import ETHData

NUM_BATCHES = 1

class Pool:
    def __init__(self, eth_amount:float, noi_amount:float):
        self.noi = noi_amount
        self.eth = eth_amount
    
    def change_pool(self, substep, previous_state, eth_add, noi_add, price_station, eth_data: ETHData):
        self.eth += eth_add
        self.noi += noi_add
        price_station.update_mp(substep, previous_state, self, eth_data)
    
    def put_eth_get_noi(self, substep, previous_state, eth_add, price_station, eth_data: ETHData):
        noi_sum = 0
        eth_val = eth_add / NUM_BATCHES
        for _ in range(NUM_BATCHES):
            #value of one noi in eth
            one_noi = self.eth / self.noi
            noi_amount = eth_val / one_noi
            noi_sum += noi_amount
            self.change_pool(substep, previous_state, eth_val, -noi_amount, price_station, eth_data)
        return noi_sum


    def put_noi_get_eth(self, substep, previous_state, noi_add, price_station, eth_data: ETHData):
        eth_sum = 0
        noi_val = noi_add / NUM_BATCHES
        for _ in range(NUM_BATCHES):
            #value of one noi in eth
            one_eth = self.noi / self.eth
            eth_amount = noi_val / one_eth
            eth_sum += eth_amount
            self.change_pool(substep, previous_state, -eth_amount, noi_val, price_station, eth_data)
        return eth_sum