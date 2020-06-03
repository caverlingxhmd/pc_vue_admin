<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import waterMark from '@/utils/water-mark'
export default {
  name: 'App',
  mounted(){
    this.$nextTick(() => {
      waterMark()
    })
  }
}
</script>
