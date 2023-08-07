const {mergeToString} = require("../../parses");
const CTRL_MIDDLE = {
  action: "return",
  turnData: "ft0",
  startGoal: '',
  invertPositionGoal: false,

  execute(input, controllers) {
    const next = controllers[0]
    switch(this.action){
      case "return":
        input.cmd = this.actionReturn(input)
        break
    }
    input.action = this.action
    if(next) {
      const command = next.execute(input, controllers.slice(1))
      if(command) return command
      if(input.newAction) this.action = input.newAction
      return input.cmd
    }
  },
  /*
  actionReturn(input) {
    if(!input.goalOwn){
      return {n: "turn", v: 60}
    }
    if(Math.abs(input.goalOwn.p[1]) > 10){
      return {n: "turn", v: input.goalOwn.p[1]}
    }
    if(input.goalOwn.p[0] > 3){
      return {n: "dash", v: input.goalOwn.p[0] * 2 + 30}
    }
    this.action = "rotateCenter"
    return {n: "turn", v: 180}
  },*/

  actionReturn(input) { // Возврат к своим воротам
    let output = {}
    output = this.checkAndReturnRotate60(output, input, input.startGoal)
    output = this.checkAndReturnRotateGoal(output, input, input.startGoal)
    output = this.checkAndReturnDash80(output, input, input.startGoal)
    output = this.checkAndReturnRotateDefault(output)
    //this.action = "seekBall"
    return output
  },




  checkAndReturnRotate60(output, input, goal) {
    if(Object.keys(output).length === 0 && this.getFlagByName(input.flags, goal) === null) {
      return {n: "turn", v: 60}
    }  else {
      return output
    }
  },

  checkAndReturnRotateGoal(output, input, goal) {
    if(Object.keys(output).length === 0 && Math.abs(this.getFlagByName(input.flags, goal).p[1]) > 1){
      return {n: "turn", v: this.getFlagByName(input.flags, goal).p[1]}
    } else {
      return output
    }
  },

  getFlagByName(flags, name) {
    let output = null
    flags.forEach((object)=>{
      if(mergeToString(object.cmd.p) === name) {
        output = object
      }
    })
    return output
  },

  checkAndReturnDash80(output, input, goal) {
    if(Object.keys(output).length === 0 && this.getFlagByName(input.flags, goal).p[0] > 3){
      return {n: "dash", v: 80}
    } else {
      return output
    }
  },

  checkAndReturnRotateDefault(output) {
    if(Object.keys(output).length === 0) {
      return {n: "turn", v: 180}
    }  else {
      return output
    }
  },

  rotateCenter(input) {
    if(!input.flags["fc"]) {
      return {n: "turn", v: 60}
    }
    this.action = "seekBall"
    return {n: "turn", v: input.flags["fc"].p[1]}
  },

  seekBall(input) {
    if (!input.ball)
      return {n: "turn", v: 45}
    else {
      return {n: "turn", v: input.ball.angle}
    }
  }
}
module.exports = CTRL_MIDDLE