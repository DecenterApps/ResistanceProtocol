import React, { useEffect } from "react";
import { useIntl } from "react-intl";
import Switch from "react-switch";
import { PhoneIcon, AddIcon, WarningIcon } from "@chakra-ui/icons";
import "./MainContent.css";
import { Center, Square, Circle } from "@chakra-ui/react";
import Dashboard from "./Dashboard";

export default function MainContent({}) {
  const intl = useIntl();

  useEffect(() => {}, []);

  return (
    <div className="container">
      <div className="subcontainer">
        <div className="content">
          <div className="top-left"></div>
          <div className="left-bot"></div>
          <div className="bot-right"></div>
          <div className="right-top"></div>
        </div>
        <div className="block  style-11">
          <h1>Resistance</h1>
        </div>
      </div>
      <Dashboard />
    </div>
  );
}
