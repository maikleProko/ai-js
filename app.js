
const VERSION = 7 // Версия сервера
const readline = require("readline");
const Agent = require("./agent");

//Tree
const treeGoalFirstPlayer = require("./treeActions/treeGoalFirstPlayer")
const treeGoalTwoPlayers = require("./treeActions/treeGoalTwoPlayers")
const treeGoalkeeper = require("./treeActions/treeGoalKeeper")
const treeGoalStriker = require("./treeActions/treeGoalStriker")
const treeGoalPasser = require("./treeActions/treeGoalPasser")
const treeGoalNotActive  = require("./treeActions/treeGoalNotActive")

//Auto
const autoGoalStriker = require("./autoActions/autoGoalStriker")
const autoGoalKeeper = require("./autoActions/autoGoalKeeper")

//Ctrl
let ctrlGoalKeeper = require("./ctrlActions/ctrlGoalKeeper/ctrlGoalKeeper")
let ctrlGoalStriker = require("./ctrlActions/ctrlGoalStriker/ctrlGoalStriker")

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

let questions = [
    ["Coordinates: ", "move"],
    ["Speed: : ", "speed"],
    //["Team name: : ", "teamName"]
]

let answer = {}

function sendQuestions(array2D) {
    if(array2D.length) {
        rl.question(array2D[0][0], function (variable) {
            answer[array2D[0][1]] = variable
            sendQuestions(removeFirstElementOfArray(array2D))
        });
    } else doAfterSendQuestions()
}

function removeFirstElementOfArray(array2D) {
    array2D.shift()
    return array2D
}

function doAfterSendQuestions() {
    //createAgentGoalKeeper("teamA", answer.speed, "l", answer.move)
    createAgentGoalStriker("teamA", answer.speed, "l", "-10 0", "Passer", "fprc")
    createAgentGoalStriker("teamA", answer.speed, "l", "-5 25", "Passer", "fprt")
    createAgentGoalStriker("teamA", answer.speed, "l", "-5 -25", "Passer", "fprb")
    createAgentGoalStriker("teamA", answer.speed, "l", "-15 -15", "Passer", "fc")
    createAgentGoalStriker("teamA", answer.speed, "l", "-15 15", "Passer", "fc")
    createAgentGoalStriker("teamA", answer.speed, "l", "-25 -15", "Passer", "fct")
    createAgentGoalStriker("teamA", answer.speed, "l", "-25 15", "Passer", "fcb")
    createAgentGoalStriker("teamA", answer.speed, "l", "-35 -25", "Passer", "fplt")
    createAgentGoalStriker("teamA", answer.speed, "l", "-35 0", "Passer", "fplc")
    createAgentGoalStriker("teamA", answer.speed, "l", "-35 25", "Passer", "fplb")
    createAgentGoalKeeper("teamA", answer.speed, "l", "-50 0")

    createAgentGoalStriker("teamB", answer.speed, "r", "-10 0", "Passer", "fplc")
    createAgentGoalStriker("teamB", answer.speed, "r", "-5 25", "Passer", "fplb")
    createAgentGoalStriker("teamB", answer.speed, "r", "-5 -25", "Passer", "fplt")
    createAgentGoalStriker("teamB", answer.speed, "r", "-15 -15", "Passer", "fc")
    createAgentGoalStriker("teamB", answer.speed, "r", "-15 15", "Passer", "fc")
    createAgentGoalStriker("teamB", answer.speed, "r", "-25 -15", "Passer", "fct")
    createAgentGoalStriker("teamB", answer.speed, "r", "-25 15", "Passer", "fcb")
    createAgentGoalStriker("teamB", answer.speed, "r", "-35 -25", "Passer", "fprb")
    createAgentGoalStriker("teamB", answer.speed, "r", "-35 0", "Passer", "fprc")
    createAgentGoalStriker("teamB", answer.speed, "r", "-35 25", "Passer", "fprt")
    createAgentGoalKeeper("teamB", answer.speed, "r", "-50 0")

/**/
}

function createAgentGoalStriker(teamName, speed, position, move, role, startGoal ) {
    createAgent(teamName, speed, position, ctrlGoalStriker, "Striker", move, role, startGoal)
}


function createAgentGoalKeeper(teamName, speed, position, move) {
    createAgent(teamName, speed, position, ctrlGoalKeeper, "Keeper", move, "None", "g")
}


function createAgent(teamName, speed, position, ctrlGoal, type = false, move, role, startGoal) {
    let agent = registerAgent(teamName, speed, position, ctrlGoal, type, role, startGoal, move)
    sendSocketForAgent(agent, "move", move)
}

function registerAgent(teamName, speed, position, ctrlGoal, type = false, role, startGoal, startMove) {
    let agent = new Agent(speed, position, teamName, ctrlGoal, type, role, startGoal, startMove); // Создание экземпляра агента
    require('./socket') (agent, teamName, VERSION) //Настройка сокета
    return agent
}



function sendSocketForAgent(agent, socket, variable) {
    setTimeout(()=>{
        agent.socketSend(socket, variable) // Размещение игрока на поле
        console.log("Sending to " + socket + ": " + variable);
    }, 300)
}

sendQuestions(questions)
