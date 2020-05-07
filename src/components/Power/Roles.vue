<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!--添加角色按钮-->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible=true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列区域 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- 如果是第一行，则上方有边框 -->
            <el-row
              :class="['bdbottom',i1 === 0 ?'dbtop':'','vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 一行分为24列 -->
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>

              <!-- 渲染二级、三级权限 -->
              <el-col :span="19">
                <!-- for循环嵌套，渲染二级权限 -->
                <el-row
                  :class="[i2 === 0? '':'dbtop','vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <!-- 二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3, i3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!--索引列-->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column width="300px" label="操作">
          <template slot-scope="scope">
            <!-- 编辑角色按钮 -->
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
            >编辑</el-button>
            <!-- 删除角色按钮 -->
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeRolesById(scope.row.id)"
            >删除</el-button>
            <!-- 分配权限按钮 -->
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色的对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 对话框内容区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <!-- prop指定校验规则 -->
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!--修改用户的对话框-->
    <el-dialog
      title="修改角色信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!--内容主体区域-->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
        <el-form-item label="角色名称">
          <el-input v-model="editForm.roleName" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!--底部区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRolesInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 显示树形控件 props指定要显示的属性 -->
      <el-tree
        ref="treeRef"
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKyes"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //角色列表数据
      rolesList: [],
      //控制添加角色对话框的显示
      addDialogVisible: false,
      //控制修改角色对话框的显示
      editDialogVisible: false,
      // 添加角色的表单
      addForm: {
        roleName: "",
        roleDesc: ""
      },
      // 编辑角色的表单
      editForm: {},
      //控制分配权限对话框的显示
      setRightDialogVisible: false,
      //所有权限数据
      rightsList: [],
      // 默认选中节点(三级权限)的Id值数组
      defKyes: [],
      //当前即将分配权限的角色id
      roleId: "",
      // 树形控件的属性绑定对象
      treeProps: {
        label: "authName",
        children: "children"
      },
      // 添加表单的验证规则对象
      addFormRules: {
        roleName: [
          { required: true, message: "请输入该角色名称", trigger: "blur" }
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" }
        ]
      },
      // 编辑表单的验证规则对象
      editFormRules: {
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    //获取角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败！");
      }
      this.rolesList = res.data;
      // console.log(this.rolesList);
    },
    //关闭添加角色对话框，重置表单
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    //关闭修改角色对话框，重置表单
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    //点击确认按钮，添加角色
    addRoles() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        //表单验证通过，可以发起添加用户请求
        const { data: res } = await this.$http.post("roles", this.addForm);
        // console.log(res.data);
        if (res.meta.status !== 201) {
          return this.$message.error("添加用户失败");
        }
        this.$message.success("添加用户成功");
        //隐藏对话框
        this.addDialogVisible = false;
        //获取角色列表
        this.getRolesList();
      });
    },
    //显示修改角色的对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get("roles/" + id);
      if (res.meta.status !== 200) {
        return this.$message.err("查询角色信息失败！");
      }
      // console.log(res.data);
      this.editForm = res.data;
      //显示修改角色对话框
      this.editDialogVisible = true;
    },
    //点击确认按钮，修改角色
    editRolesInfo() {
      //表单验证
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        //验证通过，提交修改角色请求
        const { data: res } = await this.$http.put(
          "roles/" + this.editForm.roleId,
          {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("更新角色信息失败！");
        }
        //隐藏修改角色对话框
        this.editDialogVisible = false;
        //刷新角色列表
        this.getRolesList();
        this.$message.success("更新角色信息成功！");
      });
    },
    //点击按钮，弹出删除角色对话框,根据id删除用户信息
    async removeRolesById(id) {
      //弹框询问用户是否删除数据
      const confirmResult = await this.$confirm(
        "此操作将永久删除该角色, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      //如果用户确认删除，则返回值为字符串 confirm
      //如果用户取消删除，则返回值为字符串 cancel
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除");
      }
      const { data: res } = await this.$http.delete("roles/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("删除角色失败！");
      }
      //刷新角色列表
      this.getRolesList();
      this.$message.success("删除角色成功！");
    },
    //根据Id删除对应权限
    async removeRightById(role, rightId) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
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
      if (confirmResult == "confirm") {
        const { data: res } = await this.$http.delete(
          `roles/${role.id}/rights/${rightId}`
        );
        if (res.meta.status !== 200) {
          return this.$message.error("删除权限失败！");
        }
        //删除权限成功
        this.$message.success("删除权限成功！");
        //利用双向数据绑定直接刷新权限列表
        role.children = res.data;
      }
    },
    //展示分配权限对话框
    async showSetRightDialog(role) {
      this.roleId = role.id;
      //获取权限数据
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限数据失败！");
      }
      //获取的权限数据保存到data
      this.rightsList = res.data;
      // console.log(this.rightsList);

      //调用getLeafKeys获取三级权限id
      this.getLeafKeys(role, this.defKyes);

      this.setRightDialogVisible = true;
    },
    // 通过递归的方式，获取角色下所有三级权限的id并保存在defKeys数组中
    getLeafKeys(node, arr) {
      //判断是否为三级权限节点，不包含children，说明已经是三级权限
      if (!node.children) {
        //将三级权限节点id保存到arr数组中
        return arr.push(node.id);
      }
      //循环递归获取三级节点,node.children作为item传入递归函数
      node.children.forEach(item => {
        this.getLeafKeys(item, arr);
      });
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed() {
      this.defKyes = [];
    },
    //点击确认，为角色分配权限
    async allotRights() {
      //将半选与选中的权限id获取
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ];
      //keys数组拼接成字符串，(格式用逗号隔开Id)请求后端接口
      const idStr = keys.join(",");
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("更新权限失败！");
      }
      this.$message.success("更新权限成功！");
      //刷新角色列表
      this.getRolesList();
      //隐藏对话框
      this.setRightDialogVisible = false;
    }
  }
};
</script>

<style lang="less" scoped>
// 展开列区域样式
.el-tag {
  margin: 7px;
}
.dbtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
// 垂直居中样式
.vcenter {
  display: flex;
  align-items: center;
}
</style>