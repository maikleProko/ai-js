const CTRL_HIGH = {
  role: 'Other',
  execute(input){
    const immediate = this.immidiateReaction(input)
    if(immediate){
      return immediate
    }
    const defend = this.defendGoal(input)
    if(defend){
      return defend
    }
    if(this.last == "defend"){
      input.newAction = "return"
    }
    this.last = "previous"
  },
  immidiateReaction(input){
    let output = {}
    if(input.canKick) {
      this.last = "kick"
      output = this.playPasser(output, input)
      output = this.playOther(output, input)
      output = this.playKickerToFlag(output, input)
      output = this.playKickerGoal(output, input)
      output = this.playKickerFree(output)
      return output
    }
  },

  defendGoal(input) {
    if(input.ball) {
      const close = input.closest(input.team)
      if((close[0] && close[0].dist + 1 > input.ball.dist) || !close[0]){
        this.last = "defend"
        if(Math.abs(input.ball.angle) > 5){
          return {n: "turn", v: input.ball.angle}
        }
        if(input.playersListCommon().length > 10 && input.getCommonDist() > 20) {
          return undefined
        }
        if(input.playersListCommon().length > 5 && input.getCommonDist() < 5) {
          return {n: "dash", v: 10}
        }
        if(input.playersListMy[0] && input.playersListMy[0].p[0] < 15) {
          return {n: "dash", v: 50}
        }
        return {n: "dash", v: 110}
      }
    }
  },/**/


/*
  defendGoal(input) { // Защита ворот
    if(input.ball) {
      const close = input.closest(true)
      if((close[0] && close[0].dist > input.ball.dist)
          || !close[0] || (close[1] && close[1].dist > input.ball.dist)
          || !close[1]) {
        this.last = "defend"
        if (input.id < 4 && input.goalOwn && input.goalOwn.dist < 50) {
          input.newAction = "return"
        } else if (input.id > 7 && input.goalOther && input.goalOther.dist < 50) {
          input.newAction = "return"
        } else if (input.id > 3 && input.id < 8 && input.goalOwn && input.goalOwn.dist < 25){
          input.newAction = "return"
        }
        else {
          if (Math.abs(input.ball.angle) > 5)
            return {n: "turn", v: input.ball.angle}
          if (input.ball.dist > 1)
            return {n: "dash", v: 110}
          else
            return {n: "dash", v: 30}
        }
      }
    }
  },/**/

  playPasser(output, input) {
      if (input.role === "Passer" && input.playersListMy.length && Object.keys(output).length === 0) {
        input.newAction = "return"
        input.playersListMy.sort((p1, p2) => {
          if(typeof p1['p'] !== undefined && typeof p2['p'] !== undefined) {
            return p1[1] - p2[2]
          }
        })
        return this.passToMyTeamAgent(output, input)
      }
      return output
  },

  playOther(output, input) {
    if (input.role === "Other" && input.goalOther && Object.keys(output).length === 0) {
      if (input.goalOther.dist > 40)
        return {n: "kick", v: `30 ${input.goalOther.angle}`}
      return {n: "kick", v: `110 ${input.goalOther.angle}`}
    }
    return output
  },

  playKickerGoal(output, input) {
    if(input.goal && Object.keys(output).length === 0){
      return {n: "kick", v: `110 ${input.goal.angle}`}
    } else {
      return output
    }
  },

  playKickerFree(output) {
    if(Object.keys(output).length === 0) {
      return {n: "kick", v: `10 45`}
    } else {
      return output
    }
  },

  playKickerToFlag(output, input) {
    if(input.role === "KickerToFlag" && Object.keys(output).length === 0) {
      input.newAction = "return"
      output = this.kickFlagOther(output, input)
      output = this.kickFlag(output, input, this.makeNamePositionGoalConst(input, 't'))
      output = this.kickFlag(output, input, this.makeNamePositionGoalConst(input, 'b'))
    }
    return output
  },

  passToMyTeamAgent(output, input) {
    /*if (typeof input.playersListMy[0]['p'] !== undefined
        && (!input.goalOther || input.playersListMy[0].dist < input.goalOther.dist - 15)
        && input.playersListMy[0].dist > 4 && (!input.goalOwn || input.goalOwn.dist > 25)) {
      console.log("entry")
      return {n: "kick", v: `${input.playersListMy[0].dist * 2} ${input.playersListMy[0].angle}`}
    }
    else return output

     */
    input.playersListMy.forEach((player) => {
      if(player.p[0] > 10) {
        output = {n: "kick", v: `${player.p[0] * 3} ${player.p[1]}`}
      }
    })
    return output
  },

  makeNamePositionGoalConst(input, name) {
    return "f" + this.tryInvertPositionGoalConst(input) + name
  },

  tryInvertPositionGoalConst(input) {
      return input.side === 'l' ? 'r' : 'l'
  },


  kickFlagOther(output, input) {
    if (input.goalOther  && Object.keys(output).length === 0) {
      return {n: "kick", v: `80 ${input.goalOther.angle}`}
    } else {
      return output
    }
  },

  kickFlag(output, input, name) {
    if (input.flags[name] && Object.keys(output).length === 0) {
      return {n: "kick", v: `80 ${input.flags[name].angle}`}
    } else {
      return output
    }
  },

}
module.exports = CTRL_HIGH