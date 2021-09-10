<template>
  <transition mode="out-in" name="" appear>
    <div class="func-item-container" @click="goFunc(mainInfo.id)">
      <div class="func-name">
        {{ mainInfo.name }}
      </div>
      <div class="func-description">
        {{ mainInfo.description }}
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  data () {
    return {
      mainInfo: this.mainInfo
    }
  },
  props: ['mainInfo'],
  methods: {
    goFunc(id) {
      if (id = 1) {
        this.$router.push('/fastNote')
      }
    }
  },
  created () {

  }
}
</script>

<style scoped>
.func-item-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 50px;
  line-height: 50px;
  color: var(--normal-text-color);
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}
.func-item-container:hover {
  background-color: var(--funcs-hover-background-color);
  color: var(--funcs-hover-text-color);
}
.func-name {
  width: 50px;
  margin-right: 40px;
  padding-left: 10px;
}
</style>