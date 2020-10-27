<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/welcome' }">商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false" show-icon></el-alert>
      <!-- 添加分类 -->
      <el-row class="cat_lot">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 级联选择框 -->
          <el-cascader
            v-model="selectedKeys"
            ref="addCateFormRef"
            :options="cateslist"
            :props="cascaderProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many"></el-tab-pane>
        <el-tab-pane label="静态属性" name="only"></el-tab-pane>
        <el-button
          type="primary"
          size="mini"
          :disabled="isBtnDisable"
          @click="addDialogVisible = true"
        >添加{{showTable.btn}}</el-button>
        <el-table :data="showTable.data" border stripe :visible="false">
          <el-table-column type="expand" @expand-change="getCurrentData(row,expandedRows)">
            <template slot-scope="scope">
              <el-tag closable v-for="(item,i) in scope.row.attr_vals" :key="i" @close="deleteTag(i, scope.row)">{{item}}</el-tag>
              <el-input
                class="input-new-tag"
                v-if="scope.row.inputVisible"
                v-model="scope.row.inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="$event.target.blur"
                @blur="handleInputConfirm(scope.row)"
              ></el-input>
              <el-button
                v-else
                class="button-new-tag"
                size="small"
                @click="showInput(scope.row)"
              >+ New Tag</el-button>
            </template>
          </el-table-column>
          <el-table-column type="index"></el-table-column>
          <el-table-column :label="showTable.col" prop="attr_name"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="editForm(scope.row)"
              >修改</el-button>
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="deleteForm(scope.row.attr_id)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tabs>
    </el-card>
    <!-- 添加对话框 -->
    <el-dialog
      :title="'添加'+ showTable.btn"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="$refs.addFormRef.resetFields()"
    >
      <!-- 添加表单数据 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item :label="showTable.col" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改对话框 -->
    <el-dialog
      :title="'修改' + showTable.btn"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 添加表单数据 -->
      <el-form :model="addForm" :rules="addFormRules" ref="editFormRef" label-width="80px">
        <el-form-item :label="showTable.col" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cateslist: [],
      // 级联选择框配置
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        expandTrigger: "hover",
      },
      // 保存选中的值
      selectedKeys: [],
      // 激活页签
      activeName: "many",
      // 数据数组
      manyTableData: [],
      onlyTableData: [],
      addDialogVisible: false,
      addForm: {
        attr_name: "",
        attr_vals: "",
        attr_id: 0,
      },
      // 修改对话框是否显示
      editDialogVisible: false,
      addFormRules: {
        attr_name: [
          {
            required: true,
            message: "请输入名称",
            trigger: "blur",
          },
          {
            min: 2,
            max: 10,
            message: "长度在2-10个字符之间",
            trigger: "blur",
          },
        ],
      },
    };
  },
  created() {
    this.getCateList();
  },
  computed: {
    isBtnDisable() {
      return this.selectedKeys.length === 0;
    },
    cateId() {
      if (this.selectedKeys.length === 0) return null;
      return this.selectedKeys[this.selectedKeys.length - 1];
    },
    showTable() {
      if (this.activeName === "many") {
        return { btn: "参数", col: "参数名称", data: this.manyTableData };
      } else {
        return { btn: "属性", col: "属性名称", data: this.onlyTableData };
      }
    },
  },
  methods: {
    // 获取商品列表
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status != 200) return this.$Message.error(res.meta.msg);
      this.cateslist = res.data;
    },
    handleChange() {
      this.getParamsData();
    },
    handleTabClick() {
      this.getParamsData();
    },
    // 判断标签是否为空
    isStart(str) {
      if (str.match(/^[ ]*$/)) {
        return 0;
      }
      return 1;
    },
    // 获取参数数据
    async getParamsData() {
      if (this.selectedKeys.length === 0) return;
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName },
        }
      );
      if (res.meta.status != 200) return this.$Message.error(res.meta.msg);
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        // 控制文本框的显示与隐藏
        item.inputVisible = false;
        item.inputValue = "";
      });
      console.log(res.data);
      if (this.activeName === "many") {
        this.manyTableData = res.data;
      } else {
        this.onlyTableData = res.data;
      }
    },
    // 添加参数
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid || this.selectedKeys.length === 0) return;
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
            attr_vals: this.addForm.attr_vals,
          }
        );
        if (res.meta.status !== 201) {
          return this.$Message.error(res.meta.msg);
        }
        this.$Message.success("添加成功");
        this.addDialogVisible = false;
      });
    },
    // 添加参数标签
    showInput(row) {
      row.inputVisible = true;
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    async saveAttrVals(row) {
      // 保存到数据库中
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: this.activeName,
          attr_vals: row.attr_vals.join(" "),
        }
      );
      if (res.meta.status !== 200) {
        return this.$Message.error(res.meta.msg);
      }
      this.$Message.success(res.meta.msg)
    },
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }
      // 将输入的内容push到vals中，正则取消空格
      row.attr_vals.push(row.inputValue.replace(/\s*/g,''));
      row.inputVisible = false;
      row.inputValue = "";
      this.saveAttrVals(row)
    },
    // 删除标签
    async deleteTag(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    },
    // 编辑参数
    editForm(row) {
      this.editDialogVisible = true;
      this.addForm.attr_name = row.attr_name;
      this.addForm.attr_id = row.attr_id;
    },
    async editParams() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.addForm.attr_id}`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        if (res.meta.status !== 200) {
          return this.$Message.error(res.meta.msg);
        }
        this.$Message.success(res.meta.msg);
        this.editDialogVisible = false;
        this.getParamsData();
      });
    },
    editDialogClosed() {
      // 重置表单
      this.$refs.editFormRef.resetFields();
      this.addForm = {};
    },
    // 删除参数
    async deleteForm(id) {
      const confirmRes = await this.$confirm(
        "此操作将永久删除该" + this.showTable.btn.slice(-2) + ", 是否继续?",
        "提示",
        {
          confirmButtonText: "确定删除",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmRes !== "confirm") return this.$Message.info("已取消删除");
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${id}`
      );
      if (res.meta.status !== 200) {
        return this.$Message.error(res.meta.msg);
      }
      this.$Message.success(res.meta.msg);
      this.getCateList();
    },
  },
};
</script>

<style lang="less" scoped>
.cat_lot {
  margin: 15px 0;
}
.el-cascader {
  width: 250px;
}
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>