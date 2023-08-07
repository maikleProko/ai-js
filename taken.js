const Parses = require("./parses");
const MathFlags = require("./mathFlags");
const flagsCoordinates = require("./flagsCoordinates")
const {getMyPos} = require("./treeActions/treeManager");



const Taken = {
  state: {
    team: [], // команда противника
    teamOwn: [], // моя команта
  },
  setHear(input) {
    // TODO
  },

  isValidObject(object) {
    return object.p.length > 1
  },

  getObject(object) {
    if (!object) return undefined
    return {
      f: Parses.mergeToString(object.cmd.p),
      dist: this.isValidObject(object) ? object.p[0] : undefined,
      angle: this.isValidObject(object) ? object.p[1] : object.p[0]
    }
  },

  findObject(input, name) {
    return this.getObject(input.find(object => object.cmd && Parses.mergeToString(object.cmd.p) === name))
  },


  inputFilterWithInclude(input, char, include) {

    return input.filter(object => object.cmd && object.cmd.p[0] === char && object.cmd.p.includes(include))
  },

  inputFilterWithoutInclude(input, char, include) {
    return input.filter(object => object.cmd && object.cmd.p[0] === char && !object.cmd.p.includes(include))
  },

  makeLookAroundFlags(input, flags) {
    let object = {}
    flags.forEach((element) => {
      object[element] = this.findObject(input, element)
    })
    return object
  },

  getAnotherGoal(input, side) {
    const goalOtherTeam = input.find((obj) => obj.cmd && (obj.cmd.p.join('') === ((side === 'r') ? 'gl' : 'gr')))
    console.log(side)
    return (goalOtherTeam) ? {
      dist: goalOtherTeam.p[0],
      angle: goalOtherTeam.p[1]
    } : null
  },

  getAgentsOfMyTeam(p, team) {
    let found = []
    //console.log(this.cmd + " " + JSON.stringify(this.p))
      p.forEach((object)=>{
        if(
            object.cmd !== undefined &&
            (typeof object.cmd['p'] !== undefined) &&
            (typeof object.cmd.p['length'] !== undefined) &&
            object.cmd.p.length > 2 &&
            object.cmd.p[0] === "p" && object.cmd.p[1] === "\"" + team + "\""
        ) {
          found.push(object)
        }
      })
    return found
  },



  setSee(input, team, side, role, startGoal) {
    return {
      time: input[0],
      ball: this.findObject(input, 'b'),
      goal: side === 'l' ? this.findObject(input, 'gr') : this.findObject(input, 'gl'),
      goalOwn: side === 'l' ? this.findObject(input, 'gl') : this.findObject(input, 'gr'),
      lookAroundFlags: this.makeLookAroundFlags(input, ["fprb", "fprc", "fprt"]),
      teamOwn: this.getAgentsOfMyTeam(input, team).map(object => this.getObject(object)),
      teamEnemy: this.inputFilterWithoutInclude(input, 'p', '\"' + team + '\"').map(object => this.getObject(object)),
      topFlagsCount: this.inputFilterWithInclude(input, 'f', 't').length,
      botFlagsCount: this.inputFilterWithInclude(input, 'f', 'b').length,

      flags: Parses.parseFlags(input),
      role: role,
      startGoal: startGoal,
      myPos: this.getMyPos(input),
      team: team,
      playersListMy: this.getAgentsOfMyTeam(input, team),
      playersListEnemy: this.inputFilterWithoutInclude(input, 'p', '\"' + team + '\"'),
      side: side,
      goalOther: this.getAnotherGoal(input, side),
/*
      pushDistanceList(distanceList, p) {
        let arr = MathFlags.getDistanceToOtherPlayer(p, getMyPos(), this.flags)
        let playerCoords = arr && arr.length > 3 ? MathFlags.getMyPosUsingThreeFlags(arr[0], arr[1], arr[2]) : null
        if (playerCoords) {
          distanceList.push({
            coords: playerCoords,
            dist: Math.sqrt(this.ball.p[0]**2 + p.p[0]**2 - 2*this.ball.p[0]*p.p[0]*Math.cos((p.p[1] - this.ball.p[[1]])*Math.PI/ 180))
          })
        }
        return distanceList
      },*/

      playersListCommon() {
        let arr = []
        arr.push(...this.playersListMy)
        arr.push(...this.playersListEnemy)
        return arr
      },

      pushDistanceList(distanceList, p) {
        let arr = MathFlags.getDistanceForOtherPlayer(p, this.flags.filter((p) => true))
        let playerCoords = arr && arr.length > 3 ? MathFlags.getMyPosUsingThreeFlags(arr, flagsCoordinates) : null
        if (playerCoords && this.ball.p !== undefined) {
          distanceList.push({
            coords: playerCoords,
            dist: Math.sqrt(this.ball.p[0]**2 + p.p[0]**2 - 2*this.ball.p[0]*p.p[0]*Math.cos((p.p[1] - this.ball.p[[1]])*Math.PI/ 180))
          })
        }
        return distanceList
      },

      createDistanceList(playersList) {
        let distanceList = []
        playersList.forEach((p) => {
          distanceList = this.pushDistanceList(distanceList, p)
        })
        distanceList.sort((dist1, dist2) => {
          return dist1.dist - dist2.dist
        })
        return  distanceList
      },

      createPlayersList(team) {
        if (team) {
          return this.playersListMy
        } else {
          return this.playersListCommon()
        }
      },

      getCommonDist() {
        let sum_dist = 0
        this.playersListCommon().forEach((object) => {
          sum_dist += object.p[0]
        })
        return sum_dist / this.playersListCommon().length
      },

      closest(team) {
        if (this.ball) {
          if (this.flags.length < 2) {
            console.log('Мало флагов')
          } else {
            return this.createDistanceList(this.createPlayersList(team))
          }
        }
        return []
      },/**/



    }
  },

/*
  setSeeAuto(input, team, side) {
    this.state = {
      time: input[0],
      ball: this.findObject(input, 'b'),
      goal: side === 'l' ? this.findObject(input, 'gr') : this.findObject(input, 'gl'),
      goalOwn: side === 'l' ? this.findObject(input, 'gl') : this.findObject(input, 'gr'),
      lookAroundFlags: this.makeLookAroundFlags(input, ["fprb", "fprc", "fprt"]),
      teamOwn: this.inputFilterWithInclude(input, 'p', team).map(object => this.getObject(object)),
      teamEnemy: this.inputFilterWithoutInclude(input, 'p', team).map(object => this.getObject(object)),
      topFlagsCount: this.inputFilterWithInclude(input, 'f', 't').length,
      botFlagsCount: this.inputFilterWithInclude(input, 'f', 'b').length
    }
    return this.state
  },*/




  getMyPos(p) {
    let flags = Parses.parseFlags(p)
    //console.log(flags)
    if (flags.length < 2) {
      return MathFlags.getMyPosEmpty(flags)
    }
    if (flags.length >= 3) {
      //console.log("have flags3")
      return MathFlags.getMyPosUsingThreeFlags(flags, flagsCoordinates)
    }
    if (flags.length >= 2) {
      //console.log("have flags2")
      return MathFlags.getMyPosUsingTwoFlags(flags, flagsCoordinates)
    }
  },

  getDistanceToOtherPlayer(player, myPos, parsedFlags) {
    return MathFlags.getDistanceToOtherPlayer(player, myPos, parsedFlags)
  }

}


module.exports = Taken