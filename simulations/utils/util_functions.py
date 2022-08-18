import csv
import matplotlib.pyplot as plt

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
        plot_arr('images/timestamp_graphs.png', timestamp_graphs)
        plot_arr('images/full_graphs.png', full_graphs)

def parse_array(arr):
    arr = arr[1:-1].split()
    for i in range(len(arr)):
        arr[i] = float(arr[i][:-1]) if arr[i][-1] == ',' else float(arr[i])
    return arr

def plot_arr(filename, arr):
    _, axis = plt.subplots(3, 3, figsize=(15,15))
    for i in range(len(arr)):
        one, two, three = arr[i]['one'], arr[i]['two'], arr[i//3]['three']
        axis[i//3][i%3].plot(one)
        axis[i//3][i%3].plot(two, color='red')
        axis[i//3][i%3].plot(three, color='greenyellow')
        axis[i//3][i%3].legend(['market price', 'redemption price', 'cpi'])
        axis[i//3][i%3].set_title("Market price, Redemption price, Inflation value")
    plt.tight_layout()
    plt.savefig(filename)
