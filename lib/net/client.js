var client =
{
    remoteAddress:"wss://tgame.dev:8765",
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

        this.address = this.remoteAddress;
        
        this.websocket = new WebSocketObject(this.address);
        this.websocket.onmessage = client.handleMessage;

        this.websocket.onopen = () => {
            console.log("Web Socket open...");
        }

        this.websocket.onerror = () => {
            console.log("Web Socket error...");            
        }
    },

    sendMessage:function(message)
    {
        console.log("sendMessage");
        this.websocket.send(JSON.stringify(message));
    },

    handleMessage:function(message)
    {
        var messageObject = JSON.parse(message.data);

        console.log(messageObject);

        switch(messageObject.type)
        {
            case "dumb":
                client.handleConversationMessage(messageObject);
                break;
        }
    },

    handleConversationMessage:function(messageObject)
    {
        if(messageObject.message)
        {
            conversations.add(messageObject.id, messageObject.message);
        }
    },
}