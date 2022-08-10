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
import {
  ABI as ABI_CDPMANAGER,
  address as address_CDPMANAGER,
} from "../../contracts/CDPManager";
import {
  ABI as ABI_PARAMETERS,
  address as address_PARAMETERS,
} from "../../contracts/Parameters";
import {
  ABI as ABI_RATESETTER,
  address as address_RATESETTER,
} from "../../contracts/RateSetter";
import {
  ABI as ABI_MARKET,
  address as address_MARKET,
} from "../../contracts/MarketTwapFeed";
import { ABI as ABI_NOI, address as address_NOI } from "../../contracts/NOI";
import {ABI as ABI_CONTROLLER, address as address_CONTROLLER} from '../../contracts/AbsPiController'
import { ethers } from "ethers";
import Decimal from "decimal.js";

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
  const [ethPrice, setEthPrice] = useState(0);
  const [totalEth, setTotalEth] = useState(0);
  const [sf, setSF] = useState(0);
  const [lr, setLR] = useState(0);
  const [rr, setRR] = useState(0);
  const [redemptionPrice, setRedemptionPrice] = useState(0);
  const [marketPrice, setMarketPrice] = useState(0);
  const [noiSupply, setNOISupply] = useState(0);
  const [pTerm, setPTerm] = useState(0);
  const [iTerm, setITerm] = useState(0);

  const getEthPrice = async (signer) => {
    const ethTwapFeedContract = new ethers.Contract(address, ABI);
    const ethResponse = await ethTwapFeedContract.connect(signer).getTwap();
    setEthPrice(ethResponse.div(10 ** 8).toString());
  };

  const getTotalEth = async (signer) => {
    const contractCDPManager = new ethers.Contract(
      address_CDPMANAGER,
      ABI_CDPMANAGER
    );
    const ethResponse = await contractCDPManager
      .connect(signer)
      .getTotalSupply();
    setTotalEth(ethResponse);
  };

  const getSF = async (signer) => {
    const contractPARAMETERS = new ethers.Contract(
      address_PARAMETERS,
      ABI_PARAMETERS
    );
    const sfResponse = await contractPARAMETERS.connect(signer).getSF();
    setSF(sfResponse);
  };

  const getLR = async (signer) => {
    const contractPARAMETERS = new ethers.Contract(
      address_PARAMETERS,
      ABI_PARAMETERS
    );
    const lrResponse = await contractPARAMETERS.connect(signer).getLR();
    setLR(lrResponse);
  };

  const getRedemptionRate = async (signer) => {
    const contractRATESETTER = new ethers.Contract(
      address_RATESETTER,
      ABI_RATESETTER
    );
    const rrResponse = await contractRATESETTER
      .connect(signer)
      .getRedemptionRate();
    setRR(rrResponse);
  };

  const getRedemptionPrice = async (signer) => {
    const contractRATESETTER = new ethers.Contract(
      address_RATESETTER,
      ABI_RATESETTER
    );
    const rpResponse = await contractRATESETTER
      .connect(signer)
      .getRedemptionPrice();
    setRedemptionPrice(rpResponse);
  };

  const getMarketPrice = async (signer) => {
    const contractMARKET = new ethers.Contract(address_MARKET, ABI_MARKET);
    const marketResponse = await contractMARKET.connect(signer).getTwap();
    setMarketPrice(marketResponse);
  };

  const getNOISupply = async (signer) => {
    const contractNOI = new ethers.Contract(address_NOI, ABI_NOI);
    const noiResponse = await contractNOI.connect(signer).totalSupply();
    setNOISupply(noiResponse);
  };

  const getProportionalTerm= async (signer)=>{
    const contractCONTROLLER = new ethers.Contract(address_CONTROLLER, ABI_CONTROLLER);
    const pResponse = await contractCONTROLLER.connect(signer).getLastProportionalTerm();
    setPTerm(pResponse);
  }

  const getIntegralTerm= async (signer)=>{
    const contractCONTROLLER = new ethers.Contract(address_CONTROLLER, ABI_CONTROLLER);
    const iResponse = await contractCONTROLLER.connect(signer).getLastIntegralTerm();
    setITerm(iResponse);
  }

  useEffect(() => {}, [library]);

  const updateInfo = async () => {
    let signer;
    if (library) {
      signer = library.getSigner();
    } else {
      const provider = new ethers.providers.JsonRpcProvider(
        "http://127.0.0.1:8545/"
      );
      signer = provider.getSigner();
    }
    await getEthPrice(signer);
    await getTotalEth(signer);
    await getLR(signer);
    await getSF(signer);
    await getRedemptionRate(signer);
    await getRedemptionPrice(signer);
    await getMarketPrice(signer);
    await getNOISupply(signer);
    await getProportionalTerm(signer);
  };

  useEffect(() => {
    updateInfo();
    setInterval(async () => {
      await updateInfo();
    }, 5000 * 60);
  }, [library]);

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
                <div className="bold-text">
                  {ethers.utils.formatEther(
                    new Decimal(totalEth.toString()).toString()
                  )}{" "}
                  ($
                  {ethers.utils.formatEther(
                    new Decimal(totalEth.toString()).toString()
                  ) * ethPrice}
                  ){" "}
                </div>
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
                <div className="bold-text">
                  {ethers.utils.formatEther(
                    new Decimal(noiSupply.toString()).toString()
                  )}
                </div>
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
                <div className="bold-text">TO DO</div>
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
                    <div className="bold-text">{sf}%</div>
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
                    <div className="bold-text">
                      {new Decimal(rr.toString()).div(10 ** 27).toString()}%
                    </div>
                    <div>
                      <b>pRate</b>:{new Decimal(pTerm.toString()).div(10 ** 27).toString()}%
                    </div>
                    <div>
                      <b>iRate</b>: {new Decimal(iTerm.toString()).div(10 ** 27).toString()}%
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
                    <div className="bold-text">{lr}%</div>
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
                      <div className="bold-text">
                        {ethers.utils.formatEther(
                          new Decimal(noiSupply.toString()).toString()
                        )}
                      </div>
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
                      <div className="bold-text">TO DO</div>
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
                    <div className="bold-text">TO DO</div>
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
                    <div className="bold-text">
                      {" "}
                      {new Decimal(marketPrice.toString())
                        .div(10 ** 8)
                        .toString()}{" "}
                      USD
                    </div>
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
                    <div className="bold-text">
                      {new Decimal(redemptionPrice.toString())
                        .div(10 ** 27)
                        .toString()}{" "}
                      USD
                    </div>
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
                    <div className="bold-text">
                      {new Decimal(marketPrice.toString())
                        .div(10 ** 8)
                        .sub(
                          new Decimal(redemptionPrice.toString()).div(10 ** 27)
                        )
                        .toString()}{" "}
                      USD
                    </div>
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
