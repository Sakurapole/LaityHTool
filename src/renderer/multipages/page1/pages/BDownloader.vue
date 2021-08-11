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
    <!-- 收藏夹下载的Drawer -->
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
            <a-progress :percent="allVideoProgress" status="active" :stroke-color="{'0%': '#108ee9','100%': '#87d068'}"></a-progress>
            <p>当前音频下载进度：</p>
            <a-progress :percent="allAudioProgress" status="active" :stroke-color="{'0%': '#108ee9','100%': '#87d068'}"></a-progress>
            <p>总下载进度：</p>
            <a-progress :percent="allProgress" status="active" :stroke-color="{'0%': '#108ee9','100%': '#87d068'}"></a-progress>
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
              <a-progress :percent="progress" status="active" :stroke-color="{'0%': '#108ee9','100%': '#87d068'}"></a-progress>
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
    <!-- 根据AVorBV号获取视频下载 -->
    <div class="av-bv">
      <div class="area-title">
        <a-tag color="#108ee9" style="font-size: 15px;padding:5px 5px;">AV/BV号获取</a-tag>
        <div class="av-bv-input">
          <a-input-search v-model="inputAv" placeholder="这里输入AV号" enterButton style="width: 200px" @search="searchByAvOrBv('av')" />
          <a-input-search v-model="inputBv" placeholder="这里输入BV号" enterButton style="width: 200px" @search="searchByAvOrBv('bv')" />
          <a-tooltip title="打开保存文件目录">
            <a-button @click="idOpenSaveFile">
                <a-icon type="folder" />
            </a-button>
          </a-tooltip>
        </div>
      </div>
      <div class="av-bv-main-area">
        <div class="video-pages">
          <div class="video-page" @click="startIdSingleDownload(item.cid, item.part)" v-for="(item, index) in searchData.pages" :key="index">
            <a-tooltip placement="right">
              <template slot="title">
                <span>{{ item.part }}</span>
              </template>
              {{ item.part ? item.part : "默认" }}
            </a-tooltip>
          </div>
        </div>
        <div class="av-bv-download-area">
          <p class="av-bv-current-title">
            <a-tooltip placement="left">
              <template slot="title">
                <span>{{ searchData.title }}</span>
              </template>
              标题：{{ searchData.title }}
            </a-tooltip>
          </p>
          <div class="single-download">
            <a-tag color="blue" style="font-size: 13px;padding:5px 5px;">单p下载</a-tag>
            <div class="download-progress">
              <p>视频下载进度：</p>
              <a-progress :percent="idVideoProgress" status="active" :stroke-color="{'0%': '#108ee9','100%': '#87d068'}"></a-progress>
              <p>音频下载进度：（Dash模式）</p>
              <a-progress :percent="idAudioProgress" status="active" :stroke-color="{'0%': '#108ee9','100%': '#87d068'}"></a-progress>
            </div>
            <!-- av/bv单p下载选择清晰度对话框 -->
            <a-modal v-model="isShowIdQualitySelect" :footer="null">
              <p @click="idSingleSelectQuality(item.code)" class="av-bv-select-quality-title" v-for="(item, index) in idVideoQuality" :key="index">{{ item.name }}</p>
            </a-modal>
          </div>
          <div class="multi-download">
            <a-tag color="blue" style="font-size: 13px;padding:5px 5px;">多p下载（全部下载）</a-tag>
            <a-button @click="idDownloadAll" style="display:block;margin-top: 15px;margin-left: 20px;">全部下载</a-button>
            <a-modal v-model="isShowIdAllQualitySelect" :footer="null">
              <a-spin :spinning="allSelectLoading">
                <p @click="idAllSelectQuality(item.code)" class="av-bv-select-quality-title" v-for="(item, index) in idVideoQuality" :key="index">{{ item.name }}</p>
              </a-spin>
            </a-modal>
            <a-modal v-model="isShowIdAllDownload" :footer="null">
              <p>视频下载进度：</p>
              <a-progress :percent="idAllVideoProgress"></a-progress>
              <p>音频下载进度：</p>
              <a-progress :percent="idAllAudioProgress"></a-progress>
              <p>总下载进度：</p>
              <a-progress :percent="idAllProgress"></a-progress>
              <a-button @click.native="idOpenSaveFile" type="primary">打开已下载文件所在文件夹</a-button>
              <div class="all-has-download-area" style="height: 300px; overflow: auto;">
                <p class="all-has-download" v-for="(item, index) in allHasDownload" :key="index">{{ item }}</p>
              </div>
            </a-modal>
          </div>
        </div>
      </div>
    </div>
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
      inputAv: '', // 输入的Av号
      inputBv: '', // 输入的Bv号
      searchData: {}, // 根据av或bv查询的返回结果
      idPartName: '', // av/bv模式下选中的分p名称
      idVideoProgress: 0, // av或bv模式下的视频下载进度
      idAudioProgress: 0, // av或bv模式下的音频下载进度
      idVideoQuality: [], // av或bv模式下的视频清晰度数组
      isShowIdQualitySelect: false, // av/bv模式下是否展示清晰度选择框
      idVideoDownloadUrls: [], // av/bv模式下的视频下载链接
      idAudioDownloadUrls: [], // av/bv模式下的音频下载链接
      isShowIdAllQualitySelect: false, // av/bv全部下载模式是否展示清晰度选择框
      isShowIdAllDownload: false, // av/bv全部下载模式是否展示下载进度展示框
      idAllVideoProgress: 0, // av/bv全部下载模式下单个视频下载进度
      idAllAudioProgress: 0, // av/bv全部下载模式下单个音频下载进度
      idAllProgress: 0, // av/bv全部下载模式下总下载进度
    }
  },
  methods: {
    selectBookmark (value) { // 获得被选中收藏夹的id并获取收藏夹第一页内容
      this.selectedBookmark = value
      // console.log(value)
      this.$http({
        method: 'GET',
        url: 'https://api.bilibili.com/x/v3/fav/resource/list?media_id=' + value + '&ps=20&pn=1'
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
        url: 'https://api.bilibili.com/x/v3/fav/resource/list?media_id=' + this.selectedBookmark + '&ps=20&pn=' + page
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
        url: 'https://api.bilibili.com/x/web-interface/view?bvid='+item.bvid
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
        url: 'https://api.bilibili.com/x/player/playurl?fnval=16&bvid='+this.itemContent.bvid+'&cid='+this.allDownloads[0].cid
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
            url: 'https://api.bilibili.com/x/player/playurl?fnval=16&bvid='+this.itemContent.bvid+'&cid='+this.allDownloads[i].cid
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
        url: 'https://api.bilibili.com/x/player/playurl?fnval=16&bvid='+this.itemContent.bvid+'&cid='+video.cid
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
                url: 'https://api.bilibili.com/x/player/playurl?fnval=0&bvid='+this.itemContent.bvid+'&cid='+video.cid+'&qn='+allQuality[i]
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
    startDownload (url) { // 开始单p下载
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
    },
    async searchByAvOrBv (type) { // 通过AV号获取视频信息及下载链接
      let resData = {}
      if (type == 'av') { // 输入为av号
        resData = await this.$http({
          method: 'GET',
          url: 'https://api.bilibili.com/x/web-interface/view?aid='+this.inputAv
        })
      } else if (type == 'bv') { // 输入为bv号
        resData = await this.$http({
          method: 'GET',
          url: 'https://api.bilibili.com/x/web-interface/view?bvid='+this.inputBv
        })
      }
      this.searchData = resData.data.data
      console.log(resData)
    },
    async startIdSingleDownload (cid, partName) { // 通过av/bv号开始的单p下载
      if (partName == '') {
        this.idPartName = "默认"
      } else {
        this.idPartName = partName
      }
      let resData = {}
      if (this.inputAv) {
        resData = await this.$http({
          method: 'GET',
          url: `https://api.bilibili.com/x/player/playurl?avid=${this.inputAv}&cid=${cid}&fnval=80`
        })
      } else {
        resData = await this.$http({
          method: 'GET',
          url: `https://api.bilibili.com/x/player/playurl?bvid=${this.inputBv}&cid=${cid}&fnval=80`
        })
      }
      console.log(resData)
      let tmp = []
      for (let i = 0; i < resData.data.data.accept_description.length; i++) {
        tmp.push({
          name: resData.data.data.accept_description[i],
          code: resData.data.data.accept_quality[i]
        })
      }
      this.idVideoQuality = tmp
      this.isShowIdQualitySelect = true
      console.log(this.idVideoQuality)
      if (resData.data.data.dash) { // dash模式
        this.idVideoDownloadUrls = resData.data.data.dash.video
        this.idAudioDownloadUrls = resData.data.data.dash.audio
      }
    },
    idSingleSelectQuality (code) { // 通过av/bv号选择清晰度后开始下载
      console.log(code)
      this.isShowIdQualitySelect = false
      let videoUrl = ''
      this.idVideoDownloadUrls.forEach((item) => {
        if (item.id == code) {
          videoUrl = item.baseUrl
          return true
        }
      })
      if (videoUrl == '') {
        videoUrl = this.idVideoDownloadUrls[0].baseUrl
      }
      let requestList = [] // 视频和音频的请求列表，使用axios的all和spread方法
      requestList.push(this.$http({
        method: 'GET',
        url: videoUrl,
        onDownloadProgress: (progressEvent) => {
          // console.log(progressEvent.loaded / progressEvent.total)
          this.idVideoProgress = Math.floor(progressEvent.loaded / progressEvent.total * 100)
        },
        responseType: 'arraybuffer' // 请求返回响应为ArrayBuffer类型
      }))
      requestList.push(this.$http({
        method: 'GET',
        url: this.idAudioDownloadUrls[0].baseUrl,
        onDownloadProgress: (progressEvent) => {
          this.idAudioProgress = Math.floor(progressEvent.loaded / progressEvent.total * 100)
        },
        responseType: 'arraybuffer' // 请求返回响应为ArrayBuffer类型
      }))
      this.$http.all(requestList).then(this.$http.spread((...data) => {
        console.log(data)
        fs.readdir(window.BDownloaderSetting.fileSavePath, (err, files) => {
          if (files.indexOf(this.itemContent.title) == -1) {
            fs.mkdir(window.BDownloaderSetting.fileSavePath+'/'+this.searchData.title.replace(/\s*/g,""), (err) => {
              if (err) {console.log(err);}
            })
          }
          fs.writeFileSync(window.BDownloaderSetting.fileSavePath+`/1.m4s`, new Int8Array(data[0].data), (err) => {
            if (err) {console.log(err)}
          })
          fs.writeFileSync(window.BDownloaderSetting.fileSavePath+`/2.m4s`, new Int8Array(data[1].data), (err) => {
            if (err) {console.log(err)}
          })
          let output = window.BDownloaderSetting.fileSavePath+'\\'+this.searchData.title.replace(/\s*/g,"")+'\\'+this.idPartName.replace(/\s*/g,"")+'.mp4'
          childProcess.exec('D:\\ffmpeg\\bin\\ffmpeg -i '+window.BDownloaderSetting.fileSavePath+'\\1.m4s -i '+window.BDownloaderSetting.fileSavePath+'\\2.m4s -codec copy '+output+' -y', (err, stdout, stderr) => {
            if (err) {console.log(err)}
            console.log(stdout)
          })
        })
      }))
    },
    idOpenSaveFile () { // av/bv单p下载模式下打开文件所在位置
      shell.showItemInFolder(window.BDownloaderSetting.fileSavePath+`\\${this.searchData.title.replace(/\s*/g,"")}`)
    },
    async idDownloadAll () { // av/bv全部下载选择清晰度
      this.isShowIdAllQualitySelect = true
      let qualityReq = await this.$http({
        method: 'GET',
        url: 'https://api.bilibili.com/x/player/playurl?fnval=16&bvid='+this.searchData.bvid+'&cid='+this.searchData.pages[0].cid
      })
      console.log(qualityReq)
      if (qualityReq.data.data.dash) { // dash模式
        console.log(qualityReq.data.data)
        for (let i = 0; i <qualityReq.data.data.accept_description.length; i++) {
          this.idVideoQuality.push({
            code: qualityReq.data.data.accept_quality[i],
            name: qualityReq.data.data.accept_description[i]
          })
        }
        let reqDownloadList = [] // 下载链接请求列表
        for (let i = 0; i < this.searchData.pages.length; i++) {
          reqDownloadList.push(this.$http({
            method: 'GET',
            url: 'https://api.bilibili.com/x/player/playurl?fnval=16&bvid='+this.searchData.bvid+'&cid='+this.searchData.pages[i].cid
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
    async idAllSelectQuality(code) {
      this.isShowIdAllQualitySelect = false
      this.isShowIdAllDownload = true
      this.allHasDownload = []
      this.idAllProgress = 0
      for (let i = 0; i < this.allDownloadUrls.length; i++) {
        let videoUrl = '' // 单个视频下载地址
        let audioUrl = '' // 单个音频下载地址
        this.idAllVideoProgress = 0
        this.idAllAudioProgress = 0
        audioUrl = this.allDownloadUrls[i].audio[0].baseUrl
        this.allDownloadUrls[i].video.forEach(item => {
          if (item.id == code) {
            videoUrl = item.baseUrl
            return false
          }
        })
        if (videoUrl == '') {
          videoUrl = this.allDownloadUrls[i].video[0].baseUrl
        }
        if (this.allDownloadUrls[i].part == '') {
          this.idPartName = '默认'
        } else {
          this.idPartName = this.searchData.pages[i].part
        }
        console.log(this.idPartName)
        let videoRes = await this.$http({
          method: 'GET',
          url: videoUrl,
          onDownloadProgress: (e) => {
            // console.log(1)
            this.idAllVideoProgress = Math.floor(e.loaded / e.total * 100)
          },
          responseType: 'arraybuffer'
        })
        let audioRes = await this.$http({
          method: 'GET',
          url: audioUrl,
          onDownloadProgress: (e) => {
            this.idAllAudioProgress = Math.floor(e.loaded / e.total * 100)
          },
          responseType: 'arraybuffer'
        })
        this.allHasDownload.push(this.idPartName)
        fs.readdir(window.BDownloaderSetting.fileSavePath, (err, files) => { // 开始文件保存合并操作
          if (files.indexOf(this.searchData.title) == -1) {
            fs.mkdir(window.BDownloaderSetting.fileSavePath+'/'+this.searchData.title.replace(/\s*/g,""), (err) => {
              if (err) {console.log(err);}
            })
          }
          fs.writeFileSync(window.BDownloaderSetting.fileSavePath+`/1.m4s`, new Int8Array(videoRes.data), (err) => {
            if (err) {console.log(err)}
          })
          fs.writeFileSync(window.BDownloaderSetting.fileSavePath+`/2.m4s`, new Int8Array(audioRes.data), (err) => {
            if (err) {console.log(err)}
          })
          let output = window.BDownloaderSetting.fileSavePath+'\\'+this.searchData.title.replace(/\s*/g,"")+'\\'+this.idPartName.replace(/\s*/g,"")+'.mp4'
          childProcess.exec('D:\\ffmpeg\\bin\\ffmpeg.exe -i '+window.BDownloaderSetting.fileSavePath+'\\1.m4s -i '+window.BDownloaderSetting.fileSavePath+'\\2.m4s -codec copy '+output+' -y', (err, stdout, stderr) => {
            if (err) {console.log(err)}
            console.log(stdout)
            this.idAllProgress = Math.floor(this.allHasDownload.length / this.allDownloadUrls.length * 100)
          })
        })
      }
    }
  },
  created () {
    if (!window.BDownloaderSetting) { // 建立BDownloder的配置到window
      fs.readFile(path.join(`${__static}`, './dataDir/BDownloader.json'), (err, data) => {
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
        url: "https://api.bilibili.com/x/v3/fav/folder/created/list-all?up_mid=" + window.BDownloaderSetting.mid
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
.BDownloader-container::-webkit-scrollbar {
  width: 5px;
  height: 1px;
}
.BDownloader-container::-webkit-scrollbar-thumb { /* 滚动条中的滑条 */
  border-radius: 0;
  box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
  background: #1d518b;
}
.BDownloader-container::-webkit-scrollbar-track { /* 滚动条轨迹 */
  border-radius: 0;
  background: rgb(56, 122, 209);
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
.av-bv {
  width: 100%;
  /* height: 300px; */
}
.av-bv-main-area {
  width: 100%;
  height: 300px;
  margin-top: 10px;
  border-bottom: 1px solid rgb(50, 95, 190);
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}
.video-pages {
  height: 300px;
  overflow: auto;
  width: 200px;
}
.video-pages::-webkit-scrollbar {
  width: 2px;
  height: 1px;
}
.video-pages::-webkit-scrollbar-thumb { /* 滚动条中的滑条 */
  border-radius: 0;
  box-shadow: inset 0 0 2px rgba(0,0,0,0.2);
  background: #1d518b;
}
.video-pages::-webkit-scrollbar-track { /* 滚动条轨迹 */
  border-radius: 0;
  background: rgb(56, 122, 209);
}
.video-page {
  color: rgb(53, 206, 185);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  margin-bottom: 5px;
  cursor: pointer;
  width: 200px;
}
.video-page:hover {
  color: rgb(47, 101, 218);
}
.av-bv-download-area {
  height: 300px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  /* align-items: center; */
  /* justify-content: center; */
  width: calc(100% - 200px);
  margin-left: 5px;
}
.av-bv-current-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 200px;
  font-size: 15px;
  color: rgb(48, 104, 207);
  margin: 0 auto;
}
.download-progress {
  margin-top: 10px;
  color: rgb(31, 74, 218);
}
.multi-download {
  margin-top: 10px;
}
.av-bv-select-quality-title {
  cursor: pointer;
}
.av-bv-select-quality-title:hover {
  color: rgb(176, 175, 245);
}
</style>