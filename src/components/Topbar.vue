<template>
  <div>
    <div class="topbar-placeholder"></div>
    <div class="topbar" v-if="$route.name !=='home'">
      <div class="container columns">
        <div class="column col-2 hide-xl"></div>
        <div class="topbar-in column col-xl-12 col-8">
          <div class="left">
            <a class="logo" href="https://w3c.market">
              <img src="../assets/images/logo.svg" alt />
            </a>
          </div>
          <div v-if="['service'].indexOf($route.name) === -1" class="wm-navbar">
            <router-link :class="{on:$route.name =='wallet'}" to="/wallet">钱包</router-link>
            <router-link :class="{on:$route.name =='market'}" to="/market">市场</router-link>
            <router-link :class="{on:$route.name =='setting'}" to="/setting">设置</router-link>
          </div>
          <div class="right">
            <a v-if="['service'].indexOf($route.name) > -1" @click.stop="$root.backPage">返回</a>
            <router-link v-else :class="{on:$route.name =='about'}" to="/about">帮助</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  created() {
    // 判断是否为新设备
    if (!this.$store.state.sid) {
      this.$router.push('/');
    }
  },
};
</script>

<style lang="scss" scoped>
.topbar-placeholder {
  height: 5rem;
}
.topbar {
  text-align: center;
  line-height: 1.2rem;
  background: #fff;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 1rem 0;
  height: 3.2rem;
  box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.03), 0 1px 6px 0 rgba(0, 0, 0, 0.02),
    0 0 4px -1px rgba(0, 0, 0, 0.04);

  .topbar-in {
    position: relative;
    background: #fff;
  }
  .logo img {
    height: 1.2rem;
    margin-top: -0.2rem;
    display: inline-block;
    vertical-align: middle;
  }
  .left,
  .right {
    top: 0;
    position: absolute;
  }
  .left {
    left: 0.4rem;
  }
  .right {
    right: 0.4rem;
  }
  a {
    color: #555;
    font-size: .85rem;
  }
  .wm-navbar {
    width: 100%;
    a {
      color: #555;
      margin: 0 .2rem 0 .8rem;
      transition: 0.2s all;
    }
  }
  a.on {
    color: #222;
    font-weight: bold;
  }
}
</style>
