import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 引入全局样式
import './assets/css/global.css'
// 引入字体图标
import './assets/fonts/iconfont.css'
//导入table tree grid插件
import TreeTable from "vue-table-with-tree-grid"

import axios from 'axios'

axios.defaults.baseURL = "http://timemeetyou.com:8889/api/private/v1/"
// axios请求拦截器
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem("token");
  return config;//完成axios请求预处理，返回config
})
Vue.prototype.$http = axios

//注册全局组件
Vue.component('tree-table', TreeTable);
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
