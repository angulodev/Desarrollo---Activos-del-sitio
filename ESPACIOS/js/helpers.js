/*
 * ENTEL - Space Planning
 *
 * Author: Pablo Garín.
 * Started: 23/09/2019
 *
 **/

/* ENV Variables */
const DEBUG = window.location.host == "localhost";
/*
 * FIXME: delete debug condition on production.
 * example:
 * const BASE_URL = "https://www.mi-site.com";
 * */
const BASE_URL = DEBUG ? 
	"http://localhost" : 
	"https://grupoentel.sharepoint.com";
const API_PATH = "/sites/SpacePlannig/_api"
const WEB_PATH = "/sites/SpacePlannig/Paginas"
const MOBILE = (window.innerWidth < 600);
/*
 * Base Component for Views
 * A new component should inherit from this "class" (note the quotes!).
 * methods:
 *	- render    : Renders the view onto its target container
 * 	- setEvents : Method sould be overwritten if the view has events to be set
 * 	- setParent : Set the parent object for easy access to global methods or variables.
 * 	- loadHTML  : Asyncronous methos to fetch the HTML to use when rendering.
 * 	- hasLoaded : Post rendering processes should be added to this method on child "class".
 * */

const BaseComponent = function() {
	this.templateHTML = "";
	this.render = () => {
		if( this.container == undefined ){
			throw new Error("You must set a container first.");
		}
		let html = `${this.templateHTML}`;
		if( this.state !== undefined ){
			let properties = Object.keys(this.state);
			if( properties !== null && properties.length > 0 ){
				properties.forEach(prop => {
					let value = this.state[prop];
					if( typeof value === "string" || typeof value === "number" ){
						html = html.split(`{${prop}}`).join(this.state[prop]);
					}
					if( typeof value === "object" ){
						let innerHTML = "";
						Object.keys(value).forEach(k=>{
							innerHTML = innerHTML + value[k];
						});
						html = html.replace(`{${prop}}`, innerHTML);
					}
				});
			}
		}
		this.container.innerHTML = html;
		if( typeof this.setEvents === "function" ){
			this.setEvents();
		}
		if( typeof this.hasLoaded === "function" ){
			this.hasLoaded();
		}
	}
	this.setEvents = null;
	this.hasLoaded = null;
	this.setParent = parent => {
		this.parent = parent;
	}
	this.setTargetContainer = container => {
		this.container = container;
	}
	this.loadHTML = () => {
		return new Promise((resolve, error) => {
			(async () => {
				let randomString = String(Math.random()*(Math.random()*1000)).replace(".","");
				let fetchPromise = await fetch(`${BASE_URL}${WEB_PATH}/js/components/templates/${this.templateName}.template?${randomString}`,getDefaultFetchConfigs({}));
				let textHtml = await fetchPromise.text();
				this.templateHTML = textHtml;
				resolve();
			})();
		});
	}
}

const abortController = new AbortController();

const getDefaultHeader = () => {
	return new Headers({
		'Content-type': 'application/json;odata=verbose',
		'Accept': 'application/json;odata=verbose',
	});
}

const getDefaultFetchConfigs = (customConfigs) => {
	if( customConfigs == undefined ){
		customConfigs = {};
	}
	return Object.assign({
		headers: getDefaultHeader(),
		credentials: 'include',
		signal: abortController.signal
	}, customConfigs);
}

const abortFetch = () => {

}

/*
 * Import Component File
 * This method imports a component by name.
 * Params:
 * 	- component: Name of the Component to import.
 * return Promise component as an object.
 * */
const importComponent = (component) => {
	let p = new Promise( (resolve, error) => {
		try {
			let randomString = String(Math.random()*(Math.random()*1000)).replace(".","");
			let script = createDOM("script", {
				"id":"importedJs",
				"type":"text/javascript",
				"src":`${BASE_URL}${WEB_PATH}/js/components/${component}.js?${randomString}`
			}, document.body);
			let componentName = component.substr(0,1).toLocaleUpperCase() + component.substr(1);
			script.onload = () => {
				resolve(eval(componentName));
				script.remove();
			}
		} catch(e) {
			error(new Error("Unable to load Component: "+ e));
		}
	});
	return p;
}

