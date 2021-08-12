<template>
  <div class="drawing-bed-container">
    <div class="controller-area">
      <span style="width: 100px; color: #ccc;">上传进度：</span>
      <a-progress :percent="uploadProgress"></a-progress>
      <a-button @click="handleUpload">上传</a-button>
    </div>
    <div class="upload-area clearfix">
      <a-upload-dragger name="file" :multiple="true" :file-list="fileList" :remove="handleRemove" :before-upload="beforeUpload" listType="text">
        <p class="ant-upload-drag-icon">
          <a-icon type="inbox" />
        </p>
        <p class="ant-upload-text">
          点击选择图片或者拖拽上传
        </p>
        <p class="ant-upload-hint">
          只支持jpg png gif格式
        </p>
      </a-upload-dragger>
      <div class="file-list-preview images" v-viewer>
        <div class="img-card" v-for="(item, index) in filePathList" :key="index">
          <img class="img" :src="item" alt="">
          <div class="hover-show">
            <a-tooltip title="取消上传">
              <a-icon class="cancel-upload-btn" @click="handleRemove(fileList[index])" type="close" />
            </a-tooltip>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import 'viewerjs/dist/viewer.css'
import { directive as viewer } from "v-viewer"

const fs = require('fs')
const path = require('path')

export default {
  directives: {
    viewer: viewer({ // 注册图片预览指令
      debug: true,
    }),
  },
  data () {
    return {
      fileList: [], // 上传图片数组
      filePathList: [], // 上床图片路径数组
      uploading: false, // 上传状态
      uploadProgress: 0, // 上传进度
      count: 0, // 记录图片上传个数
    }
  },
  methods: {
    handleRemove (file) { // 移除还未上传的图片
      const index = this.fileList.indexOf(file)
      const newFileList = this.fileList.slice()
      const newFilePathList = this.filePathList.slice()
      newFileList.splice(index, 1)
      newFilePathList.splice(index, 1)
      this.fileList = newFileList
      this.filePathList = newFilePathList
    },
    beforeUpload (file) { // 拦截图片上传
      this.fileList = [...this.fileList, file]
      this.filePathList = []
      console.log(this.fileList)
      this.fileList.forEach(item => {
        this.filePathList.push(item.path)
      })
      console.log(this.filePathList)
      return false
    },
    async handleUpload () { // 手动上传图片
      const { fileList } = this
      this.count = 0 // 初始化图片上传个数
      let resArr = []
      for (let i = 0; i < fileList.length; i++) {
        let formData = new FormData()
        formData.append('category', 'daily')
        formData.append('file_up', fileList[i])
        let resData = await this.$http({
          method: 'POST',
          url: 'https://api.vc.bilibili.com/api/v1/drawImage/upload',
          data: formData,
          onUploadProgress: (e) => {
            // console.log(e)
            // console.log(e.loaded)
            // this.uploadProgress = Math.floor(e.loaded / e.total * 100)
            if (e.loaded == e.total) {
              this.$message.success(`上传单张图片成功！`, 1)
              this.count += 1
              this.uploadProgress = Math.floor(this.count * 1.0 / this.fileList.length * 100)
              if (this.count == this.fileList.length) {
                this.$message.success(`全部图片上传成功!`, 1)
              }
            }
          }
        })
        console.log(resData.data.data.image_url)
        resArr.push(resData.data.data)
      }
      fs.readFile(path.join(`${__static}`, './dataDir/HasUploadImages.json'), (err, data) => {
        console.log(JSON.parse(data))
        let willData = JSON.parse(data)
        console.log(resArr)
        resArr.forEach(item => {
          willData.images.push(item)
        })
        fs.writeFileSync(path.join(`${__static}`, './dataDir/HasUploadImages.json'), JSON.stringify(willData, "", "\t"), (err2) => {
          if (err2) {console.log(err2)}
        })
      })
    }
  },
  created () {

  }
}
</script>

<style scoped>
.drawing-bed-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 30px);
  overflow: auto;
}
.drawing-bed-container::-webkit-scrollbar {
  width: 5px;
  height: 1px;
}
.drawing-bed-container::-webkit-scrollbar-thumb { /* 滚动条中的滑条 */
  border-radius: 0;
  box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
  background: #1d518b;
}
.drawing-bed-container::-webkit-scrollbar-track { /* 滚动条轨迹 */
  border-radius: 0;
  background: rgb(56, 122, 209);
}
.upload-area {
  width: 100%;
  height: 300px;
}
.controller-area {
  display: flex;
  flex-direction: row;
  width: 80%;
  margin: 10px auto;
  height: 30px;
  line-height: 30px;
}
.file-list-preview {
  /* display: grid;
  width: 100%;
  grid-gap: 5px;
  grid-template-columns: repeat(auto-fit, minmax(50px, 1fr)); */
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  flex-flow: row wrap;
  justify-content: flex-start;
  margin-top: 5px;
}
.img {
  width: 148px;
  height: 100px;
  cursor: pointer;
}
.img-card {
  position: relative;
}
.img-card:hover .hover-show {
  display: flex;
  justify-content: flex-end;
}
.hover-show {
  position: absolute;
  top: 0;
  right: 0;
  display: none;
  width: 148px;
  height: 20px;
  line-height: 20px;
  background: rgba(34, 34, 34, 0.432);
}
.cancel-upload-btn {
  cursor: pointer;
}
.cancel-upload-btn:hover {
  color: rgb(6, 21, 240);
}
</style>