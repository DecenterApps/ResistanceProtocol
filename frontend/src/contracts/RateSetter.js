export const ABI= [
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
        "name": "_ethTwapFeed",
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
    "name": "CDPManager__NotOwner",
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
    "name": "updatePrices",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "updateRatesInternal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]
export const address= "0xCBBe2A5c3A22BE749D5DDF24e9534f98951983e2"