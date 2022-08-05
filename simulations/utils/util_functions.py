import csv

def get_data_from_csv(file_name):
    with open(file_name, 'r') as csvfile:
        eth_dollar = list(csv.reader(csvfile))[0]
        return [float(i) for i in eth_dollar]