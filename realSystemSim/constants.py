#how much noi for one eth
ONE_ETH = 500

PRICE_TRADER_NUM = 10
RATE_TRADER_NUM = 10
RANDOM_TRADER_NUM = 10
NOI_TRUSTER_NUM = 10
LEVERAGER_NUM = 10
SAFE_OWNER_NUM = 10

class PRICE_TRADER:
    ACCOUNTS_START = 3
    ACCOUNTS_END = PRICE_TRADER_NUM + 3

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
    ACCOUNTS_END = RATE_TRADER_NUM + ACCOUNTS_START

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

class RANDOM_TRADER:
    ACCOUNTS_START = RATE_TRADER.ACCOUNTS_END
    ACCOUNTS_END = RANDOM_TRADER_NUM + ACCOUNTS_START

class NOI_TRUSTER:
    ACCOUNTS_START = RANDOM_TRADER.ACCOUNTS_END
    ACCOUNTS_END = NOI_TRUSTER_NUM + ACCOUNTS_START

    #percentage of trusters resource when buying noi
    RISKY = 0.5
    MODERATE = 0.3
    SAFE = 1 - MODERATE - RISKY

    # relative difference between redemption price and market price when noi truster is activated
    BOUND_HIGH = 0.3
    BOUND_MID = 0.2
    BOUND_LOW = 1 - BOUND_HIGH - BOUND_MID

class LEVERAGER:
    ACCOUNTS_START = NOI_TRUSTER.ACCOUNTS_END
    ACCOUNTS_END = LEVERAGER_NUM + ACCOUNTS_START

    RISKY = 0.2
    MODERATE = 0.3
    SAFE = 1 - MODERATE - RISKY

    # relative difference between initial cr and repay/boost cr of leverager
    R_DIFF = 0.1
    M_DIFF = 0.25
    S_DIFF = 0.5

    # initial cr of leverager
    R_CR = 1.5
    M_CR = 1.9
    S_CR = 2.5

    # percent of leveragers(risky leveragers put more percent of their money in collateral)
    R_COLLATERAL = 1
    M_COLLATERAL = 0.7
    S_COLLATERAL = 0.5

    # gap between market price and redemption price when leverager opens/closes a position
    RELATIVE_GAP_RISKY = 0.5
    RELATIVE_GAP_MODERATE = 0.25
    RELATIVE_GAP_SAFE = 1 - RELATIVE_GAP_RISKY - RELATIVE_GAP_MODERATE

    # how far in the future does the leverager look
    PREDICTION_FAR = 0.2
    PREDICTION_MID = 0.3
    PREDICTION_LOW = 1 - PREDICTION_FAR - PREDICTION_MID

    # how much does predicted price affect leverager's decision
    PREDICTION_STRENGTH = 0.5

    # percent of leveragers that have high/mid/low threshold
    # prediction threshold is relative difference between current eth price and predicted eth price when leverager is activated
    PREDICTION_THRESHOLD_HIGH = 0.3
    PREDICTION_THRESHOLD_MID = 0.15
    PREDICTION_THRESHOLD_LOW = 0.09


class SAFE_OWNER:
    ACCOUNTS_START = LEVERAGER.ACCOUNTS_END
    ACCOUNTS_END = SAFE_OWNER_NUM + ACCOUNTS_START

    RISKY = 0.2
    MODERATE = 0.3
    SAFE = 1 - MODERATE - RISKY

    # relative difference between initial cr and repay/boost cr of safe owner
    R_DIFF = 0.1
    M_DIFF = 0.25
    S_DIFF = 0.5

    #initial cr of safe owner
    R_CR = 1.7
    M_CR = 2.2
    S_CR = 3

    #percent of safe owners(risky safe owners put more percent of their money in collateral)
    R_COLLATERAL = 1
    M_COLLATERAL = 0.7
    S_COLLATERAL = 0.5

    #gap between market price and redemption price when safe owner opens a position
    RELATIVE_GAP_RISKY = 0.5
    RELATIVE_GAP_MODERATE = 0.25
    RELATIVE_GAP_SAFE = 0.5

    #how far in the future does the safe owner's look
    PREDICTION_FAR = 0.2
    PREDICTION_MID = 0.3
    PREDICTION_LOW = 1 - PREDICTION_FAR - PREDICTION_MID

    # how much does predicted price affect safe owner's decision
    PREDICTION_STRENGTH = 0.5

    # percent of safe owners that have high/mid/low threshold
    # prediction threshold is relative difference between current eth price and predicted eth price when safe owner is activated
    PREDICTION_THRESHOLD_HIGH = 0.3
    PREDICTION_THRESHOLD_MID = 0.15
    PREDICTION_THRESHOLD_LOW = 0.09

class REDEMPTION_RATES:
    MIN_RR = (1 + 1e-8*(-0.08), 1 + 1e-8*0.08)
    LOW_RR = (1 + 1e-8*(-0.2), 1 + 1e-8*0.2)
    MID_RR = (1 + 1e-8*(-0.5), 1 + 1e-8*0.5)
    HIGH_RR = (1 + 1e-8*(-0.9), 1 + 1e-8*0.9)

    
    
LIQUIDATION_RATIO = 1.2
SIMULATION_TIMESTAMPS = 500