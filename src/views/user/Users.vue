<template>
<div>
  <!--面包屑-->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>用户管理</el-breadcrumb-item>
    <el-breadcrumb-item>活动列表</el-breadcrumb-item>
  </el-breadcrumb>
  <!--卡片视图区-->
  <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <!--搜索区域-->
          <el-input placeholder="请输入内容" size="mini" clearable v-model="queryInfo.query" @clear="getUserList">
            <el-button slot="append" size="mini" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" size="mini" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!--用户列表区域-->
      <el-table :data="userlist" border stripe :height="tableHeight" ref="tableCot">
          <el-table-column label="序号" type="index" show-overflow-tooltip></el-table-column>
          <el-table-column label="姓名" prop="username" show-overflow-tooltip></el-table-column>
          <el-table-column label="邮箱" prop="email" show-overflow-tooltip></el-table-column>
          <el-table-column label="电话" prop="mobile" show-overflow-tooltip></el-table-column>
          <el-table-column label="角色" prop="role_name" show-overflow-tooltip></el-table-column>
          <el-table-column label="状态" show-overflow-tooltip>
            <template slot-scope="scope">
              <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180px" show-overflow-tooltip>
            <template slot-scope="scope">
              <!--修改-->
              <el-button type="primary" @click="showEditDialog(scope.row.id)" v-model="scope.row.id" icon="el-icon-edit" size="mini"></el-button>
              <!--删除-->
              <el-button type="danger" @click="removeUserById(scope.row.id)" icon="el-icon-delete" size="mini"></el-button>
              <!--分配角色按钮-->
              <el-tooltip effect="dark" content="配角色" placement="top" :enterable="false">
                <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
      </el-table>
      <!--分页-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
  </el-card>
  <!--添加用户对话框-->
  <el-dialog
    title="提示"
    :visible.sync="addDialogVisible"
    width="50%"
    @close="addDialogClosed">
    <!--内容区域-->
    <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
    </el-form>
    <!--底部-->
    <span slot="footer" class="dialog-footer">
      <el-button @click="addDialogVisible = false" size="mini">取 消</el-button>
      <el-button type="primary" @click="addUser" size="mini">确 定</el-button>
    </span>
  </el-dialog>
  <!--修改用户对话框-->
  <el-dialog
    title="提示"
    :visible.sync="editDialogVisible"
    width="50%"
    @close="editDialogClosed">
    <!--内容区域-->
    <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="editForm.username" disabled></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="editForm.email"></el-input>
      </el-form-item>
      <el-form-item label="手机" prop="mobile">
        <el-input v-model="editForm.mobile"></el-input>
      </el-form-item>
    </el-form>
    <!--底部-->
    <span slot="footer" class="dialog-footer">
      <el-button @click="editDialogVisible = false" size="mini">取 消</el-button>
      <el-button type="primary" @click="editUserInfo" size="mini">确 定</el-button>
    </span>
  </el-dialog>
  <!--分配角色对话框-->
  <el-dialog
    title="分配角色"
    :visible.sync="setRoleDialogVisible"
    width="50%"
    @close="setRoleDialogClosed">
    <div>
      <p>当前的用户: {{userInfo.username}}</p>
      <p>当前的角色：{{userInfo.role_name}}</p>
      <p>分配新角色：
        <el-select v-model="selectedRoleId" placeholder="请选择">
          <el-option v-for="item in rolesList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"></el-option>
        </el-select>
      </p>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="setRoleDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
    </span>
  </el-dialog>
</div>
</template>

