<template>
  <div>
    <!--面包屑-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区-->
    <el-card>
      <!--信息提示-->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <!--步骤条-->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <!--tab栏区域-->
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabClicked" style="height: 280px; overflow-y: scroll;">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
               <el-input v-model="addForm.goods_name" size="mini"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_pirce">
               <el-input v-model="addForm.goods_pirce" type="number" size="mini"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
               <el-input v-model="addForm.goods_weight" type="number" size="mini"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
               <el-input v-model="addForm.goods_number" type="number" size="mini"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
              expand-trigger="hover"
              :options="catelist"
              :props="cateProps"
              v-model="addForm.goods_cat"
              @change="handleChange">
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!--复选框组-->
              <el-checkbox-group v-model="item.attr_vals" size="mini">
                <el-checkbox border :label="cd" v-for="(cd, i) in item.attr_vals" :key="i"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">商品属性</el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
            :action="uploadURL"
            :headers="headerObj"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :on-success="handleSuccess"
            list-type="picture">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">商品内容</el-tab-pane>
        </el-tabs>
      </el-form>  
    </el-card>
    <el-dialog
    title="图片预览"
    :visible.sync="previewDialogVisible"
    width="50%">
     <img :src="previewPath" alt="" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeIndex: '0',
      // 添加表单的数据对象
      addForm: {
        goods_name: '',
        goods_pirce: 0,
        goods_weight: 0,
        goods_number: 0,
        // 选择的商品所属的数据
        goods_cat: [],
        // 图片的数组
        pics: []
      },
      addFormRules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_pirce: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
        goods_cat: [{ required: true, message: '请选择商品分类', trigger: 'change' }]
      },
      catelist: [],
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // 动态参数列表数据
      manyTableData: [],
      // 静态属性列表数据
      onlyTableData: [],
      // 上传图片的URL地址
      uploadURL: 'http://119.23.53.78:8888/api/private/v1/upload',
      // 图片上传组件的headers 请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previewPath: '',
      previewDialogVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败')
      }
      this.catelist = res.data
    },
    // 级联选择器选中的变化，触发的函数
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    beforeTabLeave(activeName, oldAactiveName) {
      if (oldAactiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类')
        return false
      }
    },
    async tabClicked() {
      // 证明是动态参数面板
      if (this.activeIndex === '1') {
        console.log(this.addForm.goods_cat)
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败')
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      this.previewPath = file.response.data.url
      this.previewDialogVisible = true
    },
    // 处理移除图片的操作
    handleRemove(file) {
      const filePath = file.response.data.tmp_path
      const i = this.addForm.pics.findIndex(x => {
        x.pic === filePath
      })
      this.addForm.pics.splice(i, 1)
    },
    // 监听图片上传成功的事件
    handleSuccess(response) {
      console.log(response)
      // 1.拼接得到一个图片信息对象
      const picinfo = { pic : response.data.tmp_path }
      // 2.将图片信息对象，push 到pics数组中
      this.addForm.pics.push(picinfo)
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="scss">
.el-checkbox {
  margin: 0 6px 0 0 !important;
}
.previewImg {
  width: 100%;
}
</style>