var client =
{
    remoteAddress:"wss://tgame.dev:8765",
    localAddress:"ws://127.0.0.1:8555",
    address:undefined,
    //ddress:"wss://13.239.94.229:8443",
    websocket:undefined,
    role: "dumb",

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
        this.websocket.onmessage = (msg) => this.handleMessage(msg);
        this.websocket.onopen = () => {
            console.log("WebSocket open...");
            console.log("Role: " + this.role);
            this.sendMessage({ role: this.role });
        };

        this.websocket.onerror = () => {
            console.log("Web Socket error...");            
        };

        this.websocket.onclose = () => {
            console.log("WebSocket connection closed");
            // Optionally, reconnect or notify user
        };
    },

    sendMessage:function(message)
    {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN)
        {
            console.log("sendMessage");
            this.websocket.send(JSON.stringify(message));
        }
        else
        {
            console.warn("WebSocket is not open. Message not sent:", message);
        }
    },

    handleMessage:function(message)
    {
        try
        {
            var messageObject = JSON.parse(message.data);
        }
        catch (e)
        {
            console.error("Invalid JSON received:", message.data);
            return;
        }

        console.log(messageObject);

        switch(messageObject.sendTo)
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