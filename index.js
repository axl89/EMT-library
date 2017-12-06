'use strict';

const request = require('request-promise');
const {
	BUS_DOMAIN,
	BIKE_DOMAIN,
	PARKING_DOMAIN
} = require('./config/url');
const {
	BUS,
	GEO,
	MULTIMEDIA,
	BIKE
} = require('./config/category');
const {
	bus_endpoints,
	geo_endpoints,
	media_endpoints,
	bike_endpoints,
	parking_endpoints
} = require('./config/endpoints');

/**
 * Factory function that will return the different accesible methods as long as u
 * return a preselected category
 * @param {string} clientId - Client username to identify with
 * @param {string} passKey - Password to validate the client autentification
 * @param {string} category - It can either be bus or geo
 */
module.exports = function emtService(clientId, passKey) {
	return function typeService(service) {
		if (service === 'bus') return new Bus(clientId, passKey, BUS, 'POST');
		if (service === 'geo') return new Geo(clientId, passKey, GEO, 'POST');
		if (service === 'media') return new Media(clientId, passKey, MULTIMEDIA, 'POST');
		if (service === 'bike') return new Bike(clientId, passKey, BIKE, 'GET');
		if (service === 'parking') return new Park(clientId, passKey, 'POST');
	};
};

/**
 * Superclass Service that holds the common features across the different service requests
 * @param {string} clientId - Client username to identify with
 * @param {string} passKey - Password to validate the client autentification
 */
const Service = function (clientId, passKey, rest_method) {
	let client = clientId; // private attribute
	let pass = passKey; // private attribute
	this.rest_method = rest_method;

	/** 
	 * Getters & Setters
	 */
	this.getClient = function () {
		return client;
	};

	this.setClient = function (client) {
		this.client = client;
	};

	this.getPassword = function () {
		return pass;
	};

	this.setPassword = function (pass) {
		this.pass = pass;
	};
	/**
	 * Forms the entire domain for the desired request
	 */
	this.glueURL = function (endpoint, params) {
		return `${BUS_DOMAIN}${this.category}/${endpoint}.php`;
	};
	/**
	 * Forms the authentication credentials so it can be added to
	 * the request body, therefore the user can succesfully 
	 * have permission to it.
	 */
	this.glueBody = function (params) {
		if (this.category === BIKE) return;
		const auth = {};
		auth['idClient'] = this.getClient();
		auth['passKey'] = this.getPassword();

		Object.assign(params, auth);
		return params;
	};

};

/**
 * Handles the request as it glues up all the parts needed to
 * fit the body
 * @param {string} endpoint The Web service endpoint 
 * @param {object} body The data that will be sent to the ws 
 * @returns {promise} 
 */
Service.prototype.makeRequest = function (endpoint, params = {}) {

	const url = this.glueURL(endpoint, params);
	const body = this.glueBody(params);

	return request({
		'method': this.rest_method,
		'uri': url,
		'form': body,
		'gzip': true,
		'strictSSL': false // Spain goverment sign their own SSL certificates, ಠ.ಠ
	})
		.then(response => {
			return JSON.parse(response);
		});
};

/**
 * Bus service that holds all it's methods to make accesible request and return a response 
 * in JSON
 * 
 * @param {string} clientId - client username to identify with
 * @param {string} passKey - password to validate the client autentification
 * @param {string} category - It can either be bus or geo
 */
const Bus = function (clientId, passKey, category, rest_method) {
	Service.call(this, clientId, passKey, rest_method);
	this.category = category;
};

Bus.prototype = Object.create(Service.prototype); // inherits from service class

/**
 * Get EMT Calendar for all days and line schedules for a range of dates
 * @param {string} SelectDateBegin
 * @param {string} SelectDateEnd
 * @returns {promise}
 */
Bus.prototype.getCalendar = function (SelectDateBegin, SelectDateEnd) {
	const body = { SelectDateBegin, SelectDateEnd }
	return this.makeRequest(bus_endpoints.GET_CALENDAR, body);
};
/**
 * Returns every line type and their details
 * @returns {promise}
 */
Bus.prototype.getGroups = function () {
	return this.makeRequest(bus_endpoints.GET_GROUPS);
};
/**
 * Returns lines with description and group
 * @param {string} SelectDate
 * @param {string} Lines
 * @returns {promise}
 */
Bus.prototype.getListLines = function (SelectDate, Lines) {
	const body = { SelectDate, Lines }
	return this.makeRequest(bus_endpoints.GET_LIST_LINES, body);
};
/**
 * Returns all stop identifiers and his coordinate, name, 
 * lines and directions
 * @param {string} Nodes
 * @returns {promise}
 */
Bus.prototype.getNodesLines = function (Nodes) {
	const body = { Nodes };
	return this.makeRequest(bus_endpoints.GET_NODES_LINES, body);
};
/**
 * Returns a line/s route with the vertex info to build the route and 
 * coordinates for stops and axes
 * @param {string} SelectDate
 * @param {string} Lines
 * @returns {promise}
 */
