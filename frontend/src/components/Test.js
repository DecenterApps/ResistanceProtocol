import React from "react";
import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import MyModal from "./MyModal";
import { Button, VStack, HStack, Text, Tooltip, Box } from "@chakra-ui/react";
import { truncateAddress } from "../utils/general";
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
import ABI from "../constants/ABI";
import Address from "../constants/Address";

export default function Test() {
  const [openModal, setOpenModal] = useState(false);
  const [contract, setContract] = useState();
  const { library, chainId, account, deactivate, active } = useWeb3React();

  const closeModal = () => {
    setOpenModal(false);
  };

  const refreshState = () => {
    window.localStorage.setItem("provider", undefined);
  };

  const disconnect = () => {
    refreshState();
    deactivate();
  };

  useEffect(() => {
    if (library) {
      const contract1 = new library.eth.Contract(ABI.abi1, Address.address1);
      setContract(contract1);
    }
  }, [library]);
  return (
    <div style={{ backgroundColor: "#e7f6f8" }}>
      <MyModal open={openModal} handleClose={closeModal}></MyModal>
      <VStack justifyContent="center" alignItems="center" h="100vh">
        <Box
          w="70%"
          maxHeight="70%"
          borderWidth="1px"
          borderRadius="lg"
          padding="10px"
          backgroundColor="white"
          overflowY="auto"
        >
          <VStack
            justifyContent="center"
            alignItems="center"
            h="70vh"
            marginBottom="30px"
          >
            <HStack>
              {!active ? (
                <Button
                  onClick={() => {
                    setOpenModal(true);
                  }}
                >
                  Connect Wallet
                </Button>
              ) : (
                <Button onClick={disconnect}>Disconnect</Button>
              )}
            </HStack>
            <VStack
              justifyContent="center"
              alignItems="center"
              padding="10px 0"
            >
              <HStack>
                <Text>{`Connection Status: `}</Text>
                {active ? (
                  <CheckCircleIcon color="green" />
                ) : (
                  <WarningIcon color="#cd5700" />
                )}
              </HStack>

              <Tooltip label={account} placement="right">
                <Text>{`Account: ${truncateAddress(account)}`}</Text>
              </Tooltip>
              <Text>{`Network ID: ${chainId ? chainId : "No Network"}`}</Text>
            </VStack>
          </VStack>
        </Box>
      </VStack>
    </div>
  );
}
