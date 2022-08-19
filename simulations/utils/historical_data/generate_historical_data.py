import os

if __name__ == "__main__":
    simulation_data = "../../dataset/simulation_data"
    historical_data = "../../images/external_data/historical/"
    historical_processed = "../../dataset/historical_processed/"
    images = "../../images/simulation_data/"

    os.makedirs(simulation_data, exist_ok = True)
    os.makedirs(historical_data, exist_ok = True)
    os.makedirs(historical_processed, exist_ok = True)
    os.makedirs(images, exist_ok = True)

    exec(open("ether_data_extractor.py").read())
    exec(open("cpi_data_extractor.py").read())