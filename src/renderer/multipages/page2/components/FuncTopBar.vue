<template>
  <div class="top-bar-container">
    <div class="return-button" v-show="isShowReturnButton" @click="goBack">
      <a-tooltip title="返回">
        <a-icon type="arrow-left" />
      </a-tooltip>
    </div>
    <div class="min-button" @click="minFuncWindow">
      <a-icon type="minus" />
    </div>
    <div class="close-button" @click="closeFuncWindow">
      <a-icon type="close" />
    </div>
  </div>
</template>

<script>
const { ipcRenderer, remote } = require('electron')

const currentWindow = remote.BrowserWindow.getAllWindows()[0]

export default {
  data () {
    return {
      isShowReturnButton: false,
      lastRoute: ''
    }
  },
  methods: {
    goBack () {
      this.$router.go(-1)
    },
    minFuncWindow () {
      ipcRenderer.send('minFuncWindow')
    },
    closeFuncWindow () {
      ipcRenderer.send('closeFuncWindow')
    }
  },
  created () {
    console.log(this.$route);
    if (!(this.$route.path == '/')) { // 判断是否在主页
      this.isShowReturnButton = true
    } else {
      this.isShowReturnButton = false
    }

    ipcRenderer.on('switch-theme', (e, value) => { // 响应切换主题
      document.head.querySelector('#skin').setAttribute('href',`${__static}/theme/${value}.css`)
    })

    window.addEventListener('keyup', function (e) { // esc快捷退出窗口
      if (e.code == 'Escape') {
        ipcRenderer.send('funcEsc')
      }
    })
  },
  watch: {
    '$route' (to, from) {
      if (!(to.path == '/')) {
        this.isShowReturnButton = true
      } else {
        this.isShowReturnButton = false
      }
    }
  },
}
</script>

<style scoped>
.top-bar-container {
  height: 40px;
  width: 100%;
  border-bottom: 2px solid var(--border-color);
  -webkit-app-region: drag;
  -webkit-user-select: none;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
}
.min-button, .close-button, .return-button {
  width: 40px;
  text-align: center;
  height: 40px;
  line-height: 40px;
  font-size: 16px;
  color: var(--normal-text-color);
  cursor: pointer;
  -webkit-app-region: no-drag;
  transition: all 0.4s;
}
:is(.min-button, .close-button, .return-button):hover {
  background: var(--func-btn-hover-background-color);
  color: var(--func-hover-btn-color);
}
.return-button {
  position: absolute;
  left: 0;
  top: 0;
}
</style>