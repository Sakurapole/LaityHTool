<template>
  <div id="app">
    <WindowBorder></WindowBorder>
    <router-view></router-view>
  </div>
</template>

<script>
  const fs = require("fs")
  const path = require("path")

  const { ipcRenderer } = require('electron')

  export default {
    name: 'laityhtool',
    components: {
      WindowBorder: () => import('./components/WindowBorder')
    },
    created () {
      document.head.querySelector('#skin').setAttribute('href',`${__static}/theme/night.css`)
      // console.log(this.$route)
      // console.log(path.join(process.cwd(), "./"))
      fs.readdir(path.join(process.cwd(), "./"), (err, files) => { // 读取是否存在数据目录
      console.log(files)
      if (files.indexOf('dataDir') == -1) { // 不存在数据目录时新建
        fs.mkdir(path.join(process.cwd(), "./dataDir"), (err2) => {
          if (err) throw err
        })
      }
      fs.readdir(path.join(process.cwd(), "./dataDir"), (err3, dataFiles) => { // 读取数据目录
        console.log(dataFiles)
        if (dataFiles.indexOf('todo.json') == -1) { // 是否存在todo的文件
          let todo = {
            "data": { // 数据
              hasDone: [], // 已完成的任务Todo
              will: [], // 未完成的任务Todo
            },
            "setting": {} // 配置文件
          }
          fs.writeFile(path.join(process.cwd(), "./dataDir/todo.json"), JSON.stringify(todo), (err4) => { // 不存在todo的文件新增
            if (err4) {console.log(err4)}
          })
        }
        if (dataFiles.indexOf('BDownloader.json') == -1) { // 是否存在BDownloader的配置文件
          let BDownloaderSetting = {
            SESSDATA: '',
            fileSavePath: '',
            mid: ''
          }
          fs.writeFile(path.join(process.cwd(), "./dataDir/BDownloader.json"), JSON.stringify(BDownloaderSetting), (err5) => {
            if (err5) {console.log(err5)}
          })
        }
        if (dataFiles.indexOf('HasUploadImages.json') == -1) { // 是否存在HasUploadImages文件，包含已上传的图片
          let hasUploadImages = {
            images: []
          }
          fs.writeFile(path.join(process.cwd(), "./dataDir/HasUploadImages.json"), JSON.stringify(hasUploadImages, "", "\t"), (err6) => {
            if (err6) {console.log(err6)}
          })
        }
      })
    })
      if (!window.BDownloaderSetting) { // 读取BDownloader.json配置文件
        fs.readFile(path.join(process.cwd(), "./dataDir/BDownloader.json"), (err, data) => {
          let fileData = JSON.parse(data)
          window.BDownloaderSetting = {
            SESSDATA: fileData.SESSDATA,
            fileSavePath: fileData.fileSavePath,
            mid: fileData.mid
          }
        })
      }
      
      window.addEventListener('keyup', function (e) {
        if (e.code == 'Escape') {
          ipcRenderer.send('esc')
        }
      })
    }
  }
</script>

<style>
  /* CSS */
  #app {
    height: 100vh;
    background: var(--theme-background-color);
  }
  #app::-webkit-scrollbar {
    width: 0;
  }
  .ant-menu-submenu-title {
    color: #1890ff;
  }
  .ant-menu-inline, .ant-menu-vertical, .ant-menu-vertical-left {
    border-right: 1px solid var(--border-color);
  }
  .ant-menu .ant-menu-inline .ant-menu-sub {
    background-color: var(--theme-background-color) !important;
  }
  .ant-menu .ant-menu-inline .ant-menu-root .ant-menu-light {
    background-color: var(--theme-background-color) !important;
  }
  .ant-menu-submenu > .ant-menu {
    background: var(--theme-background-color) !important;
  }
  .ant-menu {
    /* 设置侧边栏主题色 */
    background-color: var(--theme-background-color) !important;
  }
  .ant-menu:not(.ant-menu-horizontal) .ant-menu-item-selected {
    background: var(--index-menu-selected-background-color);
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
  .ant-progress-text {
    color: rgb(15, 72, 194);
  }
  .ant-upload-list-item, .ant-upload-list-item-undefined, .ant-upload-list-item-list-type-text {
    display: none;
  }
  .ant-input {
    background-color: var(--input-background-color);
    border: 1px solid var(--input-background-color);
  }
  .ant-select-selection {
    background-color: var(--input-background-color);
    border: 1px solid var(--input-background-color);
    color: var(--normal-text-color);
  }
  .ant-select-arrow {
    color: var(--normal-text-color);
  }
</style>
