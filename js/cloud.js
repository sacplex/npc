var cloud =
{
    remoteAddress:"wss://tgame.dev:8565",
    localAddress:"ws://127.0.0.1:8555",
    address:undefined,
    //ddress:"wss://13.239.94.229:8443",
    websocket:undefined,

    init:function()
    {
        var WebSocketObject = window.WebSocket || window.MozWebSocket;

        if(!WebSocketObject)
        {
            console.log("Your browser does not support Websocket. Cloud will not work");
            return;
        }

        this.address = this.localAddress;

        cloud.initUnrealSetupData();
        
        this.websocket = new WebSocketObject(this.address);
        this.websocket.onmessage = cloud.handleMessage;

        this.websocket.onopen = () => {
            console.log("Web Socket open...");
            this.sendMessage({"type":"web"});
        }

        this.websocket.onerror = () => {
            console.log("Web Socket error...");            
        }
    },

    initUnrealSetupData:function()
    {
        debug.production = true;
        debug.audio = true;
        debug.audioMusic = true;
        debug.audioVoice = true;
        debug.audioNarration = true;
        debug.fogOfWar = true;
        debug.skipIntro = true;
        debug.skipUI = false;
        debug.skipMissionBriefing = true;
        game.campaignMode = true;
        game.team = "technology";
    },

    handleMessage:function(message)
    {
        var messageObject = JSON.parse(message.data);

        switch(messageObject.type)
        {
            case "unreal":
                cloud.handleUnrealMessage(messageObject);
                break;
        }
    },

    handleUnrealMessage:function(messageObject)
    {
        console.log(messageObject.name);

        switch(messageObject.name)
        {
            case "setup":
                debug.production = messageObject.production;
                debug.audio = messageObject.audio;
                debug.audioMusic = messageObject.audioMusic;
                debug.audioVoice = messageObject.audioVoice;
                debug.audioNarration = messageObject.audioNarration;
                debug.fogOfWar = messageObject.fogOfWar;
                debug.skipIntro = messageObject.skipIntro;
                debug.skipUI = messageObject.skipUI;
                debug.skipMissionBriefing = messageObject.skipMissionBriefing;
                game.campaignMode = messageObject.campaignMode;
                game.team = messageObject.team;
                break;
            case "ingame":
                singleplayer.currentLevel = messageObject.startLevel;

                renderer.init();    
                game.init();

                console.log("start game");
                break;
        }
    },

    send:function()
    {
        if(flags.CEF_ACCESS)
            this.sendMessage({"update":"update the unreal game data"});
    },

    sendMessage:function(message)
    {
        this.websocket.send(JSON.stringify(message));
    },

    sendNextLevel:function()
    {
        if(flags.CEF_ACCESS)
        {
            let nextLevel = singleplayer.currentLevel + 1;
            let paycheck = economy.cash * 0.1;

            this.sendMessage(
                {
                    "type":"update",
                    "startLevel":nextLevel,
                    "paycheck":paycheck
                }
            );
        }
    },
}