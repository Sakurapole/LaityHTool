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
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      fileList: [], // 上传图片数组
      uploading: false, // 上传状态
      uploadProgress: 0, // 上传进度
      count: 0, // 记录图片上传个数
    }
  },
  methods: {
    handleRemove (file) { // 移除还未上传的图片
      const index = this.fileList.indexOf(file)
      const newFileList = this.fileList.slice()
      newFileList.splice(index, 1)
      this.fileList = newFileList
    },
    beforeUpload (file) { // 拦截图片上传
      this.fileList = [...this.fileList, file]
      return false
    },
    async handleUpload () { // 手动上传图片
      const { fileList } = this
      this.count = 0 // 初始化图片上传个数
      for (let i = 0; i < fileList.length; i++) {
        let formData = new FormData()
        formData.append('category', 'daily')
        formData.append('file_up', fileList[i])
        let resData = await this.$http({
          method: 'POST',
          url: 'https://api.bilibili.com/api/v1/drawImage/upload',
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
        console.log(resData)
      }
    }
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

</style>