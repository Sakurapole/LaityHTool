<template>
  <div class="todo-container">
    <div class="todo-list">
      <div class="switch-todo-list">
        <div @click="switchTodo(1)" :class="{'will-list-btn': true, 'switch-btn-selected': isSelected}">
          待办项
        </div>
        <div @click="switchTodo(0)" :class="{'done-list-btn': true, 'switch-btn-selected': !isSelected}">
          已完成
        </div>
      </div>
      <div class="todo-item" v-for="(item, index) in todoList" :key="index">
        <div class="todo-title">
          <a-tooltip :title="item.title">
            {{ item.title }}
          </a-tooltip>
        </div>
        <div class="start-time">{{ item.time }}</div>
        <div class="condition-status" :class="judgeTodoStatus(item.conditionStatus)">{{ item.conditionStatus }}</div>
        <div class="func-btns" v-show="isShowFuncBtns(item)">
          <a-tooltip title="完成">
            <a-icon type="check" class="finish-btn" @click="finishItem(index)" />
          </a-tooltip>
          <a-tooltip title="删除">
            <a-icon type="close" class="delete-btn" @click="deleteItem(index)" />
          </a-tooltip>
        </div>
      </div>
      <div class="add-area" v-show="isSelected">
        <input type="text" v-model="inputTitle" placeholder="输入内容">
        <input type="text" v-model="inputTime" placeholder="输入起始时间">
        <input type="text" v-model="inputStatus" placeholder="状态">
        <button @click="addItem">添加</button>
      </div>
    </div>
    <div class="todo-btns">
      <a-tooltip title="上传Todo到服务器">
        <div class="upload-btn" @click="uploadTodo">
          <a-icon type="upload" />
        </div>
      </a-tooltip>
      <a-tooltip title="从服务器同步Todo到本地">
        <div class="download-btn" @click="downloadTodo">
          <a-icon type="download" />
        </div>
      </a-tooltip>
      <a-tooltip title="重新从文件读取">
        <div class="reload-btn" @click="reloadTodo">
          <a-icon type="reload" />
        </div>
      </a-tooltip>
      <a-tooltip title="开启桌面Todo模式">
        <div class="start-btn" @click="startTodo">
          <a-icon type="play-circle" />
        </div>
      </a-tooltip>
    </div>
  </div>
</template>

<script>
const fs = require("fs")
const path = require("path")
const { ipcRenderer } = require("electron")

export default {
  data () {
    return {
      allData: {}, // 包括所有Todo信息，包含待办和已完成
      todoList: [], // 待办列表
      // hasDoneList: [], // 已完成列表
      isSelected: true, // 是否选中
      inputTitle: '', // 新增的标题
      inputTime: '', // 新增的时间
      inputStatus: '', // 新增的状态
    }
  },
  methods: {
    readLocalToDo () {
      fs.readFile(path.join(`${__static}`, './dataDir/todo.json'), (err, data) => { // 从本地读取todo.json文件
        if (err) {console.log(err)}
        console.log(JSON.parse(data))
        this.todoList = JSON.parse(data).data.will
        // this.hasDoneList = JSON.parse(data).data.hasDone
        this.allData = JSON.parse(data)
      })
    },
    uploadTodo () { // 上传本地Todo到服务器

    },
    downloadTodo () { // 从服务器同步Todo

    },
    reloadTodo () { // 重新从文件读取
      this.readLocalToDo()
    },
    startTodo () { // 开启桌面Todo窗口
      ipcRenderer.send('startTodo', JSON.stringify(window.todoSettings))
      console.log(window.todoSettings)
    },
    switchTodo (flag) {
      if (flag) {
        // 待办
        this.isSelected = true
        this.todoList = this.allData.data.will
      } else {
        // 已完成
        this.isSelected = false
        this.todoList = this.allData.data.hasDone
      }
    },
    judgeTodoStatus (status) {
      if (status == '紧急') {
        return 'urgent'
      } else if (status == '当日') {
        return 'day-plan'
      } else if (status == '本周') {
        return 'week-plan'
      } else if (status == '不急') {
        return 'no-urgent'
      }
    },
    finishItem (index) { // 完成一个计划
      this.todoList[index].done = true // 将元素标记为已完成
      this.allData.data.hasDone.push(this.todoList[index]) // 加入到已完成列表中
      this.allData.data.will.splice(index, 1) // 删除指定元素
      this.todoList = this.allData.data.will // 更新展示Todo
      // 写入文件中
      fs.writeFile(path.join(`${__static}`, './dataDir/todo.json'), JSON.stringify(this.allData), (err) => {
        if (err) {console.log(err)}
      })
    },
    deleteItem (index) { // 删除一个计划
      this.allData.data.will.splice(index, 1) // 删除元素
      this.todoList = this.allData.data.will // 更新展示Todo
      // 写入到文件
      fs.writeFile(path.join(`${__static}`, './dataDir/todo.json'), JSON.stringify(this.allData), (err) => {
        if (err) {console.log(err)}
      })
    },
    isShowFuncBtns (item) { // 是否展示TodoItem的操作按钮
      if (item.done) {
        return false
      } else {
        return true
      }
    },
    addItem () {
      if (this.inputTitle == "" || this.inputTime == "" || this.inputStatus == "") {
        this.$message.warning(
          '请输入所有内容后添加!',
          0.5
        )
        return false
      }
      this.allData.data.will.push({ // 添加到所有数据中
        title: this.inputTitle,
        time: this.inputTime,
        conditionStatus: this.inputStatus
      })
      this.todoList = this.allData.data.will // 更新视图
      this.inputTitle = this.inputTime = this.inputStatus = '' // 添加后置空
      // 写入到文件
      fs.writeFile(path.join(`${__static}`, './dataDir/todo.json'), JSON.stringify(this.allData), (err) => {
        if (err) {
          console.log(err)
          this.$message.error(
            '添加到本地出错！',
            2
          )
        }
      })
    }
  },
  created () {
    // fs.readdir(__dirname)
    this.readLocalToDo() // 初始化时读取本地todo
    if (!window.todoSettings) { // 参数不存在时
      window.todoSettings = {} // 为todo设置参数
    }
  }
}
</script>

