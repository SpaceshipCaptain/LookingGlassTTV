console.log('ttvlookingGlass extension initiated') //testing
let gob = {};
let inputed = [];
let urlg = window.location
if (urlg.hostname == "clips.twitch.tv"){gob.cslug = urlg.pathname.replace(/\W/g, ''); gob.host = "clips";};
if (urlg.hostname == "www.twitch.tv"){gob.cslug = urlg.pathname.substring(urlg.pathname.lastIndexOf("/") + 1); gob.host = "twitch"};
//gob.cslug = " " for testing

window.onload=() =>{

    setTimeout(() => { //if you don't have a 500ms timeout shit breaks on load randomly so just leave this here

        if(gob.host == "clips"){var tar = document.querySelector("div.tw-pd-t-1")}; //clips.twitch.tv/blahdbladhbladh view
        if(gob.host == "twitch"){var tar = document.querySelector("div.tw-mg-t-2")}; //channel clips view eg twitch.tv/moonmoon/clips/blahblahblah

        let cdiv = document.createElement('div')
        var created = tar.parentNode.insertBefore(cdiv, tar)
        created.setAttribute("id", "finderWrap");
        created.style.background = "#0e0e10";

        var top = document.getElementById('finderWrap').appendChild(document.createElement('div'))
        top.setAttribute("id", "topd")
        
        var bot = document.getElementById('finderWrap').appendChild(document.createElement('div'))
        bot.setAttribute("id", "botd")

        var createind = document.getElementById('topd').appendChild(document.createElement('div'))
        createind.setAttribute("id", "ind")

        createp = document.getElementById('ind').appendChild(document.createElement('input'))
        createp.setAttribute("id", "targetid")
        createp.setAttribute("placeholder", "Channel Name")

        submitb = document.getElementById('topd').appendChild(document.createElement('button'))
        submitb.setAttribute("id", "submitb")
        sbutton = document.getElementById('submitb').appendChild(document.createElement('img'))
        sbutton.src = chrome.runtime.getURL("plus.svg");
        
        createinfod = document.getElementById('topd').appendChild(document.createElement('div'))
        createinfod.setAttribute("id", "infodiv")
        infodiv.innerText = "Submit a name to get their perspective.";

        let evel = document.getElementById('targetid')
        evel.addEventListener("keydown", (event) =>{
            if(event.defaultPrevented){return;}

            switch(event.code) {
                case "Enter": case "NumpadEnter":
                start();
            }
            })
        submitb.addEventListener("click", (event) =>{
                start();
        })
        let init = async() => {
            gob.cinfo = await clipInfo(gob.cslug);
            getctime();
        }    
        init();
    }, 750);
}

let start = async () =>{
    var name = getinput();
    if(name === ""){infodiv.innerText = "Empty input. Enter name.";return}; //no blank input
    if(inputedtest(name) === true){infodiv.innerText = "Repeat entry. Try someone else.";return}; //checks for repeat inputs
    inputed.push(name);
    var gid = await getid(inputed[inputed.length-1]);
    if(gid == null){return;} //checks if name is a twich user
    gob.varray = await getvods(gid);
    arrayvods();
}

let twitchapi = async (call) =>{
    console.log('twitchapi')
    const response = await fetch(`https://api.twitch.tv/kraken/${call}`, {
        headers: {
            Accept: 'application/vnd.twitchtv.v5+json',
            'Client-ID': 'zs377ogpzz01ogfx26pvbddx9jodg1',
        },
    })
    var data = await response.json();
    return data
}

function inputedtest(current){ //input name and returns true if contained within array already
    for(var i = 0; i < inputed.length; i++){
        if(current === inputed[i]){return true}
    }
    return false;
}

function getctime(){
    if(gob.cinfo.vod == null){ //if clip has no vod uses the less reliable created at. If someone creates a clip from a old vod, this method can be months off but usually works
        gob.start = ((Date.parse(new Date(gob.cinfo.created_at)))/1000)-30 
        infodiv.innerText = "Clip doesn't have a vod, links generated can be wildly innaccurate if this clip wasn't created during a live broadcast."
        infodiv.style.color = "#D68029";
        console.log('This clip does not have a vod but trying');
    }
    else{
        gob.offset = gob.cinfo.vod.offset;
        vidInfo()
    }
}

