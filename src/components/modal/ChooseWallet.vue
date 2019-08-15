<template>
  <div class="modal-container">
    <div class="modal-header">
      <h5>
        {{val[0]==='BTC|TEST'?'BTC':val[0]}}
        地址列表
        {{{'BTC':'(主网)', 'BTC|TEST':'(测试)'}[val[0]]}}
        <a
          @click.stop="$root.$emit('closeModal')"
          class="btn btn-clear float-right small-hide"
          aria-label="Close"
        ></a>
      </h5>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <div v-for="(item, i) in walletList" :key="i">
          <label class="form-radio" @change="cur = i">
            <input type="radio" name="r1" :checked="i==cur" />
            <i class="form-icon"></i>
            <b>{{item.account}}</b>
            <b v-if="item.s" class="ml-2 mr-2 import-tag">已导入</b>
          </label>
          <div class="address neat-font">
            {{item.addr}}<a @click.stop="$root.copyText(item.addr, '钱包地址')">
              <SvgIcon name="copy" />
            </a>
            <div class="float-right">
              <a class="ml-1" v-if="item.s" @click.stop="removeWallet(item, val[0])">移除</a>
              <a class="ml-1" @click.stop="exportWallet(item, i)">导出私钥</a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <!-- <button class="btn btn-primary" @click.stop="$root.$emit('closeModal')">完成</button> -->
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';

export default {
  props: {
    val: { type: Array },
  },
  data() {
    return {
      cur: 0,
      walletList: [],
    };
  },
  watch: {
    cur(val) {
      const { walletMap } = this.$store.state;
      const symbol = this.val[0];
      walletMap[symbol].cur = val;

      this.setStateValue({
        k: 'walletMap',
        v: walletMap,
      });
      this.$root.$emit('udpateWalletList');
    },
  },
  mounted() {
    const symbol = this.val[0];
    const { walletMap } = this.$store.state;
    this.walletList = walletMap[symbol].wallet;
    this.cur = walletMap[symbol].cur;
  },
  methods: {
    removeWallet(now, symbol) {
      const { walletMap } = this.$store.state;

      walletMap[symbol].wallet.forEach((item, index) => {
        if (item.addr === now.addr) {
          walletMap[symbol].wallet.splice(index, 1);
        }
      });

      this.setStateValue({
        k: 'walletMap',
        v: walletMap,
      });
      this.$toasted.show('移除成功');
      setTimeout(() => {
        this.cur = walletMap[symbol].wallet.length - 1;
      }, 200);
    },
    exportWallet(item, cur) {
      this.$root.$emit('showModal', { mod: 'exportWallet', val: [item.addr, this.val[0], cur, item.s] });
    },
    ...mapMutations(['setStateValue']),
  },
};
</script>

<style scoped>
.address {
  line-height: 1.6rem;
  margin-bottom: .4rem;
}
</style>
