import { WebSocketServer } from 'ws'
import queryString from 'querystring'
import { v4 as uuidv4 } from 'uuid';
 
const wss = new WebSocketServer({ port: 8080 });

class Roles {
  static HOST = 'host'
  static PLAYER = 'player'
  static VIEWER = 'viewer'
}

class Event {
  static newGame(newGameId) {
    return JSON.stringify({role: Roles.HOST, event: 'newGame', gameId: newGameId})
  }
  static gameAlreadyExists() {
    return 'Game already exists'
  }
  static hostLeft() {
    return JSON.stringify({event: 'hostLeftGameClose'})
  }
  static playerJoin(playerList) {
    return JSON.stringify({event: 'playerJoin', players: playerList})
  }
  static hostStartedGame() {
    return JSON.stringify({event: 'hostStartedGame'})
  }
}

wss.on('connection', (ws, req) => {

  logConnectionInfo(req)
  const { role, gameId, playerId } = handleGameConnect(ws, req)
  if (role === null) { // early exit
    ws.close() 
  }

  ws.on('error', (err) => {
    console.error(err)
  });
  ws.on('message', (message) => {
    console.log(JSON.parse(message)) 
    Controller.startGame(gameId)
    // Initialize whatever game state
    
  })

  ws.on('close', () => {
    if (role === Roles.HOST) {
      Controller.closeGame(gameId)
    }
    if (role === Roles.PLAYER) {
      Controller.removePlayer(gameId, playerId)
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
    try {
      const newGameId = Controller.newGame(ws)
      ws.send(Event.newGame(newGameId))
      return {role: Roles.HOST, gameId: newGameId}
    }
    catch (e) {
      if (e instanceof ValidationError) {
        return {role: null}
      }
      else throw e
    }
  }
  if (queryParams.player === Roles.PLAYER) {
    const playerId = Controller.playerJoin(queryParams.gameId, ws)
    return {role: Roles.PLAYER, gameId: queryParams.gameId, playerId}
  }
  if (queryParams.player === Roles.VIEWER) {
    return {role: Roles.VIEWER, gameId: queryParams.gameId}
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

class Controller {

  static games = new Map()

  static newGame(ws) {
    const gameId = 'aaaa' //todo: change to rng
    if (this.games.has(gameId)) {
      ws.send(Event.gameAlreadyExists())
      throw new ValidationError(`Cannot create new game. gameId: ${gameId} already exists`)
    }
    this.games.set(gameId, new Game(gameId, ws))
    
    return gameId
  }

  static getGame(gameId) {
    return this.games.get(gameId)
  }

  static closeGame(gameId) {
    if (!this.games.has(gameId)) {
      throw new Error(`Cannot close game. gameId: ${gameId} does not exist`)
    }
    this.getGame(gameId).players.forEach(p => {
      p.ws.send(Event.hostLeft())
    })
    this.games.delete(gameId)
  }

  static playerJoin(gameId, ws) {
    if (!this.games.has(gameId)) {
      throw new Error(`playerJoin() called with gameId: ${gameId} that does not exist.`) 
    }
    const game = this.getGame(gameId)
    const newPlayer = new Player('SomeDude', ws)
    game.addPlayer(newPlayer)
    // update all players that this player has joined game
    return newPlayer.id
  }

  static removePlayer(gameId, playerId) {
    if (!this.games.has(gameId)) {
      console.warn(`removePlayer() called with gameId: ${gameId} that does not exist.`)
      return
    }
    this.getGame(gameId).removePlayer(playerId)
  }

  static startGame(gameId) {
    if (!this.games.has(gameId)) {
      throw new Error(`Cannot start game. gameId: ${gameId} does not exist`)
    }
    this.getGame(gameId).updatePlayersOnly(Event.hostStartedGame())
  }
}

class Game {
  constructor(gameId, ws) {
    this.hostConnection = ws
    this.gameId = gameId
    this.players = new Map()
  }

  addPlayer(player) {
    const playerAlreadyExists = this.players.has(player.id)
    if (playerAlreadyExists) {
      return false
    }
    if (!playerAlreadyExists) {
      this.players.set(player.id, player)
      this.updatePlayers()
      return true
    }
  }

  removePlayer(playerId) {
    this.players.delete(playerId)
    this.updatePlayers()
  }


  updatePlayers() {
    const strResponse = Event.playerJoin(this.listPlayers())
    this.hostConnection.send(strResponse)
    this.players.forEach((p) => {
      p.ws.send(strResponse)
    })
  }

  updatePlayersOnly(event) {
    this.players.forEach((p) => {
      // this.hostConnection.send(event)
      p.ws.send(event)
    })
  }

  /**
   * Returns array of player names
   * @returns {Array<string>}
   */
  listPlayers() {
    return Array.from(this.players, ([key, value]) => value.name);
  }
}

class Player {
  constructor(name, ws) {
    this.id = uuidv4()
    this.name = name
    this.ws = ws //websocket connection
  }
}
