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
  const {role, gameId, playerName } = handleGameConnect(ws, req)

  

  ws.on('error', console.error);
  ws.on('message', (message) => {
    // const controllerResponse = Controller.handle(JSON.parse(message))
    // console.log(controllerResponse)
    // ws.send(controllerResponse)
  })

  ws.on('close', () => {
    if (role === Roles.HOST) {
      Controller.closeGame(gameId)
    }
    if (role === Roles.Player) {
      Controller.removePlayer(gameId, playerName)
    }    
    console.log('closed')
  })

})

const logConnectionInfo = (req) => {
  const ip = req.socket.remoteAddress;
  const queryParams = queryString.parse(req.url.replace(/^.*\?/, ''))
  console.log(`New connection ${ip} connections: ${wss.clients.size} with gameId: ${queryParams.gameId}`)
}

const handleGameConnect = (ws, req) => {
  const queryParams = queryString.parse(req.url.replace(/^.*\?/, ''))
  if (queryParams.player === Roles.HOST) {
    // host starting new game
    const newGameId = Controller.newGame(ws)
    const strReponse = JSON.stringify({role: Roles.HOST, event: 'newGame', gameId: newGameId})
    ws.send(strReponse)
    return {role: Roles.HOST, gameId: newGameId}
  }
  if (queryParams.player === Roles.PLAYER) {
    const playerName = Controller.playerJoin(queryParams.gameId, ws)
    return {role: Roles.PLAYER, gameId: queryParams.gameId, playerName}
  }
  if (queryParams.player === Roles.VIEWER) {
    return {role: Roles.VIEWER, gameId: queryParams.gameId}
  }
}

class Controller {

  static games = new Map()

  static newGame(ws) {
    const gameId = 'aaaa' //todo: change to rng
    this.games.set(gameId, new Game(gameId, ws))
    
    return gameId
  }

  static getGame(gameId) {
    return this.games.get(gameId)
  }
  static closeGame(gameId) {
    this.games.get(gameId).players.forEach(p => {
      p.ws.send(JSON.stringify({event: 'hostLeftGameClose'}))
    })
    this.games.delete(gameId)
  }

  static playerJoin(gameId, ws) {
    this.games.get(gameId).addPlayer('SomeDude', ws)
    // update all players that this player has joined game
    return 'SomeDude'
  }

  static removePlayer(gameId, playerName) {
    getGame(gameId).removePlayer(playerName)
  }

  static listPlayers(input) {
    return this.games.get(input).listPlayers()
  }
}

class Game {
  constructor(gameId, ws) {
    this.hostConnection = ws
    this.gameId = gameId
    this.players = new Map()
  }
  
  addPlayer(playerName, ws) {
    if (!this.players.has(playerName)) {
      this.players.set(playerName, new Player(playerName, ws))
      this.updatePlayers()
    }
    else {
      // already exists
    }
  }

  removePlayer(playerName) {
    this.players.delete(playerName)
    this.updatePlayers()
  }

  updatePlayers() {
    // state + players
    this.players.forEach((p) => {
      const strResponse = JSON.stringify({event: 'playerJoin', players: this.listPlayers()})
      p.ws.send(strResponse)
    })
  }

  listPlayers() {
    return Array.from(this.players, ([key, value]) => value.name);
  }
}

class Player {
  constructor(name, ws) {
    this.name = name
    this.ws = ws //websocket connection
  }

  getName() {
    return this.name
  }
}