Bus.prototype.getRouteLines = function (SelectDate, Lines) {
	const body = { SelectDate, Lines };
	return this.makeRequest(bus_endpoints.GET_ROUTE_LINES, body);
};
/**
 * Get line route with vertex info to build map and coordinates for Stops
 * @param {string} SelectDate
 * @param {string} Lines
 * @returns {promise}
 */
Bus.prototype.getRouteLinesRoute = function (SelectDate, Lines) {
	const body = { SelectDate, Lines }
	return this.makeRequest(bus_endpoints.GET_ROUTE_LINES_ROUTE, body);
};
/**
 * Provices information about the requested line at travel details
 * @param {string} SelectDate
 * @param {string} Lines
 * @returns {promise}
 */
Bus.prototype.getTimeTableLines = function (SelectDate, Lines) {
	const body = { SelectDate, Lines }
	return this.makeRequest(bus_endpoints.GET_TIME_TABLE_LINES, body);
};
/**
 * Returns current schedules for the requested lines
 * @param {string} SelectDate
 * @param {string} Lines
 * @returns {promise}
 */
Bus.prototype.getTimesLines = function (SelectDate, Lines) {
	const body = { SelectDate, Lines }
	return this.makeRequest(bus_endpoints.GET_TIMES_LINES, body);
};

/**
 * Geo service that holds all it's methods to make accesible request and return a response 
 * in JSON
 * 
 * @param {string} clientId - client username to identify with
 * @param {string} passKey - password to validate the client autentification
 * @param {string} category - It can either be bus or geo
 */
const Geo = function (clientId, passKey, category, rest_method) {
	Service.call(this, clientId, passKey, rest_method);
	this.category = category;
};

Geo.prototype = Object.create(Service.prototype); // inherits from service class

/**
 * Gets bus arrive info to a target stop
 */
Geo.prototype.getArriveStop = function (params) {
	return this.makeRequest(geo_endpoints.GET_ARRIVE_STOP, params);
};
/**
 * Return a list of groups
 */
Geo.prototype.getGroups = function (params) {
	return this.makeRequest(geo_endpoints.GET_GROUPS, params);
};
/**
 * Returns line info in a target date
 */
Geo.prototype.getInfoLine = function (params) {
	return this.makeRequest(geo_endpoints.GET_INFO_LINE, params);
};
/**
 * Returns line info in a target date
 */
Geo.prototype.getInfoLineExtend = function (params) {
	return this.makeRequest(geo_endpoints.GET_INFO_LINE_EXTEND, params);
};
/**
 * Returns a list of Points of Interest from a coordinate center with a target radius
 */
Geo.prototype.getPointsOfInterest = function (params) {
	return this.makeRequest(geo_endpoints.GET_POINTS_OF_INTEREST, params);
};
/**
 * Returns a list of Point of interest types
 */
Geo.prototype.getPointsOfInterestTypes = function (params) {
	return this.makeRequest(geo_endpoints.GET_POINTS_OF_INTEREST_TYPES, params);
};
/**
 * Returns a list of stops from a target stop with a target radius and the lines arriving to those stops.
 */
Geo.prototype.getStopsFromStop = function (params) {
	return this.makeRequest(geo_endpoints.GET_STOPS_FROM_STOP, params);
};
/**
 * Returns a list of stops from a coordinate with a radius and the lines arriving to those stops
 */
Geo.prototype.getStopsFromXY = function (params) {
	return this.makeRequest(geo_endpoints.GET_STOPS_FROM_XY, params);
};
/**
 * Provices information about the requested line at travel time
 */
Geo.prototype.getStopsLine = function (params) {
	return this.makeRequest(geo_endpoints.GET_STOPS_LINE, params);
};
/**
 * Returns a list of EMT nodes related to a location. All EMT locations are a group of stops 
 * within a target radius and the lines related to each stop in the list
 */
Geo.prototype.getStreet = function (params) {
	return this.makeRequest(geo_endpoints.GET_STREET, params);
};
/**
 * Returns a list of stops from a target coordinate
 */
Geo.prototype.getStreetFromXY = function (params) {
	return this.makeRequest(geo_endpoints.GET_STREET_FROM_XY, params);
};

/**
 * Multimedia service that holds all it's methods to make accesible request and return a response 
 * in JSON
 * @param {string} clientId - client username to identify with
 * @param {string} passKey - password to validate the client autentification
 * @param {string} category - It can either be bus or geo
 */
const Multimedia = function (clientId, passKey, category, rest_method) {
	Service.call(this, clientId, passKey, rest_method);
	this.category = category;
};

Multimedia.prototype = Object.create(Service.prototype); // inherits from service class

/**
 * Get estimate arrival time to stop and its related issues
 */
Multimedia.prototype.getEstimatesIncident = function (params) {
	return this.makeRequest(media_endpoints.GET_ESTIMATES_INCIDENT, params);
};
/**
 * Request up to three optimal routes from one place to another using bus or walking,
 * source and destination must be in a format known for the system, which means that 
 * should have been validated by a GetStreet call
 */
Multimedia.prototype.getStreetRoute = function (params) {
	return this.makeRequest(media_endpoints.GET_STREET_ROUTE, params);
};

/**
 * 
 */
