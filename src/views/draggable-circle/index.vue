<template>
  <div class="dragable-circle-wrapper" />
</template>

<script>
import circleDraggable from '@/utils/circle-dragabble'
export default {
  mounted() {
    this.$nextTick(() => {
      new circleDraggable({
        container: '.dragable-circle-wrapper'
      })
    })
  }
}
</script>

<style lang="scss">
.dragable-circle-wrapper {
  width: 20vw;
  height: 20vw;
  margin: 50px auto;
  canvas {
    background: #666;
    cursor: pointer;
  }
}
</style>
