
<script setup>
const props = defineProps({
  playerName: { type: String, required: true },
  difficulty: { type: String, required: true },
  mines: { type: Number, required: true },
  flags: { type: Number, required: true },
  remainingMines: { type: Number, required: true },
  elapsed: { type: Number, required: true },
  status: { type: String, required: true }
})

const emit = defineEmits(['update:playerName', 'update:difficulty', 'restart'])

function onNameInput(e) {
  emit('update:playerName', e.target.value)
}

function onDifficultyChange(e) {
  emit('update:difficulty', e.target.value)
}
</script>

<template>
  <div class="topbar">
    <div class="brand">
      <h1>🎮 {{ playerName }} 的踩地雷</h1>
      <p>左鍵翻開、右鍵插旗（觸控板兩指點）。第一次點擊保證不會踩到地雷。</p>
    </div>

    <div class="controls">
      <div class="field">
        <label>玩家</label>
        <input :value="playerName" @input="onNameInput" placeholder="輸入名字" />
      </div>

      <div class="field">
        <label>難度</label>
        <select :value="difficulty" @change="onDifficultyChange">
          <option value="easy">簡單 8x8 / 10</option>
          <option value="medium">中等 16x16 / 40</option>
          <option value="hard">困難 16x30 / 99</option>
        </select>
      </div>

      <div class="pills">
        <div class="pill">💣 剩餘：<strong>{{ remainingMines }}</strong></div>
        <div class="pill">🚩 插旗：<strong>{{ flags }}</strong></div>
        <div class="pill">⏱️ 秒數：<strong>{{ elapsed }}</strong></div>
      </div>

      <div class="actions">
        <button class="btn secondary" @click="emit('restart')">🔄 重新開始</button>
        <button v-if="status==='lost'" class="btn danger" @click="emit('restart')">再來一局</button>
        <button v-if="status==='won'" class="btn" @click="emit('restart')">🎉 再玩一次</button>
      </div>
    </div>
  </div>
</template>
