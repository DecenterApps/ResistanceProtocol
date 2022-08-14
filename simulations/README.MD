# NOI Simulations with 2 PID controllers

## Run in Docker

For running the simulations inside a docker container, follow these steps:

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

Whichever option you choose, you will have the dataset/simulation_data folder with values that are going to be used in a simulation. Plots are in the images/simulation_data/ folder. Every time you run scripts for generating data for the simulation, new data will overwrite theese folders, so when you execute the simulation, it will use the most recent data.

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

# Calculation of NOI market price

Market price is mocked with ETH/NOI pool. Its size can be modified in constants file.

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


# Architecture

![](documentation_images/architecture.png?raw=true "Architecture")