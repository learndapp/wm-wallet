<template>
  <div class="text-center">
    <a class="logo" href="https://w3c.market">
      <img src="../assets/images/logo.svg" alt />
    </a>

    <div v-if="action===''">
      <div v-if="step==1">
        <div class="form-group">
          <div class="d-inline-block" style="width: 13.7rem;">
            <input
              v-model="email"
              class="form-input"
              type="email"
              placeholder="邮箱"
              spellcheck="false"
            />
          </div>
        </div>

        <div class="form-group">
          <div class="d-inline-block" style="width: 11rem;">
            <input
              v-model="vcode"
              class="form-input"
              type="text"
              placeholder="验证码"
              spellcheck="false"
              @keyup.enter="checkEmail"
            />
          </div>
          <button @click.stop="getVcode" class="btn ml-1"
            :class="{loading:loading.vcode}">{{resent?'重发':'获取'}}</button>
        </div>
        <button @click.stop="checkEmail"
         class="btn btn-primary" :class="{loading:loading.check}">验证邮箱</button>

        <div class="mt-2 text-gray">
          使用则表示已阅读并同意
          <router-link to="/service">用户协议</router-link>
        </div>

        <div class="back text-gray">
          若已有账户可选择
          <a @click.stop="action='aid'">本地恢复</a>
        </div>
      </div>

      <div class="text-gray" v-if="step==2">
        <div style="margin-bottom: 1rem;">最后一步，输入密码生成属于你的钱包</div>
        <div class="form-group">
          <div class="d-inline-block" style="width: 13.7rem;">
            <input
              class="form-input neat-font"
              type="password"
              v-model="pwd"
              placeholder="请输入密码"
              spellcheck="false"
              @keyup.enter="init"
            />
          </div>
        </div>
        <div class="form-group">
          <div class="d-inline-block" style="width: 13.7rem;">
            <input
              class="form-input neat-font"
              type="password"
              v-model="pwdRepeat"
              placeholder="再次确认密码"
              spellcheck="false"
              @keyup.enter="init"
            />
          </div>
        </div>
        <div class="form-group">
          <button @click.stop="init" class="btn btn-primary">进入钱包</button>
        </div>

        <div>此密码非常重要，请一定要牢记</div>
      </div>
    </div>

    <div v-else-if="action=='aid' || action=='back'">
      <div>
        <div class="form-group">
          <div class="d-inline-block" style="width: 13.7rem;">
            <input
              v-model="sid"
              class="form-input"
              type="text"
              placeholder="sid"
              spellcheck="false"
            />
          </div>
        </div>
        <div v-if="action=='back'" class="form-group">
          <div class="d-inline-block" style="width: 13.7rem;">
            <input
              v-model="s1"
              class="form-input"
              type="text"
              placeholder="s1"
              spellcheck="false"
            />
          </div>
        </div>
        <div class="form-group">
          <div class="d-inline-block" style="width: 13.7rem;">
            <input
              v-model="pwd"
              class="form-input"
              type="password"
              placeholder="密码（若输入不一致则结果不一致）"
              spellcheck="false"
            />
          </div>
        </div>
        <button v-if="action!=='back'" @click.stop="recover" class="btn btn-primary">恢复钱包</button>
        <button v-else @click.stop="takeBack" class="btn btn-primary"
        :class="{loading: loading.takeBack}">获得助记词和私钥</button>
      </div>

      <div class="text-gray" style="margin-top: 1rem">
        <div v-if="action!=='back'">
          服务器异常时可自行
          <a @click.stop="action = 'back'">取回助记词和私钥</a>
        </div>
        <div v-else>
          将生成的文件并下载到本地，请注意保密
        </div>
      </div>
    </div>

    <div v-else>
      <div class="loading loading-lg"></div>
      <div class="text-gray mt-1">正在加载</div>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';
import axios from '@/api';

