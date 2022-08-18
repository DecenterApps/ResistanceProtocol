import numpy as np
import matplotlib.pyplot as plt
import csv

from regression import *
import sys, getopt
# setting path
sys.path.append('../')
from constants import SIMULATION_TIMESTAMPS

# print('cmd entry:', sys.argv[1])

TWAP_LEN = 10
SAMPLES = SIMULATION_TIMESTAMPS + 1
time = None

def ETH_Dollar_value(trend, samples):

    parameter = 25
    if len(sys.argv) > 1:
        parameter -= trend / 10
    
    delta = np.random.random(samples)*50-parameter
    init = 1000
    out = np.zeros(samples)
    twap = np.zeros(samples)
    out[0] = init + delta[0]
    timestamp = 1
    twap[0] = out[0]
    twap_sum = out[0]
    for i in range(1, samples):

        out[i] = out[i-1] + delta[i]
        if out[i] < 50:
            out[i] += 25
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

def get_input_arguments():
    options = "ho:n:"
    long_options = ["Help", "ETH_Trend_Growth=", "Number_of_Samples="]
    trend = 0
    samples = SAMPLES
    try:
        arguments, values = getopt.getopt(sys.argv[1:], options, long_options)
        for current_arg, current_val in arguments:
            if current_arg in ("-h", "--Help"):
                print ("-o Parameter: ETH_Trend_Growth, range(-10,10) \n-n Parameter: Number of samples")
            if current_arg in ("-o", "--ETH_Trend_Growth"):
                trend = int(current_val)
            elif current_arg in ("-n", "--Number_of_Samples"):
                samples = int(current_val)

    except getopt.error as err:
        print (str(err))
    
    return trend, samples

if __name__ == "__main__":
    trend, samples = get_input_arguments()
    time = np.arange(samples)

    eth_dollar, twap_eth_dollar = ETH_Dollar_value(trend, samples)
    prediction = get_prediction(twap_eth_dollar, 1500, samples)
    with open('../../dataset/artificial/eth_dollar.csv', 'w') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(eth_dollar)
    with open('../../dataset/simulation_data/eth_dollar.csv', 'w') as csvfile:  #twap eth price
        writer = csv.writer(csvfile)
        writer.writerow(twap_eth_dollar)
    plt.figure()
    plt.plot(time, eth_dollar, time,  twap_eth_dollar, time, prediction)
    plt.axvline(x = 1500, color = 'b', label = 'axvline - full height')
    plt.legend(['eth_dollar', 'twap_eth_dollar', 'prediction'])
    plt.title("ETH -> dollar")
    plt.xlabel("time")
    plt.ylabel("Value of ETH")
    plt.savefig("../../images/external_data/artificial/eth_dollar.png")
    plt.savefig("../../images/simulation_data/eth_dollar.png")

    exec(open("../../classes/regression.py").read())


