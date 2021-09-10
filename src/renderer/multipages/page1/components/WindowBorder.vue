<template>
  <div id="border-container">
    <div class="app-title">
      LaityHTool
    </div>
    <div class="all-func-button" @click="openFuncWindow">
      功能窗口
    </div>
    <div class="switch-theme">
      <!-- <a-switch class="switch-theme-button" @change="switchTheme" default-checked></a-switch> -->
      <a-select default-value="night" style="width: 120px;" @change="switchTheme">
        <a-select-option value="night">
          黑夜主题
        </a-select-option>
        <a-select-option value="day">
          白天主题
        </a-select-option>
      </a-select>
    </div>
    <div class="min-button" @click="minWindow">
      <a-icon type="minus" />
    </div>
    <div class="close-button" @click="closeWindow">
      <a-icon type="close" />
    </div>
  </div>
</template>

<script>
const { ipcRenderer } = require("electron")
export default {
  data () {
    return {
    }
  },
  methods: {
    switchTheme (value) { // 切换主题
      console.log(value)
      ipcRenderer.send('switch-theme', value)
      document.head.querySelector('#skin').setAttribute('href',`${__static}/theme/${value}.css`)
    },
    minWindow () {
      ipcRenderer.send('minWindow')
    },
    closeWindow () {
      ipcRenderer.send('closeWindow')
    },
    openFuncWindow () { // 打开功能窗口
      ipcRenderer.send('openFuncWindow')
    }
  }
}
</script>

<style scoped>
#border-container {
  height: 30px;
  /* border-bottom: 1px solid #ccc; */
  padding-bottom: 1px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  -webkit-app-region: drag;
  -webkit-user-select: none;
}
.app-title {
  height: 30px;
  line-height: 30px;
  position: absolute;
  left: 5px;
  text-align: center;
  font-size: 16px;
  color: var(--normal-text-color);
}
.all-func-button {
  height: 30px;
  line-height: 30px;
  padding: 0 10px;
  margin-right: 20px;
  color: var(--normal-text-color);
  /* border: 1px solid var(--normal-text-color); */
  background-color: var(--self-define-btn-background-color);
  cursor: pointer;
  -webkit-app-region: no-drag;
  border-radius: 5px;
  transition: all .4s;
}
.all-func-button:hover {
  border-bottom: 15px solid rgb(95, 144, 235);
}
.switch-theme {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
  -webkit-app-region: no-drag;
}
.min-button, .close-button {
  width: 29px;
  text-align: center;
  height: 29px;
  line-height: 30px;
  font-size: 16px;
  color: var(--normal-text-color);
  cursor: pointer;
  -webkit-app-region: no-drag;
  transition: all 0.4s;
}
.min-button:hover, .close-button:hover {
  background: var(--func-btn-hover-background-color);
  color: var(--func-hover-btn-color);
}
</style>