class ETHData:
    def __init__(self):
        self.eth_dollar = []
        self.substep = 0
        self.previous_state = {}
    
    def get_eth_value(self):
        return self.eth_dollar[self.get_current_timestep()]
    
    #for amount of eth, returns eth value in usd
    def get_eth_value_for_amount(self, eth_amount):
        return eth_amount * self.get_eth_value()

    #for dollar value returns amount of eth
    def get_eth_amount_for_value(self, dollar_value):
        return dollar_value / self.get_eth_value()

    def set_parameters(self, substep, previous_state):
        self.substep = substep
        self.previous_state = previous_state
    
    def get_current_timestep(self):
        if self.substep == 1:
            return self.previous_state['timestep']+1
        return self.previous_state['timestep']