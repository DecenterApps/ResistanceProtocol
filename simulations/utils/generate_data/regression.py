import numpy as np
import pandas as pd
from sklearn import svm
from sklearn.preprocessing import StandardScaler

def svm_training(data: np.array):
    X_l = np.arange(data.size)
    print(X_l.shape)
    X_l = X_l.reshape(-1,1)
    print(X_l.shape)
    regression = svm.SVR(kernel = 'rbf', degree = 3, C = 10, epsilon = 0.0000001)
    # regression = svm.SVR(kernel = 'poly', degree = 3, C = 1e3, epsilon = 0.1)
    regression.fit(X_l, data)
    return regression

def svm_prediction(regression: svm.SVR, data):
    data = data.reshape(-1,1)

    return regression.predict(data)