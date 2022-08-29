import React, { useEffect, useState } from "react";
import "./CDPs.css";
import { Box, VStack, HStack, Image, Button, Tooltip } from "@chakra-ui/react";
import { Chart as ChartJS, ArcElement, Tooltip as TP, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import MyInputModal from "../SimpleInputModal/SimpleInputModal";
import OpenCdpModal from "../OpenCdpModal/OpenCdpModal";
import { FcInfo } from "react-icons/fc";
import Footer from "../Footer/Footer";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import Decimal from "decimal.js";
import CDPService from "../../services/CDPService";
import { useNavigate } from "react-router-dom";
import InfoService from '../../services/InfoService'

ChartJS.register(ArcElement, TP, Legend);

export default function CDPs({ bAnimation, setBAnimation }) {
  const { library, account } = useWeb3React();
  const navigation = useNavigate();
  const [cdps, setCdps] = useState([]);
  const [actionType, setActionType] = useState("");
  const [selectedCDP, setSelectedCDP] = useState();
  const [modalTitle, setModalTitle] = useState("");
  const [symbol, setSymbol] = useState("");
  const [ethPrice, setEthPrice] = useState(0);

  const [openModal, setOpenModal] = useState(false);
  const [openCDPModal, setOpenCDPModal] = useState(false);
  const labels = ["Minted", "Left"];

  const closeModal = () => {
    setOpenModal(false);
    setOpenCDPModal(false);
  };

  const getEthPrice = async () => {
    if (library) {
      setEthPrice(await InfoService.getEthPrice(library.getSigner()));
    }
  };

  const modalCallback = async (col, debt) => {
    switch (actionType) {
      case "OPEN": {
        await CDPService.openCDP(col, debt, library, account);
        break;
      }
      case "REPAY": {
        await CDPService.repayCDP(col, library, selectedCDP);
        break;
      }
      case "MINT": {
        await CDPService.mintCDP(col, library, selectedCDP);
        break;
      }
      case "WITHDRAW": {
        await CDPService.withdrawCol(col, library, selectedCDP);
        break;
      }
      case "BOOST": {
        await CDPService.boost(col, library, selectedCDP);
        break;
      }
      case "CLOSE": {
        await CDPService.closeCDP(selectedCDP, library);
        break;
      }
      case "REPAYANDCLOSE": {
        await CDPService.repayAndClose(selectedCDP, library);
        break;
      }
      default:
        break;
    }
    CDPService.loadCDPsForUser(account, library, setCdps);
  };

  useEffect(() => {
    async function fetchData() {
      await CDPService.loadCDPsForUser(account, library, setCdps);
    }
    fetchData();
    getEthPrice();
    let intervalID = setInterval(async () => {
      await getEthPrice();
    }, 5000 * 60);

    return () => {
      clearInterval(intervalID);
    };
  }, []);

  useEffect(() => {
    if (!account) {
      navigation("/dashboard");
    }
  }, [account]);

  return (
    <>
      <MyInputModal
        open={openModal}
        handleClose={closeModal}
        doOnConfirm={modalCallback}
        title={modalTitle}
        symbol={symbol}
      ></MyInputModal>
      <OpenCdpModal
        open={openCDPModal}
        handleClose={closeModal}
        doOnConfirm={modalCallback}
      ></OpenCdpModal>
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
                  <div>Total ETH locked in your CDPs</div>
                  <div className="bold-text">
                    {cdps &&
                      ethers.utils.formatEther(
                        cdps
                          .reduce(
                            (previousValue, currentValue) =>
                              new Decimal(previousValue).add(
                                currentValue["col"]
                              ),
                            0
                          )
                          .toString()
                      )}{" "}
                    ($
                    {cdps &&
                      ethers.utils.formatEther(
                        cdps
                          .reduce(
                            (previousValue, currentValue) =>
                              new Decimal(previousValue).add(
                                currentValue["col"]
                              ),
                            0
                          )
                          .toString()
                      ) * ethPrice}
                    )
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
                  <div>Total Debt</div>

                  <Tooltip
                    label={
                      cdps &&
                      new Decimal(
                        cdps
                          .reduce(
                            (previousValue, currentValue) =>
                              new Decimal(previousValue).add(
                                currentValue["debt"]
                              ),
                            0
                          )
                          .toString()
                      )
                        .div(10 ** 18)
                        .toString()
                    }
                    placement="auto"
                  >
                    <div className="bold-text">
                      {cdps &&
                        new Decimal(
                          cdps
                            .reduce(
                              (previousValue, currentValue) =>
                                new Decimal(previousValue).add(
                                  currentValue["debt"]
                                ),
                              0
                            )
                            .toString()
                        )
                          .div(10 ** 18)
                          .toDP(5)
                          .toString()}{" "}
                      NOI
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
                  <div>Stability fee</div>
                  <Tooltip
                    label={
                      cdps &&
                      new Decimal(
                        cdps
                          .reduce(
                            (previousValue, currentValue) =>
                              new Decimal(previousValue).add(
                                currentValue["sf"]
                              ),
                            0
                          )
                          .toString()
                      )
                        .div(10 ** 18)
                        .toString()
                    }
                    placement="auto"
                  >
                    <div className="bold-text">
                      {cdps &&
                        new Decimal(
                          cdps
                            .reduce(
                              (previousValue, currentValue) =>
                                new Decimal(previousValue).add(
                                  currentValue["sf"]
                                ),
                              0
                            )
                            .toString()
                        )
                          .div(10 ** 18)
                          .toDP(4)
                          .toString()}
                    </div>
                  </Tooltip>
                </VStack>
              </Box>
            </HStack>
            <HStack>
              <Box className="cdp-line2">
                <h2 className="h-cdp">My CDPs</h2>
                <Button
                  className="selected-tlbr-btn raise open-btn"
                  onClick={() => {
                    setActionType("OPEN");
                    setOpenCDPModal(true);
                  }}
                >
                  Open CDP
                </Button>
                <Box className="cdp-line2-holder">
                  <VStack spacing="2vh">
                    {cdps.map((c) => (
                      <Box
                        className={
                          c.cr - c.lr <= 10
                            ? c.cr <= c.lr
                              ? "per-cdp danger"
                              : "per-cdp warning"
                            : "per-cdp"
                        }
                        key={c.cdpId}
                      >
                        <HStack>
                          <HStack spacing="1vw" className="per-cdp-left">
                            <VStack>
                              <div>CDP Id</div>
                              <div>{c.cdpId}</div>
                            </VStack>
                            <VStack>
                              <div>Collateral locked</div>
                              <div>
                                {ethers.utils.formatEther(
                                  new Decimal(c.col.toString()).toString()
                                )}{" "}
                                ETH
                              </div>
                            </VStack>
                            <VStack>
                              <div>Debt</div>
                              <Tooltip
                                label={new Decimal(c.debt.toString())
                                  .div(10 ** 18)
                                  .toString()}
                                placement="auto"
                              >
                                <div>
                                  {new Decimal(c.debt.toString())
                                    .div(10 ** 18)
                                    .toDP(5)
                                    .toString()}{" "}
                                </div>
                              </Tooltip>
                            </VStack>
                            <VStack>
                              <div>Stabillity fee</div>
                              <Tooltip
                                placement="auto"
                                label={new Decimal(c.sf.toString())
                                  .div(10 ** 18)
                                  .toString()}
                              >
                                <div>
                                  {c.sf !== undefined
                                    ? new Decimal(c.sf.toString())
                                        .div(10 ** 18)
                                        .toDP(4)
                                        .toString()
                                    : "Calculating..."}
                                </div>
                              </Tooltip>
                            </VStack>
                            <VStack
                              className={
                                c.cr - c.lr <= 10 &&
                                (c.cr <= c.lr ? "danger-text" : "warning-text")
                              }
                            >
                              <div>CR</div>
                              <div>{c.cr}%</div>
                            </VStack>
                            <VStack>
                              <div>LR</div>
                              <div>{c.lr}%</div>
                            </VStack>
                          </HStack>
                          <HStack className="per-cdp-center">
                            <Pie
                              className="pie"
                              data={{
                                labels,
                                datasets: [
                                  {
                                    label: "CDP Standing",
                                    data: [
                                      ethers.utils.formatEther(
                                        new Decimal(
                                          c.debt.toString()
                                        ).toString()
                                      ),
                                      ethers.utils.formatEther(
                                        new Decimal(
                                          c.left.toString()
                                        ).toString()
                                      ),
                                    ],
                                    borderColor: [
                                      "rgb(53, 162, 235)",
                                      "rgb(255, 99, 132)",
                                    ],
                                    backgroundColor: [
                                      "rgba(53, 162, 235, 0.5)",
                                      "rgba(255, 99, 132, 0.5)",
                                    ],
                                  },
                                ],
                              }}
                            />
                          </HStack>
                          <HStack className="per-cdp-right">
                            <VStack>
                              <Button
                                className="selected-tlbr-btn raise"
                                onClick={() => {
                                  setActionType("WITHDRAW");
                                  setSelectedCDP(c.cdpId);
                                  setModalTitle("Withdraw collateral");
                                  setSymbol("ETH");
                                  setOpenModal(true);
                                }}
                              >
                                Withdraw
                              </Button>
                              <Button
                                className="selected-tlbr-btn raise"
                                onClick={() => {
                                  setActionType("BOOST");
                                  setSelectedCDP(c.cdpId);
                                  setModalTitle("Boost collateral");
                                  setSymbol("ETH");
                                  setOpenModal(true);
                                }}
                              >
                                Boost
                              </Button>
                              <Button
                                className="selected-tlbr-btn raise"
                                onClick={() => {
                                  setActionType("REPAYANDCLOSE");
                                  setSelectedCDP(c.cdpId);
                                  modalCallback();
                                }}
                              >
                                Repay & Close
                              </Button>
                            </VStack>
                            <VStack>
                              <Button
                                className="selected-tlbr-btn raise"
                                onClick={() => {
                                  setActionType("REPAY");
                                  setSelectedCDP(c.cdpId);
                                  setModalTitle("Repay debt");
                                  setSymbol("NOI");
                                  setOpenModal(true);
                                }}
                              >
                                Repay
                              </Button>
                              <Button
                                className="selected-tlbr-btn raise"
                                onClick={() => {
                                  setActionType("MINT");
                                  setSelectedCDP(c.cdpId);
                                  setModalTitle("Mint NOI");
                                  setSymbol("NOI");
                                  setOpenModal(true);
                                }}
                              >
                                Mint
                              </Button>
                              <Button
                                className="selected-tlbr-btn raise"
                                onClick={() => {
                                  setActionType("CLOSE");
                                  setSelectedCDP(c.cdpId);
                                  modalCallback();
                                }}
                              >
                                Close
                              </Button>
                            </VStack>
                          </HStack>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              </Box>
            </HStack>
          </VStack>
          <Footer
            bAnimation={bAnimation}
            setBAnimation={setBAnimation}
          ></Footer>
        </Box>
      </div>
    </>
  );
}