const importModel = (model) => {
	let modelObject = null;
	let p = new Promise( (resolve, error) => {
		try {
			modelObject = eval(model);
		} catch(error) {}
		if( modelObject !== null ) {
			resolve(modelObject);
		} else {
			let modelFileName = camelToSnakeCase(model);
			let script = createDOM("script", {
				"id"   : "importedJs",
				"type" : "text/javascript",
				"src"  : `${BASE_URL}${WEB_PATH}/js/models/${modelFileName}.model.js`
			}, document.body);
			script.onload = () => {
				resolve(eval(model));
				script.remove();
			}
		}
	});
	return p;
}

const snakeToCamelCase = (name) => {
	let result = name;
	name.match(/_[a-z]/g).forEach( m => {
		let letter = m.replace("_","").toUpperCase();
		result = result.replace(m, letter);
	});
	result = result.substr(0,1).toUpperCase() + result.substr(1);
	return result;
}

const camelToSnakeCase = (name) => {
	let result = name.substr(0,1).toLowerCase() + name.substr(1);
	let matches = result.match(/[A-Z]/g)
	if( matches !== null ){
		matches.forEach( m => {
			let letter = "_" + m.toLowerCase();
			result = result.replace(m, letter);
		});
	}
	return result;
}

/*
 * Check if element has class
 * Params:
 * 	- dom: document object to check.
 * 	- className: class to check.
 * returns boolean has class.
 * */
Element.prototype.hasClass = function(className) {
	if( this == null ){
		return false;
	}
	let domClass = this.className;
	if( typeof domClass !== "string"  ){
		return false;
	}
	let classArray = this.className.split(" ");
	let hasClass = false;
	classArray.forEach(c=> {
		hasClass = hasClass || c==className;
	});
	return hasClass;
}

/*
 * Add Class
 * Params:
 * 	- dom: document object to add the new class.
 * 	- className: the class to add to the object.
 * */
Element.prototype.addClass = function(className) {
	if( this == null ){
		return;
	}
	let domClass = this.className;
	if( typeof domClass !== "string"  ){
		return;
	}
	let classArray = this.className.split(" ");
	classArray.push(className);
	this.className = classArray.join(" ");
}

/*
 * Remove Class
 * Params:
 * 	- dom: document object to remove the class.
 * 	- className: the class to remove from the object.
 * */
Element.prototype.removeClass = function(className) {
	if( this == null ){
		return;
	}
	let domClass = this.className;
	if( typeof domClass !== "string"  ){
		return;
	}
	let classArray = this.className.split(" ");
	let indexOfClass = classArray.indexOf(className);
	while( indexOfClass > -1 ) {
		classArray.splice(indexOfClass, 1);
		indexOfClass = classArray.indexOf(className);
	}
	this.className = classArray.join(" ");
}

/*
 * Find Parent by Class Name
 * Params:
 * 	- dom: document object that we wish to find the parent.
 * 	- className: The class of the parent object.
 * return DOM parent that has class.
 * */
const findParentByClass = (dom, className) => {
	if( dom == null ){
		return undefined;
	}
	if( dom.hasClass(className) ) {
		return dom;
	}
	return findParentByClass(dom.parentElement, className);
}

// INCOMPTIBLE WITH EDGE
/*
 * FIXME:
 * 	try to fix the function to be compatible with MS Edge. 
 * */
