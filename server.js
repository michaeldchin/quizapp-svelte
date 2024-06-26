import { WebSocketServer } from 'ws'
import queryString from 'querystring'
import { v4 as uuidv4 } from 'uuid';

let wss
const PORT = 8081
wss = new WebSocketServer({ port: PORT });

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
    return JSON.stringify({event: 'gameAlreadyExists'})
  }
  static gameDoesntExist() {
    return 'There is no host, try again when someone is hosting a game'
  }
  static hostLeft() {
    return JSON.stringify({event: 'hostLeftGameClose'})
  }
  static playerJoin(playerList) {
    return JSON.stringify({event: 'playerJoin', players: playerList})
  }
  static notifyPlayerOfTheirId(playerId) {
    return JSON.stringify({event: 'yourPlayerId', playerId})
  }
  static hostStartedGame() {
    return JSON.stringify({event: 'hostStartedGame'})
  }
  static questionMultipleChoice() {
    return JSON.stringify({event: 'questionMultipleChoice'})
  }
  static questionTrueFalse() {
    return JSON.stringify({event: 'questionTrueFalse'})
  }
  static questionOpenEnded() {
    return JSON.stringify({event: 'questionOpenEnded'})
  }
  static playerAnswersUpdate(players) {
    return JSON.stringify({event: 'playerAnswersUpdate', players})
  }
  static hostEndedQuestion(players) {
    return JSON.stringify({event: 'hostEndedQuestion', players})
  }
  static hostGradedAnswers(players) {
    return JSON.stringify({event: 'hostGradedAnswers', players})
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


  // Host Events
  if (role === Roles.HOST) {
    ws.on('message', (message) => {
      const resp = JSON.parse(message)
      if (resp.event ==='keepAlive') {
        // in prod the idle wss connection is killed after 60 seconds, so we take keepalive pings
        // https://stackoverflow.com/questions/29579208/why-does-my-websocket-close-after-a-few-minutes
        return
      }
      console.log(JSON.parse(message))
      if (resp.event === 'hostStartedGame') {
        Controller.startGame(gameId)
      }
      if (resp.event === 'questionSentWaitingForPlayers') {
        const game = Controller.getGame(gameId);
        game.saveAnswersTostack()
        game.updatePlayersOnly(Event.playerAnswersUpdate(game.listPlayersFull()))
        game.updateHostOnly(Event.playerAnswersUpdate(game.listPlayersFull()))
        if (resp.questionType === 'multipleChoice') {
          game.updatePlayersOnly(Event.questionMultipleChoice())
        }
        else if (resp.questionType === 'trueFalse') {
          game.updatePlayersOnly(Event.questionTrueFalse())
        }
        else if (resp.questionType === 'openEnded') {
          game.updatePlayersOnly(Event.questionOpenEnded())
        }
        else {
          throw new Error(`not implemented ${resp.questionType}`)
        }
      }
      if (resp.event === 'hostEndedQuestion') {
        const game = Controller.getGame(gameId)
        game.saveAnswersTostack()
        game.updatePlayersOnly(Event.hostEndedQuestion(game.listPlayersFull()))
        game.updateHostOnly(Event.hostGradedAnswers(game.listPlayersFull()))
      }
      if (resp.event === 'hostGradedAnswers') {
        const game = Controller.getGame(gameId)
        game.scoreAnswers(resp.players)
        game.updatePlayersOnly(Event.hostGradedAnswers(game.listPlayersFull()))
        game.updateHostOnly(Event.hostGradedAnswers(game.listPlayersFull()))
        game.resetScoreDeltas()
      }
    })
  }

  // Player Events
  if (role === Roles.PLAYER) {
    ws.on('message', (message) => {
      const resp = JSON.parse(message)
      if (resp.event ==='keepAlive') {
        // in prod the idle wss connection is killed after 60 seconds, so we take keepalive pings
        // https://stackoverflow.com/questions/29579208/why-does-my-websocket-close-after-a-few-minutes
        return
      }
      console.log(JSON.parse(message)) 
      if (resp.event === 'playerAnswer') {
        // player updated answer
        const game = Controller.getGame(gameId);
        const player = game.getPlayer(playerId)
        player.answer = resp.answer
        player.ws.send(Event.playerAnswersUpdate(game.listPlayersFull()))
        game.updateHostOnly(Event.playerAnswersUpdate(game.listPlayersFull()))
      }
    })
  }

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
    //if no game return response
    if (!Controller.getGame(queryParams.gameId)) {
      ws.send(Event.gameDoesntExist())
      return {}
    }
    let playerId
    try {
        playerId = Controller.playerJoin(queryParams.gameId, queryParams.playerName, ws)
        // let the player know their id
        ws.send(Event.notifyPlayerOfTheirId(playerId))
    } catch (e) {
      if (e instanceof ValidationError) {
        ws.send(e.message)
        return {}
      } else {
        throw e
      }
    }
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

  static playerJoin(gameId, playerName, ws) {
    if (!this.games.has(gameId)) {
      throw new Error(`playerJoin() called with gameId: ${gameId} that does not exist.`) 
    }
    const game = this.getGame(gameId)
    const newPlayer = new Player(playerName, ws)
    if (!game.addPlayer(newPlayer)) {
      throw new ValidationError(`Cannot join game. player: ${playerName} already exists.`)
    }
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
    console.log(`Adding player: ${player.id} with name: ${player.name}`)
    const playerAlreadyExists = this.players.has(player.id) ||
      Array.from(this.players.values()).some(p => p.name === player.name)

    if (playerAlreadyExists) {
      console.log(`Player already exists`)
      return false
    }
    if (!playerAlreadyExists) {
      this.players.set(player.id, player)
      console.log(`Player added successfully`)
      this.updatePlayersJoinStageONLY()
      return true
    }
  }

  removePlayer(playerId) {
    this.players.delete(playerId)
    this.updatePlayersJoinStageONLY()
  }

  getPlayer(playerId) {
    return this.players.get(playerId)
  }
  
  saveAnswersTostack() {
    this.players.forEach((p) => {
      console.log(p)
      if (!this.getPlayer(p.id).answer) return
      this.getPlayer(p.id).answerStack.push(this.getPlayer(p.id).answer)
      this.getPlayer(p.id).answer = undefined // clear the answer, but i dont like this, i feel like it should happen somewhere else
    })
  }

  scoreAnswers(players){
    players.forEach(p => {
      this.getPlayer(p.id).score = p.score + p.scoreDelta
      this.getPlayer(p.id).scoreDelta = p.scoreDelta
      this.getPlayer(p.id).answer = undefined // clear the answer, but i dont like this, i feel like it should happen somewhere else
      this.getPlayer(p.id).answerStack = [] 
    })
  }

  resetScoreDeltas() {
    this.players.forEach(p => {
      this.getPlayer(p.id).scoreDelta = 0
    })
  }

  // TODO: Dont make this join based
  updatePlayersJoinStageONLY() {
    const strResponse = Event.playerJoin(this.listPlayersFull())
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

  updateHostOnly(event) {
    this.hostConnection.send(event)
  }

  /**
   * Returns array of player names
   * @returns {Array<string>}
   */
  listPlayers() {
    return Array.from(this.players, ([, value]) => value.name);
  }

  listPlayersFull() {
    return Array.from(this.players, ([, p]) => p.toJson());
  }
}

class Player {
  answer = undefined
  answerStack = []

  constructor(name, ws) {
    this.id = uuidv4()
    this.name = name
    this.ws = ws //websocket connection
    this.score = 0
    this.scoreDelta = 0
  }

  toJson() {
    return {
      id: this.id,
      name: this.name,
      score: this.score,
      scoreDelta: this.scoreDelta,
      answer: this.answer,
      answerStack: this.answerStack
    }
  }
}
