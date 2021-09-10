<template>
  <div id="app">
    <FuncTopBar></FuncTopBar>
    <router-view></router-view>
  </div>
</template>

<script>
  const fs = require("fs")
  const path = require("path")

  export default {
    data () {
      return {

      }
    },
    methods: {

    },
    components: {
      FuncTopBar: () => import("./components/FuncTopBar.vue")
    },
    created () {

    }
  }
</script>

<style>
  /* CSS */
  #app {
    height: 100vh;
    background: var(--theme-background-color);
    /* background: url("http://i0.hdslb.com/bfs/album/62f91912d8ef2d36c1e6eb9cde29b13f790041cc.jpg");
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center; */
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
