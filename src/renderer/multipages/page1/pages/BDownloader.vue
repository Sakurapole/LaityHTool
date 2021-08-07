<template>
  <div class="BDownloader-container">
    <div class="person-bookmark">
      <div class="area-title">
        <a-tag color="#108ee9" style="font-size: 15px;padding:5px 5px">个人收藏夹</a-tag>
        <div class="select-bookmark">
          <a-select style="width: 200px;" placeholder="选择要操作的收藏夹" @change="selectBookmark">
            <a-select-option v-for="(item, index) in bookmarks" :key="index" :value="item.id">
              {{ item.title }}
            </a-select-option>
          </a-select>
        </div>
      </div>
      <div class="bookmark-box">
        <div class="bookmark-item" @click="showImage(item)" v-for="(item, index) in bookmarkContent" :key="index">
          <img class="small-cover" :src="item.cover" alt="">
          <p class="item-title">{{ item.title }}</p>
        </div>
        <a-pagination style="margin-top: 10px;" @change="changePage" v-model="current" :pageSize=20 :total="bookmark_count" show-less-items></a-pagination>
      </div>
    </div>
    <a-drawer class="show-image" :width="700" :visible="isShowImage" @close="closeImageDrawer" :closable="false">
      <img class="big-cover" :src="itemContent.cover" alt="">
      <p class="detail-title">标题：{{ itemContent.title }}</p>
      <p class="detail-intro">简介：{{ itemContent.intro }}</p>
      <p class="detail-page">视频分p数：{{ itemContent.page }}</p>
      <p class="detail-id">bvid：{{ itemContent.bvid }}</p>
      <a-button @click="openDownload(itemContent)">下载</a-button>
      <!-- 下载Drawer -->
      <a-drawer title="下载界面" class="show-download" :width="300" :visible="isShowDownload" @close="closeDownloadDrawer">
        <a-button @click="downloadAll" type="primary" class="download-all-btn">全部下载</a-button>
        <a-modal title="选择清晰度（为所有视频共用，目前只支持Dash模式）" v-model="isShowSelectModal" :footer="null">
          <a-spin :spinning="allSelectLoading">
            <div class="all-quality" v-for="(item, index) in allQuality" :key="index">
              <p class="all-quality-name" @click="allSelectQuality(item.code)">{{ item.name }}</p>
            </div>
          </a-spin>
        </a-modal>
        <a-modal title="全部下载进度" v-model="isShowAllDownload" :footer="null">
          <p class="all-downloading-name">当前下载分p：{{ allDownloadingName }}</p>
          <div class="all-progress-area">
            <p>当前视频下载进度：</p>
            <a-progress :percent="allVideoProgress"></a-progress>
            <p>当前音频下载进度：</p>
            <a-progress :percent="allAudioProgress"></a-progress>
            <p>总下载进度：</p>
            <a-progress :percent="allProgress"></a-progress>
          </div>
          <a-button @click.native="openHasDownloadFilePath" type="primary">打开已下载文件所在文件夹</a-button>
          <div class="all-has-download-area" style="height: 300px; overflow: auto;">
            <p class="all-has-download" v-for="(item, index) in allHasDownload" :key="index">{{ item }}</p>
          </div>
        </a-modal>
        <div class="download-page-box">
          <div @click="openDownloadDetail(item)" class="download-page" v-for="(item, index) in allDownloads" :key="index">
            {{ item.part ? item.part : '默认' }}
          </div>
        </div>
        <!-- 选择视频清晰度Drawer -->
        <a-drawer title="选择清晰度" class="select-quality-box" :width="400" :visible="isShowSelectQuality" @close="closeSelectQuality">
          <div class="select-quality" v-for="(item, index) in videoQuality" :key="index">
            <p class="quality-title" @click="startDownload(videoDownloadUrls[index*2])">
              {{ item }}
            </p>
          </div>
          <div class="progress-box">
            <div class="video-progress">
              <p>视频下载进度：{{ videoSpeed + 'MB/s' }}</p>
              <a-progress :percent="progress" status="active"></a-progress>
            </div>
            <div class="audio-progress" v-if="showAudio">
              <p>音频下载进度（dash模式专属）：{{ audioSpeed + 'MB/s' }}</p>
              <a-progress :percent="audioProgress" status="active" :stroke-color="{'0%': '#108ee9','100%': '#87d068'}"></a-progress>
            </div>
          </div>
          <a-button @click.native="openHasDownloadFilePath" type="primary">打开已下载文件所在文件夹</a-button>
        </a-drawer>
      </a-drawer>
    </a-drawer>
  </div>
