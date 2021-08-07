<template>
  <div class="container">
    <IndexMenu></IndexMenu>
    <router-view></router-view>
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
  components: {
    IndexMenu: () => import('../components/IndexMenu')
  }
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}
</style>