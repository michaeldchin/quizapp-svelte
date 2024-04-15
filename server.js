import { WebSocketServer } from 'ws'
import queryString from 'querystring'
const wss = new WebSocketServer({ port: 8080 });

class Roles {
  static HOST = 'host'
  static PLAYER = 'player'
  static VIEWER = 'viewer'
}


wss.on('connection', (ws, req) => {

  logConnectionInfo(req)
  // Host has started game or player/viewer joins
  handleGameRequest(ws, req)

  

  ws.on('error', console.error);
  ws.on('message', (message) => {
    // const controllerResponse = Controller.handle(JSON.parse(message))
    // console.log(controllerResponse)
    // ws.send(controllerResponse)
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

const handleGameRequest = (ws, req) => {
  const queryParams = queryString.parse(req.url.replace(/^.*\?/, ''))
  if (queryParams.player === Roles.HOST) {
    // host starting new game
    const newGameId = Controller.newGame()
    ws.send(JSON.stringify({role: Roles.HOST, gameId: newGameId}))
    // or maybe host rejoining
  }
  if (queryParams.player === Roles.PLAYER) {
    
  }
  if (queryParams.player === Roles.VIEWER) {
    
  }
}

class Controller {

  static games = new Map()

  static newGame() {
    const gameId = 'aaaa' //todo: change to rng
    this.games.set(gameId, new Game(gameId))
    
    return gameId
  }

  static listPlayers(input) {
    return this.games.get(input).listPlayers()
  }
}

class GameStatus {
  static ACTIVE = 'active' 
  static INACTIVE = 'inactive'
}

class Game {
  constructor(gameId) {
    this.gameId = gameId
    this.players = []
    this.status = GameStatus.ACTIVE
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