/*
String.format = (...args) => {
	if( args.length == 0 ){
		throw new Error("String format error: You must provide at least one argument");
	}
	const delimiter = "@LIMIT*";
	const format = String(args.shift(1,0)).replace(/(%[0-9]{0,}[sd])/g, delimiter+"$1"+delimiter).split(delimiter); // First element is the format
	if( [...format].filter(el=>el.indexOf("%")>-1).length != args.length ){
		throw new Error("String format error: Arguments must match pattern");
	}
	if( format.length == 1 && args.length == 0 ){
		return String(format);
	}
	let formattedString = "";
	// patterns
	const decimalPattern = /%[0-9]{0,}d/;
	const stringPattern  = /%s/;
	if( format.length == 0 ){
		throw new Error("String format error: Invalid format");
	}
	let value        = null;
	let currPattern  = null;
	while( args.length > 0 ) {
		currPattern = format.shift(0,1);
		if( currPattern.indexOf("%")<0 ){
			formattedString+=currPattern;
			continue;
		}
		value = args.shift(0,1);
		if( decimalPattern.test(currPattern) ){
			let numberLength = parseInt(currPattern.replace(/[^0-9]/g,''));
			if( isNaN(numberLength) ){
				numberLength = 0;
			}
			formattedString+=numberToLength(value, numberLength);
		} else if( stringPattern.test(currPattern) ) {
			if( typeof value === 'object' && value.toSource ){
				formattedString+=String(value.toSource());
			} else {
				formattedString+=String(value);
			}
		} else {
			throw new Error("String format error: Unrecognized pattern:"+currPattern);
		}
	}
	let trailingString = format.shift(0,1);
	formattedString += trailingString == undefined ? "" : trailingString;
	return formattedString;
}
//*/
/*
const numberToLength = (number, length) => {
	length = parseInt(length);
	number = String(number);
	if( isNaN(length) || isNaN(parseInt(number)) ){
		throw new Error("Invalid number passed");
	}
	while( number.length < length ) {
		number = "0" + number;
	}
	return number;
}
//*/

/*
 * Loader
 * Params:
 * 	- show: Boolean, show or hide the loader.
 *	- message: String, message to show when loading
 * */
const loading = (show, message) => {
	const currentLoader = document.querySelector(".loader");
	if( show === undefined ) {
		show = ( currentLoader == undefined);
	}
	if( show ){
		if( currentLoader != undefined ) {
			currentLoader.setAttribute("title", message);
		} else {
			if( message == undefined ){
				message = "Cargando...";
			}
			let loader = createDOM("div", {"className":"loader", "title": message}, document.body);
			let spinner = createDOM("div", "spinner", loader);
		}
	} else {
		//*
		if( currentLoader == undefined ){
			return;
		}
		//*/
		currentLoader.remove();
	}
}

/*
 * Fetch from a SharePoint List
 * Params:
 *	- list: String, listname
 *	- configurations: Object, all the list query parameters.
 *						Example: {"filters":{"column_1":"The value"}, "fields":["Id,column_1,column_2"],"top":10,"signal":(new AbortController()).signal}
 * returns Promise: list items were downloaded
 * */
const fetchFromSharePoint = (list, configurations) => {
	const filters = configurations.filters;
	const fields  = configurations.fields;
	const top     = configurations.top;
	const signal  = configurations.signal;
	let filterStr = "";
	let fieldsStr = "";
	if( typeof list !== "string" ) {
		console.trace();
		throw new Error("List must be a String: "+list);
	}
	if( !(filters instanceof Object) ){
		console.trace();
		throw new Error("Filters must be an Object");
	} else {
		let filterArr = [];
		Object.keys(filters).forEach(key => {
			let value = filters[key];
			if( typeof value === "string" ) {
				value = String(value);
			}
			if( typeof value === "number" ) {
				value = String(value);
			}
			filterArr.push(`(${key} eq '${value}')`);
		});
		filterStr = filterArr.join(" and ");
	}
	if( !(fields instanceof Array) ){
		console.trace();
		throw new Error("Fields must be an Array");
	} else {
		fieldsStr = fields.join(",");
	}
	if( isNaN(top) ){
		console.trace();
		throw new Error("Top must be a number");
	}
	const url = `${BASE_URL}${API_PATH}/web/lists/getbytitle('${list}')/items?$filter=${filterStr}&$select=${fieldsStr}&$top=${top}`;
	let fetchConfig = {mode: "cors"};
	if( configurations.signal !== undefined ) {
		fetchConfig.signal = configurations.signal;
	}
	return fetch(url, getDefaultFetchConfigs(fetchConfig));
}

