import numpy as np
import matplotlib.pyplot as plt
import csv

time = np.arange(1000)
LEN = 1000
DELTA_LEN = 50

def CPI_value():
    delta = np.random.random(DELTA_LEN)*0.00010 - 0.000025
    new_delta = []
    for i in range(len(delta)):
        for _ in range(int(LEN / DELTA_LEN)):
            new_delta.append(delta[i])
    init = 2
    out = np.zeros(1000)
    out[0] = init + new_delta[0]
    for i in range(1, 1000):
        out[i] = out[i-1] * (1+new_delta[i])
    return out

if __name__ == "__main__":
    cpi_value = CPI_value()
    with open('../../dataset/cpi_value.csv', 'w') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(cpi_value)
    plt.figure()
    plt.plot(time, cpi_value)
    plt.title("CPI value per timestamp")
    plt.xlabel("time")
    plt.ylabel("Value of CPI")
    plt.savefig("../../images/external_data/artificial/cpi_value.png")