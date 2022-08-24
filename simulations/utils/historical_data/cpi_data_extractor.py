import csv
import matplotlib.pyplot as plt
import numpy as np

import sys
# setting path
sys.path.append('../')
from constants import SIMULATION_TIMESTAMPS

num_timestamps = SIMULATION_TIMESTAMPS + 1

if __name__ == "__main__":
    cpi_data = []
    cpi = []
    with open('../../dataset/historical/historical_cpi_value.csv', mode='r') as csvfile:
        csv_reader = csv.DictReader(csvfile)
        line_count = 0
        for row in csv_reader:
            if line_count == 0:
                print(f'Column names are {", ".join(row)}')
                line_count += 1
            cpi_data.append(row["CPIAUCSL"])
            line_count += 1
    
    for i in range(len(cpi_data)):
        value = float(cpi_data[i])
        if i == 0:
            cpi.append(value)
            continue
        
        pow = 28*8
        relative_change = value/float(cpi_data[i-1])
        for j in range(pow):
            cpi.append(cpi[-1]*relative_change**(1/pow))
    
    with open('../../dataset/historical_processed/cpi_value.csv', mode='w') as csvfile:
        writer = csv.writer(csvfile)

        figure, axis = plt.subplots(1, 1, figsize=(15,8))
        axis.plot(cpi)
        axis.set_title("historical cpi")

        plt.tight_layout()

        plt.savefig('../../images/external_data/historical/cpi_value.png')

        writer.writerow(cpi)

    with open('../../dataset/simulation_data/cpi_value.csv', mode='w') as csvfile:
        writer = csv.writer(csvfile)

        figure, axis = plt.subplots(1, 1, figsize=(15,8))

        p = np.random.randint(0, len(cpi) - num_timestamps - 1)
        writer = csv.writer(csvfile)
        cpi = cpi[p:p+num_timestamps]
        writer.writerow(cpi)

        axis.plot(cpi)
        axis.set_title("historical cpi")

        plt.tight_layout()

        plt.savefig('../../images/simulation_data/cpi_value.png')

        writer.writerow(cpi)
    