</template>

<script>
const fs = require("fs")
const path = require("path")
const childProcess = require("child_process")
const { shell } = require("electron")

export default {
  data () {
    return {
      bookmarks: [], // 收藏夹数组
      selectedBookmark: '', // 被选中的收藏夹
      bookmark_count: 0, // 选中收藏夹内总数
      bookmarkContent: [], // 当前页具体的内容数组
      current: 1, // 当前所在分页
      itemContent: {}, // 当前选中的视频对象
      isShowImage: false, // 是否展示图片大图Drawer
      isShowDownload: false, // 是否展示下载页面
      allDownloads: [], // 视频下载分p数组
      videoQuality: [], // 视频清晰度
      videoDownloadUrls: [], // 视频下载链接数组
      audioDownloadUrls: [], // 音频下载链接数组
      isShowSelectQuality: false, // 是否展示选择视频质量Drawer
      progress: 0, // 视频下载进度
      audioProgress: 0, // 音频下载进度
      selectedVideoTitle: '', // 当前选中视频的分p名
      selectedVideoSort: '', // 当前选中的视频的下载方式
      videoSpeed: 0, // 视频下载速度
      audioSpeed: 0, // 音频下载速度
      lastVideoByte: 0, // 上一秒视频已传输字节数
      lastAudioByte: 0, // 上一秒音频已传输字节数
      showAudio: true, // 是否展示音频下载区
      isShowSelectModal: false, // 是否展示全部下载的视频清晰度选择框
      allQuality: [], // 全部下载的清晰度名字+代码
      allCurrentQualityCode: 80, // 当前选择的清晰度代码
      allSelectLoading: true, // 全部下载清晰度是否正在加载
      allDownloadUrls: [], // 全部下载的dash数组
      isShowAllDownload: false, // 全部下载进度框是否显示
      allVideoProgress: 0, // 全部下载的视频下载进度
      allAudioProgress: 0, // 全部下载的音频下载进度
      allHasDownload: [], // 全部下载的已经下载完毕的名称数组
      allDownloadingName: '', // 全部下载的正在下载的分p名
      allProgress: 0, // 全部下载的总下载进度
    }
  },
  methods: {
    selectBookmark (value) { // 获得被选中收藏夹的id并获取收藏夹第一页内容
      this.selectedBookmark = value
      // console.log(value)
      this.$http({
        method: 'GET',
        url: '/api/x/v3/fav/resource/list?media_id=' + value + '&ps=20&pn=1'
      }).then(res => {
        console.log(res)
        if (res.data.code == 0) {
          this.bookmark_count = res.data.data.info.media_count
          this.bookmarkContent = res.data.data.medias
        }
      })
    },
    changePage (page, pageSize) { // 更改页码
      this.$http({
        method: 'GET',
        url: '/api/x/v3/fav/resource/list?media_id=' + this.selectedBookmark + '&ps=20&pn=' + page
      }).then(res => {
        console.log(res)
        if (res.data.code == 0) {
          // this.bookmark_count = res.data.data.info.media_count
          this.bookmarkContent = res.data.data.medias
        }
      })
    },
    showImage (item) { // 开启封面大图预览Drawer
      this.itemContent = item
      this.isShowImage = true
    },
    closeImageDrawer () { // 关闭封面大图预览Drawer
      this.isShowImage = false
    },
    openDownload (item) { // 打开下载Drawer并获取视频相关下载信息
      this.isShowDownload = true
      this.$http({
        method: 'GET',
        url: '/api/x/web-interface/view?bvid='+item.bvid
      }).then(res => {
        if (res.data.code == 0) {
          this.allDownloads = res.data.data.pages
        }
      })
    },
    closeDownloadDrawer () { // 关闭下载Drawer
      this.isShowDownload = false
    },
    async downloadAll () { // 下载所选视频的全部分p到文件夹中
      console.log(this.allDownloads);
      this.isShowSelectModal = true // 展示选择清晰度盒子
      this.allSelectLoading = true // 展示加载中
      this.allQuality = [] // 初始化清晰度代码+名称列表
      this.allDownloadUrls = [] // 初始化dash下载数组
      let qualityReq = await this.$http({
        method: 'GET',
        url: '/api/x/player/playurl?fnval=16&bvid='+this.itemContent.bvid+'&cid='+this.allDownloads[0].cid
      })
      console.log(qualityReq)
      if (qualityReq.data.data.dash) { // dash模式
        console.log(qualityReq.data.data)
        for (let i = 0; i <qualityReq.data.data.accept_description.length; i++) {
          this.allQuality.push({
            code: qualityReq.data.data.accept_quality[i],
            name: qualityReq.data.data.accept_description[i]
          })
        }
        console.log(this.allQuality)
        let reqDownloadList = [] // 下载链接请求列表
        for (let i = 0; i < this.allDownloads.length; i++) {
          reqDownloadList.push(this.$http({
            method: 'GET',
            url: '/api/x/player/playurl?fnval=16&bvid='+this.itemContent.bvid+'&cid='+this.allDownloads[i].cid
          }))
        }
        let resDownloadUrlList = await this.$http.all(reqDownloadList)
        for (let i = 0; i < resDownloadUrlList.length; i++) {
          this.allDownloadUrls.push(resDownloadUrlList[i].data.data.dash)
        }
        this.allSelectLoading = false // 关闭加载中效果
        // console.log(resDownloadUrlList)
        console.log(this.allDownloadUrls)
      }
    },
    async allSelectQuality (qualityCode) { // 全部下载中选中清晰度代码并下载
      console.log(this.itemContent)
      this.allCurrentQualityCode = qualityCode // 保存全部下载清晰度代码
      this.isShowSelectModal = false // 关闭选择清晰度对话框
      this.isShowAllDownload = true // 展示下载进度对话框
      this.allHasDownload = [] // 初始化已下载分p列表
      this.allProgress = 0 // 初始化总下载进度
      for (let i = 0; i < this.allDownloadUrls.length; i++) {
        let videoUrl = '' // 单个视频下载地址
        let audioUrl = '' // 单个音频下载地址
        this.allVideoProgress = 0 // 每次循环重置进度条
        this.allAudioProgress = 0
        audioUrl = this.allDownloadUrls[i].audio[0].baseUrl
        this.allDownloadUrls[i].video.forEach(item => {
          console.log(item.id, qualityCode)
          if (item.id == qualityCode) {
            videoUrl = item.baseUrl
            return true
          }
        })
        console.log('找到：'+videoUrl)
        if (videoUrl == '') { // 没有找到清晰度代码对应的视频链接
          videoUrl = this.allDownloadUrls[i].video[0].baseUrl
        }
        console.log('video:'+videoUrl)
        console.log('audio:'+audioUrl)
        this.allDownloadingName = this.allDownloads[i].part
        let videoRes = await this.$http({
          method: 'GET',
          url: videoUrl,
          onDownloadProgress: (e) => {
            // console.log(1)
            this.allVideoProgress = Math.floor(e.loaded / e.total * 100)
          },
          responseType: 'arraybuffer'
        })
        let audioRes = await this.$http({
          method: 'GET',
          url: audioUrl,
          onDownloadProgress: (e) => {
            this.allAudioProgress = Math.floor(e.loaded / e.total * 100)
          },
          responseType: 'arraybuffer'
        })
        console.log(videoRes)
        this.allHasDownload.push(this.allDownloadingName)
        fs.readdir(window.BDownloaderSetting.fileSavePath, (err, files) => { // 开始文件保存合并操作
          console.log(files, this.itemContent.title)
          if (files.indexOf(this.itemContent.title) == -1) {
            fs.mkdir(window.BDownloaderSetting.fileSavePath+'/'+this.itemContent.title.replace(/\s*/g,""), (err) => {
              if (err) {console.log(err);}
            })
          }
          fs.writeFileSync(window.BDownloaderSetting.fileSavePath+`/1.m4s`, new Int8Array(videoRes.data), (err) => {
            if (err) {console.log(err)}
          })
          fs.writeFileSync(window.BDownloaderSetting.fileSavePath+`/2.m4s`, new Int8Array(audioRes.data), (err) => {
            if (err) {console.log(err)}
          })
          let output = window.BDownloaderSetting.fileSavePath+'\\'+this.itemContent.title.replace(/\s*/g,"")+'\\'+this.allDownloads[i].part.replace(/\s*/g,"")+'.mp4'
          childProcess.exec('D:\\ffmpeg\\bin\\ffmpeg.exe -i '+window.BDownloaderSetting.fileSavePath+'\\1.m4s -i '+window.BDownloaderSetting.fileSavePath+'\\2.m4s -codec copy '+output+' -y', (err, stdout, stderr) => {
            if (err) {console.log(err)}
            console.log(stdout)
            this.allProgress = Math.floor(this.allHasDownload.length / this.allDownloadUrls.length * 100)
          })
        })
      }
    },
    openDownloadDetail (video) { // 打开下载详情页
      this.selectedVideoTitle = video.part
      this.$http({
        method: 'GET',
        url: '/api/x/player/playurl?fnval=16&bvid='+this.itemContent.bvid+'&cid='+video.cid
      }).then(res => {
        this.isShowSelectQuality = true
        console.log(res)
        if (res.data.code == 0) {
          if (res.data.data.dash) { // dash模式下载
            this.videoQuality = res.data.data.accept_description
            this.videoDownloadUrls = res.data.data.dash.video
            this.audioDownloadUrls = res.data.data.dash.audio
            this.selectedVideoSort = 'dash'
            this.showAudio = true
          } else if (res.data.data.durl) { // durl(mp4/flv)模式
            this.videoQuality = res.data.data.accept_description
            this.videoDownloadUrls = []
            let allQuality = res.data.data.accept_quality
            let reqList = []
            // console.log(allQuality)
            for (let i = 0; i < allQuality.length; i++) {
              reqList.push(this.$http({
                method: 'GET',
                url: '/api/x/player/playurl?fnval=0&bvid='+this.itemContent.bvid+'&cid='+video.cid+'&qn='+allQuality[i]
              }))
            }
            this.$http.all(reqList).then(this.$http.spread((...data) => {
              // console.log(data)
              for (let i = 0; i < data.length; i++) {
                this.videoDownloadUrls.push(data[i].data.data.durl[0])
              }
              // console.log(this.videoDownloadUrls)
            }))
            this.audioDownloadUrls = []
            this.selectedVideoSort = 'durl'
            this.showAudio = false
          }
          // console.log(res.data.data)
        }
      })
    },
    closeSelectQuality () { // 关闭下载详情页
      this.isShowSelectQuality = false
    },
    startDownload (url) { // 开始下载
      console.log(url) // url为json对象
      if (this.selectedVideoSort == 'dash') { // dash模式下载
        let requestList = [] // 视频和音频的请求列表，使用axios的all和spread方法
        requestList.push(this.$http({
          method: 'GET',
          url: url.baseUrl,
          onDownloadProgress: (progressEvent) => {
            // console.log(progressEvent.loaded / progressEvent.total)
            this.progress = Math.floor(progressEvent.loaded / progressEvent.total * 100)
          },
          responseType: 'arraybuffer' // 请求返回响应为ArrayBuffer类型
        }))
        requestList.push(this.$http({
          method: 'GET',
          url: this.audioDownloadUrls[0].baseUrl,
          onDownloadProgress: (progressEvent) => {
            this.audioProgress = Math.floor(progressEvent.loaded / progressEvent.total * 100)
          },
          responseType: 'arraybuffer' // 请求返回响应为ArrayBuffer类型
        }))
        this.$http.all(requestList).then(this.$http.spread((...data) => {
          console.log(data)
          fs.readdir(window.BDownloaderSetting.fileSavePath, (err, files) => {
            if (files.indexOf(this.itemContent.title) == -1) {
              fs.mkdir(window.BDownloaderSetting.fileSavePath+'/'+this.itemContent.title.replace(/\s*/g,""), (err) => {
                if (err) {console.log(err);}
              })
            }
            fs.writeFileSync(window.BDownloaderSetting.fileSavePath+`/1.m4s`, new Int8Array(data[0].data), (err) => {
              if (err) {console.log(err)}
            })
            fs.writeFileSync(window.BDownloaderSetting.fileSavePath+`/2.m4s`, new Int8Array(data[1].data), (err) => {
              if (err) {console.log(err)}
            })
            let output = window.BDownloaderSetting.fileSavePath+'\\'+this.itemContent.title.replace(/\s*/g,"")+'\\'+this.selectedVideoTitle.replace(/\s*/g,"")+'.mp4'
            childProcess.exec('D:\\ffmpeg\\bin\\ffmpeg -i '+window.BDownloaderSetting.fileSavePath+'\\1.m4s -i '+window.BDownloaderSetting.fileSavePath+'\\2.m4s -codec copy '+output+' -y', (err, stdout, stderr) => {
              if (err) {console.log(err)}
              console.log(stdout)
            })
          })
        }))
      } else if (this.selectedVideoSort == 'durl') { // durl(mp4/flv)模式下载
        this.$http({
          method: 'GET',
          url: url.url,
          onDownloadProgress: (progressEvent) => {
            // console.log(progressEvent)
            this.progress = Math.floor(progressEvent.loaded / progressEvent.total * 100)
          },
          responseType: 'arraybuffer' // 请求返回响应为ArrayBuffer类型
        }).then(res => {
          console.log(res)
          fs.writeFileSync(window.BDownloaderSetting.fileSavePath+`/${this.itemContent.title+this.selectedVideoTitle}.flv`, new Int8Array(res.data), (err) => {
            if (err) {console.log(err)}
          })
        })
      }
    },
    openHasDownloadFilePath () { // 打开已下载文件所在文件夹
      shell.showItemInFolder(window.BDownloaderSetting.fileSavePath+`\\${this.itemContent.title.replace(/\s*/g,"")}`)
    }
  },
  created () {
    if (!window.BDownloaderSetting) { // 建立BDownloder的配置到window
      fs.readFile(path.join(__dirname, "../../../assets/dataDir/BDownloader.json"), (err, data) => {
        let fileData = JSON.parse(data)
        window.BDownloaderSetting = {
          SESSDATA: fileData.SESSDATA,
          fileSavePath: fileData.fileSavePath,
          mid: fileData.mid
        }
      })
    }
    setTimeout(() => { // 获取收藏夹内容
      this.$http({
        method: 'GET',
        url: "/api/x/v3/fav/folder/created/list-all?up_mid=" + window.BDownloaderSetting.mid
      }).then(res => {
        console.log(res)
        if (res.data.code == 0) {
          this.bookmarks = res.data.data.list
        }
      })
    }, 1000)
    
  }
}
</script>

