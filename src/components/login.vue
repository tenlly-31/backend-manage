<template>
  <div class="login-container">
    <div class="login-box">
      <div class="ava-box">
        <img src="../assets/img/hei.png" alt />
      </div>
      <!-- 登录表单 -->
      <!-- ref获取表单的实例对象 -->
      <el-form class="login-form" ref="loginFormEg" :model="loginForm" :rules="loginRules">
        <el-form-item prop="username">
          <!-- 前置图标prefix-icon 后置图标suffix-icon -->
          <!-- 用户名 -->
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user">用户名</el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="iconfont icon-mima" type="password">密码</el-input>
        </el-form-item>
        <el-form-item class="btn-form">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      loginForm: {
        username: "admin",
        password: "123456",
      },
      // 表单的验证规则
      loginRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 10, message: "长度在3到10个字符", trigger: "blur" },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, max: 15, message: "长度在6到15个字符", trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    // 点击重置信息
    resetLoginForm() {
      // resetFields()函数重置
      this.$refs.loginFormEg.resetFields();
    },
    login() {
      this.$refs.loginFormEg.validate(async (valid) => {
        if (!valid) return;
        // 对象重构。发出post请求
        const { data: res } = await this.$http.post("login", this.loginForm);
        if (res.meta.status != 200) return this.$Message.error(res.meta.msg);
        this.$Message.success(res.meta.msg);
        window.sessionStorage.setItem("token", res.data.token);
        this.$router.push("home");
      });
    },
  },
};
</script>
<style lang="less" scoped>
.login-container {
  height: 100%;
  background-color: #2b4b6b;
}
.login-box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 5px;
  position: absolute;
  // 以左上角为原点
  left: 50%;
  top: 50%;
  // 改变原点，自身的50%
  transform: translate(-50%, -50%);
}
.ava-box {
  height: 100px;
  width: 100px;
  // background-color: #fff;
  border-radius: 50%;
  border: 1px solid #eee;
  padding: 10px;
  box-shadow: 0 0 10px #ddd;
  position: absolute;
  left: 50%;
  // 改变原点，自身的50%
  transform: translate(-50%, -50%);
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
}
.login-form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 30px;
  box-sizing: border-box;
  .btn-form {
    display: flex;
    justify-content: flex-end;
  }
}
</style>