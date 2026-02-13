'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'

import { Heart, RefreshCw, Play, Trophy, Skull, Eye, Pause, Settings, Save, X, Volume2, VolumeX, Zap } from 'lucide-react'
import { soundManager } from '@/lib/sound'

// 单词库 - 英文单词及其提示
const WORDS: { word: string; hint: string }[] = [
  { word: 'APPLE', hint: 'A red or green fruit' },
  { word: 'BEACH', hint: 'Sandy shore by the sea' },
  { word: 'CLOUD', hint: 'White fluffy thing in the sky' },
  { word: 'DANCE', hint: 'Moving your body to music' },
  { word: 'EAGLE', hint: 'A large bird of prey' },
  { word: 'FLAME', hint: 'Hot burning fire' },
  { word: 'GRAPE', hint: 'Small purple or green fruit' },
  { word: 'HOUSE', hint: 'A building where people live' },
  { word: 'IMAGE', hint: 'A picture or representation' },
  { word: 'JUICE', hint: 'Liquid from fruits' },
  { word: 'KNIFE', hint: 'Tool for cutting' },
  { word: 'LEMON', hint: 'Sour yellow citrus fruit' },
  { word: 'MOUSE', hint: 'Small rodent or computer device' },
  { word: 'NIGHT', hint: 'Time when it is dark' },
  { word: 'OCEAN', hint: 'Large body of salt water' },
  { word: 'PIANO', hint: 'Musical instrument with keys' },
  { word: 'QUEEN', hint: 'Female royal ruler' },
  { word: 'RIVER', hint: 'Flowing body of fresh water' },
  { word: 'SNAKE', hint: 'Long legless reptile' },
  { word: 'TIGER', hint: 'Large striped cat' },
  { word: 'UMBRELLA', hint: 'Protection from rain' },
  { word: 'VOICE', hint: 'Sound from speaking' },
  { word: 'WATER', hint: 'Essential liquid for life' },
  { word: 'WORLD', hint: 'The planet we live on' },
  { word: 'ZEBRA', hint: 'Black and white striped animal' },
  { word: 'BREAD', hint: 'Baked food from flour' },
  { word: 'CHAIR', hint: 'Furniture for sitting' },
  { word: 'DREAM', hint: 'Images during sleep' },
  { word: 'FRUIT', hint: 'Plant product with seeds' },
  { word: 'GHOST', hint: 'Spirit of a dead person' },
  { word: 'HAPPY', hint: 'Feeling of joy' },
  { word: 'LIGHT', hint: 'Brightness from sun or lamp' },
  { word: 'MUSIC', hint: 'Sounds arranged harmoniously' },
  { word: 'POWER', hint: 'Ability to do or act' },
  { word: 'SPACE', hint: 'Area beyond Earth\'s atmosphere' },
  { word: 'STORM', hint: 'Violent weather condition' },
  { word: 'TRAIN', hint: 'Rail transport vehicle' },
  { word: 'WINDY', hint: 'Breezy weather' },
]

type Direction = { x: number; y: number }
type Position = { x: number; y: number }
type Food = { position: Position; letter: string; isCorrect: boolean }
type GameStatus = 'idle' | 'ready' | 'playing' | 'paused' | 'won' | 'lost'

const GRID_SIZE = 30
const CELL_SIZE = 16
const INITIAL_SPEED = 200

const COMBO_WINDOW = 4000 // 4 seconds to keep combo
const COMBO_MULTIPLIER = 5

