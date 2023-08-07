const Msg = require('./msg')
const MathFlags = require("./mathFlags")
const Parses = require("./parses")
const movableCharacter = require("./movableCharacter")
const treeManager = require("./treeActions/treeManager")
const autoManager = require("./autoActions/autoManager")
const flagsCoordinates = require("./flagsCoordinates")
const {mergeToString} = require("./parses");



const controller = {
    currentNumberAct: 0,
    isActStop: false,
    acts: [
        {act: "Kick", fl: "b", goal: "gr"}
    ]
}

//const minDistance = 3

class Agent extends movableCharacter{
    constructor(speed, position, teamName , ctrlGoal /*autoGoal /*treeGoal*/, type, role, startGoal, startMove) {
        super(speed, controller);
        this.teamName = teamName
        this.position = position
        this.type = type
        this.speed = speed
        this.run = false
        this.act = null
        this.treeGoal = /*treeGoal*/ undefined
        this.autoGoal = /*autoGoal*/ undefined
        this.startMove = startMove
        this.ctrlGoal = ctrlGoal
        this.startGoal = startGoal
        this.role = role
        this.x = 0
        this.y = 0
        this.controller = controller
    }


    msgGot(msg) {
        let data = msg.toString('utf8')
        this.processMsg(data)
        this.sendCmd()
    }


    setSocket(socket) {
        this.socket = socket
    }


    socketSend(cmd, value) {
        let message = `(${cmd} ${value})`
        this.socket.sendMsg(message)
    }


    processMsg(msg) {
        let data = Msg.parseMsg(msg)
        if (!data) throw new Error("Parse error\n" + msg)
        if (data.cmd == "hear") {
            if (data.msg.includes('play_on')){
                this.run = true
            }
        }
        if (data.cmd == "init"){
            this.initAgent(data.p)
        }
        this.analyzeEnv(data.msg, data.cmd, data.p)
    }


    initAgent(p) {
        if (p[0] == "r"){
            this.position = "r"
        }
        if (p[1]) {
            this.id = p[1]
        }
    }



    analyzeEnv(msg, cmd, p) { // Анализ сообщения
        this.doActBeforeStart(p, cmd)
        if ((cmd === "see" || cmd === "hear")  && this.run) {
            this.doActCtrl(p, cmd)
        }
    }

    doActBeforeStart(p, cmd) {
        if (cmd === 'hear' && (p[2].includes('goal_l_') || p[2].includes('goal_r_'))) {
            this.act = {n: "move", v: this.startMove}
            this.run = false
        }
    }

    doActCtrl(p, cmd) {
        switch(cmd) {
            case 'see':
                this.act = this.ctrlGoal.CTRL_LOW.execute(
                    p,
                    [this.ctrlGoal.CTRL_MIDDLE, this.ctrlGoal.CTRL_HIGH],
                    this.teamName,
                    this.position,
                    this.role,
                    this.startGoal
                )
                break
            default:
                break
        }
    }

    doActAuto(p, cmd) {
        switch(cmd) {
            case 'see':
                this.act = autoManager.getAction(p, this.autoGoal, this.teamName, this.position, false)
                break
            case 'hear':
                autoManager.setHear(p)
                break
            default:
                break
        }
    }

    doActTree(p, cmd) {
        this.act = treeManager.getAction(this.treeGoal, Parses.parseObjects(p), this.teamName, p[2], cmd)
    }



    sendCmd() {
        if (this.run) {
            if (this.act) {
                this.socketSend(this.act.n, this.act.v)
            }
            this.act = null
        }
    }



}
module.exports = Agent
