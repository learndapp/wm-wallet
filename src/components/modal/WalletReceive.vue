<template>
  <div class="modal-container">
    <div class="modal-header">
      <h5>
        <CoinIcon :symbol="val[1]" size="1.2"/>
        {{val[1]}}收款
        <a
          @click.stop="$root.$emit('closeModal')"
          class="btn btn-clear float-right small-hide"
          aria-label="Close"
        ></a>
      </h5>
    </div>
    <div class="modal-body">
      <div class="text-center">
        <div id="qrcode"></div>
        <div class="neat-font bg-gray p-1 mb-2">{{val[0]}}</div>
        <div>
          <button class="btn btn-primary" @click="$root.copyText(val[0], '钱包地址')">复制地址</button>
        </div>
      </div>
    </div>
    <div class="modal-footer"></div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';

export default {
  props: {
    val: { type: Array },
  },
  mounted() {
    const { qrcode } = window;
    const typeNumber = 4;
    const errorCorrectionLevel = 'L';
    const qr = qrcode(typeNumber, errorCorrectionLevel);
    qr.addData(this.val[0]);
    qr.make();
    document.getElementById('qrcode').innerHTML = qr.createSvgTag({
      cellSize: 5,
      margin: 0,
    });
  },
  methods: {
    submit() {},
    ...mapMutations(['setStateValue']),
  },
};
</script>

<style scoped>
#qrcode {
  margin: .5rem auto;
}
.icon-bg {
  background: #eee;
  margin: 0 auto;
  width: 3.3rem;
  height: 3.3rem;
  padding: .4rem;
  border-radius: 2rem;
}
</style>
