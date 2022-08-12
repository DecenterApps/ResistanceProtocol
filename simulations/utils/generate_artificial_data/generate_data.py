import os

if __name__ == "__main__":
    dataset = "../../dataset/"
    images = "../../images/"

    os.makedirs(dataset, exist_ok = True)
    os.makedirs(images, exist_ok = True)

    exec(open("generate_cpi_value.py").read())
    exec(open("generate_eth_value.py").read())