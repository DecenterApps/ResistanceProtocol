import { ethers } from "ethers";
import Decimal from "decimal.js";
import {
  ABI as ABI_CDPMANAGER,
  address as address_CDPMANAGER,
} from "../contracts/CDPManager";
import {
  ABI as ABI_ETHFEED,
  address as address_ETHFEED,
} from "../contracts/EthTwapFeed";
import { ABI as ABI_NOI, address as address_NOI } from "../contracts/NOI";
import {
  ABI as ABI_PARAMETERS,
  address as address_PARAMETERS,
} from "../contracts/Parameters";
import {
  ABI as ABI_RATESETTER,
  address as address_RATESETTER,
} from "../contracts/RateSetter";
import {
  ABI as ABI_MARKET,
  address as address_MARKET,
} from "../contracts/MarketTwapFeed";
import {
  address as address_CONTROLLER,
  ABI as ABI_CONTROLLER,
} from "../contracts/AbsPiController";

const contractCDPManager = new ethers.Contract(
  address_CDPMANAGER,
  ABI_CDPMANAGER
);

const ethTwapFeedContract = new ethers.Contract(address_ETHFEED, ABI_ETHFEED);

const contractPARAMETERS = new ethers.Contract(
  address_PARAMETERS,
  ABI_PARAMETERS
);

const contractRATESETTER = new ethers.Contract(
  address_RATESETTER,
  ABI_RATESETTER
);

const contractMARKET = new ethers.Contract(address_MARKET, ABI_MARKET);

const contractNOI = new ethers.Contract(address_NOI, ABI_NOI);

const contractCONTROLLER = new ethers.Contract(
  address_CONTROLLER,
  ABI_CONTROLLER
);

const getEthPrice = async (signer) => {
  const ethResponse = await ethTwapFeedContract.connect(signer).getTwap();
  return ethResponse.div(10 ** 8).toString();
};

const getTotalEth = async (signer) => {
  const ethResponse = await contractCDPManager.connect(signer).getTotalSupply();
  return ethResponse;
};

const getSF = async (signer) => {
  const sfResponse = await contractPARAMETERS.connect(signer).getSF();
  return sfResponse;
};

const getLR = async (signer) => {
  const lrResponse = await contractPARAMETERS.connect(signer).getLR();
  return lrResponse;
};

const getRedemptionRate = async (signer) => {
  const rrResponse = await contractRATESETTER
    .connect(signer)
    .getYearlyRedemptionRate();
  return rrResponse;
};

const getRedemptionPrice = async (signer) => {
  const rpResponse = await contractRATESETTER
    .connect(signer)
    .getRedemptionPrice();
  return rpResponse;
};

const getMarketPrice = async (signer) => {
  const marketResponse = await contractMARKET.connect(signer).getTwap();
  return marketResponse;
};

const getNOISupply = async (signer) => {
  const noiResponse = await contractNOI.connect(signer).totalSupply();
  return noiResponse;
};

const getProportionalTerm = async (signer) => {
  const pResponse = await contractRATESETTER
    .connect(signer)
    .getYearlyProportionalTerm();
  return new Decimal(pResponse.toString()).div(10 ** 27).sub(1).toPrecision(5).toString();
};

const getIntegralTerm = async (signer) => {
  const iResponse = await contractRATESETTER
    .connect(signer)
    .getYearlyIntegralTerm();
  return new Decimal(iResponse.toString()).div(10 ** 27).sub(1).toPrecision(5).toString();
};

const getCdpCount = async (signer) => {
  const countResponse = await contractCDPManager.connect(signer).openCDPcount();
  return countResponse;
};

export default {
  getCdpCount,
  getIntegralTerm,
  getProportionalTerm,
  getNOISupply,
  getMarketPrice,
  getRedemptionPrice,
  getRedemptionRate,
  getLR,
  getSF,
  getTotalEth,
  getEthPrice,
};
