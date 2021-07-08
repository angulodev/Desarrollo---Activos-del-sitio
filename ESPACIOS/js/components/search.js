Search = function() {
	this.templateName = "search";
	this.state = {};
	this.resultSet = [];
	
	// DOM Elements
	this.autocompleteList = null;
	this.searchInput      = null;
	this.listElement      = null;

	BaseComponent.call(this);
	this.hasLoaded = () => {
		this.autocompleteList = this.container.querySelector("#autocomplete-list");
		this.listElement      = this.autocompleteList.querySelector(".list");
		// Import employee model
		importModel("Employee").then( model => {
			(new model()).then( modelObject => {
				this.employeeModel = modelObject;				
				if(this.searchInput != null){
					this.searchInput.removeAttribute("disabled");
				}
			});
		});
	}
	this.setEvents = () => {		
		this.searchInput = document.getElementById("search-input");
		if( this.searchInput != null ) {
			this.searchInput.addEventListener("keyup", this.search);
			this.searchInput.addEventListener("click", this.showAutocomplete);
			this.searchInput.setAttribute("disabled", true);
			this.searchInputControl = this.searchInput.querySelector("input");
			this.searchInputControl.addEventListener("focus", this.toggleInput);
			this.searchInputControl.addEventListener("blur", this.toggleInput);
		}
	}
	this.search = evt => {
		let text = "";
		if( evt instanceof Event ) {
			text = evt.target.value;
			if( evt.type == "keyup" ){
				evt.preventDefault();
				if( evt.keyCode == 8 ) {
					this.listElement.innerHTML = "";
					if( text.length == 0 ){
						this.autocompleteList.addClass("empty");
					}
				}
			}
		} else {
			text = this.searchInput.value;
		}
		this.autocompleteList.removeClass("hidden");
		this.employeeModel.abortSearch();
		if( text.length < 3 ){
			this.autocompleteList.addClass("hidden");
			return;
		}
		// Will show results
		this.resultSet = [];
		this.autocompleteList.addClass("loading");
		this.employeeModel.search(text).then( searchResults => {
			this.setResults(searchResults);
			this.autocompleteList.removeClass("loading");
		}).catch(err => {
			console.warn(err);
			this.autocompleteList.removeClass("loading");
		});
	}

	this.setResults = resultSet => {
		this.resultSet = resultSet;
		if( this.resultSet.length > 0 ){
			this.autocompleteList.removeClass("empty");
			this.showAutocomplete();
			return;
		}
		this.autocompleteList.addClass("empty");
		this.hideAutocomplete();
	}

	this.showAutocomplete = () => {
		this.listElement.innerHTML = "";
		this.resultSet.forEach(result => {
			let listItem = document.createElement("li");
			listItem.addClass("list-item");
			let building = this.parent.parent.builingIdMap.hasOwnProperty(result.building) ? this.parent.parent.builingIdMap[result.building].title : "";
			listItem.innerHTML = result.name.toLowerCase();
			listItem.dataset.building = building;
			listItem.addEventListener("click", () => {
				this.setPin(result);
			});
			this.listElement.appendChild(listItem);
		});
	}

	this.hideAutocomplete = evt => {
		if( evt !== undefined && evt instanceof Event ) {
			if( evt.target.id == "autocomplete-input" || findParentByClass(evt.target, "autocomplete") ) {
				return;
			}
		}
		if( this.autocompleteList !== undefined && this.autocompleteList !== null ){
			this.autocompleteList.addClass("hidden");
		}
	}

	this.setPin = result => {
		let building = this.parent.parent.builingIdMap[String(result.building)];
		if( result.seatNumber == null || building == undefined ){
			alert("No hay posición para la persona seleccionada");
			return;
		}
		this.parent.parent.loadBuilding(building.id, result);
	}

	this.toggleInput = evt => {
		if( this.container.hasClass("focused") ) {
			this.container.removeClass("focused")
		} else {
			this.container.addClass("focused")
		}
	}
};
Search.prototype = new BaseComponent();
Search.prototype.constructor = Search;