import os

if __name__ == "__main__":
    dataset = "../../dataset/"
    historical_data = "../../images/external_data/historical/"
    images = "../../images/simulation_data/"

    os.makedirs(dataset, exist_ok = True)
    os.makedirs(historical_data, exist_ok = True)
    os.makedirs(images, exist_ok = True)

    exec(open("ether_data_extractor.py").read())
    exec(open("cpi_data_extractor.py").read())