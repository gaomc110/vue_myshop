<template>
  <div>
    <!--面包屑-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--视图列表-->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="4">
          <el-button type="primary" @click="showDialogAdd(0)" size="mini">添加菜单</el-button>
        </el-col>
      </el-row>
      <el-table
      ref="tableCot"
      :data="rightsList"
      row-key="id"
      :row-style="showTr"
      :height="tableHeight"
      :tree-props="{children: 'children'}" border stripe>
        <el-table-column label="菜单名称" width="200">
          <template slot-scope="scope">{{ scope.row.authName }}</template>
        </el-table-column>
        <el-table-column label="更新于">
          <template>2020-09-29</template>
        </el-table-column>
        <el-table-column label="路径">
          <template slot-scope="scope">{{ scope.row.path }}</template>
        </el-table-column>
        <el-table-column label="上级菜单(编码)">
          <template slot-scope="scope"><el-tag>{{ scope.row.pid===null?'':`${scope.row.pid}` }}</el-tag></template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="scope">
            <!--修改-->
              <el-button type="primary" @click="showEditDialog(scope.row.id)" v-model="scope.row.id" icon="el-icon-edit" size="mini"></el-button>
              <!--删除-->
              <el-button type="danger" @click="removeUserById(scope.row.id)" icon="el-icon-delete" size="mini"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog
    :title="title[titleStatus]"
    v-if="dialogStatus"
    :visible.sync="dialogStatus"
    width="50%"
    center>
      <!--<add-form :btn-type="titleStatus" :menu="menuData" @refresh="refresh"></add-form>-->
      添加用户
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'tree-grid',
  data() {
    return {
      tableHeight: 250,
      rightsList: [], // 列表数据
      dialogStatus: false,
      title: ['新增菜单', '修改菜单'],
      titleStatus: 0
    }
  },
  created() {
    this.getRightsList()
  },
  methods: {
    async getRightsList() {
      const { data: res } = await this.$http.get('rights/tree') // rights/list 不是树格式的数据
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败！')
      }
      console.log(res.data)
      this.rightsList = res.data
    },
    // 显示行
    showTr(row, index) {
      const show = (row.row._parent ? (row.row._parent._expanded && row.row._parent._show) : true)
      row.row._show = show
      return show ? '' : 'display:none;'
    },
    showDialogAdd(status, row) {
      this.dialogStatus = true
      this.titleStatus = status
      if (row) {
        console.log(row)
        // this.id = row.id
      }
    }
  },
  mounted() {
    this.$nextTick(function () {
      this.tableHeight = window.innerHeight - this.$refs.tableCot.$el.offsetTop - 40
      // 监听窗口大小变化
      let self = this
      window.onresize = function() {
        self.tableHeight = window.innerHeight - self.$refs.tableCot.$el.offsetTop - 40
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
