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

    generate:function(uid1, uid2)
    {
        console.log("Generate conversation for " + uid1 + ", and " + uid2);

        const message = {
            id: uid1 * uid2,
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
        if(!this.dialogue.has(conversationId))
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