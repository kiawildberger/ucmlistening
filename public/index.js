const id = e => {return document.getElementById(e);}
let sessionCode;

async function setCode() {
    let resp = await fetch("./new")
    sessionCode = await resp.json()
    console.log(sessionCode)
}

function sendRec() {

    let packet = {
        code: sessionCode,
        music: sanitize(id("lname").value)
    }
    fetch('/send', {
        headers: {
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify(packet)
    })
    // .then(response => console.log((response.status === 200) ? "Send OK" : "Send Not OK"))
    .then(response => response.json()).then(data =>{
        console.log("server says "+data.message)
        showRec(data.recommendation)
    })
    .catch(err => console.log(err))
    id("lname").value = ""
    id("form").style.display = "none"
    id("ty").style.display = "block"
}

function invalidate() { // not working
    fetch('/inv', {
        headers: {
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify(sessionCode)
    })
}

function showRec(rec) {
    id("recText").innerText = rec.music
    let ts = new Date(parseInt(rec.ts))
    let formatTime = (ts.getHours() > 12) ? (ts.getHours() % 12)+"pm" : ts.getHours()+"am"
    // if(ts.getMinutes() >= 45) formatTime++ // round hours up after 45 minutes
    let formatDate = "on "+(ts.getMonth()+1)+"/"+ts.getDate()
    let dateDay = ts.getDate()
    let today = new Date().getDate()
    if(dateDay === today) { // i hope this bs works
        formatDate = "today"
    } else if(today - dateDay === 1) {
        formatDate = "yesterday"
    }
    id("recTime").innerText = `at ${formatTime} ${formatDate}`
    id("rec").style.display = "block"
}

function sanitize(string) { // stole lmao
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        "/": '&#x2F;',
    };
    const reg = /[&<>"'/]/ig;
    return string.replace(reg, (match) => (map[match]));
}

id("lname").addEventListener("keydown", key => {
    if(key.key === "Enter") {
        sendRec()
    }
})

id("submit").addEventListener("click", sendRec)

addEventListener("load", setCode)
// onbeforeunload = invalidate