
import { ref, reactive, computed } from 'vue'

function randInt(max) {
  return Math.floor(Math.random() * max)
}

function inBounds(x, y, rows, cols) {
  return x >= 0 && x < rows && y >= 0 && y < cols
}

function neighborsOf(x, y, rows, cols) {
  const result = []
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue
      const nx = x + dx
      const ny = y + dy
      if (inBounds(nx, ny, rows, cols)) result.push([nx, ny])
    }
  }
  return result
}

function createEmptyBoard(rows, cols) {
  const b = []
  for (let x = 0; x < rows; x++) {
    const row = []
    for (let y = 0; y < cols; y++) {
      row.push({
        x,
        y,
        isMine: false,
        revealed: false,
        flagged: false,
        count: 0,
        exploded: false
      })
    }
    b.push(row)
  }
  return b
}

function placeMines(board, rows, cols, mines, avoidX = null, avoidY = null) {
  let placed = 0
  while (placed < mines) {
    const x = randInt(rows)
    const y = randInt(cols)
    if (avoidX !== null && x === avoidX && y === avoidY) continue
    const cell = board[x][y]
    if (cell.isMine) continue
    cell.isMine = true
    placed++
  }
}

function computeCounts(board, rows, cols) {
  for (let x = 0; x < rows; x++) {
    for (let y = 0; y < cols; y++) {
      const cell = board[x][y]
      if (cell.isMine) {
        cell.count = 0
        continue
      }
      const ns = neighborsOf(x, y, rows, cols)
      let c = 0
      for (const [nx, ny] of ns) {
        if (board[nx][ny].isMine) c++
      }
      cell.count = c
    }
  }
}

function revealAllMines(board, rows, cols) {
  for (let x = 0; x < rows; x++) {
    for (let y = 0; y < cols; y++) {
      const cell = board[x][y]
      if (cell.isMine) cell.revealed = true
    }
  }
}

function floodReveal(board, rows, cols, startX, startY) {
  const stack = [[startX, startY]]
  let revealedSafe = 0

  while (stack.length) {
    const [x, y] = stack.pop()
    const cell = board[x][y]
    if (cell.revealed || cell.flagged) continue
    if (cell.isMine) continue

    cell.revealed = true
    revealedSafe++

    if (cell.count === 0) {
      const ns = neighborsOf(x, y, rows, cols)
      for (const [nx, ny] of ns) {
        const ncell = board[nx][ny]
        if (!ncell.revealed && !ncell.flagged && !ncell.isMine) {
          stack.push([nx, ny])
        }
      }
    }
  }

  return revealedSafe
}

export function useMinesweeper(initial) {
  const config = reactive({
    rows: initial?.rows ?? 8,
    cols: initial?.cols ?? 8,
    mines: initial?.mines ?? 10
  })

  const board = ref(createEmptyBoard(config.rows, config.cols))
  const status = ref('ready') // ready | running | won | lost
  const flags = ref(0)
  const revealedSafe = ref(0)
  const elapsed = ref(0)

  let timerId = null
  let startedAt = 0

  const totalSafe = computed(() => config.rows * config.cols - config.mines)
  const remainingMines = computed(() => Math.max(0, config.mines - flags.value))

  function stopTimer() {
    if (timerId) clearInterval(timerId)
    timerId = null
  }

  function startTimer() {
    stopTimer()
    startedAt = Date.now()
    timerId = setInterval(() => {
      elapsed.value = Math.floor((Date.now() - startedAt) / 1000)
    }, 250)
  }

  function reset(nextConfig) {
    stopTimer()
    elapsed.value = 0
    status.value = 'ready'
    flags.value = 0
    revealedSafe.value = 0

    if (nextConfig) {
      config.rows = nextConfig.rows
      config.cols = nextConfig.cols
      config.mines = nextConfig.mines
    }

    board.value = createEmptyBoard(config.rows, config.cols)
    placeMines(board.value, config.rows, config.cols, config.mines)
    computeCounts(board.value, config.rows, config.cols)
  }

  // 初始化一次
  reset()

  function toggleFlag(x, y) {
    if (status.value === 'won' || status.value === 'lost') return
    const cell = board.value[x][y]
    if (cell.revealed) return

    if (cell.flagged) {
      cell.flagged = false
      flags.value = Math.max(0, flags.value - 1)
      return
    }

    if (flags.value >= config.mines) return
    cell.flagged = true
    flags.value++
  }

  function ensureFirstClickSafe(x, y) {
    const cell = board.value[x][y]
    if (!cell.isMine) return

    // 把 (x,y) 的地雷移走：找一個非雷的格子換過去
    cell.isMine = false
    outer:
    for (let i = 0; i < config.rows; i++) {
      for (let j = 0; j < config.cols; j++) {
        const c = board.value[i][j]
        if (!c.isMine && (i !== x || j !== y)) {
          c.isMine = true
          break outer
        }
      }
    }
    computeCounts(board.value, config.rows, config.cols)
  }

  function checkWin() {
    if (revealedSafe.value >= totalSafe.value) {
      status.value = 'won'
      stopTimer()
      // 可選：自動顯示地雷（不影響勝利）
      revealAllMines(board.value, config.rows, config.cols)
    }
  }

  function reveal(x, y) {
    if (status.value === 'won' || status.value === 'lost') return
    const cell = board.value[x][y]
    if (cell.revealed || cell.flagged) return

    if (status.value === 'ready') {
      ensureFirstClickSafe(x, y)
      status.value = 'running'
      startTimer()
    }

    // 如果踩到雷
    if (cell.isMine) {
      cell.revealed = true
      cell.exploded = true
      revealAllMines(board.value, config.rows, config.cols)
      status.value = 'lost'
      stopTimer()
      return
    }

    // 安全格 → 展開
    const inc = floodReveal(board.value, config.rows, config.cols, x, y)
    revealedSafe.value += inc
    checkWin()
  }

  function restartSame() {
    reset({ rows: config.rows, cols: config.cols, mines: config.mines })
  }

  return {
    config,
    board,
    status,
    flags,
    revealedSafe,
    totalSafe,
    remainingMines,
    elapsed,
    reset,
    restartSame,
    reveal,
    toggleFlag
  }
}
