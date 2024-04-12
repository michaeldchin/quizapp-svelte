import { WebSocketServer } from 'ws'
import queryString from 'querystring'
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws, req) => {

  logConnectionInfo(req)


  ws.on('error', console.error);
  ws.on('message', (message) => {
    const controllerResponse = Controller.handle(JSON.parse(message))
    console.log(controllerResponse)
    ws.send(controllerResponse)
  })

  ws.on('close', () => {
    console.log('closed')
  })

})

const logConnectionInfo = (req) => {
  const ip = req.socket.remoteAddress;
  const queryParams = queryString.parse(req.url.replace(/^.*\?/, ''))
  console.log(`New connection ${ip} connections: ${wss.clients.size} with gameId: ${queryParams.gameId}`)
}

const handleGameRequest = (req) => {
  const queryParams = queryString.parse(req.url.replace(/^.*\?/, ''))
  if (queryParams.player === 'host') {
    // host starting new game
    Controller.newGame()
    // or maybe host rejoining
  }
  if (queryParams.player === 'player') {
    
  }
  if (queryParams.player === 'viewer') {
    
  }
}

class Controller {

  static games = new Map()

  static handle(input) {
    const command = input.command
    this.newGame()
    console.log('Controller.handle() input: ', command)
    switch (command) {
      case 'host':
        return this.newGame()// should return status of 
      case this.games.has(command):
        console.log('GAME HAS INPUT WORKS')
        return this.listPlayers(command)
      default:
        return 'DEFAULT'
    }
  }

  static newGame() {
    const gameId = 'aaaa'
    this.games.set(gameId, new Game(gameId))
    return JSON.stringify({ command: 'host', gameId})
  }

  static listPlayers(input) {
    return this.games.get(input).listPlayers()
  }
}

class Game {
  constructor(gameId) {
    this.gameId = gameId
    this.players = []
  }
  
  addPlayer(playerName) {
    this.players.push(new Player(playerName))
  }

  listPlayers() {
    return this.players.map(p => p.getName())
  }
}

class Player {
  constructor(name) {
    this.name = name
  }

  getName() {
    return this.name
  }
}