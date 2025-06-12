var conversations =
{
    networkRegistry:undefined,
    registry:undefined,
    dialogue:undefined,
    
    init:function()
    {
        this.networkRegistry = new Set();
        this.registry = new Set();
        this.dialogue = new Map();
    },

    generateNetworkUid:function()
    {
        let networkUid;
        do {
            networkUid = Math.floor(Math.random() * 99999);
        } while (this.networkRegistry.has(networkUid));

        this.networkRegistry.add(networkUid);
        return networkUid;
    },

    generateConversationUid:function(networkUid1, networkUid2)
    {
        let conversationUid;

        conversationUid = networkUid1 * networkUid2;

        this.registry.add(conversationUid);

        return conversationUid;
    },

    generate:function(conversationUid)
    {
        console.log("Generate conversation for " + conversationUid);

        const message = {
            id: conversationUid,
            sendTo: "smart",
            topic: "Discussing their plans for an upcoming exam.",
            duration: "medium",
            names: ["Jack", "Jill"],
            roles: ["student", "student"],
            collaboration: -0.8,
            emotion: "negative",
            conversationType:"static"
        };

        client.sendMessage(message);
    },

    add: function(conversationId, message)
    {
        console.log("add conversationId: " + conversationId);

        if (!this.dialogue.has(conversationId))
        {
            this.dialogue.set(conversationId, []);
        }

        this.dialogue.get(conversationId).push(message);

        console.log(this.dialogue.get(conversationId)[0]);
    },

    get: function(conversationId, contact)
    {
        console.log("conversationId:", conversationId);
        console.log(this.dialogue);

        const messages = this.dialogue.get(conversationId);

        if (!messages || messages.length === 0)
        {
            this.dialogue.delete(conversationId); // Safe cleanup
            return true; // No more messages
        }

        if (contact)
        {
            const message = messages.shift();
            console.log("message:", message);

            // const msg = new SpeechSynthesisUtterance(message);
            // msg.lang = "en-US";
            // msg.rate = 1;
            // msg.pitch = 1;
            // msg.volume = 1;

            // // Wait until voices are loaded, then choose a better one
            // const setVoiceAndSpeak = () => {
            //     const voices = speechSynthesis.getVoices();
            //     const preferred = voices.find(v =>
            //         v.name.includes("Google") || v.name.includes("Natural") || v.lang === "en-US"
            //     );
            //     if (preferred) msg.voice = preferred;

            //     speechSynthesis.speak(msg);
            // };

            // if (speechSynthesis.getVoices().length === 0) {
            //     speechSynthesis.onvoiceschanged = setVoiceAndSpeak;
            // } else {
            //     setVoiceAndSpeak();
            // }

            renderer.displayConversationText(true);
            renderer.addConversationText(message);

            if (messages.length === 0)
            {
                this.dialogue.delete(conversationId);
                return true;
            }
        }

        return false;
    },

    hasConversationUid:function(networkUid1, networkUid2)
    {
        let conversationUid;

        conversationUid = networkUid1 * networkUid2;

        if(this.registry.has(conversationUid))
        {
            return false;
        }

        return true;
    },

    removeConversationUid:function(networkUid1, networkUid2)
    {
        let conversationUid;

        conversationUid = networkUid1 * networkUid2;

        if(this.registry.has(conversationUid))
        {
            this.registry.delete(conversationUid);
        }
    }
}