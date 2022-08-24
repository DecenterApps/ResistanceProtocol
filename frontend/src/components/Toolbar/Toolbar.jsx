import React,{useState} from "react";
import "./Toolbar.css";
import { HStack, Button, Tooltip, Text, Image } from "@chakra-ui/react";
import { VscHome, VscPulse } from "react-icons/vsc";
import { useWeb3React } from "@web3-react/core";
import { truncateAddress } from "../../utils/general";
import {useNavigate } from "react-router-dom";

export default function Toolbar({ onOpenModal}) {
  const {  account,  deactivate,active} = useWeb3React();
  const [show,setShow]=useState("Dashboard")

  const navigation=useNavigate();

  const disconnect = () => {
    setShow("Dashboard");
    refreshState();
    deactivate();
  };

  const refreshState = () => {
    window.localStorage.setItem("provider", undefined);
  };

  return (
    <div className="toolbar animated bounceInLeft">
      <HStack>
        <div className="toolbar-left">
          <HStack>
            <Tooltip label={account} placement="right">
              <Text className="address-text">{`${truncateAddress(
                account
              )}`}</Text>
            </Tooltip>
          </HStack>
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
                navigation("dashboard")
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
                  navigation("cdps")
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
