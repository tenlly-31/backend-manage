<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/welcome' }">订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" clearable @clear="getOrderList" v-model="queryInfo.query">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单列表 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number" width="200px"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <el-button type="success" size="mini" v-if="scope.row.pay_status === '1'">已付款</el-button>
            <el-button type="danger" size="mini" v-else>未付款</el-button>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="creat_time">
          <template slot-scope="scope">{{scope.row.create_time | dateFormat}}</template>
        </el-table-column>
        <!-- 操作按钮 -->
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="ShowEditLo"></el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox"></el-button>
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
    <!-- 修改地址的对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="LocationDialogVisible"
      width="50%"
      @closed="LocationDialogClosed"
    >
      <el-form
        :model="locationForm"
        :rules="locationFormRules"
        ref="locationFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            :options="cityData"
            v-model="locationForm.address1"
            :props="{expandTrigger: 'hover'}"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="locationForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="LocationDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="LocationDialogVisible = false">确定</el-button>
      </span>
    </el-dialog>
    <!-- 物流进度 -->
    <el-dialog
      title="物流进度"
      :visible.sync="progressDialogVisible"
      width="50%"
      @closed="progressDialogClosed"
    >
      <el-timeline :reverse="reverse">
    <el-timeline-item
    color="#0bbd87"
      v-for="(activity, index) in activities"
      :key="index"
      :timestamp="activity.timestamp">
      {{activity.content}}
    </el-timeline-item>
  </el-timeline>

    </el-dialog>
  </div>
</template>

<script>
import cityData from "./citydata";
export default {
  data() {
    return {
      orderList: [],
      total: 0,
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 5,
      },
      LocationDialogVisible: false,
      progressDialogVisible: false,
      progressInfo: [],
      locationForm: {
        address1: [],
        address2: "",
      },
      locationFormRules: {
        address1: [
          {
            required: true,
            message: "请选择省市区/县",
            trigger: "blur",
          },
        ],
        address2: [
          {
            required: true,
            message: "请填写详细地址",
            trigger: "blur",
          },
        ],
      },
      cityData,
      reverse: false,
        activities: [
          {
          content: '您的快递已签收，感谢使用顺丰快递',
          timestamp: '2020-10-13 13:35:05'
        },{
          content: '快件已到达双流配送站，正在准备配送',
          timestamp: '2020-10-13 09:23:54'
        },{
          content: '快件已到达成都航空部，预计明天送达',
          timestamp: '2020-10-12 19:55:21'
        },{
          content: '快件已发货',
          timestamp: '2020-10-12 12:42:50'
        }, {
          content: '顺丰已揽件，正在等待出库',
          timestamp: '2020-10-11 10:20:13'
        }, {
          content: '商家已确认，正在等待揽件',
          timestamp: '2020-10-11 23:05:20'
        }]

    };
  },
  created() {
    this.getOrderList();
  },
  methods: {
    async getOrderList() {
      const { data: res } = await this.$http.get("orders", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) return this.$Message.error(res.meta.msg);
      // console.log(res.data.goods)
      console.log(res);
      this.orderList = res.data.goods;
      this.total = res.data.total;
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrderList();
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getOrderList();
    },
    ShowEditLo(row) {
      this.LocationDialogVisible = true;
    },
    LocationDialogClosed() {
      this.$refs.locationFormRef.resetFields();
    },
    async showProgressBox() {
      // const { data: res } = await this.$http.get('/kuaidi/804909574412544580');
      // if (res.meta.status !== 200) {
      //   return this.$Message.error(res.meta.msg);
      // }
      // console.log(res)
      // // this.progressInfo = res.data
      // this.$Message.success(res.meta.msg);
      this.progressDialogVisible = true;
    },
    progressDialogClosed() {
      this.$refs.progressFormRef.resetFields();
    },
  },
};
</script>

<style>
</style>