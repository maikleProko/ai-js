module.exports = {

    parseObjects(p) {
        return p.filter((obj) => obj.cmd && obj.p !== undefined && obj.p.length > 0)
    },

    parseFlags(p) {
        if(p) {
            return p.filter((obj) => obj.cmd && (obj.cmd.p[0] === 'f' || obj.cmd.p[0] === 'g'))
        } else {
            return []
        }
    },

    parseAgents(p) {
        return p.filter((obj) => obj.cmd && (obj.cmd.p[0] === 'p'))
    },

    parseBalls(p) {
        return p.filter((obj) => obj.cmd && (obj.cmd.p[0] === 'b'))
    },

    parseGates(p) {
        return p.filter((obj) => obj.cmd && (obj.cmd.p[0] === 'g'))
    },

    parseRequiredFlags(flags) {
        return flags.filter((obj) => obj.p.length === 4)
    },

    mergeToString(arr) {
        let str = ""
        if(arr) {
            arr.forEach(char => {
                str += char
            })
        }
        return str
    },

    getFlagByCMD(flag, flagsCoordinates) {
        return flagsCoordinates[this.mergeToString(flag.cmd.p)]
    },

    getFlagProperties(flag, flagsCoordinates) {
        let flagCMD = this.getFlagByCMD(flag, flagsCoordinates)
        console.log(JSON.stringify(flagCMD))
        if(flagCMD !== undefined)
            return {
                x: flagCMD.x,
                y: flagCMD.y,
                d: flag.p[0]
            }
        return {
            x: 0,
            y: 0,
            d: 0
        }
    },

    getFlagPropertiesWithCustomDistance(flag, flagsCoordinates, d) {
        let flagCMD = this.getFlagByCMD(flag, flagsCoordinates)
        return {
            x: flagCMD.x,
            y: flagCMD.y,
            d: d
        }
    },

    getAgentPropertiesWithCustomDistance(agent, d) {
        return {
            x: agent.x,
            y: agent.y,
            d: d
        }
    },

    getElementByPosition(arr, position) {
        if(position === "l") {
            return arr[this.getRandomInt(2, 3)]
        } else {
            return arr[this.getRandomInt(0, 1)]
        }
    },

    deepEqual (obj1, obj2){
        return JSON.stringify(obj1)===JSON.stringify(obj2);
    },

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    },
}