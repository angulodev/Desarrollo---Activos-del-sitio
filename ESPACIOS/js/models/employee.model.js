const Employee = function(employee, building, floor) {
	
	// List name
	this.list = "Personal2";   //lista para actualizar en la misma lista	
	this.list_Traslado = "Solicitud_Traslado";
	this.fields = [
		"Title",
		"Edificio",
		"PISO",
		"PUESTO",
		"INTERNO",
		"NOMBRE_x0020_EMPRESA_x0020_EXTER",
		"Id",
		"GERENCIA",
		"VP",
		"Tribu",
		"C_x00e9_lula",
		"email",
		"celular",
		"CARGO",
		"Solicitud_Pendiente",       
	];		
	this.limit = "10";
	
	// Class Properties
	this.id = null;
	this.name = "";
	this.email = "";
	this.phone = "";
	this.building = "";
	this.floor = "";
	this.seatNumber = null;
	this.isInternal = false;
	this.company = "";
	this.extraInfo = {};
	this.company = "";
	this.pendiente = "";
	//---Request Fields------
    this.finalBuilding = "";
    this.finalFloor = "";
    this.finalseatNumber = "";
    this.siteManager = "";
    this.controller = "";

	// Constants
	this.LIST_URL = `${BASE_URL}${API_PATH}/web/lists/getbytitle('${this.list}')`;
	this.LIST_URL_TRASLADO = `${BASE_URL}${API_PATH}/web/lists/getbytitle('${this.list_Traslado}')`;
	this.OPERATORS = {
		"substringof": 1,
		"equals": 2
	}

	// Fields configs
	this.defaultConfigs = {
		"separator" : "or",
		"operator" : "substringof"
	}
	this.fieldsConfig = {
		"Title": {
			"separator" : "and"
		},
		"email": {
			"operator": "equals"
		},
		"Edificio": {
			"operator": "equals"
		},
		"PISO": {
			"operator": "equals"
		},
		"PUESTO": {
			"operator": "equals"
		}
	}

	this.abortController = new AbortController();

	this.buildQueryURL = (fields, value, inclusive, limitResults) => {
		if( !(fields instanceof Array) ) {
			throw new Error(`Invalid parameter: 'fields' => Expected an Array, but ${typeof fields} was given.`);
		}
		if( ( typeof value !== "string" ) && !( value instanceof Array ) ){
			throw new Error(`Invalid parameter: 'value' => Expected a String or an Array, but ${typeof value} was given.`);
		}
		if( typeof value === "string" && value.trim().length == 0 ){
			throw new Error(`Invalid parameter: 'value' => Cannot pass an empty String.`);
		}
		if( inclusive == undefined ){
			inclusive = true;
		}
		if( !(typeof inclusive === "boolean") ){
			throw new Error(`Invalid parameter: 'inclusive' => Expected a Boolean, but ${typeof inclusive} was given.`);
		}
		if( limitResults == undefined ){
			limitResults = true;
		}
		let globalSeparator = " and ";
		if( inclusive ){
			globalSeparator = " or ";
		}
		let queryArray = [];
		fields.forEach( (field, i) => {
			let localValue = value;
			if( value instanceof Array ){
				localValue = value[i];
			}
			queryArray.push(this.buildQuery(field, localValue));
		});
		let filter = "$FILTER="+queryArray.join(globalSeparator);
		let select = "$SELECT="+this.fields.join(",");
		let url = this.LIST_URL+"/Items?"+filter+"&"+select;
		let limit = "$TOP=";
		if( limitResults ){
			limit = limit+this.limit;
		} else {
			limit = limit+10000;
		}
		url = url+"&"+limit
		return url;
	}

	this.buildQuery = (field, value, operator, separator) => {
		let query = null;
		if( operator === undefined && separator === undefined ){
			if( this.fieldsConfig[field] !== undefined ){
				separator = this.fieldsConfig[field].separator;
				operator  = this.fieldsConfig[field].operator;
			} 
		}
		if( separator === undefined ) {
			separator = this.defaultConfigs.separator;
		}
		if( operator === undefined ) {
			operator  = this.defaultConfigs.operator;
		}
		switch( this.OPERATORS[operator] ) {
			case this.OPERATORS.substringof:
				if( separator == "and" ){
					let filters = [];
					value.split(" ").forEach(word => {
						filters.push(`substringof('${word}', ${field})`);
					});
					query = "(" + filters.join(" and ") + ")";
				} else {
					query = `substringof('${value}', ${field})`;
				}
				break;
			case this.OPERATORS.equals:
				query = `(${field} eq '${value}')`
				break;
		}
		return query;
	}

	this.find = id => {
		return new Promise( (resolve, error) => {
			let url = `${BASE_URL}${API_PATH}/Web/GetUserById(${this.id})`;
			loading(true, "Buscando usuario");
			fetch(url, getDefaultFetchConfigs()).then( response => {
				return response.json();
			}).then( json => {
				if( json.d.Email == null || json.d.Email.trim() == "" ){
					error(new Error("Invalid user"));
				}
				loading(true, "Obteniendo datos del usuario");
				return fetch(this.buildQueryURL(["email"],json.d.Email), getDefaultFetchConfigs());
			}).then( response => {
				return response.json();
			}).then( userData => {
				try {
					new Employee(userData.d.results[0]).then(employeeObject => {
						resolve(employeeObject);
					});
				} catch(err) {
					error(err);
				}
			}).catch(err => {
				throw new Error(err);
			});
		});
	}

	this.updateCreate = (actionType) => {
		return new Promise( (resolve, error) => {
			if( this.id == null || this.id.length == 0 ) {
				console.trace();
				throw new Error("ID is undefined");
			}
			if(actionType == ""){
				let endpoint = `/GetByTitle('${this.list}')/items(${this.id})`;
				let body = JSON.stringify(this.getBody(actionType));
				let data = {
					"body": body
				}
				callAPI(endpoint,"PUT",data,actionType).then(response => {
					if( !response.ok ){
						error("unable to save");
					}
					if( response.status >= 200 && response.status < 400 ) {
						resolve(this);
					} else {
						error("unable to save");
					}
				});
			}
			if(actionType == "Update"){
				let endpoint = `/GetByTitle('${this.list}')/items(${this.id})`;
				let body = JSON.stringify(this.getBody(actionType));
				let data = {
					"body": body
				}
				callAPI(endpoint,"PUT",data,actionType).then(response => {
					if( !response.ok ){
						error("unable to save");
					}
					if( response.status >= 200 && response.status < 400 ) {
						resolve(this);
					} else {
						error("unable to save");
					}
				});
			}
			if(actionType == "Create"){
			   let endpoint = `GetByTitle('${this.list_Traslado}')/items`;
			   let body = JSON.stringify(this.getBody(actionType));
			   let data = {
				   "body": body
			   }
			   callAPI(endpoint,"PUT",data,actionType).then(response => {
				   if( !response.ok ){
					   error("unable to create request");
				   }
				   if( response.status >= 200 && response.status < 400 ) {
					   resolve(this);
				   } else {
					   error("unable to create request");
				   }
			   });
			}
		});
	}
		
	this.getBody = (actionType) => {
		if(actionType == ""){		
			return Object.assign(this.extraInfo, {
			    "__metadata":{"type":"SP.Data.Personal2ListItem"},	
				"Id": this.id,
				"Title": this.name,
				"email": this.email,
				"celular": this.phone,
				"Edificio": this.building,  
				"PISO": this.floor,
				"PUESTO": this.seatNumber,
				"INTERNO": (this.isInternal ? "si" : "no"),
				"NOMBRE_x0020_EMPRESA_x0020_EXTER": this.company,
				"Solicitud_Pendiente": this.pendiente
			});
		}
		if(actionType == "Update"){		
			return Object.assign(/*this.extraInfo,*/{
			    "__metadata":{"type":"SP.Data.Personal2ListItem"},	
				"Id": this.id,
				"Title": this.name,
				"email": this.email,
				"celular": this.phone,
				"Edificio": this.building,  
				"PISO": this.floor,
				"PUESTO": this.seatNumber,
				"INTERNO": (this.isInternal ? "si" : "no"),
				"NOMBRE_x0020_EMPRESA_x0020_EXTER": this.company,
				"Solicitud_Pendiente": this.pendiente
			});
		}
		if(actionType == "Create"){
			return Object.assign(/*this.extraInfo,*/ {
			    "__metadata":{"type":"SP.Data.Solicitud_x005f_TrasladoListItem"},		
				"Title": this.name,
				"Email_Solicitante": this.email,
				"Edificio_Origen": this.building.toUpperCase(),
				"Piso_Origen": this.floor,
				"Puesto_Origen": this.seatNumber,
				"Edificio_Destino": this.finalBuilding.toUpperCase(),
				"Piso_Destino": this.finalFloor,
				"Puesto_Destino": this.finalseatNumber,
				//"Site_Manager": this.siteManager,
				//"Controller": this.controller,
				"Estado": "Aprobacion Controller"
			});
		}
	}

	this.findByPosition = () => {
		return new Promise( (resolve, error) => {
			fetch(
				this.buildQueryURL(["Edificio", "PISO", "PUESTO"], [this.building, this.floor, this.seatNumber], false),
				getDefaultFetchConfigs()
			).then( response => {
				return response.json();
			}).then( json => {
				if( json.d.results.length > 0 ) {
					new Employee(json.d.results[0]).then( employeeObject => {
						resolve(employeeObject);
					});
				} else {
					resolve(null);
				}
			});
		});
	}

	this.findByBuilding = building => {
		return new Promise( (resolve, error) => {
			fetch(
				this.buildQueryURL(["Edificio"], [building], false, false),
				getDefaultFetchConfigs()
			).then( response => {
				return response.json();
			}).then( json => {
				let totalResults = json.d.results.length;
				let employeeList = [];
				let counter = 0;
				if( totalResults > 0 ) {
					json.d.results.forEach( employeeData => {
						new Employee(employeeData).then( employeeObject => {
							employeeList.push(employeeObject);
							counter++;
							if( counter == totalResults ){
								resolve(employeeList);
							}
						});
					});
				} else {
					resolve(null);
				}
			});
		});
	}

	this.search = query => {
		//this.abortSearch();
		let queryArray = [];
		let buildingsArray = [];
		["Title", "email"].forEach( field => {
			queryArray.push(this.buildQuery(field, query));
		});
		buildingsArray.push(this.buildQuery("Edificio", "COSTANERA"));
		buildingsArray.push(this.buildQuery("Edificio", "TITANIUM"));
		buildingsArray.push(this.buildQuery("Edificio", "CORPORATIVO"));
		let filter = "$FILTER=(";
		filter = filter + buildingsArray.join(" or ");
		filter = filter + ") and (";
		filter = filter + queryArray.join(" or ");
		filter = filter + ")"
		let select = "$SELECT= "+this.fields.join(",");
		let url = this.LIST_URL+"/Items?"+filter+"&"+select;
		let limit = "$TOP=10";
		url = url+"&"+limit
		return new Promise( (resolve, error) => {
			fetch(url, getDefaultFetchConfigs({signal: this.abortController.signal})).then( response => {
				return response.json();
			}).then( json => {
				let resultSet = [];
				if( (json.d.results !== undefined) && (json.d.results instanceof Array) ) {
					json.d.results.forEach( (employee, i) => {
						new Employee(employee).then( obj => {
							resultSet.push(obj);
							if( (i + 1) == json.d.results.length ){
								resolve(resultSet);
							}
						})
					});
				} else {
					error("No results were found");
				}
			});
		});
	}

	this.abortSearch = () => {
		this.abortController.abort();
		this.abortController = new AbortController();
	}

	if( employee !== undefined ){
		return new Promise( (resolve, error) => {
			if( !isNaN(employee) ){
				// Search By ID
				if( building === undefined && floor === undefined ){
					this.id = employee;
					this.find(this.id).then( employeeObject => {
						resolve(employeeObject);
					});
				}
				// Search by position
				if( building !== undefined && floor !== undefined ){
					this.seatNumber = employee;
					this.building = building;
					this.floor = floor;
					this.findByPosition().then( userObject => {
						resolve(userObject);
					});
				}
			}
			else if( employee instanceof Object ){
				this.id = employee.Id;
				this.name = employee.Title;
				this.email = employee.email;
				this.phone = employee.celular;
				this.building = employee.Edificio;
				this.floor = employee.PISO;
				this.seatNumber = employee.PUESTO;
				this.isInternal = String(employee.INTERNO).toLowerCase() == "no" ? false : true;
				this.company = employee.NOMBRE_x0020_EMPRESA_x0020_EXTER;
				this.extraInfo = employee;
				this.pendiente = employee.Solicitud_Pendiente;				

				resolve(this);
			} else {
				resolve(this);
			}
		});
	} else {
		return new Promise( resolve => {
			resolve(this);
		});
	}
}