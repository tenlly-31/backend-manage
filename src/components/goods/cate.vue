<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/welcome' }">商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 添加分类 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-button type="primary" @click="showAddCat">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 商品内容展示 -->
      <tree-table
        class="treeTable"
        :data="cateslist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-index="true"
        index-text="序号"
        border
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen;"
          ></i>
          <i class="el-icon-error" style="color: red;" v-else></i>
        </template>
        <!-- 显示等级 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level == 0" size="mini">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level == 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作按钮 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditCat(scope.row)"
          >编辑</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deleteCate(scope.row.cat_id)"
          >删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10,15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 添加表单数据 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- options指定展示数据 -->
          <!-- props指定配置对象 -->
          <el-cascader
            v-model="selectedKeys"
            ref="addCateFormRef"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChange"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类对话框 -->
    <el-dialog
      title="修改分类信息"
      :visible.sync="changeDialogVisible"
      width="50%"
      @close="$refs.changeFormRef.resetFields()"
    >
      <!-- 添加表单数据 -->
      <el-form :model="editForm" :rules="addFormRules" ref="changeFormRef" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="changeDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      cateslist: [],
      total: 0,
      addDialogVisible: false,
      changeDialogVisible: false,
      // 父级分类列表
      parentCateList: [],
      // 级联选择器对象
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        expandTrigger: "hover",
        // 任意层级都可选中
        checkStrictly: true
      },
      // 选中的父级分类
      selectedKeys: [],
      addForm: {
        cat_name: "",
        cat_pid: 0,
        // 分类等级，默认一级
        cat_level: 0,
      },
      addFormRules: {
        cat_name: [
          {
            required: true,
            message: "请输入分类名称",
            trigger: "blur",
          },
          {
            min: 3,
            max: 10,
            message: "分类名长度在3-8个字符之间",
            trigger: "blur",
          },
        ],
      },
      // 为table指定列
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          // 当前列定义为模板列
          type: "template",
          // 模板名称
          template: "isok",
        },
        {
          label: "排序",
          // 当前列定义为模板列
          type: "template",
          // 模板名称
          template: "order",
        },
        {
          label: "操作",
          // 当前列定义为模板列
          type: "template",
          // 模板名称
          template: "opt",
        },
      ],
      editForm: {}
    };
  },
  created() {
    this.getCateList();
  },
  
mounted () {
//第二种js方法：点击文字时自动选中radio标签
  setInterval(function () {
    document.querySelectorAll('.el-cascader-node__label').forEach(el => {
      el.onclick = function () {
        if (this.previousElementSibling) this.previousElementSibling.click()
      }
    })
  })
},
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo,
      });
      if (res.meta.status != 200) return this.$Message.error(res.meta.msg);
      this.cateslist = res.data.result;
      this.total = res.data.total;
    },
    // 监听pagesize的改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    // 监听pagenum的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    // 点击展开添加对话框
    showAddCat() {
      this.getParentCateList();
      this.addDialogVisible = true;
    },
    // 获取父级分类数据
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 },
      });
      if (res.meta.status != 200) return this.$Message.error(res.meta.msg);
      this.parentCateList = res.data;
    },
    // 选择项变化时触发的函数
    parentCateChange() {
      this.$refs.addCateFormRef.dropDownVisible = false;
      if(this.selectedKeys.length>0){
        // 设置父级分类的ID
        this.addForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类等级赋值
        this.addForm.cat_level = this.selectedKeys.length
        // this.$refs.addCateFormRef.dropDownVisible = false;
        return
      }else{
        // 设置父级分类的ID
        this.addForm.cat_pid = 0
        // 为当前分类等级赋值
        this.addForm.cat_level = 0
        // this.$refs.addCateFormRef.dropDownVisible = false;
      }
    },
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    addCate() {
       this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        // 发起添加用户的网络请求
        const { data: res } = await this.$http.post("categories", this.addForm);
        if (res.meta.status != 201) return this.$Message.error(res.meta.msg);
        this.$Message.success(res.meta.msg);
        this.getCateList();
        this.addDialogVisible = false 
      })
    },
    // 编辑部分
    showEditCat(cateInfo) {
      this.editForm = cateInfo
      this.changeDialogVisible = true
    },
    async setCate() {
      this.$refs.changeFormRef.validate(async valid=>{
        if(!valid) return
        const {data: res} = await this.$http.put(`categories/${this.editForm.cat_id}`,
          {cat_name : this.editForm.cat_name})
        if (res.meta.status !== 200) return this.$Message.error(res.meta.msg);
        this.$Message.success("修改成功！")
        this.getCateList()
        this.changeDialogVisible = false;
      })
    },
    // 删除部分
    async deleteCate(id) {
        const confirmRes =await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if(confirmRes !== 'confirm') return this.$Message.info('已取消删除')
        const {data: res} = await this.$http.delete('categories/' + id)
        if(res.meta.status !== 200) {
          return this.$Message.error(res.meta.msg)
        }
        this.$Message.success('删除分类成功！')
        this.getCateList()         
    },
  }
}
</script>
<style lang="less" scoped>
.treeTable {
  margin-top: 10px;
}
</style>