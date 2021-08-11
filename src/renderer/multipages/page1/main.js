import Vue from 'vue'
import axios from 'axios'
import { Button, Icon, Menu, Tooltip, message, Drawer, Tag, Input, Pagination, Select, Progress, Modal, Spin, Upload } from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import Viewer from 'v-viewer'
import 'viewerjs/dist/viewer.css'


import App from './App'
import router from './router'
import store from '../../store'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))

// 配置请求头信息
axios.defaults.withCredentials=true

Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.use(Button)
Vue.use(Icon)
Vue.use(Menu)
Vue.use(Tooltip)
Vue.use(Drawer)
Vue.use(Tag)
Vue.use(Input)
Vue.use(Pagination)
Vue.use(Select)
Vue.use(Progress)
Vue.use(Modal)
Vue.use(Spin)
Vue.use(Upload)

Vue.prototype.$message = message

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
