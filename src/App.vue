
<script setup>
import { ref } from 'vue'
import Header from './components/Header.vue'
import Board from './components/Board.vue'
import { useMinesweeper } from './composables/useMinesweeper'

const playerName = ref('Peter')
const difficulty = ref('easy')

const difficultyMap = {
  easy:   { rows: 8,  cols: 8,  mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard:   { rows: 16, cols: 30, mines: 99 }
}

const game = useMinesweeper(difficultyMap[difficulty.value])

function applyDifficulty(key) {
  difficulty.value = key
  game.reset(difficultyMap[key])
}

function restart() {
  game.restartSame()
}

function statusText() {
  if (game.status.value === 'won') return '🎉 恭喜你！你贏了！'
  if (game.status.value === 'lost') return '💥 你踩到地雷了！'
  if (game.status.value === 'running') return '🎯 遊戲進行中…'
  return '🟢 準備開始：點任一格開始（第一下保證安全）'
}
</script>

<template>
  <div class="container">
    <div class="app-card">
      <Header
        :playerName="playerName"
        :difficulty="difficulty"
        :mines="game.config.mines"
        :flags="game.flags.value"
        :remainingMines="game.remainingMines.value"
        :elapsed="game.elapsed.value"
        :status="game.status.value"
        @update:playerName="(v) => playerName = v"
        @update:difficulty="applyDifficulty"
        @restart="restart"
      />

      <div class="board-wrap">
        <Board
          :board="game.board.value"
          :cols="game.config.cols"
          :status="game.status.value"
          @reveal="game.reveal"
          @toggle-flag="game.toggleFlag"
        />
      </div>

      <div class="statusbar">
        <div class="msg">
          <span
            class="badge"
            :class="{
              win: game.status.value === 'won',
              lose: game.status.value === 'lost'
            }"
          >
            {{ game.status.value.toUpperCase() }}
          </span>
          <span>{{ statusText() }}</span>
        </div>

        <div class="msg">
          <span class="pill">安全格已翻開：<strong>{{ game.revealedSafe.value }}</strong> / {{ game.totalSafe.value }}</span>
        </div>
      </div>
    </div>

    <p style="margin: 14px 4px 0; color: rgba(231,238,252,.75); font-size: 12px;">
      版本已放在 GitHub：<a :href="'https://github.com/Peter-Atos/minesweeper'" target="_blank" rel="noreferrer">
        點我查看專案
      </a>
    </p>
  </div>
</template>
