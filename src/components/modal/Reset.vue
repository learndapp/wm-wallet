<template>
  <div class="modal-container">
    <div class="modal-header">
      <a
        @click.stop="$root.$emit('closeModal')"
        class="btn btn-clear float-right small-hide"
        aria-label="Close"
      ></a>
    </div>
    <div class="modal-body">
        <p>
            <b>重置前：请先务必进行备份</b>（导入钱包的私钥、当前密码、sid、s1）
        </p>
        <p>
          <b>重置后：</b>当前设备将回到首次使用wm钱包的状态，并不影响服务器端备份，重置后可以重新设置密码或重新导入已存在的账户。
        </p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" v-if="checked" @click="resetAction">确认重置</button>
      <button class="btn" v-else @click="resetBefore" :disabled="waiting">
        {{secTimer>0&&waiting?`再认真考虑一会(${secTimer}s)`:'重置数据'}}
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
      secTimer: 3,
      checked: false,
      waiting: false,
    };
  },
  methods: {
    resetBefore() {
      clearInterval(interval);
      this.waiting = true;
      interval = setInterval(() => {
        this.secTimer -= 1;
        if (this.secTimer < 1) {
          clearInterval(interval);
          this.checked = true;
        }
      }, 1000);
    },
    resetAction() {
      this.$root.$emit('closeModal');
      setTimeout(() => {
        localStorage.clear();
        window.location.href = '/';
        setTimeout(() => {
          window.location.reload();
        }, 500);
      });
    },
  },
};
</script>

<style scoped>

</style>
