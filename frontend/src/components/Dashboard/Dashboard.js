import React, { useEffect, useState } from "react";
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
  Icon,
  Tooltip,
} from "@chakra-ui/react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as TP,
  Filler,
  BarElement,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { FcInfo } from "react-icons/fc";
import Footer from "../Footer/Footer";
import { useWeb3React } from "@web3-react/core";
import { ABI, address } from "../../contracts/EthTwapFeed";
import {ethers} from 'ethers'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  TP,
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
      label: "Redemption price",
      data: [3.14, 3.12, 3.1, 3.08, 3.06, 3.04],
      borderColor: "rgb(255, 99, 132)",
      backgroundColor: "rgba(255, 99, 132, 0.5)",
    },
  ],
};

export default function Dashboard({ bAnimation, setBAnimation }) {
  const { library, chainId, account, activate, deactivate, active } =
    useWeb3React();
  const [ethTwapFeedContract, setEthTwapFeedContract] = useState();
  const [ethPrice, setEthPrice] = useState(0);

  const getEthPrice=async ()=>{
    if (ethTwapFeedContract) {
      console.log(library.getSigner());
      const ethResponse = await ethTwapFeedContract
        .connect(library.getSigner())
        .getEthPrice();
      setEthPrice(ethResponse.div(10**8).toString());
    }
  }

  useEffect(() => {
    if (library) {
      console.log(library);
      const contract1 = new ethers.Contract(address, ABI);
      setEthTwapFeedContract(contract1);
    }
  }, [library]);

  useEffect(() => {
    if (library) {
      console.log(library);
      const contract1 = new ethers.Contract(address, ABI);
      setEthTwapFeedContract(contract1);
    }
  }, []);

  useEffect(() => {
    getEthPrice()
    setInterval(async () => {
      await getEthPrice()
    }, 5000*60);
  }, [ethTwapFeedContract]);

  return (
    <div className="dashboard animated bounceIn">
      <Box>
        <VStack spacing="7vh">
          <HStack spacing="5vw" marginTop={"2vh"}>
            <Box className="div-line1">
              <div className="div-info ">
                <Tooltip label="TO DO: WRITE INFO" placement="right">
                  <div>
                    <FcInfo></FcInfo>
                  </div>
                </Tooltip>
              </div>
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
              <div className="div-info ">
                <Tooltip label="TO DO: WRITE INFO" placement="right">
                  <div>
                    <FcInfo></FcInfo>
                  </div>
                </Tooltip>
              </div>
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
              <div className="div-info ">
                <Tooltip label="TO DO: WRITE INFO" placement="right">
                  <div>
                    <FcInfo></FcInfo>
                  </div>
                </Tooltip>
              </div>
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
                  <div className="div-info ">
                    <Tooltip label="TO DO: WRITE INFO" placement="right">
                      <div>
                        <FcInfo></FcInfo>
                      </div>
                    </Tooltip>
                  </div>
                  <VStack>
                    <div>Stability fee</div>
                    <div className="bold-text">2%</div>
                  </VStack>
                </Box>
                <Box className="div-indiv-line2 ">
                  <div className="div-info ">
                    <Tooltip label="TO DO: WRITE INFO" placement="right">
                      <div>
                        <FcInfo></FcInfo>
                      </div>
                    </Tooltip>
                  </div>
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
                  <div className="div-info ">
                    <Tooltip label="TO DO: WRITE INFO" placement="right">
                      <div>
                        <FcInfo></FcInfo>
                      </div>
                    </Tooltip>
                  </div>
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
                    <div className="div-info ">
                      <Tooltip label="TO DO: WRITE INFO" placement="right">
                        <div>
                          <FcInfo></FcInfo>
                        </div>
                      </Tooltip>
                    </div>
                    <VStack>
                      <div>ERC20 NOI Supply</div>
                      <div className="bold-text">4,664,863</div>
                    </VStack>
                  </Box>
                  <Box className="div-indiv2-line2 ">
                    <div className="div-info ">
                      <Tooltip label="TO DO: WRITE INFO" placement="right">
                        <div>
                          <FcInfo></FcInfo>
                        </div>
                      </Tooltip>
                    </div>
                    <VStack>
                      <div>NOI in Uniswap V2 (NOI/ETH)</div>
                      <div className="bold-text">521,245</div>
                    </VStack>
                  </Box>
                </HStack>
                <Box className="div-indiv3-line2 ">
                  <div className="div-info ">
                    <Tooltip label="TO DO: WRITE INFO" placement="right">
                      <div>
                        <FcInfo></FcInfo>
                      </div>
                    </Tooltip>
                  </div>
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
                  <div className="div-info ">
                    <Tooltip label="TO DO: WRITE INFO" placement="right">
                      <div>
                        <FcInfo></FcInfo>
                      </div>
                    </Tooltip>
                  </div>
                  <VStack>
                    <div>NOI Market Price (TWAP)</div>
                    <div className="bold-text">2.9235 USD</div>
                  </VStack>
                </Box>
                <Box className="div-indiv-line3 ">
                  <div className="div-info ">
                    <Tooltip label="TO DO: WRITE INFO" placement="right">
                      <div>
                        <FcInfo></FcInfo>
                      </div>
                    </Tooltip>
                  </div>
                  <VStack>
                    <div>NOI Redemption Price</div>
                    <div className="bold-text">2.9079 USD</div>
                  </VStack>
                </Box>
                <Box className="div-indiv-line3 ">
                  <div className="div-info ">
                    <Tooltip label="TO DO: WRITE INFO" placement="right">
                      <div>
                        <FcInfo></FcInfo>
                      </div>
                    </Tooltip>
                  </div>
                  <VStack>
                    <div>Market/Redemption Delta (TWAP)</div>
                    <div className="bold-text">0.0156 USD</div>
                  </VStack>
                </Box>
                <Box className="div-indiv-line3 ">
                  <div className="div-info ">
                    <Tooltip label="TO DO: WRITE INFO" placement="right">
                      <div>
                        <FcInfo></FcInfo>
                      </div>
                    </Tooltip>
                  </div>
                  <VStack>
                    <div>ETH Price</div>
                    <div className="bold-text">{ethPrice} USD</div>
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
      <br></br>
      <Footer bAnimation={bAnimation} setBAnimation={setBAnimation}></Footer>
    </div>
  );
}
