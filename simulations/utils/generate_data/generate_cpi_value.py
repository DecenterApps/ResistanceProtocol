import numpy as np
import matplotlib.pyplot as plt
import csv

time = np.arange(1000)

def CPI_value():
    delta = np.random.random(1000)*0.00006
    init = 2
    out = np.zeros(1000)
    out[0] = init + delta[0]
    for i in range(1, 1000):
        out[i] = out[i-1] * (1+delta[i])
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
    plt.savefig("../../images/cpi_value.png")