from controllers.pi_controller_stable import updateRedemptionPriceStable, computeRateStable
from controllers.pi_controller_cpi import computeRateCPI
from classes.ext_data import ExtData

def calculate_rp_and_rr(market_twap, redemption_price, accumulated_leak, ext_data: ExtData):
    rr_stable = computeRateStable(market_twap, redemption_price, accumulated_leak)
    rr_cpi = computeRateCPI(market_twap, redemption_price, accumulated_leak)
    err_stable_perc = abs(market_twap - redemption_price) / redemption_price
    err_cpi_perc = abs(market_twap - ext_data.get_cpi_value()) / redemption_price

    w_stable = 0.5
    if err_stable_perc > 0.1:
        w_stable = 1
    elif err_stable_perc > 0:
        w_stable = 0.5 + 0.5 * err_stable_perc/0.1
        w_stable = w_stable + (1 - w_stable) * err_stable_perc/(err_stable_perc + err_cpi_perc)
    w_cpi = 1 - w_stable
    rr = w_stable * rr_stable + w_cpi * rr_cpi


    return updateRedemptionPrice(redemption_price, rr), rr

def updateRedemptionPrice(redemption_price, redemption_rate):
    return updateRedemptionPriceStable(redemption_price, redemption_rate)