export default {
  data() {
    return {
      step: 1,
      action: '',
      email: '',
      vcode: '',
      sid: '',
      s1: '',
      pwd: '',
      pwdRepeat: '',
      resent: false,
      loading: {
        vcode: false,
        check: false,
        takeBack: false,
      },
    };
  },
  methods: {
    async getVcode() {
      this.loading.vcode = true;
      const res = await axios.get(`/email/vcode?email=${this.email.trim()}`);
      this.loading.vcode = false;
      if (!res.err) {
        this.resent = true;
        this.$toasted.show('发送成功，请注意查收');
      } else {
        this.$toasted.show(res.err);
      }
    },
    async checkEmail() {
      // 获得邮箱的登记
      this.loading.check = true;
      const res = await axios.post(
        '/email/check',
        axios.qs.stringify({
          email: this.email.trim(),
          vcode: this.vcode.trim(),
        }),
      );
      this.loading.check = false;
      if (res.err) {
        this.$toasted.show(res.err);
      } else {
        this.sid = res.data.sid;
        this.s1 = res.data.s1;
        this.step = 2;
        this.setStateValue({
          k: 'email',
          v: `${this.email.substr(0, 1)}**@${this.email.split('@')[1]}`,
        });
        this.$toasted.show('验证成功');
      }
    },
    init() {
      if (this.pwd.length < 8) {
        this.$toasted.show('密码长度不能小于8位');
        return;
      }
      if (this.pwd !== this.pwdRepeat) {
        this.$toasted.show('两次输入的密码不一致');
        return;
      }
      this.action = 'loading';

      setTimeout(() => {
        this.initAction(this.pwd, this.sid, this.s1);
        setTimeout(() => {
          this.$toasted.show('创建成功，请注意查收备份邮件', { duration: 3000 });
        }, 500);
      }, 100);
    },
    initAction(pwd, sid, s1) {
      const s2 = this.$root.generateS2(pwd, sid);

      const mnemonic = this.$root.generateMnemonic(s1, s2);
      const walletMap = {};

      this.$root.coinList.forEach((item) => {
        const { name, symbol, type } = item;
        walletMap[symbol] = {
          wallet: [{
            addr: this.$root.createWallet(symbol, mnemonic, 0)[0],
            account: `${symbol.split('|')[0]}账户1`,
          }],
          cur: 0,
          network: 0,
          name,
          type,
        };
      });

      // 计算s1
      this.setStateValue({
        k: 'walletMap',
        v: walletMap,
      });
      // 成功后再记录
      this.setStateValue({
        k: 'sid',
        v: this.sid,
      });

      this.$router.push('/wallet');
      this.action = '';
    },
    async recover() {
      const { sid, pwd } = this;

      const s1 = await this.$root.getS1(sid);

      if (!s1) {
        this.$toasted.show('s1输入有误', { duration: 2000 });
        return;
      }

      this.action = 'loading';
      setTimeout(() => {
        this.initAction(pwd, sid, s1);
        setTimeout(() => {
          this.$toasted.show('钱包恢复成功', { duration: 2000 });
        }, 500);
      }, 100);
    },
    takeBack() {
      const { sid, s1, pwd } = this;
      const s2 = this.$root.generateS2(pwd, sid);
      const mnemonic = this.$root.generateMnemonic(s1, s2);

      let content = `===助记词===
${mnemonic}

===地址及私钥===`;
      this.loading.takeBack = true;

      setTimeout(() => {
        this.$root.coinList.forEach((item) => {
          const { symbol, type } = item;

          let i = 0;
          while (i < 5) {
            let wallet = [];

            if (type === 'base') {
              wallet = this.$root.createWallet(symbol, mnemonic, i);
            } else if (type === 'erc20') {
              wallet = this.$root.createWallet('ETH', mnemonic, i);
            }
            content += `
${item.symbol} ${i}: ${wallet[0]} ${wallet[1]}`;
            i += 1;
          }
        });

        // 生成文件
        const aTag = document.createElement('a');
        const blob = new Blob([content]);
        aTag.download = `backup${new Date().getTime()}.txt`;
        aTag.href = URL.createObjectURL(blob);
        aTag.click();
        URL.revokeObjectURL(blob);

        setTimeout(() => {
          this.loading.takeBack = false;
          this.$toasted.show('取回成功', { duration: 2000 });
        }, 100);
      }, 100);
    },
    ...mapMutations(['setStateValue']),
  },
  created() {
    //
    if (this.$store.state.sid) {
      this.$router.push('/wallet');
    }
  },
};
</script>
<style lang="scss" scoped>
.logo {
  display: block;
  margin-bottom: 1rem;
  img {
    height: 2rem;
  }
}
.back {
  margin: 5rem auto;
}
.form-group {
  .btn {
    vertical-align: top;
  }
}
</style>