<style scoped>
.todo-container {
  height: calc(100vh - 30px);
  width: calc(100vw - 200px);
  color: #ccc;
  display: flex;
  flex-direction: row;
}
.todo-list {
  width: 450px;
  height: calc(100vh - 30px);
  border-right: 1px solid rgba(184, 184, 184, 0.726);
  overflow: auto;
}
.todo-btns {
  width: 150px;
  height: calc(100vh - 30px);
}
.upload-btn, .download-btn, .reload-btn, .start-btn {
  width: 100%;
  text-align: center;
  height: 50px;
  line-height: 50px;
  background-color: rgba(27, 26, 26, 0.726);
  cursor: pointer;
  font-size: 20px;
  color: rgb(74, 101, 255);
}
:is(.upload-btn, .download-btn, .reload-btn, .start-btn):hover {
  background-color: rgb(61, 61, 61);
}
.switch-todo-list {
  width: 100%;
  height: 50px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  padding-right: 20px;
}
.will-list-btn, .done-list-btn {
  height: 30px;
  line-height: 30px;
  border: 1px solid rgb(80, 80, 80);
  border-radius: 5px;
  margin-left: 10px;
  padding: 0 10px;
  cursor: pointer;
  transition: all 0.4s;
}
.switch-btn-selected {
  background: rgba(0, 0, 0);
}
.todo-item, .add-area {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  height: 50px;
  line-height: 50px;
  width: 100%;
  transition: all 0.3s;
}
.todo-item:hover {
  background: rgba(49, 48, 48, 0.753);
}
.todo-item .todo-title {
  width: 100px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.add-area input {
  height: 30px;
  line-height: 30px;
  outline: none;
  border: 0;
  background: rgb(49, 49, 49);
  border-radius: 10px;
  text-align: center;
}
.add-area input:nth-child(1) {
  width: 100px;
}
.add-area input:nth-child(2) {
  width: 105px;
}
.add-area input:nth-child(3) {
  width: 40px;
}
.add-area button {
  outline: none;
  border: 0;
  width: 42px;
  height: 30px;
  line-height: 30px;
  border-radius: 10px;
  background: rgb(53, 52, 52);
  padding: 5x;
  cursor: pointer;
  transition: all 0.4s;
}
.add-area button:hover {
  background: rgb(77, 77, 77);
}
.urgent {
  color: red;
}
.day-plan {
  color: rgb(3, 110, 233);
}
.week-plan {
  color: rgb(0, 38, 255);
}
.no-urgent {
  color: rgb(80, 248, 103);
}
.finish-btn {
  cursor: pointer;
  transition: all 0.4s;
  margin-right: 10px;
}
.finish-btn:hover {
  color: rgb(0, 38, 255);
}
.delete-btn {
  cursor: pointer;
  color: rgb(255, 0, 0);
}
</style>