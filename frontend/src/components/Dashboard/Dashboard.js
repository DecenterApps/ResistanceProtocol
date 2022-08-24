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
import { ethers } from "ethers";
import Decimal from "decimal.js";
import FirebaseService from "../../services/FirebaseService";
import InfoService from "../../services/InfoService";

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
  scales: {
    x: {
      ticks: {
        display: false,
      },
    },
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: function (context) {
          return context.parsed.y;
        },
      },
    },
  },
};

export default function Dashboard({
  bAnimation,
  setBAnimation,
  parentSetLoading,
}) {
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
  const [cdpCount, setCdpCount] = useState(0);
  const [noiSupplyHistory, setNOISupplyHistory] = useState([]);
  const [redemptionRateHistory, setRedemptionRateHistory] = useState([]);
  const [redemptionPriceHistory, setRedemptionPriceHistory] = useState([]);
  const [marketPriceHistory, setMarketPriceHistory] = useState([]);
  const [noiSurplus, setNoiSurplus] = useState(0);
  const [noiInTreasury, setNoiInTreasury] = useState(0);
  const [globalCR, setGlobalCR] = useState(0);
  const [limitCR, setLimitCR] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    FirebaseService.setUpNOITracking(setNOISupplyHistory);
    FirebaseService.setUpMPTracking(setMarketPriceHistory);
    FirebaseService.setUpRPTracking(setRedemptionPriceHistory);
    FirebaseService.setUpRRTracking(setRedemptionRateHistory);

    return () => {
      FirebaseService.closeConnection();
    }

  }, []);

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
    setEthPrice(await InfoService.getEthPrice(signer));
    setTotalEth(await InfoService.getTotalEth(signer));
    setLR(await InfoService.getLR(signer));
    setSF(await InfoService.getSF(signer));
    setRR(await InfoService.getRedemptionRate(signer));
    setRedemptionPrice(await InfoService.getRedemptionPrice(signer));
    setMarketPrice(await InfoService.getMarketPrice(signer));
    setNOISupply(await InfoService.getNOISupply(signer));
    setCdpCount(await InfoService.getCdpCount(signer));
    setNoiInTreasury(await InfoService.getTreasuryNoi(signer));
    setNoiSurplus(await InfoService.getNoiSurplus(signer));
    setGlobalCR(await InfoService.getGlobalCR(signer));
    setLimitCR(await InfoService.getCRLimit(signer));
    try {
      setPTerm(await InfoService.getProportionalTerm(signer));
      setITerm(await InfoService.getIntegralTerm(signer));
    } catch {}

    setLoading(false);
    parentSetLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    parentSetLoading(true);
    updateInfo();
    let intervalID=setInterval(async () => {
      await updateInfo();
    }, 5000 * 60);

    return () => {
      clearInterval(intervalID);
    }

  }, [library]);
  

  if (loading) {
    return <></>;
  } else {
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
                    {new Decimal(totalEth.toString()).div(10 ** 18).toString()}{" "}
                    ($
                    {new Decimal(totalEth.toString())
                      .div(10 ** 18)
                      .mul(ethPrice)
                      .toString()}
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
                  <Tooltip
                    placement="auto"
                    label={new Decimal(noiSupply.toString())
                      .add(new Decimal(noiSurplus.toString()))
                      .div(10 ** 18)
                      .toString()}
                  >
                    <div className="bold-text">
                      {new Decimal(noiSupply.toString())
                        .add(new Decimal(noiSurplus.toString()))
                        .div(10 ** 18)
                        .toDP(5)
                        .toString()}
                    </div>
                  </Tooltip>
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
                  <div className="bold-text">{cdpCount.toString()}</div>
                </VStack>
              </Box>
            </HStack>
            <HStack spacing="5vw" marginTop={"2vh"}>
              <Box className="div-line2">
                <h2 className="h-test">System rates</h2>
                <VStack spacing="2vh">
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
                        <Tooltip
                          placement="auto"
                          label={new Decimal(rr.toString())
                            .div(10 ** 27)
                            .sub(1)
                            .toString()}
                        >
                          <div className="bold-text">
                            {new Decimal(rr.toString())
                              .div(10 ** 27)
                              .sub(1)
                              .toDP(5)
                              .toString()}
                            %
                          </div>
                        </Tooltip>
                        <div>
                          <b>pRate</b>:{pTerm}%
                        </div>
                        <div>
                          <b>iRate</b>: {iTerm}%
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
                        <div>Global CR</div>
                        <div className="bold-text">{globalCR.toString()} %</div>
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
                        <div>Limit For Global CR</div>
                        <div className="bold-text">{limitCR.toString()} %</div>
                      </VStack>
                    </Box>
                  </HStack>
                </VStack>
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
                        <Tooltip
                          placement="auto"
                          label={new Decimal(noiSupply.toString())
                            .div(10 ** 18)
                            .toString()}
                        >
                          <div className="bold-text">
                            {new Decimal(noiSupply.toString())
                              .div(10 ** 18)
                              .toDP(2)
                              .toString()}
                          </div>
                        </Tooltip>
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
                        <div>NOI surplus</div>
                        <Tooltip
                          placement="auto"
                          label={new Decimal(noiSurplus.toString())
                            .div(10 ** 18)
                            .toString()}
                        >
                          <div className="bold-text">
                            {new Decimal(noiSurplus.toString())
                              .div(10 ** 18)
                              .toDP(5)
                              .toString()}
                          </div>
                        </Tooltip>
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
                        <div>NOI in treasury</div>
                        <Tooltip
                          placement="auto"
                          label={new Decimal(noiInTreasury.toString())
                            .div(10 ** 18)
                            .toString()}
                        >
                          <div className="bold-text">
                            {new Decimal(noiInTreasury.toString())
                              .div(10 ** 18)
                              .toDP(2)
                              .toString()}
                          </div>
                        </Tooltip>
                      </VStack>
                    </Box>
                  </HStack>
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
                      <Tooltip
                        placement="auto"
                        label={new Decimal(marketPrice.toString())
                          .div(10 ** 8)
                          .toString()}
                      >
                        <div className="bold-text">
                          {" "}
                          {new Decimal(marketPrice.toString())
                            .div(10 ** 8)
                            .toDP(5)
                            .toString()}{" "}
                          USD
                        </div>
                      </Tooltip>
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
                      <Tooltip
                        placement="auto"
                        label={new Decimal(redemptionPrice.toString())
                          .div(10 ** 27)
                          .toString()}
                      >
                        <div className="bold-text">
                          {new Decimal(redemptionPrice.toString())
                            .div(10 ** 27)
                            .toDP(5)
                            .toString()}{" "}
                          USD
                        </div>
                      </Tooltip>
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
                      <Tooltip
                        placement="auto"
                        label={new Decimal(marketPrice.toString())
                          .div(10 ** 8)
                          .sub(
                            new Decimal(redemptionPrice.toString()).div(
                              10 ** 27
                            )
                          )
                          .toString()}
                      >
                        <div className="bold-text">
                          {new Decimal(marketPrice.toString())
                            .div(10 ** 8)
                            .sub(
                              new Decimal(redemptionPrice.toString()).div(
                                10 ** 27
                              )
                            )
                            .toDP(5)
                            .toString()}{" "}
                          USD
                        </div>
                      </Tooltip>
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
                <Line
                  options={options}
                  data={{
                    labels: noiSupplyHistory.map((e) =>
                      new Date(e["timestamp"] * 1000).toLocaleString("en-US")
                    ),
                    datasets: [
                      {
                        fill: true,
                        label: "NOI issued",
                        data: noiSupplyHistory.map((e) =>
                          new Decimal(e["supply"]).div(10 ** 18).toString()
                        ),
                        borderColor: "rgb(53, 162, 235)",
                        backgroundColor: "rgba(53, 162, 235, 0.5)",
                      },
                    ],
                  }}
                />
              </Box>
              <Box className="div-line2">
                <h2 className="h-test">Redemption Rate</h2>
                <Bar
                  options={options}
                  data={{
                    labels: redemptionRateHistory.map((e) =>
                      new Date(e["timestamp"] * 1000).toLocaleString("en-US")
                    ),
                    datasets: [
                      {
                        label: "Redemption rate",
                        data: redemptionRateHistory.map((e) =>
                          new Decimal(e["redemptionRate"])
                            .div(10 ** 27)
                            .toString()
                        ),
                        backgroundColor: "rgba(53, 162, 235, 0.5)",
                      },
                    ],
                  }}
                />
              </Box>
            </HStack>
            <HStack spacing="5vw">
              <Box className="div-line2">
                <h2 className="h-test">Prices</h2>
                <Line
                  options={{
                    ...options,
                  }}
                  data={{
                    labels: marketPriceHistory.map((e) =>
                      new Date(e["timestamp"] * 1000).toLocaleString("en-US")
                    ),
                    datasets: [
                      {
                        fill: true,
                        label: "Market price",
                        data: marketPriceHistory.map((e) =>
                          new Decimal(e["price"]).div(10 ** 8).toString()
                        ),
                        borderColor: "rgb(53, 162, 235)",
                        backgroundColor: "rgba(53, 162, 235, 0.5)",
                      },
                      {
                        fill: true,
                        label: "Redemption price",
                        data: redemptionPriceHistory.map((e) =>
                          new Decimal(e["price"]).div(10 ** 27).toString()
                        ),
                        borderColor: "rgb(255, 99, 132)",
                        backgroundColor: "rgba(255, 99, 132, 0.5)",
                      },
                    ],
                  }}
                />
              </Box>
            </HStack>
          </VStack>
        </Box>
        <br></br>
        <Footer bAnimation={bAnimation} setBAnimation={setBAnimation}></Footer>
      </div>
    );
  }
}
