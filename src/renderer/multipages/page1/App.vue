<template>
  <div id="app">
    <WindowBorder></WindowBorder>
    <router-view></router-view>
  </div>
</template>

<script>
  const fs = require("fs")
  const path = require("path")

  export default {
    name: 'laityhtool',
    components: {
      WindowBorder: () => import('./components/WindowBorder')
    },
    created () {
      console.log(this.$route)
      fs.readdir(path.join(__dirname, "../../assets/"), (err, files) => { // 读取是否存在数据目录
      console.log(files)
      if (files.indexOf('dataDir') == -1) { // 不存在数据目录时新建
        fs.mkdir(path.join(__dirname, "../../assets/dataDir"), (err2) => {
          if (err) throw err
        })
      }
      fs.readdir(path.join(__dirname, "../../assets/dataDir"), (err3, dataFiles) => { // 读取数据目录
        console.log(dataFiles)
        if (dataFiles.indexOf('todo.json') == -1) { // 是否存在todo的文件
          let todo = {
            "data": { // 数据
              hasDone: [], // 已完成的任务Todo
              will: [], // 未完成的任务Todo
            },
            "setting": {} // 配置文件
          }
          fs.writeFile(path.join(__dirname, "../../assets/dataDir/todo.json"), JSON.stringify(todo), (err4) => { // 不存在todo的文件新增
            if (err4) {console.log(err4)}
          })
        }
        // console.log(dataFiles.indexOf('BDownloader.json') == -1)
        if (dataFiles.indexOf('BDownloader.json') == -1) { // 是否存在BDownloader的配置文件
          let BDownloaderSetting = {
            SESSDATA: '',
            fileSavePath: '',
            mid: ''
          }
          fs.writeFile(path.join(__dirname, "../../assets/dataDir/BDownloader.json"), JSON.stringify(BDownloaderSetting), (err5) => {
            if (err5) {console.log(err5)}
          })
        }
      })
    })
      if (!window.BDownloaderSetting) { // 读取BDownloader.json配置文件
        fs.readFile(path.join(__dirname, "../../assets/dataDir/BDownloader.json"), (err, data) => {
          let fileData = JSON.parse(data)
          window.BDownloaderSetting = {
            SESSDATA: fileData.SESSDATA,
            fileSavePath: fileData.fileSavePath,
            mid: fileData.mid
          }
        })
      }
    }
  }
</script>

<style>
  /* CSS */
  #app {
    height: 100vh;
    background: rgb(41, 37, 37);
  }
  .ant-menu-submenu-title {
    color: #1890ff;
  }
  .ant-menu-inline, .ant-menu-vertical, .ant-menu-vertical-left {
    border-right: 1px solid rgb(83, 83, 83);
  }
  .ant-menu .ant-menu-inline .ant-menu-sub {
    background: rgb(41, 37, 37);
  }
  .ant-menu-submenu > .ant-menu {
    background: rgb(41, 37, 37);
  }
  .ant-menu:not(.ant-menu-horizontal) .ant-menu-item-selected {
    background: rgb(65, 58, 58);
    color: #1890ff;
  }
  .ant-menu-item {
    color: rgb(168, 166, 166);
  }
  .ant-modal-wrap::-webkit-scrollbar {
    width: 2px;
    height: 1px;
  }
  .ant-modal-wrap::-webkit-scrollbar-thumb { /* 滚动条中的滑条 */
    border-radius: 0;
    box-shadow: inset 0 0 2px rgba(0,0,0,0.2);
    background: #1d518b;
  }
  .ant-modal-wrap::-webkit-scrollbar-track { /* 滚动条轨迹 */
    border-radius: 0;
    background: rgb(56, 122, 209);
  }
</style>
