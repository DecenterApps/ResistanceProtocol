import { ethers } from "ethers"; 
const ABI= [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_updateTimeInterval",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_twapWindowSize",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_lendingPool",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_ethTwapFeed",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_rateSetter",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_coinPriceFeed",
        "type": "address"
      },
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
    "name": "MarketTwapFeed__NotActive",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MarketTwapFeed__NotOwner",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MarketTwapFeed__NotShutdownModule",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MarketTwapFeed__TimeIntervalDidNotPass",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "currentPrice",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "twapPrice",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "UpdateValues",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "coinPriceFeed",
    "outputs": [
      {
        "internalType": "contract AggregatorV3Interface",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCoinPrice",
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
    "name": "getMarketPrice",
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
    "name": "getTwap",
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
    "name": "marketTwapPrice",
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
        "name": "_addr",
        "type": "address"
      }
    ],
    "name": "setShutdownModuleContractAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
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
    "inputs": [],
    "name": "twapWindowSize",
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
    "name": "update",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "updateTimeInterval",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]
export const address= "0x7Cf4be31f546c04787886358b9486ca3d62B9acf"
 export const contract=new ethers.Contract(address, ABI)