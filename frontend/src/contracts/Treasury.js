import { ethers } from "ethers"; 
const ABI= [
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
    "name": "Treasury__NotAuthorized",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "Treasury__NotEnoughFunds",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "Treasury__NotEnoughNOIForReedem",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "Treasury__NotOwner",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "Treasury__TransactionFailed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "Treasury__UnauthorizedCDPManager",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "Treasury__UnauthorizedShutdownModule",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_amountRedeemed",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_amountGained",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "_to",
        "type": "address"
      }
    ],
    "name": "NOIRedeemed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      }
    ],
    "name": "TreasuryReceiveNOI",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      }
    ],
    "name": "TreasuryReceiveReedemableNOI",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_to",
        "type": "address"
      }
    ],
    "name": "addAuthorization",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBalanceOfTreasury",
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
        "name": "_amount",
        "type": "uint256"
      }
    ],
    "name": "getFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "noiForRedeem",
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
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      }
    ],
    "name": "receiveRedeemableNoi",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      }
    ],
    "name": "receiveUnmintedNoi",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_ethRp",
        "type": "uint256"
      }
    ],
    "name": "reedemNoiForCollateral",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_from",
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
        "internalType": "address",
        "name": "_CDPManagerContractAddress",
        "type": "address"
      }
    ],
    "name": "setCDPManagerContractAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_NOIContractAddress",
        "type": "address"
      }
    ],
    "name": "setNOIContractAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_ShutdownModuleContractAddress",
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
    "name": "unmintedNoiBalance",
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
    "stateMutability": "payable",
    "type": "receive"
  }
]
export const address= "0x1E3b98102e19D3a164d239BdD190913C2F02E756"
 export const contract=new ethers.Contract(address, ABI)