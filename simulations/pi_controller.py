# import matplotlib.pyplot as plt
import numpy as np

TIME_STEP = 10000
NEGATIVE_RATE_LIMIT = 0.99

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

def getBoundedRedemptionRate(piOutput: float) -> float:
    global defaultRedemptionRate
    global defaultGlobalTimeline
    global feedbackOutputUpperBound
    global feedbackOutputLowerBound

    boundedPIOutput = piOutput
    newRedemptionRate = 0

    if (piOutput < feedbackOutputLowerBound):
        boundedPIOutput = feedbackOutputLowerBound
    elif (piOutput > feedbackOutputUpperBound):
        boundedPIOutput = feedbackOutputUpperBound

    negativeOutputExceedsHundred = (boundedPIOutput < 0 and -boundedPIOutput >= defaultRedemptionRate)
    if (negativeOutputExceedsHundred):
        newRedemptionRate = NEGATIVE_RATE_LIMIT
    else:
        if (boundedPIOutput < 0 and boundedPIOutput <= -NEGATIVE_RATE_LIMIT):
            newRedemptionRate = defaultRedemptionRate - NEGATIVE_RATE_LIMIT
        else:
            newRedemptionRate = defaultRedemptionRate + boundedPIOutput

    return newRedemptionRate

def breaksNoiseBarrier(piSum: float, redemptionPrice: float) -> bool:
    global noiseBarrier
    deltaNoise = 2 - noiseBarrier
    return piSum >= redemptionPrice * deltaNoise - redemptionPrice

def getNextPriceDeviationCumulative(proportionalTerm: float, accumulatedLeak: float) -> tuple:
    global priceDeviationCumulative

    lastProportionalTerm = getLastProportionalTerm()
    timeElapsed = TIME_STEP # todo: check this
    
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
    proportionalTerm = redemptionPrice - marketPrice
    updateDeviationHistory(proportionalTerm, accumulatedLeak)
    lastUpdateTime = lastUpdateTime + TIME_STEP
    piOutput = getGainAdjustedPIOutput(proportionalTerm, priceDeviationCumulative)
    newRedemptionRate = getBoundedRedemptionRate(piOutput)
    return newRedemptionRate

def updateDeviationHistory(proportionalTerm: float, accumulatedLeak: float) -> None:
    global historicalCumulativeDeviations
    global deviationObservations
    global lastUpdateTime
    global priceDeviationCumulative

    (virtualDeviationCumulative, _) = getNextPriceDeviationCumulative(proportionalTerm, accumulatedLeak)
    priceDeviationCumulative = virtualDeviationCumulative
    historicalCumulativeDeviations.append(priceDeviationCumulative)
    deviationObservations.append(DeviationObservation(lastUpdateTime + TIME_STEP, proportionalTerm, priceDeviationCumulative))

# def getNextRedemptionRate(marketPrice: float, redemptionPrice: float, accumulatedLeak: float) -> tuple:
#     global defaultGlobalTimeline
#     scaledMarketPrice = marketPrice
    
#     proportionalTerm = (redemptionPrice - scaledMarketPrice) / redemptionPrice
#     (cumulativeDeviation, _) = getNextPriceDeviationCumulative(proportionalTerm, accumulatedLeak)
#     piOutput = getGainAdjustedPIOutput(proportionalTerm, cumulativeDeviation)
#     if breaksNoiseBarrier(absolute(piOutput), redemptionPrice) and piOutput != 0:
#         newRedemptionRate = getBoundedRedemptionRate(piOutput)
#         return (newRedemptionRate, proportionalTerm, cumulativeDeviation, rateTimeline)
#     else:
#         return (1, proportionalTerm, cumulativeDeviation, defaultGlobalTimeline)

def updateRedemptionPrice(redemptionPrice:float, redemptionRate: float) -> float:
    # Update redemption price
    redemptionPrice = (redemptionRate ** TIME_STEP) * redemptionPrice
    if redemptionPrice == 0:
        redemptionPrice = 1

    # Return updated redemption price
    return redemptionPrice

deviationObservations = []
defaultRedemptionRate = 1
defaultGlobalTimeline = 1
historicalCumulativeDeviations = []
feedbackOutputUpperBound = 0.5
feedbackOutputLowerBound = -0.5
integralPeriodSize = TIME_STEP
controllerGains = ControllerGains(7.5*10**(-8), 2.4*10**(-14))
priceDeviationCumulative = 0.99999
noiseBarrier = 0.05
lastUpdateTime = 0
historicalCumulativeDeviations.append(priceDeviationCumulative)
ok = True

if __name__ == "__main__":
    rr = computeRate(2.71, 2.8, 0)
    rp = updateRedemptionPrice(100, rr)