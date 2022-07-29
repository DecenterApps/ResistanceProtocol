# from utils.price_station import PriceStation
# from utils.constants import *
# from utils.exchange import *
# import numpy as np


# class Position:
#     def __init__(self, collateral_eth, debt_noi, stable_cr, repay_cr, boost_cr):
#         self.collateral_eth = collateral_eth
#         self.debt_noi = debt_noi
#         self.stable_cr = stable_cr
#         self.repay_cr = repay_cr
#         self.boost_cr = boost_cr

#     def calculate_cr(self, pool, substep, previous_state, eth_data: ETHData):
#         eth_total_val = get_eth_value_for_amount(self.collateral_eth, substep, previous_state, eth_data)
#         noi_total_val = get_noi_value_for_amount(self.debt_noi, pool, substep, previous_state, eth_data)
#         return eth_total_val / noi_total_val
    
#     def boost_position(self, pool, substep, previous_state, eth_data: ETHData):
#         eth_total_val = get_eth_value_for_amount(self.collateral_eth, substep, previous_state, eth_data)
#         noi_total_val = get_noi_value_for_amount(self.debt_noi, pool, substep, previous_state, eth_data)
#         if eth_total_val / noi_total_val < self.boost_cr:
#             print("bravo majmune")
#             return
#         # this amount is going to be added to both collateral and debt
#         # this is the amount in dollars
#         x = (eth_total_val - self.stable_cr*noi_total_val)/(self.stable_cr - 1)
#         self.collateral_eth += ex
#         self.debt_noi += x
#         print("boosted position")

# class Leverager:
#     def __init__(self, name, collateral_eth, debt_noi, initial_cr, repay_cr, boost_cr):
#         self.name = name
#         self.collateral_eth = collateral_eth
#         self.debt_noi = debt_noi
#         self.initial_cr = initial_cr
#         self.repay_cr = repay_cr
#         self.boost_cr = boost_cr

#     def calculate_cr(self):
#         return collateral_eth


# def create_new_leverager(name, eth_amount, eth_value, price_station: PriceStation):
#     diff, cr = get_leverager_values()
#     perc_amount = get_leverager_perc_amount()
#     noi_amount = eth_value * (perc_amount * eth_amount) / cr / price_station.rp
#     return Leverager(name, eth_amount, noi_amount, cr, max(LIQUIDATION_RATIO, cr - diff), cr + diff)

# # def create_modified_trader(trader: Trader, eth_add, noi_add):
# #     return Trader(trader.name, trader.eth - eth_add, trader.noi - noi_add, trader.perc_amount, trader.relative_gap)

# #


# def get_leverager_values():
#     p = np.random.random()
#     if p < PERC_RISKY_LEVERAGER:
#         return R_LEV_DIFF, R_LEV_CR
#     p -= PERC_RISKY_TRADERS
#     if p < PERC_MODERATE_TRADERS:
#         return M_LEV_DIFF, M_LEV_CR
#     return S_LEV_DIFF, S_LEV_CR

# # relative difference between redemption price and market price when trader is activated


# def get_leverager_perc_amount() -> float:
#     p = np.random.random()
#     if p < PERCENT_R_LEV_COLLATERAL:
#         return 0.95
#     p -= PERCENT_R_LEV_COLLATERAL
#     if p < PERCENT_M_LEV_COLLATERAL:
#         return 0.7
#     return 0.45
