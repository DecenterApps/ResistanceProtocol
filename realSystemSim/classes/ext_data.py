class ExtData:
    def __init__(self):
        self.eth_dollar = []
        self.cpi_value = []
        self.timestamp = 0
        self.previous_state = {}
        self.eth_prediction = 0
    
    def get_eth_value(self):
        return self.eth_dollar[self.timestamp]
    
    def get_cpi_value(self):
        return self.cpi_value[self.timestamp]
    
    #for amount of eth, returns eth value in usd
    def get_eth_value_for_amount(self, eth_amount):
        return eth_amount * self.get_eth_value()

    #for dollar value returns amount of eth
    def get_eth_amount_for_value(self, dollar_value):
        return dollar_value / self.get_eth_value()

    def set_parameters(self, timestamp):
        self.timestamp = timestamp

    def set_fresh_eth_prediction(self):
        self.eth_prediction = 0
        # self.eth_prediction = svm_prediction(np.array(self.eth_dollar))
    
    def get_current_timestep(self):
        return self.eth_dollar[self.timestamp]