<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/welcome' }">用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 顶层搜索+退出 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" clearable @clear="getUserList" v-model="queryInfo.query">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 数据内容展示 -->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <!-- 操作按钮 -->
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="ShowEditUser(scope.row)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="ShowDeleteUser(scope.row.id)"></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false" >
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="SHowEditRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%"
    @close="addDialogClosed">
      <!-- 添加表单数据 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户信息的对话框 -->
    <el-dialog title="修改用户信息" :visible.sync="changeDialogVisible" width="50%"
    @close="$refs.changeFormRef.resetFields()">
      <!-- 添加表单数据 -->
      <el-form
        :model="changeForm"
        :rules="addFormRules"
        ref="changeFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="changeForm.username" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="changeForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="changeForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="changeDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="changeUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 删除用户 -->
  </div>
</template>
<script>
export default {
  data() {
    // 自定义校验规则
    // 验证邮箱正则
    var checkEmail = (rule,value,callback) => {
      const regEmail = /^[a-zA-Z0-9]+([-_.][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([-_.][a-zA-Z0-9]+)*\.[a-z]{2,}$/
      if(regEmail.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法的邮箱'))
    }
    // 验证手机正则
    var checkMobile = (rule,value,callback) => {
      const regMobile = /^1[3|4|5|7|8][0-9]{9}$/
      if(regMobile.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法的手机号'))
    }
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 2,
      },
      userlist: [],
      total: 0,
      // 控制添加用户的对话框的显示与隐藏
      addDialogVisible: false,
      // 控制修改用户的对话框的显示与隐藏
      changeDialogVisible: false,
      deleteDialogVisible: false,
      RoleDialogVisible: false,
      // 添加用户表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobie: ''
      },
      // 修改用户表单数据
      changeForm: {
        username: '',
        id: 0,
        email: '',
        mobile: ''
      },
      // 添加表单验证规则
      addFormRules: {
        username: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 10,
            message: '用户名长度在3-10个字符之间',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          },
          {
            min: 6,
            max: 15,
            message: '密码长度在6-15个字符之间',
            trigger: 'blur'
          }
        ],
        email: [
          {
            required: true,
            message: '请输入邮箱',
            trigger: 'blur'
          },
          {
            validator: checkEmail,
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            message: '请输入手机号',
            trigger: 'blur'
          },
          {
            validator: checkMobile,
            trigger: 'blur'
          }
        ]
      }
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get("Users", {
        params: this.queryInfo,
      });
      if (res.meta.status != 200) return this.$Message.error(res.meta.msg);
      this.userlist = res.data.users;
      this.total = res.data.total;
    },
    // 监听页数
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    // 监听页码变化
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    async userStateChange(userInfo) {
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      );
      if (res.meta.status != 200) {
        userInfo.mg_state = !userInfo.mg_state;
        return this.$Message.error(res.meta.msg);
      }
      this.$Message.success(res.meta.msg);
    },
    // 重置信息
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加用户
    addUser() {
      this.$refs.addFormRef.validate(async valid=>{
        if(!valid) return
        // 发起添加用户的网络请求
        const {data: res} = await this.$http.post('users',this.addForm)
        if(res.meta.status != 201) return this.$Message.error(res.meta.msg)
        this.$Message.success(res.meta.msg)
        this.addDialogVisible = false
        this.getUserList()
      })
      
    },
    // 展示修改用户的对话框
    ShowEditUser(userInfo) {
      this.changeDialogVisible = true
      this.changeForm.username = userInfo.username
      this.changeForm.id = userInfo.id
      this.changeForm.email = userInfo.email
      this.changeForm.mobile = userInfo.mobile
      },
    async ShowDeleteUser(id) {
        const confirmRes =await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        // console.log(confirmRes)
        if(confirmRes !== 'confirm') return this.$Message.info('已取消删除')
        const {data: res} = await this.$http.delete('users/' + id)
        if(res.meta.status !== 200) {
          return this.$Message.error(res.meta.msg)
        }
        this.$Message.success('删除用户成功！')
        this.getUserList()         
    },
    SHowEditRole() {
      this.RoleDialogVisible = true
    },
    changeUser() {
      this.$refs.changeFormRef.validate(async valid=> {
        if(!valid) return this.$Message("请输入正确的字段")
        const {data: res} = await this.$http.put(`users/${this.changeForm.id}`,this.changeForm)
        if(res.meta.status != 200) return this.$Message.error(res.meta.msg)
        this.$Message.success(res.meta.msg)
        this.changeDialogVisible = false
        this.getUserList()
      })
    }
  },
};
</script>
<style lang="less" scoped>
</style>