/*
 * Get Access Token for SharePoint (FormDigest)
 * returns Promise: access token was loaded
 * */
const getAccessToken = () => {
	return new Promise( (resolve, error) => {
		fetch(`${BASE_URL}${API_PATH}/contextinfo`,{
			"method": "POST",
			"headers": {
				"Accept": "application/json;odata=verbose"
			},
			"credentials": "include"
		}).then(response => {
			return response.json();
		}).then(contextInfo => {
			resolve(contextInfo.d.GetContextWebInformation.FormDigestValue);
		});
	});
}

/*
 * Call the ShapePoint API 
 * Params:
 *	- endpoint: String, endpoint of the api
 *	- type: String, HTTP Verb (POST, GET, PUT).
 *	- data: Object, all the request data. 
 *			Example: {"body": JSON.stringify(bodyObject), "signal": (new AbortSignal).signal}
 * returns Promise: call was executed
 * */
const callAPI = (endpoint, type, data, actionType) => {
	return new Promise( (resolve, error) => {
		getAccessToken().then(formDigest => {
			if( typeof type !== "string" && type instanceof Object ){
				data = type;
				type = "GET";
			}
			let headers = new Headers({
				'X-RequestDigest': formDigest,
				"IF-MATCH": "*",
				"Accept": "application/json;odata=verbose"
			})
			if( type == "PUT" ) {
				type = "POST";
				headers.append("Content-Type", "application/json;odata=verbose");
				if(actionType == "Update" || actionType == ""){
					headers.append("X-HTTP-METHOD", "MERGE");
				}
			}
			fetch(
				`${BASE_URL}${API_PATH}/web/lists/${endpoint}`, 				
				Object.assign({
					"method": type, 
					"headers": headers,
					"credentials": "include"
				}, data)
			).then( response => {
				resolve(response);
			});
		});
	});
}

/*
 * Document Object Model Creator Helper
 * Creates a dom with its configurations.
 * Params:
 *	- type: the DOM type to create; Ex.: "div", "a"
 *	- attributes: An object containing all the dom attributes -> {"id":"dom-id", "title": "This is the title", "href": "www.google.cl"}
 *	- parent: The parent DOM to be appended on.
 *	- contents: The contents of the dom. It can be either a String, a single Element instance object, or an Array of Elements.
 *	- event: An object with a single event to be added to the dom; Ex.: {"trigger": "click", "callback": evt => {console.log(evt)}}
 * returns a DOM.
 * */
const createDOM = (type, attributes, parent, contents, event) => {
	if( type === undefined ) {
		throw new Error("Invalid tag");
	}
	let dom = document.createElement(type);
	let className = null;
	if( typeof attributes === "string" ){
		className = attributes;
	}
	if( attributes instanceof Object ) {
		if( attributes.className !== undefined ){
			className = attributes.className;
			delete(attributes.className);
		}
		Object.keys(attributes).forEach( attr => {
			let attrValue = attributes[attr];
			if( typeof attrValue === "function" ){
				dom[attr] = attrValue;
			} else {
				dom.setAttribute(attr, attrValue);
			}
		});
	}
	if( (typeof className == "string") || (className instanceof Array) ) {
		if( className instanceof Array ){
			className.forEach( c => {
				dom.addClass(c);
			});
		} else {
			dom.addClass(className);
		}
	}
	if( contents !== undefined ){
		if( typeof contents == "string" ){
			dom.innerHTML = contents;
		}
		if( contents instanceof Array ) {
			contents.forEach(content => {
				if( content instanceof Element ){
					dom.appendChild(content);
				}
				if( typeof content == "string" ){
					dom.innerHTML = contents;
				}
			});
		}
		if( contents instanceof Element ){
			dom.appendChild(contents);
		}
	}
	if( event !== undefined && event instanceof Object ){
		let eventTrigger = event.trigger;
		let eventCallback = event.callback;
		if( eventTrigger === undefined || eventCallback === undefined ){
			throw new Error("Invalid event");
		}
		dom.addEventListener(eventTrigger, eventCallback);
	}
	if( parent !== undefined && parent !== null ){
		parent.appendChild(dom);
	}
	return dom;
}

