//
import { AES, enc } from 'crypto-js';
import { ethers, Contract } from 'ethers';

import axios from '@/api';
import config from '@/config';

const bitcoin = window.Bitcoin;

const sendTx = async (symbol, fromAddr, addr, amount, pwd, $root, $store) => {
  const { sid, walletMap } = $store.state;
  const s1 = await $root.getS1(sid);
  if (!s1) {
    return { err: '暂时无法发起请求，请稍后重试' };
  }

  //  验证密码
  const checkPwdRet = await $root.checkPwd(pwd);
  if (!checkPwdRet) {
    return { err: '密码错误，请重新输入' };
  }
  const mnemonic = checkPwdRet;

  let result = { err: '请稍后重试' };

  const n = walletMap[symbol].network;
  const network = $root.networkMap[symbol][n];

  switch (symbol) {
    case 'ETH': {
      const provider = $root.getEthProvider(network);

      const nowWallet = walletMap[symbol].wallet[walletMap[symbol].cur];

      let wallet;
      // 导入
      if (nowWallet.s) {
        const sk = AES.decrypt(nowWallet.s, sid).toString(enc.Utf8);
        wallet = new ethers.Wallet(sk, provider);
      } else {
        wallet = $root.createWallet('ETH', mnemonic, walletMap[symbol].cur)[2];
      }

      const nonce = await provider.getTransactionCount(fromAddr);

      const transaction = {
        nonce,
        gasLimit: $root.gasLimit,
        gasPrice: $root.gasPrice,
        to: addr,
        value: ethers.utils.parseEther(`${amount}`),
      };

      const signedTransaction = wallet.sign(transaction);
      result = await provider.sendTransaction(signedTransaction);

      break;
    }
    case 'BTC':
    case 'BTC|TEST': {
      const nowNetwork = symbol.split('|').join('');

      const nowWallet = walletMap[symbol].wallet[walletMap[symbol].cur];

      let keyPair;
      // 导入
      if (nowWallet.s) {
        const sk = AES.decrypt(nowWallet.s, sid).toString(enc.Utf8);
        keyPair = bitcoin.ECPair.fromWIF(sk, bitcoin.networks[network]);
      } else {
        keyPair = $root.createWallet(symbol, mnemonic, walletMap[symbol].cur)[2];
      }

      const txs = [];
      // const txUnspent = await axios.get(
      //   'https://blockchain.info/unspent?active=1EzwoHtiXB4iFwedPr49iywjZn2nnekhoj',
      // );
      // if (!txUnspent) {
      //   return result;
      // }
      // if (!txUnspent.txrefs) {
      //   return { err: '当前有未完成的交易，请稍后重试' };
      // }
      // txUnspent.unspent_outputs.forEach((item) => {
      //   txs.push({
      //     tx_hash: item.tx_hash_big_endian,
      //     tx_output_n: item.tx_output_n,
      //     value: item.value,
      //   });
      // });
      const pathNetwork = nowNetwork === 'BTC' ? 'main' : 'test3';
      const txUnspent = await axios.get(
        `https://api.blockcypher.com/v1/btc/${pathNetwork}/addrs/mnUvYjimSP4kz3ZMEPYY64Mcebr1mYfNVL?unspentOnly=true`,
      );
      if (!txUnspent) {
        return result;
      }
      if (!txUnspent.txrefs) {
        return { err: '当前有未完成的交易，请稍后重试' };
      }
      txUnspent.txrefs.forEach((item) => {
        txs.push({
          tx_hash: item.tx_hash,
          tx_output_n: item.tx_output_n,
          value: item.value,
        });
      });

      const txb = new bitcoin.TransactionBuilder(bitcoin.networks[network]);
      let amountReal = parseInt(amount * 1e8);
      amountReal += 1e4;
      txb.setVersion(1); // 设置交易版本号
      let tot = 0; // 用于记录UTXO总量
      for (let i = 0; i < txs.length; i += 1) {
        txb.addInput(txs[i].tx_hash, txs[i].tx_output_n);
        tot += txs[i].value;
      }

      txb.addOutput(addr, amountReal - 1e4); // 转出目标地址和对应的金额
      txb.addOutput(fromAddr, tot - amountReal); // 找零地址，找零金额
      for (let i = 0; i < txs.length; i += 1) {
        txb.sign({
          prevOutScriptType: 'p2pkh',
          vin: i,
          keyPair,
        });
      }

      const txHex = txb.buildIncomplete().toHex();

      result = await axios.post(`https://api.blockcypher.com/v1/btc/${pathNetwork}/txs/push`, {
        tx: txHex,
      });

      break;
    }
    case 'WGT':
    case 'BNB': {
      const tokenAddress = $root.tokenAddrMap[symbol];
      const provider = $root.getEthProvider(network);

      const nowWallet = walletMap[symbol].wallet[walletMap[symbol].cur];

      let wallet;
      // 导入的情况
      if (nowWallet.s) {
        const sk = AES.decrypt(nowWallet.s, sid).toString(enc.Utf8);
        wallet = new ethers.Wallet(sk, provider);
      } else {
        // 内部地址
        wallet = $root.createWallet('ETH', mnemonic, walletMap[symbol].cur)[2];
      }

      const contract = new Contract(tokenAddress, config.abi, wallet);

      const numberOfTokens = ethers.utils.parseUnits(amount, 18);

      result = await contract.transfer(addr, numberOfTokens);

      break;
    }
    default:
  }
  return result;
};

export default {
  sendTx,
};
