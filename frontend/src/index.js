import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App/App";
import { Web3ReactProvider } from "@web3-react/core";
import Web3Provider from "web3";
import { ChakraProvider } from "@chakra-ui/react";

import Decimal from "decimal.js";
Decimal.set({
  rounding: Decimal.ROUND_DOWN,
  toExpPos: 9e15,
  toExpNeg: -9e15,
  precision: 50,
});

function getLibrary(provider) {
  return new Web3Provider(provider);
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ChakraProvider>
    <Web3ReactProvider getLibrary={getLibrary}>
      <App />
    </Web3ReactProvider>
  </ChakraProvider>
);
