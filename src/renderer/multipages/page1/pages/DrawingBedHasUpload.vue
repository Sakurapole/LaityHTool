<template>
  <div class="images-container" v-viewer @contextmenu="rightClick">
    <div class="top-funcs">
      <div class="title">
        <span>已上传图片</span>
      </div>
      <div class="reload-area">
        <a-tooltip title="重新加载">
          <a-icon @click="reload" class="reload" type="redo" />
        </a-tooltip>
      </div>
    </div>
    <a-checkbox-group>
      <div class="image-box" v-for="(item, index) in hasUploadImages" :key="index">
        <div class="img-hover-box" v-for="(item2, index2) in item" :key="index2">
          <img :src="item2.image_url" alt="加载失败">
          <div class="img-hover func-area">
            <a-checkbox  @change="onChange" :value="item2.image_url"></a-checkbox>
            <!-- <a-icon type="copy" class="copy-btn" /> -->
            <a-dropdown>
              <a-menu slot="overlay" @click="copy($event, item2.image_url)">
                <a-menu-item key="1">
                  copy link
                </a-menu-item>
                <a-menu-item key="2">
                  copy markdown
                </a-menu-item>
                <a-menu-item key="3">
                  copy html
                </a-menu-item>
              </a-menu>
              <a-button size="small"> copy <a-icon type="down" /> </a-button>
            </a-dropdown>
          </div>
        </div>
      </div>
    </a-checkbox-group>
  </div>
</template>

<script>
import 'viewerjs/dist/viewer.css'
import { directive as viewer } from "v-viewer"

const fs = require("fs")
const path = require("path")
const { remote, clipboard } = require("electron")
const { Menu, MenuItem } = require('electron').remote

export default {
  directives: {
    viewer: viewer({ // 注册图片预览指令
      debug: true,
    }),
  },
  data () {
    return {
      hasUploadImages: [], // 已上传图片数组
      selectedImages: [], // 已选中的图片
    }
  },
  methods: {
    rightClick () {
      console.log(1)
      const menu = Menu()
      menu.append(new MenuItem({
        label: '批量删除',
        click: () => {
          this.batchDelete()
        }
      }))
      menu.popup(remote.getCurrentWindow())
    },
    onChange (e) { // 多选选中图片
      console.log(e)
      if (e.target.checked === true && this.selectedImages.indexOf(e.target.value) == -1) {
        this.selectedImages.push(e.target.value)
      } else if (e.target.checked === false && this.selectedImages.indexOf(e.target.value) != -1) {
        this.selectedImages.splice(this.selectedImages.indexOf(e.target.value), 1)
      }
      console.log(this.selectedImages)
    },
    copy (e, url) {
      console.log(e.key)
      console.log(url)
      if (e.key == '1') {
        clipboard.writeText(url)
        this.$message.success('复制链接成功！', 0.5)
      } else if (e.key == '2') {
        clipboard.writeText(`!()[${url}]`)
        this.$message.success('复制markdown成功！', 0.5)
      } else if (e.key == '3') {
        clipboard.writeText(`<img src="${url}" alt="">`)
        this.$message.success('复制HTML成功！', 0.5)
      }
    },
    batchDelete () { // 批量删除
      fs.readFile(path.join(`${__static}`,'./dataDir/HasUploadImages.json'), (err, data) => {
        if (err) return console.log('读取文件失败：' + err.message)
        let readData = JSON.parse(data).images
        for (let i in this.selectedImages) {
          readData.splice(readData.indexOf(this.selectedImages[i]), 1)
        }
        console.log(readData)
        let writeData = {
          images: readData
        }
        fs.writeFileSync(path.join(`${__static}`, './dataDir/HasUploadImages.json'), JSON.stringify(writeData,"","\t"), (err2) => {
          if (err2) return console.log(err2)
        })
        this.hasUploadImages = []
        let lineNumber = readData.length % 4 === 0 ? readData.length/4 : Math.floor(readData.length/4+1)
        for (let i = 0; i < lineNumber; i++) {
          this.hasUploadImages.push(readData.slice(i*4, i*4+4))
        }
        this.selectedImages = []
      })
      // this.readFileAndSort()
    },
    reload () {
      this.readFileAndSort()
    },
    readFileAndSort () { // 从文件读取数据并刷新页面
      this.hasUploadImages = [] // 初始化已上传文件数组
      fs.readFile(path.join(`${__static}`, "./dataDir/HasUploadImages.json"), (err, data) => {
        if (err) {console.log(err)}
        let readData = JSON.parse(data).images
        // this.hasUploadImages = JSON.parse(data).images
        let lineNumber = readData.length % 4 === 0 ? readData.length/4 : Math.floor(readData.length/4+1)
        for (let i = 0; i < lineNumber; i++) {
          this.hasUploadImages.push(readData.slice(i*4, i*4+4))
        }
        console.log(this.hasUploadImages)
      })
    }
  },
  created () {
    this.readFileAndSort()
  }
}
</script>

<style scoped>
.images-container {
  width: 100%;
  height: calc(100vh - 30px);
  overflow: auto;
}
.top-funcs {
  width: 100%;
  height: 50px;
  line-height: 50px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.top-funcs .title span {
  color: rgb(100, 123, 199);
  font-size: 16px;
  font-weight: bold;
  margin-left: 15px;
}
.reload {
  font-size: 16px;
  margin-right: 15px;
  color: rgb(100, 123, 199);
  cursor: pointer;
}
.reload:hover {
  color: #ccc;
}
.images-container::-webkit-scrollbar {
  width: 0px;
  height: 1px;
  position: absolute;
  top: 0;
  right: 0;
}
.images-container::-webkit-scrollbar-thumb { /* 滚动条中的滑条 */
  border-radius: 0;
  box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
  background: #1d518b;
}
.images-container::-webkit-scrollbar-track { /* 滚动条轨迹 */
  border-radius: 0;
  background: rgb(56, 122, 209);
}
.image-box {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  margin-bottom: calc(20px / 3);
}
img {
  width: 145px;
  height: 100px;
}
.image-box .img-hover-box:nth-child(2) {
  margin-left: calc(20px / 3);
}
.image-box .img-hover-box:nth-child(3) {
  margin: 0 calc(20px / 3);
}
.img-hover-box {
  position: relative;
}
.img-hover {
  width: 145px;
  /* height: 30px; */
  line-height: 24px;
  display: flex;
  justify-content: space-around;
  margin-top: 5px;
}
</style>