<template>
  <div class="menu-container">
    <a-menu style="width: 200px; background: rgb(41, 37, 37); height: calc(100vh - 30px);" mode="inline">
      <a-sub-menu key="sub1">
        <span slot="title">
          <span>LaityH ToDo</span>
        </span>
        <a-menu-item key="1" @click="enter">ToDo List</a-menu-item>
        <a-menu-item key="2" @click="enter">ToDo Setting</a-menu-item>
      </a-sub-menu>
      <a-sub-menu key="sub2">
        <span slot="title">
          <span>B Downloader</span>
        </span>
        <a-menu-item key="3" @click="enter">Download</a-menu-item>
        <a-menu-item key="4" @click="enter">Download Setting</a-menu-item> 
      </a-sub-menu>
      <a-sub-menu key="sub3">
        <span slot="title">
          <span>Spyder Center</span>
        </span>
        <a-menu-item key="5" @click="enter">All Spyders</a-menu-item>
        <a-menu-item key="6" @click="enter">Setting</a-menu-item> 
      </a-sub-menu>
      <a-sub-menu key="sub4">
        <span slot="title">
          <span>Note Reader</span>
        </span>
        <a-menu-item key="7" @click="enter">Note List</a-menu-item>
        <a-menu-item key="8" @click="enter">Setting</a-menu-item>
      </a-sub-menu>
      <a-sub-menu key="sub5">
        <span slot="title">
          <span>Drawing Bed</span>
        </span>
        <a-menu-item key="9" @click="enter">Drawing Bed</a-menu-item>
        <a-menu-item key="10" @click="enter">HasUpload</a-menu-item>
        <a-menu-item key="11" @click="enter">Setting</a-menu-item>
      </a-sub-menu>
    </a-menu>
  </div>
</template>

<script>
export default {
  data () {
    return {
    }
  },
  methods: {
    enter (e) {
      // console.log(this.$route)
      // console.log(e.key)
      if (e.key == "1" && this.$route.path != '/ToDo') {
        this.$router.push('/ToDo')
      } else if (e.key == "2" && this.$route.path != '/ToDoSetting') {
        this.$router.push('/ToDoSetting')
      } else if (e.key == "3" && this.$route.path != '/BDownload') {
        this.$router.push('/BDownload')
      } else if (e.key == "4" && this.$route.path != '/BDownloadSetting') {
        this.$router.push('/BDownloadSetting')
      } else if (e.key == "5" && this.$route.path != '/Spyders') {
        this.$router.push('/Spyders')
      } else if (e.key == "6" && this.$route.path != '/SpyderSetting') {
        this.$router.push('/SpyderSetting')
      } else if (e.key == "7" && this.$route.path != '/NoteList') {
        this.$router.push('/NoteList')
      } else if (e.key == "8" && this.$route.path != '/NoteListSetting') {
        this.$router.push('/NoteListSetting')
      } else if (e.key == "9" && this.$route.path != '/DrawingBed') {
        this.$router.push('/DrawingBed')
      } else if (e.key == "10" && this.$route.path != '/DrawingBedHasUpload') {
        this.$router.push('/DrawingBedHasUpload')
      } else if (e.key == "11" && this.$route.path != '/DrawingBedSetting') {
        this.$router.push('/DrawingBedSetting')
      }
    }
  }
}
</script>

<style scoped>
.menu-container {
  height: calc(100vh - 30px);
}
</style>