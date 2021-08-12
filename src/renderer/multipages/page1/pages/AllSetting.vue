<template>
	<div class="setting-container">
		<p class="title">Todo设置</p>
		<ToDoSetting></ToDoSetting>
		<div class="divider"></div>
		<p class="title">BDownloader设置</p>
		<BDownloaderSetting></BDownloaderSetting>
		<div class="divider"></div>
		<p class="title">图床设置</p>
		<DrawingBedSetting></DrawingBedSetting>
	</div>
</template>

<script>
export default {
	data () {
		return {

		}
	},
	methods: {

	},
	created () {

	},
	components: {
		ToDoSetting: () => import('./ToDoSetting'),
		BDownloaderSetting: () => import('./BDownloaderSetting'),
		DrawingBedSetting: () => import('./DrawingBedSetting')
	}
}
</script>

<style scoped>
.setting-container {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: calc(100vh - 30px);
	overflow: auto;
}
.setting-container::-webkit-scrollbar {
  width: 0px;
  height: 1px;
  position: absolute;
  top: 0;
  right: 0;
}
.setting-container::-webkit-scrollbar-thumb { /* 滚动条中的滑条 */
  border-radius: 0;
  box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
  background: #1d518b;
}
.setting-container::-webkit-scrollbar-track { /* 滚动条轨迹 */
  border-radius: 0;
  background: rgb(56, 122, 209);
}
.title {
	font-size: 16px;
	font-weight: bold;
	color: #ccc;
	padding: 5px 5px;
}
.divider {
	width: 100%;
	height: 0;
	border-bottom: 1px solid #ccc;
	margin: 10px 0;
}
</style>