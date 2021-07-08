Error = function() {
	this.templateName = "error";
	this.state = {}
	BaseComponent.call(this);
	this.hasLoaded = () => {
	
	}
	this.setEvents = () => {
	
	}
};
Error.prototype = new BaseComponent();
Error.prototype.constructor = Error;