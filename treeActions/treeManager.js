
const Parses = require("../parses");
const MathFlags = require("../mathFlags");

const flagsCoordinates = require("../flagsCoordinates")


module.exports = {


    getAction(dt, p, teamName, hearText, cmd) {
        this.p = p
        //console.log(this.p)
        this.teamName = teamName
        this.agentsOfMyTeam = this.getAgentsOfMyTeam()
        this.hearText = hearText
        this.cmd = cmd

        function execute(dt, title, Manager) {
            const action = dt[title]
            //console.log(action)
            if (typeof action.exec == "function") {
                action.exec(Manager, dt.state)
                return execute(dt, action.next, Manager)
            }
            if (typeof action.condition == "function") {
                const cond = action.condition(Manager, dt.state)
                if (cond) return execute(dt, action.trueCond, Manager)
                return execute(dt, action.falseCond, Manager)
            }
            if (typeof action.command == "function") {
                return action.command(Manager, dt.state)
            }
            throw new Error(`Unexpected node in DT: ${title}`)
        }

        return execute(dt, "root", this)
    },

    getObject(goal) {
        let found = {}
        this.p.forEach((object)=>{
            if(Parses.mergeToString(object.cmd.p) === goal) {
                found = object
            }
        })
        return found
    },

    getBall() {
        return Parses.parseBalls(this.p).length > 0 ? Parses.parseBalls(this.p)[0] : {}
    },

    getVisible(goal) {
        return JSON.stringify(this.getObject(goal)) !== '{}'
    },

    getBallVisible() {
        return JSON.stringify(this.getBall()) !== '{}'
    },

    getBallDistance() {
        return this.getBallVisible() ? parseInt(this.getBall().p[0], 10) : null
    },

    getBallAngle() {
        return this.getBallVisible() ? parseInt(this.getBall().p[1], 10) : null
    },

    getDistance(goal) {
        return this.getVisible(goal) ? parseInt(this.getObject(goal).p[0], 10) : null;
    },

    getAngle(goal) {
        return this.getVisible(goal) ? parseInt(this.getObject(goal).p[1], 10) : null;
    },

    getMyPos() {
        let flags = Parses.parseFlags(this.p)
        if (flags.length < 2) {
            return MathFlags.getMyPosEmpty(flags)
        }
        if (flags.length >= 3) {
            return MathFlags.getMyPosUsingThreeFlags(flags, flagsCoordinates)
        }
        if (flags.length >= 2) {
            return MathFlags.getMyPosUsingTwoFlags(flags, flagsCoordinates)
        }
    },

    getAgentsOfMyTeam() {
        let found = []
        //console.log(this.cmd + " " + JSON.stringify(this.p))
        if(this.isCurrentCMD("see")) {
            this.p.forEach((object)=>{
                if(
                    object.cmd !== undefined &&
                    (typeof object.cmd['p'] !== undefined) &&
                    (typeof object.cmd.p['length'] !== undefined) &&
                    object.cmd.p.length > 2 &&
                    object.cmd.p[0] === "p" && object.cmd.p[1] === "\"" + this.teamName + "\""
                ) {
                    found.push(object)
                }
            })
        }
        //console.log(found)
        return found
    },

    isAgentOfMyTeam(id) {
        let found = false
        this.agentsOfMyTeam.forEach((object)=>{
            if(object.cmd.p[2].toString() === id.toString()) {
                console.log("yes, it is target agent")
                found = true
            }
        })
        return found
    },

    getDistanceOneAgentOfMyTeamById(id) {
        let found = null
        this.agentsOfMyTeam.forEach((object)=>{
            if(object.cmd.p[2].toString() === id.toString()) {
                console.log("yes, it is target agent distance")
                found = object.p[0]
            }
        })
        return found
    },

    getAngleOneAgentOfMyTeamById(id) {
        let found = null
        this.agentsOfMyTeam.forEach((object)=>{
            if(object.cmd.p[2].toString() === id.toString()) {
                console.log("yes, it is target agent angle")
                found = object.p[1]
            }
        })
        return found
    },


    getOneAgentOfMyTeam() {
        return this.agentsOfMyTeam[0]
    },


    getDistanceOneAgentOfMyTeam() {
        //console.log("getAgentDistanceNormal: " + this.agentsOfMyTeam[0].p[0])
        return this.agentsOfMyTeam[0].p[0]

    },

    getAngleOneAgentOfMyTeam() {
        //console.log("getAgentAngleNormal: " + this.agentsOfMyTeam[0].p[1])
        return this.agentsOfMyTeam[0].p[1]

    },

    isBetween(val, min, max) {
        return min <= val && val <= max
    },

    isCurrentHearText(name) {
        if(this.isCurrentCMD("hear")) {
            return this.hearText.includes(name)
        } else {
            return false
        }
    },


    isCurrentHearTextFromAgent(name) {
        if(this.isCurrentCMD("hear")) {
            console.log(this.hearText + " === " + name)
            return this.hearText.includes('\"' + name + '\"')
        } else {
            return false
        }
    },

    isCurrentCMD(name) {
        return this.cmd === name
    },


}