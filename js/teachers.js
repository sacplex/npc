var teachers =
{
	list:
	{
        "lecturer":
		{
			name:"lecturer",
            frames:1,
            speechType:"passive",
            speechCount:0,
            speechLimit:300,
            passableGrid:[
				[1]
			],
			currentSlide:0
        },
		"narrator":
		{
			name:"narrator",
            frames:1,
            speechType:"passive",
            speechCount:0,
            speechLimit:300,
            passableGrid:[
				[1]
			],
        },
		"librarian":
		{
			name:"librarian",
			selectable:true,
			frames:1,
			radius:20,
            speechType:"active",
            passableGrid:[
				[1]
			],
		},
		"tutor":
		{
			name:"tutor",
			selectable:true,
			frames:1,
			radius:20,
            speechType:"active",
            passableGrid:[
				[1]
			],
		}
    },
    defaults:
	{
		animation:"stand",
		layer:"surface",
		orders:{type:"stand"},
		destination:undefined,
		waitForThreshold:false,
		isStudent:false,	
		selected:false,
		selectable:false,
		hidden:false,
		target:undefined,
		bullet:undefined,
		contact:false,
		talkCount:0,
		talkLimit:240,
		attackRange:0.75,
		exclusionRange:3,
		reloadTimeLeft:0,
		cellCollisionMode:1,
		scaleInnerCollision:0.75,
		scaleOuterCollision:1.00,
		selectionRadius:100,
		selectionBorderShape:"circle",
		hasCollided:false,
		hasCollidedSkin:false,
		hasCollidedStop:false,

		index:undefined,
		grid:undefined,
		path:[],
		start:[],
		end:[],

        outputTest:function()
        {
		},

		processOrders:function()
		{
			switch (this.orders.type)
			{
				case "search":
					this.search();
					break;
				case "leave":
					this.leave();
					break;
				case "searching":
					this.searching();
					break;
				case "talkingToTutor":
					this.talkingToTutor();
					break;
				case "talkToTeacher":
					this.talkToTeacher();
					break;
				case "talkToLibrarian":
					this.talkToLibrarian();
					break;
				case "talk":
					this.talk();
					break;
				case "talking":
					this.talking();
					break;
				case "move":
					this.move();
					break;
				case "moveTo":
                    this.moveTo(this.orders.to);
					break;
				case "turning":
					this.turningTo();
					break;
				case "moving":
					this.movingTo();
					break;
				case "wait":
					this.wait();
					break;
				case "standing":
					this.standing();
					break;
				case "stand":
					this.stand();
					break;
			}
		},

        init()
		{
			this.sprite.scale.set(2, 2);
		},

		update:function()
		{
            if(this.speechType == "passive")
            {
                if(this.name == "lecturer")
                {
                    this.speakLecture();
                }
				else if(this.name == "narrator")
				{
					this.speakNarration();
				}
            }
		},

        speakLecture:function()
        {
			
            if(this.speechCount == this.speechLimit)
            {
                this.speechCount = 0;
				if(dialogue.displayLecturer(lecturer[clock.day-1][materials.list["slides" + clock.day].index]))
				{
					dialogue.displayLecturer(lecturer[clock.day-1][materials.list["slides" + clock.day].index].Line);
					game.slides[Math.floor(lecturer[clock.day-1][materials.list["slides" + clock.day].index].Slide)].sprite.visible = false;
	
					if(clock.day != lecturer[clock.day-1][materials.list["slides" + clock.day].index].Lecture)
					{ 
						materials.list["slides" + clock.day].index = 0;
					}
					else
					{
						let slideIndex = Math.floor(lecturer[clock.day-1][materials.list["slides" + clock.day].index].Slide);
						game.slides[slideIndex].sprite.visible = true;
						materials.list["slides" + clock.day].index++
	
						if(materials.list["slides" + clock.day].index > lecturer[clock.day-1].length)
						{
							materials.list["slides" + clock.day].index = 0;
						}
					}
				}
            }

            this.speechCount++;
        },

		speakNarration:function()
		{
			if(this.speechCount == this.speechLimit)
            {
                this.speechCount = 0;
				
				if(dialogue.displayLecturer(lecturer[clock.day-1][materials.list["slides" + clock.day].index]))
				{
					dialogue.displayNarrator(narrator[clock.day][materials.list["story" + clock.day].index].Line);

					if(clock.day != narrator[clock.day][materials.list["story" + clock.day].index].Story)
					{ 
						materials.list["story" + clock.day].index = 0;
					}
					else
					{
						materials.list["story" + clock.day].index++

						if(materials.list["story" + clock.day].index > narrator[clock.day].length)
						{
							materials.list["story" + clock.day].index = 0;
						}
					}
				}
            }

            this.speechCount++;
		},

		talkToTutor:function()
		{
			this.state.talking = true;
			this.state.talkingToTutor = true;
			this.contact = true;

			this.target = game.items[0];
		},

		talkToTeacher:function()
		{
			console.log("talkToTutor - dialogue box should appear");
			renderer.showDialogue();			
		},

		talkToLibrarian:function()
		{
			console.log("talkToTutor - dialogue box should appear");
			renderer.showDialogue();			
		},

        stand:function()
        {

        }
    }
}