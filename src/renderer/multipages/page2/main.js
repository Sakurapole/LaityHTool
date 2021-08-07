import Vue from 'vue'
import axios from 'axios'
import { Button, Icon, Menu, Tooltip, message } from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'

import App from './App'
import router from './router'
import store from '../../store'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.use(Button)
Vue.use(Icon)
Vue.use(Menu)
Vue.use(Tooltip)

Vue.prototype.$message = message

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
