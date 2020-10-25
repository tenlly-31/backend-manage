<template>
  <el-container class="home-container">
    <!-- 顶部头部 -->
    <el-header>
      <div>
        <img src="../assets/img/logo1.jpg" alt />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- :unique-opened = "true" 只展开一个菜单项  router开启路由-->
        <el-menu background-color="#333744" text-color="#fff" active-text-color="#409eff" 
                unique-opened :collapse = "isCollapse" :collapse-transition = "false" 
                :router="true" :default-active="activePath">
          <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
            <template slot="title">
              <i :class="iconObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/' + scditem.path"  v-for="scditem in item.children" :key="scditem.id" 
              @click="saveNavState('/' + scditem.path)">
              <i class="el-icon-menu"></i>
              <span slot="title">{{scditem.authName}}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主体 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  // 组件创建即调用
  created(){
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath') 
  },
  data(){
    return {
      menulist: [],
      iconObj:{
        '125': 'iconfont icon-yonghuguanli',
        '103': 'iconfont icon-permission',
        '101': 'iconfont icon-shangpingouwudai',
        '102': 'iconfont icon-icon-',
        '145': 'iconfont icon-xitongguanli'
      },
      isCollapse: false,
      // 被激活的链接地址
      activePath: ''
    }
  },
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    async getMenuList(){
      const {data: res} = await this.$http.get('menus')
      if (res.meta.status != 200) return this.$Message.error(res.meta.msg)
      this.menulist = res.data
    },
    // 点击按钮实现菜单的折叠和展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 保存路径，设置高亮
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath',activePath)
      this.activePath = activePath
    }

  },
};
</script>
<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  display: flex;
  justify-content: space-between;
  background-color: #373d41;
  // padding-left: 0;
  align-items: center;
  div {
    height: 50px;
    display: flex;
    align-items: center;
    img {
      border-radius: 60%;
      height: 100%;
    }
    span {
      margin-left: 15px;
      color: #ffffff;
      font-size: 20px;
      font-weight: bold;
    }
  }
}
.el-container{
  height:100%;
  overflow: hidden;
}
.el-aside {
  background-color: #333744;
  transition: width .5s;
  .toggle-button{
    background-color: #4a5064;
    font-size: 10px;
    line-height: 24px;
    color: #ffffff;
    text-align: center;
    // 字体间距
    letter-spacing: .2em;
    // 鼠标移入变成小手
    cursor: pointer;
  }
  .el-menu{
    border-right: 0;
  }
  .iconfont{
    margin-right:10px;
    font-size: 19px;
  }
}
.el-main {
  background-color: #eaedf1;
}
</style>