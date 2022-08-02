import matplotlib.pyplot as plt

class Graph:
    def __init__(self):
        self.eth = []
        self.noi = []
        self.r_prices = []
        self.m_prices = []
        self.pool_ratio = []
        self.trader_money_ratio = []
        self.redemption_rate = []
        self.redemption_rate_up = []
        self.redemption_rate_down = []
    
    def plot(self):
        figure, axis = plt.subplots(2, 2, figsize=(15,8))
        axis[0, 0].plot(self.m_prices)
        axis[0,0].plot(self.r_prices)
        axis[0,0].legend(['market price', 'redemption price'])
        axis[0, 0].set_title("Market price, Redemption price")
        
        # axis[0, 1].plot(self.pool_ratio)
        # axis[0, 1].set_title("Pool ratio")
        
        axis[1, 0].plot(self.trader_money_ratio)
        axis[1, 0].set_title("Trader money ratio")
        
        # axis[1, 1].plot(self.eth)
        # axis[1, 1].plot(self.noi)
        # axis[1, 1].set_title("Amount of tokens in pool")
        # axis[1, 1].legend(['eth amount', 'noi amount'])

        axis[0, 1].plot(self.eth)
        axis[0, 1].set_title("Amount of eth in pool")
        axis[0, 1].legend(['eth amount'])

        # axis[1, 1].plot(self.noi)
        # axis[1, 1].set_title("Amount of noi in pool")
        # axis[1, 1].legend(['noi amount'])

        axis[1, 1].plot(self.redemption_rate)
        axis[1, 1].plot(self.redemption_rate_up)
        axis[1, 1].plot(self.redemption_rate_down)
        axis[1, 1].set_title("Redemption rate")
        axis[1, 1].legend(['redemption rate'])

        plt.tight_layout()

        plt.savefig('images/graph.png')