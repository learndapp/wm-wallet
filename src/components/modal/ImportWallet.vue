<template>
  <div class="modal-container">
    <div class="modal-header">
      <h5>
        使用私钥导入钱包
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
        <div>
            <input type="password" v-model="sk" class="form-input" placeholder="请输入私钥">
        </div>
        <div class="text-gray mt-2">
            导入的钱包暂不支持备份和恢复，请注意自行备份你的私钥<br>
            ERC20币种可以使用和ETH钱包相同的私钥导入，分开操作和管理
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" @click.stop="submit">导入</button>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';
import { AES } from 'crypto-js';

export default {
  props: {
    val: { type: Array },
  },
  data() {
    return {
      symbol: '',
      sk: '',
    };
  },
  created() {

  },
  methods: {
    submit() {
      const { symbol, sk } = this;
      if (!symbol) {
        this.$toasted.show('请先选择币种');
        return;
      }

      const { walletMap, sid } = this.$store.state;

      const addr = this.$root.generateAddr(symbol, sk);
      if (!addr) {
        this.$toasted.show('请输入正确的私钥');
        return;
      }


      // 判断是否重复导入
      const walletList = walletMap[symbol].wallet;
      let n = 0;
      for (let i = 0; i < walletList.length; i += 1) {
        if (walletList[i].s) {
          n += 1;
        }
        if (walletList[i].addr === addr) {
          this.$toasted.show('请勿重复导入');
          return;
        }
      }

      const s = AES.encrypt(sk, sid).toString();

      this.$root.$emit('closeModal');

      walletMap[symbol].cur = walletList.length;
      walletMap[symbol].wallet.push({
        addr,
        account: `${symbol.split('|')[0]}导入${n + 1}`,
        s,
      });

      this.setStateValue({
        k: 'walletMap',
        v: walletMap,
      });
      this.$root.$emit('udpateWalletList');

      this.$toasted.show('导入成功');
    },
    ...mapMutations(['setStateValue']),
  },
};
</script>

<style scoped>

</style>
