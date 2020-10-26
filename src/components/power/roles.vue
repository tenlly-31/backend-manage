<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/home' }">权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddDialog">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="roleList" border stripe>
        <!-- 展开列表 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              class="vcenter"
              :class="['bdbottom', i1===0 ? 'bdtop' : '']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级 -->
              <el-col :span="19">
                <el-row
                  class="vcenter"
                  :class="[i2===0 ? '' : 'bdtop']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      closable
                      type="warning"
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <!-- 操作按钮 -->
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editRole(scope.row)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRole(scope.row.id)">删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showRightsDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限的对话框 -->
    <el-dialog title="提示" :visible.sync="setDialogVisible" 
    width="50%" @closed="setDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree :data="rightsList" :props="treeProps" 
      show-checkbox node-key="id" default-expand-all
      :default-checked-keys="checkRights" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRights">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加角色的对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%"
    @close="addClosed">
      <!-- 添加表单数据 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="70px"
      >
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色的对话框 -->
    <el-dialog title="修改角色信息" :visible.sync="changeDialogVisible" width="50%"
    @close="$refs.changeRoleRef.resetFields()">
      <!-- 添加表单数据 -->
      <el-form
        :model="changeRoleForm"
        :rules="addFormRules"
        ref="changeRoleRef"
        label-width="70px"
      >
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="changeRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="changeRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="changeDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      roleList: [],
      setDialogVisible: false,
      rightsList: [],
      treeProps: {
        label: "authName",
        children: "children",
      },
       // 添加角色表单数据
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      checkRights: [],
      // 保存当前分配权限的ID
      roleId: '',
      addDialogVisible: false,
      // 修改角色对话框是否显示
      changeDialogVisible: false,
      // 修改角色表单数据
      changeRoleForm: {
        roleName: '',
        id: '',
        roleDesc: ''
      },
      // 验证规则
      addFormRules: {
        roleName: [
          {
            required: true,
            message: '请输入角色名',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 10,
            message: '角色名长度在3-10个字符之间',
            trigger: 'blur'
          }
        ]
      }
    };
  },
  created() {
    this.getRoleList();
  },
  methods: {
    // 获取角色列表
    async getRoleList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$Message.error(res.meta.msg);
      }
      this.roleList = res.data;
    },
    showAddDialog() {
      this.addDialogVisible = true
    },
    addClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加角色
    addRole() {
      this.$refs.addFormRef.validate(async valid=>{
        if(!valid) return
        // 发起添加角色的网络请求
        const {data: res} = await this.$http.post('roles',this.addForm)
        if(res.meta.status != 201) return this.$Message.error(res.meta.msg)
        this.$Message.success(res.meta.msg)
        this.addDialogVisible = false
        this.getRoleList()
      })
      
    },
    // 移除权限
    async removeRightById(role, rightId) {
      // 弹框提示
      const confirmRes = await this.$confirm(
        "此操作将永久删除该权限, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定删除",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      // console.log(confirmRes)
      if (confirmRes !== "confirm") return this.$Message.info("已取消删除");
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) {
        return this.$Message.error(res.meta.msg);
      }
      this.$Message.success(res.meta.msg);
      // 响应式，重新赋值即可
      role.children = res.data;
    },
    // 展示分配权限的对话框
    async showRightsDialog(role) {
      // 保存当前分配权限的角色id
      this.roleId = role.id
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200) return this.$Message.error(res.meta.msg);
      this.rightsList = res.data;
      this.getLeafKeys(role,this.checkRights)
      this.setDialogVisible = true;
    },
    getLeafKeys(node,arr) {
      if(!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item=>{
        this.getLeafKeys(item,arr)
      })
    },
    // 清空权限数据
    setDialogClosed() {
      this.checkRights = []
    },
    // 通过API保存分配的权限
    async setRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // 将数组拼接为字符串
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`,{rids: idStr});
      if (res.meta.status !== 200) return this.$Message.error(res.meta.msg);
      this.$Message.success(res.meta.msg)
      this.getRoleList()
      this.setDialogVisible = false;
    },
    // 修改角色
    editRole(roleInfo) {
      this.changeRoleForm = roleInfo
      this.changeDialogVisible = true
    },
    // 确定修改
    async setRole() {
      this.$refs.changeRoleRef.validate(async (valid) => {
        if (!valid) return;
        const {data: res} = await this.$http.put(`roles/${this.changeRoleForm.id}`,this.changeRoleForm)
        if (res.meta.status !== 200) return this.$Message.error(res.meta.msg);
        this.$Message.success("修改成功！")
        this.getRoleList()
        this.changeDialogVisible = false;
      })
    },
    // 删除角色
    async deleteRole(id) {
        const confirmRes =await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        // console.log(confirmRes)
        if(confirmRes !== 'confirm') return this.$Message.info('已取消删除')
        const {data: res} = await this.$http.delete('roles/' + id)
        if(res.meta.status !== 200) {
          return this.$Message.error(res.meta.msg)
        }
        this.$Message.success('删除角色成功！')
        this.getRoleList()         
    },
  },
};
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eeeeee;
}
.bdbottom {
  border-bottom: 1px solid #eeeeee;
}
// 设置居中对齐
.vcenter {
  display: flex;
  align-items: center;
}
</style>