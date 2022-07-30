class ETHData:
    def __init__(self):
        self.eth_dollar = []
    
    def get_eth_value(self, substep, previous_state):
        return self.eth_dollar[get_current_timestep(substep, previous_state)]
    
    #for amount of eth, returns eth value in usd
    def get_eth_value_for_amount(self, eth_amount, substep, previous_state):
        return eth_amount * self.get_eth_value(substep, previous_state)

    #for dollar value returns amount of eth
    def get_eth_amount_for_value(self, dollar_value, substep, previous_state):
        return dollar_value / self.get_eth_value(substep, previous_state)

def get_current_timestep(cur_substep, previous_state):
    if cur_substep == 1:
        return previous_state['timestep']+1
    return previous_state['timestep']