type Particle = {
  id: number
  x: number
  y: number
  color: string
  vx: number
  vy: number
  life: number
}
export default function SnakeWordGame() {
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle')
  const [highScore, setHighScore] = useState(0)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [customWordsInput, setCustomWordsInput] = useState('')
  const [useCustomWords, setUseCustomWords] = useState(false)
  const [customWordsList, setCustomWordsList] = useState<{ word: string; hint: string }[]>([])
  const [currentWord, setCurrentWord] = useState('')
  const [currentHint, setCurrentHint] = useState('')
  const [revealedLetters, setRevealedLetters] = useState<Set<number>>(new Set())
  const [snake, setSnake] = useState<Position[]>([])
  const [direction, setDirection] = useState<Direction>({ x: 1, y: 0 })
  const [nextDirection, setNextDirection] = useState<Direction>({ x: 1, y: 0 })
  const [foods, setFoods] = useState<Food[]>([])
  const [lives, setLives] = useState(2)
  const [score, setScore] = useState(0)
  const [wrongLetters, setWrongLetters] = useState<string[]>([])
  const [message, setMessage] = useState('')

  // New State for Features
  const [isMuted, setIsMuted] = useState(false)
  const [comboCount, setComboCount] = useState(0)
  const [lastEatTime, setLastEatTime] = useState(0)
  const [particles, setParticles] = useState<Particle[]>([])
  const [isShaking, setIsShaking] = useState(false)

  // Wrong words tracking
  const [wrongWordStats, setWrongWordStats] = useState<{ [key: string]: number }>({})

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const directionRef = useRef(direction)
  const touchStartRef = useRef<{ x: number, y: number } | null>(null)
  const scoreRef = useRef(score) // Ref for score to access in game loop if needed, though we use setScore callback

  // 更新方向引用
  useEffect(() => {
    directionRef.current = direction
  }, [direction])

  // Load high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem('snakeWordHighScore')
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10))
    }
  }, [])

  // Update high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('snakeWordHighScore', score.toString())
    }
  }, [score, highScore])

  // Load custom words settings
  useEffect(() => {
    const savedCustomWords = localStorage.getItem('snakeWordCustomWords')
    const savedUseCustom = localStorage.getItem('snakeWordUseCustom') === 'true'

    if (savedCustomWords) {
      try {
        const parsed = JSON.parse(savedCustomWords)
        setCustomWordsList(parsed)
        setCustomWordsInput(JSON.stringify(parsed, null, 2))
      } catch (e) {
        console.error('Failed to parse saved custom words', e)
      }
    } else {
      setCustomWordsInput('[\n  { "word": "HELLO", "hint": "A greeting" },\n  { "word": "WORLD", "hint": "The planet" }\n]')
    }
    setUseCustomWords(savedUseCustom)

    setUseCustomWords(savedUseCustom)

    // Load wrong word stats
    const savedStats = localStorage.getItem('snakeWordWrongStats')
    if (savedStats) {
      try {
        setWrongWordStats(JSON.parse(savedStats))
      } catch (e) {
        console.error('Failed to parse wrong stats', e)
      }
    }
  }, [])

  // Save wrong word stats
  const recordWrongWord = (word: string) => {
    setWrongWordStats(prev => {
      const newStats = { ...prev, [word]: (prev[word] || 0) + 1 }
      localStorage.setItem('snakeWordWrongStats', JSON.stringify(newStats))
      return newStats
    })
  }

  const toggleMute = () => {
    const muted = soundManager.toggleMute()
    setIsMuted(muted)
  }

  // Particle System Loop
  useEffect(() => {
    if (particles.length === 0) return

    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        life: p.life - 0.1
      })).filter(p => p.life > 0))
    }, 50)

    return () => clearInterval(interval)
  }, [particles.length])

  const spawnParticles = (x: number, y: number, color: string) => {
    const newParticles: Particle[] = []
    for (let i = 0; i < 8; i++) {
      newParticles.push({
        id: Math.random(),
        x,
        y,
        color,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        life: 1.0
      })
    }
    setParticles(prev => [...prev, ...newParticles])
  }

  const triggerShake = () => {
    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 500)
  }

  const saveSettings = () => {
    let validWords: { word: string; hint: string }[] = []

    // 尝试解析 JSON
    try {
      const trimmedInput = customWordsInput.trim()
      if (trimmedInput.startsWith('[') || trimmedInput.startsWith('{')) {
        const parsed = JSON.parse(trimmedInput)
        if (!Array.isArray(parsed)) throw new Error('Must be an array')

        validWords = parsed.filter((item: any) =>
          item.word && typeof item.word === 'string' &&
          item.hint && typeof item.hint === 'string'
        ).map((item: any) => ({
          word: item.word.toUpperCase().replace(/[^A-Z]/g, ''),
          hint: item.hint
        }))
      } else {
        // 尝试解析文本格式 (单词 + 空白字符 + 提示)
        const lines = trimmedInput.split('\n')
        validWords = lines.map(line => {
          const match = line.trim().match(/^([a-zA-Z]+)[\s\t]+(.+)$/)
          if (match) {
            return {
              word: match[1].toUpperCase(),
              hint: match[2].trim()
            }
          }
          return null
        }).filter((item): item is { word: string; hint: string } => item !== null)
      }

      validWords = validWords.filter(item => item.word.length > 0)

      if (validWords.length === 0) {
        alert('没有识别到有效的单词！\n请检查格式是否正确。支持 JSON 或 "单词+空格+提示" 的文本格式。')
        return
      }

      setCustomWordsList(validWords)
      // Save as JSON for internal consistency
      setCustomWordsInput(JSON.stringify(validWords, null, 2))
      localStorage.setItem('snakeWordCustomWords', JSON.stringify(validWords))
      localStorage.setItem('snakeWordUseCustom', useCustomWords.toString())
      setIsSettingsOpen(false)

      setMessage(`成功导入 ${validWords.length} 个单词，下一局生效`)
    } catch (e) {
      alert('格式错误！\nJSON示例: [{"word": "APPLE", "hint": "Fruit"}]\n文本示例: APPLE A red fruit')
    }
  }

  const selectWord = useCallback(() => {
    const sourceList = (useCustomWords && customWordsList.length > 0) ? customWordsList : WORDS

    // Weighted random selection based on wrong stats
    let randomWord
    if (!useCustomWords && Object.keys(wrongWordStats).length > 0 && Math.random() < 0.5) {
      // 50% chance to pick a harder word if available
      const wrongCandidates = sourceList.filter(w => (wrongWordStats[w.word] || 0) > 0)
      if (wrongCandidates.length > 0) {
        randomWord = wrongCandidates[Math.floor(Math.random() * wrongCandidates.length)]
      } else {
        randomWord = sourceList[Math.floor(Math.random() * sourceList.length)]
      }
    } else {
      randomWord = sourceList[Math.floor(Math.random() * sourceList.length)]
    }

    if (!randomWord) randomWord = sourceList[Math.floor(Math.random() * sourceList.length)]

    const word = randomWord.word
    setCurrentWord(word)
    setCurrentHint(randomWord.hint)

    // 根据长度决定显示的字母数量
    const lettersToReveal = word.length >= 7 ? 2 : 1
    const newRevealed = new Set<number>()

    // 随机选择要显示的字母位置
    const availablePositions = word.split('').map((_, i) => i)
    for (let i = 0; i < lettersToReveal && availablePositions.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availablePositions.length)
      newRevealed.add(availablePositions[randomIndex])
      availablePositions.splice(randomIndex, 1)
    }

    setRevealedLetters(newRevealed)
    return word
  }, [useCustomWords, customWordsList])

  // 准备游戏 - 选择单词但不开始
  const prepareGame = useCallback((keepScore = false) => {
    const word = selectWord()
    const startX = Math.floor(GRID_SIZE / 2)
    const startY = Math.floor(GRID_SIZE / 2)

    // 蛇身初始长度等于单词长度
    const initialSnake: Position[] = []
    for (let i = 0; i < word.length; i++) {
      initialSnake.push({ x: startX - i, y: startY })
    }
    setSnake(initialSnake)

    setDirection({ x: 1, y: 0 })
    setNextDirection({ x: 1, y: 0 })
    setLives(2)

    // 如果不是保留分数（下一关），则重置分数
    if (typeof keepScore !== 'boolean' || !keepScore) {
      setScore(0)
    }

    setWrongLetters([])
    setFoods([])
    setMessage('')
    setComboCount(0)
    setLastEatTime(0)
    setGameStatus('ready')
  }, [selectWord])

  // 开始游戏 - 启动游戏循环
  const startGame = useCallback(() => {
    setGameStatus('playing')
  }, [])

  // 暂停/继续游戏
  const togglePause = useCallback(() => {
    if (gameStatus === 'playing') {
      setGameStatus('paused')
    } else if (gameStatus === 'paused') {
      setGameStatus('playing')
    }
  }, [gameStatus])

  // 初始化游戏（重新开始）
  const initGame = useCallback(() => {
    prepareGame()
  }, [prepareGame])

  // 生成多个食物字母
  const generateFoods = useCallback((currentSnake: Position[], word: string, revealed: Set<number>) => {
    const wordArray = word.split('')
    // 找出所有还未被揭示的字母
    const missingIndices = wordArray
      .map((letter, index) => ({ letter, index }))
      .filter(({ index }) => !revealed.has(index))

    if (missingIndices.length === 0) return []

    const newFoods: Food[] = []
    const occupiedPositions = [...currentSnake]

    // 生成正确字母（至少2个）
    const correctCount = Math.min(2, missingIndices.length)
    for (let i = 0; i < correctCount; i++) {
      const letter = missingIndices[i].letter
      let position: Position
      let attempts = 0
      do {
        position = {
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE)
        }
        attempts++
      } while (
        (occupiedPositions.some(p => p.x === position.x && p.y === position.y) ||
          newFoods.some(f => f.position.x === position.x && f.position.y === position.y)) &&
        attempts < 100
      )

      newFoods.push({ position, letter, isCorrect: true })
    }

    // 至少生成1个错误字母作为干扰
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(l => !word.includes(l))
    let wrongLetter = alphabet[Math.floor(Math.random() * alphabet.length)]
    let position: Position
    let attempts = 0
    do {
      position = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      }
      attempts++
    } while (
      (occupiedPositions.some(p => p.x === position.x && p.y === position.y) ||
        newFoods.some(f => f.position.x === position.x && f.position.y === position.y)) &&
      attempts < 100
    )

    newFoods.push({ position, letter: wrongLetter, isCorrect: false })

    // 如果还有空间，再随机生成0-1个额外错误字母
    if (missingIndices.length > 2 && Math.random() < 0.3) {
      const extraWrongLetter = alphabet[Math.floor(Math.random() * alphabet.length)]
      let extraPosition: Position
      let extraAttempts = 0
      do {
        extraPosition = {
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE)
        }
        extraAttempts++
      } while (
        (occupiedPositions.some(p => p.x === extraPosition.x && p.y === extraPosition.y) ||
          newFoods.some(f => f.position.x === extraPosition.x && f.position.y === extraPosition.y)) &&
        extraAttempts < 100
      )

      newFoods.push({ position: extraPosition, letter: extraWrongLetter, isCorrect: false })
    }

    return newFoods
  }, [])

  // 游戏主循环
  const gameLoop = useCallback(() => {
    setSnake(prevSnake => {
      const head = prevSnake[0]
      const dir = directionRef.current
      const newHead = { x: head.x + dir.x, y: head.y + dir.y }

      // 检查是否撞墙
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        setGameStatus('lost')
        setMessage('撞到墙壁了！')
        soundManager.play('lose')
        triggerShake()
        recordWrongWord(currentWord)
        return prevSnake
      }

      // 检查是否撞到自己
      if (prevSnake.some(s => s.x === newHead.x && s.y === newHead.y)) {
        setGameStatus('lost')
        setMessage('撞到自己了！')
        soundManager.play('lose')
        triggerShake()
        recordWrongWord(currentWord)
        return prevSnake
      }

      const newSnake = [newHead, ...prevSnake.slice(0, -1)]

      // 检查是否吃到食物
      const eatenFoodIndex = foods.findIndex(
        f => f.position.x === newHead.x && f.position.y === newHead.y
      )

      if (eatenFoodIndex !== -1) {
        const eatenFood = foods[eatenFoodIndex]
        const newFoods = foods.filter((_, i) => i !== eatenFoodIndex)

        if (eatenFood.isCorrect) {
          // 正确字母
          const wordArray = currentWord.split('')
          const firstMissingIndex = wordArray.findIndex((letter, index) => !revealedLetters.has(index))

          if (firstMissingIndex !== -1 && wordArray[firstMissingIndex] === eatenFood.letter) {
            const newRevealed = new Set(revealedLetters)
            newRevealed.add(firstMissingIndex)
            setRevealedLetters(newRevealed)

            // Combo Logic
            const now = Date.now()
            let scoreToAdd = 10
            let newCombo = 0

            if (now - lastEatTime < COMBO_WINDOW && lastEatTime > 0) {
              newCombo = comboCount + 1
              scoreToAdd += (newCombo * COMBO_MULTIPLIER)
              soundManager.play('combo')
            } else {
              soundManager.play('eat')
            }

            setComboCount(newCombo)
            setLastEatTime(now)
            setScore(prev => prev + scoreToAdd)
            spawnParticles(newHead.x, newHead.y, '#10b981') // emerald-500

            // 检查是否完成单词
            if (newRevealed.size === currentWord.length) {
              setGameStatus('won')
              setMessage('恭喜！你完成了单词！')
              soundManager.play('win')
            } else {
              // 重新生成食物
              const regeneratedFoods = generateFoods(newSnake, currentWord, newRevealed)
              setFoods(regeneratedFoods)
            }
          } else {
            // 字母正确但不是当前位置需要的
            handleWrongEat(eatenFood, newFoods)
          }
        } else {
          // 错误字母
          handleWrongEat(eatenFood, newFoods)
        }

        return newSnake
      }
      return newSnake
    })
  }, [currentWord, revealedLetters, foods, lives, generateFoods, comboCount, lastEatTime]) // Added dependecies

  const handleWrongEat = (eatenFood: Food, newFoods: Food[]) => {
    setLives(prev => prev - 1)
    setWrongLetters(prev => [...prev, eatenFood.letter])
    setFoods(newFoods)
    setComboCount(0) // Reset combo
    soundManager.play('wrong')
    triggerShake()

    if (lives <= 1) {
      setGameStatus('lost')
      setMessage('生命耗尽！')
      soundManager.play('lose')
      recordWrongWord(currentWord)
    }
  }

  // 启动游戏循环
  useEffect(() => {
    if (gameStatus === 'playing') {
      gameLoopRef.current = setInterval(gameLoop, INITIAL_SPEED)
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }
  }, [gameStatus, gameLoop])

  // 初始生成食物
  useEffect(() => {
    if (gameStatus === 'playing' && snake.length > 0 && foods.length === 0) {
      const newFoods = generateFoods(snake, currentWord, revealedLetters)
      setFoods(newFoods)
    }
  }, [gameStatus, snake, currentWord, revealedLetters, foods.length, generateFoods])

  // 键盘控制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 暂停/继续
      if (e.key.toLowerCase() === 'p') {
        e.preventDefault()
        if (gameStatus === 'playing' || gameStatus === 'paused') {
          togglePause()
        }
        return
      }

      // 方向控制
      if (gameStatus !== 'playing') return

      switch (e.key) {
        case 'ArrowUp':
          if (directionRef.current.y === 0) {
            setNextDirection({ x: 0, y: -1 })
          }
          break
        case 'ArrowDown':
          if (directionRef.current.y === 0) {
            setNextDirection({ x: 0, y: 1 })
          }
          break
        case 'ArrowLeft':
          if (directionRef.current.x === 0) {
            setNextDirection({ x: -1, y: 0 })
          }
          break
        case 'ArrowRight':
          if (directionRef.current.x === 0) {
            setNextDirection({ x: 1, y: 0 })
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameStatus, togglePause])

  // Touch Swipe Controls
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || gameStatus !== 'playing') return

      const touchEnd = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY
      }

      const diffX = touchEnd.x - touchStartRef.current.x
      const diffY = touchEnd.y - touchStartRef.current.y
      const absX = Math.abs(diffX)
      const absY = Math.abs(diffY)

      if (Math.max(absX, absY) > 30) { // Threshold
        if (absX > absY) {
          // Horizontal
          if (diffX > 0 && directionRef.current.x === 0) setNextDirection({ x: 1, y: 0 })
          else if (diffX < 0 && directionRef.current.x === 0) setNextDirection({ x: -1, y: 0 })
        } else {
          // Vertical
          if (diffY > 0 && directionRef.current.y === 0) setNextDirection({ x: 0, y: 1 })
          else if (diffY < 0 && directionRef.current.y === 0) setNextDirection({ x: 0, y: -1 })
        }
      }

      touchStartRef.current = null
    }

    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [gameStatus])

  // 更新方向
  useEffect(() => {
    setDirection(nextDirection)
  }, [nextDirection])

  // 获取蛇身每个位置的字母显示
  const getLetterAtPosition = (index: number) => {
    if (revealedLetters.has(index)) {
      return currentWord[index]
    }
    return ''
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm relative">
        <div className="container mx-auto px-4 py-4 flex items-center justify-center relative">
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            🐍 贪吃蛇猜单词
          </h1>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-600"
            onClick={() => setIsSettingsOpen(true)}
            title="设置单词库"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col items-center justify-center p-4 min-h-[calc(100vh-80px)] ${isShaking ? 'animate-shake' : ''}`}>
        {/* Game Container */}
        <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-w-fit mx-auto touch-none select-none">

          {/* Game HUD (Header) */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-5 border-b border-slate-200 dark:border-slate-800 space-y-4">
            {/* Top Stats Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2" title="生命值">
                  <div className="bg-red-100 dark:bg-red-900/20 p-1.5 rounded-full">
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  </div>
                  <span className="font-bold text-lg text-slate-700 dark:text-slate-200">{lives}</span>
                </div>
                <div className="flex items-center gap-2" title="得分">
                  <div className="bg-amber-100 dark:bg-amber-900/20 p-1.5 rounded-full">
                    <Trophy className="w-4 h-4 text-amber-500 fill-amber-500" />
                  </div>
                  <span className="font-bold text-lg text-slate-700 dark:text-slate-200">{score}</span>
                </div>

                <div className="flex items-center gap-2" title="最高分">
                  <div className="bg-purple-100 dark:bg-purple-900/20 p-1.5 rounded-full">
                    <Trophy className="w-4 h-4 text-purple-500 fill-purple-500" />
                  </div>
                  <span className="font-bold text-lg text-slate-700 dark:text-slate-200">{highScore}</span>
                </div>
              </div>

              {/* Combo Indicator */}
              {comboCount > 0 && (
                <div className="absolute top-16 right-6 animate-bounce">
                  <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full shadow-lg transform rotate-6 border-2 border-white">
                    <Zap className="w-4 h-4 fill-white" />
                    <span className="font-black italic">COMBO x{comboCount}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">字母数</span>
              <span className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-sm font-bold text-slate-700 dark:text-slate-200 min-w-[2rem] text-center">
                {currentWord.length}
              </span>
            </div>
          </div>

          {/* Word & Hint Section */}
          <div className="flex flex-col items-center gap-3">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              {currentHint ? `${currentHint}` : '准备开始...'}
            </div>

            <div className="flex justify-center gap-1.5 flex-wrap">
              {currentWord ? (
                currentWord.split('').map((letter, index) => (
                  <div
                    key={index}
                    className={`w-9 h-9 flex items-center justify-center text-lg font-bold rounded shadow-sm border-b-4 transition-all duration-300 ${revealedLetters.has(index)
                      ? 'bg-emerald-500 border-emerald-700 text-white transform translate-y-0'
                      : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-transparent'
                      }`}
                  >
                    {revealedLetters.has(index) ? letter : ''}
                  </div>
                ))
              ) : (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 opacity-50" />
                ))
              )}
            </div>
          </div>


          {/* Game Board */}
          <div className="relative bg-slate-100 dark:bg-slate-950">
            <div
              className="relative mx-auto shadow-inner"
              style={{
                width: GRID_SIZE * CELL_SIZE,
                height: GRID_SIZE * CELL_SIZE,
                backgroundImage: `
                  linear-gradient(to right, rgba(148, 163, 184, 0.1) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(148, 163, 184, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`
              }}
            >
              {/* Snake */}
              {snake.map((segment, index) => (
                <div
                  key={`snake-${index}`}
                  className={`absolute flex items-center justify-center text-[10px] font-bold rounded-sm transition-all duration-100 shadow-sm ${index === 0
                    ? 'bg-emerald-600 text-white z-10'
                    : 'bg-emerald-500/90 text-white z-0'
                    }`}
                  style={{
                    left: segment.x * CELL_SIZE,
                    top: segment.y * CELL_SIZE,
                    width: CELL_SIZE - 1,
                    height: CELL_SIZE - 1,
                    margin: 0.5
                  }}
                >
                  {getLetterAtPosition(index)}
                </div>
              ))}

              {/* Foods */}
              {foods.map((food, index) => (
                <div
                  key={`food-${index}`}
                  className="absolute flex items-center justify-center text-[10px] font-bold rounded-sm animate-pulse bg-red-500 text-white shadow-sm z-20"
                  style={{
                    left: food.position.x * CELL_SIZE,
                    top: food.position.y * CELL_SIZE,
                    width: CELL_SIZE - 2,
                    height: CELL_SIZE - 2,
                    margin: 1
                  }}
                >
                  {food.letter}
                </div>
              ))}

              {/* Particles */}
              {particles.map(p => (
                <div
                  key={p.id}
                  className="absolute rounded-full"
                  style={{
                    left: p.x * CELL_SIZE + CELL_SIZE / 2,
                    top: p.y * CELL_SIZE + CELL_SIZE / 2,
                    width: 6,
                    height: 6,
                    backgroundColor: p.color,
                    opacity: p.life,
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none'
                  }}
                />
              ))}

              {/* Overlays */}
              {gameStatus !== 'playing' && (
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-30">

                  {/* Idle/Welcome */}
                  {gameStatus === 'idle' && (
                    <div className="text-center text-white animate-in zoom-in duration-300">
                      <div className="bg-white/10 dark:bg-black/20 p-4 rounded-full inline-block mb-4 backdrop-blur-sm">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2 drop-shadow-md">准备开始</h3>
                      <p className="text-white/80 text-sm mb-6">方向键移动 • P 键暂停</p>
                      <Button onClick={() => prepareGame(false)} size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition-all">
                        查看单词
                      </Button>
                    </div>
                  )}

                  {/* Ready */}
                  {gameStatus === 'ready' && (
                    <div className="text-center text-white max-w-xs animate-in zoom-in duration-300">
                      <div className="bg-blue-500/20 p-4 rounded-full inline-block mb-4 backdrop-blur-sm">
                        <Eye className="h-12 w-12 text-blue-400" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">记忆时间</h3>
                      <p className="text-white/80 text-sm mb-6 leading-relaxed">
                        记住上方提示和已有字母<br />填完单词即获胜
                      </p>
                      <Button onClick={startGame} size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition-all w-full">
                        开始游戏
                      </Button>
                    </div>
                  )}

                  {/* Paused */}
                  {gameStatus === 'paused' && (
                    <div className="text-center text-white animate-in zoom-in duration-300">
                      <div className="bg-yellow-500/20 p-4 rounded-full inline-block mb-4 backdrop-blur-sm">
                        <Pause className="h-12 w-12 text-yellow-400" />
                      </div>
                      <h3 className="text-2xl font-bold mb-6">已暂停</h3>
                      <Button onClick={togglePause} size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition-all">
                        继续游戏
                      </Button>
                    </div>
                  )}

                  {/* Won */}
                  {gameStatus === 'won' && (
                    <div className="text-center text-white animate-in zoom-in duration-300">
                      <div className="bg-yellow-500/20 p-4 rounded-full inline-block mb-4 backdrop-blur-sm">
                        <Trophy className="h-12 w-12 text-yellow-400" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">恭喜胜利!</h3>
                      <div className="bg-white/10 rounded-lg p-3 mb-6 backdrop-blur-sm">
                        <p className="text-lg font-mono font-bold tracking-widest">{currentWord}</p>
                        <p className="text-sm text-yellow-300 mt-1">得分: {score}</p>
                      </div>
                      <Button onClick={() => prepareGame(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition-all">
                        下一关
                      </Button>
                    </div>
                  )}

                  {/* Lost */}
                  {gameStatus === 'lost' && (
                    <div className="text-center text-white animate-in zoom-in duration-300">
                      <div className="bg-red-500/20 p-4 rounded-full inline-block mb-4 backdrop-blur-sm">
                        <Skull className="h-12 w-12 text-red-400" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">游戏结束</h3>
                      <p className="text-red-200 mb-4">{message}</p>
                      <div className="bg-white/10 rounded-lg p-3 mb-6 backdrop-blur-sm">
                        <p className="text-sm text-white/60 mb-1">正确单词</p>
                        <p className="text-lg font-mono font-bold tracking-widest">{currentWord}</p>
                      </div>
                      <Button onClick={() => prepareGame(false)} className="bg-emerald-500 hover:bg-emerald-600 text-white border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition-all">
                        再试一次
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Wrong Letters Footer (inside container) */}
          {wrongLetters.length > 0 && (
            <div className="bg-red-50 dark:bg-red-950/20 p-2 border-t border-red-100 dark:border-red-900/30 flex justify-center gap-2 items-center flex-wrap min-h-[40px]">
              <span className="text-xs text-red-400 font-medium">错误:</span>
              {wrongLetters.map((letter, index) => (
                <span key={index} className="text-xs font-bold text-red-500 bg-white dark:bg-red-900/50 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-900/50">
                  {letter}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* External Controls / Footer Text */}
        <div className="mt-6 flex flex-col items-center gap-4">
          {gameStatus === 'playing' && (
            <Button
              onClick={togglePause}
              variant="outline"
              size="sm"
              className="rounded-full px-6 opacity-50 hover:opacity-100 transition-opacity"
            >
              <Pause className="mr-2 h-4 w-4" />
              暂停游戏
            </Button>
          )}

          <div className="text-slate-400 text-xs flex gap-4 items-center">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <span className="flex items-center gap-1 hidden md:flex"><kbd className="bg-slate-200 dark:bg-slate-700 px-1 rounded">↑↓←→</kbd> 移动</span>
            <span className="flex items-center gap-1 md:hidden">👆 滑动屏幕控制</span>
          </div>
        </div>
      </main >

      {/* Footer */}
      < footer className="border-t bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm py-4 mt-auto" >
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>🐍 贪吃蛇猜单词 - 结合经典游戏与英语学习</p>
        </div>
      </footer >

      {/* Settings Modal */}
      {
        isSettingsOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
              <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Settings className="w-5 h-5" /> 单词库设置
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setIsSettingsOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-4 flex-1 overflow-y-auto">
                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer mb-2 select-none">
                    <input
                      type="checkbox"
                      checked={useCustomWords}
                      onChange={e => setUseCustomWords(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-medium">使用自定义单词库</span>
                  </label>
                  <p className="text-xs text-slate-500 mb-4 ml-6">
                    启用后将仅从下方列表随机选择单词。如果列表为空，将自动使用默认词库。
                  </p>

                  <label className="block text-sm font-medium mb-1">自定义单词:</label>
                  <textarea
                    value={customWordsInput}
                    onChange={e => setCustomWordsInput(e.target.value)}
                    className="w-full h-64 font-mono text-sm p-3 border rounded-lg bg-slate-50 dark:bg-slate-950 dark:border-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                    placeholder={`支持两种格式:\n1. JSON格式:\n[{"word": "APPLE", "hint": "Fruit"}]\n\n2. 文本格式 (单词+空格/Tab+提示):\nAPPLE   A red fruit\nBANANA  Yellow fruit`}
                    spellCheck={false}
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    支持直接粘贴 Excel 或文本内容。系统会自动识别格式。
                  </p>
                </div>
              </div>

              <div className="p-4 border-t dark:border-slate-800 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>取消</Button>
                <Button onClick={saveSettings} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  <Save className="w-4 h-4 mr-2" /> 保存设置
                </Button>
              </div>
            </div>
          </div>
        )
      }
    </div>
  )
}

