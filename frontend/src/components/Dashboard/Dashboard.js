import React from "react";
import "./Dashboard.css";
import {
  Flex,
  Spacer,
  Box,
  Grid,
  HStack,
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  VStack,
  Image,
  Center,
} from "@chakra-ui/react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  BarElement,
  Legend,
} from "chart.js";
import { Line,Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export const options = {
  responsive: true,
  plugins: {},
};

const labels1 = [1, 2, 3, 4, 5, 6];

export const data1 = {
  labels: labels1,
  datasets: [
    {
      fill: true,
      label: "RAI issued",
      data: [1, 5, 6, 7, 1, 3],
      borderColor: "rgb(53, 162, 235)",
      backgroundColor: "rgba(53, 162, 235, 0.5)",
    },
  ],
};

const labels2 = [1, 2, 3, 4, 5, 6];

export const data2 = {
  labels: labels2,
  datasets: [
    {
      label: "Redemption rate",
      data: [1, -5, 6, -7, 1, 3],
      backgroundColor: "rgba(53, 162, 235, 0.5)",
    },
  ],
};

const labels3 = [1, 2, 3, 4, 5, 6];

export const data3 = {
  labels: labels3,
  datasets: [
    {
      fill: true,
      label: "Market price",
      data: [2.5, 3.4, 3.5, 3.8, 2.9, 2.6],
      borderColor: "rgb(53, 162, 235)",
      backgroundColor: "rgba(53, 162, 235, 0.5)",
    },
    {
      fill: true,
      label: 'Redemption price',
      data: [3.14,3.12,3.1,3.08,3.06,3.04],
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
    }
  ],
};

export default function Dashboard() {
  return (
    <div className="dashboard animated bounceIn">
      <Box>
        <VStack spacing="7vh">
          <HStack spacing="5vw" marginTop={"2vh"}>
            <Box className="div-line1">
              <VStack>
                <Image
                  src="eth.png"
                  alt=""
                  width={30}
                  height={30}
                  borderRadius="3px"
                />
                <div>Total ETH locked</div>
                <div className="bold-text">29,887 ($50 m)</div>
              </VStack>
            </Box>
            <Box className="div-line1">
              <VStack>
                <Image
                  src="dai.png"
                  alt=""
                  width={30}
                  height={30}
                  borderRadius="3px"
                />
                <div>Outstanding NOI</div>
                <div className="bold-text">5,000,000/10,000,000</div>
              </VStack>
            </Box>
            <Box className="div-line1">
              <VStack>
                <Image
                  src="eth.png"
                  alt=""
                  width={30}
                  height={30}
                  borderRadius="3px"
                />
                <div>Active CDPs</div>
                <div className="bold-text">100</div>
              </VStack>
            </Box>
          </HStack>
          <HStack spacing="5vw" marginTop={"2vh"}>
            <Box className="div-line2">
              <h2 className="h-test">System rates</h2>
              <HStack spacing="2vw">
                <Box className="div-indiv-line2 ">
                  <VStack>
                    <div>Stability fee</div>
                    <div className="bold-text">2%</div>
                  </VStack>
                </Box>
                <Box className="div-indiv-line2 ">
                  <VStack>
                    <div>Redemption rate</div>
                    <div className="bold-text">-8.234%</div>
                    <div>
                      <b>pRate</b>: -8.234%
                    </div>
                    <div>
                      <b>iRate</b>: 0%
                    </div>
                  </VStack>
                </Box>
                <Box className="div-indiv-line2 ">
                  <VStack>
                    <div>Liquidation ratio</div>
                    <div className="bold-text">120%</div>
                  </VStack>
                </Box>
              </HStack>
            </Box>
            <Box className="div-line2">
              <h2 className="h-test">System info</h2>
              <VStack spacing="2vh">
                <HStack spacing="2vw">
                  <Box className="div-indiv2-line2 ">
                    <VStack>
                      <div>ERC20 NOI Supply</div>
                      <div className="bold-text">4,664,863</div>
                    </VStack>
                  </Box>
                  <Box className="div-indiv2-line2 ">
                    <VStack>
                      <div>NOI in Uniswap V2 (NOI/ETH)</div>
                      <div className="bold-text">521,245</div>
                    </VStack>
                  </Box>
                </HStack>
                <Box className="div-indiv3-line2 ">
                  <VStack>
                    <div>NOI in treasury</div>
                    <div className="bold-text">97,026 NOI</div>
                  </VStack>
                </Box>
              </VStack>
            </Box>
          </HStack>
          <HStack>
            <Box className="div-line3">
              <h2 className="h-test">Prices</h2>
              <HStack spacing="2vw">
                <Box className="div-indiv-line3 ">
                  <VStack>
                    <div>NOI Market Price (TWAP)</div>
                    <div className="bold-text">2.9235 USD</div>
                  </VStack>
                </Box>
                <Box className="div-indiv-line3 ">
                  <VStack>
                    <div>NOI Redemption Price</div>
                    <div className="bold-text">2.9079 USD</div>
                  </VStack>
                </Box>
                <Box className="div-indiv-line3 ">
                  <VStack>
                    <div>Market/Redemption Delta (TWAP)</div>
                    <div className="bold-text">0.0156 USD</div>
                  </VStack>
                </Box>
                <Box className="div-indiv-line3 ">
                  <VStack>
                    <div>ETH Price</div>
                    <StatGroup>
                      <Stat>
                        <HStack>
                          <StatNumber>1,750$</StatNumber>
                          <StatHelpText>
                            <StatArrow type="increase" />
                            7.36%
                          </StatHelpText>
                        </HStack>
                      </Stat>
                    </StatGroup>
                  </VStack>
                </Box>
              </HStack>
            </Box>
          </HStack>
          <HStack spacing="5vw">
            <Box className="div-line2">
              <h2 className="h-test">NOI issued</h2>
              <Line options={options} data={data1} />
            </Box>
            <Box className="div-line2">
              <h2 className="h-test">Redemption Rate</h2>
              <Bar options={options} data={data2} />
            </Box>
          </HStack>
          <HStack spacing="5vw">
            <Box className="div-line2">
              <h2 className="h-test">Prices</h2>
              <Line options={options} data={data3} />
            </Box>
          </HStack>
        </VStack>
      </Box>
    </div>
  );
}
