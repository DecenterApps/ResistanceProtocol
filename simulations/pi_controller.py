import math
import matplotlib.pyplot as plt
import numpy as np

TIME_STEP = 0.01
NEGATIVE_RATE_LIMIT = 50

class ControllerGains(object):
    def __init__(self, Kp: float, Ki: float):
        self.Kp = Kp
        self.Ki = Ki

class DeviationObservation(object):
    def __init__(self, timestamp: float, proportional: float, integral: float):
        self.timestamp = timestamp
        self.proportional = proportional
        self.integral = integral

def getLastProportionalTerm() -> float:
    if oll() == 0:
        return 0
    return deviationObservations[oll() - 1].proportional

def getLastIntegralTerm() -> float:
    if oll() == 0:
        return 0
    return deviationObservations[oll() - 1].integral

def oll() -> int:
    return len(deviationObservations)

def getBoundedRedemptionRate(piOutput: float) -> tuple:
    global defaultRedemptionRate
    global defaultGlobalTimeline
    global feedbackOutputUpperBound
    global feedbackOutputLowerBound
    boundedPIOutput = piOutput
    boundedPIOutput = feedbackOutputLowerBound

    if piOutput < feedbackOutputLowerBound:
        boundedPIOutput = feedbackOutputLowerBound
    elif piOutput > feedbackOutputUpperBound:
        boundedPIOutput = int(feedbackOutputUpperBound)

    negativeOutputExceedsHundred = boundedPIOutput < 0 and -boundedPIOutput >= defaultRedemptionRate
    if (negativeOutputExceedsHundred): 
        newRedemptionRate = NEGATIVE_RATE_LIMIT
    else:
        if boundedPIOutput < 0 and boundedPIOutput <= -int(NEGATIVE_RATE_LIMIT): 
            newRedemptionRate = defaultRedemptionRate - NEGATIVE_RATE_LIMIT
        else:
            newRedemptionRate = defaultRedemptionRate + boundedPIOutput

    return (newRedemptionRate, defaultGlobalTimeline)

def breaksNoiseBarrier(piSum: float, redemptionPrice: float) -> bool:
    global noiseBarrier
    deltaNoise = 2 - noiseBarrier
    return piSum >= redemptionPrice * deltaNoise - redemptionPrice

def getNextPriceDeviationCumulative(proportionalTerm: float, accumulatedLeak: float) -> tuple:
    global priceDeviationCumulative

    lastProportionalTerm = getLastProportionalTerm()
    if lastUpdateTime == 0:
        timeElapsed = 0
    else:
        timeElapsed = TIME_STEP
    
    newTimeAdjustedDeviation = riemannSum(proportionalTerm, lastProportionalTerm) * timeElapsed
    leakedPriceCumulative = accumulatedLeak * priceDeviationCumulative

    return (leakedPriceCumulative + newTimeAdjustedDeviation, newTimeAdjustedDeviation)

def riemannSum(x: float, y: float) -> float:
    return (x + y) / 2

def absolute(x: float) -> float:
    return np.abs(x)

def getGainAdjustedPIOutput(proportionalTerm: float, integralTerm: float) -> float:
    (adjustedProportional, adjustedIntegral) = getGainAdjustedTerms(proportionalTerm, integralTerm)
    return adjustedProportional+ adjustedIntegral

def getGainAdjustedTerms(proportionalTerm: float, integralTerm: float) -> tuple:
    global controllerGains
    return proportionalTerm * controllerGains.Kp, integralTerm * controllerGains.Ki

# --- Rate Validation/Calculation ---
def computeRate(marketPrice: float, redemptionPrice: float, accumulatedLeak: float) -> float:
    global lastUpdateTime
    global priceDeviationCumulative
    scaledMarketPrice = marketPrice
    proportionalTerm = redemptionPrice - scaledMarketPrice
    updateDeviationHistory(proportionalTerm, accumulatedLeak)
    lastUpdateTime = lastUpdateTime + TIME_STEP
    piOutput = getGainAdjustedPIOutput(proportionalTerm, priceDeviationCumulative)
    newRedemptionRate, _ = getBoundedRedemptionRate(piOutput)
    return newRedemptionRate

def updateDeviationHistory(proportionalTerm: float, accumulatedLeak: float) -> None:
    global historicalCumulativeDeviations
    global deviationObservations
    global lastUpdateTime

    (virtualDeviationCumulative, _) = getNextPriceDeviationCumulative(proportionalTerm, accumulatedLeak)
    priceDeviationCumulative = virtualDeviationCumulative
    historicalCumulativeDeviations.append(priceDeviationCumulative)
    deviationObservations.append(DeviationObservation(lastUpdateTime + TIME_STEP, proportionalTerm, priceDeviationCumulative))

def getNextRedemptionRate(marketPrice: float, redemptionPrice: float, accumulatedLeak: float) -> tuple:
    global defaultGlobalTimeline
    scaledMarketPrice = marketPrice
    
    proportionalTerm = (redemptionPrice - scaledMarketPrice) / redemptionPrice
    (cumulativeDeviation, _) = getNextPriceDeviationCumulative(proportionalTerm, accumulatedLeak)
    piOutput = getGainAdjustedPIOutput(proportionalTerm, cumulativeDeviation)
    if breaksNoiseBarrier(absolute(piOutput), redemptionPrice) and piOutput != 0:
        (newRedemptionRate, rateTimeline) = getBoundedRedemptionRate(piOutput)
        return (newRedemptionRate, proportionalTerm, cumulativeDeviation, rateTimeline)
    else:
        return (1, proportionalTerm, cumulativeDeviation, defaultGlobalTimeline)

deviationObservations = []
defaultRedemptionRate = 1
defaultGlobalTimeline = 1
historicalCumulativeDeviations = []
feedbackOutputUpperBound = 1.5
feedbackOutputLowerBound = 0.5
integralPeriodSize = TIME_STEP
controllerGains = ControllerGains(0.9, 1.5)
priceDeviationCumulative = 0
noiseBarrier = 0.05
lastUpdateTime = 0
historicalCumulativeDeviations.append(priceDeviationCumulative)