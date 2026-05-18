
<script setup>
import { computed } from 'vue'
import Cell from './Cell.vue'

const props = defineProps({
  board: { type: Array, required: true },
  cols: { type: Number, required: true },
  status: { type: String, required: true }
})

const emit = defineEmits(['reveal', 'toggle-flag'])

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.cols}, var(--cell-size))`
}))
</script>

<template>
  <div class="board" :style="gridStyle">
    <template v-for="row in board" :key="row?.[0]?.x">
      <Cell
        v-for="cell in row"
        :key="`${cell.x}-${cell.y}`"
        :cell="cell"
        :status="status"
        @reveal="(x,y) => emit('reveal', x, y)"
        @toggle-flag="(x,y) => emit('toggle-flag', x, y)"
      />
    </template>
  </div>
</template>
