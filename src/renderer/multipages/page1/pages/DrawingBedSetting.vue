<template>
  <div class="container">
    <div class="export-area">
      <a-button @click="exportLinkFile">导出已上传链接文件</a-button>
    </div>
  </div>
</template>

<script>
const path = require("path")
const fs = require("fs")
const { dialog } = require("electron").remote

export default {
  data () {
    return {

    }
  },
  methods: {
    exportLinkFile () {
      dialog.showSaveDialog({
        title: '输入要保存的文件名',
        buttonLabel: '保存',
        filters: [
          { 
            name: 'Custom File Type', 
            extensions: ['json'] 
          }
        ]
      }).then(res => {
        fs.readFile(path.join(process.cwd(), './dataDir/HasUploadImages.json'), (err, data) => {
          if (err) {console.log(err)}
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
  }
}
</script>

<style scoped>
.container {
  margin-bottom: 20px;
}
</style>