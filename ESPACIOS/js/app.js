// Global Variables
const buildings = {
	"corporativo" : {
		id:"corporativo",
		name: "Torre Entel",
		floors: [3,4,5,6,7,8,9,10,11,12,13,14,15,16,17],
		view: ["-10deg", null, "70deg"]
		//view: ["-20deg", null, "20deg"]
	},
	"torrec": {
		id:"torrec",
		name: "Titanium",
		floors: [3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
		view: ["-10deg", null, "70deg"]
	},
	"costanera": {
		id:"costanera",
		name: "Edificio Costanera",
		floors: [12,13,14,15],
		view: ["-10deg", null, "70deg"]
		//view: ["-20deg", null, "20deg"]
	},
};

const App = function(container) {
	this.container = container;
	this.childrenComponents = {};
	this.user = null;
	this.dialog = null;
	this.builingIdMap = {
		"CORPORATIVO" : {
			"id" : "corporativo",
			"title": "Torre Entel"
		},
		"COSTANERA" : {
			"id" : "costanera",
			"title": "Costanera"
		},
		"TITANIUM" : {
			"id" : "torrec",
			"title": "Torre Titanium"
		}
	}
	// Load building Map
	this.loadBuilding = (buildingName, searchResult) => {
		loading(false);
		window.location.hash = buildingName;
		let building = this.getComponent(buildingName);
		if( building == null ){
			importComponent("building").then(obj=>{
				building = new obj();
				building.setParent(this);
				building.setTargetContainer(this.container);
				if( searchResult !== undefined ){
					building.setSearchResult(searchResult);
				}
				building.loadHTML().then(_=>{
					building.setBuilding(buildings[buildingName]);
					building.render();
				});
			});
		} else {
			building.render();
		}
	}
	// Load Landing Page
	this.loadLanding = () => {
		this.checkUser().then( () => {
			loading(false);
			let landing = this.getComponent("landing");
			if( landing == null ) {
				importComponent("landing").then(obj=>{
					landing = new obj();
					this.childrenComponents.landing = landing;
					landing.setParent(this);
					landing.setTargetContainer(this.container);
					landing.loadHTML().then(_=>{
						landing.render();
					});
				});
			} else {
				landing.render();
			}
		});
	}
	this.getComponent = (name) => {
		if( this.childrenComponents[name] !== undefined ) {
			return this.childrenComponents[name]
		}
		return null;
	}
	this.getCurrentUser = () => {
		return new Promise( (resolve, error) => {
			loading(true, "Revisando Sesión");
			fetch(`${BASE_URL}${API_PATH}/web/CurrentUser?$select=Id`, getDefaultFetchConfigs({})).then(response => {
				return response.json();
			}).then(data => {
				let userId = data.d.Id;
				try	{
					importModel("Employee").then( model => {
						new model(userId).then( user => {
							this.user = user;
							resolve();
						});
					});
				} catch( ex ) {
					throw new Error(ex);
				}
			}).catch(e => {
				error(e);
			}).finally( _=> {
				loading(false);
			});
		});
	}

	this.seatWizard = () => {
		if( this.dialog != null ){
			return;
		}
		let dialogTitle = "Ingreso de Puesto";
		let dialogText = "\
		Hola <span class=''>" + this.user.name + "</span>, <br/>\
		<br/>\
		Ayudanos a identificar tu ubicación:\
		";
		let buildingSelectOptions = [];
		Object.keys(this.builingIdMap).forEach(key => {
			let option = {
				"text"  : this.builingIdMap[key].title,
				"value" : key
			}
			if( key == this.user.building ) {
				option.selected = true;
			}
			buildingSelectOptions.push(option);
		});
		let dialogFormBuildingInput = createInput("select", {"name" : "building", "value": this.user.building,"disabled": true}, "Seleccione Edificio", buildingSelectOptions);
		let dialogFormFloorInput    = createInput("text", {"name" : "floor", "value": this.user.floor, "disabled": true}, "Seleccione Piso");
		let dialogFormFloatingCheck = createInput("checkbox", {"name" : "floating", "value": this.user.floor}, "Tengo puesto flexible");
		let btnGroup                = createDOM("div", "form-input__btn-group", null);
		let clickEventSubmit = {
			trigger: "click",
			callback: evt => {
				evt.preventDefault();
				if( this.validateBuildingAndFloor(dialogFormBuildingInput.input.value, dialogFormFloorInput.input.value) ) {
					this.dialog.close().then( () => {
						if( dialogFormFloatingCheck.input.checked ) {
							loading(true, "Guardando datos...");
							this.user.seatNumber = "F";
							this.user.updateCreate("").then( () => {
								loading(false);
								let building = this.builingIdMap[String(this.user.building)];
								this.loadBuilding(building.id, this.user);
							});
						} else {
							let building = this.builingIdMap[String(this.user.building)];
							//this.user.finalseatNumber = "NF";
							this.loadBuilding(building.id, this.user);
						}
						this.dialog = null;
					});
				}
			}
		}
		let dialogFormSubmit = createDOM("button", "form-input__btn-submit", btnGroup, "Confirmar", clickEventSubmit);
		let clickEventChange = {
			trigger: "click",
			callback: evt => {
				evt.preventDefault();
				dialogFormBuildingInput.toggleInput();
				dialogFormFloorInput.toggleInput();
			}
		}
		let dialogFormChange = createDOM("button", "form-input__btn-orange", btnGroup, "Cambiar", clickEventChange);
		let dialogBody = [
			createDOM("p", null, null, dialogText),
			createDOM("form", {"className":"dialog__form", "id":"seatform"}, null, [dialogFormBuildingInput, dialogFormFloorInput, dialogFormFloatingCheck, btnGroup])
		];
		dialog(dialogBody, dialogTitle, false).then( dialog => {
			this.dialog = dialog;
		});
	}

	this.validateBuildingAndFloor = (building, floor) => {
		const selectedBuilding = this.builingIdMap[building];
		if( selectedBuilding == undefined ) {
			alert("Edificio invalido!");
			return false;
		}
		const buildingData = buildings[selectedBuilding.id];
		if( buildingData.floors.indexOf(parseInt(floor)) < 0 ){
			alert("Piso invalido!");
			return false;
		}
		this.user.building = building;
		this.user.floor = floor;
		return true;
	}

	this.checkUser = () => {
		return new Promise( (resolve,error) => {
			if( this.user !== null ) {
				if( this.user.seatNumber == null ) {
					this.seatWizard();
				}
				resolve();
				return;
			}
			this.getCurrentUser().then( () => {
				if( this.user.seatNumber == null ) {
					this.seatWizard();
				}
				resolve();
			}).catch(e => {
				importComponent("error").then(obj=>{
					error = new obj();
					this.childrenComponents.error = error;
					error.setParent(this);
					error.setTargetContainer(this.container);
					error.loadHTML().then(_=>{
						error.render();
					});
				});
				error("Error", e);
			});	
		});
	}

	this.myLocation = () => {
		let building = this.builingIdMap[String(this.user.building)];
		this.loadBuilding(building.id, this.user);
	}
	
	this.newWindow = (nombre, email, edificio, piso, puesto) => {				
		let building = this.builingIdMap[String(edificio)];
		var params = ['height='+screen.height,'width='+screen.width,'fullscreen=yes' // only works in IE, but here for completeness
		].join(',');
		var win = window.open("https://grupoentel.sharepoint.com/sites/SpacePlannig/Paginas/default.aspx#"+building.id, 'Ubicaci�n',"height=900,width=1200");
  		localStorage.setItem("Nombre", nombre);
		localStorage.setItem("Email", email);
		localStorage.setItem("Edificio", edificio);
		localStorage.setItem("Piso", piso);
		localStorage.setItem("Puesto", puesto);
  		win.focus();
	}
	
	this.myLocationSimulated = (nombre, email, edificio, piso, puesto) => {				
		let building = this.builingIdMap[String(edificio)];
		this.user.extraInfo.Title = nombre;
		this.user.extraInfo.email = email;
		this.user.extraInfo.edificio = edificio;
		this.user.extraInfo.PISO = piso;
		this.user.extraInfo.PUESTO = puesto;
		
		this.user.building = edificio;
		this.user.floor = piso;
		this.user.seatNumber = puesto;
		
		localStorage.setItem("Nombre", "");
		localStorage.setItem("Email", "");
		localStorage.setItem("Edificio", "");
		localStorage.setItem("Piso", "");
		localStorage.setItem("Puesto", "");		
		
		this.loadBuilding(building.id, this.user);
	}
	
	// Initializer
	this.init = () => {		
		this.checkUser().then( () => {
			// get Hash and load if necesary
			let hash = window.location.hash.substr(1);						
			if( hash !== "" ) {
				if(localStorage.getItem("Nombre") != ""){				    
					var nombre = localStorage.getItem("Nombre");
					var email = localStorage.getItem("Email", email);
					var edificio = localStorage.getItem("Edificio", edificio);
					var piso = localStorage.getItem("Piso", piso);
					var puesto = localStorage.getItem("Puesto", puesto);					
					this.myLocationSimulated(nombre, email, edificio, piso, puesto);
				}
				else{
					this.loadBuilding(hash);
					return;
				}
			}
			// Load Landing to foreground
			this.loadLanding();
		}).catch(err => {
			console.trace();
			console.log(err);
		});
	}
	/*
	window.onhashchange = () => {
		let hash = window.location.hash.substr(1);
		if( hash !== "" ) {
			this.loadBuilding(hash);
		} else {
			this.loadLanding();
		}
	}
	//*/
	
}