<script>
import rules from '../../api/rules.js'
export default {
  data() {
    // 验证邮箱规则
    /** var checkEmail =(rule,value,cb) => {
             const regEmail = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/
             if(regEmail.test(value)){
                 //合法的邮箱
                 return cb()
             }
             cb(new Error('请输入合法的邮箱'))
         }
         //验证手机号规则
         var checkMobile=(rule,value,cb) => {
             const regMobile = /^1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{8}$/
             if(regMobile.test(value)){
                 //合法的邮箱
                 return cb()
             }
             cb(new Error('请输入合法的手机号'))

         } */

    return {
      tableHeight: 250,
      // 获取用户参数对象
      queryInfo: {
        query: '',
        pagenum: 1, // 当前页数
        pagesize: 2 // 当前每页显示条数
      },
      userlist: [],
      total: 0,
      // 控制添加用户对话框显示与隐藏
      addDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加表单验证规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 ~ 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 ~ 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: rules.validateEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: rules.validatePhone, trigger: 'blur' }
        ]
      },
      // 控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      // 查询到的用户信息对象
      editForm: {},
      // 修改表单验证规则对象
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: rules.validateEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: rules.validatePhone, trigger: 'blur' }
        ]
      },
      // 控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      userInfo: {}, // 存放需要被分配角色的用户信息
      rolesList: [], // 所有角色的数据列表
      selectedRoleId: '' // 已选中的角色Id值
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表信息失败！')
      }
      this.userlist = res.data.users
      this.total = res.data.total
      // console.log(res)
    },
    // 监听pagesize 改变事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList() // 根据新新条数加载数据
    },
    // 监听 页码 改变事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听switch 切换事件
    async userStateChanged(userinfo) {
      const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败!')
      }
      this.$message.success('更新用户状态成功')
    },
    // 监听添加用户对话框的关闭事件 //重置表单
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮，添加用户
    addUser() {
      // 预验证
      this.$refs.addFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return
        // 发起添加用户请求
        const { data: res } = await this.$http.post('/users', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败！')
        }
        this.$message.success('添加用户成功！')
        // 隐藏添加用户对话框
        this.addDialogVisible = false
        // 重新获取用户列表数据
        this.getUserList()
      })
    },
    // 展示(显示)编辑用户对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 监听修改用户对话框的关闭事件 //重置表单
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户并提交
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 发起修改用户信息的请求
        const { data: res } = await this.$http.put('users/' + this.editForm.id, { email: this.editForm.email, mobile: this.editForm.mobile })
        if (res.meta.status !== 200) {
          return this.$message.error('修改用户信息失败！')
        }
        // 关闭修改弹出对话框
        this.editDialogVisible = false
        // 重新加载列表数据
        this.getUserList()
        // 提示更新成功
        this.$message.success('更新用户信息成功')
      })
    },
    // 根据id删除对应用户的信息
    async removeUserById(id) {
      // 弹出询问框
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => {
        return err
      })

      // 如果用户确认删除，则返回值为字符串 confirm
      // console.log(confirmResult)
      // 如果用户取消了删除，则返回字符串为cancel
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除！')
      }

      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        this.$message.error('删除用户失败')
      }
      this.$message.success('删除用户成功')
      // 刷新列表
      this.getUserList()
    },
    // 展示分配角色的对话框
    async setRole(userInfo) {
      // 获取并存放当前选中的用户信息
      this.userInfo = userInfo
      // 在展示对话框之前，获取所有角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
      this.setRoleDialogVisible = true
    },
    // 点击按钮分配新的角色
    async saveRoleInfo() {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色！')
      }
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectedRoleId })
      if (res.meta.status !== 200) {
        return this.$message.error('更新角色失败')
      }
      this.$message.success('更新角色成功')
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    // 监听分配角色对话的关闭事件，重置内容
    setRoleDialogClosed() {
      this.selectedRoleId = ''
      this.userInfo = {}
    }
  },
  mounted() {
    this.$nextTick(function () {
      this.tableHeight = window.innerHeight - this.$refs.tableCot.$el.offsetTop - 80
      // 监听窗口大小变化
      let self = this
      window.onresize = function() {
        self.tableHeight = window.innerHeight - self.$refs.tableCot.$el.offsetTop - 80
      }
    })
  }
}
</script>

<style lang="scss">
.el-table td, .el-table th {
  padding: 5px 0;
}
</style>
