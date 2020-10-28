<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/welcome' }">订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <div id="main" style="width: 800px;height:400px;"></div>
    </el-card>
  </div>
</template>

<script>
import echarts from 'echarts'
import _ from 'lodash'
export default {
  data() {
    return {
      // 需要合并的数据
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }

    },
  created() {

  },
  //dom渲染完成后调用的函数
  async mounted() {
    // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(document.getElementById('main'));
        const { data: res} = await this.$http.get('reports/type/1')
         if (res.meta.status != 200) return this.$Message.error(res.meta.msg)
      console.log(res)
      //4.准备数据和配置项
      const result = _.merge(res.data, this.options)
        // 使用指定的配置项和数据显示图表。
        myChart.setOption(result);
  },
  methods: {

  }
}
</script>

<style>

</style>