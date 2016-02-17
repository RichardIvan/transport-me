<template>
  <div class="app">
    <component-a></component-a>
    <component-b></component-b>
  </div>
</template>

<script>
import ComponentA from './ComponentA.vue'
import ComponentB from './ComponentB.vue'

export default {
  components: {
    ComponentA,
    ComponentB
  }
}
</script>