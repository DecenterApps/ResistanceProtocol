#how much noi for one eth
ONE_ETH = 500

PRICE_TRADER_NUM = 10
RATE_TRADER_NUM = 10

class PRICE_TRADER:
    ACCOUNTS_START = 3
    ACCOUNTS_END = PRICE_TRADER_NUM

    ETH_AMOUNT = 4
    NOI_AMOUNT = ETH_AMOUNT * ONE_ETH

    #percentage of traders resource when trading
    RISKY = 1
    MODERATE = 0.3
    SAFE = 1 - MODERATE - RISKY

    # relative difference between redemption price and market price when trader is activated
    BOUND_HIGH = 0.5
    BOUND_MID = 0.2
    BOUND_LOW = 1 - BOUND_HIGH - BOUND_MID

class RATE_TRADER:
    ACCOUNTS_START = PRICE_TRADER.ACCOUNTS_END
    ACCOUNTS_END = RATE_TRADER_NUM

    ETH_AMOUNT = 2
    NOI_AMOUNT = ETH_AMOUNT * ONE_ETH

    #percentage of traders resource when trading
    RISKY = 0.5
    MODERATE = 0.3
    SAFE = 1 - MODERATE - RISKY

    # redemption rate when trader is activated
    # high - high activity
    # low - low activity
    RR_HIGH = 0.2
    RR_MID = 0.25
    RR_LOW = 1 - RR_HIGH - RR_MID

class REDEMPTION_RATES:
    MIN_RR = (1 + 1e-8*(-0.08), 1 + 1e-8*0.08)
    LOW_RR = (1 + 1e-8*(-0.2), 1 + 1e-8*0.2)
    MID_RR = (1 + 1e-8*(-0.5), 1 + 1e-8*0.5)
    HIGH_RR = (1 + 1e-8*(-0.9), 1 + 1e-8*0.9)

    
    
    
SIMULATION_TIMESTAMPS = 100