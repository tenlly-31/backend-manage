<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/welcome' }">商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <el-alert title="添加商品信息" type="success" center show-icon :closable="false"></el-alert>
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab栏区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="ruleForm"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                ref="addFormRef"
                :options="cateslist"
                :props="cascaderProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb,i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item1.attr_name"
              v-for="item1 in onlyTableData"
              :key="item1.attr_id"
            >
              <el-input v-model="item1.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action图片上传地址 -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              list-type="picture"
              :headers="headerObj"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="dialogVisible" width="50%">
      <img :src="previewPath" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
// 导入深拷贝文件
import _ from 'lodash'
export default {
  data() {
    return {
      cateslist: [],
      // 默认第一步被激活
      activeIndex: "0",
      onlyTableData: [],
      manyTableData: [],
      uploadURL: "http://timemeetyou.com:8889/api/private/v1/upload",
      previewPath: "",
      dialogVisible: false,
      headerObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        expandTrigger: "hover",
      },
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        // 保存属性和参数数据
        attrs: []
      },
      addFormRules: {
        goods_name: [
          {
            required: true,
            message: "请输入商品名称",
            trigger: "blur",
          },
        ],
        goods_price: [
          {
            required: true,
            message: "请输入商品价格",
            trigger: "blur",
          },
        ],
        goods_weight: [
          {
            required: true,
            message: "请输入商品重量",
            trigger: "blur",
          },
        ],
        goods_number: [
          {
            required: true,
            message: "请输入商品数量",
            trigger: "blur",
          },
        ],
        goods_cat: [
          {
            required: true,
            message: "请输入商品分类",
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
    cateId() {
      return this.addForm.goods_cat[this.addForm.goods_cat.length - 1];
    },
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status != 200) return this.$Message.error(res.meta.msg);
      this.cateslist = res.data;
    },
    handleChange() {},
    beforeTabLeave(actName, oldName) {
      if (oldName === "0" && this.addForm.goods_cat.length === 0) {
        this.$Message.error("请先选择商品分类！");
        return false;
      }
    },
    async tabClicked() {
      if (this.activeIndex === "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "many" },
          }
        );
        if (res.meta.status != 200) return this.$Message.error(res.meta.msg);
        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ");
        });
        this.manyTableData = res.data;
      } else if (this.activeIndex === "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "only" },
          }
        );
        if (res.meta.status != 200) return this.$Message.error(res.meta.msg);
        this.onlyTableData = res.data;
      }
    },
    // 点击图片预览
    handlePreview(file) {
      this.previewPath = file.response.data.url;
      this.dialogVisible = true
    },
    // 删除图片
    handleRemove(file) {
      const filePath = file.response.data.tmp_path;
      const i = this.addForm.pics.findIndex((x) => x.pic === filePath);
      this.addForm.pics.splice(i, 1);
      console.log(this.addForm);
    },
    handleSuccess(response) {
      const picInfo = { pic: response.data.tmp_path };
      this.addForm.pics.push(picInfo);
      console.log(this.addForm);
    },
    // 上传商品内容
    add() {
      this.$refs.ruleForm.validate(async valid => {
        if(! valid) {
          return this.$Message.error('请填写必要的表单项！')
        }
        // 添加
        // 处理动态参数
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        this.manyTableData.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals.join(' ')}
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals}
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        console.log(form)
        // 发起请求添加商品
        const {data: res} = await this.$http.post('goods',form)
        if(res.meta.status !== 201) {
          return this.$Message.error('添加商品失败！')
        }
        this.$Message.success(res.meta.msg)
        this.$router.push('/goods')
      })
    }
  },
};
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg{
  width: 100%;
}
.btnAdd{
  margin-top: 15px;
}
</style>>