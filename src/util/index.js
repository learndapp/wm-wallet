import SHA256 from 'crypto-js/sha256';

import { ethers, providers, Contract } from 'ethers';

import axios from '@/api';
import config from '@/config';

// util
import tx from './tx';

const ethProviderMap = {};
function getEthProvider(network) {
  let provider = ethProviderMap[network];
  if (provider) return provider;
  const infuraProvider = new providers.InfuraProvider(network);
  const etherscanProvider = new providers.EtherscanProvider(network);
  new providers.FallbackProvider([infuraProvider, etherscanProvider]);

  provider = ethers.getDefaultProvider(network);
  ethProviderMap[network] = provider;
  return provider;
}

const bitcoin = window.Bitcoin;
const bip39 = window.Bip39;
const bip32 = window.Bip32;

const util = ($root, $store, $toasted, setStateValue) => {
  $root.getEthProvider = getEthProvider;
  // 本地缓存
  $root.putCache = (key, val, sec) => {
    const { cache } = $store.state;
    // cache = cache || {};
    cache[key] = {
      val,
      exp: new Date().getTime() + sec * 1000,
    };
    setStateValue({
      k: 'cache',
      v: cache,
    });
  };
  $root.getCache = (key) => {
    const { cache } = $store.state;
    // cache = cache || {};
    const data = cache[key];
    if (data && new Date().getTime() <= data.exp) {
      return data.val;
    }
    return '';
  };

  //
  $root.version = config.version;
  $root.coinList = config.coinList;
  // erc20 or other
  $root.txSpList = ['WGT'];

  const networkMap = {};
  const tokenAddrMap = {};
  config.coinList.forEach((item) => {
    networkMap[item.symbol] = item.network;
    tokenAddrMap[item.symbol] = item.tokenAddr;
  });
  $root.networkMap = networkMap;
  $root.tokenAddrMap = tokenAddrMap;

  $root.createWallet = (_symbol, mnemonic, _index) => {
    let result = [];
    const index = _index || 0;

    let start = 0;

    let symbol = _symbol;

    config.coinList.forEach((item) => {
      if (item.symbol === symbol) {
        if (item.start) {
          start = item.start - 0;
        }
        if (item.type === 'erc20') {
          symbol = 'ETH';
        }
      }
    });

    const n = start + index;
    switch (symbol) {
      case 'ETH': {
        const path = `m/44'/60'/0'/0/${n}`;
        const wallet = ethers.Wallet.fromMnemonic(mnemonic, path);
        result = [wallet.address, wallet.privateKey, wallet];
        break;
      }
      case 'BTC':
      case 'BTC|TEST': {
        const network = bitcoin.networks[symbol === 'BTC|TEST' ? 'testnet' : 'bitcoin'];
        const seed = bip39.mnemonicToSeedSync(mnemonic);
        const root = bip32.fromSeed(seed, network);
        const path = `m/44'/0'/0'/0/${n}`;
        const keyPair = root.derivePath(path);
        const privateKey = keyPair.toWIF();
        const wallet = bitcoin.payments.p2pkh({
          pubkey: keyPair.publicKey,
          network,
        });
        result = [wallet.address, privateKey, keyPair];
        break;
      }
      default:
    }
    return result;
  };

  //
  $root.checkWalletAddr = (addr, symbol) => {
    let result = false;
    try {
      switch (symbol) {
        case 'ETH':
        case 'WGT': {
          result = true;
          ethers.utils.getAddress(addr);
          break;
        }
        case 'BTC': {
          result = true;
          bitcoin.address.toOutputScript(addr, bitcoin.networks.bitcoin);
          break;
        }
        case 'BTC|TEST': {
          result = true;
          bitcoin.address.toOutputScript(addr, bitcoin.networks.testnet);
          break;
        }
        default:
      }
    } catch (error) {
      result = false;
    }
    return result;
  };

  //
  $root.numFormat = (numStr, flag) => {
    const temp = parseInt(numStr, 10)
      .toFixed(1)
      .replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
      .replace(/\.0/g, '');
    if (!flag || !numStr.split('.')[1]) {
      return temp;
    }
    return `${temp.split('.')[0]}.${numStr.split('.')[1].substr(0, flag)}`;
  };

  //
  $root.generateS2 = (pwd, sid) => {
    const str = SHA256(pwd).toString() + SHA256(sid).toString();
    return SHA256(str).toString();
  };

  //
  const getBtcBalance = async (network, addr) => {
    const res = await axios.get(
      `https://tt.w3c.market/api/get_address_balance?network=${network}&addr=${addr}`,
    );
    return res.data ? res.data : '0.0';
  };
  $root.getBalance = async (symbol, addr, n) => {
    const network = $root.networkMap[symbol][n];
    const ceKey = `${symbol}Balance:${network}:${addr}`;
    //
    let balance = $root.getCache(ceKey);
    if (!balance) {
      balance = '0.0';
      switch (symbol) {
        case 'ETH': {
          const provider = getEthProvider(network);
          const balanceSrc = await provider.getBalance(addr);
          balance = ethers.utils.formatEther(balanceSrc);
          break;
        }
        case 'BTC': {
          balance = await getBtcBalance('BTC', addr);
          break;
        }
        case 'BTC|TEST': {
          balance = await getBtcBalance('BTCTEST', addr);
          break;
        }
        case 'WGT':
        case 'BNB': {
          const tokenAddress = $root.tokenAddrMap[symbol];
          const provider = getEthProvider(network);
          const contract = new Contract(tokenAddress, config.abi, provider);
          const balanceSrc = await contract.balanceOf(addr);
          balance = ethers.utils.formatEther(balanceSrc);
          break;
        }
        default:
      }
      $root.putCache(ceKey, balance, 11);
    }

    const balancePiece = balance.split('.');

    if (balancePiece[1] && balancePiece[1].length > 6) {
      balance = `${balancePiece[0]}.${balancePiece[1].substr(0, 6)}`;
    }
    return balance;
  };

  //
  $root.getTxFee = async (symbol) => {
    const { walletMap } = $store.state;
    const n = walletMap[symbol].network;
    const network = $root.networkMap[symbol][n];

    let fee = 0.0001;
    switch (symbol) {
      case 'ETH': {
        const provider = getEthProvider(network);
        // 暂存，和交易时统一
        $root.gasPrice = await provider.getGasPrice();
        $root.gasLimit = 21000;
        const feeStr = $root.gasPrice.mul($root.gasLimit).toString();
        fee = ethers.utils.formatEther(feeStr, 18);
        break;
      }
      case 'BTC':
      case 'BTC|TEST': {
        break;
      }
      case 'WGT': {
        const provider = getEthProvider(network);
        $root.gasPrice = await provider.getGasPrice();
        $root.gasLimit = 42000;
        const feeStr = $root.gasPrice.mul($root.gasLimit).toString();
        fee = ethers.utils.formatEther(feeStr, 18);
        break;
      }
      default:
    }
    return fee;
  };

  //
  $root.getPriceMap = async () => {
    const ceKey = 'priceMap';
    let priceMap = $root.getCache(ceKey);
    if (!priceMap) {
      priceMap = {
        WGT: 0.8,
      };
      const priceSrc = await axios.get('https://tt.w3c.market/api/hot');
      if (priceSrc.list) {
        JSON.parse(priceSrc.list).forEach((item) => {
          priceMap[item.symbol] = parseFloat(item.price_cny);
        });
      }
      $root.putCache(ceKey, priceMap, 30);
    }
    return priceMap;
  };

  //
  $root.generateAddr = (_symbol, _sk) => {
    let sk = _sk.trim();
    if (sk.length < 12) {
      return '';
    }
    let symbol = _symbol;

    const { walletMap } = $store.state;
    if (walletMap[symbol].type === 'erc20') {
      symbol = 'ETH';
    }
    let addr = '';
    switch (symbol) {
      case 'ETH': {
        try {
          if (!/^0x/.test(sk)) {
            sk = `0x${sk}`;
          }
          const signingKey = new ethers.utils.SigningKey(sk);
          const { publicKey } = signingKey;
          addr = ethers.utils.computeAddress(publicKey);
        } catch (e) {
          return '';
        }
        break;
      }
      case 'BTC':
      case 'BTC|TEST': {
        try {
          const network = bitcoin.networks[symbol === 'BTC|TEST' ? 'testnet' : 'bitcoin'];
          const keyPair = bitcoin.ECPair.fromWIF(sk, network);
          const wallet = bitcoin.payments.p2pkh({
            pubkey: keyPair.publicKey,
            network,
          });
          addr = wallet.address;
        } catch (e) {
          return '';
        }
        break;
      }
      default:
    }

    return addr;
  };

  $root.getS1 = async (sid) => {
    let s1 = $root.S1;
    if (!s1) {
      const res = await axios.get(`/s1?sid=${sid}`);
      if (res.err) {
        $toasted.show(res.err);
      } else {
        setStateValue({
          k: 'email',
          v: res.data.email,
        });
        $root.S1 = res.data.s1;
        s1 = $root.S1;
      }
    }
    return s1;
  };

  //
  $root.checkPwd = async (pwd) => {
    const { sid, walletMap } = $store.state;
    const s2 = $root.generateS2(pwd, sid);
    const s1 = await $root.getS1(sid);
    const mnemonic = $root.generateMnemonic(s1, s2);

    // 验证密码
    const firstAddr = $root.createWallet('BTC', mnemonic, 0)[0];
    if (firstAddr !== walletMap.BTC.wallet[0].addr) {
      return false;
    }
    return mnemonic;
  };

  //
  $root.generateMnemonic = (s1, s2) => {
    let seedHash = SHA256(s1 + s2).toString();
    seedHash = seedHash.substr(0, 32);
    const mnemonic = bip39.entropyToMnemonic(seedHash);
    return mnemonic;
  };

  //
  $root.detailLink = (symbol, addr, n) => {
    let link = '';
    switch (symbol) {
      case 'ETH': {
        let network = `${$root.networkMap[symbol][n]}.`;
        if (network === 'homestead.') {
          network = '';
        }
        link = `https://${network}etherscan.io/address/${addr}`;
        break;
      }
      case 'BTC': {
        link = `https://www.blockchain.com/zh/btc/address/${addr}`;
        break;
      }
      case 'BTC|TEST': {
        link = `https://www.blockchain.com/btctest/address/${addr}`;
        break;
      }
      case 'WGT':
      case 'BNB': {
        let network = `${$root.networkMap[symbol][n]}.`;
        if (network === 'homestead.') {
          network = '';
        }
        link = `https://${network}etherscan.io/token/${$root.tokenAddrMap[symbol]}?a=${addr}`;
        break;
      }
      default:
    }
    return link;
  };

  $root.sendTx = (symbol, fromAddr, addr, amount, pwd) => tx.sendTx(symbol, fromAddr, addr, amount, pwd, $root, $store);
};

export default util;