/* 
 * Input Generator
 * Creates an Input
 * Params:
 *	- type: Input Type
 *	- attributes: Input attribute list.
 *	- label(optional): Input Label
 *	- options: Required for a select, list with all the options.
 *	- event: An object with a single event to be added to the dom; Ex.: {"trigger": "click", "callback": evt => {console.log(evt)}}
 * returns a Div Object with the input
 * */
const TEXT  	  = 1;
const CHECKBOX 	  = 2;
const RADIO 	  = 3;
const PASSWORD 	  = 4;
const HIDDEN 	  = 5;
const SELECT 	  = 6;
const MULTISELECT = 7;
let inputIds = [];
const createInput = (type, attributes, label, options, event) => {
	const inputTypes = {
		"text": TEXT,
		"checkbox": CHECKBOX,
		"radio": RADIO,
		"password": PASSWORD,
		"hidden": HIDDEN,
		"select": SELECT,
		"multiselect": MULTISELECT
	}
	// UUID for the Input
	let uuid = UUIDGenerator();
	while ( inputIds.filter( id => (id == uuid))[0] !== undefined ) {
		uuid = UUIDGenerator();
	}
	// Input Container
	let containerDOM = createDOM("div", "form-input");
	// Input Label
	let labelDOM = null;
	if( typeof label === "string" ) {
		labelDOM = createDOM("label", "form-input__label", containerDOM, label);
		labelDOM.setAttribute("for", uuid);
	}
	// Process Input type
	typeInt = inputTypes[type];
	if( typeInt == undefined ){
		throw new Error("Invalid input type; It must be one of the following values: " + Object.keys(inputTypes).join(",") );
	}
	try {
		let inputDOM = null;
		switch(typeInt) {
			case TEXT:
			case RADIO:
			case PASSWORD:
			case HIDDEN:
				inputDOM = createDOM("input", Object.assign({"className":"form-input__control"}, attributes), containerDOM);
				inputDOM.type = type;
				break;
			case CHECKBOX:
				inputDOM = createDOM("input", Object.assign({"className":"form-input__control"}, attributes), containerDOM);
				inputDOM.type = type;
				if( labelDOM != undefined ) {
					labelDOM.remove();
					let cbLabelDOM = createDOM("label", "form-input__label", containerDOM, label);
					cbLabelDOM.setAttribute("for", uuid);				
				}
				break;
			case SELECT:
				inputDOM = createDOM("select", Object.assign({"className":"form-input__control"}, attributes), containerDOM);
				options.forEach( opt =>{
					let option = createDOM("option", null, inputDOM, opt.text);
					option.value = opt.value;
					if( opt.selected ){
						option.setAttribute("selected", true);
					}
				});
				break;
			case MULTISELECT:
				inputDOM = createDOM("select", Object.assign({"className":"form-input__control"}, attributes));
				options.forEach( opt =>{
					let option = createDOM("option", null, inputDOM, opt.text);
					option.value = opt.value;
					if( opt.selected ){
						option.setAttribute("selected", true);
					}
				});
				inputDOM.setAttribute("multiple", true);
				break;
		}
		inputDOM.id = uuid;
		let disabled = attributes.disabled == undefined ? false : attributes.disabled;
		inputDOM.disabled = disabled;
		containerDOM.input = inputDOM;
		containerDOM.toggleInput = (disable) => {
			if( disable === undefined ) {
				disable = !inputDOM.disabled;
			}
			if( disable ) {
				inputDOM.disabled = true;
				inputDOM.setAttribute("disabled", disable);
			} else {
				inputDOM.disabled = false;
				inputDOM.removeAttribute("disabled");
			}
		}
	} catch( e ) {
		console.log(e);
		console.trace();
		throw new Error("Invalid input properties. Details: " + e);
	}
	return containerDOM;
}

