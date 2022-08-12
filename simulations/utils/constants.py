#how much noi for one eth
ONE_ETH = 500

class PRICE_TRADER:
    NUM = 300

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
    NUM = 200

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

class LEVERAGER:
    NUM = 200

    ETH_AMOUNT = 4

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

    #how far in the future does the leverager look
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
    NUM = 200

    ETH_AMOUNT = 2

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

    

class WHALE_INSTANT_PRICE_SETTER:
    NUM = 1

    ETH_AMOUNT = 50
    NOI_AMOUNT = ETH_AMOUNT * ONE_ETH

    # relative difference between redemption price and market price when whale is activated
    BOUND_HIGH = 1
    BOUND_MID = 0.2
    BOUND_LOW = 1 - BOUND_HIGH - BOUND_MID

class WHALE_INSTANT_RATE_SETTER:
    NUM = 0

    ETH_AMOUNT = 30
    NOI_AMOUNT = ETH_AMOUNT * ONE_ETH

    # relative difference between redemption price and market price when whale is activated
    BOUND_HIGH = 1
    BOUND_MID = 0.2
    BOUND_LOW = 1 - BOUND_HIGH - BOUND_MID

class NOI_TRUSTER:
    NUM = 100

    ETH_AMOUNT = 5
    NOI_AMOUNT = 0

    #percentage of trusters resource when buying noi
    RISKY = 0.5
    MODERATE = 0.3
    SAFE = 1 - MODERATE - RISKY

    # relative difference between redemption price and market price when noi truster is activated
    BOUND_HIGH = 0.3
    BOUND_MID = 0.2
    BOUND_LOW = 1 - BOUND_HIGH - BOUND_MID

class RANDOM_TRADER:
    NUM = 100

    ETH_AMOUNT = 2
    NOI_AMOUNT = ETH_AMOUNT * ONE_ETH

class WHALE_LONGTERM_PRICE_SETTER:
    NUM = 0

    ETH_AMOUNT = 20
    NOI_AMOUNT = ETH_AMOUNT * ONE_ETH

    # targetted difference between redemption price and market price
    BOUND_HIGH = 1
    BOUND_MID = 0.2
    BOUND_LOW = 1 - BOUND_HIGH - BOUND_MID

    # time period of whale infuencing the market price
    SHORT_PERIOD = 0.3
    MID_PERIOD = 0.3
    LONG_PERIOD = 1 - SHORT_PERIOD - MID_PERIOD

class POOL:
    ETH_AMOUNT = 200
    NOI_AMOUNT = ETH_AMOUNT * ONE_ETH

class REDEMPTION_RATES:
    MIN_RR = (1 + 1e-8*(-0.08), 1 + 1e-8*0.08)
    LOW_RR = (1 + 1e-8*(-0.2), 1 + 1e-8*0.2)
    MID_RR = (1 + 1e-8*(-0.5), 1 + 1e-8*0.5)
    HIGH_RR = (1 + 1e-8*(-0.9), 1 + 1e-8*0.9)

class PID_CONTROLLER:
    TIME_STEP = 10000
    NEGATIVE_RATE_LIMIT = 0.99

class PREDICTION:
    TRAIN_INTERVAL = 200

MONTE_CARLO_SIMULATIONS = 1

LIQUIDATION_RATIO = 1.2

INF = 10000000000

TWAP_TIMESTAMPS = 100

SIMULATION_TIMESTAMPS = 999