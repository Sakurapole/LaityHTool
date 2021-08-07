<template>
  <div id="border-container">
    <div class="app-title">
      LaityHTool
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
    minWindow () {
      ipcRenderer.send('minWindow')
    },
    closeWindow () {
      ipcRenderer.send('closeWindow')
    }
  }
}
</script>

<style scoped>
#border-container {
  height: 30px;
  border-bottom: 1px solid #ccc;
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
  color: #ccc;
}
.min-button, .close-button {
  width: 29px;
  text-align: center;
  height: 29px;
  line-height: 30px;
  font-size: 16px;
  color: #fff;
  cursor: pointer;
  -webkit-app-region: no-drag;
  transition: all 0.4s;
}
.min-button:hover, .close-button:hover {
  background: rgba(248, 246, 246, 0.5);
  color: #000;
}
</style>