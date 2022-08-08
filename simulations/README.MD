# NOI Simulations with 2 PID controllers

# Running the simulation

To run the simulation, execute the script sim1.py.
To view and change quantity and parameters of different agents, see file utils/constants.py.

# Seeing the results

When the simulation is finished with executing, a few graphs will appear in the /images folder.
agents.png file represents the amount of ETH each agent group has at the start of every timestamp.
full_graph.png shows data after every transaction.
timestamp_graph.png shows data on the start of every timestamp.

# ETH/USD market price

Data is generated with generate_eth_value.py script.

# Calculation of NOI market price

Market price is mocked with ETH/NOI pool. Its size can be modified in constants file.