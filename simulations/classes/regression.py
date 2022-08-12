import numpy as np
from utils.constants import PREDICTION
from sklearn import svm
from sklearn.preprocessing import StandardScaler

class Regression:
    def __init__(self):
        self.regression : svm.SVR = None
        self.prediction_data = []
    
    def train(self, data):
        data = np.array(data)
        X_l = np.arange(data.size)
        X_l = X_l.reshape(-1,1)
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