import Web3 from 'web3';
import config from '../config/config.json'

export const initWeb3 = () => {
  const web3 = new Web3(config.rpcUrl);
  window.web3 = web3;
  return web3;
}
