<template>
    <el-container class="home-container">
        <el-header>
            <div>
              <img src="" alt="" />
              <span>管理系统</span>
            </div>
            <el-button type="info" @click="logout" size="mini">退出</el-button></el-header>
        <el-container>
            <!--侧边栏-->
            <el-aside :width="isCollapse ? '64px':'200px'">
                <div class="toggle-button" @click="toggleCollapse">|||</div>
                <!--侧边栏菜单区域-->
                <el-menu
                    background-color="#333744"
                    text-color="#fff"
                    active-text-color="#409EFF"
                    unique-opened
                    :collapse="isCollapse"
                    :collapse-transition="false"
                    router
                    :default-active="activePath">
                        <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
                            <!--一级菜单区域-->
                            <template slot="title">
                                <i :class="iconsObj[item.id]"></i>
                                <span>{{item.authName}}</span>
                            </template>
                            <!--二级菜单区域-->
                            <el-menu-item :index="'/' + subItem.path" @click="saveNavState('/' + subItem.path)" v-for="subItem in item.children" :key="subItem.id">
                                <template slot="title">
                                    <i class="el-icon-menu"></i>
                                    <span>{{subItem.authName}}</span>
                                </template>
                            </el-menu-item>
                        </el-submenu>
                    </el-menu>

            </el-aside>
            <el-main>
                <!--路由占位符-->
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左边菜单数据
      menulist: [],
      // 自定义菜单图标
      iconsObj: {
        125: 'iconfont icon-renyuan',
        103: 'iconfont icon-qunfengjiaosequanxian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-qitadingdan',
        145: 'iconfont icon-tongji2'
      },
      isCollapse: false,
      activePath: ''
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取所有菜单
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
      // console.log(this.menulist)
    },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="scss" scoped>
.home-container{
    height: 100%;
}
.el-header{
    background: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #fff;
    font-size: 20px;
    > div{
        display: flex;
        align-items: center;
        span{
            margin-left: 15px;
        }
    }
}
.el-aside{
    background: #333744;
    .el-menu{
        border-right: 0 none;
    }
}
.el-main{
    background: #eaeaea;
    height: 100%;
}
.iconfont{
    margin-right: 10px;
}
.toggle-button{
    background: #4a5064;
     font-size: 10px;
     line-height: 24px;
     color: #fff;
     text-align: center;
     letter-spacing: 0.2em;
}
</style>
