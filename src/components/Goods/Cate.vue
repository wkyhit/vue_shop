<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加分类按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table
        :data="cateList"
        class="treeTable"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否为有效列 -->
        <template slot="isOk" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: #1E90FF;"></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>

        <!-- 排序列 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level==0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level==1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>

        <!-- 操作列 -->
        <template slot="opt" slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>

        <el-form-item label="父级分类：">
          <!-- options用来指定数据源 -->
          <!-- props用来指定配置对象 -->
          <!-- change-on-select:每项都可以选中 -->
          <!-- v-model中selectedKeys绑定的是props设置里value的值（即cat_id) -->

          <el-cascader
            clearable
            v-model="selectedKeys"
            :options="ParentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表,默认为空
      cateList: [],
      // 总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          // 表示将当前列定义为模板列
          type: "template",
          // 表示当前这一列使用的模板名称
          template: "isOk"
        },
        {
          label: "排序",
          // 表示将当前列定义为模板列
          type: "template",
          // 表示当前这一列使用的模板名称
          template: "order"
        },
        {
          label: "操作",
          // 表示将当前列定义为模板列
          type: "template",
          // 表示当前这一列使用的模板名称
          template: "opt"
        }
      ],
      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,

      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加分类的名称
        cat_name: "",
        // 父级分类的id
        cat_pid: 0,
        // 分类的层级 不能为空，`0`表示一级分类；`1`表示二级分类；`2`表示三级分类
        cat_level: 0
      },

      // 添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" }
        ]
      },

      // 父级分类数据列表
      ParentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        checkStrictly: true,
        expandTrigger: "hover"
      },
      // 选中的父级分类的id数组
      selectedKeys: []
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    //获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类列表失败");
      }
      //   console.log(res);
      // 把数据赋值给cateList
      this.cateList = res.data.result;
      // 为总数据条数赋值
      this.total = res.data.total;
    },
    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      //更新数据
      this.getCateList();
    },
    //监听pagenum改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      //更新数据
      this.getCateList();
    },
    // 点击添加分类按钮 显示对话框
    showAddCateDialog() {
      // 先获取父级分类的数据列表
      this.getParentCateList();
      this.addCateDialogVisible = true;
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 }
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类列表失败！");
      }
      // console.log(res.data);
      this.ParentCateList = res.data;
    },
    // 监听选择项发生变化事件
    parentCateChanged() {
      console.log(this.selectedKeys);
      // 如果selectedKeys数组中的length大于0，证明选中了父级分类
      // 反之，就没有选中任 何父级分类
      if (this.selectedKeys.length > 0) {
        //父级分类id,selectedKeys数组中最后一个数据即父级分类id
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ];
        //为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length;
        return;
      } else {
        // 如果等于0
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },

    // 点击确定按钮，添加新的分类
    addCate() {
      //表单信息验证
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) {
          //验证失败
          return;
        }
        //验证成功，发送post请求
        const { data: res } = await this.$http.post(
          "categories",
          this.addCateForm
        );
        if (res.meta.status !== 201) {
          return this.$message.error("添加分类失败！");
        }
        this.$message.success("添加分类成功！");
        //刷新列表，并隐藏对话框
        this.getCateList();
        this.addCateDialogVisible = false;
      });
    },

    // 监听对话框的关闭事件，重置表单数据
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = [];
      // 重置父级分类
      this.addCateForm.cat_pid = 0;
      this.addCateForm.cat_level = 0;
    }
  }
};
</script>
<style lang="less" scoped>
.el-cascader {
  width: 100%;
}

.treeTable {
  margin-top: 15px;
}
</style>