import { ethers } from "ethers";
import Decimal from "decimal.js";
import { contract as contractCDPManager } from "../contracts/CDPManager";
import { contract as ethTwapFeedContract } from "../contracts/EthTwapFeed";
import { contract as contractNOI } from "../contracts/NOI";
import { contract as contractPARAMETERS } from "../contracts/Parameters";
import { contract as contractRATESETTER } from "../contracts/RateSetter";
import { contract as contractMARKET } from "../contracts/MarketTwapFeed";
import {
  contract as contractTREASURY,
  address as address_TREASURY,
} from "../contracts/Treasury";
import { contract as contractSHUTDOWN } from "../contracts/ShutdownModule";

const SECONDS_IN_A_YEAR = 31556926;

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
    .getYearlyRedemptionRates();
  console.log(rrResponse[0].toString())
  console.log(rrResponse[1].toString())
  const rr = await contractRATESETTER.connect(signer).getRedemptionRate();
  console.log(rr.toString())
  return [...rrResponse, rr];
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
    .getYearlyProportionalTerms();

  console.log("Strating getProportionalTerm ...");
  const res = pResponse.map((e) =>
    new Decimal(e.toString())
      .div(10 ** 27)
      .sub(1)
      .toDP(5)
      .toString()
  );

  console.log("Finished getProportionalTerm");
  return res;
};

const getIntegralTerm = async (signer) => {
  const iResponse = await contractRATESETTER
    .connect(signer)
    .getYearlyIntegralTerms();

  console.log("Strating getIntegralTerm ...");
  const res = iResponse.map((e) =>
    new Decimal(e.toString())
      .div(10 ** 27)
      .sub(1)
      .toDP(5)
      .toString()
  );
  console.log("Finished getIntegralTerm");
  return res;
};

const getCdpCount = async (signer) => {
  const countResponse = await contractCDPManager.connect(signer).openCDPcount();
  return countResponse;
};

const getNoiSurplus = async (signer) => {
  const surplusResponse = await contractTREASURY
    .connect(signer)
    .unmintedNoiBalance();
  return surplusResponse;
};

const getTreasuryNoi = async (signer) => {
  const treasuryResponse = await contractNOI
    .connect(signer)
    .balanceOf(address_TREASURY);
  return treasuryResponse;
};

const getGlobalCR = async (signer) => {
  const globalCR = await contractSHUTDOWN.connect(signer).calculateGlobalCR();
  return globalCR;
};

const getCRLimit = async (signer) => {
  const crLimit = await contractPARAMETERS.connect(signer).getGlobalCRLimit();
  return crLimit;
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
  getNoiSurplus,
  getTreasuryNoi,
  getGlobalCR,
  getCRLimit,
};
