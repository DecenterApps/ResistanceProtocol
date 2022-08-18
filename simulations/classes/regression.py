from re import L
import numpy as np
import matplotlib.pyplot as plt
import sys

sys.path.append('../../')

from utils.constants import PREDICTION
from sklearn import svm
from sklearn.preprocessing import StandardScaler
import csv
from utils.util_functions import get_data_from_csv

class data_for_regression:
    def __init__(self):
        self.eth_data = '../../dataset/simulation_data/eth_dollar.csv'
        self.ether_data = get_data_from_csv(self.eth_data)

    def get_data(self):
        return self.ether_data

class Regression:
    def __init__(self):
        self.regression : svm.SVR = None
        self.prediction_data = []
    
    def train(self, data):
        data = np.array(data)
        X_l = np.arange(data.size)
        X_l = X_l.reshape(-1,1)
        original_len = data.size
        if data.size > 500:
            data = data[-500:]
            X_l = X_l[-500:]
        regression = svm.SVR(kernel = 'rbf', degree = 3, C = 10, epsilon = 0.01)
        regression.fit(X_l, data)

        self.regression = regression

    def predict(self, test_ind: int):
        arr = np.arange(test_ind)
        arr = arr.reshape(-1,1)
        self.prediction_data = self.regression.predict(arr)

    def update(self, data):
        if len(data) > 0 and len(data) % PREDICTION.TRAIN_INTERVAL == 0:
            self.train(data)
        if self.regression is None:
            return
        self.predict(len(data)*1.25)

    def get_predicted_eth_price(self, timestamp):
        if self.regression is None:
            return 0
        if timestamp >= len(self.prediction_data):
            return self.prediction_data[-1]
        return self.prediction_data[timestamp]

if __name__ == "__main__":
    data = data_for_regression()
    regression_data = data.get_data()
    output = []
    i = 0
    while i < len(regression_data):
        if i < 500:
            output += [0] * 500
            i = i + 500
            continue
        
        model = Regression()

        out = []

        if i >= 1500:
            model.train(regression_data[i-1500:i])
            model.predict(2000)
            out += list(model.prediction_data[1500:2000])
        elif i >= 1000:
            model.train(regression_data[i-1000: i])
            model.predict(1500)
            out += list(model.prediction_data[1000:1500])
        else:
            model.train(regression_data[i-500: i])
            model.predict(1000)
            out += list(model.prediction_data[500:1000])

        i = i + 500
        output += out
    # plt.figure()
    # plt.plot(output)
    # plt.plot(regression_data)
    # plt.show()

    with open('../../dataset/simulation_data/predicted_data.csv', mode='w') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(output)