<style scoped>
.BDownloader-container {
  width: 100%;
  height: calc(100vh - 30px);
  overflow: auto;
}
.area-title {
  color: rgb(73, 218, 170);
  margin-top: 10px;
  padding-left: 5px;
  display: flex;
  flex-direction: row;
}
.person-bookmark {
  height: 400px;
  /* overflow: auto; */
  border-bottom: 1px solid rgb(50, 95, 190);
}
.bookmark-box {
  overflow: auto;
  height: calc(400px - 56px);
  display: flex;
  flex-direction: column;
  /* justify-content: center; */
  align-items: center;
  margin-top: 5px;
}
.bookmark-box::-webkit-scrollbar {
  width: 5px;
  height: 1px;
}
.bookmark-box::-webkit-scrollbar-thumb { /* 滚动条中的滑条 */
  border-radius: 0;
  box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
  background: #1d518b;
}
.bookmark-box::-webkit-scrollbar-track { /* 滚动条轨迹 */
  border-radius: 0;
  background: rgb(56, 122, 209);
}
.select-bookmark {
  margin-left: 20px;
}
.bookmark-item {
  width: 100%;
  height: 100px;
  /* background: rgb(43, 43, 43); */
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  justify-content: flex-start;
  align-items: center;
  transition: all 0.4s;
  cursor: pointer;
}
.bookmark-item:hover {
  background: rgba(54, 54, 54, 0.801);
}
.small-cover {
  width: 150px;
  height: 100px;
  /* cursor: pointer; */
}
.big-cover {
  width: 450px;
  height: 300px;
}
.item-title {
  color: #2b93ad;
  /* cursor: pointer; */
  margin-left: 20px;
}
.download-page {
  cursor: pointer;
  margin-bottom: 5px;
}
.download-page:hover {
  color: rgb(10, 89, 192);
}
.download-all-btn {
  margin-bottom: 10px;
}
.quality-title {
  cursor: pointer;
}
.quality-title:hover {
  color: rgb(35, 84, 219);
}
.all-quality-name:hover {
  color: rgb(23, 62, 220);
  cursor: pointer;
}
.all-downloading-name {
  color: rgb(30, 70, 204);
}
.all-has-download {
  color: rgb(189, 64, 33);
}
</style>