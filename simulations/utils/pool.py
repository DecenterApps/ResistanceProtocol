from utils.eth_data import ETHData


class Pool:
    def __init__(self, eth_amount:float, noi_amount:float):
        self.noi = noi_amount
        self.eth = eth_amount
    
    def change_pool(self, substep, previous_state, eth_add, noi_add, price_station, eth_data: ETHData):
        self.eth += eth_add
        self.noi += noi_add
        price_station.update_mp(substep, previous_state, self, eth_data)