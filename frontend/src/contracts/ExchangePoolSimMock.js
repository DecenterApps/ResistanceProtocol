import { ethers } from "ethers"; 
const ABI= [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_noiContract",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "ethPriceFeedAddress",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "ExchangePoolSimMock__CantSendEth",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ExchangePoolSimMock__EthAmountExceedsLimit",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ExchangePoolSimMock__NoiAmountExceedsLimit",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "addFunds",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getEthPrice",
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
    "name": "getNoiMarketPrice",
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
    "name": "getReserves",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
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
        "internalType": "uint256",
        "name": "amountNoi",
        "type": "uint256"
      }
    ],
    "name": "howMuchEthForNoi",
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
        "internalType": "uint256",
        "name": "amountEth",
        "type": "uint256"
      }
    ],
    "name": "howMuchNoiForEth",
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
    "name": "putEthGetNoi",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "putNoiGetEth",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]
export const address= "0x1D8D70AD07C8E7E442AD78E4AC0A16f958Eba7F0"
 export const contract=new ethers.Contract(address, ABI)