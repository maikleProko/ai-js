const FL = "flag"
const KI = "kick"
const HEAR = "hear"
const DASH_FORWARD = "dash_forward"
const WAIT = "wait"
const DT = {
    state: {
        next: 0,
        sequence: [
            {act: FL, fl: "fplb", text: "go"},
            {act: WAIT, text: "drop_ball"},
            {act: FL, fl: "fgrb", text: "go"},
            {act: HEAR, text: "go"},
            {act: DASH_FORWARD, fl: "b", text: "123"},
            {act: KI, fl: "b", goal: "gr", text: "123"},
        ],
        command: null
    },
    root: {
        exec(mgr, state) {
            state.action = state.sequence[state.next]
            state.command = null
        },
        next: "isGoal"
    },

    isGoal: {
        condition: (mgr, state) => mgr.isCurrentHearText("goal_l_") && state.next !== 0,
        trueCond: "endGoal",
        falseCond: "isAnywayHear"
    },



    endGoal: {
        exec(mgr, state) {
            console.log("goal!!!")
            state.next = 0
            state.action = state.sequence[state.next]
        },
        next: "doNothing"
    },


    isHear: {
        condition: (mgr, state) => state.action.act === HEAR,
        trueCond: "hear",
        falseCond: "isDashForward"
    },

    hear: {
        condition: (mgr, state) => mgr.isCurrentHearTextFromAgent(state.action.text),
        trueCond: "endHear",
        falseCond: "doNothing"
    },

    doNothing: {
        exec(mgr, state) {
            state.command = {
                n: "turn",
                v: "0"
            }
        },
        next: "sendCommand"
    },

    endHear: {
        exec(mgr, state) {
            while(state.action.text !== "123") {
                state.next++
                state.action = state.sequence[state.next]
            }
        },
        next: "rootNext"
    },

    isAnywayHear: {
        condition: (mgr, state) => mgr.isCurrentHearTextFromAgent(state.action.text),
        trueCond: "endHear",
        falseCond: "isWait"
    },

    isWait: {
        condition: (mgr, state) => state.action.act === WAIT,
        trueCond: "rotateWait",
        falseCond: "isDashForward"
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

    isDashForward: {
        condition: (mgr, state) => state.action.act === DASH_FORWARD,
        trueCond: "isContinueDashForward",
        falseCond: "goalVisible"
    },

    isContinueDashForward: {
        condition: (mgr, state) => mgr.getVisible(state.action.fl),
        trueCond: "endDashSlow",
        falseCond: "dashSlow"
    },

    dashSlow: {
        exec(mgr, state){
            state.command = {
                n: "dash",
                v: 5
            }
        },
        next: "sendCommand"
    },

    endDashSlow: {
        exec(mgr, state) {
            state.next++
            state.action = state.sequence[state.next]
        },
        next: "rootNext"
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
            console.log(state.action.fl)
        },
        next: "root"
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
                v: 180
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
                v: `20 ${mgr.getAngle(state.action.goal)}`
            }
        },
        next: "sendCommand"
    },
    ballGoalInvisible: {
        exec(mgr, state) {
            state.command = {
                n: "kick",
                v: "20 -45"
            }
        },
        next: "sendCommand"
    }
}

module.exports = DT