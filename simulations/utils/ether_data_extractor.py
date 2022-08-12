import random
import csv
import matplotlib.pyplot as plt

if __name__ == "__main__":
    ether_data = []
    ether_data_high = []
    ether_data_low = []
    with open('../dataset/historic_ether_price.csv', mode='r') as csvfile:
        csv_reader = csv.DictReader(csvfile)
        line_count = 0
        for row in csv_reader:
            if line_count == 0:
                line_count += 1
            ether_data.append(float(row["Open"]))
            ether_data_high.append(float(row["High"]))
            ether_data_low.append(float(row["Low"]))
            line_count += 1

    ether = []

    for i in range(len(ether_data)):
        for j in range(8):
            value = random.random()*(ether_data_high[i] - ether_data_low[i]) + ether_data_low[i]
            ether.append(value)

    with open('../dataset/ether_data.csv', mode='w') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(ether)

    print(len(ether))
    plt.figure()
    plt.plot(ether)
    plt.title("ETHER")
    plt.savefig("../documentation_images/real_world_ether.png")
