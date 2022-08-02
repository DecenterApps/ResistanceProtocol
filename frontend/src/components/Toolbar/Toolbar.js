import React from "react";
import "./Toolbar.css";
import { HStack, Button, Tooltip, Text } from "@chakra-ui/react";
import { VscHome, VscPulse } from "react-icons/vsc";
import { useWeb3React } from "@web3-react/core";
import { truncateAddress } from "../../utils/general";

export default function Toolbar({ onOpenModal, setShow, show, onDisconnect }) {
  const { chainId, account, active, chain } = useWeb3React();

  const disconnect = () => {
    setShow("Dashboard");
    onDisconnect();
  };

  return (
    <div className="toolbar animated bounceInLeft">
      <HStack>
        <div className="toolbar-left">
          <Tooltip label={account} placement="right">
            <Text className="address-text">{`${truncateAddress(
              account
            )}`}</Text>
          </Tooltip>
        </div>
        <div className="toolbar-right">
          <HStack spacing="2vw">
            <Button
              leftIcon={<VscHome />}
              className={
                show === "Dashboard"
                  ? "selected-tlbr-btn raise"
                  : "tlbr-btn raise"
              }
              onClick={() => {
                setShow("Dashboard");
              }}
            >
              Dashboard
            </Button>
            {active && (
              <Button
                leftIcon={<VscPulse />}
                className={
                  show === "CDPs" ? "selected-tlbr-btn raise" : "tlbr-btn raise"
                }
                onClick={() => {
                  setShow("CDPs");
                }}
              >
                My CDPs
              </Button>
            )}
            {!active ? (
              <Button className="connect-btn raise" onClick={onOpenModal}>
                Connect
              </Button>
            ) : (
              <Button className="connect-btn raise" onClick={disconnect}>
                Disconnect
              </Button>
            )}
          </HStack>
        </div>
      </HStack>
    </div>
  );
}
