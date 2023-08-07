const FL = "flag"
const KI = "kick"
const DT = {
    state: {
        next: 0,
        sequence: [
            {act: FL, fl: "gr", goal: "gr"},
            {act: KI, fl: "b", goal: "gl"}
        ],
        command: null
    },
    root: {
        exec(mgr, state) {
            state.action = state.sequence[0]
            state.command = null
        },
        next: "isBallFar"
    },

    isBallFar: {
        condition: (mgr, state) => !mgr.getBallVisible() || mgr.getBallDistance() > 20,
        trueCond: "caseBallFar",
        falseCond: "caseBallNear"
    },

    caseBallFar: {
        condition: (mgr, state) => mgr.getVisible(state.action.goal),
        trueCond: "isGatesFar",
        falseCond: "rotate90"
    },

    isGatesFar: {
        condition: (mgr, state) => mgr.getDistance(state.action.goal) > 5,
        trueCond: "farGoal",
        falseCond: "caseFprcFprtFprb"
    },

    caseFprcFprtFprb: {
        condition:(mgr, state) => (
            mgr.isBetween(mgr.getDistance("fprc"), 12, 16) ||
            mgr.isBetween(mgr.getDistance("fprt"), 20, 28) ||
            mgr.isBetween(mgr.getDistance("fprb"), 20, 28)
        ),
        trueCond: "isBallVisible",
        falseCond: "farGoal"
    },

    isBallVisible: {
        condition: (mgr, state) => mgr.getBallVisible(),
        trueCond: "rotateToBall",
        falseCond: "rotate90"
    },

    rotateToBall: {
        exec(mgr, state) {
            state.command = {
                n: "turn",
                v: mgr.getBallAngle()
            }
        },
        next: "sendCommand"
    },


    rotate90: {
        exec(mgr, state){
            state.command = {
                n: "turn",
                v: "90"
            }
        },
        next: "sendCommand"
    },


    caseBallNear: {
        condition: (mgr, state) => mgr.getBallDistance() < 2,
        trueCond: "caseGoalkeeperCatch",
        falseCond: "caseGoalkeeperKick"
    },

    caseGoalkeeperCatch: {
        exec(mgr, state) {
            state.command = {
                n: 'catch',
                v: String(mgr.getBallAngle())
            }
        },
        next: 'sendCommand'
    },

    caseGoalkeeperKick: {
        exec(mgr, state) {
            state.action = state.sequence[1]
        },
        next: "ballSeek"
    },

    isGatesNearBeforeKick: {
        condition:(mgr, state) => (
            mgr.isBetween(mgr.getDistance("fprc"), 12, 16) ||
            mgr.isBetween(mgr.getDistance("fprt"), 20, 28) ||
            mgr.isBetween(mgr.getDistance("fprb"), 20, 28)
        ),
        trueCond: "caseGoalkeeperKick",
        falseCond: "rotate90"
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