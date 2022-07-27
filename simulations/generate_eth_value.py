import numpy as np
import matplotlib.pyplot as plt
import csv

time = np.arange(1000)

def ETH_Dollar_value():
    delta = np.random.random(1000)*50-25
    init = 1000
    out = np.zeros(1000)
    out[0] = init + delta[0]
    for i in range(1, 1000):
        out[i] = out[i-1] + delta[i]
    return out

if __name__ == "__main__":
    eth_dollar = ETH_Dollar_value()
    with open('dataset/eth_dollar.csv', 'w') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(eth_dollar)
    plt.figure()
    plt.plot(time, eth_dollar)
    plt.title("ETH -> dollar")
    plt.xlabel("time")
    plt.ylabel("Value of ETH")
    plt.savefig("images/eth_dollar.png")