<template>
  <div class="downloader-setting-container">
    <div class="SESSDATA-input-area">
      <p class="func-title">SESSDATA</p>
      <a-input placeholder="输入SESSDATA" v-model="SESSDATA" class="SESSDATA-input"></a-input>
      <a-button @click="holdSESSDATA">保存</a-button>
      <div class="show-user-mid">
        <span>用户mid：</span>
        <span>{{ mid }}（保存SESSDATA后自动获取）</span>
      </div>
    </div>
    <div class="file-save-area">
      <p class="func-title">选择下载文件保存位置</p>
      <a-input placeholder="选择文件保存位置" v-model="fileSavePath" class="file-input"></a-input>
      <a-button @click="selectFileSavePath">选择</a-button>
    </div>
  </div>
</template>

<script>
const fs = require("fs")
const path = require("path")
const {ipcRenderer} = require("electron")
const { dialog, session } = require('electron').remote

export default {
  data () {
    return {
      SESSDATA: '',
      fileSavePath: '',
      mid: ''
    }
  },
  methods: {
    holdSESSDATA () { // 保存SESSDATA到本地
      if (this.SESSDATA == '') {
        this.$message.warning('请输入SESSDATA后保存！', 1)
        return false
      }
      const cookie = {url: 'https://api.bilibili.com', name: 'SESSDATA', value: this.SESSDATA}
      ipcRenderer.send('setCookie', JSON.stringify(cookie))
      session.defaultSession.cookies.get({ url: 'https://api.bilibili.com'}, (err, cookies) => {
        console.log(cookies)
      })
      session.defaultSession.cookies.set(cookie, (err) => {
        console.log(err)
      }) // 设置为全局cookie
      console.log(cookie)
      this.$http({
        method: 'GET',
        url: 'https://api.bilibili.com/x/web-interface/nav',
      }).then(res => {
        console.log(res);
        if (res.data.code == 0) {
          const fs = require("fs")
          fs.readFile(path.join(`${__static}`, './dataDir/BDownloader.json'), (err, data) => {
            // console.log(JSON.parse(data))
            let fileData = JSON.parse(data)
            fileData.SESSDATA = this.SESSDATA // 用户session data
            fileData.mid = res.data.data.mid // 用户mid
            // console.log(fileData);
            this.mid = fileData.mid
            fs.writeFile(path.join(`${__static}`, './dataDir/BDownloader.json'), JSON.stringify(fileData,"","\t"), (err2) => {
              if (err2) {this.$message.error('保存失败！', 2)}
              this.$message.success('保存成功！', 1)
            })
          })
        }
      })
    },
    selectFileSavePath () { // 选择文件保存路径
      dialog.showOpenDialog({
        title: '选择目录',
        buttonLabel: '选择',
        properties: ['openDirectory', 'createDirectory']
      }).then(filePath => {
        if (!filePath.canceled) {
          // console.log(filePath)
          this.fileSavePath = filePath.filePaths[0]
          fs.readFile(path.join(`${__static}`, './dataDir/BDownloader.json'), (err, data) => {
            // console.log(JSON.parse(data))
            let fileData = JSON.parse(data)
            // this.SESSDATA = fileData.SESSDATA
            fileData.fileSavePath = this.fileSavePath
            fs.writeFile(path.join(`${__static}`, './dataDir/BDownloader.json'), JSON.stringify(fileData,"","\t"), (err2) => {
              if (err2) {this.$message.error('保存失败！', 2)}
              this.$message.success('保存成功！', 1)
              // console.log(2)
              window.BDownloaderSetting = fileData
            })
          })
        }
      })
    }
  },
  created () {
    // console.log(__dirname)
    if (!window.BDownloaderSetting) {
      fs.readFile(path.join(`${__static}`, './dataDir/BDownloader.json'), (err, data) => {
        console.log(JSON.parse(data))
        let fileData = JSON.parse(data)
        window.BDownloaderSetting = {
          SESSDATA: fileData.SESSDATA,
          fileSavePath: fileData.fileSavePath,
          mid: fileData.mid
        }
        this.SESSDATA = fileData.SESSDATA
        this.fileSavePath = fileData.fileSavePath
        this.mid = fileData.mid
      })
    } else {
      // console.log(window.BDownloaderSetting.SESSDATA)
      this.SESSDATA = window.BDownloaderSetting.SESSDATA
      this.fileSavePath = window.BDownloaderSetting.fileSavePath
    }
  }
}
</script>

<style scoped>
.downloader-setting-container {
  width: 100%;
  /* height: calc(100vh - 30px); */
  display: flex;
  flex-direction: column;
  /* justify-content: center; */
  align-items: center;
}
.SESSDATA-input, .file-input {
  width: 300px;
}
.show-user-mid {
  margin-top: 5px;
  color: #ccc;
  font-size: 12px;
}
.func-title {
  color: rgba(160, 170, 66, 0.808);
  font-size: 16px;
  margin-top: 10px;
}
</style>