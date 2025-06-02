var elements =
{
	list:
	{
        "cell":
		{
			name:"cell",
			weaponType:"melee",
			targetThreshold:1.5,
			frames:20,
			canAttack:true,
			canLoad:false,
			melee:true,
			hitPoints:250,
			damage:1,
			radius:9,
            directions:8,
			speed:3,
			sight:1,
			turnSpeed:4,
			reloadTime:30,
            animationCount:1,
            animationLimit:10,
            animationSpeed:0,
            animationSpeedLimit:6,
            animationSlowSpeed:0,
            animationSlowSpeedLimit:30,
			attackAnimationOffset:10,
			playInReverse:false,
			buildableGrid:[
				[1]
			],
			passableGrid:[
				[1]
			],

        },
		"crystal":
		{
			name:"crystal",
			frames:20,
			canAttack:true,
			canLoad:false,
			hitPoints:250,
			damage:1,
			radius:9,
            directions:8,
			speed:3,
			sight:1,
			turnSpeed:4,
			reloadTime:30,
            animationCount:1,
            animationLimit:10,
            animationSpeed:0,
            animationSpeedLimit:6,
            animationSlowSpeed:0,
            animationSlowSpeedLimit:30,
			playInReverse:false,
			// shadowColor:[0xB4CAD2],
			// shadowAngle:45,
			// shadowDistance:5,
			// glowColor:[0x35FF56, 0xFF4E56],
			buildableGrid:[
				[1]
			],
			passableGrid:[
				[1]
			],
        },
		"bot":
		{
			name:"bot",
			weaponType:"lighting",
			targetThreshold:1,
			frames:44,
			canAttack:true,
			canLoad:false,
			melee:false,
			hitPoints:250,
			damage:1,
			radius:9,
            directions:8,
			speed:3,
			sight:5,
			turnSpeed:4,
			reloadTime:30,
            animationCount:0,
            animationLimit:44,
            animationSpeed:0,
            animationSpeedLimit:6,
            animationSlowSpeed:0,
            animationSlowSpeedLimit:30,
			attackAnimationOffset:0,
			animationLoopInReverse:true,
			playInReverse:false,
			strikeAnimationCount:0,
			strikeAnimationLimit:4,
			guardCount:0,
            guardLimit:6,
			// shadowColor:[0xB4CAD2],
			// shadowAngle:45,
			// shadowDistance:5,
			// glowColor:[0x35FF56, 0xFF4E56],
			buildableGrid:[
				[1]
			],
			passableGrid:[
				[1]
			],
        },
		"pulsar":
		{
			name:"pulsar",
			weaponType:"explosion",
			targetThreshold:1.5,
			frames:1,
			canAttack:true,
			canLoad:false,
			melee:true,
			/*drawInGameSprite:{
				type:"circle",
				radius:5,
				outlineColor:0xFFFF00,
				outlineThickness:2,
				colorFill:0xFFFF00,
				filters:[
					{
						name:"GlowFilter",
						color:0xFFFF77,
						distance: 15,
						outerStrength: 20,
						innerStrength: 0,
						quality: 0.5
					}
				]
			},*/
			emitter:{
				name:"pulsar",
				lifetime:Infinity,
				updatetime:0.004
			},
			emitterIndex:-1,
			hitPoints:250,
			damage:80,
			radius:9,
            directions:8,
			speed:7,
			sight:1,
			turnSpeed:4,
			reloadTime:30,
            animationCount:0,
            animationLimit:0,
            animationSpeed:0,
            animationSpeedLimit:6,
            animationSlowSpeed:0,
            animationSlowSpeedLimit:30,
			attackAnimationOffset:0,
			animationLoopInReverse:true,
			playInReverse:false,
			strikeAnimationCount:0,
			strikeAnimationLimit:4,
			guardCount:0,
            guardLimit:6,
			buildableGrid:[
				[1]
			],
			passableGrid:[
				[1]
			]
		}
    },
    defaults:
	{
		animation:"stand",
		layer:"surface",
		animationOffset:0,
		orders:{type:"stand"},
		destination:undefined,	
		selected:false,
		selectable:true,
		target:undefined,
		bullet:undefined,
		attackRange:0.75,
		exclusionRange:3,
		reloadTimeLeft:0,
		cellCollisionMode:1,
		scaleInnerCollision:0.75,
		scaleOuterCollision:1.00,
		selectionRadius:100,
		selectionBorderShape:"circle",
		isArmy:true,
		isNavy:false,
		isAirforce:false,
		hasCollided:false,
		hasCollidedSkin:false,
		hasCollidedStop:false,
		grid:undefined,
		start:[],
		end:[],

        outputTest:function()
        {
		},

		processOrders:function()
		{
			switch (this.orders.type)
			{
				case "attack":
					this.attack(this.orders.to);
					break;
				case "turnTo":
					this.turnTo();
					break;
				case "touching":
					this.touching();
					break;
				case "touch":
					this.touch();
					break;
				case "turnToFire":
					this.turnToFire();
					break;
				case "firing":
					this.firing();
					break;
				case "fire":
					this.fire();
					break;
				case "striking":
					this.striking();
					break;
				case "assist":
					this.assist();
					break;
				case "move":
					this.move();
					break;
				case "moveTo":
					// Move towards destination until distance from destination is less aircraft radius
					this.moveTo(this.orders.to);
					break;
				case "turning":
					this.turningTo();
					break;
				case "moving":
					// Move towards destination until distance from destination is less aircraft radius
					this.movingTo();
					break;
				case "guarding":
					this.guarding();
					break;
				case "guard":
					this.guard();
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

			if(debug.fogOfWar)
				fog.setSubGrid(this.x, this.y, this.visionGrid, this.team, this.state);
		},

		attack:function(destination)
		{
			this.removeElementsFromTheCellTile();

			this.animationOffset = this.attackAnimationOffset;

			if(this.target == undefined)
			{
				if(destination && destination.target)
				{
					this.target = target.searchForTarget(destination.target.uid);

					if(!this.target)
					{
						this.state.attacking = false;
						this.orders.type = "standing";

						return;
					}

					// target could be undefined, need to check

					if(debug.logInfantry)
						console.log('this.target.uid: ' + this.target.uid);

					target.addItemToAttackedTarget(this.target.uid, this);
				}
			}
		
			this.state.attacking = true;
			this.state.firing = false;
			//this.retreating = false;

			this.orders.type = "moveTo";
		},

		attacked:function()
		{			
			var friendlyElements = findFriendlyElements(
				this.team,
				this.near);

			if(friendlyElements.length > 0)
			{				
				for(var i = 0; i < friendlyElements.length; i++)
				{
					if(friendlyElements[i].state.retreating)
						continue;

					if(friendlyElements[i].state.attacking)
						continue;

					if(!friendlyElements[i].canAttack)
						continue;	

					friendlyElements[i].orders.type = "assist";					
				}
			}
			
			if(this.state.attacking == false)
			{	
				if(this.melee)
					this.animationOffset = 10;
				
				this.state.attacking = true;
				
				target.addItemToAttackedTarget(this.target.uid, this);				

				this.orders.type = "moveTo";
			}
		},

		assist:function()
		{	
			if(this.state.attacking)
				return;

			if(!this.target)
			{
				var newTarget = findClosestGroundItem(this, physics.queryArmy.bind(physics));

				if(!newTarget)
				{
					this.state.attacking = false;
					this.orders.type = "standing";
					return;
				}
				
				// target may be undefined
				if(newTarget)
				{				
					this.orders.type = "moveTo";

					this.state.attacking = true;

					this.target = newTarget;
				}
			}
		},

		turnTo:function()
		{
			if(this.direction == this.correctDirection)
			{
				this.state.firing = true;

				if(this.melee)
				{
					this.orders.type = "touching";
				}
				else
				{
					this.orders.type = "firing";
				}
			}				
			else
			{	
				this.correctDirection = findFiringAngle(this, this.target, this.directions);

				this.direction = wrapDirection(this.correctDirection, this.directions);
			}
		},

		turnToFire:function()
		{
			if(this.direction == this.correctDirection)
			{
				this.state.firing = true;
				this.orders.type = "firing";
			}				
			else
			{	
				this.correctDirection = findFiringAngle(this, this.target, this.directions);

				this.direction = wrapDirection(this.correctDirection, this.directions);
			}
		},

		firing:function()
		{
			if(this.target == undefined)
			{
				console.log("target is undefined");
				console.log("uid: " + this.uid);
				console.log("team: " + this.team);
				console.log("type: " + this.type);
				console.log("name: " + this.name);
			}

			if(this.target.team == this.team)
			{
				alert("this target is the same team")
				this.state.attacking = false;
				this.target = undefined;
				this.orders.type = "standing";

				return;
			}

			if(this.reloadTimeLeft == 0)
			{
				if(Math.pow(this.target.x - this.x, 2) + Math.pow(this.target.y - this.y, 2) >= Math.pow(this.sight, 2))
				{
					this.orders.type = "attack";
				}
				else
				{
					// Target is dead, resume standing
					if(this.target.life <= 0)
					{
						this.target = undefined;
						
						this.state.attacking = false;

						if(!this.target)
						{
							var newTarget = findClosestGroundTarget(
								this,
								this.team,
								this.near);

							if(!newTarget)
							{
								this.orders.type = "standing";
								return;
							}
							
							if(newTarget)
							{				
								this.orders.type = "attack";

								this.target = newTarget;

								return;
							}
						}
					}					
					else
					{
						this.orders.type = "fire";
					}	
				}
			}
		},

		fire:function()
		{
			if(!this.bullet)
			{
				var bulletIndex = 0;

				var bulletLists = Object.keys(bullets.list);

				for(var i = 0; i < bulletLists.length; i++)
				{
					if(bulletLists[i] == this.weaponType)
					{
						bulletIndex = i;
						break;
					}
				}

				this.bullet = {};
				this.bullet.name = game.bullets[bulletIndex].name;
				this.bullet.produce = game.bullets[bulletIndex].produce;
				this.bullet.damage = game.bullets[bulletIndex].damage;
				this.bullet.directions = game.bullets[bulletIndex].directions;
				this.bullet.speed = game.bullets[bulletIndex].speed;
				this.bullet.turnSpeed = game.bullets[bulletIndex].turnSpeed;
				this.bullet.frames = game.bullets[bulletIndex].frames;
				this.bullet.bulletFrames = game.bullets[bulletIndex].bulletFrames;
				this.bullet.animationCount = game.bullets[bulletIndex].animationCount;
				this.bullet.drawSpeed = game.bullets[bulletIndex].drawSpeed;
				this.bullet.spin = game.bullets[bulletIndex].spin;
				this.bullet.aoe = game.bullets[bulletIndex].aoe;
				this.bullet.aoeLimit = game.bullets[bulletIndex].aoeLimit;
				this.bullet.suicide = game.bullets[bulletIndex].suicide;
			}

			this.bullet.x = this.x;
			this.bullet.y = this.y;
			this.bullet.flyCount = 0;
			this.bullet.flyLimit = this.reloadTime || this.bullet.flyLimit;
			this.bullet.targetThreshold = this.targetThreshold || this.bullet.targetThreshold;
			this.bullet.speed = this.weaponSpeed || this.bullet.speed;
			this.bullet.direction = this.direction;
			this.bullet.animationCount = 0;
			this.bullet.attacker = this;
			this.bullet.target = this.target;

			renderer.removeBullet(this.bullet.sprite);
			renderer.produceBullet(this.bullet);

			this.bullet.update = window["bullets"].defaults.update;

			//sounds.play(this.soundType);

			// if(this.ammo > 0)
			// 	this.ammo--;

			this.reloadTimeLeft = Math.floor(this.reloadTime * framerate.deltaMultiplierFactor) | 0;

			if(this.bullet.areaOfEffectRadius != undefined)
				this.bullet.targetPosition = {x:this.target.x, y:this.target.y};
			
			this.orders.type = "firing";
		},

		touching:function()
		{
			if(this.target == undefined)
			{
				console.log("target is undefined");
				console.log("uid: " + this.uid);
				console.log("team: " + this.team);
				console.log("type: " + this.type);
				console.log("name: " + this.name);
			}

			if(this.target.team == this.team)
			{
				alert("this target is the same team")
				this.state.attacking = false;
				this.target = undefined;
				this.orders.type = "standing";

				return;
			}

			if(this.reloadTimeLeft == 0)
			{
				if(Math.pow(this.target.x - this.x, 2) + Math.pow(this.target.y - this.y, 2) >= Math.pow(this.sight, 2))
				{
					this.orders.type = "attack";
				}
				else
				{
					// Target is dead, resume standing
					if(this.target.life <= 0)
					{
						this.target = undefined;
						
						this.state.attacking = false;

						var newTarget = findClosestGroundTarget(
							this,
							this.team,
							this.near);

						if(!newTarget)
						{
							this.orders.type = "standing";
							return;
						}
						
						if(newTarget)
						{				
							this.orders.type = "attack";

							this.target = newTarget;

							return;
						}
					}					
					else
					{
						this.orders.type = "touch";
					}	
				}
			}
		},

		touch:function()
		{
			this.target.takeDamage(this.damage);

			this.reloadTimeLeft = Math.floor(this.reloadTime) | 0;
				
			this.orders.type = "touching";
		},

		move:function()
		{
			this.orders.to.y = this.orders.to.y - display.maininterface.mapImageYOffset * productionRatio;

			this.orders.to.x = this.orders.to.x * productionInverseRatio + game.offsetX;
			this.orders.to.y = this.orders.to.y * productionInverseRatio + game.offsetY;

			this.orders.to.x = this.orders.to.x / game.gridSize;
			this.orders.to.y = this.orders.to.y / game.gridSize;

			if(game.currentTerrainMapPassableGrid[
                Math.floor(this.orders.to.y)][Math.floor(this.orders.to.x)]
                 == flags.CELL_COLLISION_MODE_FULL)
            {
				this.orders.type = "stand";
                return;
            }

			this.removeElementsFromTheCellTile();

			this.animationOffset = 0;

			//renderer.updateGlowFilterColor(this, this.glowColor[0]);

			// Target needs to be undefine if the previous
			// target is on the same side
			this.target = undefined;

			// Can happen when capturing and attacking at the same time
			this.state.retreating = false;
			this.state.attacking = false;
			this.state.firing = false;
			this.state.capturing = false;

			this.orders.type = "moveTo";
		},

		moveTo:function(destination)
		{
			console.log(destination);

			if(this.state.attacking)
			{
				if(!this.target)
				{
					this.orders.type = "standing";
					return;
				}
			}

			cells.remove(
				this.uid,				
				game.currentTerrainMapPassableGrid,
				this.cellCollisionMode);

			// First find path to destination
			this.start[0] = Math.floor(this.x)
			this.start[1] = Math.floor(this.y);

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

			//this.grid = $.extend([],game.currentTerrainMapPassableGrid);
			this.grid = [...game.currentTerrainMapPassableGrid];

			if(destination && destination.target)
			{
				// Allow destination to be "movable" so that algorithm can find a path
				if(destination.target.type == "terrain")
				{
					//this.grid[Math.floor(destination.y)][Math.floor(destination.x)] = 0;
				}
				
				if(destination.target.type == "buildings" || destination.target.type == "vehicles")
				{
					// Since building and vehicles have a large collision grid

					// The a * search may not reach the target
					// The range varialble increases the torlance
					// at the end of the path

					//if(this.grid[Math.floor(destination.y)][Math.floor(destination.x)] == 1)
						range = 3;
				}
				else if(destination.target.type == "elements")
				{
					//if(this.grid[Math.floor(destination.y)][Math.floor(destination.x)] == 1)
						range = 2;
				}		
			}

			// if infantry is outside bounds, just fly straight towards goal
			if (this.start[1]<0||this.start[1]>=game.level.mapGridHeight||this.start[0]<0||this.start[0]>=game.level.mapGridWidth)
			{
			   this.orders.path = [this,destination];
			   newDirection = findAngle(destination,this,this.directions);
			}
			else
			{
				var path;
				if(this.state.attacking)
				{
					var itemCollisionGrid = determineCollisionGrid(this);
					var targetCollisionGrid = determineCollisionGrid(this.target);

					var item_current_tiles = cells.take_snapshot(
						this.x,
						this.y,
						itemCollisionGrid,
						this.grid);

					var target_current_tiles = cells.take_snapshot(
						this.target.x,
						this.target.y,
						targetCollisionGrid,
						this.grid);

					var coords_current_tiles = cells.take_coords_snapshot(this.start,this.end,this.grid);

					var t0 = performance.now();

					path = Tactical_AStar(this.uid,this.grid,this.end,this.start, heuristic.euclidean, this.cellCollisionMode,range);
					var t1 = performance.now();

					cells.restore_coords_snapshot(coords_current_tiles,this.grid);

					cells.restore_snapshot(
						this.target.x,
						this.target.y,
						targetCollisionGrid,
						this.grid,
						target_current_tiles);

					cells.restore_snapshot(
						this.x,
						this.y,
						itemCollisionGrid,
						this.grid,
						item_current_tiles);
				}
				else if(this.state.capturing)
				{
					var t0 = performance.now();
					path = nav.getPath(
						this,this.grid,this.start,this.end,this.cellCollisionMode,range,this.pathIncrement);
					var t1 = performance.now();
				}
				else if(this.state.loading)
				{
					var t0 = performance.now();
					path = nav.getPath(
						this,this.grid,this.start,this.end,this.cellCollisionMode,range,this.pathIncrement);
					var t1 = performance.now();
				}
				else
				{
					var t0 = performance.now();

					path = Tactical_AStar(this.uid,this.grid,this.end,this.start,heuristic.euclidean,this.cellCollisionMode,range);

					var t1 = performance.now();

					if(debug.logInfantry)
						console.log(`nav.copyGrid() took ${t1 - t0} milliseconds.`);
				}

				/**
				 * Very important for additional movements.
				 * 
				 * When infantry are grouped, often the non-leading
				 * infantry wont be able to reach the destination.
				 * 
				 * Therefore it hold its previous next step and 
				 * try to reach it.
				 * 
				 * However, typically a leading infantry will be
				 * in place trying to the new destination.
				 * 
				 * Without the reset, two infantry or more will
				 * result in an unbreakable collision 
				 * 
				 */ 

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
					let next = {x:this.orders.path[1].x+0.5, y:this.orders.path[1].y+0.5};
		
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
			if(this.orders.path.length>1)
			{
				if(this.nextStep == undefined)
					this.nextStep = {x:this.orders.path[1].x+0.5,y:this.orders.path[1].y+0.5};

				var distanceFromDestinationSquared = Math.pow(this.x -
					this.nextStep.x, 2) + Math.pow(this.y - this.nextStep.y, 2);

				if(distanceFromDestinationSquared < Math.pow(this.radius/game.gridSize, 2))
				{
					this.nextStep = {x:this.orders.path[1].x+0.5,y:this.orders.path[1].y+0.5};
					this.orders.path.shift();
				}
            }
			else if(this.orders.path.length>0)
			{
				/*	Infantry keeps to the last step, once reached it 
					removes the last step and ends.
				*/
				var distanceFromDestinationSquared = 0;

				if(this.state.attacking)
				{
					distanceFromDestinationSquared = Math.pow(this.x -
						this.target.x, 2) + Math.pow(this.y - this.target.y, 2);
				}
				else
				{
					distanceFromDestinationSquared = Math.pow(this.x -
						this.orders.to.x, 2) + Math.pow(this.y - this.orders.to.y, 2);
				}
				

				//console.log("distanceFromDestinationSquared: " + distanceFromDestinationSquared);
					
				if(distanceFromDestinationSquared < Math.pow(this.radius/(game.gridSize), 2))
				{	
					this.orders.path.shift();
				}

				/*	Sometimes infantry can't find the exact point to stand.
					As in they stand over it, with a slow turn speed,
					infantry will spin.

					The following if statement avoids that, by recording
					the previous distances, and once the distance is greater
					than the previous distance, the infantry have to stop.

					The last step is removed.
				*/
				if(distanceFromDestinationSquared > this.previousDistance)
				{
					this.orders.path.shift();
				}
				else
				{
					this.previousDistance = distanceFromDestinationSquared;
				}
			}

			// Once close enough to target, stop and attack
			if(this.state.attacking)
			{				
				if(this.target)
				{					
					if(this.target.life <= 0)
					{
						this.setNewTarget();
					}

					if(this.target)
					{
						// In range to fire, standing first to add to grid, then fire!
						if(Math.pow(this.target.x - this.x, 2) + Math.pow(this.target.y - this.y, 2) < Math.pow(this.sight, 2))
						{	
							this.state.attacking = true;
							this.orders.type = "standing";
							return;	
						}
					}
				}
				else
				{
					this.state.attacking = false;
					this.orders.type = "standing";
					return;	
				}
			}
			else
			{
				if(this.orders.path.length == 0)
				{
					// Returns the previousDistance to a large number, a reset.
					this.previousDistance = 100;
	
					if(this.state.capturing)
					{
						this.captureBuilding();
					}
					else if(this.state.loading)
					{
						this.orders.type = "standing";
					}
					else
					{
						// Infantry stops here
						if(debug.logMultiplayerStats)
						{
							console.log("vehicle stop here: " + this.uid);
							console.log(this.x + " " + this.y);
						}
						
						this.state.attacking = false;
						this.orders.type = "standing";
					}
	
					this.capturing = false;
	
					return false;
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

			

			if(this.nextStep == undefined)
			{
				// Searches for a new target
				if(this.state.attacking)
				{
					if(debug.vehiclesDebug)
					{
						console.log("%cNo path is avaialbe, finding a new target",
						'background: #000; color: #3aef38');
						console.log("Vehicle uid: " + this.uid);
						console.log("Vehicle uid: " + this.team);
						console.log("Vehicle type: " + this.name);
					}

					// var target = findNextClosetGroundAttackingTarget(
					// 	this.target,
					// 	this.team,
					// 	this.radius,
					// 	3,3,
					// 	this.x,this.y);
					var target = undefined;

					if(target)
					{
						this.target = target;
						this.orders.type = "attack";
						return;
					}
					else
					{
						if(debug.vehiclesDebug)
						{
							console.log("%cNo path is avaialbe, returning to the standing state",
								'background: #777; color: #86131d');
							console.log("Vehicle uid: " + this.uid);
							console.log("Vehicle type: " + this.name);
							console.log("Vehicle path length: " +this.orders.path.length);
						}

						this.state.attacking = false;
						this.orders.type = "standing";
						return;	
					}
				}
				else
				{
					// Just moving, then stop

					if(debug.vehiclesDebug)
					{
						console.log("%cNo path is avaialbe, returning to the standing state",
							'background: #777; color: #86131d');
						console.log("Vehicle uid: " + this.uid);
						console.log("Vehicle type: " + this.name);
						console.log("Vehicle path length: " +this.orders.path.length);
					}

					this.state.attacking = false;
					console.log("584");
					this.orders.type = "standing";
					return;	
				}		
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

			//this.checkForThresholds();
			//this.steering();

			this.collided = false;

			// Surrounding occurs when the first attacking vehicle is firing
			// at a target. Other attacking vehicles of the same target,
			// chance their behaviour

			//this.checkForVehicles();
			
			if (Math.abs(difference)>turnAmount)
				this.direction = wrapDirection(this.direction+turnAmount*Math.abs(difference)/difference,this.directions);		
			
			return true;
		},

		/**
		 * Once the first infantry has reached the destination,
		 * the whole platoon stops.
		 * 
		 * Additionally, the infantry will occupy a series of 
		 * collision cells and the sets then on.
		 * 
		 * This is true for the whole platoon. 
		 */
		standing:function()
		{
			// Add the cells to the grid
			cells.add(this.uid, this.x,this.y,this.radius / game.gridSize,
				game.currentTerrainMapPassableGrid,
				this.cellCollisionMode);

			if(debug.logSync)
				console.log("elements standing: ", this.x, this.y, this.sprite.x, this.sprite.y);

			console.log(this.state.attacking);

			//this.retreating = false;

			if(this.state.attacking)
			{
				// Set straight away if attacking
				// for other vehicles
				//cells.set(game.currentTerrainMapPassableGrid);

				for(var i = 0; i < game.items.length; i++)
				{
					if(!game.items[i])
						continue;

					if(!game.items[i].state)
						continue;

					if(!game.items[i].state.attacking)
						continue;

					if(game.items[i].team != this.team)
						continue;

					if(!game.items[i].isArmy)
						continue;

					if(game.items[i].target != this.target)
						continue;

					if(game.items[i].orders.type == "firing" || game.items[i].orders.type == "fire")
						continue;

					if(game.items[i] == this)
						continue;
					
					game.items[i].orders.type = "moveTo";
					game.items[i].state.attacking = true;
				}
				
				this.orders.type = "turnToFire";
				//this.orders.type = "stand";
			}
			else
			{
				
				this.animationOffset = 0;
				this.setFixedAnimation(0);

				// Resume to original stand state				
				this.orders.type = "stand";
			}
		},

		noPath:function()
		{
			this.state.attacking = false;
			console.log("699");
			this.orders.type = "standing";
		},

		zeroPath:function()
		{
			this.state.attacking = false;
			console.log("706");
			this.orders.type = "standing";
		},

		onPath:function(path)
		{
			this.orders.path = path;

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
		
		searchForNearTargets:function()
		{
			var targets = findTypeSortedTargets(
				this.team,
				this.type,
				this.radius,
				this.attackRange,
				this.exclusionRange,
				this.x,
				this.y);

			return targets;
		},

		steering:function()
		{
			this.hasCollided = false;
			this.hasCollidedSkin = false;
			this.hasCollidedStop = false;

			vehiclesFound = physics.check(this.x, this.y, this.radius*4);

			if(vehiclesFound && vehiclesFound.length > 0)
			{	
				var nearByItems = [];

				for(var i = 0; i < vehiclesFound.length; i++)
				{
					if(vehiclesFound[i].uid == this.uid)
						continue;

					var item = game.items[lookup.get(vehiclesFound[i].uid)];

					if(item.type == "infantry")
						continue;

					nearByItems.push(item);
				}

				if(nearByItems.length == 0)
					return;

				var collidedItems = physics.detect(this, nearByItems, "skin", "skin");

				for(var i = 0; i < collidedItems.length; i++)
				{
					if(this.target == undefined)
					{
						if(this.orders.to)
						{
							if(collidedItems[i].orders.to)
							{
								if(this.orders.to.id == collidedItems[i].orders.to.id &&
									collidedItems[i].orders.type == "stand" ||
									collidedItems[i].orders.type == "standing")
								{
									// Set to standing if the group as the same destination and
									// is stand or standing,
									// except if the target is undefined

									this.state.attacking = false;
									this.orders.type = "standing";

									console.log("change to stand via another vehicle: " + this.uid);

									if(debug.logMultiplayerStats)
									{
										console.log("change to stand via another vehicle: " + this.uid);
										console.log(this.x + " " + this.y);
									}

									return;
								}
							}
						}
					}
				}

				for(var i = 0; i < collidedItems.length; i++)
				{
					this.hasCollidedSkin = true;

					var furtherVehicle = findLongestPath(this, collidedItems[i]);

					if(furtherVehicle)
					{						
						if(this.uid == furtherVehicle.uid)
						{	
							if(isMoving(this) && isMoving(collidedItems[i]))
							{
								if(collidedItems[i].speed < this.speed)
								{
									this.decelerate();
									this.state.detouring = true;
									return;
								}
							}
						}						
					}

					if(furtherVehicle)
					{
						if(this.uid == furtherVehicle.uid)
						{	
							if(isMoving(this) && isMoving(collidedItems[i]))
							{
								this.decelerate();
								this.state.detouring = true;
								return;
							}
						}
					}

					var collidedBodyItems = physics.detect(this, nearByItems, "body", "body");

					for(var j = 0; j < collidedBodyItems.length; j++)
					{
						this.hasCollided = true;

						var furtherVehicleBody = findLongestPath(this, collidedBodyItems[j]);

						if(this.state.attacking)
						{
							if(furtherVehicleBody)
							{
								if(this.uid == furtherVehicleBody.uid)
								{									
									this.stop();
								}
							}
						}
						else
						{
							if(furtherVehicleBody)
							{
								if(this.uid == furtherVehicleBody.uid)
								{									
									this.stop();
								}
							}
						}
					}		
				}
			}
		},

		accelerate:function()
		{
			
		},

		decelerate:function()
		{

		},

		stop:function()
		{
			//this.accelerationIndex = this.accelerationFactor.length - 1;
		},

		guarding:function()
		{
			var newTarget = findGroundTarget(
				this,
				this.team,
				this.near);

			if(!newTarget)
			{
				this.orders.type = "guard";
				return;
			}
			
			if(newTarget)
			{				
				this.orders.type = "attack";

				this.target = newTarget;

				return;
			}
		},
		
		guard:function()
		{
			if(this.guardCount == this.guardLimit)
			{
				this.guardCount = 0;
				this.orders.type = "guarding";
				return;
			}
			this.guardCount++;
		},

		/**
		 * Default state of the elements
		 */
		stand:function()
		{
							
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

			if(this.state.attacking)
				newDestination.vel.setMag(norm + 0.0); 
			else
				newDestination.vel.setMag(norm + 0.5); 

			newDestination.pos.add(newDestination.vel);
			newDestination.vel.add(newDestination.acc);

			destination.x = newDestination.pos.x;
			destination.y = newDestination.pos.y;

			endX = Math.floor(destination.x);
			endY = Math.floor(destination.y);

			if(endX < 0 || endY < 0)
			{
				destination.x = orginalDestionationX;
				destination.y = orginalDestionationY;
				
				return;
			}

			if(game.currentTerrainMapPassableGrid[endY][endX] == flags.CELL_COLLISION_MODE_FULL)
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

		removeElementsFromTheCellTile()
		{
			cells.remove(
				this.uid,				
				game.currentTerrainMapPassableGrid,
				this.cellCollisionMode);
		},

		takeDamage:function(damage)
		{
			this.life = this.life - damage;

			this.lifeBarSprite.scale.set(1, 1);
			this.lifeBarSprite.scale.set(this.pixelWidth * this.life / this.hitPoints / 100, 4 / 100);

			this.lifeBarBorderSprite.scale.set(this.life / this.hitPoints, 1);

			this.destroyed();
		},

		destroyed:function()
		{
			if(this.isAlive && this.life <= 0)
			{
				this.isAlive = false; 

				if(this.bullet && this.bullet.sprite)
				{
                    renderer.removeBullet(this.bullet.sprite);
				}

				if(this.state)
					this.state.attacking = false;

				renderer.removeItem(this);
				renderer.removeEmitter(this.emitterIndex);

				cells.remove(
					this.uid,
					game.currentTerrainMapPassableGrid,
					this.cellCollisionMode);

				cells.remove_tactical_grid(
					this.uid,
					game.currentTerrainMapPassableGrid,
					this.cellCollisionMode
				);
			}
		},

		setNewTarget:function()
		{
			// var newTarget = findClosestGroundTarget(
			// 	this.team,
			// 	this.radius,
			// 	4,4,
			// 	this.target.x,this.target.y);

			var newTarget = findClosestGroundItem(this, physics.queryArmy.bind(physics));
				
			if(!newTarget)
			{
				this.state.attacking = false;
				this.orders.to = undefined;
				this.target = undefined;

				// No target found when searching for new target
				// Set to standing

				this.orders.type = "standing";
				return;
			}
			
			if(newTarget)
			{				
				console.log("new target found");
				this.orders.type = "moveTo";
				this.state.attacking = true;
				this.target = newTarget;
				return;
			}
		},

        draw:function()
		{
			this.animate();

			this.animateCollision();

			if(this.bullet)
				this.animateBullet();

			if (this.selected)
			{
				this.drawSelection();
				this.drawLifeBar();
			}

			if(game.radarTotal > 0)
			{
				//this.drawMiniMapMarker();
			}

			if(this.emitter)
			{
				this.drawEmitter();
			}
		},

		drawSprite:function()
		{
			
		},

		createPolygon()
		{
			this.near = new QuadTree.Boundary();
		},

        animate:function()
        {
            if((this.animationSpeed % Math.round(this.animationSpeedLimit)) == 0)
            {
				if(this.playInReverse)
				{
					if(this.animationCount > 0)
					{
						this.animationCount--;

						this.sprite.texture = renderer.texturesMap.get(this.team + "_" + this.name)
							[this.animationCount + this.animationOffset];
					}
					else
					{
						this.animationCount++;
						this.playInReverse = false;
					}
				}
				else
				{
					if(this.animationCount < this.animationLimit)
					{	
						this.sprite.texture = renderer.texturesMap.get(this.team + "_" + this.name)
							[this.animationCount + this.animationOffset];
	
						this.animationCount++;
					}
					else
					{
						if(this.animationLoopInReverse)
						{
							this.playInReverse = true;
							this.animationCount--;
						}
						else
						{
							this.animationCount = 0;
						}
					}
				}                

                //console.log(this.animationCount < this.animationLimit);
            }   
            
			this.animationSpeed++;
		},

		animateCollision:function()
        {
			if(this.direction == undefined)
				console.log("this.direction is undefined");

			var translateX = this.x * game.gridSize;
			var translateY = this.y * game.gridSize + display.maininterface.mapImageYOffset;

			this.near.x = translateX - 200;
			this.near.y = translateY - 200;
			this.near.w = this.near.x + 400;
			this.near.h = this.near.y + 400;
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
			// this.animationDirection = wrapAnimationDirection(
			// 	Math.round(this.direction),this.directions,	frame);

			// this.sprite.texture = renderer.texturesMap.get(this.team + "_" + this.name)
			// 	[this.animationDirection];
			this.sprite.texture = renderer.texturesMap.get(this.team + "_" + this.name)
			 	[frame];
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

		drawMiniMapMarker:function()
		{	
			this.miniMapMarker.visible = true;

			if(minimap.zoomOut)
			{
				this.miniMapMarker.x = display.minimapScreen.x + 
					((this.sprite.x + game.offsetX) / 20) /
					game.level.mapGridWidth * 
			   		display.minimapScreen.dimension;

				this.miniMapMarker.y = display.minimapScreen.y + 
					((this.sprite.y - display.maininterface.mapImageYOffset + game.offsetY) / 20) / 
					game.level.mapGridHeight *
					display.minimapScreen.dimension;
			}
			else
			{
				this.miniMapMarker.x = display.minimapScreen.x +
					this.sprite.x / 
		   			display.gameplayScreen.width *
		   			display.minimapScreen.dimension;

				this.miniMapMarker.y = display.minimapScreen.y + 
					(this.sprite.y-display.maininterface.mapImageYOffset) / 
					display.gameplayScreen.height *
					display.minimapScreen.dimension;
			}			

			if(this.miniMapMarker.x < display.minimapScreen.x)
				this.miniMapMarker.visible = false;

			if(this.miniMapMarker.x > display.minimapScreen.x + display.minimapScreen.dimension + canvasWidthOffset)
				this.miniMapMarker.visible = false;

			if(this.miniMapMarker.y < display.minimapScreen.y)
				this.miniMapMarker.visible = false;

			if(this.miniMapMarker.y > display.minimapScreen.y + display.minimapScreen.dimension)
				this.miniMapMarker.visible = false;
		},

		drawEmitter:function()
		{
			if(this.emitter && game.emitters[this.emitterIndex])
			{
				game.emitters[this.emitterIndex].particles.ownerPos.x = this.x * game.gridSize - renderer.cameraOffsetX;
				game.emitters[this.emitterIndex].particles.ownerPos.y = this.y * game.gridSize - renderer.cameraOffsetY + display.maininterface.mapImageYOffset;
			}
		},

		select:function()
		{
			this.selected = true;

			this.selectionSprite.visible = true;
			this.selectionSprite.scale.set(this.radius / 100, this.radius  / 100);

			this.selectionBorderSprite.visible = true;

			this.lifeBarBorderSprite.visible = true;

			this.lifeBarSprite.visible = true;
			this.lifeBarSprite.scale.set(this.pixelWidth * this.life / this.hitPoints / 100, 4 / 100);
		},

		unselect:function()
		{
			this.selected = false;

			this.selectionSprite.visible = false;
			this.selectionSprite.scale.set(1, 1);

			this.selectionBorderSprite.visible = false;
			this.lifeBarBorderSprite.visible = false;

			this.lifeBarSprite.visible = false;
			this.lifeBarSprite.scale.set(1, 1);
		},

		destory:function()
		{
			if(this.bullet && this.bullet.sprite)
				renderer.removeBullet(this.bullet.sprite);
		}
    }
}