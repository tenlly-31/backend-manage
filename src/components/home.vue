<template>
<div>
  <div>主界面</div>
  <el-button type='info' @click='logout'>退出</el-button>
</div>
</template>
<script>
export default{
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push('/login')
    }
  }
} 
</script>