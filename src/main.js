import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
/**导入字体图标 */
import './assets/fonts/iconfont.css'
// 导入全局样式表
import './assets/css/global.css'

import axios from 'axios'
Vue.prototype.$http = axios
// 设置全局请求根路径
axios.defaults.baseURL = 'http://119.23.53.78:8888/api/private/v1/' //案例路径
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
