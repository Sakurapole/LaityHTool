import Vue from 'vue'
import axios from 'axios'
import { Dropdown, Checkbox, Button, Icon, Menu, Tooltip, message, Drawer, Tag, Input, Pagination, Select, Progress, Modal, Spin, Upload } from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import animate from 'animate.css'


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
Vue.use(Checkbox)
Vue.use(Dropdown)

Vue.prototype.$message = message

Vue.use(animate)
// Vue.use(Viewer)

// Viewer.setDefaults({
//   zIndex: 9999,
//   'inline':false,
//   'button':true, //右上角按钮
//   "navbar": true, //底部缩略图
//   "title": true, //当前图片标题
//   "toolbar": true, //底部工具栏
//   "tooltip": true, //显示缩放百分比
//   "movable": true, //是否可以移动
//   "zoomable": true, //是否可以缩放
//   "rotatable": true, //是否可旋转
//   "scalable": true, //是否可翻转
//   "transition": true, //使用 CSS3 过度
//   "fullscreen": true, //播放时是否全屏
//   "keyboard": true, //是否支持键盘
//   "url": "data-source"
// })

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
