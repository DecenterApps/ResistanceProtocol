import numpy as np
from sklearn import svm
from sklearn.preprocessing import StandardScaler

def svm_prediction(data: np.array, time_stamp: float):

    X_l = np.arange(data.size)
    StdS_X = StandardScaler()
    StdS_y = StandardScaler()
    X_l = StdS_X.fit_transform(X_l)
    data = StdS_y.fit_transform(data)

    regression = svm.SVR(kernel = 'rbf')
    regression.fit(X_l, data)

    return regression.predict(StdS_X.transform([[time_stamp]]))


if __name__ == "__main__":
    clf = svm.SVC()
    print("x")