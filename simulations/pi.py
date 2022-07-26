import numpy as np
import matplotlib.pyplot as plt

TIME_STEP = 0.01

def proportional_rate(Kp: float, err: float) -> float:
    return Kp * err

def integral_rate(integral: float, Ki: float, err_t: float, err_t_1: float, alpha: float) -> float:
    return integral * alpha + Ki * (err_t + err_t_1)/2 * TIME_STEP

def market(value: float) -> float:
    return value

if __name__ == "__main__":
    integral = 0
    time = np.arange(500)
    reference = np.zeros(500) + 1
    output = np.zeros(500)
    Kp = 0.9
    Ki = 3

    for i in range(1, 500):
        err_t = reference[i] - output[i-1]
        if i != 1:
            err_t_1 = reference[i-1] - output[i-2]
        else:
            err_t_1 = 0
        integral = integral_rate(integral, Ki, err_t, err_t_1, 0.9)
        output[i] = market(proportional_rate(Kp, err_t) + integral)

    plt.figure()
    plt.plot(time * TIME_STEP, output)
    plt.plot(time * TIME_STEP, reference)
    plt.xlabel("time")
    plt.legend(["response", "reference"])
    plt.savefig("images/pi.png")