<template>
    <el-container class="home-container">
        <el-header>
            <div>
                <img src="" alt="" />
                <span>管理系统</span>
            </div>
            <el-button type="info" @click="logout">退出</el-button></el-header>
        <el-container>
            <!--侧边栏-->
            <el-aside width="200px">
                <!--侧边栏菜单区域-->
                <el-menu
                    background-color="#333744"
                    text-color="#fff"
                    active-text-color="#409EFF">
                        <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
                            <!--一级菜单区域-->
                            <template slot="title">
                                <i :class="iconsObj[item.id]"></i>
                                <span>{{item.authName}}</span>
                            </template>
                            <!--二级菜单区域-->
                            <el-menu-item :index="subItem.id + ''" v-for="subItem in item.children" :key="subItem.id">
                                <template slot="title">
                                    <i class="el-icon-menu"></i>
                                    <span>{{subItem.authName}}</span>
                                </template>
                            </el-menu-item>
                        </el-submenu>
                    </el-menu>

            </el-aside>
            <el-main>Main</el-main>
        </el-container>
    </el-container>
</template>

<script>
export default {
    data(){
        return {
            // 左边菜单数据
            menulist:[],
            // 自定义菜单图标
            iconsObj:{
                '125':'iconfont icon-renyuan',
                '103':'iconfont icon-qunfengjiaosequanxian',
                '101':'iconfont icon-shangpin',
                '102':'iconfont icon-qitadingdan',
                '145':'iconfont icon-tongji2'
            }
        }
    },
    created() {
        this.getMenuList()
    },
    methods: {
      logout(){
          window.sessionStorage.clear();
          this.$router.push('/login');
      },
      // 获取所有菜单
      async getMenuList(){
          const { data:res } = await this.$http.get('menus')
          if(res.meta.status !==200) return this.$message.error(res.meta.msg)
          this.menulist = res.data
          console.log(this.menulist)
      }
    }
}
</script>

<style lang="less" scoped>
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
}
.el-main{
    background: #eaeaea;
}
</style>