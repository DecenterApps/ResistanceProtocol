import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import config from '../config/config.json'

const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42,31337]
});

const walletconnect = new WalletConnectConnector({
  rpcUrl: config.rpcUrl,
  bridge: config.bridge,
  qrcode: true
});

export const connectors = {
  injected: injected,
  walletConnect: walletconnect,
};
