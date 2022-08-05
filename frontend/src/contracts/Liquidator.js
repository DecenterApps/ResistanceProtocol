export const ABI= [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "Liquidator__CDPNotEligibleForLiquidation",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "Parameters_NotAuthorized",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "_cdpIndex",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_collateral",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_debt",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "_liquidator",
        "type": "address"
      }
    ],
    "name": "LiquidateCDP",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_cdpIndex",
        "type": "uint256"
      }
    ],
    "name": "isEligibleForLiquidation",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_cdpIndex",
        "type": "uint256"
      }
    ],
    "name": "liquidateCDP",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_cdpManagerContractAddress",
        "type": "address"
      }
    ],
    "name": "setCdpManagerContractAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_noiContractAddress",
        "type": "address"
      }
    ],
    "name": "setNoiContractAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_parametersContractAddress",
        "type": "address"
      }
    ],
    "name": "setParametersContractAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_rateSetterContractAddress",
        "type": "address"
      }
    ],
    "name": "setRateSetterContractAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_treasuryContractAddress",
        "type": "address"
      }
    ],
    "name": "setTreasuryContractAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
]
export const address= "0xd3FFD73C53F139cEBB80b6A524bE280955b3f4db"