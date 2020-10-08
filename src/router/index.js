import Vue from 'vue'
import VueRouter from 'vue-router'

// 懒加载方式引入
const Login = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../views/Login.vue')
// import Home from '../views/Home.vue'
const Home = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../views/Home.vue')
// import Welcome from '../views/Welcome.vue'
const Welcome = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../views/Welcome.vue')

// import Users from '../views/user/Users.vue'
const Users = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../views/user/Users.vue')
const Rpoerts = () => import(/* webpackChunkName: "Order_Rpoerts" */ '../views/report/Report.vue')
const Rights = () => import(/* webpackChunkName: "Order_Rights" */ '../views/power/Rights.vue')
const Roles = () => import(/* webpackChunkName: "Order_Roles" */ '../views/power/Roles.vue')
const Cate = () => import(/* webpackChunkName: "Order_Cate" */ '../views/goods/Cate.vue')

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
      { path: '/reports', component: Rpoerts },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate }
    ]
  }
]

const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示放行
  // next() 放行 next('/login') 强制跳转

  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  // 没有token强制跳转到登录叶
  if (!tokenStr) return next('/login')
  // 有正常走
  next()
})

export default router
