var students =
{
	list:
	{
        "student":
		{
			name:"student",
			canAttack:true,
			canExtract:false,
			canLoad:true,
			pixelWidth:17,
            pixelHeight:16,
			weaponType:"bullet",
			soundType:"bullet1",	
			targetThreshold:0.1,
			weaponSpeed:20,		
			radius:20,
			speed:3,
			runningSpeed:1,
			sight:4,
			vision:154,
			nearVision:9,
			reloadTime:120,
			cost:100,
			limit:120,
			wait:false,
			done:false,
			ammoCapacity:100,
			ammo:100,
			resource:"none",
    	    hitPoints:25,
            turnSpeed:4,
            frames:24,
			scale:2.0,
            animationCount:1,
            animationLimit:2,
			animationSpeed:0,
            animationSpeedLimit:6,
            animationSlowSpeed:0,
            animationSlowSpeedLimit:30,
			animationIndex:0,
			animationTable:[0,1],
			direction:0,
			directions:8,
			iconColor:0xFFFF00,
			iconShape:"tri",
			shadowColor:[0x000000],
			shadowAngle:45,
			shadowDistance:5,
			camouflage:{				
				"grass": {
					"r": 0.44313725490196076,
					"g": 0.875,
					"b": 0.3058823529411765
				},
				"snow": {
					"r": 0.75,
					"g": 0.75,
					"b": 0.75
				},
				filterId:-1				
			},
			spriteImages:[
				{name:"stand",count:1,directions:frames}
			],
			buildableGrid:[
				[1]
			],
			passableGrid:[
				[1]
			],
			visionGridX:10,
			visionGridY:10,
			visionGrid:undefined,
		}
    },
    defaults:
	{
		animation:"stand",
		layer:"surface",
		orders:{type:"stand"},
		destination:undefined,
		waitForThreshold:false,
		isStudent:true,	
		selected:false,
		selectable:true,
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
		isStudent:true,
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
				case "talkToTutor":
					this.talkToTutor();
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

		update:function()
		{
			if(this.reloadTimeLeft > 0)
				this.reloadTimeLeft--;
		},

		init()
		{
			this.sprite.scale.set(2, 2);
		},

		search:function() 
		{
			console.log("search");

			let maxTries = 100;
			let gridWidth = game.level.mapGridWidth;
			let gridHeight = game.level.mapGridHeight;

			for (let i = 0; i < maxTries; i++) 
			{
				let randomX = Math.floor(Math.random() * gridWidth);
				let randomY = Math.floor(Math.random() * gridHeight);

				// Check if the grid cell is passable
				if (game.currentTerrainMapPassableGrid[randomY][randomX] !== flags.CELL_COLLISION_MODE_FULL) 
				{
					this.state.searching = true;
					this.orders.type = "moveTo";
					this.orders.to = {
						x: randomX,
						y: randomY
					};

					console.log(`Unit ${this.uid} issued search order to (${randomX}, ${randomY}), orders.type (${this.orders.type})`);
					return;
				}
			}

			// If no valid tile is found
			console.log(`Unit ${this.uid} couldn't find a valid search location`);
			this.orders.type = "stand";
		},

		leave:function()
		{
			let maxTries = 100;
			let gridWidth = game.level.mapGridWidth;
			let gridHeight = game.level.mapGridHeight;

			for (let i = 0; i < maxTries; i++) 
			{
				let randomX = Math.floor(Math.random() * gridWidth);
				let randomY = Math.floor(Math.random() * gridHeight);

				// Check if the grid cell is passable
				if (game.currentTerrainMapPassableGrid[randomY][randomX] !== flags.CELL_COLLISION_MODE_FULL) 
				{
					this.state.searching = true;
					this.orders.type = "moveTo";
					this.orders.to = {
						x: randomX,
						y: randomY
					};

					renderer.displayConversationText(false);
					console.log(`Unit ${this.uid} issued search order to (${randomX}, ${randomY}), orders.type (${this.orders.type})`);
					return;
				}
			}
		},

		talk:function()
		{
			console.log("talk!");

			if(this.state.talkingToTutor)
			{
				this.orders.type = "talkingToTutor";
			}
			else
			{
				this.orders.type = "talking";
			}
		},

		talking:function()
		{
			if(this.talkCount == this.talkLimit)
			{
				if(conversations.get(this.conversationsUid, this.contact))
				{
					console.log("end talking");
					this.state.talking = false;
					this.state.leaving = true;
					this.target = undefined;

					this.talkCount = 0;
		
					this.orders.type = "leave";
					return;
				}

				this.talkCount = 0;
			}

			this.talkCount++;
		},

		talkToTutor:function()
		{
			this.orders.type = "moveTo";
			this.state.talking = true;
			this.state.talkingToTutor = true;
			this.contact = true;

			this.target = game.items[0];
		},

		talkingToTutor:function()
		{
			console.log("talkToTutor - dialogue box should appear");
			renderer.showDialogue();			
		},
		
		move:function()
		{
			this.orders.to.y = this.orders.to.y - display.maininterface.mapImageYOffset * productionRatio;

			this.orders.to.x = this.orders.to.x * productionInverseRatio + game.offsetX;
			this.orders.to.y = this.orders.to.y * productionInverseRatio + game.offsetY;

			this.orders.to.x = this.orders.to.x / game.gridSize;
			this.orders.to.y = this.orders.to.y / game.gridSize;
			
			this.removeInfantryFromTheCellTile();

			// Can happen when capturing and attacking at the same time
			this.state.retreating = false;
			this.state.attacking = false;
			this.state.firing = false;
			this.state.capturing = false;

			// Target needs to be undefine if the previous
			// target is on the same side
			this.target = undefined;

			console.log("student move");
			this.orders.type = "moveTo";
		},

		/**
		 * Determines the static path that the infantry
		 * will follow.
		 */
		moveTo:function(destination)
		{
			console.log("moveTo");
			cells.remove(
				this.uid,				
				game.currentTerrainMapPassableGrid,
				this.cellCollisionMode);

			//nav.deleteMarkers(this.cellCollisionMode, game.currentTerrainMapPassableGrid, this.path);

			this.path = undefined;

			// First find path to destination
			this.start[0] = Math.floor(this.x);
			this.start[1] = Math.floor(this.y);

			console.log(this.start);

			var range = 0;

			if(!destination)
			{
				var destination = {};
				
				if(this.target)
				{
					destination.x = this.target.x;
					destination.y = this.target.y;
					destination.target = this.target;			
				}				
			}
			else
			{
				if(this.target)
				{
					destination.x = this.target.x;
					destination.y = this.target.y;
					destination.target = this.target;			
				}
			}

			this.spreadDestination(destination);

			this.end[0] = Math.floor(destination.x);
			this.end[1] = Math.floor(destination.y);

			console.log(this.end);

			this.grid = [...game.currentTerrainMapPassableGrid];

			// if infantry is outside bounds, just fly straight towards goal
			if (this.start[1]<0||this.start[1]>=game.level.mapGridHeight||this.start[0]<0||this.start[0]>=game.level.mapGridWidth)
			{
			   //this.path = [this,destination];
			   newDirection = findAngle(destination,this,this.directions);
			}
			else
			{
				var path;

				path = Tactical_AStar(this.uid,this.grid,this.end,this.start,heuristic.euclidean,this.cellCollisionMode,range);

				if(path)
				{
					if(path.length == 0)
					{
						this.zeroPath();
					}
					else if(path.length > 0)
					{
						this.onPath(path);
					}
				}
				else
				{
					this.noPath();
				}		
			}
		},

		/**
		 * Turns to the correction direction to start along
		 * the path.
		 */
		turningTo:function()
		{	
			if(this.direction == this.correctDirection)
			{
				this.orders.type = "moving";
			}				
			else
			{
				if(this.state.attacking)
				{
					let position = {x:this.x, y:this.y};
		
					this.correctDirection = findAngle(this.target,position,this.directions);
	
					this.direction = wrapDirection(this.correctDirection, this.directions);
				}
				else
				{
					let position = {x:this.x, y:this.y};
					let next = {x:this.path[1].x+0.5, y:this.path[1].y+0.5};
		
					this.correctDirection = findAngle(next,position,this.directions);
	
					this.direction = wrapDirection(this.correctDirection, this.directions);
				}
			}
		},

		/**
		 * The actual movement of the infantry and that follows
		 * the pre-determined path.
		 */
		movingTo:function()
		{
			if(this.path.length>1)
			{
				if(this.nextStep == undefined)
					this.nextStep = {x:this.path[1].x+0.5,y:this.path[1].y+0.5};

				var distanceFromDestinationSquared = Math.pow(this.x -
					this.nextStep.x, 2) + Math.pow(this.y - this.nextStep.y, 2);

				if(distanceFromDestinationSquared < Math.pow(this.radius/game.gridSize, 2))
				{
					this.nextStep = {x:this.path[1].x+0.5,y:this.path[1].y+0.5};
					//nav.deleteMarker(this.cellCollisionMode, game.currentTerrainMapPassableGrid, this.path);
					this.path.shift();

					//if(nav.multiType)
					//	nav.createMarkers(this.cellCollisionMode, game.currentTerrainMapPassableGrid, this.path);
				}
            }
			else if(this.path.length>0)
			{
				/*	Infantry keeps to the last step, once reached it 
					removes the last step and ends.
				*/
				if(!this.orders.to)
				{
					this.state.attacking = false;
					this.orders.type = "standing";
					
					return;
				}

				var distanceFromDestinationSquared = Math.pow(this.x -
					this.orders.to.x, 2) + Math.pow(this.y - this.orders.to.y, 2);

				if(distanceFromDestinationSquared < Math.pow(this.radius/(game.gridSize), 2))
				{	
					this.path.shift();
				}

				if(distanceFromDestinationSquared > this.previousDistance)
				{
					//nav.deleteMarker(this.cellCollisionMode, game.currentTerrainMapPassableGrid, this.path);
					this.path.shift();
				}
				else
				{
					this.previousDistance = distanceFromDestinationSquared;
				}
			}
			else
			{
				// Returns the previousDistance to a large number, a reset.
				this.previousDistance = 100;
				this.state.leaving = false;
				this.orders.type = "standing";

				this.capturing = false;

				return false;
			}

			// Once close enough to target, stop and attack
			if(this.state.talking)
			{				
				if(this.target)
				{
					console.log("checking for In range to talk");
					// In range to talk.
					if(Math.pow(this.target.x - this.x, 2) + Math.pow(this.target.y - this.y, 2) < Math.pow(this.sight, 2))
					{	
						this.orders.type = "talk";
						return;	
					}
				}
				else
				{
					this.orders.type = "standing";
					return;	
				}
			}

			this.moving();
		},
		
		moving:function()
		{
			// On rare times, the nextStep will become undefined
			// Not sure how?
			// But if so, handle it
			// otherwise the game will crash
			if(this.waitForThreshold)
				return;

			if(this.nextStep == undefined)
			{
				// Just moving, then stop
				this.orders.type = "standing";
				return;
			}			

			var newDirection = findAngle(this.nextStep,this,this.directions);
			var difference = angleDiff(this.direction,newDirection,this.directions);
			var turnAmount = this.turnSpeed*game.turnSpeedAdjustmentFactor;
			var movement = (this.speed)*game.speedAdjustmentFactor*framerate.delta;

			var angleRadians = -(Math.round(this.direction)/this.directions)*2*Math.PI ;
			this.lastMovementX = -(movement*Math.sin(angleRadians));
			this.lastMovementY = -(movement*Math.cos(angleRadians));

            this.sprite.x = (this.sprite.x +(this.lastMovementX
                * game.gridSize));
            this.sprite.y = (this.sprite.y +(this.lastMovementY
				* game.gridSize));

			// Update the real coordinates of the sprite
            this.x = (this.x +this.lastMovementX);
			this.y = (this.y +this.lastMovementY);

			if(!this.state.leaving)
				if(!this.state.talking)
					this.steering();

			this.collided = false;
			
			if (Math.abs(difference)>turnAmount)
				this.direction = wrapDirection(this.direction+turnAmount*Math.abs(difference)/difference,this.directions);		
			
			return true;
		},

		standing:function()
		{
			// Add the cells to the grid
			cells.add(this.uid, this.x,this.y,this.radius / game.gridSize,
				game.currentTerrainMapPassableGrid,
				this.cellCollisionMode);

			this.setFixedAnimation(0);

			if(this.state.searching)
			{
				this.orders.type = "search";
				return;
			}

			// Resume to original stand state
			this.orders.type = "stand";
		}, 
		
		stand:function()
		{
							
		},

		noPath:function()
		{
			this.state.attacking = false;
			this.orders.type = "standing";
		},

		zeroPath:function()
		{
			this.state.attacking = false;
		},

		onPath:function(path)
		{
			this.path = path;

			this.nextStep = undefined;

			if(debug.logInfantry)
			{
				console.log("On Path");
				console.log(this.state.attacking);
				console.log(path.length);
			}

			if (path.length>1)
			{					
				this.orders.type = "turning";
			}
			else
			{	
				this.orders.type = "moving";				
			}
		},

		spreadDestination:function(destination)
		{
			var newDestination = {};

			newDestination.acc = createVector2D();
			newDestination.vel = createVector2D();

			var endX = 0;
			var endY = 0;

			var orginalDestionationX = destination.x;
			var orginalDestionationY = destination.y;

			newDestination.pos = createVector2D(destination.x, destination.y);
			newDestination.acc.mult(0);
			newDestination.vel.mult(0);
			newDestination.vel = Vector.random2D();

			var norm = generate.normalise(
				generate.randomNumber(generate.seed), generate.seed);

			newDestination.vel.setMag(norm + 0.5); 

			newDestination.pos.add(newDestination.vel);
			newDestination.vel.add(newDestination.acc);

			destination.x = newDestination.pos.x;
			destination.y = newDestination.pos.y;

			endX = Math.floor(destination.x);
			endY = Math.floor(destination.y);

			if (endX < 0 || endY < 0 ||
				endY >= game.currentTerrainMapPassableGrid.length ||
				endX >= game.currentTerrainMapPassableGrid[0].length)
			{
				destination.x = orginalDestionationX;
				destination.y = orginalDestionationY;
				return;
			}

			if (game.currentTerrainMapPassableGrid[endY][endX] == flags.CELL_COLLISION_MODE_FULL)
			{
				destination.x = orginalDestionationX;
				destination.y = orginalDestionationY;
				return;
			}

			if(game.currentTerrainMapPassableGrid[endY][endX] > flags.CELL_COLLISION_MODE_SOFT)
			{
				destination.x = orginalDestionationX;
				destination.y = orginalDestionationY;
				
				return;
			}
		},

		removeInfantryFromTheCellTile()
		{
			cells.remove(
				this.uid,				
				game.currentTerrainMapPassableGrid,
				this.cellCollisionMode);
		},

		checkForThresholds()
		{
			for(var i = 0; i < game.items.length; i++)
			{
				if(game.items[i].type != "thresholds")
					continue;

				game.items[i].collide(this, this.x * game.gridSize, this.y * game.gridSize)
			}
		},

		steering:function()
		{
			this.hasCollided = false;
			this.hasCollidedSkin = false;
			this.hasCollidedStop = false;

			for(var i = 0; i < game.items.length; i++)
			{
				if(game.items[i].uid == this.uid)
					continue;

				if(game.items[i].type != "students")
					continue;

				let distanceToNPC = distance(this.x, this.y, game.items[i].x, game.items[i].y);
				
				if(distanceToNPC < 10)
				{
					this.orders.type = "moveTo";
					this.state.talking = true;
					this.contact = true;
					game.items[i].orders.type = "moveTo";
					game.items[i].state.talking = true;
					game.items[i].contact = false;

					this.conversationsUid = conversations.generateConversationUid(this.networkUid, game.items[i].networkUid);
					game.items[i].conversationsUid = this.conversationsUid;

					conversations.generate(this.conversationsUid);

					this.target = game.items[i];
					game.items[i].target = this;
					return;
				}				
			}
		},
		
		draw:function()
		{
            if(this.orders.type != "stand" && this.orders.type != "talking" && this.orders.type != "talkingToTutor" && !(this.waitForThreshold))
				this.animate();

			if(this.bullet)
				this.animateBullet();

			if (this.selected)
			{
				this.drawSelection();
				this.drawLifeBar();
				this.drawPath();
				this.drawDebugPath();
			}
		},
        
        animate:function()
        {
            if((this.animationSpeed % Math.round(this.animationSpeedLimit / framerate.delta)) == 0)
            {
                if(this.animationCount < this.animationLimit)
                {	
					this.animationDirection = wrapAnimationDirection(
						Math.round(this.direction),this.directions,
						this.animationCount);

					if(this.animationDirection >= this.directions)
					{
						this.animationDirection = this.animationDirection + (this.directions * this.animationTable[this.animationIndex]);

						this.animationIndex++;

						if(this.animationIndex == this.animationTable.length)
						{
							this.animationIndex = 0;
						}
					}

					this.sprite.texture = renderer.texturesMap.get(this.team + "_" + this.name)
						[this.animationDirection];

					this.sprite.scale.set(this.scale, this.scale);

                    this.animationCount++;
                }
                else
                {
                    this.animationCount = 0;
                }
            }   
            
			this.animationSpeed++;
		},
		
		animateBullet:function()
		{
			if(this.bullet.update)
				this.bullet.update();

			if(this.bullet.animate)
				this.bullet.animate();
		},

		setFixedAnimation(frame)
		{
			this.animationDirection = wrapAnimationDirection(
				Math.round(this.direction),this.directions,	frame);

			this.sprite.texture = renderer.texturesMap.get(this.team + "_" + this.name)
				[this.animationDirection];
		},

		drawSelection:function()
		{			
			this.selectionSprite.x = this.sprite.x;
			this.selectionSprite.y = this.sprite.y;
			this.selectionBorderSprite.x = this.sprite.x;
			this.selectionBorderSprite.y = this.sprite.y;
		},

		drawLifeBar:function()
		{
			this.lifeBarSprite.x = this.sprite.x;
			this.lifeBarSprite.y = this.sprite.y - game.lifeBarHeight;

			this.lifeBarBorderSprite.x = this.sprite.x;
			this.lifeBarBorderSprite.y = this.sprite.y - game.lifeBarHeight;
		},

		resetState:function()
		{
			this.state.attacking = false;
            this.state.firing= false;
            this.state.retreating = false;
            this.state.capturing = false;
            this.state.extracting = false;
            this.state.flying = false;
		},

		select:function()
		{
			this.selected = true;

			this.selectionSprite.visible = true;
			this.selectionSprite.scale.set(this.radius / 100, this.radius  / 100);
		},

		unselect:function()
		{
			this.selected = false;

			this.selectionSprite.visible = false;
			this.selectionSprite.scale.set(1, 1);
		}
    }
}