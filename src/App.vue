<template>
  <div id="app">
    <AllModal />

    <div class="text-center" style="padding: 4rem 1rem;" v-if="$store.state.isWx">
      <div class>请在系统默认浏览器中打开当前页面</div>
    </div>
    <div v-else>
      <div class="app-in">
        <topbar />
        <div class="container columns">
          <div class="column col-2 hide-xl"></div>
          <div class="column col-xl-12 col-8">
            <router-view />
          </div>
        </div>
      </div>

      <div class="footer">
        Copyright © 2019. WM钱包版本{{$root.version}}
        <span class="hide-sm">，移动端已适配，欢迎</span>
        <a class="hide-sm ml-1" href="https://w3c.group/g/1124475/join" target="_blank">免费申请上币</a>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';

import util from '@/util/index';

export default {
  name: 'App',
  data() {
    return {
      isWx: false,
    };
  },
  created() {
    const interval = setInterval(() => {
      const ua = navigator.userAgent.toLowerCase();
      this.setStateValue({
        k: 'isWx',
        v: /micromessenger/.test(ua),
      });
    }, 100);
    setTimeout(() => {
      clearInterval(interval);
    }, 300);
    util(this.$root, this.$store, this.$toasted, this.setStateValue, this.$toasted);
    //
    this.$root.backPage = () => {
      if (window.history.length < 3) {
        this.$router.push('/');
      } else {
        window.history.back();
      }
    };
    this.$root.copyText = (content, desc) => {
      this.$copyText(content).then(
        () => {
          this.$toasted.show(`${desc}复制成功`);
        },
        () => {
          this.$toasted.show('请手动复制');
        },
      );
    };
  },
  methods: {
    ...mapMutations(['setStateValue']),
  },
};
</script>

<style lang="scss">
@import "./assets/styles/spectre.css";
@import "./assets/styles/common.scss";
$primary-color: #2c57e4;

.app-in {
  min-height: calc(100vh - 3.25rem);
}
.footer {
  border-top: 1px solid #f2f2f2;
  text-align: center;
  color: #b5b5b5;
  padding: 1rem 0.8rem;
}
</style>
