'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Monitor, RotateCcw, PlayCircle } from 'lucide-react'
import confetti from 'canvas-confetti'

export default function ChessGame() {
  const [game, setGame] = useState<Chess>(new Chess())
  const [gameMode, setGameMode] = useState<'friend' | 'computer' | null>(null)
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white')
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white')
  const [currentTurn, setCurrentTurn] = useState<'white' | 'black'>('white')
  const [gameOver, setGameOver] = useState(false)
  const [moveHistory, setMoveHistory] = useState<string[]>([])

  const makeComputerMove = useCallback(() => {
    const possibleMoves = game.moves()
    if (game.isGameOver() || possibleMoves.length === 0) return

    const randomIndex = Math.floor(Math.random() * possibleMoves.length)
    const move = possibleMoves[randomIndex]
    const result = game.move(move)
    setGame(new Chess(game.fen()))
    setCurrentTurn(game.turn() === 'w' ? 'white' : 'black')
    setMoveHistory(prev => [...prev, result.san])
    checkGameOver()
  }, [game])

  useEffect(() => {
    if (gameMode === 'computer' && currentTurn !== playerColor && !gameOver) {
      const timer = setTimeout(makeComputerMove, 300)
      return () => clearTimeout(timer)
    }
  }, [gameMode, currentTurn, playerColor, makeComputerMove, gameOver])

  const checkGameOver = useCallback(() => {
    if (game.isGameOver()) {
      setGameOver(true)
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    }
  }, [game])

  const onDrop = useCallback((sourceSquare: string, targetSquare: string) => {
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    })

    if (move === null) return false

    setGame(new Chess(game.fen()))
    setCurrentTurn(game.turn() === 'w' ? 'white' : 'black')
    setMoveHistory(prev => [...prev, move.san])
    
    if (gameMode === 'friend') {
      setBoardOrientation(prev => prev === 'white' ? 'black' : 'white')
    }
    
    checkGameOver()

    return true
  }, [game, gameMode, checkGameOver])

  const resetGame = useCallback(() => {
    const newGame = new Chess()
    setGame(newGame)
    setCurrentTurn('white')
    setGameOver(false)
    setMoveHistory([])
    if (gameMode === 'computer') {
      setBoardOrientation(playerColor)
      if (playerColor === 'black') {
        setTimeout(makeComputerMove, 300)
      }
    } else {
      setBoardOrientation('white')
    }
  }, [gameMode, playerColor, makeComputerMove])

  const startGame = useCallback((mode: 'friend' | 'computer') => {
    setGameMode(mode)
    resetGame()
  }, [resetGame])

  const rotateBoard = useCallback(() => {
    setBoardOrientation(prev => prev === 'white' ? 'black' : 'white')
  }, [])

  const handlePlayerColorChange = useCallback((color: 'white' | 'black') => {
    setPlayerColor(color)
    setBoardOrientation(color)
    resetGame()
  }, [resetGame])

  const renderMoveHistory = () => {
    return moveHistory.map((move, index) => (
      <span key={index} className={index % 2 === 0 ? 'text-white' : 'text-gray-400'}>
        {index % 2 === 0 ? `${Math.floor(index / 2) + 1}. ` : ''}
        {move}
        {' '}
      </span>
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2f3437] to-[#1f2937] text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Play Chess</h1>
        
        <div className="grid lg:grid-cols-[250px_1fr_250px] gap-4 items-start">
          <div className="space-y-4">
            <Card className="bg-[#2f3437] text-white">
              <CardHeader className="p-4">
                <CardTitle className="text-lg">Game Mode</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2">
                <Button 
                  className="w-full justify-start gap-2 bg-[#769656] hover:bg-[#658446] text-sm"
                  onClick={() => startGame('friend')}
                >
                  <Users className="w-4 h-4" />
                  Play with Friend
                </Button>
                <Button 
                  className="w-full justify-start gap-2 bg-[#769656] hover:bg-[#658446] text-sm"
                  onClick={() => startGame('computer')}
                >
                  <Monitor className="w-4 h-4" />
                  Play with Computer
                </Button>
              </CardContent>
            </Card>

            {gameMode === 'computer' && (
              <Card className="bg-[#2f3437] text-white">
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">Your Color</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Select 
                    onValueChange={handlePlayerColorChange}
                    value={playerColor}
                  >
                    <SelectTrigger className="w-full bg-[#4a4a4a] border-gray-600">
                      <SelectValue placeholder="Select your color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="white">White</SelectItem>
                      <SelectItem value="black">Black</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}

            <Card className="bg-[#2f3437] text-white">
              <CardHeader className="p-4">
                <CardTitle className="text-lg">Game Controls</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2">
                <Button 
                  onClick={resetGame}
                  className="w-full bg-[#769656] hover:bg-[#658446] text-sm"
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  New Game
                </Button>
                <Button 
                  onClick={rotateBoard}
                  className="w-full bg-[#769656] hover:bg-[#658446] text-sm"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Rotate Board
                </Button>
              </CardContent>
            </Card>

            {gameMode && (
              <Card className="bg-[#2f3437] text-white">
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">Current Mode</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm">
                    {gameMode === 'friend' ? 'Playing with Friend' : 'Playing with Computer'}
                  </p>
                  {gameMode === 'computer' && (
                    <p className="text-sm mt-2">
                      Playing as: {playerColor === 'white' ? 'White' : 'Black'}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="relative w-full max-w-[calc(100vh-200px)] mx-auto">
            <div className="aspect-square">
              <Chessboard 
                position={game.fen()} 
                onPieceDrop={onDrop}
                boardOrientation={boardOrientation}
              />
            </div>
            {gameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
                <div className="text-4xl font-bold text-white">
                  {game.isCheckmate() ? 'Checkmate!' : game.isDraw() ? 'Draw!' : 'Game Over!'}
                </div>
              </div>
            )}
          </div>

          <Card className="bg-[#2f3437] text-white h-full">
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Move History</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="font-mono text-xs bg-[#1e2124] p-2 rounded h-[calc(100vh-250px)] overflow-y-auto">
                {renderMoveHistory()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 text-center p-2 bg-[#2f3437] text-white text-sm">
        Seminární práce 2024/2025 ZŠ Londýnská
      </div>
    </div>
  )
}