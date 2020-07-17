import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from '../components/Login.vue'
// 懒加载方式引入
const Login = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/Login.vue')
//import Home from '../components/Home.vue'
const Home = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/Home.vue')
//import Welcome from '../components/Welcome.vue'
const Welcome = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/Welcome.vue')

//import Users from '../components/user/Users.vue'
const Users = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/user/Users.vue')

//import Rpoerts from '../components/report/Report.vue'
const Rpoerts = () => import(/* webpackChunkName: "Order_Rpoerts" */ '../components/report/Report.vue')

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/reports', component: Rpoerts }
    ]
  }
  
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  //to 将要访问的路径
  //from 代表从哪个路径跳转而来
  //next 是一个函数，表示放行
  // next() 放行 next('/login') 强制跳转

  if(to.path === '/login') return next();
  //获取token
  const tokenStr =window.sessionStorage.getItem('token')
  //没有token强制跳转到登录叶
  if(!tokenStr) return next('/login')
  //有正常走
  next()
})

export default router
