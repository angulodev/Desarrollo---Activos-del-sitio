Building = function() {
	this.templateName     = "building";
	BaseComponent.call(this);
	
	// DOMs
	this.mapDOM      	  = null;
	this.buildingDOM      = null;
	this.surroundingsDOM  = null;
	this.mapNavigationDOM = null;
	this.currentFloor     = null;
	this.searchContainer  = null;
	
	// Floor Data
	this.floors           = [];
	this.floorCounter     = 0;
	this.floorsDOMs       = [];
	this.detailsViewDeg   = [null,null,null]; // X, Y, Z
	this.rooms            = {};
	this.floorLoadedCounter = 0
	this.maxFloors        = 4;
	this.currentBaseFloor = 0;
	this.floorSpacing     = MOBILE ? -18 : -12;
	this.chairs           = [];
	this.chairsRegex      = /(^G[0-9]+|^S[0-9]+|^[0-9]+)$/;
	
	// Pins
	this.pins 			  = [];
	this.searchPosition   = null;
	this.selectingSeat    = false;
	this.focusedSeat 	  = null;
	this.pinSVGs 		  = {
		"salas" 		: {
			"icon": "icon_salareunion.svg",
			"text": "Salas de Reuni贸n"
		},
		"wc"    		: {
			"icon": "icon_banos.svg",
			"text": "Ba帽os"
		},
		"common"		: {
			"icon": "icon_espacioscomunes.svg",
			"text": "Espacios Comunes"
		},
		"internal_seat" : {
			"icon": "icon_personalentel.svg",
			"text": "Personal Interno"
		},
		"external_seat" : {
			"icon": "icon_personalexterno.svg",
			"text": "Personal Externo"
		},
		"elevator"      : {
			"icon": "icon_acensores.svg",
			"text": "Ascensores"
		},
		"reception"     : {
			"icon": "icon_recepcion.svg",
			"text": "Recepci贸n"
		} 
	}
	this.miLocation       = null;

	// Constants
	this.UP 			  = 1;
	this.DOWN 			  = 2;
	this.FLAT 			  = "2D";
	this.ISO			  = "3D";
	this.PORTRAIT 		  = "2DP"

	this.state = {
		id 			 : null,
		buildingName : "",
		floors 		 : {},
		upDirection	 : this.UP,
		downDirection: this.DOWN
	}

	// Other
	this.employeeModel = null;
	this.employeeList = [];
	this.currentPerspective = this.ISO;
	this.isLoadingFloors = false;

	/*
	* Set Event Listeners
	* */
	this.setEvents = () => {
		// Go back
		this.loadLandingBtn = document.querySelectorAll("a.btn-load-landing");
		this.loadLandingBtn.forEach(btn => {
			btn.addEventListener("click", this.loadLanding);	
		})
		// Show full map
		this.showFullMapBtn = document.querySelector("a.btn-show-building");
		this.showFullMapBtn.addEventListener("click", this.resetView);
		// Change current floor
		this.changeFloorBtns = document.querySelectorAll("a.btn-change-floor");
		this.changeFloorBtns.forEach(changeFloorBtn => {
			changeFloorBtn.addEventListener("click", this.changeFloor);
		});
		this.buildingControls = document.querySelector("#building-controls");
		if( this.floors.length == this.maxFloors ) {
			this.buildingControls.remove();
		} else {
			this.buildingControls.querySelectorAll("a.building-controls__btn").forEach( btn => {
				btn.addEventListener("click", this.loadFloors);
			});
		}
		this.perspectiveBtn = this.container.querySelector(".btn--change-perspective__control");
		this.perspectiveBtn.addEventListener("click", evt => {
			this.changePerspective(evt);
		});
		this.goToMyLocation   = this.container.querySelector("#btn-my-location");
		this.goToMyLocation.addEventListener("click", this.parent.myLocation);
		this.flexibleSeatBtn = this.container.querySelector("#flexible-dialog a");
		this.flexibleSeatBtn.addEventListener("click", this.showFlexibleDialog)
	}

	/*
	* Building INFO
	* */
	this.setBuilding = building => {
		this.state.id = building.id;
		this.state.buildingName = building.name;
		this.mapsFolder = "/image/"+building.id;
		this.setFloors(building.floors);
		if( building.view ) {
			this.detailsViewDeg = building.view;
		}
	}

	/*
	* Load Building Rooms INFO
	* */
	this.loadBuildingRoomsInfo = () => {
		this.rooms = {};
		let configs     = {
			filters : {
				edificio : this.state.id
			}, 
			fields  : ["id_sala", "piso","nombre_mostrar"], 
			top     : 100
		};
		loading(true, "Obteniendo informaci贸n de salas");
		let fetchRequest = fetchFromSharePoint("SalaReuniones", configs).then(response => {
			loading(false);
			return response.json();
		})
		return fetchRequest.then(responseJSON => {
			responseJSON.d.results.forEach( room => {
				if( this.rooms[room.piso] == undefined ) {
					this.rooms[room.piso] = [];
				}
				this.rooms[room.piso].push(room);
			});
			return this.rooms;
		});
	}

	this.loadSeatsInfo = () => {
		return new Promise( (resolve, error) => {
			loading(true, "Obteniendo informaci贸n de asientos");
			importModel("Employee").then( model => {
				this.employeeModel = model;
				(new model()).then( obj => {
					obj.findByBuilding(this.listBuildingID).then( list => {
						loading(false);
						this.employeeList = list;
						resolve();
					});
				});
			});
		});
	}

	/*
	* Set floor number array
	* */
	this.setFloors = (floors) => {
		if( floors instanceof Array ){
			this.floors = floors;
		}
	}

	/*
	* Set a specific position
	* */
	this.setPosition = (position) => {
		this.searchPosition = {
			"floor": position.PISO,
			"seat" : position.PUESTO,
			"info" : position
		}
	}

	this.setSearchResult = employeeObject => {
		this.searchResult = employeeObject;
	}

	/*
	* Has Loaded
	* */
	this.hasLoaded = () => {
		this.componentDOM     = document.querySelector("#building-component");
		this.mapDOM           = document.querySelector("#map");
		this.buildingDOM      = document.querySelector("#building");
		this.surroundingsDOM  = document.querySelector("#surroundings");
		this.mapNavigationDOM = document.querySelector("#map-navigation");
		this.sidenavDOM       = document.querySelector("#common-spaces-navigation");
		this.searchContainer  = document.querySelector("#search-component");
		this.user             = this.parent.user;
		this.leyendDOM        = this.container.querySelector("#leyend");
		this.flexibleCount    = this.container.querySelector("#flexible-count");
		this.flexibleDialog   = this.container.querySelector("#flexible-dialog");

		// get the SharePoint building ID
		Object.keys(this.parent.builingIdMap).forEach( key => {
			let buildingInfo = this.parent.builingIdMap[key];
			if( buildingInfo.id == this.state.id ){
				this.listBuildingID = key;
			}
		});
		document.querySelectorAll(".layout").forEach(layoutDOM => {
			layoutDOM.style.setProperty("--zposition", this.floorSpacing+"vmin")
		});
		this.loadIcons().then( () => {
			// Load Floors Maps
			this.loadBuildingRoomsInfo().then( () => {
				this.loadSeatsInfo().then( () => {
					loading(true, "Descargando planos");
					let downloadFloorPlans = new Promise( (resolve, error) => {
						this.floors.slice(0, this.maxFloors).forEach( floorNumber => {
							let order = this.floorCounter;
							this.floorCounter++;
							this.loadFloor(floorNumber, order).then( loadedFloor => {
								this.floorsDOMs[order] = loadedFloor;
								this.floorLoadedCounter++;
								if( this.floorLoadedCounter == this.maxFloors ){
									resolve();
								}
							});
						});
					});
					downloadFloorPlans.then( () => {
						setTimeout( () => {
							this.mapDOM.removeClass("hidden");
							loading(false);
						}, 10);
						if( this.user.seatNumber == null ) {
							this.displaySelectSeatMode();
						} else {
							if( this.searchResult != null ) {
								this.loadSearchResult();
							}
						}
					});
				});
			});
		});
		importComponent("search").then( obj =>{
			this.searchComponent = new obj();
			this.searchComponent.setParent(this);
			this.searchComponent.setTargetContainer(this.searchContainer);
			this.searchComponent.loadHTML().then( _ => {
				this.searchComponent.render();
			});
			this.container.addEventListener("click", this.searchComponent.hideAutocomplete);
		});
	}

	this.loadSearchResult = () => {
		loading(true, "Cargando posici贸n");
		let floor = this.buildingDOM.querySelector("#floor-"+parseInt(this.searchResult.floor));
		if( floor == null ){
			this.loadNextFloor(this.UP).then( () => {
				this.loadSearchResult();
			})
			return;
		}
		this.floorDetails(floor).then( () => {
			let pin = this.setPositionPin(this.searchResult);
			setTimeout( () => {
				loading(false);
				this.sidenavComponent.selectItem(pin);
			}, 1000);
		});
	}

	this.getCurrentFloorNumber = () => {
		if( this.currentFloor !== null && this.currentFloor.dataset != null ) {
			return this.currentFloor.dataset.number;
		}
	}

	/*
	 * Load Floors as Batch. Recursive method
	 * */
	this.loadFloors = (direction, changeBy, counter) => {
		if( this.isLoadingFloors ){
			return;
		}
		this.isLoadingFloors = true;
		if( direction instanceof Event && direction.target !== null && direction.target.dataset != null ){
			direction = direction.target.dataset.direction;
			if( direction == null ){
				error("Invalid direction: " + direction);
			}
		}
		if( changeBy == undefined ){
			changeBy = 4;
		}
		if( counter == undefined ) {
			counter = 0;
		}
		let baseFloorIndex = this.currentBaseFloor;
		// Check if more floors need to be loaded
		if( counter < changeBy ){
			this.loadNextFloor(direction).then( floorDOM => {
				this.isLoadingFloors = false;
				loading(false);
				counter++;
				this.loadFloors(direction, changeBy, counter);
			});
		} else {
			this.isLoadingFloors = false;
		}
	}

	/*
	 * Load the next floor on the list
	 * */
	this.loadNextFloor = (direction, startOutOfView) => {
		if( startOutOfView == undefined ){
			startOutOfView = false;
		}
		loading(true, "Cargando pisos");
		return new Promise( (resolve, error) => {
			let baseFloorIndex = this.currentBaseFloor;
			let floorToLoad    = null;
			let floorClass     = null;
			if( direction == this.UP ){
				floorToLoad   = baseFloorIndex + this.maxFloors;
				baseFloorIndex++;
				floorClass = "hide-up";
			}
			if( direction == this.DOWN ){
				floorToLoad   = baseFloorIndex - 1;
				baseFloorIndex--;
				floorClass = "hide-down";
			}
			if( !startOutOfView ) {
				floorClass = undefined;
			}
			if( (floorToLoad >= (this.floors.length)) || (floorToLoad < 0) ){
				floorToLoad   = null;
				outFloorIndex = null;
			}
			if( floorToLoad != null ) {
				this.currentBaseFloor = baseFloorIndex;
				this.loadFloor(this.floors[floorToLoad], floorToLoad, floorClass).then( loadedFloor => {
					let zPosition = ( ( baseFloorIndex + 1 ) * this.floorSpacing )+"vmin";
					this.buildingDOM.style.setProperty("--zposition", zPosition);
					let removedFloor = null;
					if( direction == this.UP ){
						removedFloor = this.floorsDOMs.shift();
						this.floorsDOMs.push(loadedFloor);
					}
					if( direction == this.DOWN ){
						removedFloor = this.floorsDOMs.pop();
						this.floorsDOMs.unshift(loadedFloor);
					}
					if( !startOutOfView ){
						fadeOut(removedFloor).then( dom => {
							dom.remove();
						});
						fadeIn(loadedFloor).then( dom => {
							loading(false);
						});
					} else {
						removedFloor.remove();
					}
					loading(false);
					resolve(loadedFloor);
				});
			} else {
				loading(false);
				resolve();
			}
		});
	}

	/*
	 * Load Pines
	 * */
	this.loadIcons = () => {
		return new Promise( (resolve, error) => {
			let ids = Object.keys(this.pinSVGs);
			let total = ids.length;
			let counter = 0;
			let leyendList = this.leyendDOM.querySelector(".pin-list");
			ids.forEach(id => {
				let pin = this.pinSVGs[id];
				let svg = pin.icon;
				fetch(`${BASE_URL}${WEB_PATH}/image/${svg}`,getDefaultFetchConfigs()).then(response => {
					return response.text();
				}).then(data => {
					createDOM("div", {"id":"pin-"+id, "className": ["floating-pin--"+id,"hidden"]}, this.componentDOM, data);
					if( id == "external_seat" || id == "internal_seat" ){
						let listItem = createDOM("li", "pin-list--item", leyendList);
						let icon = createDOM("div", {className: ["pin-icon", "floating-pin--"+id]}, listItem, data);
						let text = createDOM("div", "pin-text", listItem, pin.text);
					}
					counter++;
					if( counter == total ){
						resolve();
					}
				});
			});
		});
	}

	/*
	 * Load Landing
	 * */
	this.loadLanding = evt => {
		this.parent.loadLanding();
	}

	/*
	 * Load a floor into the map screen
	 * */
	this.loadFloor = (floorNumber, order, className) => {
		return new Promise( (resolve, error) => {
			// Floor DOM
			let floorDOM 	= document.createElement("div");
			// Set Floor Number
			floorDOM.title 	= String(floorNumber);
			floorDOM.id 	= "floor-" + floorNumber;
			floorDOM.dataset.number = floorNumber;
			// Set the floor class(es)
			floorDOM.addClass("floor");
			if( className != undefined ) {
				floorDOM.addClass(className);
			}
			// this variable set the floor position in 3D space
			floorDOM.style.setProperty("--zposition", Math.abs(order*this.floorSpacing) + "vmin");
			// Fetch floor map (SVG)
			let randomString = String(Math.random()*(Math.random()*1000)).replace(".","");
			fetch(`${BASE_URL}${WEB_PATH}${this.mapsFolder}/${floorNumber}.svg?${randomString}`, getDefaultFetchConfigs({})).then( response => {
				if( response.status == 200 ) {
					response.text().then(svg => {
						let floorSvg = svg;
						floorDOM.innerHTML = floorSvg;
						if( floorDOM.querySelector("svg") == undefined ){
							return;
						}
						floorDOM.querySelector("svg").addEventListener("click", this.floorDetails, true);
						this.buildingDOM.appendChild(floorDOM);
						resolve(floorDOM);
					});
				} else {
					error("Error loading floor");
				}
			});
		});
	}

	this.setPositionPin = (user) => {
		let floating = false;
		if( typeof user.seatNumber == "string" ){
			floating = user.seatNumber.toUpperCase() == "F";
		}
		// this.removePins();
		let rect = this.currentFloor.querySelector("[id='"+user.seatNumber+"']");
		if( floating ){
			rect = this.currentFloor.querySelector("svg");
		}
		let type = user.isInternal ? "internal_seat" : "external_seat";
		let pin = this.createPin(rect, user.name, 0, type);
		if( pin == undefined ) {
			return;
		}
		pin.info = user.extraInfo;
		pin.info.buildingName = this.state.buildingName;
		let map = document.querySelector("#map");
		map.appendChild(pin.dom);
		return pin;
	}

	/*
	* Show floor details
	* */
	this.floorDetails = (floor, view) => {
		let selectedFloor = null;
		if( floor instanceof Event ){
			selectedFloor = findParentByClass(floor.target, "floor")
		}
		if( floor instanceof HTMLElement ) {
			selectedFloor = floor;
		}
		let currentFloorIndex = this.floorsDOMs.indexOf(selectedFloor);
		if( this.currentFloor != null ) {
			newFloorIndex = this.floorsDOMs.indexOf(this.currentFloor);
			if( newFloorIndex == currentFloorIndex ) {
				return;
			}
			currentFloorIndex = newFloorIndex;
		}
		this.floorsDOMs.forEach( floorDOM => {
			if ( parseInt(floorDOM.dataset.number) < parseInt(selectedFloor.dataset.number) ) {
				disappearDown(floorDOM);
			}
			if ( parseInt(floorDOM.dataset.number) > parseInt(selectedFloor.dataset.number) ) {
				disappearUp(floorDOM);
			}
		});
		return new Promise( (resolve, error) => {
			this.setCurrentFloor(selectedFloor, view).then( floor => {
				fadeOut(this.surroundingsDOM);
				this.toggleSidenav(true);
				zoomIn(this.buildingDOM).then( _ => {
					setTimeout( () => {
						this.setPins(floor);
						this.setupSeatInfo();
						resolve();
					}, 20);
				});
			});
		});
	}

	this.setupSeatInfo = () => {
		new Promise( (resolve, error) => {
			// Get a List of al employees on current floor with a seat number assigned
			let floorEmployeeList = this.employeeList.filter( employee => {
				return (parseInt(employee.floor)==parseInt(this.currentFloor.dataset.number) && employee.seatNumber!=null);
			});
			// Get a List of al employees on current floor with a seat number pending
			let floorEmployeeListPending = this.employeeList.filter( employee => {
				return (employee.pendiente!=null && parseInt(employee.pendiente.split("-")[1])==parseInt(this.currentFloor.dataset.number));
			});
			
			// Bring all chairs to front view for selection
			let svg = this.currentFloor.querySelector("svg");
			if( this.chairs.length == 0 ){
				svg.querySelectorAll("g, rect").forEach(elem => {
					if( this.chairsRegex.test(elem.id) ) {
						this.chairs.push(elem);
					}
				});
			}
			this.chairs.forEach(chair => {
				// Check if the current chair has an employee assigned or is pending for request
				let employee = floorEmployeeList.filter(e=>e.seatNumber==chair.id);
				if( employee.length > 0 ){
					chair.classList.add("taken");
				}
				else{
					let employeePending = floorEmployeeListPending.filter(e=>e.pendiente.split("-")[2]==chair.id);
					if( employeePending .length > 0 ){
						chair.classList.add("requested");
					}
					else{
					    chair.classList.add("free");
					}
				}
				svg.appendChild(chair);
			});

			// Set the info for the flexible seats
			this.flexibleDialog.removeClass("hidden");
			try {
				const flexibleSeats = floorEmployeeList.filter(e => e.seatNumber.toLowerCase() == "f");
				if( flexibleSeats.length > 0 ){
					this.flexibleCount.innerHTML = flexibleSeats.length;
					this.flexibleSeatBtn.employees = flexibleSeats;
				} else {
					this.flexibleDialog.addClass("hidden");	
				}
			} catch(e) {
				this.flexibleDialog.addClass("hidden");
				this.flexibleCount.innerHTML = 0;
			}
			resolve();
		}).then( () => {
			this.mapDOM.addEventListener("mouseover", this.hoverSeatSelection);
		});
	}

	/*
	* Reset to map view 
	* */
	this.resetView = evt => {
		if( evt != undefined ){
			evt.preventDefault();
		}
		if( this.isControlBlocked() ){
			return;
		}
		// Remove all pins from map
		this.removePins();
		// Deactivate mouseover on map
		this.mapDOM.removeEventListener("mouseover", this.hoverSeatSelection);
		// Push view back to its default position
		//this.currentFloor.removeClass("current");
		/*
		this.chairs.forEach(chair => {
			chair.remove();
		});
		//*/
		this.chairs = [];
		let currentFloorNumber = this.currentFloor.dataset.number;
		this.setCurrentFloor(null).then( currentFloor => {  // Set the current floor to null to prevent conflicts
			// Zoom out
			zoomOut(this.buildingDOM);
			// Reposition all other floors to their original position
			this.floorsDOMs.forEach( (floorDOM, index) => {
				// If this floor is a lower floor
				if ( parseInt(floorDOM.dataset.number) < parseInt(currentFloorNumber) ) {
					appearUp(floorDOM);
				}
				// If this floor is an upper floor
				else if ( parseInt(floorDOM.dataset.number) > parseInt(currentFloorNumber) ) {
					appearDown(floorDOM);
				} else {
					// Do nothing, current floor
				}
			});
			// After all the floors are in their position, show environment and hide controllers
			setTimeout(()=>{
				fadeIn(this.surroundingsDOM);
				this.toggleSidenav(false);
			}, 500);
		});
	}

	/*
	* Change floor (up or down)
	* */
	this.changeFloor = evt => {
		if( this.isControlBlocked() ){
			return;
		}
		if( this.showFullMapBtn.disabled || this.changeFloorBtns.disabled ){
			return;
		}
		this.showFullMapBtn.disabled = true;
		this.changeFloorBtns.disabled = true;
		/*
		this.chairs.forEach(chair => {
			chair.remove();
		});
		//*/
		this.chairs = [];
		const changeFloorPromise = new Promise( (resolve, error) => {
			// Set variables
			let newFloor = null;
			let newIndex = null;
			// Prevent default button action
			evt.preventDefault();
			// Get the direction we need to move (UP or DOWN)
			let target = findParentByClass(evt.target, "btn-change-floor");
			let direction = target.dataset.direction;
			if( isNaN( direction ) ){
				console.trace();
				throw new Error("Invalid direction!");
			}
			direction = parseInt(direction);
			// Load a new Floor just in case.
			let loadFloorPromise = null;
			let indexOfCurrentFloor = this.floorsDOMs.indexOf(this.currentFloor);
			// Only load a new floor on the first or last floor
			if( ( (indexOfCurrentFloor == 0) && (direction == this.DOWN) ) || 
				( (indexOfCurrentFloor == (this.floorsDOMs.length - 1)) && (direction == this.UP) ) ) {
				loadFloorPromise = this.loadNextFloor(direction, true);
			} else {
				loadFloorPromise = new Promise( resolve => { resolve(null) });
			}
			loadFloorPromise.then( newFloor => {
				let currentFloorIndex = parseInt(this.floorsDOMs.indexOf(this.currentFloor)); // Current floor index
				// Set the new floor index
				switch( direction ) {
					case this.UP:
						newIndex = currentFloorIndex + 1;
						break;
					case this.DOWN:
						newIndex = currentFloorIndex - 1;
						break;
				}
				// Get the new floor DOM
				newFloor = this.floorsDOMs[newIndex];
				// If new floor index is inside the range of the floor array, then show it
				if( newFloor !== null ) {
					// Remove old pins
					this.removePins(false);
					// Set the new floor
					this.setCurrentFloor(newFloor).then( floor => {
						let oldFloor = this.floorsDOMs[currentFloorIndex];
						let floorChangePromise = null;
						// Move Up
						if( newIndex < currentFloorIndex ) {
							disappearUp(oldFloor);
							floorChangePromise = appearUp(floor);
						}
						// Move Down
						if( newIndex > currentFloorIndex ) {
							disappearDown(oldFloor);
							floorChangePromise = appearDown(floor);
						}
						// After floor has ended changing, show the pins
						floorChangePromise.then( newCurrentFloor => {
							setTimeout( () => {
								this.setupSeatInfo();
								this.setPins(newCurrentFloor);
								resolve();
							}, 20);
						});
					});
				} else {
					resolve();
				}
			});
		}).then( () => {
			this.showFullMapBtn.disabled = false;
			this.changeFloorBtns.disabled = false;
		});
	}

	this.isControlBlocked = () => {
		if( this.selectingSeat ){
			dialog("<h3>Debe seleccionar su asiento primero</h3>", "Control Bloqueado", true);
			return true;
		}
		return false;
	}

	/*
	* Set the current floor 
	* */
	this.setCurrentFloor = (floor, view) => {
		if( view == undefined ) {
			if( !MOBILE ) {
				view = this.ISO;
			} else {
				view = this.PORTRAIT;
			}
		}
		if( this.currentFloor != null ){
			this.currentFloor.removeClass("flat");
			this.resetPerspectiveBtn();
		}
		let _self = this;
		let currentFloorPromise = new Promise( (resolve, error) => {
			if( _self.currentFloor instanceof Element ){
				_self.currentFloor.removeClass("current");
			}			
			let titleContainer = this.container.querySelector(".backcontrol h1");
			if(titleContainer != null){
				titleContainer.innerHTML = `${this.state.buildingName}`;
			}			
			_self.currentFloor = floor;
			if( floor instanceof Element ) {
				if(titleContainer != null){
					titleContainer.innerHTML = `${this.state.buildingName} / Piso ${floor.dataset.number}`;
				}
				floor.addClass("current");
				this.changePerspective(view, false);
				let currentFloorIndex = this.floors.indexOf(parseInt(floor.dataset.number));
				let buttonDown = this.mapNavigationDOM.querySelector(".down");
				let buttonUp   = this.mapNavigationDOM.querySelector(".up");
				if( buttonDown != null && buttonUp != null ){
					buttonDown.removeAttribute("disabled");
					buttonUp.removeAttribute("disabled");
				}
				// Block control down
				if( currentFloorIndex == 0 ) {
					buttonDown.setAttribute("disabled", true);
				}
				// Block control up
				if( currentFloorIndex == this.floors.length -1 ) {
					buttonUp.setAttribute("disabled", true);
				}
			}
			resolve(floor);
		});
		return currentFloorPromise;
	}

	this.setDomPerspective = (dom, xValue, yValue, zValue, timeout) => {
		if( timeout == undefined ) {
			timeout = 0;
		}
		return new Promise( resolve => {
			dom.style.setProperty("--rotateX", xValue);
			dom.style.setProperty("--rotateY", yValue);
			dom.style.setProperty("--rotateZ", zValue);
			setTimeout(resolve, timeout);
		});
	}

	this.setPins = floor => {
		if( floor == null ){
			return;
		}
		return new Promise( (resolve, error) => {	
			const buildingId  = this.buildingDOM.dataset.id;
			const floorNumber = floor.dataset.number;
			this.removePins();
			let containerBounds = floor.getBoundingClientRect();
			// List all the rooms
			let map = document.querySelector("#map");
			let pinCounter = 0;
			// Meeting Rooms			
			let meetingRooms = floor.querySelectorAll("[id^=sal_]");
			meetingRooms.forEach( meetingRoomRect => {
				let roomInfo = this.rooms[floorNumber].filter(room => room.id_sala == meetingRoomRect.id).pop();
				if( roomInfo == undefined ){
					roomInfo = {
						nombre_mostrar: "Sin datos"
					}
				}
				// Create pin and add event
				let pin = this.createPin(meetingRoomRect, roomInfo.nombre_mostrar, pinCounter, "salas");
				pin.dom.addClass("floating-pin--popover");
				map.appendChild(pin.dom);
				pinCounter++;
			});
			// Common Areas
			let commonAreas = floor.querySelectorAll("[id^=com_zona]");
			commonAreas.forEach( commonArea => {
				let title = "Zona de Estar";
				// Create pin and add event
				let pin = this.createPin(commonArea, title, pinCounter, "common");
				pin.dom.addClass("floating-pin--popover");
				map.appendChild(pin.dom);
				pinCounter++;
			});
            // Center service
			let centerservice = floor.querySelectorAll("[id^=com_centroservicio]");
			centerservice.forEach( centerservice => {
				let title = "Centro de Servicio";
				// Create pin and add event
				let pin = this.createPin(centerservice, title, pinCounter, "common");
				pin.dom.addClass("floating-pin--popover");
				map.appendChild(pin.dom);
				pinCounter++;
			});
			// Coffe Shops
			let coffeShops = floor.querySelectorAll("[id^=com_cafeteria]");
			coffeShops.forEach( coffeShop => {
				let title = "Cafeter铆a";
				// Create pin and add event
				let pin = this.createPin(coffeShop, title, pinCounter, "common");
				pin.dom.addClass("floating-pin--popover");
				map.appendChild(pin.dom);
				pinCounter++;
			});
			// Bathrooms
			let bathrooms = floor.querySelectorAll("[id^=com_banos]");
			bathrooms.forEach( bathroom => {
				let regexMatch = bathroom.id.match(/(hombre|mujer)/);
				let type = "";
				if( regexMatch != null ){
					type = regexMatch[1];
					type = " " + type.substr(0,1).toUpperCase() + type.substr(1);
				}
				let title = "Ba帽os" + type;
				// Create pin and add event
				let pin = this.createPin(bathroom, title, pinCounter, "wc");
				pin.dom.addClass("floating-pin--popover");
				map.appendChild(pin.dom);
				pinCounter++;
			});
			// Elevators
			let elevators = floor.querySelectorAll("[id^=com_ascensor]");
			elevators.forEach( elevator => {
				let title = "Ascensor";
				// Create pin and add event
				let pin = this.createPin(elevator, title, pinCounter, "elevator");
				pin.dom.addClass("floating-pin--popover");
				map.appendChild(pin.dom);
				pinCounter++;
			});
			// Reception
			let receptions = floor.querySelectorAll("[id^=com_recepcion]");
			receptions.forEach( reception => {
				let title = "Recepci贸n";
				// Create pin and add event
				let pin = this.createPin(reception, title, pinCounter, "reception");
				pin.dom.addClass("floating-pin--popover");
				map.appendChild(pin.dom);
				pinCounter++;
			});
			resolve();
		});
	}

	this.createPin = (rect, title, counter, category) => {
		// Get svg element position
		if( rect == null || rect.getClientRects() == null || rect.getClientRects()[0] == null ) {
			return;
		}
		let position = {
			y: ((rect.getClientRects()[0].top + rect.getClientRects()[0].bottom) / 2) - 120,
			x: ((rect.getClientRects()[0].left + rect.getClientRects()[0].right) / 2)// + this.offsetRight
		}
		// Anchor
		let pinSVG = document.querySelector("#pin-"+category).innerHTML;
		let pinDOM = createDOM("a", {"href":"javascript:void(0);", "className": ["floating-pin", "floating-pin--"+category], "title": title}, null, pinSVG);
		pinDOM.style.setProperty("--topposition", position.y+"px");
		pinDOM.style.setProperty("--leftposition", position.x+"px");
		pinDOM.style.setProperty("z-index", parseInt(position.y));
		pinDOM.style.setProperty("--delay", counter/10+"s");
		let pin          = {
			"id"   : rect.id,
			"title": pinDOM.title,
			"dom"  : pinDOM,
			"cat"  : category
		}
		this.pins.push(pin);
		return pin;
	}

	this.removePins = animate => {
		if( animate === undefined ) {
			animate = true;
		}
		this.pins.forEach( pin => {
			if( animate ){
				pin.dom.addClass("animation-floating-pin__up");
			} else {
				fadeOut(pin.dom);
			}
			setTimeout( _ => {
				pin.dom.remove(); // remove from document
			}, 500);
		});
		this.pins = [];
		this.setSidenav();
	}

	this.toggleSidenav = show => {
		if( show === undefined ){
			show = this.sidenavDOM.hasClass("hidden");
		}
		if( this.currentPerspective = this.ISO ){
			this.perspectiveBtn.dataset.view = this.ISO;
			this.perspectiveBtn.removeClass("checked");
		} else {
			this.perspectiveBtn.dataset.view = this.FLAT;
			this.perspectiveBtn.addClass("checked");
		}
		if( show ){
			if( !MOBILE ) {
				//this.searchContainer.style.setProperty("right", "330px");
			}
			fadeIn(this.sidenavDOM).then( dom => {
				//this.offsetRight = ( this.sidenavDOM.getBoundingClientRect().width / 2 );
				//this.mapDOM.style.setProperty("right", this.offsetRight+"px");
			});
			fadeIn(this.perspectiveBtn);
			fadeIn(this.mapNavigationDOM);
			this.perspectiveBtn.dataset.view = this.FLAT;
			this.perspectiveBtn.addClass("checked");
			this.perspective = this.ISO;
			fadeIn(this.leyendDOM);
			if( this.buildingControls != undefined && this.buildingControls != null ) {
				fadeOut(this.buildingControls);
			}
		} else {
			if( !MOBILE ) {
				//this.searchContainer.style.removeProperty("right");
			}
			this.mapDOM.style.removeProperty("right");
			fadeOut(this.sidenavDOM);
			fadeOut(this.perspectiveBtn);
			fadeOut(this.mapNavigationDOM);
			fadeOut(this.leyendDOM);
			if( this.buildingControls != undefined && this.buildingControls != null ) {
				fadeIn(this.buildingControls);
			}
		}
	}

	this.setSidenav = () => {
		// Load pins
		this.sidenavDOM.innerHTML = "";
		importComponent("sidenav").then( obj => {
			this.sidenavComponent = new obj();
			this.sidenavComponent.setParent(this);
			this.sidenavComponent.setTargetContainer(this.sidenavDOM);
			this.sidenavComponent.setItems(this.pins);
			this.sidenavComponent.loadHTML().then( _ => {
				this.sidenavComponent.render();
			});
		});
	}

	this.displaySelectSeatMode = () => {
		loading(true, "Preparando asientos");
		let floor = this.buildingDOM.querySelector("#floor-"+parseInt(this.user.floor));
		if( floor == undefined ){
			this.loadNextFloor(this.UP).then( () => {
				this.displaySelectSeatMode();
			});
			return;
		}
		const floorNumber = this.user.floor;
		this.floorDetails(floor, this.FLAT).then( () => {
			this.selectingSeat = true;
			this.setupSeatInfo();
			this.mapDOM.addEventListener("mouseover", this.hoverSeatSelection);
			loading(false);
			dialog("Haz click sobre tu puesto de trabajo para seleccionarlo.", "Selecci贸n de Asiento");
		});
	}

	this.hoverSeatSelection = evt => {
		let target = evt.target;
		let seatDOM = this.searchChairRecursive(target);
		let oldLabel = document.querySelector(".label-tag");
		let oldPositionPointer = document.querySelector(".position-pointer");
		if( oldLabel !== null ){
			oldLabel.remove()
		}
		if( oldPositionPointer !== null ){
			oldPositionPointer.remove()
		}
		if( seatDOM == null ) {
			if( this.focusedSeat !== null ){
				this.focusedSeat = null;
			}
			return;
		}
		this.focusedSeat = seatDOM;
		let isTaken = seatDOM.classList.contains("taken") || seatDOM.classList.contains("requested");		
		let seatNumber = seatDOM.id;
		if( this.selectingSeat ){
			let label = createDOM("div", "label-tag", document.body, "Asiento " + seatNumber);
			let labelWidth = label.getBoundingClientRect().width;
			let labelHeight = label.getBoundingClientRect().height;
			label.style.setProperty("--yposition", (((seatDOM.getBoundingClientRect().top + seatDOM.getBoundingClientRect().bottom) / 2 ) - (labelHeight + 20) )+"px");
			label.style.setProperty("--xposition", (((seatDOM.getBoundingClientRect().left + seatDOM.getBoundingClientRect().right) - labelWidth) /2 )+"px");
		}
		// Pulsating pointer
		let positionPointer = createDOM("div", {"className":"position-pointer", "id": seatNumber}, document.body);
		let positionPointerWidth = positionPointer.getBoundingClientRect().width;
		let positionPointerHeight = positionPointer.getBoundingClientRect().height;
		positionPointer.style.setProperty("--yposition", (((seatDOM.getBoundingClientRect().top + seatDOM.getBoundingClientRect().bottom) / 2) - positionPointerHeight/2 )+"px");
		positionPointer.style.setProperty("--xposition", (((seatDOM.getBoundingClientRect().left + seatDOM.getBoundingClientRect().right) / 2) - positionPointerWidth/2 )+"px");
		if( this.selectingSeat && !isTaken ){
			positionPointer.addEventListener("click", this.selectSeat);
		}
		
		if( isTaken ) {
			positionPointer.addEventListener("click", this.getSeatInfo);			
		}
		else{
			let employeeRequestPending = this.employeeList.filter(emp => emp.email == this.user.email && emp.pendiente != null);
			if(employeeRequestPending .length > 0){
			    positionPointer.addEventListener("click", this.requestPending);
			}
			else{				
			    positionPointer.addEventListener("click", this.selectSeat);
			}
		}
	}
	
	this.requestPending = evt => {	
		let seatDOM = this.focusedSeat;
		if( seatDOM == null ) {
			dialog("Debe seleccionar un asiento v醠ido", "Error de Asiento");
			return;
		}		
		let text = "Usted tiene una solicitud de traslado en curso, una vez finalizada podr&aacute; solicitar un nuevo sitio";
		let dialogBody = createDOM("div", null, null);
		let dialogText = createDOM("p", null, dialogBody, text);
		dialog(dialogBody, "Solicitud en curso").then(dialog => {
			let confirmEvent = {
				"trigger": "click",
				"callback": evt => {
					this.saveSeat(seatNumber);
					dialog.close();
				}
			}
			let dialogCancel = createDOM("button", {"className":"form-input__btn-orange","type": "button"}, dialogBody, "Cerrar", {"trigger":"click", "callback": () => { dialog.close()}});
		});
	}

	this.selectSeat = evt => {	
		debugger;    
		//if( this.selectingSeat == false ){
		//	return;
		//}
		let seatDOM = this.focusedSeat;
		if( seatDOM == null ) {
			dialog("Debe seleccionar un asiento v醠ido", "Error de Asiento");
			return;
		}
		let seatNumber = seatDOM.id;		
		let header = "Puesto Disponible";
		let text = "驴Deseas solicitar traslado a este puesto?";
		let baccept = "Solicitar";
		if(this.user.seatNumber == null){
			text = "驴Est&aacute seguro que este es su puesto?";
			header = "Confirmaci&oacuten";
			baccept = "Confirmar";
		}
		let dialogBody = createDOM("div", null, null);
		let dialogText = createDOM("p", null, dialogBody, text);
				
		dialog(dialogBody, header).then(dialog => {
			let confirmEvent = {
				"trigger": "click",
				"callback": evt => {					
					if(this.user.seatNumber != null){
						this.saveSeat(seatNumber);
					}else{
						this.createSeat(seatNumber);
					}
					dialog.close();
				}
			}
			let dialogConfirm = createDOM("button", {"className":"form-input__btn-submit","type": "button"}, dialogBody, baccept, confirmEvent);
			let dialogCancel = createDOM("button", {"className":"form-input__btn-orange","type": "button"}, dialogBody, "Cancelar", {"trigger":"click", "callback": () => { dialog.close()}});
		});
	}

	this.getSeatInfo = evt => {
		let target = evt.target.id;
		// Remove old pin if exists
		let currentPin = document.querySelector("#current-pin");
		this.sidenavComponent.toggleSeatDialog(null);
		if( currentPin !== null ){
			this.pins.map( (pin, i) => {
				if( pin.dom == currentPin ) {
					pin.dom.remove();
					delete(this.pins[i]);
					this.sidenavComponent.selectItem(null);
				}
			});
		}
		// Check if seat has employee
		let employee = this.employeeList.filter(emp => emp.seatNumber==target)[0];
		if( employee !== undefined ){
			let pin = this.setPositionPin(employee);
			pin.dom.addClass("animation-floating-pin__down");
			pin.dom.id = "current-pin";
			setTimeout( () => {
				// Clean screen from innecesary decorators
				let oldLabel = document.querySelector(".label-tag");
				let oldPositionPointer = document.querySelector(".position-pointer");
				if( oldLabel !== null ){
					oldLabel.remove()
				}
				if( oldPositionPointer !== null ){
					oldPositionPointer.remove()
				}
				this.sidenavComponent.showListItems().then( () => {
					this.sidenavComponent.selectItem(pin);
				});
			}, 1000);
		}
		else{
		    let text = "Este sitio tiene una solicitud pendiente asociada, ud. puede elegir otro sitio";
			let dialogBody = createDOM("div", null, null);
			let dialogText = createDOM("p", null, dialogBody, text);
			dialog(dialogBody, "Solicitud pendiente").then(dialog => {
				let confirmEvent = {
					"trigger": "click",
					"callback": evt => {
						this.saveSeat(seatNumber);
						dialog.close();
					}
				}
				let dialogCancel = createDOM("button", {"className":"form-input__btn-orange","type": "button"}, dialogBody, "Cerrar", {"trigger":"click", "callback": () => { dialog.close()}});
			});

		}
	}

	this.searchChairRecursive = (dom) => {
		if( dom == document.body ) {
			return null;
		}
		let regexp = this.chairsRegex
		if( regexp.test(dom.id) ) {
			return dom;
		}
		return this.searchChairRecursive(dom.parentNode);
	}
	
	this.createSeat = (seat) => {		
		loading(true, "Guardando posici贸n...");		
		let oldLabel = document.querySelector(".label-tag");
		let oldPositionPointer = document.querySelector(".position-pointer");
		if( oldLabel !== null ){
			oldLabel.remove()
		}
		if( oldPositionPointer !== null ){
			oldPositionPointer.remove()
		}
		this.focusedSeat = null;
		this.selectingSeat = false;
		this.mapDOM.removeEventListener("click", this.selectSeat);
		this.mapDOM.removeEventListener("mouseover", this.hoverSeatSelection);
		this.user.seatNumber = seat;
		this.user.finalseatNumber = "";				
		this.setPosition(this.user.getBody(""));		
		this.user.updateCreate("").then(response => {
			loading(false);
			dialog("Solicitud Exitosa","脡xito");
			this.employeeList.map( (user, index) => {
				if( this.user.email == user.email ) {
					this.employeeList[index] = this.user;
				}
		});	
		this.changePerspective(this.ISO).then( () => {
			this.setupSeatInfo();
			let pin = this.setPositionPin(this.user);
			setTimeout( () => {
				this.sidenavComponent.selectItem(pin);
			}, 1000);
		});
		}).catch(error => {
			dialog("<h5>No se pudo reservar el asiento. Por favor vuelva a intentarlo.</h5>", "Error");
		});		
	}

	this.saveSeat = (seat) => {		
		loading(true, "Guardando posici贸n...");		
		let oldLabel = document.querySelector(".label-tag");
		let oldPositionPointer = document.querySelector(".position-pointer");
		if( oldLabel !== null ){
			oldLabel.remove()
		}
		if( oldPositionPointer !== null ){
			oldPositionPointer.remove()
		}
		this.focusedSeat = null;
		this.selectingSeat = false;
		this.mapDOM.removeEventListener("click", this.selectSeat);
		this.mapDOM.removeEventListener("mouseover", this.hoverSeatSelection);
		this.user.finalseatNumber = seat;
		this.user.finalFloor = this.currentFloor.dataset.number;
		this.user.finalBuilding = this.state.buildingName.split(" ")[1];		
		if(this.state.buildingName == "Edificio Costanera"){
			this.user.pendiente = "COSTANERA" + "-" + this.currentFloor.dataset.number + "-" + seat;
		}
		if(this.state.buildingName == "Titanium"){
			this.user.pendiente = "TITANIUM" + "-" + this.currentFloor.dataset.number + "-" + seat;
		}
		if(this.state.buildingName == "Torre Entel"){
			this.user.pendiente = "CORPORATIVO" + "-" + this.currentFloor.dataset.number + "-" + seat;
		}		
		//this.setPosition(this.user.getBody());		
		this.user.updateCreate("Update").then(response => {
			loading(false);
			dialog("Solicitud Exitosa","脡xito");
			this.employeeList.map( (user, index) => {
				if( this.user.email == user.email ) {
					this.employeeList[index] = this.user;
				}
		});
		this.user.updateCreate("Create").then(response => {
			loading(false);
			dialog("Solicitud Exitosa","脡xito");
			this.employeeList.map( (user, index) => {
				if( this.user.email == user.email ) {
					this.employeeList[index] = this.user;
				}
			});			
		});
		/*this.changePerspective(this.ISO).then( () => {
			this.setupSeatInfo();
			let pin = this.setPositionPin(this.user);
			setTimeout( () => {
				this.sidenavComponent.selectItem(pin);
			}, 1000);
		});*/
		}).catch(error => {
			dialog("<h5>No se pudo generar su solicitud de traslado. Por favor vuelva a intentarlo.</h5>", "Error");
		});		
	}

	this.resetPerspectiveBtn = () => {
		this.currentPerspective = this.ISO;
		this.perspectiveBtn.dataset.view = this.FLAT;
		this.perspectiveBtn.addClass("checked");
	}

	this.changePerspective = (view, setPins) => {
		if( setPins == undefined || typeof setPins !== "boolean" ){
			setPins = true;
		}
		if( this.currentFloor == null ){
			return;
		}
		if( this.selectingSeat ){
			dialog("Debe seleccionar un asiento", "Error");
			return;
		}
		if( view instanceof Event ){
			let btn = view.target;
			view = btn.dataset.view;
		}
		if( setPins ){
			this.removePins();
		}
		this.currentFloor.style.removeProperty("--zpositioncurrent");
		this.currentFloor.style.removeProperty("--ypositioncurrent");
		let perspectivePromise = null;
		if( view == this.ISO ){
			perspectivePromise = this.setDomPerspective(this.currentFloor, this.detailsViewDeg[0], this.detailsViewDeg[1], this.detailsViewDeg[2], 1000);
		}
		if( view == this.FLAT ){
			this.perspectiveBtn.dataset.view = this.ISO;
			this.perspectiveBtn.removeClass("checked");
		} else {
			this.perspectiveBtn.dataset.view = this.FLAT;
			this.perspectiveBtn.addClass("checked");
		}
		this.currentPerspective = view;
		if( view == this.FLAT ){
			this.currentFloor.style.setProperty("--zpositioncurrent", "-100vmin");
			this.currentFloor.style.setProperty("--ypositioncurrent", "-2vmin");
			this.currentFloor.addClass("flat");
			perspectivePromise = this.setDomPerspective(this.currentFloor, "-70deg", "0deg", "45deg", 1000);
		} else {
			this.currentFloor.removeClass("flat");
		}
		return new Promise( (resolve, error) => {
			perspectivePromise.then( () => {
				if( setPins ){
					this.setPins(this.currentFloor).then( () => {
						resolve();
					});
				} else {
					resolve();
				}
			});
		});
	}

	this.showFlexibleDialog = () => {
		let flexibleSeats = createDOM("ul", "flexible-seats__list", null);
		this.flexibleSeatBtn.employees.forEach( emp => {
			const eventShowFlexibleSeat = {
				trigger: "click",
				callback: evt => {
					findParentByClass(evt.target, "dialog__container").close();
					let pin = this.setPositionPin(emp);
					this.sidenavComponent.selectItem(pin);
				}
			}
			createDOM("li", "flexible-seats__list-item", flexibleSeats, emp.name.toLowerCase(), eventShowFlexibleSeat);
		});
		dialog(flexibleSeats, "Puestos Flexibles");
	}
};
Building.prototype = new BaseComponent();
Building.prototype.constructor = Building;