import React, { useEffect } from "react";
import { useIntl } from "react-intl";
import Switch from "react-switch";
import { PhoneIcon, AddIcon, WarningIcon } from "@chakra-ui/icons";
import "./MainContent.css";

export default function MainContent({}) {
  const intl = useIntl();

  useEffect(() => {}, []);

  return (
    <div className="content">
      <div className="top-left"></div>
      <div className="left-bot"></div>
      <div className="bot-right"></div>
      <div className="right-top"></div>
    </div>
  );
}
