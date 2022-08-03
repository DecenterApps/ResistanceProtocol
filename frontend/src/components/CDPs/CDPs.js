import React, { useEffect, useState } from "react";
import "./CDPs.css";
import { Box, VStack, HStack, Image, Button, Tooltip } from "@chakra-ui/react";
import { Chart as ChartJS, ArcElement, Tooltip as TP, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import OpenCdpModal from "../OpenCdpModal/OpenCdpModal";
import { FcInfo } from "react-icons/fc";
import Footer from '../Footer/Footer'

ChartJS.register(ArcElement, TP, Legend);

export default function CDPs({bAnimation,setBAnimation}) {
  const [cdps, setCdps] = useState([
    {
      id: 1,
      col: 0.22,
      minted: 200,
      fee: 3,
      cr: 135,
    },
    {
      id: 2,
      col: 0.22,
      minted: 200,
      fee: 3,
      cr: 135,
    },
    {
      id: 3,
      col: 0.22,
      minted: 200,
      fee: 3,
      cr: 130,
    },
    {
      id: 4,
      col: 0.22,
      minted: 200,
      fee: 3,
      cr: 135,
    },
    {
      id: 5,
      col: 0.22,
      minted: 200,
      fee: 3,
      cr: 135,
    },
    {
      id: 6,
      col: 0.22,
      minted: 200,
      fee: 3,
      cr: 135,
    },
    {
      id: 7,
      col: 0.22,
      minted: 200,
      fee: 3,
      cr: 135,
    },
    {
      id: 8,
      col: 0.22,
      minted: 200,
      fee: 3,
      cr: 125,
    },
    {
      id: 9,
      col: 0.22,
      minted: 200,
      fee: 3,
      cr: 135,
    },
    {
      id: 10,
      col: 0.22,
      minted: 200,
      fee: 3,
      cr: 135,
    },
  ]);

  const [openModal, setOpenModal] = useState(false);
  const labels = ["Minted", "Left"];

  const closeModal = () => {
    setOpenModal(false);
  };

  useEffect(() => {
    const cdpsSorted = [...cdps].sort((c1, c2) => {
      return c1.cr - c2.cr;
    });
    setCdps(cdpsSorted);
  }, []);

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
                <h2 className="h-cdp">Your CDPs</h2>
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
                      <Box className="per-cdp" key={c.id}>
                        <HStack>
                          <HStack spacing="1vw" className="per-cdp-left">
                            <VStack>
                              <div>CDP Id</div>
                              <div>{c.id}</div>
                            </VStack>
                            <VStack>
                              <div>Collateral locked</div>
                              <div>{c.col}</div>
                            </VStack>
                            <VStack>
                              <div>Minted NOI</div>
                              <div>{c.minted}</div>
                            </VStack>
                            <VStack>
                              <div>Stabillity fee</div>
                              <div>{c.fee}</div>
                            </VStack>
                            <VStack>
                              <div>CR</div>
                              <div>{c.cr}</div>
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
                                    data: [c.minted, 5],
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
                              <Button className="selected-tlbr-btn raise">
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
          <Footer bAnimation={bAnimation} setBAnimation={setBAnimation}></Footer>
        </Box>
      </div>
    </>
  );
}
