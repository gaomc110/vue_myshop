<template>
<div>
  <!--面包屑-->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>分类参数</el-breadcrumb-item>
  </el-breadcrumb>
  <!--卡片视图区-->
  <el-card>
    <!--警告区域-->
    <el-alert show-icon title="注意:只允许为第三级分类设置相关参数！" type="warning" :closable="false"></el-alert>
    <!--选择商品分类-->
    <el-row class="cat_opt">
      <el-col>
        <span>选择商品分类：</span>
        <!--选择商品级联选择框-->
        <el-cascader size="mini" style="width: auto;"
        v-model="selectedCateKeys"
        :options="catelist"
        :props="cateProps"
        @change="handleCateChange" clearable></el-cascader>
      </el-col>
    </el-row>
    <el-tabs v-model="activeName" @tab-click="handleTabClick">
      <!--添加动态参数的面板-->
      <el-tab-pane label="动态参数" name="many">
        <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
        <el-table :data="manyTableData" border stripe>
          <el-table-column type="expand"></el-table-column>
          <el-table-column type="index"></el-table-column>
          <el-table-column label="参数名称" prop="attr_name"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
              <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <!--添加静态属性的面板-->
      <el-tab-pane label="静态属性" name="only">
        <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
        <el-table :data="onlyTableData" border stripe>
          <el-table-column type="expand"></el-table-column>
          <el-table-column type="index"></el-table-column>
          <el-table-column label="属性名称" prop="attr_name"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
              <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </el-card>
  <!--添加参数的对话框-->
  <el-dialog
    :title="'添加' + titleText"
    :visible.sync="addDialogVisible"
    width="50%"
    @close="addDialogClosed">
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
  <!--修改参数的对话框-->
  <el-dialog
    :title="'修改' + titleText"
    :visible.sync="editDialogVisible"
    width="50%"
    @close="editDialogClosed">
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
</div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表
      catelist: [],
      // 这是级联选择框的配置对象
      cateProps: {
        expandTrigger: 'hover',
        // checkStrictly: true, // 让每一级都可以选择
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择框双向绑定到的数组
      selectedCateKeys: [],
      // tabs被激活器的页签名称
      activeName: 'many',
      // 动态参数的数据
      manyTableData: [],
      // 静态参数的数据
      onlyTableData: [],
      // 控制添加对话框的显示与隐藏
      addDialogVisible: false,
      // 添加参数的表单数据对象
      addForm: {
        attr_name: ''
      },
      // 表单验证规则
      addFormRules: {
        attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
      },
      // ----------编辑内容
      editDialogVisible: false,
      editForm: {
        attr_name: ''
      },
      editFormRules: {
        attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取所有的商品分类列表(连级选择)
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.catelist = res.data
    },
    // 级联选择框选中项变化，会触发这个函数
    handleCateChange() {
      this.getParamsData()
    },
    // tab 页签点击事件
    handleTabClick() {
      this.getParamsData()
    },
    // 获取参数列表table
    async getParamsData() {
      // 判断只能选择三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        return
      }
      // 否则选中的是三级分类
      // console.log(this.selectedCateKeys)
      // 根据所选分类的id,和当前所处的面板，获取对应的
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败')
      }
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 监听添加对话框的关闭事件，重置表单
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮添加操作
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, { attr_name: this.addForm.attr_name, attr_sel: this.activeName })
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }
        this.$message.success('添加参数成功')
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    // 点击编辑按钮,查询赋值表单
    async showEditDialog(attr_id) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`, {
        params: { attr_sel: this.activeName }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数信息失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    editParams() {
       this.$refs.editFormRef.validate(async valid => {
        if(!valid) return
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attribute/${this.editForm.attr_id}`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) {
          return this.$message.error('修改参数失败')
        }
        this.$message.success('修改参数成功')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    removeParams(attr_id) {}
  },
  computed: {
    // 如果按钮需要被禁用，则返回true, 否则返回false
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的三级分类的Id
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 动态计算标题的文本
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="scss">
.cat_opt {
  margin: 15px 0;
}
</style>
