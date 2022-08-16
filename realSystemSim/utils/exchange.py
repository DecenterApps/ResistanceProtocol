from classes.pool import Pool

def exchange_noi_to_eth(noi_amount, pool: Pool):
    eth, noi = pool.getEth(), pool.getNoi()
    noi += noi_amount
    eth_amount = eth / noi * noi_amount
    return eth_amount

def exchange_eth_to_noi(eth_amount, pool: Pool):
    eth, noi = pool.getEth(), pool.getNoi()
    eth += eth_amount
    noi_amount = noi / eth * eth_amount
    return noi_amount

def exchange_usd_to_eth():
    pass

def exchange_usd_to_noi():
    pass