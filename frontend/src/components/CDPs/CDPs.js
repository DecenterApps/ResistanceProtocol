import React, { useEffect, useState, useRef } from "react";
import "./CDPs.css";
import { Box, VStack, HStack, Image, Button, Tooltip } from "@chakra-ui/react";
import { Chart as ChartJS, ArcElement, Tooltip as TP, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import MyInputModal from "../MyInputModal/MyInputModal";
import { FcInfo } from "react-icons/fc";
import Footer from "../Footer/Footer";
import FirebaseService from "../../services/FirebaseService";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { ABI, address } from "../../contracts/CDPManager";
import { ABI as ABI_NOI, address as address_NOI } from "../../contracts/NOI";
import {
  ABI as ABI_ETH,
  address as address_ETH,
} from "../../contracts/EthTwapFeed";
import Decimal from "decimal.js";

ChartJS.register(ArcElement, TP, Legend);

export default function CDPs({ bAnimation, setBAnimation }) {
  const { library, chainId, account, activate, deactivate, active } =
    useWeb3React();
  const [cdps, setCdps] = useState([]);
  const [actionType, setActionType] = useState("");
  const [selectedCDP, setSelectedCDP] = useState();
  const [modalTitle, setModalTitle] = useState("");
  const [symbol, setSymbol] = useState("");
  const [ethPrice, setEthPrice] = useState(0);

  const [openModal, setOpenModal] = useState(false);
  const labels = ["Minted", "Left"];

  const closeModal = () => {
    setOpenModal(false);
  };

  const getEthPrice = async () => {
    const ethTwapFeedContract = new ethers.Contract(address_ETH, ABI_ETH);
    const ethResponse = await ethTwapFeedContract
      .connect(library.getSigner())
      .getEthPrice();
    setEthPrice(ethResponse.div(10 ** 8).toString());
  };

  const openCDP = (col) => {
    const contractCDPManager = new ethers.Contract(address, ABI);
    contractCDPManager.connect(library.getSigner()).openCDP(account, {
      value: ethers.utils.parseEther(col.toString()),
    });
  };

  const mintCDP = (amount) => {
    const contractCDPManager = new ethers.Contract(address, ABI);
    contractCDPManager
      .connect(library.getSigner())
      .mintFromCDP(selectedCDP, ethers.utils.parseEther(amount.toString()));
  };

  const repayCDP = async (amount) => {
    const contractNOI = new ethers.Contract(address_NOI, ABI_NOI);
    console.log(ethers.utils.parseEther(amount.toString()));
    const txApprove = await contractNOI
      .connect(library.getSigner())
      .approve(address, ethers.utils.parseEther(amount.toString()));
    await listenForTransactionMine(txApprove, library);
    const contractCDPManager = new ethers.Contract(address, ABI);
    const txRepay = await contractCDPManager
      .connect(library.getSigner())
      .repayToCDP(selectedCDP, ethers.utils.parseEther(amount.toString()));
    await listenForTransactionMine(txRepay, library);
  };

  const closeCDP = (cdpId) => {
    const contractCDPManager = new ethers.Contract(address, ABI);
    contractCDPManager.connect(library.getSigner()).closeCDP(cdpId);
  };

  const repayAndClose = async (cdpId) => {
    const contractNOI = new ethers.Contract(address_NOI, ABI_NOI);
    const txApprove = await contractNOI
      .connect(library.getSigner())
      .approve(address, ethers.utils.parseEther("100000000000000000000000000000000"));
    await listenForTransactionMine(txApprove, library);
    const contractCDPManager = new ethers.Contract(address, ABI);
    const txRepayAndClose = await contractCDPManager
      .connect(library.getSigner())
      .repayAndCloseCDP(cdpId);
    await listenForTransactionMine(txRepayAndClose, library);
    
  };

  const withdrawCol = (amount) => {
    const contractCDPManager = new ethers.Contract(address, ABI);
    contractCDPManager
      .connect(library.getSigner())
      .withdrawCollateralFromCDP(
        selectedCDP,
        ethers.utils.parseEther(amount.toString())
      );
  };

  const boost = (amount) => {
    const contractCDPManager = new ethers.Contract(address, ABI);
    contractCDPManager
      .connect(library.getSigner())
      .transferCollateralToCDP(selectedCDP, {
        value: ethers.utils.parseEther(amount.toString()),
      });
  };

  function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`); // create a listener for the blockchain
    return new Promise((resolve, reject) => {
      // listen for this tx to finish
      provider.once(transactionResponse.hash, (transactionReceipt) => {
        console.log(
          `Completed with ${transactionReceipt.confirmations} confirmations`
        ); // we return when resolve or reject is called
        resolve();
      });
    });
  }

  const modalCallback = (col) => {
    switch (actionType) {
      case "OPEN": {
        openCDP(col);
        break;
      }
      case "REPAY": {
        repayCDP(col);
        break;
      }
      case "MINT": {
        mintCDP(col);
        break;
      }
      case "WITHDRAW": {
        withdrawCol(col);
        break;
      }
      case "BOOST": {
        boost(col);
        break;
      }
      default:
        break;
    }
  };

  useEffect(() => {
    async function fetchData() {
      const tempCdps = await FirebaseService.loadCDPs(setCdps, account);
      FirebaseService.setUpCDPs(tempCdps, setCdps, account);
    }
    fetchData();
    getEthPrice();
    setInterval(async () => {
      await getEthPrice();
    }, 5000 * 60);
    /*const cdpsSorted = [...cdps].sort((c1, c2) => {
      return c1.cr - c2.cr;
    });
    setCdps(cdpsSorted);*/
  }, []);

  useEffect(() => {}, [cdps]);

  return (
    <>
      <MyInputModal
        open={openModal}
        handleClose={closeModal}
        doOnConfirm={modalCallback}
        title={modalTitle}
        symbol={symbol}
      ></MyInputModal>
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
                    {ethers.utils.formatEther(
                      cdps
                        .reduce(
                          (previousValue, currentValue) =>
                            previousValue + new Decimal(currentValue["col"]),
                          0
                        )
                        .toString()
                        )}{" "}
                    ($
                    {ethers.utils.formatEther(
                      cdps
                        .reduce(
                          (previousValue, currentValue) =>
                            previousValue + new Decimal(currentValue["col"]),
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
                  <div>Minted NOI</div>
                  <div className="bold-text">
                    {ethers.utils.formatEther(
                      cdps
                        .reduce(
                          (previousValue, currentValue) =>
                            previousValue + new Decimal(currentValue["debt"]),
                          0
                        )
                        .toString()
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
                  <div>Stability fee</div>
                  <div className="bold-text">
                    {ethers.utils.formatEther(
                      cdps
                        .reduce(
                          (previousValue, currentValue) =>
                            previousValue + new Decimal(currentValue["sf"]),
                          0
                        )
                        .toString()
                    )}
                  </div>
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
                    setModalTitle("Open CDP");
                    setSymbol("ETH");
                    setOpenModal(true);
                  }}
                >
                  Open CDP
                </Button>
                <Box className="cdp-line2-holder">
                  <VStack spacing="2vh">
                    {cdps.map((c) => (
                      <Box className="per-cdp" key={c.cdpId}>
                        <HStack>
                          <HStack spacing="1vw" className="per-cdp-left">
                            <VStack>
                              <div>CDP Id</div>
                              <div>{c.cdpId}</div>
                            </VStack>
                            <VStack>
                              <div>Collateral locked</div>
                              <div>
                                {
                                  ethers.utils.formatEther((new Decimal(c.col.toString())).toString())
                                }{" "}
                                ETH
                              </div>
                            </VStack>
                            <VStack>
                              <div>Minted NOI</div>
                              <div>
                                {ethers.utils.formatEther(
                                  (new Decimal(c.debt.toString())).toString()
                                )}{" "}
                              </div>
                            </VStack>
                            <VStack>
                              <div>Stabillity fee</div>
                              <div>
                                {c.sf !== undefined
                                  ? ethers.utils.formatEther((new Decimal(c.sf.toString())).toString())
                                  : "Calculating..."}
                              </div>
                            </VStack>
                            <VStack>
                              <div>CR</div>
                              <div>{c.cr}%</div>
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
                                    data: [1000, 5],
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
                                  repayAndClose(c.cdpId)
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
                                  closeCDP(c.cdpId);
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
