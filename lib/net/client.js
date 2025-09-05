var client =
{
    remoteAddress: "wss://tgame.dev:8765",
    localAddress: "ws://127.0.0.1:8555",
    address: undefined,
    websocket: undefined,
    role: "dumb",
    messageQueue: [],     // ✅ Queue for messages before connection opens
    connecting: false,    // ✅ Prevent multiple init calls

    init: function ()
    {
        var WebSocketObject = window.WebSocket || window.MozWebSocket;

        if (!WebSocketObject)
        {
            console.log("Your browser does not support WebSocket. Cloud will not work.");
            return;
        }

        this.address = this.remoteAddress;

        this.websocket = new WebSocketObject(this.address);
        
        this.websocket.onopen = () => {
            console.log("WebSocket open...");
            this.connecting = false;

            // ✅ Send queued messages
            while (this.messageQueue.length > 0) {
                const msg = this.messageQueue.shift();
                this.sendMessage(msg);
            }

            // Send initial role message
            this.sendMessage({ role: this.role });
        };
        this.websocket.onmessage = (msg) => this.handleMessage(msg);
        this.websocket.onerror = () =>
        {
            console.log("WebSocket error...");
        };
        this.websocket.onclose = () => {
            console.log("WebSocket connection closed. Reconnecting in 1s...");
            this.connecting = false;
            setTimeout(() => this.init(), 1000);
        };
    },

    sendMessage: function (message)
    {
        const send = () =>
        {
            console.log("Sending message to server:", message);
            this.websocket.send(JSON.stringify(message));
        };

        if (this.websocket && this.websocket.readyState === WebSocket.OPEN)
        {
            send();
        }
        else
        {
            console.warn("WebSocket not open. Attempting to reconnect...");

            // Try to reconnect
            this.init();

            // Wait a short time for connection to establish, then send
            setTimeout(() =>
            {
                if (this.websocket && this.websocket.readyState === WebSocket.OPEN)
                {
                    send();
                }
                else
                {
                    console.error("Failed to reconnect. Cannot send message:", message);
                }
            }, 500); // 500ms delay to allow connection to open
        }
    },

    handleMessage: function (message)
    {
        console.log("handleMessage");
        let messageObject;
        try
        {
            messageObject = JSON.parse(message.data);
        }
        catch (e)
        {
            console.error("Invalid JSON received:", message.data);
            return;
        }

        console.log("Message received from server:", messageObject);

        if (messageObject.sendTo && messageObject.sendTo !== "dumb")
        {
            console.log("Message not intended for this client role, ignoring.");
            return;
        }

        const type = messageObject.type || "unknown";

        switch (type)
        {
            case "login":
                this.handleLoginMessage(messageObject);
                break;
            case "conversation":
                this.handleConversationMessage(messageObject);
                break;
            case "spoke":
                this.handleSpokenToPlayer(messageObject);
                break;
            case "enrolled_students":
                this.handleEnrolledStudentsMessage(messageObject);
                break;
            case "economy":
                //console.log(renderer.clock.nextDay());
                break;
            default:
                console.warn("Unhandled message type:", type, messageObject);
                break;
        }
    },

    handleLoginMessage: function(messageObject)
    {
        console.log(messageObject);
    
        if (messageObject.message)
        {
            console.log("Processing login message:", messageObject.message);
    
            if (messageObject.message === "success")
            {
                game.team = "technology";
    
                // ✅ Load economy details if provided
                if (messageObject.economy)
                {
                    game.economy = messageObject.economy;
                    game.cash = messageObject.economy.cash;
                    game.expenses = new Map(Object.entries(messageObject.economy.expenses));

                    clock.day = game.economy.day;
    
                    console.log("Economy loaded:", game.economy);
                }
    
                game.startSinglePlayer();
            }
            else
            {
                alert(
                    "Login failed.\n\n" +
                    "The game code you entered is not valid or has expired.\n" +
                    "Please check your code and try again.\n\n" +
                    "Tip: Make sure there are no extra spaces before or after the code."
                );
            }
        }
    },

    handleConversationMessage:function (messageObject)
    {
        if (messageObject.message)
        {
            console.log("Processing conversation message:", messageObject.message);
            conversations.add(messageObject.id, messageObject.message);
        }
    },

    handleSpokenToPlayer:function(messageObject)
    {
        console.log(messageObject.message);

        renderer.showTextOutput(messageObject.message);

        if (messageObject.message)
        {
            //console.log("Processing spoken message to the player: ", messageObject.message);
            renderer.generateTextOutput(messageObject.message);
        }
    },

    handleEnrolledStudentsMessage: function (messageObject)
    {
        if (messageObject.message)
        {
            console.log("Processing enrolled students:", messageObject.message);
            game.updateEnrolledStudentGroups(messageObject.message);
        }
    }
};
