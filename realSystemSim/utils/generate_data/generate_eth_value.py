import numpy as np
import matplotlib.pyplot as plt
import csv

from regression import *

TWAP_LEN = 10
SAMPLES = 3000

time = np.arange(SAMPLES)

def ETH_Dollar_value():
    
    delta = np.random.random(SAMPLES)*50-25
    init = 1000
    out = np.zeros(SAMPLES)
    twap = np.zeros(SAMPLES)
    out[0] = init + delta[0]
    timestamp = 1
    twap[0] = out[0]
    twap_sum = out[0]
    for i in range(1, SAMPLES):
        out[i] = out[i-1] + delta[i]
        twap_sum += out[i]
        timestamp += 1
        if timestamp > TWAP_LEN:
            twap_sum -= out[i-TWAP_LEN]
            timestamp = TWAP_LEN
        twap[i] = twap_sum / timestamp
    
    return out, twap

def get_prediction(twap_eth_dollar, training_ind, test_ind):
    regression = svm_training(twap_eth_dollar[:training_ind])
    arr = np.arange(test_ind)
    outcome = svm_prediction(regression, arr)
    return outcome

if __name__ == "__main__":
    eth_dollar, twap_eth_dollar = ETH_Dollar_value()
    prediction = get_prediction(twap_eth_dollar, 1500, SAMPLES)
    with open('../../dataset/eth_dollar.csv', 'w') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(eth_dollar)
    with open('../../dataset/twap_eth_dollar.csv', 'w') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(twap_eth_dollar)
    plt.figure()
    plt.plot(time, eth_dollar, time,  twap_eth_dollar, time, prediction)
    plt.axvline(x = 1500, color = 'b', label = 'axvline - full height')
    plt.legend(['eth_dollar', 'twap_eth_dollar', 'prediction'])
    plt.title("ETH -> dollar")
    plt.xlabel("time")
    plt.ylabel("Value of ETH")
    plt.savefig("../../images/eth_dollar.png")