import matplotlib.pyplot as plt

class Graph:
    def __init__(self):
        self.eth = []
        self.noi = []
        self.r_prices = []
        self.m_prices = []
        self.pool_ratio = []
        self.trader_money_ratio = []
    
    def plot(self):
        figure, axis = plt.subplots(2, 2)
        axis[0, 0].plot(self.m_prices)
        axis[0,0].plot(self.r_prices)
        axis[0,0].legend(['market price', 'redemption price'])
        axis[0, 0].set_title("Market price, Redemption price")
        
        # For Cosine Function
        axis[0, 1].plot(self.pool_ratio)
        axis[0, 1].set_title("Pool ratio")
        
        # For Tangent Function
        axis[1, 0].plot(self.trader_money_ratio)
        axis[1, 0].set_title("Trader money ratio")
        
        # For Tanh Function
        axis[1, 1].plot(self.eth)
        axis[1, 1].plot(self.noi)
        axis[1, 1].set_title("Amount of tokens in pool")
        axis[1, 1].legend(['eth amount', 'noi amount'])

        plt.tight_layout()

        plt.savefig('images/graph.png')