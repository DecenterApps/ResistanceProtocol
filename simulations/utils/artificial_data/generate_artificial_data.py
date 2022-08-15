import os

if __name__ == "__main__":
    dataset = "../../dataset/artificial"
    artificial_data = "../../images/external_data/artificial/"
    images = "../../images/simulation_data/"

    os.makedirs(dataset, exist_ok = True)
    os.makedirs(artificial_data, exist_ok = True)
    os.makedirs(images, exist_ok = True)

    exec(open("generate_cpi_value.py").read())
    exec(open("generate_eth_value.py").read())