const dialog = (body, title, dismisable) => {
	// Check if a dialog already exists
	let currentDialog = document.querySelector(".dialog");
	if( currentDialog !== undefined && currentDialog !== null ){
		if( !currentDialog.querySelector(".dialog__container").dismisable ) {
			return;
		}
		currentDialog.remove();
	}
	if( dismisable == undefined ){
		dismisable = true;
	}
	let dialogBG = createDOM("div", "dialog", document.body);
	let dialogBox = createDOM("div", "dialog__container", dialogBG);
	let dialogHeader = createDOM("div", "dialog__header", dialogBox);
	if( title !== undefined ) {
		let dialogHeaderText = createDOM("h2", null, dialogHeader, title);
	}
	let dialogBody = createDOM("div", "dialog__body", dialogBox, body);
	// Set Custom Close Event
	const closeDialog = evt => {
		return new Promise( (resolve) => {
			let shouldClose = evt == undefined || evt.target.hasClass("dialog") || evt.target.hasClass("dialog__close-btn");
			if( shouldClose ){
				dialogBG.remove();
				resolve();
			}
		});
	}
	dialogBox.dismisable = dismisable;
	if( dismisable ){
		let closeBtn = createDOM("button", {"type":"button", "className":"dialog__close-btn"}, dialogBox, "X", {
			"trigger":"click",
			"callback": closeDialog
		});
		dialogBG.addEventListener("click", closeDialog);
	}
	// Set position
	const documentHeight = document.body.getBoundingClientRect().height;
	const dialogHeight = dialogBox.getBoundingClientRect().height;
	dialogBox.style.setProperty("top", ((documentHeight - dialogHeight)/2)+"px");
	dialogBox.close = closeDialog;
	return new Promise((resolve) => {
		resolve(dialogBox);
	});;
}

/*
 * UUID Generator
 * */
