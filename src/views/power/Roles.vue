<template>
  <div>
    <!--面包屑-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--视图-->
    <el-card>
      <el-row>
        <el-col :span="24">
          <el-button type="primary" size="mini">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table ref="tableCot" :data="rolesList" border stripe :height="tableHeight">
        <!--展开列-->
        <el-table-column type="expand" align="center">
          <template slot-scope="scope">
            <el-row :class="['bdbottom', index1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, index1) in scope.row.children" :key="item1.id">
              <!--一级权限-->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{ item1.authName }}</el-tag><i class="el-icon-caret-right"></i>
              </el-col>
              <!--二级权限和三级权限-->
              <el-col :span="19">
                <!--通过for遍历出2级和3级-->
                <el-row :class="[index2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, index2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{ item2.authName }}</el-tag><i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                     <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id" closable @close="removeRightById(scope.row, item3.id)">{{ item3.authName }}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!--索引列-->
        <el-table-column type="index" label="序号" align="center"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit" title="编辑"></el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" title="删除"></el-button>
            <el-button type="warning" size="mini" icon="el-icon-setting" title="分配权限" @click="showSetRightDialog(scope.row)"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed">
      <!--树形控件-->
        <el-tree
        ref="treeRef"
        :data="rightslist"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defkeys"></el-tree>
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
      tableHeight: 250,
      rolesList: [], // 所有角色列表数据
      setRightDialogVisible: false, // 控制分配权限对话框的显示与隐藏
      rightslist: [], // 所有权的数据
      treeProps: { // 树形控件属性绑定对象
        children: 'children',
        label: 'authName'
      },
      defkeys: [], // 默认选中的节点Id值数组
      roleId: '' // 当前即将分配权限的角色id 就是点击获取的角色id
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取所有角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      console.log(res.data)
      this.rolesList = res.data
    },
    // 点击tag 后面X触发关闭， 根据id删除对于的权限
    async removeRightById(role, rightId) { // 参数为 1.角色 2.权限id
      // 弹窗提示是否删除
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除')
      }
      // 去删除
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }
      // this.getRolesList()
      // 删除后直接给角色下的权限重新复制，解决了重新加载刷新关闭角色收缩的问题
      role.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      this.roleId = role.id // 存储选中角色id
      // 获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败')
      }
      // 把获取到的权限数据保存到data中
      this.rightslist = res.data
      // 递归获取三级节点的Id
      this.getLeafKeys(role, this.defkeys)
      //
      this.setRightDialogVisible = true
    },
    // 通过递归形式，获取角色下所有三级权限的id，并保存到defkeys数组中
    getLeafKeys(node, arr) {
      if (!node.children) {
        // 如果当前node节点不包含children 属性，则是三级节点
        return arr.push(node.id)
      }
      // 遍历循环自己
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed() {
      this.defkeys = [] // 关闭清空已经选中的
    },
    // 点击为角色分配新的权限
    async allotRights() {
      // 获取新的选中选中的权限(包括半选中)
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      // 刷新权限列表
      this.getRolesList()
      // 关闭分配权限对话框
      this.setRightDialogVisible = false
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
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
