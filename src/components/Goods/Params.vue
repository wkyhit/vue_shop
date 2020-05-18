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
      <!-- 头部警告区 -->
      <el-alert :closable="false" title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon></el-alert>

      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类级联框 -->
          <!-- options用来指定数据源 -->
          <!-- props用来指定配置对象 -->
          <el-cascader
            clearable
            expandTrigger="hover"
            v-model="selectedCatKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab 页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数的按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i,scope.row)"
                >{{item}}</el-tag>

                <!-- 输入tag标签的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
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
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  inon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="primary"
                  inon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性的按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i,scope.row)"
                >{{item}}</el-tag>

                <!-- 输入tag标签的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
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
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  inon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="primary"
                  inon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <!-- 添加参数的对话框 -->
      <el-dialog
        @close="addDialogClosed"
        :title=" '添加' +titleText "
        :visible.sync="addDialogVisible"
        width="50%"
      >
        <!-- 添加参数的表单 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 编辑参数的对话框 -->
      <el-dialog
        @close="editDialogClosed"
        :title=" '修改' +titleText "
        :visible.sync="editDialogVisible"
        width="50%"
      >
        <!-- 添加参数的表单 -->
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editParams">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //商品分类列表
      cateList: [],
      // 级联选择框的对象
      cateProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },
      // 级联选择框双向绑定的数组
      selectedCatKeys: [],
      // 被激活的页签名称
      activeName: "many",
      //动态参数数据
      manyTableData: [],
      //静态属性数据
      onlyTableData: [],
      // 控制添加对话框的显示与隐藏
      addDialogVisible: false,
      // 添加参数的表单数据对象
      addForm: {
        attr_name: ""
      },
      // 添加表单的验证规则对象
      addFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" }
        ]
      },
      // 控制修改对话框的展示与隐藏
      editDialogVisible: false,
      // 修改的表单数据对象
      editForm: {
        attr_name: ""
      },
      // 修改表单的验证规则对象
      editFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" }
        ]
      }
    };
  },
  computed: {
    // 如果按钮需要被禁用，则返回true，否则返回false
    isBtnDisabled() {
      //判断级联选择器是否选择第三级项
      return this.selectedCatKeys.length !== 3;
    },
    // 当前选中三级分类的id
    cateId() {
      if (this.selectedCatKeys.length == 3) return this.selectedCatKeys[2];
      return null;
    },
    // 动态计算标题的文本
    titleText() {
      if (this.activeName == "many") {
        return "动态参数";
      } else {
        return "静态属性";
      }
    }
  },
  created() {
    this.getCateList();
  },
  methods: {
    //获取所有商品分类列表
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败！");
      }
      this.cateList = res.data;
      //   console.log(res);
    },
    // 监听级联选择框选项发生变化的事件
    handleChange() {
      // 获取参数列表数据
      this.getParamsData();
      //   console.log(this.selectedCatKeys);
    },
    // 监听Tab页签点击事件
    handleClick() {
      // 获取参数列表数据
      this.getParamsData();
      //   console.log(this.activeName);
    },
    //获取参数列表数据
    async getParamsData() {
      //如果选中的不是3级分类
      if (this.selectedCatKeys.length !== 3) {
        this.selectedCatKeys = [];
        this.manyTableData = [];
        this.onlyTableData = [];
        return;
      }
      //选中的是3级分类,根据所选分类的id和当前所处面板参数，获取数据请求
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      );

      if (res.meta.status !== 200) {
        return this.$message.error("获取参数列表失败！");
      }

      // 将attr_vals进行分割(,号分割) 获得标签
      // ps:后面改进用三元表达式 解决attr_vals为空的情况
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals
          ? (item.attr_vals || "").split(",")
          : [];
        //要保证每一个参数的tag都是独立的
        // 控制tag文本框的显示与隐藏
        item.inputVisible = false;
        // tag文本框中输入的值
        item.inputValue = "";
      });

      //判断数据是动态参数还是静态属性，并挂载到相应表格上
      if (this.activeName === "many") {
        this.manyTableData = res.data;
        // console.log(this.manyTableData);
      } else {
        this.onlyTableData = res.data;
        // console.log(this.onlyTableData);
      }
    },
    //监听添加参数对话框关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    //点击确认按钮，添加分类参数
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        //根据分类id，分类名字、以及参数类型（即选择的标签页类型）提交post请求
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            //参数类型
            attr_sel: this.activeName
          }
        );
        if (res.meta.status !== 201) {
          return this.$message.error("添加参数列表失败！");
        }
        // 添加成功就关闭对话框并重新刷新列表数据
        this.$message.success("添加参数成功!");
        this.addDialogVisible = false;
        this.getParamsData();
      });
    },
    // 点击编辑按钮，展示修改对话框
    async showEditDialog(attr_id) {
      // 查询当前参数的信息,根据分类id,参数id，参数类型（标签页名称）
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        {
          params: { attr_sel: this.activeName }
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("获取参数列表失败！");
      }
      this.editForm = res.data;
      //显示对话框
      this.editDialogVisible = true;
    },
    //监听编辑参数对话关闭事件，重置表单
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    //点击确认，进行参数信息修改
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        //根据分类id、参数id,参数名字、参数类型
        const {
          data: res
        } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          { attr_name: this.editForm.attr_name, attr_sel: this.activeName }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("修改参数列表失败！");
        }
        // 修改成功就关闭对话框并重新刷新列表数据
        this.$message.success("修改参数成功!");
        this.editDialogVisible = false;
        this.getParamsData();
      });
    },
    //根据Id删除相应的参数项
    async removeParams(attr_id) {
      //弹框询问是否删除
      const confirmResult = await this.$confirm(
        "此操作将永久删除该参数, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(() => {
        this.$message({
          type: "info",
          message: "已取消删除"
        });
      });
      //如果用户确认删除，返回值为字符串：confirm
      //取消删除，返回字符串cancel
      if (confirmResult === "confirm") {
        const { data: res } = await this.$http.delete(
          `categories/${this.cateId}/attributes/${attr_id}`
        );
        if (res.meta.status !== 200) {
          return this.$message.error("删除参数失败！");
        }
        // 删除成功就关闭对话框并重新刷新列表数据
        this.$message.success("删除参数成功!");
        this.getParamsData();
      }
    },
    //tag文本框失去焦点或按下enter触发事件
    handleInputConfirm(row) {
      //如果文本框输入内容为空
      //进行去除空格处理
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ""; //清空输入
        row.inputVisible = false; //隐藏文本输入框
        return;
      }
      // 如果没有return,则证明输入的内容，需要做后续的处理
      //将输入内容保存到attr_vals中
      row.attr_vals.push(row.inputValue.trim());
      //清空输入
      row.inputValue = "";
      //隐藏输入框
      row.inputVisible = false;
      // 将对attr_vals的操作，保存到数据库
      this.saveAttrVals(row);
    },
    //显示tag文本框
    showInput(row) {
      row.inputVisible = true;
      // 让文本框自动获得焦点
      // $nextTick 方法: 当页面上元素被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus(); //js原生方法focus
      });
    },
    // 将对attr_vals的操作，保存到数据库
    async saveAttrVals(row) {
      // 需要发起请求，保存数组数据
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(",")
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("修改参数列表失败！");
      }
      // 修改成功就关闭对话框并重新刷新列表数据
      this.$message.success("修改参数成功!");
    },
    // 删除对应的tag标签
    handleClose(i, row) {
      row.attr_vals.splice(i, 1); //splice是对原数组进行操作
      this.saveAttrVals(row);
    }
  }
};
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 100px;
}
</style>