const Parses = require("./parses");
module.exports = {


    createAnswerCoordinatesForTwoFlags(yAnswers, xAnswers) {
        let answer = []

        for (let i = 0; i < 4; i++) {
            answer.push({x: xAnswers[i], y: yAnswers[i % 2]})
        }

        return answer
    },

    filterAnswersForTwoFlags(coordinates) {
        let answer = []
        for (let i = 0; i < coordinates.length; i++) {
            if (Math.abs(coordinates[i].x) <= 54 && Math.abs(coordinates[i].y) <= 32) {
                answer.push(coordinates[i])
            }
        }
        return answer
    },

    calculateError(coordinates, thirdFlag) {
        let x_3 = thirdFlag.x
        let y_3 = thirdFlag.y
        let d_3 = thirdFlag.d

        return Math.abs((coordinates.x - x_3) ** 2 + (coordinates.y - y_3) ** 2 - d_3 ** 2)
    },

    // MAIN FUNCTIONS

    getCoordinatesUsingTwoFlags(flagA, flagB) {
        let x_1 = flagA.x
        let y_1 = flagA.y
        let d_1 = flagA.d

        let x_2 = flagB.x
        let y_2 = flagB.y
        let d_2 = flagB.d

        let alpha = (y_1 - y_2) / (x_2 - x_1)
        let beta = (y_2 ** 2 - y_1 ** 2 + x_2 ** 2 - x_1 ** 2 + d_1 ** 2 - d_2 ** 2) / (2 * (x_2 - x_1))

        let a = alpha ** 2 + 1
        let b = -2 * (alpha * (x_1 - beta) + y_1)
        let c = (x_1 - beta) ** 2 + y_1 ** 2 - d_1 ** 2

        const yAnswers = []
        const xAnswers = []
        if (x_1 === x_2) {
            yAnswers.push((y_2 ** 2 - y_1 ** 2 + d_1 ** 2 - d_2 ** 2) / (2 * (y_2 - y_1)))
            yAnswers.push((y_2 ** 2 - y_1 ** 2 + d_1 ** 2 - d_2 ** 2) / (2 * (y_2 - y_1)))


            xAnswers.push(x_1 + Math.sqrt(d_1 ** 2 - (yAnswers[0] - y_1) ** 2))
            xAnswers.push(x_1 - Math.sqrt(d_1 ** 2 - (yAnswers[1] - y_1) ** 2))
            xAnswers.push(x_1 + Math.sqrt(d_1 ** 2 - (yAnswers[0] - y_1) ** 2))
            xAnswers.push(x_1 - Math.sqrt(d_1 ** 2 - (yAnswers[1] - y_1) ** 2))
        } else if (y_1 === y_2) {
            for (let i = 0; i < 4; i++) {
                xAnswers.push((x_2 ** 2 - x_1 ** 2 + d_1 ** 2 - d_2 ** 2) / (2 * (x_2 - x_1)))
            }

            yAnswers.push(y_1 + Math.sqrt(d_1 ** 2 - (xAnswers[0] - x_1) ** 2))
            yAnswers.push(y_1 - Math.sqrt(d_1 ** 2 - (xAnswers[0] - x_1) ** 2))
        } else {
            yAnswers.push((-b + Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a))
            yAnswers.push((-b - Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a))

            xAnswers.push(x_1 + Math.sqrt(d_1 ** 2 - (yAnswers[0] - y_1) ** 2))
            xAnswers.push(x_1 + Math.sqrt(d_1 ** 2 - (yAnswers[1] - y_1) ** 2))
            xAnswers.push(x_1 - Math.sqrt(d_1 ** 2 - (yAnswers[0] - y_1) ** 2))
            xAnswers.push(x_1 - Math.sqrt(d_1 ** 2 - (yAnswers[1] - y_1) ** 2))
        }

        return this.filterAnswersForTwoFlags(this.createAnswerCoordinatesForTwoFlags(yAnswers, xAnswers))
    },

    getCoordinatesUsingThreeFlags(flagA, flagB, flagC) {
        let x_1 = flagA.x
        let y_1 = flagA.y
        let d_1 = flagA.d

        let x_2 = flagB.x
        let y_2 = flagB.y
        let d_2 = flagB.d

        let x_3 = flagC.x
        let y_3 = flagC.y
        let d_3 = flagC.d

        if (new Set([x_1, x_2, x_3]).size === 3 && new Set([y_1, y_2, y_3]).size === 3) {
            let alpha_1 = (flagA.y - flagB.y) / (flagB.x - flagA.x)
            let alpha_2 = (flagA.y - flagC.y) / (flagC.x - flagA.x)

            let beta_1 = (y_2 ** 2 - y_1 ** 2 + x_2 ** 2 - x_1 ** 2 + d_1 ** 2 - d_2 ** 2) / (2 * (x_2 - x_1))
            let beta_2 = (y_3 ** 2 - y_1 ** 2 + x_3 ** 2 - x_1 ** 2 + d_1 ** 2 - d_3 ** 2) / (2 * (x_3 - x_1))

            let x = alpha_1 * ((beta_1 - beta_2) / (alpha_2 - alpha_1)) + beta_1
            let y = (beta_1 - beta_2) / (alpha_2 - alpha_1)

            return {x: x, y: y}
        } else {
            let answerForTwoFlags = this.getCoordinatesUsingTwoFlags(flagA, flagB)
            if (answerForTwoFlags.length > 0) {
                let answer = answerForTwoFlags[0]
                let error = this.calculateError(answer, flagC)
                for (let i = 0; i < answerForTwoFlags.length; i++) {
                    if (this.calculateError(answerForTwoFlags[i], flagC) < error) {
                        error = this.calculateError(answerForTwoFlags[i], flagC)
                        answer = answerForTwoFlags[i]
                    }
                }

                return answer
            }
        }

        return null
    },

    getDistanceToOtherPlayer(player, myPos, parsedFlags) {
        let flagA = parsedFlags[0]
        let flagB = null

        for (let i = 0; i < parsedFlags.length; i++) {
            if (flagA.x !== parsedFlags[i].x && flagA.y !== parsedFlags[i].y) {
                flagB = parsedFlags[i]
                break
            }
        }

        if (flagB === null) {
            return null
        }

        let x_1 = flagA.x
        let y_1 = flagA.y
        let d_1 = flagA.d
        let angle_1 = flagA.angle

        let x_2 = flagB.x
        let y_2 = flagB.y
        let d_2 = flagB.d
        let angle_2 = flagB.angle

        let x = myPos.x
        let y = myPos.y

        let d_alpha = player.p[0]
        let angle_alpha = player.p[1]

        let d_alpha_1 = Math.sqrt(Math.abs(d_1 ** 2 + d_alpha ** 2 - 2 * d_1 * d_alpha * Math.cos(Math.abs(angle_1 - angle_alpha)) * Math.PI / 180))
        let d_alpha_2 = Math.sqrt(Math.abs(d_2 ** 2 + d_alpha ** 2 - 2 * d_2 * d_alpha * Math.cos(Math.abs(angle_2 - angle_alpha)) * Math.PI / 180))

        flagA = {x: -x, y: y, d: d_alpha}
        flagB = {x: -x_1, y: -y_1, d: d_alpha_1}
        let flagC = {x: -x_2, y: -y_2, d: d_alpha_2}

        if (new Set([x_1, x_2, x]).size === 3 && new Set([y_1, y_2, y]).size === 3) {
            return this.getCoordinatesUsingThreeFlags(flagA, flagB, flagC)
        }

        return null
    },


    getMyPosEmpty(flags) {
        if (flags.length < 2) {
            //console.log("Not enough flags for locate player from team " + this.teamName)
            return {x: 0, y: 0}
        }
    },

    getMyPosUsingThreeFlags(flags, flagsCoordinates) {
        let coordinates = this.getCoordinatesUsingThreeFlags(
            Parses.getFlagProperties(flags[0], flagsCoordinates),
            Parses.getFlagProperties(flags[1], flagsCoordinates),
            Parses.getFlagProperties(flags[2], flagsCoordinates),
        )

        if (coordinates != null) {
            coordinates.y *= -1
            return coordinates
        }
        return {}
    },

    getMyPosUsingTwoFlags(flags, flagsCoordinates) {
        let coordinates = this.getCoordinatesUsingTwoFlags(
            Parses.getFlagProperties(flags[0], flagsCoordinates),
            Parses.getFlagProperties(flags[1], flagsCoordinates)
        )
        coordinates = coordinates.length > 0 ? coordinates[coordinates.length - 1] : null
        if (coordinates != null) {
            coordinates.y *= -1
            return coordinates
        }
    },


    getDistanceForOtherPlayer(player, flags) {
    const newFlags = []
    newFlags.push(player)
    flags.forEach((flag) => {
        const distanceForFlag = flag.p[0]
        const distanceForPlayer = player.p[0]
        const distanceBetweenFlagAndPlayer = Math.sqrt(Math.abs(
            (distanceForFlag * distanceForFlag) + (distanceForPlayer * distanceForPlayer)
            - 2 * distanceForPlayer * distanceForFlag * Math.cos(Math.abs(flag.p[1] - player.p[1]) * Math.PI / 180)
        ))
        newFlags.push(flag)
        newFlags[newFlags.length - 1].p[0] = distanceBetweenFlagAndPlayer
    })
    return newFlags
}
}