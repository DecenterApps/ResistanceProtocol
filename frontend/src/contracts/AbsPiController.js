export const ABI= [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      },
      {
        "internalType": "int256",
        "name": "_Kp",
        "type": "int256"
      },
      {
        "internalType": "int256",
        "name": "_Ki",
        "type": "int256"
      },
      {
        "internalType": "uint256",
        "name": "_feedbackOutputUpperBound",
        "type": "uint256"
      },
      {
        "internalType": "int256",
        "name": "_feedbackOutputLowerBound",
        "type": "int256"
      },
      {
        "internalType": "uint256",
        "name": "_integralPeriodSize",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_perSecondCumulativeLeak",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "AbsPiController__ContractNotEnabled",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "AbsPiController__NotOwner",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "AbsPiController__TooSoon",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "_account",
        "type": "address"
      }
    ],
    "name": "AddAuthorization",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "parameter",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "int256",
        "name": "data",
        "type": "int256"
      }
    ],
    "name": "ModifyIntParameter",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "parameter",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "data",
        "type": "uint256"
      }
    ],
    "name": "ModifyUintParameter",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "_account",
        "type": "address"
      }
    ],
    "name": "RemoveAuthorization",
    "type": "event"
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
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_marketPrice",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_redemptionPrice",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_accumulatedLeak",
        "type": "uint256"
      }
    ],
    "name": "computeRate",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "contractEnabled",
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
        "internalType": "int256",
        "name": "_piOutput",
        "type": "int256"
      }
    ],
    "name": "getBoundedRedemptionRate",
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
        "internalType": "int256",
        "name": "_proportionalTerm",
        "type": "int256"
      },
      {
        "internalType": "int256",
        "name": "_integralTerm",
        "type": "int256"
      }
    ],
    "name": "getGainAdjustedPIOutput",
    "outputs": [
      {
        "internalType": "int256",
        "name": "",
        "type": "int256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "int256",
        "name": "_proportionalTerm",
        "type": "int256"
      },
      {
        "internalType": "int256",
        "name": "_integralTerm",
        "type": "int256"
      }
    ],
    "name": "getGainAdjustedTerms",
    "outputs": [
      {
        "internalType": "int256",
        "name": "",
        "type": "int256"
      },
      {
        "internalType": "int256",
        "name": "",
        "type": "int256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getLastIntegralTerm",
    "outputs": [
      {
        "internalType": "int256",
        "name": "",
        "type": "int256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getLastProportionalTerm",
    "outputs": [
      {
        "internalType": "int256",
        "name": "",
        "type": "int256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "int256",
        "name": "_proportionalTerm",
        "type": "int256"
      },
      {
        "internalType": "uint256",
        "name": "_accumulatedLeak",
        "type": "uint256"
      }
    ],
    "name": "getNextPriceDeviationCumulative",
    "outputs": [
      {
        "internalType": "int256",
        "name": "",
        "type": "int256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lastAdjustedIntegralTerm",
    "outputs": [
      {
        "internalType": "int256",
        "name": "",
        "type": "int256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lastAdjustedProportionalTerm",
    "outputs": [
      {
        "internalType": "int256",
        "name": "",
        "type": "int256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "parameter",
        "type": "bytes32"
      },
      {
        "internalType": "int256",
        "name": "data",
        "type": "int256"
      }
    ],
    "name": "modifyIntParameter",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "parameter",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "data",
        "type": "uint256"
      }
    ],
    "name": "modifyUintParameter",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "oll",
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
    "inputs": [],
    "name": "pscl",
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
    "name": "removeAuthorization",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bool",
        "name": "_enabled",
        "type": "bool"
      }
    ],
    "name": "setEnabled",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "tlv",
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
export const address= "0x2c8ED11fd7A058096F2e5828799c68BE88744E2F"