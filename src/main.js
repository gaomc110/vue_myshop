import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// import './plugins/element.js'
/** 导入字体图标 */
import './assets/fonts/iconfont.css'
// 导入全局样式表
import './assets/css/global.css'
// element布局
import ElementUI from 'element-ui'
// tree-table
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 富文本编辑器的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
// 请求
import http from './api/config'
// 全局过滤器
import filters from './filters'
Object.keys(filters).forEach(k => Vue.filter(k, filters[k]))
Vue.use(ElementUI)
Vue.prototype.$http = http
Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)
Vue.use(VueQuillEditor)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
