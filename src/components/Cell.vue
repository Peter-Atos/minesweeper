
<script setup>
import { computed } from 'vue'

const props = defineProps({
  cell: { type: Object, required: true },
  status: { type: String, required: true }
})

const emit = defineEmits(['reveal', 'toggle-flag'])

function onLeftClick() {
  emit('reveal', props.cell.x, props.cell.y)
}

function onRightClick(e) {
  e.preventDefault()
  emit('toggle-flag', props.cell.x, props.cell.y)
}

const classes = computed(() => {
  const c = props.cell
  return [
    'cell',
    c.revealed ? 'revealed' : '',
    c.flagged ? 'flagged' : '',
    c.isMine ? 'mine' : '',
    c.exploded ? 'exploded' : '',
    c.revealed && !c.isMine && c.count > 0 ? `num-${Math.min(8, c.count)}` : ''
  ].filter(Boolean).join(' ')
})

const label = computed(() => {
  const c = props.cell
  if (c.flagged && !c.revealed) return '🚩'
  if (!c.revealed) return ''
  if (c.isMine) return '💣'
  if (c.count > 0) return String(c.count)
  return ''
})
</script>

<template>
  <button
    type="button"
    :class="classes"
    @click="onLeftClick"
    @contextmenu="onRightClick"
    :disabled="status === 'won' || status === 'lost'"
    :aria-label="`cell-${cell.x}-${cell.y}`"
  >
    {{ label }}
  </button>
</template>