function getinput(){
    iname =  (createp.value).replace(/\W/g, '');//clears the input of non alphanumeric characters
    createp.value = ""; //clears input box
    return iname;
}

let getid = async (name) =>{
    console.log('getid')
    var urle = `users?login=${name}`
    try {
        var channelinfo = await twitchapi(urle)
        if(channelinfo.users.length === 0){infodiv.innerText = "user doesn't exist"; return;} //fix this
        var id = channelinfo.users[0]._id;
        return id;
    } catch(error) {
        console.log(error)
    }
    
}

let getvods = async (id) =>{
    console.log('getvods');
    var urle = `channels/${id}/videos?limit=100&broadcast_type=archive`;
    try {
         var vods = (await twitchapi(urle)).videos;
         return vods;
    } catch(error) {
        console.log(error)
    }
}

let vidInfo = async () =>{
    console.log('vidInfo');
    var urle = `videos/${gob.cinfo.vod.id}`
    try {
        var ca = (await twitchapi(urle)).created_at
        gob.start = ((Date.parse(new Date(ca)))/1000)+gob.offset;
    } catch(error) {
        console.log(error)
    }
}

let clipInfo = async (slug) =>{
    console.log('clipInfo');
    var urle = `clips/${slug}`
    try {
        var info = await twitchapi(urle)
        return info;
    } catch(error) {
        console.log(error);
    }
}

function secondsCalc(d) {
    console.log('secondsCalc')
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = h > 0 ? h + "h" : "";
    var mDisplay = m > 0 ? m + "m" : "";
    var sDisplay = s > 0 ? s + "s" : "";
    return hDisplay + mDisplay + sDisplay; 
}

function arrayvods(){
    console.log('arrayvods')
    var vodstart = [];
    var vodend = [];
    for(var i = 0; i < gob.varray.length; i++){ //gets start and end times of inputed user's last 100 vods
        var c = (Date.parse(new Date(gob.varray[i].published_at))/1000)
        vodstart.push(c) //array of vod starts in seconds
        vodend.push(c+(gob.varray[i].length)) //adds vod  length to get end time
    }
    if(gob.start < vodstart[vodstart.length-1]){
        gob.color = "gray";
        infodiv.innerText = `This clip is older than ${inputed[inputed.length-1]}'s last ${gob.varray.length} vods`;
        cl();
        return 
    }
    else{
        for(var i = 0;i < vodstart.length; i++){
            if(gob.start > vodstart[i] && gob.start < vodend[i]){
                var ts = secondsCalc(gob.start-vodstart[i])
                gob.link = ((gob.varray[i].url).concat("?t=")).concat(ts)
                gob.color="green";
                cl();
                infodiv.innerText = `clip occured ${i+1} vods ago!`
                return console.log(gob.link)
            }
            else{
                console.log('no')
            }
        }
        gob.color="red";
        gob.link = "novod";
        cl();
        infodiv.innerText = `clip was not in ${inputed[inputed.length-1]}'s last ${gob.varray.length} vods`;
    }
}

function cl(){
    var ce = document.getElementById('botd').appendChild(document.createElement('div'))
    ce.setAttribute("class","ce")
    ce.setAttribute("id",`${inputed[inputed.length-1]}`)
    ce.setAttribute("onclick", `window.open('${gob.link}', "_blank")`);
    var cn = document.getElementById(`${inputed[inputed.length-1]}`).appendChild(document.createElement('p'))
    cn.setAttribute("class", "plink")
    cn.innerText = `${(inputed[inputed.length-1]).toUpperCase()}`;
    if(gob.color === "green"){ce.style.background = "#05483F"}; 
    if(gob.color === "red"){ce.style.background = "#7F0423";}; 
    if(gob.color === "gray"){ce.style.background = "#505050";}; 
}



