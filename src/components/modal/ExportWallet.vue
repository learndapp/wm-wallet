<template>
  <div class="modal-container">
    <div class="modal-header">
      <h5>
        导出钱包私钥
        <a
          @click.stop="$root.$emit('closeModal')"
          class="btn btn-clear float-right small-hide"
          aria-label="Close"
        ></a>
      </h5>
    </div>
    <div class="modal-body">
      <div v-if="!sk">
        <div class="form-group">
            <b>{{symbol}}</b> {{addr}}
        </div>
        <div>
            <input type="password" v-model="pwd" class="form-input" placeholder="请先验证密码">
        </div>
      </div>
      <div v-else>
          {{sk}}
      </div>
    </div>
    <div class="modal-footer">
      <button v-if="!sk" class="btn btn-primary"
        :class="{loading: loading}" @click.stop="submit">导出</button>
      <button v-else class="btn btn-primary"
        :class="{loading: loading}" @click.stop="$root.copyText(sk, '私钥');">复制私钥</button>
    </div>
  </div>
</template>

<script>
import { AES, enc } from 'crypto-js';

export default {
  props: {
    val: { type: Array },
  },
  data() {
    return {
      addr: '',
      symbol: '',
      cur: '',
      pwd: '',
      sk: '',
      s: '',
      loading: false,
    };
  },
  created() {
    [this.addr, this.symbol, this.cur, this.s] = this.val;
  },
  methods: {
    submit() {
      this.loading = true;

      const {
        pwd, cur, symbol, s,
      } = this;

      const { sid } = this.$store.state;

      setTimeout(async () => {
        const checkPwdRet = await this.$root.checkPwd(pwd);
        if (!checkPwdRet) {
          this.loading = false;
          this.$toasted.show('密码错误，请重新输入');
          return;
        }
        const mnemonic = checkPwdRet;
        // 导入的私钥解密
        if (s) {
          const sk = AES.decrypt(s, sid).toString(enc.Utf8);
          this.sk = sk;
          this.loading = false;

          this.$toasted.show('私钥导出成功，请勿泄漏给他人', { duration: 2000 });
          return;
        }

        setTimeout(() => {
          const sk = this.$root.createWallet(symbol, mnemonic, cur)[1];
          this.sk = sk;
          this.loading = false;

          this.$toasted.show('私钥导出成功，请勿泄漏给他人', { duration: 2000 });
        }, 200);
      });
    },
  },
};
</script>

<style scoped>

</style>