Multimedia.prototype.getRouteWithAlarm = function (params) {
	return this.makeRequest(media_endpoints.GET_ROUTE_WITH_ALARM, params);
};
/**
 * 
 */
Multimedia.prototype.getRouteWithAlarmResponse = function (params) {
	return this.makeRequest(media_endpoints.GET_ROUTE_WITH_ALARM_RESPONSE, params);
};
/**
 * 
 */
Multimedia.prototype.getRoute = function (params) {
	return this.makeRequest(media_endpoints.GET_ROUTE, params);
};
/**
 * 
 */
Multimedia.prototype.getRouteResponse = function (params) {
	return this.makeRequest(media_endpoints.GET_ROUTE_RESPONSE, params);
};

/**
 * Set of services that let's know the actual state and availability 
 * for all the bikes located in Madrid
 * 
 * @param {string} clientId - client username to identify with
 * @param {string} passKey - password to validate the client autentification
 */
const Bike = function (clientId, passKey, category, rest_method) {
	Service.call(this, clientId, passKey, rest_method);
	this.category = category;

	this.glueURL = function (endpoint, params) {
		if (isNaN(params)) params = '';
		return `${BIKE_DOMAIN}/${this.category}/${endpoint}/${this.getClient()}/${this.getPassword()}}/${params}`;
	};
};

Bike.prototype = Object.create(Service.prototype); // inherits from service class

/**
 * Obtiene la relación de todas las bases de Bicimad y su estado
 * operacional.
 */
Bike.prototype.getStations = function () {
	return this.makeRequest(bike_endpoints.GET_STATIONS);
};
/**
 * Obtiene la información de una base
 */
Bike.prototype.getSingleStations = function (baseId) {
	return this.makeRequest(bike_endpoints.GET_SINGLE_STATION, baseId);
};

/**
 * Set of services that let's know the actual state and availability 
 * for all the bikes located in Madrid
 * 
 * @param {string} clientId - client username to identify with
 * @param {string} passKey - password to validate the client autentification
 */
const Park = function (clientId, passKey, rest_method) {
	Service.call(this, clientId, passKey, rest_method);

	this.glueURL = function (endpoint, params) {
		let newURL = `${PARKING_DOMAIN}/${endpoint}/${this.getClient()},${this.getPassword()}`;
		for(param in params) {
			newURL += `,${param}`;
		}
		return newURL;
	};
}

Park.prototype = Object.create(Service.prototype); // inherits from service class

/**
 * Obtiene la información detallada de un aparcamiento concreto: Información sobre sus
 * accesos, horarios, tarifas, servicios que ofrece y cifras de ocupación.
 */
Park.prototype.detailParking = function () {
	return this.makeRequest(parking_endpoints.DETAIL_PARKING);
}
/**
 * Obtiene la información detallada de un POI concreto (o de todos ellos), con id, código de
 * familia, nombre estándar, nombre traducido, descripción, web, horario, servicios de pago,
 * así como sus imágenes asociadas con nombre, ruta y descripción. 
 */
Park.prototype.detailPOI = function () {
	return this.makeRequest(parking_endpoints.DETAIL_POI);

}
/**
 * Obtiene una lista de todos los elementos (características de aparcamientos, categorías de
 * POIs,…) que tienen un icono asociado, con nombre, descripción si se dispone de ella, grupo al
 * que pertenece y ruta del icono que la representa. 
 */
Park.prototype.iconDescription = function () {
	return this.makeRequest(parking_endpoints.ICON_DESCRIPTION);

}
/**
 * Obtiene información genérica de POIs y aparcamientos, independiente del idioma (dirección,
 * coordenadas, códigos de familia, tipo y categoría,…). 
 */
Park.prototype.infoParkingPoi = function () {
	return this.makeRequest(parking_endpoints.INFO_PARKING_POI);

}
/**
 * Obtiene una lista de las características activas de los aparcamientos, con nombre, código y
 * grupo de la característica, descripción si se dispone de ella y ruta del icono que la representa. 
 */
Park.prototype.listFeatures = function () {
	return this.makeRequest(parking_endpoints.LIST_FEATURES);

}
/**
 * Obtiene una lista de todos los aparcamientos activos, con su id, familia, nombre, categoría,
 * tipo, dirección completa y coordenadas. 
 * @param {*} language 
 */
Park.prototype.listParking = function (language) {
	const body  = { language };
	return this.makeRequest(parking_endpoints.LIST_PARKING, body);

}
/**
 * Obtiene una lista de direcciones y POIs (aparcamientos incluidos) que coincidan total o
 * parcialmente, con un texto pasado como parámetro. 
 * @param {*} address 
 * @param {*} language 
 */
Park.prototype.listStreetPoisParking = function (address, language) {
	const body  = { address, language };
	return this.makeRequest(parking_endpoints.LIST_STREET_POIS_PARKING, address, body);

}
/**
 * Obtiene una lista de las familias, tipos y categorías de POIs activos en el sistema. 
 * @param {*} language 
 */
Park.prototype.listTypesPOIs = function (language) {
	const body  = { language };
	return this.makeRequest(parking_endpoints.LIST_TYPES_POIS, body);

}