const UUIDGenerator = () => {
    const S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

/* Animations JS */

/*
 * Animate Dom
 * params:
 *	- dom: Element to animate.
 * 	- speed: the animation duration; default is 1 second.
 * 	- delay: delay before animation starts; default is 0 seconds.
 * 	- animationClass: the class with the CSS animation.
 * 	- removeAtFinish: remove animation class when animation ends.
 * returns Promise animation has completed.
 * */
const animateDOM = (dom, speed, delay, animationClass, removeAtFinish) => {
	if( dom === undefined ){
		console.trace();
		throw new Error("Dom is undefined");
	}
	if( speed === undefined ) {
		speed = 1000;
	}
	if( delay === undefined ) {
		delay = 0;
	}
	if( removeAtFinish === undefined ) {
		removeAtFinish = true;
	}
	dom.style.setProperty("--duration", (speed/1000) + "s");
	dom.style.setProperty("--delay", (delay/1000) + "s");
	return new Promise( (resolve, error) => {
		dom.addClass(animationClass);
		setTimeout(()=> {
			if( removeAtFinish ) {
				dom.removeClass(animationClass);
			}
			dom.style.removeProperty("--duration");
			dom.style.removeProperty("--delay");
			resolve(dom);
		}, (speed + delay));
	});
}

/*
 * Fade Out
 * params:
 *	- dom: Element to animate.
 * 	- speed: the animation duration; default is 1 second.
 * 	- delay: delay before animation starts; default is 0 seconds.
 * returns Promise animation has completed.
 * */
const fadeOut = (dom, speed, delay) => {
	let promise =  animateDOM(dom, speed, delay, "animation-fade-out");
	promise.then( dom => {
		dom.addClass("hidden");
	});
	return promise;
}

/*
 * Fade In
 * params:
 *	- dom: Element to animate.
 * 	- speed: the animation duration; default is 1 second.
 * 	- delay: delay before animation starts; default is 0 seconds.
 * returns Promise animation has completed.
 * */
const fadeIn = (dom, speed, delay) => {
	let promise =  animateDOM(dom, speed, delay, "animation-fade-in");
	promise.then( dom => {
		dom.removeClass("hidden");
	});
	return promise;
}

/*
 * Go Down
 * params:
 *	- dom: Element to animate.
 * 	- speed: the animation duration; default is 1 second.
 * 	- delay: delay before animation starts; default is 0 seconds.
 * returns Promise animation has completed.
 * */
const disappearDown = (dom, speed, delay) => {
	return animateDOM(dom, speed, delay, "animation-go-down", false);
}

/*
 * Go Up
 * params:
 *	- dom: Element to animate.
 * 	- speed: the animation duration; default is 1 second.
 * 	- delay: delay before animation starts; default is 0 seconds.
 * returns Promise animation has completed.
 * */
const disappearUp = (dom, speed, delay) => {
	return animateDOM(dom, speed, delay, "animation-go-up", false);
}


/*
 * Appear from top of window
 * params:
 *	- dom: Element to animate.
 * 	- speed: the animation duration; default is 1 second.
 * 	- delay: delay before animation starts; default is 0 seconds.
 * returns Promise animation has completed.
 * */
const appearDown = (dom, speed, delay) => {
	let promise = animateDOM(dom, speed, delay, "animation-go-back-down")
	promise.then( dom => {
		dom.removeClass("animation-go-up");
		dom.removeClass("hide-up");
	});
	return promise;
}

/*
 * Appear from bottom of window
 * params:
 *	- dom: Element to animate.
 * 	- speed: the animation duration; default is 1 second.
 * 	- delay: delay before animation starts; default is 0 seconds.
 * returns Promise animation has completed.
 * */
const appearUp = (dom, speed, delay) => {
	let promise =  animateDOM(dom, speed, delay, "animation-go-back-up")
	promise.then( dom => {
		dom.removeClass("animation-go-down");
		dom.removeClass("hide-down");
	});
	return promise;
}

/*
 * Appear from left to right
 * params:
 *	- dom: Element to animate.
 * 	- speed: the animation duration; default is 1 second.
 * 	- delay: delay before animation starts; default is 0 seconds.
 * returns Promise animation has completed.
 * */
const appearLeft = (dom, speed, delay) => {
	return animateDOM(dom, speed, delay, "animation-appear-left");
}

const disappearLeft = (dom, speed, delay) => {
	return animateDOM(dom, speed, delay, "animation-disappear-left");
}

/*
 * Appear from right to left
 * params:
 *	- dom: Element to animate.
 * 	- speed: the animation duration; default is 1 second.
 * 	- delay: delay before animation starts; default is 0 seconds.
 * returns Promise animation has completed.
 * */
const appearRight = (dom, speed, delay) => {
	let promise = animateDOM(dom, speed, delay, "animation-appear-right");
	promise.then( dom => {
		dom.removeClass("hide-right");
	});
	return promise;
}

/*
 * Disappear to right of window
 * params:
 *	- dom: Element to animate.
 * 	- speed: the animation duration; default is 1 second.
 * 	- delay: delay before animation starts; default is 0 seconds.
 * returns Promise animation has completed.
 * */
const disappearRight = (dom, speed, delay) => {
	let promise = animateDOM(dom, speed, delay, "animation-disappear-right");
	promise.then( dom => {
		dom.removeClass("hide-right");
	});
	return promise;
}

/*
 * Zoom In
 * params:
 *	- dom: Element to animate.
 * 	- speed: the animation duration; default is 1 second.
 * 	- delay: delay before animation starts; default is 0 seconds.
 * returns Promise animation has completed.
 * */
const zoomIn = (dom, speed, delay) => {
	return animateDOM(dom, speed, delay, "animation-zoom-in", false);
}

/*
 * Zoom Out
 * params:
 *	- dom: Element to animate.
 * 	- speed: the animation duration; default is 1 second.
 * 	- delay: delay before animation starts; default is 0 seconds.
 * returns Promise animation has completed.
 * */
const zoomOut = (dom, speed, delay) => {
	let promise =  animateDOM(dom, speed, delay, "animation-zoom-out")
	promise.then(dom => {
		dom.removeClass("animation-zoom-in");
	});
	return promise;
}