/*
* Categorías (acordeon).
* 	- Sala Reuniones
* 	- Espacio Comunes
* 	- Baños
* 	- Cafeteria
* */
/*
* Pin Controller
* */
Sidenav = function() {
	this.templateName = "sidenav";
	this.state = {};
	this.items = [];
	this.activeItem = null;

	this.categories = {
		"external_seat" : {
			"title"    : "Ubicación (Externo)",
			"items"    : null,
			"collapsed": false,
			"visible"  : false,
			"showList" : false,
			"type"     : "position"
		},
		"internal_seat" : {
			"title"    : "Ubicación",
			"items"    : null,
			"collapsed": false,
			"visible"  : false,
			"showList" : false,
			"type"     : "position"
		},
		"elevator" : {
			"title"    : "Ascensores",
			"items"    : null,
			"collapsed": true,
			"visible"  : false,
			"showList" : true,
			"type"     : "checkbox"
		},
		"reception" : {
			"title"    : "Recepción",
			"items"    : null,
			"collapsed": true,
			"visible"  : false,
			"showList" : true,
			"type"     : "checkbox"
		},
		"wc" : {
			"title"    : "Baños",
			"items"    : null,
			"collapsed": true,
			"visible"  : false,
			"showList" : true,
			"type"     : "checkbox"
		},
		"salas" : {
			"title"    : "Salas de Reunión",
			"items"    : null,
			"collapsed": true,
			"visible"  : true,
			"showList" : true,
			"type"     : "dropdown"
		},
		"common" : {
			"title"    : "Espacios Comunes",
			"items"    : null,
			"collapsed": true,
			"visible"  : true,
			"showList" : true,
			"type"     : "dropdown"
		},
	}
	BaseComponent.call(this);

	this.setEvents = () => {
		this.parent.componentDOM.removeEventListener("click", this.hideAll);
		this.parent.componentDOM.addEventListener("click", this.hideAll);
		this.parent.container.addEventListener("click", this.closeCategories);
	}

	this.closeCategories = evt => {
		let target = evt.target;
		if( target instanceof Element && target.hasClass("list-item--title") ){
			return;
		}
		Object.keys(this.categories).forEach(catId => {
			this.categories[catId].collapsed = false;
			this.collapseCategory(catId);
		});
	}

	this.hideAll = evt => {
		if( evt instanceof Event ){
			let target = evt.target;
			if( target.hasClass("floating-pin") || target.hasClass("list-item") ){
				return;
			}
		}
		//this.toggleSeatDialog(null);
		this.selectItem(null);
	}

	this.hasLoaded = () => {
		this.listDOM = document.querySelector("#sidenav-map-pins");
		this.showListItems();
	}

	this.selectItem = selectedItem => {
		// Clean-Up
		let shouldReset = true;
		if( this.activeItem != null ){
			if( this.activeItem.dom.hasClass("active") ) {
				this.activeItem.dom.removeClass("active");
			} else {
				this.activeItem.dom.addClass("active");
			}
		}
		if( shouldReset ){
			if( this.activeItem !== null ){
				this.activeItem.dom.removeClass("floating-pin--active");
			}
			this.toggleListItem();
			this.toggleSeatDialog(null);
			this.parent.mapDOM.removeClass("pin-selected");
		} else {
			return;
		}
		// Set Pin
		if( selectedItem !== null && selectedItem != this.activeItem ){
			let category = this.categories[selectedItem.cat];
			if( category.type == "dropdown" ){
				if( category.visible == false ){
					if( selectedItem.dom.hasClass("active") ) {
						selectedItem.dom.removeClass("active");
					} else {
						selectedItem.dom.addClass("active");
					}
				}
			}
			if( category.type == "position" ) {
				if( selectedItem.dom.hasClass("active") ) {
					selectedItem.dom.removeClass("active");
				} else {
					selectedItem.dom.addClass("active");
				}
			}
			this.parent.mapDOM.addClass("pin-selected");
			selectedItem.dom.addClass("floating-pin--active");
			if( selectedItem.cat == "internal_seat" || selectedItem.cat == "external_seat" ) {
				let position = {
					top: selectedItem.dom.getBoundingClientRect().top,
					left: selectedItem.dom.getBoundingClientRect().left
				}
				this.toggleSeatDialog(selectedItem);
			}
			this.activeItem = selectedItem;
			this.toggleListItem();
			return;
		}
		this.activeItem = null;
	}

	this.toggleListItem = () => {
		if( this.activeItem == null ){
			return;
		}
		if( this.activeItem.listItem == null ){
			return;
		}
		let setListItem = this.container.querySelector("#sidenav-map-pins .list-item.active") == null;
		if( setListItem ){
			this.activeItem.listItem.addClass("active");
		} else {
			this.activeItem.listItem.removeClass("active");
		}
	}

	this.showListItems = () => {
		return new Promise( (resolve, error) => {
			if( this.listDOM !== null ) {
				this.listDOM.innerHTML = "";
			}
			Object.keys(this.categories).forEach(categoryId => {
				this.createCategoryList(categoryId);
			});
			resolve();
		});
	}

	this.createCategoryList = (categoryId) => {
		let category = this.categories[categoryId];
		category.items = this.items.filter(item => item.cat==categoryId);
		if( category.items.length == 0 ) {
			return;
		}
		// pins that are shown as a dropdown menu
		if( category.type == "dropdown" ) {
			let categoryTitle = this.createListItem(category.title, this.collapseCategory, "list-item--title list-item--dropdown list-item--"+categoryId, categoryId);
			categoryTitle.id = categoryId;
			if( !category.showList ) {
				categoryTitle.addClass("hidden");
			}
			let list = createDOM("ul", {"className":"category-list"}, categoryTitle);
			category.items.forEach(item => {
				if( item.initialized ){
					list.appendChild(item.listItem);
					return;
				}
				item.initialized = true;

				if( category.visible != true ) {
					item.dom.addClass("not-visible");
				} else {
					item.dom.addClass("animation-floating-pin__down");
				}
				item.dom.addEventListener("click", () => {
					this.selectItem(item);
				});
				let listItem = this.createListItem(item.title, () => {
					this.selectItem(item);
				});
				if( category.collapsed ) {
					listItem.addClass("hidden");
				}
				item.listItem = listItem;
				list.appendChild(listItem);
			});
			this.listDOM.appendChild(categoryTitle);
		}
		// pins that are shown as a checkbox on the menu
		if( category.type == "checkbox" ) {
			let categoryCheckbox = this.createListItem(category.title, this.toggleCategoryPins, "list-item--title list-item--checkbox list-item--"+categoryId, categoryId);
			categoryCheckbox.id = categoryId;
			if( category.visible ){
				categoryCheckbox.addClass("checked");
			}
			category.items.forEach( item => {
				item.dom.addClass("not-visible");
				if( category.visible ){
					item.dom.addClass("active");
				}
				item.dom.addEventListener("click", () => {
					this.selectItem(item);
				});
				if( item.dom.hasClass("active") ) {
					categoryCheckbox.addClass("checked");
				}
			});
			this.listDOM.appendChild(categoryCheckbox);
		}
		// pins that activate clicking on screen
		if( category.type == "position" ) {
			let categoryPosition = this.createListItem(category.title, null, "list-item--title hidden list-item--"+categoryId, categoryId);
			categoryPosition.id = categoryId;
			category.items.forEach( item => {
				item.dom.addClass("not-visible");
				if( category.visible ){
					item.dom.addClass("active");
				}
				item.dom.addEventListener("click", () => {
					this.selectItem(item);
				});
			});
			this.listDOM.appendChild(categoryPosition);
		}
	}

	this.collapseCategory = catId => {
		if( catId instanceof Event ){
			let targetGroup = catId.target;
			catId = targetGroup.id;
		}
		let category = this.categories[catId];
		if( category == undefined ){
			return;
		}
		category.items.forEach(item => {
			if( category.type == "dropdown" ) {
				if( category.collapsed ) {
					item.listItem.removeClass("hidden");
				} else {
					item.listItem.addClass("hidden");
				}
			}
		});
		category.collapsed = !category.collapsed;
	}

	this.toggleCategoryPins = catId => {
		if( catId instanceof Event ){
			let targetGroup = catId.target;
			catId = targetGroup.id;
			if( targetGroup.hasClass("checked") ) {
				targetGroup.removeClass("checked");
			} else {
				targetGroup.addClass("checked");
			}
		}
		let category = this.categories[catId];
		if( category == undefined ){
			return;
		}
		let checked = false;
		category.items.forEach(item => {
			if( item.dom.hasClass("active") ){
				item.dom.removeClass("active");
			} else {
				item.dom.addClass("active");
			}
		});
		category.collapsed = !category.collapsed;
	}

	this.createListItem = (text, event, className, catId) => {
		//let listItem = document.createElement("li");
		//listItem.addClass("list-item");
		let classes = ["list-item"];
		if( className != undefined ) {
			classes = classes.concat(className.split(" "));
		}
		let listItem = createDOM("li", {
			className: classes
		}, null, text);
		//*
		if( listItem.hasClass("list-item--title") ){
			let pinSVG = createDOM("div", {"className":["list-item__pin", "floating-pin--"+catId]}, listItem, document.querySelector("#pin-"+catId).innerHTML+"</div>");
		}
		//*/
		if( typeof event == "function" ) {
			listItem.removeEventListener("click", event);
			listItem.addEventListener("click", event);
		}
		return listItem;
	}

	this.showDetails = () => {
		//console.log(this.activeItem);
	}

	this.setItems = items => {
		this.items = items;
	}

	this.appendItem = item => {
		this.items.push(item);
		this.showListItems();
	}

	this.toggleSeatDialog = (item) => {
		let dialog = document.querySelector(".popup-tile");
		if(  dialog != undefined ){
			document.querySelector(".popup-tile").remove();
			return;
		}
		if( item == null ){
			return;
		}
		let position = {
			top: item.dom.getBoundingClientRect().top,
			left: item.dom.getBoundingClientRect().left
		}
		dialog = createDOM("div", "popup-tile", document.querySelector("#building-component")); // dialog
		// Header
		let header = createDOM("div", "header", dialog);
		createDOM("img", {
			"src":`${BASE_URL}${WEB_PATH}/image/no-photo.png`,
			"className": ["profile-photo","rounded-circle"]
		}, header);
		// Body
		let body 	= createDOM("div","body",dialog);
		createDOM("h2","title",body, item.info.Title.toLowerCase());
		let callBtn = null;
		if( item.info.celular != null ){
			callBtn = createDOM("a", {
				"className": "call-btn",
				"href" : "tel:" + item.info.celular
			}, body);
		} else {
			callBtn = createDOM("a", {
				"className": "call-btn",
				"href": "javascript:void(0);",
				"disabled": true
			}, body);
		}
		createDOM("i",{"className": ["fas", "fa-phone-alt"]}, callBtn);
		// External Seat Indicator
		if( item.info.INTERNO != null && item.info.INTERNO.toLowerCase() == "no" ){
			let externalBadge = createDOM("div", "external-badge", body);
			createDOM("h5",null,externalBadge,"EXTERNO");
			createDOM("p",null,externalBadge,item.info.NOMBRE_x0020_EMPRESA_x0020_EXTER);
			body.addClass("external");
		}
		// Job Title
		createDOM("p","job-description", body, item.info.CARGO);
		// Dialog Details
		let details = createDOM("p", "details", body);
		createDOM("span", "phone", details, (item.info.celular == null ? 
			"sin teléfono" : 
			item.info.celular)
		);
		createDOM("span", "email", details, (item.info.email   == null ? 
			"sin correo"   : 
			"<a href='mailto:"+item.info.email+"'>"+item.info.email+"</a>")
		);
		// Floating Seat
		if( item.info.PUESTO.toUpperCase() == "F" ){
			createDOM("p", "floating-seat", body, "Puesto Flexible");
		}
		// Setup Dialog Position on screen
		let dialogRect = dialog.getBoundingClientRect();
		if( (position.top - dialogRect.height - 14) < 0 ) {
			dialog.addClass("down-direction");
			dialog.style.setProperty("top", (position.top + 64) +"px");
		} else {
			dialog.style.setProperty("top", (position.top - dialogRect.height - 14) +"px");
		}
		dialog.style.setProperty("left", (position.left - 120)+"px");
	}
};
Sidenav.prototype = new BaseComponent();
Sidenav.prototype.constructor = Sidenav;