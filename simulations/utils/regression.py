import numpy as np
from sklearn import svm
from sklearn.preprocessing import StandardScaler

def svm_training(data: np.array):
    X_l = np.arange(data.size)
    X_l = StdS_X.fit_transform(X_l)
    data = StdS_y.fit_transform(data)

    regression = svm.SVR(kernel = 'rbf')
    regression.fit(X_l, data)

def svm_prediction(regression: svm.SVR, time_stamp: float):
    return regression.predict(StdS_X.transform([[time_stamp]]))

StdS_X = StandardScaler()
StdS_y = StandardScaler()