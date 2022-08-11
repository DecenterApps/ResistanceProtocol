import numpy as np
import matplotlib.pyplot as plt
import csv

from regression import *


TWAP_LEN = 10

time = np.arange(1000)

def ETH_Dollar_value():
    
    delta = np.random.random(1000)*50-25
    init = 1000
    out = np.zeros(1000)
    twap = np.zeros(1000)
    prediction = np.array([])
    out[0] = init + delta[0]
    timestamp = 1
    twap[0] = out[0]
    twap_sum = out[0]
    for i in range(1, 1000):
        out[i] = out[i-1] + delta[i]
        twap_sum += out[i]
        timestamp += 1
        if timestamp > TWAP_LEN:
            twap_sum -= out[i-TWAP_LEN]
            timestamp = TWAP_LEN
        twap[i] = twap_sum / timestamp

    regression = svm_training(twap[:800])
    arr = np.arange(1000)
    outcome = svm_prediction(regression, arr)
    #prediction.append(outcome)
    print("lolcina")

    return out, twap, np.concatenate((prediction, outcome))

if __name__ == "__main__":
    eth_dollar, twap_eth_dollar, prediction = ETH_Dollar_value()
    with open('../../dataset/eth_dollar.csv', 'w') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(eth_dollar)
    with open('../../dataset/twap_eth_dollar.csv', 'w') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(twap_eth_dollar)
    plt.figure()
    plt.plot(time, eth_dollar, time,  twap_eth_dollar, time, prediction)
    plt.legend(['eth_dollar', 'twap_eth_dollar', 'prediction'])
    plt.title("ETH -> dollar")
    plt.xlabel("time")
    plt.ylabel("Value of ETH")
    plt.savefig("../../images/eth_dollar.png")