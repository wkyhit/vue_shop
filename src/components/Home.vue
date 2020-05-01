<template>
  <div>
    <el-button type="info" @click="loginOut">退出</el-button>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },

  components: {},

  computed: {},

  mounted: {},

  methods: {
    loginOut: function() {
      //清空token
      window.sessionStorage.clear();
      //跳转到登录页
      this.$router.push("/login");
    }
  }
};
</script>
<style lang='less' scoped>
</style>