Landing = function() {
	this.templateName = "landing";
	this.state = {
		path: BASE_URL+WEB_PATH
	}
	this.abortController = new AbortController();
	this.searchComponent = null;
	BaseComponent.call(this);

	this.hasLoaded = () => {
		this.searchContainer = document.querySelector("#search-landing")
		// Import Search Component
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

	this.setEvents = () => {
		// Select Building
		this.buildingLinks = document.querySelectorAll("a.building");
		this.buildingLinks.forEach(link=> {
			link.addEventListener("click", this.showBuildingMap);
		});
	}

	this.showBuildingMap = evt => {
		evt.preventDefault();
		// Get building value
		let building = evt.target.dataset.building;
		// Call parent method
		this.parent.loadBuilding(building);
	}
};
Landing.prototype = new BaseComponent();
Landing.prototype.constructor = Landing;