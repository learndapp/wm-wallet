<template>
  <div class>
    <div>
      <p>
        当前邮箱：
        {{$store.state.email}}
      </p>
      <p>
        账户备份：
        <a @click.stop="$root.$emit('showModal', { mod: 'emailBackup' })">发送邮件</a>
      </p>
      <p>
        重置数据：
        <a @click.stop="$root.$emit('showModal', { mod: 'reset' })">操作说明</a>
      </p>
      <p>
        版本切换：
        <span class="d-inline-block">
          <select class="form-select select-sm" v-model="$root.version">
            <option value="">选择版本</option>
            <option value="0.1">0.1</option>
          </select>
        </span>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
};
</script>
<style lang="scss" scoped>
</style>
