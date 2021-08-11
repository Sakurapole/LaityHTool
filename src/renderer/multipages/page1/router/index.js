import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  routes: [
    {
      path: '/',
      name: 'index',
      component: () => import('../pages/index.vue'),
      children: [
        {
          path: '/ToDo',
          name: 'ToDo',
          component: () => import('../pages/ToDo.vue')
        },
        {
          path: '/ToDoSetting',
          name: 'ToDoSetting',
          component: () => import('../pages/ToDoSetting.vue')
        },
        {
          path: '/BDownload',
          name: 'BDownload',
          component: () => import('../pages/BDownloader.vue')
        },
        {
          path: '/BDownloadSetting',
          name: 'BDownloadSetting',
          component: () => import('../pages/BDownloaderSetting.vue')
        },
        {
          path: '/Spyders',
          name: 'Spyders',
          component: () => import('../pages/SpyderCenter.vue')
        },
        {
          path: '/SpyderSetting',
          name: 'SpyderSetting',
          component: () => import('../pages/SpyderCenterSetting.vue')
        },
        {
          path: '/NoteList',
          name: 'NoteList',
          component: () => import('../pages/NoteReader.vue')
        },
        {
          path: '/NoteList',
          name: 'NoteList',
          component: () => import('../pages/NoteReaderSetting.vue')
        },
        {
          path: '/DrawingBed',
          name: 'DrawingBed',
          component: () => import('../pages/DrawingBed')
        },
        {
          path: '/DrawingBedHasUpload',
          name: 'DrawingBedHasUpload',
          component: () => import('../pages/DrawingBedHasUpload.vue')
        },
        {
          path: '/DrawingBedSetting',
          name: 'DrawingBedSetting',
          component: () => import('../pages/DrawingBedSetting')
        }
      ]
    },
    {
      path: '*',
      redirect: '/'
    },
    {
      path: '/children/TodoWindow',
      component: () => import('../pages/TodoWindow.vue')
    }
  ]
})
