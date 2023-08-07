const Taken = require('../../taken')
const CTRL_LOW = {
  side: 'l',
  execute(input, controllers, team, side, role, startGoal){
    const next = controllers[0]
    this.taken = Taken.setSee(input, team, side, role, startGoal)
    if(this.taken.ball && this.taken.ball.dist < 0.5){
      this.taken.canKick = true
    }else{
      this.taken.canKick = false
    }
    if(next){
      return next.execute(this.taken, controllers.slice(1))
    }
  }
}
module.exports = CTRL_LOW