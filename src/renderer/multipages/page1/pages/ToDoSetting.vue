<template>
  <div class="todo-setting-container">
    <!-- 选择颜色功能区 -->
    <div class="select-background-color">
      <p class="fun-title">修改背景颜色</p>
      <div class="show-selected-color" :style="{backgroundColor: showColor}">
        颜色展示区
      </div>
      <div class="select-btn-area">
        <a-button @click="pick" type="primary">选择颜色</a-button>
      </div>
    </div>
    <!-- 导出todo功能区 -->
    <div class="export-todo">
      <p class="fun-title">导出Todo文件</p>
      <div class="export-area">
        <a-tag color="#108ee9" class="export-tip">可导出的格式为：json</a-tag>
        <a-button type="default" class="export-btn" @click="exportTodo">导出</a-button>
      </div>
    </div>
    <!-- 选择颜色的drawer -->
    <a-drawer
      title="选择颜色"
      placement="right"
      :closable="false"
      :visible="isShowColorPicker"
      @close="onClose">
      <sketch-picker v-model="color" @input="updateColor" v-show="isShowColorPicker"></sketch-picker>
    </a-drawer>
  </div>
</template>

<script>
import { Sketch } from 'vue-color'

const { dialog } = require('electron').remote
const fs = require('fs')
const path = require('path')

export default {
  data () {
    return {
      isShowColorPicker: false,
      color: 'rgba(46, 46, 46, 0.562)',
      showColor: 'rgba(46, 46, 46, 0.562)'
    }
  },
  methods: {
    updateColor (val) {
      console.log(val)
      this.color = val.rgba
      window.todoSettings.bgColor = `rgba(${val.rgba.r}, ${val.rgba.g}, ${val.rgba.b}, ${val.rgba.a})`
      this.showColor = window.todoSettings.bgColor
      console.log(this.showColor);
    },
    pick () {
      this.isShowColorPicker = true
    },
    onClose () {
      this.isShowColorPicker = false
    },
    exportTodo () { // 导出todo事件
      dialog.showSaveDialog({
        title: '输入要保存的文件名',
        buttonLabel: '保存',
        filters: [{ name: 'Custom File Type', extensions: ['json'] }]
      }).then(res => {
        console.log(res)
        fs.readFile(path.join(`${__static}`, './dataDir/todo.json'), (err, data) => { // 从本地读取todo.json文件
          if (err) {console.log(err)}
          console.log(JSON.parse(data))
          fs.writeFile(res.filePath, JSON.stringify(JSON.parse(data),"","\t"), (err2) => {
            if (err2) {
              console.log(err2)
              let messageTip = new window.Notification('文件导出失败', {title: '文件导出失败', body: '导出路径：'+res.filePath})
            }
            let messageTip = new window.Notification('文件已成功导出', {title: '文件已成功导出', body: '导出路径：'+res.filePath})
          })
        })
      })
    }
  },
  created () {
    if (!window.todoSettings) { // 参数不存在时
      window.todoSettings = {} // 为todo设置参数
    }
  },
  components: {
    'sketch-picker': Sketch
  }
}
</script>

<style scoped>
.todo-setting-container {
  /* overflow: auto; */
  /* height: calc(100vh - 30px); */
  width: 100%;
  display: flex;
  flex-direction: column;
}
.select-background-color {
  margin: 10px 0;
}
.show-selected-color {
  width: 100%;
  height: 50px;
  line-height: 50px;
  text-align: center;
  color: #ccc;
}
.select-btn-area {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}
.export-area {
  width: 100%;
  /* height: 40px; */
  /* line-height: 40px; */
  display: flex;
  flex-direction: column;
}
.export-tip {
  width: 210px; 
  font-size: 16px; 
  text-align: center;
  margin-left: 10px;
  padding: 10px;
}
.export-btn {
  width: 100px;
  height: 40px;
  padding: 5px 0;
  margin-top: 20px;
  margin-left: 20px;
}
.fun-title {
  color: rgb(91, 172, 219);
  padding-left: 10px;
  /* font-weight: bold; */
}
</style>