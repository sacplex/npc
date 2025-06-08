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
            emotion: "negative"
        };

        client.sendMessage(message);
    },

    add:function(conversationId, message)
    {
        console.log("add conversationId: " + conversationId);
        if(!conversations.dialogue.has(conversationId))
        {
            let messages = [];
            messages.push(message);
            this.dialogue.set(conversationId, messages);
        }
        else
        {
            let messages = this.dialogue.get(conversationId);
            messages.push(message);
            this.dialogue.set(conversationId, messages);
        }
        console.log(this.dialogue.get(conversationId)[0]);
    },

    get:function(conversationId, contact)
    {
        console.log("conversationId: " + conversationId);
        console.log(this.dialogue);
        let messages = this.dialogue.get(conversationId);
        let message = undefined;
        
        if(contact)
        {
            message = messages.pop(0);

            if(messages.length == 0)
            {
                this.dialogue.delete(conversationId);
                return true;
            }
        }

        if(messages == undefined)
        {
            return true;
        }

        if(contact)
        {
            console.log("message: " + message);
            renderer.displayConversationText(true);
            renderer.addConversationText(message);  
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