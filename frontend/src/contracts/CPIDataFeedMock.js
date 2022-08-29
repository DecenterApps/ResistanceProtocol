import { ethers } from "ethers"; 
const ABI= [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_cpi",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "cpi",
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
    "name": "currPegPrice",
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
        "name": "_cpi",
        "type": "uint256"
      }
    ],
    "name": "setCpi",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]
export const address= "0xf5c4a909455C00B99A90d93b48736F3196DB5621"
 export const contract=new ethers.Contract(address, ABI)