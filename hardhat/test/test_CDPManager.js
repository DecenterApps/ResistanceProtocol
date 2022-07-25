const hre = require("hardhat");
const {
  TASK_TEST_RUN_SHOW_FORK_RECOMMENDATIONS,
} = require("hardhat/builtin-tasks/task-names");
describe("CDP functionality", function () {
  this.timeout(80000);
  let senderAcc;
  let yearnRegistry;
  let mainContractObj;
  before(async () => {
    const MainContract = await hre.ethers.getContractFactory("CDPManager");
    mainContractObj = await MainContract.deploy();
    senderAcc = await hre.ethers.getSigners();
  });
  it("... should create CDP", async () => {
    await mainContractObj
      .connect(senderAcc[0])
      .openCDP(senderAcc[0].address, { value: 100000000 });
    await mainContractObj
      .connect(senderAcc[0])
      .openCDP(senderAcc[0].address, { value: 500000000 });
    await mainContractObj
      .connect(senderAcc[1])
      .openCDP(senderAcc[1].address, { value: 1500000000 });
    await mainContractObj.connect(senderAcc[0]).getTotalSupply();
    await mainContractObj
      .connect(senderAcc[0])
      .getOneCDP(1);
    await mainContractObj
      .connect(senderAcc[0])
      .getOneCDP(2);
    await mainContractObj
      .connect(senderAcc[0])
      .closeCDP(1);
    await mainContractObj.connect(senderAcc[0]).getTotalSupply();
    await mainContractObj
      .connect(senderAcc[0])
      .getOneCDP(1);
  });
});
