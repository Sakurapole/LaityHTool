<template>
  <div class="container">
    <FuncItem v-for="item in funcsItem" :key="item.id" :mainInfo="item"></FuncItem>
  </div>
</template>

<script>
export default {
  data () {
    return {
      funcsItem: [
        {
          "id": 1,
          "name": "速记",
          "description": "简单的速记"
        }
      ]
    }
  },
  methods: {
    go() {
      this.$router.push('/fastNote')
    }
  },
  components: {
    FuncItem: () => import('../components/FuncItem.vue')
  }
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  /* justify-content: center;
  align-items: center; */
}
</style>