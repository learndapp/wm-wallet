<template>
  <div class="modal-container">
    <div class="modal-header">
      <h5>
        创建钱包
        <a
          @click.stop="$root.$emit('closeModal')"
          class="btn btn-clear float-right small-hide"
          aria-label="Close"
        ></a>
      </h5>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <div class="form-group">
          <select class="form-select" v-model="symbol">
            <option value="">选择币种</option>
            <option v-for="item in $root.coinList"
              :key="item.symbol" :value="item.symbol">{{item.symbol}}</option>
          </select>
        </div>
        <div class="form-group">
          <input type="text" v-model="account" class="form-input"
            placeholder="账户名称" spellcheck="false" />
        </div>
        <div class="form-group">
          <input type="password" v-model="pwd" class="form-input" placeholder="请先验证密码" />
        </div>
        <div class="mt-2 text-gray">为方便管理，目前每个类型钱包支持创建5个</div>
      </div>
    </div>
    <div class="modal-footer">
      <button @click.stop="submit" :class="{loading: loading}" class="btn btn-primary">创建</button>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';

export default {
  data() {
    return {
      symbol: '',
      account: '',
      pwd: '',
      createNum: 1,
      loading: false,
    };
  },
  watch: {
    symbol(val) {
      if (val) {
        const { walletMap } = this.$store.state;
        let num = 0;
        walletMap[val].wallet.forEach((item) => {
          if (!item.s) {
            num += 1;
          }
        });
        this.createNum = num;
        this.account = `${val.split('|')[0]}账户${num + 1}`;
      } else {
        this.account = '';
      }
    },
  },
  methods: {
    async submit() {
      const { symbol, account, pwd } = this;
      if (!symbol) {
        this.$toasted.show('请选择币种');
        return;
      }
      if (!account) {
        this.$toasted.show('账户名称不能为空');
        return;
      }

      const { walletMap } = this.$store.state;

      const num = walletMap[symbol].wallet.length;
      if (num >= 5) {
        this.$toasted.show(`目前已经创建5个${symbol}钱包`);
        return;
      }

      this.loading = true;

      const checkPwdRet = await this.$root.checkPwd(pwd);
      if (!checkPwdRet) {
        this.loading = false;
        this.$toasted.show('密码错误，请重新输入');
        return;
      }
      const mnemonic = checkPwdRet;

      setTimeout(() => {
        walletMap[symbol].wallet.push({
          addr: this.$root.createWallet(symbol, mnemonic, this.createNum)[0],
          account,
        });
        walletMap[symbol].cur = num;

        this.setStateValue({
          k: 'walletMap',
          v: walletMap,
        });
        this.symbol = '';
        this.$root.$emit('udpateWalletList');
        this.$root.$emit('closeModal');
        this.loading = false;
        this.$toasted.show('创建成功');
      }, 200);
    },
    ...mapMutations(['setStateValue']),
  },
};
</script>

<style scoped>

</style>
