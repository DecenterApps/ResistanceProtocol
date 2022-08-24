import { ethers } from "ethers";
import { contract as contractCDPManager,address} from "../contracts/CDPManager";
import { contract as contractNOI } from "../contracts/NOI";
import {
  contract as contractPARAMETERS
} from "../contracts/Parameters";
import Decimal from "decimal.js";

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`);
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations`
      );
      resolve();
    });
  });
}

const loadCDPsForUser = async (user, library, setCDPs) => {
  if (!library) return;
  const ids = await contractCDPManager
    .connect(library.getSigner())
    .getCDPsForAddress(user);
  const formatted = await Promise.all(
    ids.map(async (c) => {
      let cr = await contractCDPManager
        .connect(library.getSigner())
        .getCR(c["cdpIndex"]);
      let left = await contractCDPManager
        .connect(library.getSigner())
        .maxMintAmount(c["cdpIndex"]);
      let sf = await contractCDPManager
        .connect(library.getSigner())
        .getOnlySF(c["cdpIndex"]);
      const lr = await contractPARAMETERS.connect(library.getSigner()).getLR();
      return {
        col: new Decimal(c["lockedCollateral"].toString()),
        owner: c["owner"],
        debt: new Decimal(c["generatedDebt"].toString()),
        sf: new Decimal(sf.toString()).toString(),
        cdpId: new Decimal(c["cdpIndex"].toString()).toString(),
        cr: new Decimal(cr.toString()).toString(),
        left: new Decimal(left.toString()).toString(),
        lr: new Decimal(lr.toString()).toString(),
      };
    })
  );

  setCDPs(formatted.sort((a, b) => a.cr - b.cr));
};

const getCRs = async (library, cdps, setCDPs) => {
  const formatted = cdps.map(async (c) => {
    return {
      ...c,
      cr: await contractCDPManager.connect(library.getSigner()).getCR(c.cdpId),
    };
  });
  setCDPs(formatted);
};

const mintCDP = async (amount, library, selectedCDP) => {
  console.log(ethers.utils.parseEther(amount.toString()));
  const txMint = await contractCDPManager
    .connect(library.getSigner())
    .mintFromCDP(selectedCDP, ethers.utils.parseEther(amount.toString()));
  await listenForTransactionMine(txMint, library);
};

const boost = async (amount, library, selectedCDP) => {
  const txBoost = await contractCDPManager
    .connect(library.getSigner())
    .transferCollateralToCDP(selectedCDP, {
      value: ethers.utils.parseEther(amount.toString()),
    });
  await listenForTransactionMine(txBoost, library);
};

const withdrawCol = async (amount, library, selectedCDP) => {
  const txWithdraw = await contractCDPManager
    .connect(library.getSigner())
    .withdrawCollateralFromCDP(
      selectedCDP,
      ethers.utils.parseEther(amount.toString())
    );
  await listenForTransactionMine(txWithdraw, library);
};

const repayCDP = async (amount, library, selectedCDP) => {
  console.log(ethers.utils.parseEther(amount.toString()));
  const txApprove = await contractNOI
    .connect(library.getSigner())
    .approve(address, ethers.utils.parseEther(amount.toString()));
  await listenForTransactionMine(txApprove, library);
  const txRepay = await contractCDPManager
    .connect(library.getSigner())
    .repayToCDP(selectedCDP, ethers.utils.parseEther(amount.toString()));
  await listenForTransactionMine(txRepay, library);
};

const openCDP = async (col, debt, library, account) => {
  const txOpen = await contractCDPManager
    .connect(library.getSigner())
    .openCDPandMint(account, ethers.utils.parseEther(debt.toString()), {
      value: ethers.utils.parseEther(col.toString()),
    });
  await listenForTransactionMine(txOpen, library);
};

const closeCDP = async (cdpId, library) => {
  const txClose = await contractCDPManager
    .connect(library.getSigner())
    .closeCDP(cdpId);
  await listenForTransactionMine(txClose, library);
};

const repayAndClose = async (cdpId, library) => {
  const txApprove = await contractNOI
    .connect(library.getSigner())
    .approve(
      address,
      ethers.utils.parseEther("100000000000000000000000000000000")
    );
  await listenForTransactionMine(txApprove, library);
  const txRepayAndClose = await contractCDPManager
    .connect(library.getSigner())
    .repayAndCloseCDP(cdpId);
  await listenForTransactionMine(txRepayAndClose, library);
};

export default {
  loadCDPsForUser,
  getCRs,
  mintCDP,
  boost,
  withdrawCol,
  repayCDP,
  openCDP,
  closeCDP,
  repayAndClose,
};
