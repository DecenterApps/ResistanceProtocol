import csv
import matplotlib.pyplot as plt
import math

def get_data_from_csv(file_name):
    with open(file_name, 'r') as csvfile:
        value = list(csv.reader(csvfile))[0]
        return [float(i) for i in value]

def plot_all_graphs():
    with open('dataset/graphs.csv', 'r') as f:
        csvreader = csv.reader(f)
        timestamp_graphs = []
        full_graphs = []
        duz = 0
        for row in csvreader:
            one, two, three = row
            one, two, three = parse_array(one), parse_array(two), parse_array(three)
            if duz % 2 == 0:
                timestamp_graphs.append({'one': one, 'two': two, 'three': three})
            else:
                full_graphs.append({'one': one, 'two': two, 'three': three})
            duz += 1
        plot_arr('images/timestamp_graphs.png', timestamp_graphs, 'cpi', 'Inflation value')
        plot_arr('images/full_graphs.png', full_graphs, 'market twap', 'Market twap')

def parse_array(arr):
    arr = arr[1:-1].split()
    for i in range(len(arr)):
        arr[i] = float(arr[i][:-1]) if arr[i][-1] == ',' else float(arr[i])
    return arr

def plot_arr(filename, arr, t1, t2):
    size = math.ceil(math.sqrt(len(arr)))
    if size == 1:
        size = 2
    _, axis = plt.subplots(size, size, figsize=(15,15))
    for i in range(len(arr)):
        one, two, three = arr[i]['one'], arr[i]['two'], arr[i]['three']
        axis[i//size][i%size].plot(one)
        axis[i//size][i%size].plot(two, color='red')
        axis[i//size][i%size].plot(three, color='greenyellow')
        axis[i//size][i%size].legend(['market price', 'redemption price', t1])
        axis[i//size][i%size].set_title("Market price, Redemption price, " + t2)
    plt.tight_layout()
    plt.savefig(filename)
