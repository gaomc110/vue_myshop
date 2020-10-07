import axios from 'axios'
// 导入 NProgress 对应的js和css 用于添加精度条的
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import Vue from 'vue'
const vm = new Vue()
let loading // loading

// 判断配置是生产环境和测试环境
let baseUrl = '' // 这里是一个默认的url，可以没有
switch (process.env.NODE_ENV) {
  case 'development':
    baseUrl = 'http://119.23.53.78:8888/api/private/v1/' // 这里是本地的请求url
    break
  case 'production':
    baseUrl = 'http://119.23.53.78:8888/api/private/v1/' // 生产环境url
    break
}
// 设置全局请求根路径
axios.defaults.baseURL = baseUrl
// 创建一个axios实力
const service = axios.create({
  // 请求超时时间
  timeout: 5000
})
// 在request 拦截器中，展示进度条 NProgress.start()
// 通过axios请求拦截器添加token ，保证拥有获取数据的权限
// 添加请求拦截器
service.interceptors.request.use(
  config => {
    NProgress.start()
    startLoading() // 等待效果
    // 为请求对象，添加爱token验证Authorization字符
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config
  },
  err => {
    return Promise.reject(err)
  }
)
// 在response 拦截器中隐藏进度条 NProgress.done()
service.interceptors.response.use(
  response => {
    NProgress.done()
    const res = {}
    res.status = response.status
    res.data = response.data
    if (res.status === 200) {
      endLoading()
    }
    return res
  },
  err => {
    endLoading() // 失败关闭等待加载
    return Promise.reject(err)
  }
)

function startLoading() {
  const options = {
    lock: true,
    fullScreen: true,
    text: '正在加载中,请稍等......',
    background: 'rgba(0, 0, 0, .4)'
  }
  loading = vm.$loading(options)
}

function endLoading() {
  loading && loading.close()
}

export default service
