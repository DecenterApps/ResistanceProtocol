import csv

if __name__ == "__main__":
    cpi_data = []
    cpi = []
    with open('../dataset/historic_cpi_data.csv', mode='r') as csvfile:
        csv_reader = csv.DictReader(csvfile)
        line_count = 0
        for row in csv_reader:
            if line_count == 0:
                print(f'Column names are {", ".join(row)}')
                line_count += 1
            cpi_data.append(row["CPIAUCSL"])
            line_count += 1
    
    for i in range(len(cpi_data)):
        value = float(cpi_data[i])
        if i == 0:
            cpi.append(value)
            continue
        
        pow = 28*12
        relative_change = value/float(cpi_data[i-1])
        for j in range(28*12):
            cpi.append(cpi[-1]*relative_change**(1/pow))

    with open('../dataset/real_cpi_value.csv', mode='w') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(cpi)
    
