class PRICE_TRADER:
    NUM = 200

    ETH_AMOUNT = 1
    NOI_AMOUNT = 1000

    #percentage of traders resource when trading
    RISKY = 0.5
    MODERATE = 0.3
    SAFE = 1 - MODERATE - RISKY

    # relative difference between redemption price and market price when trader is activated
    BOUND_HIGH = 0.3
    BOUND_MID = 0.2
    BOUND_LOW = 1 - BOUND_HIGH - BOUND_MID

class RATE_TRADER:
    NUM = 200

    ETH_AMOUNT = 1
    NOI_AMOUNT = 1000

    #percentage of traders resource when trading
    RISKY = 0.5
    MODERATE = 0.3
    SAFE = 1 - MODERATE - RISKY

    # redemption rate when trader is activated
    RR_HIGH = 0.4
    RR_MID = 0.25
    RR_LOW = 1 - RR_HIGH - RR_MID

class LEVERAGER:
    NUM = 500

    ETH_AMOUNT = 5

    RISKY = 0.2
    MODERATE = 0.3
    SAFE = 1 - MODERATE - RISKY

    # relative difference between initial cr and repay/boost cr of leverager
    R_DIFF = 0.1
    M_DIFF = 0.25
    S_DIFF = 0.5

    #initial cr of leverager
    R_CR = 1.5
    M_CR = 1.9
    S_CR = 2.5

    #percent of leveragers(risky leveragers put more percent of their money in collateral)
    R_COLLATERAL = 1
    M_COLLATERAL = 0.7
    S_COLLATERAL = 0.5

    #gap between market price and redemption price when leverager opens/closes a position
    RELATIVE_GAP_RISKY = 0.5
    RELATIVE_GAP_MODERATE = 0.25
    RELATIVE_GAP_SAFE = 0.5

class POOL:
    ETH_AMOUNT = 200
    NOI_AMOUNT = 100000

MONTE_CARLO_SIMULATIONS = 1

LIQUIDATION_RATIO = 1.2

INF = 10000000000