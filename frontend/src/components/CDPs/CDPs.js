import React, { useEffect, useState } from "react";
import "./CDPs.css";
import { Box, VStack, HStack, Image, Button, Tooltip } from "@chakra-ui/react";
import { Chart as ChartJS, ArcElement, Tooltip as TP, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import OpenCdpModal from "../OpenCdpModal/OpenCdpModal";
import { FcInfo } from "react-icons/fc";
import Footer from "../Footer/Footer";
import FirebaseService from "../../services/FirebaseService";
import { useWeb3React } from "@web3-react/core";
import {ethers} from 'ethers'
import { ABI, address } from "../../contracts/CDPManager";

ChartJS.register(ArcElement, TP, Legend);

export default function CDPs({ bAnimation, setBAnimation }) {
  const { library, chainId, account, activate, deactivate, active } =
    useWeb3React();
  const [cdps, setCdps] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const labels = ["Minted", "Left"];

  const closeModal = () => {
    setOpenModal(false);
  };

  const closeCDP=(cdpId)=>{
    const contractCDPManager = new ethers.Contract(address, ABI);
    contractCDPManager
      .connect(library.getSigner())
      .closeCDP(cdpId);
  }

  useEffect(() => {
    FirebaseService.setUpCDPs(setCdps, account);
    const cdpsSorted = [...cdps].sort((c1, c2) => {
      return c1.cr - c2.cr;
    });
    setCdps(cdpsSorted);
  }, []);

  useEffect(() => {
    console.log(cdps);
  }, [cdps]);

  return (
    <>
      <OpenCdpModal open={openModal} handleClose={closeModal}></OpenCdpModal>
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
                  <div className="bold-text">6.3 ($10823)</div>
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
                  <div className="bold-text">2000</div>
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
                  <div className="bold-text">132</div>
                </VStack>
              </Box>
            </HStack>
            <HStack>
              <Box className="cdp-line2">
                <h2 className="h-cdp">My CDPs</h2>
                <Button
                  className="selected-tlbr-btn raise open-btn"
                  onClick={() => {
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
                              <div>{ethers.utils.formatEther(ethers.BigNumber.from(c.col.toString()))} ETH</div>
                            </VStack>
                            <VStack>
                              <div>Minted NOI</div>
                              <div>{c.debt}</div>
                            </VStack>
                            <VStack>
                              <div>Stabillity fee</div>
                              <div>TO DO</div>
                            </VStack>
                            <VStack>
                              <div>CR</div>
                              <div>TO DO</div>
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
                                    data: [c.debt, 5],
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
                              <Button className="selected-tlbr-btn raise">
                                Repay
                              </Button>
                              <Button className="selected-tlbr-btn raise">
                                Mint
                              </Button>
                              <Button className="selected-tlbr-btn raise" onClick={()=>{
                                closeCDP(c.cdpId)
                              }}>
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
