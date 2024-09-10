const express = require("express")
const app = express()
const fs = require("fs")
const port = 8194
const codeUpperBound = 10000;

app.use(express.static("public"))
app.use(express.json())
app.get("/", (req, res) => {
    res.sendFile(__dirname+"/index.html")
})

/* TODO:
    clear active codes every 5 minutes DONE
    keep track of the number of submissions Hourly and make an average. get some Stats
    how am i going to moderate this... should i keep the json file open in Numbers the whole time? how can i do that on the pi...
        - or should i use digitalocean and do it there
    log IPs and restrict people to once an hour HOW??? it could be okay i guess...
    make the After Form Submit page -- the kickback recommendations
*/

function clearCode(code) {
    let data = JSON.parse(fs.readFileSync("./data.json"))
    if(data["activeCodes"].includes(code)) { // makin sure
        data["activeCodes"].splice(data["activeCodes"].indexOf(code), 1) // invalidate code
        fs.writeFileSync("./data.json", JSON.stringify(data))
        // console.log(code+" wrecked")
    }
}

function genValidCode() {
    let code = btoa(Math.floor(Math.random()*codeUpperBound))
    let data = JSON.parse(fs.readFileSync("./data.json"))
    if(data["activeCodes"].includes(code)) {
        genValidCode()
    } else {
        data["activeCodes"].push(code)
        fs.writeFileSync("./data.json", JSON.stringify(data))
        setTimeout(() => clearCode(code), 5*60000) // expires after 5 minutes
        return code;
    }
}

app.get("/new", (req, res) => {
    res.send({number: genValidCode()})
})

app.post("/inv", (req, res) => { // invalidate code. not working
    let code = req.body.code
    console.log(req.body.code+" received")
    clearCode(code)
})

app.post("/send", (req, res) => { // a Code that should match array in Active Codes, the music rec... ip?
    let queryCode = req.body.code.number
    let music = req.body.music
    let data = JSON.parse(fs.readFileSync("./data.json"))
    if(data["activeCodes"].includes(queryCode)) { // yayy valid request
        clearCode(queryCode)
        let recommendation = data["music"][Math.floor(Math.random()*data["music"].length)]
        res.send({
            message: "code good, recorded.",
            recommendation: data["music"][Math.floor(Math.random()*data["music"].length)]
        })
        // i dont have to make sure it's not the one that just got sent in because i dont push that to the array til after :wink:
        data["music"].push({
            music: music,
            ts: Date.now()
        })
        fs.writeFileSync("./data.json", JSON.stringify(data))
    } else {
        res.send({message: "LOL code invalid..."})
    }
})

app.listen(port, () => {
    console.log('server listening on '+port)
    let template = fs.readFileSync("./datatemplate.json")
    fs.writeFileSync("./data.json", template) // clear data on server restart (often bad.)
})