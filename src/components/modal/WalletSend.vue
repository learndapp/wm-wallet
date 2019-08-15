<template>
  <div class="modal-container">
    <div class="modal-header">
      <h5>
        <CoinIcon :symbol="symbol" size="1.2"/>
        转出{{symbol}}
        <a
          @click.stop="$root.$emit('closeModal')"
          class="btn btn-clear float-right small-hide"
          aria-label="Close"
        ></a>
      </h5>
    </div>
    <div class="modal-body">
      <div class="form-group" v-if="checked">
        <div class="neat-font">
          转出地址：{{fromAddr}}
        </div>
      </div>
      <div class="form-group">
        <div class="neat-font" v-if="checked">
          收款地址：{{addr}}
        </div>
        <input type="text" v-else id="address" v-model="addr"
          class="form-input neat-font" placeholder="收款地址" spellcheck="false"/>
      </div>
      <div class="form-group" v-if="checked">
        <div class="neat-font">
          转出金额：{{amount}}
        </div>
      </div>
      <div class="form-group" v-if="!checked">
        <input type="number" v-model="amount" step="0.00000001" min="0.0001"
          class="form-input neat-font" placeholder="金额" spellcheck="false"/>
      </div>
      <div class="form-group" v-if="checked">
        <input type="password" v-model="pwd"
          class="form-input" placeholder="确认密码"/>
      </div>
      <div class="neat-font" v-if="!checked">
        余额：{{balance}}
        <a class="float-right text-bold" @click="sendAll">全部</a>
      </div>
    </div>
    <div class="modal-footer">
      <div class="float-left">
        <span class="pr-2 neat-font">手续费：{{fee || feeSp}}{{feeSymbol}}</span>
        <span class="ml-2 pl-2 neat-font">实际到账：{{final}}{{symbol.split('|')[0]}}</span>
      </div>
      <button class="btn btn-primary" v-if="checked && !waiting"
        :class="{loading: sending}" @click="submit">确认转账</button>
      <button class="btn btn-primary" v-else
        @click="submitBefore" :disabled="waiting || (!fee && !feeSp)">
        {{secTimer>0&&waiting?`请确认信息无误(${secTimer}s)`:'下一步'}}
      </button>
    </div>
  </div>
</template>

<script>
let interval = null;

export default {
  props: {
    val: { type: Array },
  },
  data() {
    return {
      addr: '',
      amount: '',
      fromAddr: '',
      symbol: '',
      balance: '',
      pwd: '',
      fee: 0,
      feeSp: 0,
      feeSymbol: '',
      final: 0,
      secTimer: 3,
      waiting: false,
      checked: false,
      sending: false,
    };
  },
  watch: {
    amount() {
      if (this.$root.txSpList.indexOf(this.symbol) > -1) {
        this.fee = 0;
      }
      if (this.amount - this.fee >= 0) {
        let { amount } = this;
        if (amount > this.balance) {
          amount = this.balance;
        }
        this.final = parseFloat((amount - this.fee).toFixed(8));
        if (this.final < 0) {
          this.final = 0;
        }
      } else {
        this.final = 0;
      }
    },
  },
  async created() {
    [this.fromAddr, this.symbol, this.balance] = this.val;
    this.balance = parseFloat(this.balance);
    setTimeout(() => {
      document.getElementById('address').focus();
    }, 50);
    const { symbol } = this;
    this.fee = await this.$root.getTxFee(symbol);
    [this.feeSymbol] = symbol.split('|');
    if (this.$root.txSpList.indexOf(symbol) > -1) {
      this.feeSymbol = 'ETH';
      this.feeSp = this.fee;
      this.fee = 0;
    }
  },
  methods: {
    sendAll() {
      this.amount = this.balance;
    },
    submitBefore() {
      const {
        addr, amount, symbol, balance,
      } = this;
      if (amount - 0 < 0.0001 || amount - 0 < this.fee) {
        this.$toasted.show('金额过小，请重新输入');
        return;
      }
      if (balance - amount < 0) {
        this.$toasted.show('余额不足，请重新输入');
        return;
      }
      const addrCheck = this.$root.checkWalletAddr(addr, symbol);
      if (!addrCheck) {
        this.$toasted.show('无效的地址，请重新输入');
        return;
      }

      this.waiting = true;
      this.checked = true;
      interval = setInterval(() => {
        this.secTimer -= 1;
        if (this.secTimer < 1) {
          clearInterval(interval);
          this.waiting = false;
        }
      }, 1000);
    },
    async submit() {
      const {
        addr, final, fromAddr, symbol, pwd,
      } = this;
      this.sending = true;
      const res = await this.$root.sendTx(symbol, fromAddr, addr, final, pwd);
      // console.log('tx-send', res);

      if (res.err) {
        this.sending = false;
        this.$toasted.show(res.err);
        return;
      }

      this.sending = false;
      this.$toasted.show('转账请求已提交');
      this.$root.$emit('closeModal');
    },
  },
};
</script>

<style lang="scss" scoped>

.icon {
  width: 1rem;
  img {
    width: 100%;
  }
}
</style>
