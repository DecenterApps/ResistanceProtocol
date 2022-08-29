from controllers.pi_controller_stable import computeRateStable
from controllers.pi_controller_cpi import computeRateCPI
from classes.ext_data import ExtData
from utils.constants import PID_CONTROLLER

def calculate_rp_and_rr(market_twap, redemption_price, accumulated_leak_stable, accumulated_leak_cpi, ext_data: ExtData, graph):
    rr_stable = computeRateStable(market_twap, redemption_price, accumulated_leak_stable)
    rr_cpi = computeRateCPI(ext_data.get_cpi_value(), redemption_price, accumulated_leak_cpi)
    err_stable_perc = abs(market_twap - redemption_price) / redemption_price
    err_cpi_perc = abs(redemption_price - ext_data.get_cpi_value()) / redemption_price

    w_stable = 0.5
    if err_stable_perc > 0.1:
        w_stable = 1
    elif err_stable_perc > 0:
        w_stable = 0.85 + 0.05 * err_stable_perc/0.1
        w_stable = w_stable + (1 - w_stable) * err_stable_perc/(err_stable_perc + err_cpi_perc)
    w_cpi = 1 - w_stable
    rr = w_stable * rr_stable + w_cpi * rr_cpi

    graph.add_rates(w_cpi, w_stable, rr_cpi, rr_stable)

    return update_rp(redemption_price, rr), rr

def update_rp(redemption_price:float, redemption_rate: float) -> float:
    # Update redemption price
    # print(redemptionRate)
    # print(redemption_price)
    redemption_price = (redemption_rate ** PID_CONTROLLER.TIME_STEP) * redemption_price
    if redemption_price == 0:
        redemption_price = 1

    # Return updated redemption price
    return redemption_price