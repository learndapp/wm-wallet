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
      <p>通过备份邮件你可以拿到当前账户的sid和s1，可用于在当前设备恢复钱包</p>
      <div>
        <input type="text" v-model="email" class="form-input"
          placeholder="请确认账户邮箱" spellcheck="false"/>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" @click="submit">备份到邮箱</button>
    </div>
  </div>
</template>

<script>
import axios from '@/api';

export default {
  props: {
    val: { type: Array },
  },
  data() {
    return {
      email: '',
      loading: false,
    };
  },
  methods: {
    async submit() {
      this.loading = true;
      const { sid } = this.$store.state;
      const res = await axios.post(
        '/backup',
        axios.qs.stringify({
          email: this.email.trim(),
          sid,
        }),
      );
      this.loading = false;
      if (res.err) {
        this.$toasted.show(res.err);
      } else {
        this.$root.$emit('closeModal');
        this.$toasted.show('验证成功，请注意查收邮件');
      }
    },
  },
};
</script>

<style scoped>

</style>
