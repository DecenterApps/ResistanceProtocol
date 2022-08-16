import numpy as np
import matplotlib.pyplot as plt
import csv
import sys
# setting path
sys.path.append('../')
from constants import SIMULATION_TIMESTAMPS
time = np.arange(SIMULATION_TIMESTAMPS+1)
LEN = SIMULATION_TIMESTAMPS + 1
DELTA_LEN = int(LEN / 20)

def CPI_value():
    delta = np.random.random(DELTA_LEN)*0.00010 - 0.000025
    new_delta = []
    for i in range(len(delta)):
        for _ in range(int(LEN / DELTA_LEN)):
            new_delta.append(delta[i])
    init = 2
    out = np.zeros(SIMULATION_TIMESTAMPS)
    out[0] = init + new_delta[0]
    for i in range(1, SIMULATION_TIMESTAMPS):
        out[i] = out[i-1] * (1+new_delta[i])
    return out

if __name__ == "__main__":
    cpi_value = CPI_value()
    cpi_value = np.append(cpi_value, [cpi_value[-1]])
    with open('../../dataset/artificial/cpi_value.csv', 'w') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(cpi_value)
    
    with open('../../dataset/simulation_data/cpi_value.csv', 'w') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(cpi_value)
    
    plt.figure()
    duz = min(len(time), len(cpi_value))
    plt.plot(time[:duz], cpi_value[:duz])
    plt.title("CPI value per timestamp")
    plt.xlabel("time")
    plt.ylabel("Value of CPI")
    plt.savefig("../../images/simulation_data/cpi_value.png")
    plt.savefig("../../images/external_data/artificial/cpi_value.png")