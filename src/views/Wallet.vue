<template>
  <div class="wallet">
    <div class="mb-2">
      <a class="text-bold mr-2" @click.stop="$root.$emit('showModal', { mod: 'createWallet' })">
        <SvgIcon name="create" />创建
      </a>
      <a class="text-bold" @click.stop="$root.$emit('showModal', { mod: 'importWallet' })">
        <SvgIcon name="import" />导入
      </a>
      <span class="float-right">
        <a @click.stop="reload">
          <SvgIcon name="reload" />
        </a>
        <a class="ml-2" @click.stop="$root.$emit('showModal', { mod: 'category' })">
          <SvgIcon name="filter" />
        </a>
      </span>
    </div>

    <div style="margin-top: 2rem;" v-if="loading">
      <div class="loading loading-lg"></div>
    </div>
    <div v-else>
      <div v-for="item in walletList" :key="item.symbol">
        <div class="wallet-item" v-if="$store.state.hideCoin.indexOf(item.symbol) == -1">
          <div>
            <CoinIcon :symbol="item.symbol" size="1.3"/>
            <b class="mr-1">{{item.name}}</b>

            <a class="mr-2" @click.stop="chooseWallet(item.symbol)">
              <SvgIcon name="more" />
            </a>

            <div class="float-right">
              <button
                class="btn btn-primary btn-sm"
                @click.stop="walletReceive([item.addr, item.symbol])"
              >收款</button>
              <button
                class="btn btn-sm ml-1"
                @click.stop="walletSend([item.addr, item.symbol, item.balance])"
              >转账</button>
            </div>
          </div>

          <div class="sub-line">
            <span class="select-network mr-2">
              <div class="form-group">
                <select class="form-select select-sm"
                @change="saveNetworkMap(item)" v-model="item.network">
                  <option value="">请选择网络</option>
                  <option v-for="(item, i) in $root.networkMap[item.symbol]"
                  :key="i" :value="i">{{item}}</option>
                </select>
              </div>
            </span>

            <span class="account-name no-select" v-if="!changeNameMap[item.symbol]"
            @click.stop="toggleChangeName(item)">{{item.account}}</span>
            <span class="d-inline-block input-has-right-icon" v-else>
              <input
                @keyup.enter="saveChangeName(item)"
                @blur="saveChangeName(item)"
                id="accountEdit"
                class="form-input mt-1 mb-1"
                v-model="item.account"
                spellcheck="false"
              />
              <a @click.stop="saveChangeName(item)">保存</a>
            </span>
            <span class="ml-2 neat-font text-gray">{{item.addr}}</span>

            <span class="option">
              <a class="mr-1" @click.stop="$root.copyText(item.addr, '钱包地址')">
                <SvgIcon name="copy" />
              </a>
              <a :href="$root.detailLink(item.symbol, item.addr, item.network)"
                target="_blank" rel="nofollow">
                <SvgIcon name="flow" />
              </a>
            </span>

            <span class="float-right neat-font ml-2 text-right" style="max-width: 11rem">
              <span class="neat-font"
                >{{$root.numFormat(item.balance, 4)}}</span>{{item.symbol.split('|')[0]}}<small
                class="text-gray no-break">≈¥{{$root.numFormat(item.value, 2)}}</small>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';

export default {
  data() {
    return {
      loading: false,
      walletList: [],
      changeNameMap: {},
    };
  },
  beforeDestroy() {
    this.$root.$off('udpateWalletList');
  },
  created() {
    this.$root.$on('udpateWalletList', () => {
      this.udpateWalletList();
    });

    this.udpateWalletList();
  },
  methods: {
    reload() {
      this.loading = true;
      this.udpateWalletList();
      setTimeout(() => {
        this.loading = false;
      }, 500);
    },
    toggleChangeName(item) {
      this.changeNameMap = {};
      this.changeNameMap[item.symbol] = true;
      this.$forceUpdate();
      setTimeout(() => {
        document.getElementById('accountEdit').focus();
      }, 50);
    },
    async getAllBalance() {
      const priceMap = await this.$root.getPriceMap();
      this.walletList.forEach(async (item, index) => {
        const { symbol, addr, network } = item;
        this.walletList[index].balance = await this.$root.getBalance(symbol, addr, network);
        const price = priceMap[symbol] || 0;
        this.walletList[index].value = (this.walletList[index].balance * price).toFixed(2);
      });
    },
    udpateWalletList() {
      const { walletMap } = this.$store.state;
      const walletList = [];
      if (walletMap) {
        Object.keys(walletMap).forEach((symbol) => {
          const {
            name, wallet, cur, network,
          } = walletMap[symbol];
          const { addr, account } = wallet[cur];
          walletList.push({
            cur,
            name,
            symbol,
            addr,
            account,
            network,
            balance: '0',
            value: '0.00',
            import: false,
          });
        });
      }
      this.walletList = walletList;
      this.getAllBalance();
    },
    saveNetworkMap(item) {
      let { network } = item;
      if (network === '') {
        network = 0;
      }
      const { walletMap } = this.$store.state;
      walletMap[item.symbol].network = network;

      this.setStateValue({
        k: 'walletMap',
        v: JSON.parse(JSON.stringify(walletMap)),
      });
      this.udpateWalletList();
    },
    saveChangeName(item) {
      if (!item.account) {
        this.$toasted.show('账户名称不能为空');
        return;
      }

      this.changeNameMap = {};
      const { walletMap } = this.$store.state;

      walletMap[item.symbol].wallet[item.cur].account = item.account;

      this.setStateValue({
        k: 'walletMap',
        v: walletMap,
      });
    },
    chooseWallet(symbol) {
      this.$root.$emit('showModal', { mod: 'chooseWallet', val: [symbol] });
    },
    walletReceive(val) {
      this.$root.$emit('showModal', { mod: 'walletReceive', val });
    },
    walletSend(val) {
      this.$root.$emit('showModal', { mod: 'walletSend', val });
    },
    ...mapMutations(['setStateValue']),
  },
};
</script>
<style lang="scss" scoped>
.wallet {
  padding-bottom: 3rem;
}
.wallet-item {
  padding: 1rem 0 .25rem;
  clear: both;
  .select-network {
    vertical-align: top;
    line-height: 1.6rem;
    margin-left: .1rem;
    max-width: 6rem;
    display: inline-block;
  }
  .icon {
    display: inline-block;
    width: 1.3rem;
    margin: 0 .2rem .2rem 0;
    font-size: 0;
    vertical-align: top;
    img {
      width: 100%;
    }
  }
  .account-name {
    border-radius: .1rem;
    vertical-align: top;
    padding: .15rem .2rem;
    font-weight: bold;
    transition: background-color .2s;
    &:hover {
      background: #eee;
    }
  }
  .float-right {
    font-size: .85rem;
  }
  .sub-line {
    line-height: 1.8rem;
  }
}
</style>
