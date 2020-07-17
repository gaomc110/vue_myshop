import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
/**导入字体图标 */
import './assets/fonts/iconfont.css'
// 导入全局样式表
import './assets/css/global.css'

//导入 NProgress 对应的js和css 用于添加精度条的
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import axios from 'axios'
// 设置全局请求根路径
axios.defaults.baseURL = 'http://119.23.53.78:8888/api/private/v1/' //案例路径
// 在request 拦截器中，展示进度条 NProgress.start()
// 通过axios请求拦截器添加token ，保证拥有获取数据的权限
axios.interceptors.request.use(config => {
  NProgress.start()
  //为请求对象，添加爱token验证Authorization字符
  config.headers.Authorization = window.sessionStorage.getItem('token')
  //在最后必须return config
  return config
})
// 在response 拦截器中隐藏进度条 NProgress.done()
axios.interceptors.response.use(config =>{
  NProgress.done()
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
