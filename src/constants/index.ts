import { JSBI, Percent, Token, WONE, CurrencyAmount } from '@swoop-exchange/sdk'
import { AbstractConnector } from '@web3-react/abstract-connector'

import { injected, oneWallet, mathWallet } from '../connectors'

const { ChainID } = require("@harmony-js/utils");

// Testnet address: local: 0x1A09ED75539fb5885766eba266E39Cb936d36649 - deployed 2020-10-30 16:10 UTC
// Mainnet address: 0x0a91275aC54680E4ffAdB942d4E450AfECBA129f - final mainnet deployment
export const ROUTER_ADDRESS = '0x0a91275aC54680E4ffAdB942d4E450AfECBA129f'

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in typeof ChainID]: Token[]
}

export const DAI = new Token(ChainID.HmyMainnet, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'Dai Stablecoin')
export const USDC = new Token(ChainID.HmyMainnet, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD//C')
export const USDT = new Token(ChainID.HmyMainnet, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD')
export const COMP = new Token(ChainID.HmyMainnet, '0xc00e94Cb662C3520282E6f5717214004A7f26888', 18, 'COMP', 'Compound')
export const MKR = new Token(ChainID.HmyMainnet, '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2', 18, 'MKR', 'Maker')
export const AMPL = new Token(ChainID.HmyMainnet, '0xD46bA6D942050d489DBd938a2C909A5d5039A161', 9, 'AMPL', 'Ampleforth')

const WONE_ONLY: ChainTokenList = {
  // @ts-ignore
  [ChainID.HmyMainnet]: [WONE[ChainID.HmyMainnet]],
  // @ts-ignore
  [ChainID.HmyTestnet]: [WONE[ChainID.HmyTestnet]]
}

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WONE_ONLY,
  [ChainID.HmyMainnet]: [...WONE_ONLY[ChainID.HmyMainnet]]//, DAI, USDC, USDT, COMP, MKR]
}

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
export const CUSTOM_BASES: { [chainId in typeof ChainID]?: { [tokenAddress: string]: Token[] } } = {
  /*[ChainID.HmyMainnet]: {
    // @ts-ignore
    [AMPL.address]: [DAI, WONE[ChainID.HmyMainnet]]
  }*/
}

// used for display in the default list when adding liquidity
export const SUGGESTED_BASES: ChainTokenList = {
  ...WONE_ONLY,
  [ChainID.HmyMainnet]: [...WONE_ONLY[ChainID.HmyMainnet]]//, DAI, USDC, USDT]
}

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  ...WONE_ONLY,
  [ChainID.HmyMainnet]: [...WONE_ONLY[ChainID.HmyMainnet]]//, DAI, USDC, USDT]
}

export const PINNED_PAIRS: { readonly [chainId in typeof ChainID]?: [Token, Token][] } = {
  /*[ChainID.HmyMainnet]: [
    [
      new Token(ChainID.HmyMainnet, '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643', 8, 'cDAI', 'Compound Dai'),
      new Token(ChainID.HmyMainnet, '0x39AA39c021dfbaE8faC545936693aC917d5E7563', 8, 'cUSDC', 'Compound USD Coin')
    ],
    [USDC, USDT],
    [DAI, USDT]
  ]*/
}

export interface UserWallet {
  type: string | null;
  address: string | null;
  bech32Address: string | null;
  active: boolean;
}

export interface CurrencyResult {
  address: string | null;
  amount: CurrencyAmount | undefined;
}

export interface WalletInfo {
  connector?: AbstractConnector
  name: string
  iconName: string
  description: string
  href: string | null
  color: string
  primary?: true
  mobile?: true
  mobileOnly?: true
}

export const SUPPORTED_WALLETS: { [key: string]: any } = {
  INJECTED: {
    connector: injected,
    name: 'Injected',
    iconName: 'arrow-right.svg',
    description: 'Injected web3 provider.',
    href: null,
    color: '#010101',
    primary: true
  },
  ONEWALLET: {
    connector: oneWallet,
    name: 'OneWallet',
    iconName: 'harmony.png',
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D'
  },
  MATHWALLET: {
    connector: mathWallet,
    name: 'MathWallet',
    iconName: 'mathwallet.png',
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D'
  },
}

/*export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  INJECTED: {
    connector: injected,
    name: 'Injected',
    iconName: 'arrow-right.svg',
    description: 'Injected web3 provider.',
    href: null,
    color: '#010101',
    primary: true
  },
  METAMASK: {
    connector: injected,
    name: 'MetaMask',
    iconName: 'metamask.png',
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D'
  },
  WALLET_CONNECT: {
    connector: walletconnect,
    name: 'WalletConnect',
    iconName: 'walletConnectIcon.svg',
    description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
    href: null,
    color: '#4196FC',
    mobile: true
  },
  WALLET_LINK: {
    connector: walletlink,
    name: 'Coinbase Wallet',
    iconName: 'coinbaseWalletIcon.svg',
    description: 'Use Coinbase Wallet app on mobile device',
    href: null,
    color: '#315CF5'
  },
  COINBASE_LINK: {
    name: 'Open in Coinbase Wallet',
    iconName: 'coinbaseWalletIcon.svg',
    description: 'Open in Coinbase Wallet app.',
    href: 'https://go.cb-w.com/mtUDhEZPy1',
    color: '#315CF5',
    mobile: true,
    mobileOnly: true
  },
  FORTMATIC: {
    connector: fortmatic,
    name: 'Fortmatic',
    iconName: 'fortmaticIcon.png',
    description: 'Login using Fortmatic hosted wallet',
    href: null,
    color: '#6748FF',
    mobile: true
  },
  Portis: {
    connector: portis,
    name: 'Portis',
    iconName: 'portisIcon.png',
    description: 'Login using Portis hosted wallet',
    href: null,
    color: '#4A6C9B',
    mobile: true
  }
}*/

export const NetworkContextName = 'NETWORK'

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 50
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20

// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
export const BIPS_BASE = JSBI.BigInt(10000)
// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(1000), BIPS_BASE) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE) // 15%

// used to ensure the user doesn't send so much ETH so they end up with <.01
export const MIN_ETH: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)) // .01 ETH
export const BETTER_TRADE_LINK_THRESHOLD = new Percent(JSBI.BigInt(75), JSBI.BigInt(10000))
