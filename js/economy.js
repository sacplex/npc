var economy = 
{
    lecturerTime:0,
    narratorTime:0,
    tutorTime:0,
    librarianTime:0,
    cash: 200,
    expenses: undefined,
    problems:[],
    penalties:[],
    payout: {
        messagesByStudent: new Map(), // Map<studentName, messageCount>
        bonus: 1,
        pay: 0
    },
    
    init: function()
    {
        console.log(this.expenses);
    },

    add: function(name, cost)
    {
        this.expenses.set(
            name,
            {
                "name": name,
                "cost": cost,
                "toggle": false,
                "status":""
            }
        );
    },

    // Record each conversation during the day
    set: function(studentName, count = 1)
    {
        let currentCount = this.payout.messagesByStudent.get(studentName) || 0;
        let newCount = currentCount + count;
        this.payout.messagesByStudent.set(studentName, newCount);
    },

    // Calculate end-of-day payout
    setPayout: function()
    {
        
        let pay = 0;

        let uniqueStudents = this.payout.messagesByStudent.size;

        // Breadth bonus: encourage talking to more people
        let breadthMultiplier = 1 + (Math.min(uniqueStudents, 5)); // max +50%

        for (let [name, count] of this.payout.messagesByStudent.entries())
        {
            // Depth reward: diminishing returns for each student
            for (let i = 1; i <= count; i++)
            {
                pay += this.getMessageValue(i);
            }
        }

        // Apply breadth bonus and any global bonus
        pay = pay * breadthMultiplier * this.payout.bonus;

        // Add to cash & reset daily record
        pay = Math.ceil(pay);

        this.payout.pay += pay;
        this.cash += pay;
        
        this.payout.messagesByStudent.clear();

        if(this.penalties.length > 0)
        {
            for(var i = 0; i < this.penalties.length; i++)
            {
                if(this.expenses.has(this.penalties[i].name))
                {
                    alert("Need to pay for: " + this.expenses.get(this.penalties[i].name).name + " with " + this.expenses.get(this.penalties[i].name).cost);
                    this.cash -= this.expenses.get(this.penalties[i].name).cost;
                }
            }
        }

        this.cash = this.cash + (10 * this.bonus)

        if(this.cash < 0)
        {
            alert("Game Over");
            clock.day = 12;
        }

        console.log(`End of day payout: $${pay.toFixed(2)} (Cash: $${this.cash.toFixed(2)})`);
    },

    getMessageValue: function(messageIndex)
    {
        // First 5 messages = $1 each
        if (messageIndex <= 5) return 1;
        // Messages 6–10 = $0.5 each
        if (messageIndex <= 10) return 0.5;
        // Anything after = $0.2 each
        return 0.2;
    },
    
    toggle: function(name)
    {
        if (!this.expenses.has(name)) return;

        let expense = this.expenses.get(name);
        expense.toggle = !expense.toggle;

        if (expense.toggle)
            this.cash -= expense.cost;
        else
            this.cash += expense.cost;

        renderer.payText.text = "Pay: " + this.cash;
    },

    addProblem:function(problem)
    {
        this.problems.push(problem);
    },

    send:function()
    {
        client.sendMessage({
            code: game.player.id,
            sendTo:"smart",
            type:"economy",
            day:clock.day,
            message: {
                cash: this.cash,
                expenses: Array.from(this.expenses.entries()) // convert Map → array for safe transmission
            },
            teaching: {
                lecturerTime:Math.floor(this.lecturerTime / 60),
                narratorTime:Math.floor(this.narratorTime / 60),
                tutorTime:Math.floor(this.tutorTime / 60),
                librarianTime:Math.floor(this.librarianTime / 60)
            }
        });

        this.payout.messagesByStudent.clear();
        this.lecturerTime = 0;
        this.narratorTime = 0;
        this.tutorTime = 0;
        this.librarianTime = 0;
    }
};
