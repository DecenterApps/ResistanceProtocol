import React from "react";
import { useState } from "react";
import sidebarBg from "../../assets/bg1.jpg";
import { truncateAddress } from "../../utils/general";
import {
  ProSidebar,
  Menu,
  MenuItem,
  SubMenu,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
} from "react-pro-sidebar";
import { Button, VStack, HStack, Text, Tooltip, Box } from "@chakra-ui/react";
import { useIntl } from "react-intl";
import { useWeb3React } from "@web3-react/core";
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
import { MdSettings } from "react-icons/md";
import { VscHome,VscPulse } from "react-icons/vsc";
import './Sidebar.css'
export default function Sidebar({ onOpenModal, onDisconnect }) {
  const intl = useIntl();
  const [selectedItem,setSelectedItem]=useState("Dashboard")

  const selectItem=(item)=>{
    setSelectedItem(item)
  }

  const { chainId, account, active, chain } = useWeb3React();
  return (
    <ProSidebar image={sidebarBg} breakPoint="md">
      <SidebarHeader>
        <VStack
          style={{
            padding: "24px",
          }}
        >
          <div
            style={{
              textTransform: "uppercase",
              fontWeight: "bold",
              fontSize: 26,
              letterSpacing: "1px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontFamily: "Lucida Console",
            }}
          >
            {intl.formatMessage({ id: "sidebarTitle" })}
          </div>
          {!active ? (
            <Button
              onClick={() => {
                onOpenModal(true);
              }}
            >
              Connect Wallet
            </Button>
          ) : (
            <Button onClick={onDisconnect}>Disconnect</Button>
          )}
        </VStack>
        <VStack justifyContent="center" alignItems="center" padding="10px 0">
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
      </SidebarHeader>
      <SidebarContent>
        {active && (
          <Menu iconShape="square">
            <MenuItem className={selectedItem==="Dashboard" && "selected"} icon={<VscHome />} onClick={()=>{selectItem("Dashboard")}}>Dashboard</MenuItem>
            <MenuItem className={selectedItem==="CDPs" && "selected"} icon={<VscPulse />} onClick={()=>{selectItem("CDPs")}}>My CDPs</MenuItem>
          </Menu>
        )}
      </SidebarContent>
    </ProSidebar>
  );
}
