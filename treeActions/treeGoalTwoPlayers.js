const {getAngleOneAgentOfMyTeam} = require("./treeManager");
const FL = 'flag', KI = 'kick'
const constMinDistance = 0.5

const DT = {
    state: {
        next: 0,
        sequence: [
            //  {act: FL, fl: "fplb"},
            {act: KI, fl: "b", goal: "gr"}
        ],
        command: null
    },
    root: {
        exec(mgr, state) {
            state.action = state.sequence[state.next];
            state.command = null
        },
        next: 'case2'
    },
    case2: {
        condition: (mgr, state) => mgr.getAgentsOfMyTeam().length === 0,
        trueCond: 'goalVisible',
        falseCond: 'case3'
    },

    case3: {
        condition: (mgr, state) => mgr.getAgentsOfMyTeam().length === 1,
        trueCond: 'case32',
        falseCond: 'goalVisible'
    },

    case32: {
        condition: (mgr, state) => mgr.getDistanceOneAgentOfMyTeam() < 1 && Math.abs(mgr.getAngleOneAgentOfMyTeam()) < 40,
        trueCond: 'rotate30',
        falseCond: 'case33'
    },

    case33: {
        condition: (mgr, state) => mgr.getDistanceOneAgentOfMyTeam() > 10,
        trueCond: 'case331',
        falseCond: 'case34'
    },


    case331: {
        condition: (mgr, state) => Math.abs(mgr.getAngleOneAgentOfMyTeam()) > 5,
        trueCond: 'rotateAngleAgentOfMyTeam',
        falseCond: 'dash80'
    },

    case34: {
        condition: (mgr, state) => mgr.getAngleOneAgentOfMyTeam() > 40 || mgr.getAngleOneAgentOfMyTeam() < 25,
        trueCond: 'rotateAngleAgentOfMyTeam30',
        falseCond: 'case35'
    },

    case35: {
        condition: (mgr, state) => mgr.getDistanceOneAgentOfMyTeam() < 7,
        trueCond: 'dash20',
        falseCond: 'dash40'
    },
    rotate30: {
        exec(mgr, state) {
            console.log("rotate30")
            state.command = {
                n: 'turn',
                v: '30'
            }
        },
        next: 'sendCommand'
    },

    rotateAngleAgentOfMyTeam: {
        exec(mgr, state) {
            state.command = {
                n: 'turn',
                v: mgr.getAngleOneAgentOfMyTeam()
            }
        },
        next: 'sendCommand'
    },

    rotateAngleAgentOfMyTeam30: {
        exec(mgr, state) {
            state.command = {
                n: 'turn',
                v: mgr.getAngleOneAgentOfMyTeam() - 30
            }
        },
        next: 'sendCommand'
    },

    dash80: {
        exec(mgr, state) {
            state.command = {
                n: 'dash',
                v: 80
            }
        },
        next: 'sendCommand'
    },

    dash20: {
        exec(mgr, state) {
            state.command = {
                n: 'dash',
                v: 20
            }
        },
        next: 'sendCommand'
    },

    dash40: {
        exec(mgr, state) {
            state.command = {
                n: 'dash',
                v: 40
            }
        },
        next: 'sendCommand'
    },






    goalVisible: {
        condition: (mgr, state) => mgr.getVisible(state.action.fl),
        trueCond: "rootNext",
        falseCond: "rotate"
    },
    rotate: {
        exec(mgr, state) {
            state.command = {
                n: "turn",
                v: "90"
            }
        },
        next: "sendCommand"
    },
    rootNext: {
        condition: (mgr, state) => state.action.act == FL,
        trueCond: "flagSeek",
        falseCond: "ballSeek"
    },
    flagSeek: {
        condition: (mgr, state) => 3 > mgr.getDistance(state.action.fl),
        trueCond: "closeFlag",
        falseCond: "farGoal"
    },
    closeFlag: {
        exec(mgr, state) {
            state.next++
            state.action = state.sequence[state.next]
        },
        next: "rootNext"
    },
    farGoal: {
        condition: (mgr, state) => Math.abs(mgr.getAngle(state.action.fl)) > 4,
        trueCond: "rotateToGoal",
        falseCond: "runToGoal"
    },
    rotateToGoal: {
        exec(mgr, state) {
            state.command = {
                n: "turn",
                v: mgr.getAngle(state.action.fl)
            }
        },
        next: "sendCommand"
    },
    runToGoal: {
        exec(mgr, state){
            state.command = {
                n: "dash",
                v: 90
            }
        },
        next: "sendCommand"
    },
    sendCommand: {
        command: (mgr, state) => state.command
    },
    ballSeek: {
        condition: (mgr, state) => 0.5 > mgr.getDistance(state.action.fl),
        trueCond: "closeBall",
        falseCond: "farGoal"
    },
    closeBall: {
        condition: (mgr, state) => mgr.getVisible(state.action.goal),
        trueCond: "checkGoalDistance",
        falseCond: "ballGoalInvisible"
    },
    checkGoalDistance: {
        condition: (mgr, state) => mgr.getDistance(state.action.goal) < 30,
        trueCond: "strongKick",
        falseCond: "weakKick"
    },
    strongKick: {
        exec(mgr, state){
            state.command = {
                n: "kick",
                v: `80 ${mgr.getAngle(state.action.goal)}`
            }
        },
        next: "sendCommand"
    },
    weakKick: {
        exec(mgr, state){
            state.command = {
                n: "kick",
                v: `40 ${mgr.getAngle(state.action.goal)}`
            }
        },
        next: "sendCommand"
    },
    ballGoalInvisible: {
        exec(mgr, state) {
            state.command = {
                n: "kick",
                v: "20 45"
            }
        },
        next: "sendCommand"
    }
}

module.exports = DT