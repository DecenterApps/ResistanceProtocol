from utils.eth_data import ETHData
from utils.classes import Pool, PriceStation

#get_noi_value
#get_noi_value_for_amount

def exchange_noi_to_eth(noi_amount, pool: Pool):
    return noi_amount * (pool.eth / pool.noi)

def exchange_eth_to_noi(eth_amount, pool: Pool):
    return eth_amount * (pool.noi / pool.eth)

def exchange_usd_to_eth():
    pass

def exchange_usd_to_noi():
    pass