# NOI Simulations with 2 PID controllers

## Run in Docker

For running the simulations inside a docker container, follow these steps(Ubuntu):

1. [Setup docker on your local machine](https://docs.docker.com/engine/install/ubuntu/)
2. In the root folder(ResistanceProtocol/) build the dockerfile: **docker build -t simulation .**
3. Start the container: **sudo docker run -it simulation /bin/bash**

## Creating external data

Before executing the simulation, external data needs to be created. External data are ETH/USD price and CPI values. NOI market does not affect these values, so they are created independently.

### Historical data

Folder /dataset/historical contains real world data about ether price and cpi data. To use these two files, execute the script **/utils/historical_data/generate_historical_data.py**. This script will make two files in /dataset/historical_processed, in the format needed in simulation, and plot 2 graphs in /images/external_data/historical/ folder. Because we have more data than we need for the simulation, a random moment in time will be picked and that data will be used in the simulation.

### Artificial data

To create artificial data about cpi values and eth/usd market price, run script **utils/artificial_data/generate_artificial_data.py**.
This will create 2 files in /dataset/artificial folder. Also, you will have 2 plots in images/external_data/artificial folder to view the data.
You can also call the scripts generate_eth_value.py and generate_cpi_value.py independently.

Whichever option you choose, you will have the dataset/simulation_data folder with values that are going to be used in a simulation. Plots are in the images/simulation_data/ folder. Every time you run scripts for generating data for the simulation, new data will overwrite these folders, so when you execute the simulation, it will use the most recent data.

#### Generate ETH script
There are some quite useful parameters that the generate_eth_value.py script accepts. Run the command  **python utils/artificial_data/generate_eth_value.py -h** to see the details. You can choose the direction where ETH price is heading, number of samples you want to create(by default, the number of samples that is going to be created is in the constants.py file), and how stable ETH price is.

_-o Parameter: ETH_Trend_Growth, range(-10,10)  
-n Parameter: Number of samples  
 -s Parameter: Stability of the eth price, 1 - low, 10 - high_

| ETH/USD  |
| :---: |
| ![Alt text](documentation_images/eth_dollar.png?raw=true "Title") |

| CPI value |
| :---: |
| ![Alt text](documentation_images/cpi_value.png?raw=true "Title") |

There are 1000 timestamps, and the duration of one timestamp is approximately 3 hours, so that means the simulation simulates the period of around 4 months.

# Running the simulation

To run the simulation, execute the script sim1.py.
To view and change quantity and parameters of different agents, see file utils/constants.py.

## Multiple runs

To execute multiple simulations with different parameters, you can modify the /parameters.py file, where you can change the number of agents in each simulation. When you execute the simulation, you will see information about each run in less detail in files /images/timestamp_graphs and /images/full_graphs, and detail information for the last executed simulation.

## Seeing the results

When the simulation is finished with executing, a few graphs will appear in the /images folder.
agents.png file represents the amount of ETH and NOI each agent group has at the start of every timestamp.

![](documentation_images/agents.png?raw=true "Agents ETH/NOI balances")

full_graph.png(1) shows data after every transaction, and timestamp_graph.png(2) shows information on the start of every timestamp.
| 1 | 2|
| :---: | :---: |
|![](documentation_images/full_graph.png?raw=true "Full graph") | ![Alt text](documentation_images/timestamp_graph.png?raw=true "Timestamp graph")|

Timestamp graph is convenient to see the market price trend, and full graph is useful to see how the market reacts to sudden changes of the market price(from malicious whales).

| Controller values|
| :---: |
|![](documentation_images/controller_values.png?raw=true "Full graph") |

More info...

## Calculation of NOI market price

Market price is mocked with ETH/NOI pool. Its size can be modified in constants file.

## ETH price prediction

Some agents make decisions based on the ETH price prediction. ETH prediction is done with SVM model(see /classes/regression.py). Training and prediction is done when the eth/usd price is generated, to speed up the simulation.

# Agents

There are several agents in the simulation. They are divided into 2 main groups.

| Traders | Safe Holders|
| :---: | :---: |
| Rate traders | Regular SAFE owners |
| Price traders | Leveragers |
| Random traders |
| NOI trusters |
| Whale instant price setters |
| Whale instant rate setters |
| Whale longterm price setters | 

## Traders
Traders are agents who only make transactions to the ETH/NOI pool, and don't open positions. They buy/sell NOI at market price value, and make decisions based on the market and redemption price gap, and redemption rate.

---
## Rate Trader

Rate trader is an agent which swaps NOI/ETH when the redemption rate exceeds certain threshold. Each rate traders has percentage amount, a parameter that determines percent of their capital that they put for every trade. Also, it has Min/Max redemption rate, if the redemption rate is not in theese boundaries, Rate Trader is being activated.

| Sell NOI | Buy NOI |
| :---: | :---: |
| Redemption rate < Min redemption rate and market price > redemption price | Redemption rate > Max redemption rate and market price < redemption price |
---
## Price Trader

Price trader is an agent which swaps NOI/ETH when the relative difference between market and redemption price exceeds certain threshold. Each price traders has percentage amount, a parameter that determines percent of their capital that they put for every trade. Also, it has Max relative difference, if the absolute value of the gap is not in theese boundaries, Price Trader is being activated.

| Sell NOI | Buy NOI |
| :---: | :---: |
| abs(Relative difference) < Max relative difference and market price > redemption price | abs(Relative difference) < Max relative difference and market price < redemption price |
---
## Random trader

Just random.

---
## Noi Truster

Noi Truster is an agent that waits for the opportunity to buy NOI when it's cheap, and then holds it forever.

| Sell NOI | Buy NOI |
| :---: | :---: |
| - | abs(Relative difference) > Max relative difference and market price < redemption price |

---
## Whale Instant Price Setter

Whale Instant Price Setter tries to manipulate the market price buy buying or selling all NOI at once, and pushing market price even further from the redemption price. This trader is activated when relative difference between market and redemption price exceeds certain threshold.

| Sell NOI | Buy NOI |
| :---: | :---: |
| abs(Relative difference) > Max relative difference and market price < redemption price | abs(Relative difference) > Max relative difference and market price > redemption price |
---
## Whale Instant Rate Setter

Whale Instant Rate Setter tries to manipulate the market price buy buying or selling all NOI at once, and pushing market price even further from the redemption price. This trader is activated when redemption rate exceeds certain threshold.

| Sell NOI | Buy NOI |
| :---: | :---: |
| Current Redemption rate < Min Redemption rate and market price > redemption price | Current Redemption rate > Max Redemption rate and market price < redemption price |
---
## Whale Longterm Price Setter

Whale Instant Rate Setter tries to manipulate the market price buy buying or selling 10% NOI at once, and pushing market price even further from the redemption price. Then, in every timestamp after that, it tries to sustain the relative difference between market and redemption price, and mess with the Integral term in the PI controller. If the current gap is further from the targetted gap, it puts more funds. It stops when it runs out of funds.

---
## Safe holders

Safe holders are agents who open CDP positions, and try to maintain initial CR of their position. They try to not get liquidated, and do the boost and repay actions, which differs on the type of agent. Boost action is an action that has a goal to lower the CR, and repay action increases safe holder's CR.  Same as Traders, they make decisions based on market price, redemption price, and redemption rate, but also based on the ETH prediction. If the ETH/USD price has a growing trend, they will open position, and close their positions otherwise. Each agent has its percentage of how much it is incentivised by ETH prediction. Safe holders start with only ETH capital.

## Leverager

Leverager is a Safe owner which leverages its ETH collateral. It opens a position when the redemption price is lower than market price more then some threshold relative difference, or when ETH has a growing trend. It can also close its position otherwise. To maintain its CR, it does boost and repay actions. In boost operation, leverager firstly takes out more loan in NOI, change that NOI to ETH on the market, and then put it in collateral. That increases its exposure to ETH. When leverager does the repay action, it takes out some amount from the collateral, change that to NOI on the market price, and use it to pay back part of the debt.
||
|:---:|
![](documentation_images/leverager_actions.png?raw=true "Leverager actions")

But why are there different values for the collateral and debt? That is because we take out NOI at redemption price, and sell it at market price, or buy it at market price, and then pay back the loan at redemption price. To calculate how much NOI we need to take out to boost our position to a targetted CR, we need to solve this system of equations:
||
|:---:|
![](documentation_images/leverager_equations.png?raw=true "Equations")

When we substitute y in the first equation we get:
||
|:---:|
![](documentation_images/equation.png?raw=true "Equations")

This is a classic quadratic equation:
||
|:---:|
![](documentation_images/quadratic_equation.png?raw=true "Equations")

Similar goes for repay action.

## Safe owner

Safe owner is similar to a Leverager, but its boost and repay actions are different. When a safe owner boosts its position, it takes out some amout of collateral and keeps it for himself. For repay, it takes some of its internal funds, buys NOI on the market, and pays back a part of the debt.

# Architecture
||
|:---:|
![](documentation_images/architecture.png?raw=true "Architecture")