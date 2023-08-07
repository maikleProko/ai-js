const Parses = require("./parses");
const MathFlags = require("./mathFlags");

class movableCharacter {
    constructor(speed, controller) {
        this.speed = speed
        this.controller = controller

    }

    turnSelf() {
        this.act = { n: "turn", v: this.speed }
    }

    turnSelfToObject(object) {
        let sign = Math.sign(object.p[1])
        this.act = { n: "turn", v: this.speed * sign }
    }

    runForward(speed) {
        this.act = { n: "dash", v: speed }
    }

    stopRunning() {
        this.act = { n: "dash", v: 0 }
    }

    KickSide() {
        console.log("Kick side")
        this.act = { n: "kick", v: "10 45" }
    }

    KickSideDirection(dir) {
        console.log("Kick side")
        this.act = { n: "kick", v: `10 ${dir}` }
    }

    KickForward() {
        console.log("Kick forward")
        this.act = { n: "kick", v: "100 0" }
    }


    seeAndGoToObject(inputName, arr, minDistance, handler) {
        if(this.isObjectVisible(inputName, arr)) {
            this.goToObject(this.getObjectVisible(inputName, arr), minDistance, handler)
        } else {
            this.turnSelf()
        }
    }

    seeAndKickObject(inputName, arr, handler) {
        if(this.isObjectVisible(inputName, arr)) {
            if(this.isObjectLocatedForward(this.getObjectVisible(inputName, arr))) {
                this.KickForward()
            } else {
                this.KickSideDirection(this.getObjectVisible(inputName, arr).p[1])
            }
        } else {
            this.KickSide()
        }
        handler()
    }


    goToObject(object, minDistance, handler) {
        if(this.isObjectFar(object, minDistance)) {
            if(this.isObjectLocatedForward(object)) {
                this.runForward(50)
            } else {
                this.turnSelfToObject(object)
            }
        } else {
            this.stopRunning()
            handler()
        }
    }



    getActByNumber(number) {
        return this.controller.acts.length > number ? this.controller.acts[number] : this.controller.acts[this.controller.acts.length-1];
    }

    isObjectVisible(inputName, arr) {
        let out = false
        arr.forEach((object)=>{
            if(Parses.mergeToString(object.cmd.p) === inputName) {
                out = true
            }
        })
        return out
    }

    getObjectVisible(inputName, arr) {
        let out = {}
        arr.forEach((object)=>{
            if(Parses.mergeToString(object.cmd.p) === inputName) {
                out = object
            }
        })
        return out
    }

    isObjectFar(object, minDistance) {
        return object.p[0] > minDistance;
    }

    isObjectLocatedForward(object) {
        return Math.abs(object.p[1]) < 10
    }

}

module.exports = movableCharacter