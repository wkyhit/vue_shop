<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区域-->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <!-- 步骤条区域 -->
      <!-- active为当前到的步骤 activeIndex为String，-0后变成number -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- Form表单 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <!-- Tabs标签页区域 -->
        <!-- before-leave是对tabs切换前进行验证，若为false，则不能切换 -->
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave">
          <el-tab-pane label="基本信息" name="0">
            <!-- From表单项 -->
            <!-- prop要与后端数据名字对应，且要经过表单规则校验 -->
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
              <!-- 选择商品分类的级联选择框 -->
              <!-- options用来指定数据源 -->
              <!-- props用来指定配置对象 -->
              <!-- v-model指定选中的对象 -->
              <el-cascader
                clearable
                expandTrigger="hover"
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">商品参数</el-tab-pane>
          <el-tab-pane label="商品属性" name="2">商品属性</el-tab-pane>
          <el-tab-pane label="商品图片" name="3">商品图片</el-tab-pane>
          <el-tab-pane label="商品内容" name="4">商品内容</el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeIndex: "0",
      // 添加商品的表单对象
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 级联选择框双向绑定的数组
        goods_cat: [],
        // 图片的数组
        pics: [],
        // 商品介绍内容
        goods_introduce: "",
        // 商品的参数（数组），包含 `动态参数` 和 `静态属性`
        attrs: []
      },
      //   添加商品的表单校验规则
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" }
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" }
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" }
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" }
        ],
        goods_cat: [
          { required: true, message: "请输入商品分类", trigger: "blur" }
        ]
      },
      // 商品分类列表
      cateList: [],
      // 级联选择框的对象
      cateProps: {
        label: "cat_name",
        value: "cat_id",
        children: "children"
      }
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    //   获取父级分类数据列表
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类列表失败");
      }
      //console.log(res.data)
      this.cateList = res.data;
    },
    // 监听级联选择框选项发生变化的事件
    handleChange() {
      // 如果没有选择3级分类，则清空
      if (this.addForm.goods_cat.length != 3) {
        this.addForm.goods_cat = [];
      }
    },
    // 切换标签之前的钩子，若返回 false 或者返回 Promise 且被 reject，则阻止切换
    beforeTabLeave(activeName, oldActiveName) {
      //对基本信息的商品分类信息是否选择进行验证
      if (oldActiveName === "0" && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请先选择商品分类！");
        return false;
      }
    }
  }
};
</script>

<style lang="less" scoped>
</style>