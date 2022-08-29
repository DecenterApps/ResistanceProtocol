import { ethers } from "ethers"; 
const ABI= [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_cdpManager",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_AbsPiController",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_cpiDataFeed",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "RateSetter__NotActive",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "RateSetter__NotAuthorized",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "RateSetter__NotOwner",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "RateSetter__UnknownContract",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "RateSetter__UnknownParameter",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "_contract",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "_newAddress",
        "type": "address"
      }
    ],
    "name": "ModifyContract",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "_parameter",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_data",
        "type": "uint256"
      }
    ],
    "name": "ModifyParameters",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_marketPrice",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_redemptionPrice",
        "type": "uint256"
      }
    ],
    "name": "NewPrices",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "NewRedemptionRate",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "RAY",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "SECONDS_IN_A_YEAR",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "addAuthorization",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "authorizedAccounts",
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
    "inputs": [],
    "name": "getCpiData",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getRedemptionPrice",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getRedemptionRate",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getYearlyIntegralTerm",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getYearlyProportionalTerm",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getYearlyRedemptionRate",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_contract",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "_newAddress",
        "type": "address"
      }
    ],
    "name": "modifyContracts",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_parameter",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "_data",
        "type": "uint256"
      }
    ],
    "name": "modifyParameters",
    "outputs": [],
    "stateMutability": "nonpayable",
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
        "name": "account",
        "type": "address"
      }
    ],
    "name": "removeAuthorization",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "x",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "y",
        "type": "uint256"
      }
    ],
    "name": "rmultiply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "z",
        "type": "uint256"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "x",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "n",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "base",
        "type": "uint256"
      }
    ],
    "name": "rpower",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "z",
        "type": "uint256"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "shutdown",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_ethTwapPrice",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_noiMarketPrice",
        "type": "uint256"
      }
    ],
    "name": "updatePrices",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]
export const address= "0x70E5370b8981Abc6e14C91F4AcE823954EFC8eA3"
 export const contract=new ethers.Contract(address, ABI)