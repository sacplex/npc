var localise =
{
    language: "english",
    dialogue: undefined,

    init: function()
    {
        // if (this.language !== "english")
        // {
        //     this.loadScript("languages/" + this.language + ".js", () => {
        //         if (typeof dialogue !== "undefined" && dialogue instanceof Map)
        //         {
        //             showMessageStyle.fontSize = (typeof dialogue_size !== "undefined" && dialogue_size != null) ? dialogue_size : 13;
        //             this.dialogue = dialogue;
        //             console.log("Dialogue loaded and assigned.");
        //         }
        //         else
        //         {
        //             console.error("Language script did not provide a valid 'dialogue' Map.");
        //         }
        //     });
        // }
    },

    loadScript: function(url, callback)
    {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => {
            console.log(`${url} loaded`);
            if (callback) callback();
        };
        script.onerror = () => {
            console.error(`Failed to load ${url}`);
        };
        document.head.appendChild(script);
    },

    get: function(message)
    {
        if (!this.dialogue) return message;
        return this.dialogue.get(message) || message;
    }
};


    // init:function()
    // {
    //     var WebSocketObject = window.WebSocket || window.MozWebSocket;

    //     if(!WebSocketObject)
    //     {
    //         console.log("Your browser does not support Websocket. Cloud will not work");
    //         return;
    //     }

    //     this.address = this.remoteAddress;
        
    //     this.websocket = new WebSocketObject(this.address);

    //     if(this.websocket)
    //         console.log("Localise Connected");
    //     // this.send(1234, "Hello, how are you?");
    // },

    // sendMessage:function(message)
    // {
    //     this.websocket.send(JSON.stringify(message));
    // },
//}