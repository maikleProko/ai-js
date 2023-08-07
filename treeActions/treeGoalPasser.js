const FL = "flag"
const PASS = "pass"
const SAY  = "say"
const WAIT_GOAL = "waitGoal"
const WAIT = "wait"
const DT = {
    state: {
        next: 0,
        sequence: [
            {act: WAIT, text: "play_on"},
            {act: FL, fl: "fplc"},
            {act: PASS, fl: "b", id: "2", tacts: 80},
            {act: SAY, text: "go"},
            {act: WAIT_GOAL}
        ],
        tacts: 0,
        command: null
    },
    root: {
        exec(mgr, state) {
            state.action = state.sequence[state.next]
            state.command = null
        },
        next: "isWait"
    },


    isWait: {
        condition: (mgr, state) => state.action.act === WAIT,
        trueCond: "rotateWait",
        falseCond: "isWaitGoal"
    },

    rotateWait: {
        exec(mgr, state) {
            state.command = {
                n: "turn",
                v: "90"
            }
            if(mgr.isCurrentHearText(state.action.text)) {
                state.next++
                state.action = state.sequence[state.next]
            }
        },
        next: "sendCommand"
    },

    isWaitGoal: {
        condition: (mgr, state) => state.action.act === WAIT_GOAL,
        trueCond: "doNothing",
        falseCond: "isSayOrAction",
    },

    isSayOrAction: {

        condition: (mgr, state) => state.action.act === SAY,
        trueCond: "say",
        falseCond: "goalVisible",
    },

    say: {
        exec(mgr, state) {
            state.command = {
                n: "say",
                v: state.action.text
            }
            state.next++
            state.action = state.sequence[state.next]
        },
        next: "sendCommand",
    },

    doNothing: {
        exec(mgr, state) {
            state.command = {
                n: "turn",
                v: "0"
            }
            if(mgr.isCurrentHearText("goal_l_")) {
                state.next = 0
                state.action = state.sequence[state.next]
            }
        },
        next: "sendCommand"
    },

    doNothingWithWaitTact: {
        exec(mgr, state) {
            console.log("wait" + state.tacts)
            state.tacts--
            state.command = {
                n: "turn",
                v: "0"
            }
        },
        next: "sendCommand"
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
        condition: (mgr, state) => state.action.act === FL,
        trueCond: "flagSeek",
        falseCond: "rootIsPass"
    },

    rootIsPass: {
        condition: (mgr, state) => state.action.act === PASS,
        trueCond: "ballSeekPass",
        falseCond: "doNothing"
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

            if (typeof state.action['tacts'] !== "undefined") {
                state.tacts = state.action.tacts
            }
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
    ballSeekPass: {
        condition: (mgr, state) => 0.5 > mgr.getDistance(state.action.fl),
        trueCond: "isAgentInMyTeam",
        falseCond: "farGoal"
    },

    isAgentInMyTeam: {

        condition: (mgr, state) => mgr.isAgentOfMyTeam(state.action.id),
        trueCond: "kickPass",
        falseCond: "waitTacts"

    },


    kickPass : {
        exec(mgr, state){
            console.log('pass')
            state.command = {
                n: "kick",
                v: `${mgr.getDistanceOneAgentOfMyTeamById(state.action.id) * 4.75} ${mgr.getAngleOneAgentOfMyTeamById(state.action.id)-9}`
            }
            state.next++
            state.action = state.sequence[state.next]
        },
        next: "sendCommand"
    },

    checkGoalDistancePass: {
        condition: (mgr, state) => mgr.getDistanceOneAgentOfMyTeamById(state.action.id) < 30,
        trueCond: "strongKickPass",
        falseCond: "weakKickPass"
    },

    strongKickPass: {
        exec(mgr, state){
            console.log('strong pass')
            state.command = {
                n: "kick",
                v: `80 ${mgr.getAngleOneAgentOfMyTeamById(state.action.id)}`
            }
        },
        next: "sendCommand"
    },
    weakKickPass: {
        exec(mgr, state){
            console.log('weak pass')
            state.command = {
                n: "kick",
                v: `20 ${mgr.getAngleOneAgentOfMyTeamById(state.action.id)}`
            }
        },
        next: "sendCommand"
    },


    waitTacts: {
        condition: (mgr, state) => state.tacts > 0,
        trueCond: "doNothingWithWaitTact",
        falseCond: "ballGoalInvisible"

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