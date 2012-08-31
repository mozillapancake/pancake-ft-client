define(["./lib/promisedAjax", "./lib/util", "./util/QueryResults" /*=====, "./api/Store" =====*/
], function($, lang, QueryResults /*=====, Store =====*/){

//	module:
//		store/JsonRest
//	summary:
//		The module defines a JSON/REST based object store
function JsonRest(options) {
	// summary:
	//		This is a basic store for RESTful communicating with a server through JSON
	//		formatted data.
	// options: store/JsonRest
	//		This provides any configuration information that will be mixed into the store
	this.headers = {};
	lang.mixin(this, options);
}
JsonRest.extend = lang.extend;

lang.mixin(JsonRest.prototype, {
	// summary:
	//		This is a basic store for RESTful communicating with a server through JSON
	//		formatted data. It implements dojo.store.api.Store.

	// headers: Object
	// Additional headers to pass in all requests to the server. These can be overridden
	// by passing additional headers to calls to the store.
	headers: {},


	// target: String
	//		The target base URL to use for all requests to the server. This string will be
	//	prepended to the id to generate the URL (relative or absolute) for requests
	//	sent to the server
	target: "",
	
	// idProperty: String
	//		Indicates the property to use as the identity property. The values of this
	//		property should be unique.
	idProperty: "id",
	
	// sortParam: String
	//		The query parameter to used for holding sort information. If this is omitted, than
	//		the sort information is included in a functional query token to avoid colliding 
	//		with the set of name/value pairs.
	
	get: function(id, options){
		// summary:
		//		Retrieves an object by its identity. This will trigger a GET request to the server using
		//		the url `this.target + id`.
		// id: Number
		//		The identity to use to lookup the object
		// options: Object?
		//		HTTP headers. For consistency with other methods, if a `headers` key exists on this object, it will be
		//		used to provide HTTP headers instead.
		// returns: Object
		//		The object in the store that matches the given id.
		options = options || {};
		var headers = lang.mixin({ Accept: this.accepts }, this.headers, options.headers || options);
		return $.ajax({
			type: 'GET',
			url: this.target + id,
			dataType: "json",
			headers: headers
		});
	},

	// accepts: String
	//		Defines the Accept header to use on HTTP requests
	accepts: "application/javascript, application/json", 

	getIdentity: function(object){
		// summary:
		//		Returns an object's identity
		// object: Object
		//		The object to get the identity from
		//	returns: Number
		return object[this.idProperty];
	},

	put: function(object, options){
		// summary:
		//		Stores an object. This will trigger a PUT request to the server
		//		if the object has an id, otherwise it will trigger a POST request.
		// object: Object
		//		The object to store.
		// options: Store.PutDirectives?
		//		Additional metadata for storing the data.	 Includes an "id"
		//		property if a specific id is to be used.
		//	returns: Number
		options = options || {};
		var id = ("id" in options) ? options.id : this.getIdentity(object);
		var hasId = typeof id != "undefined";
		return $.ajax({
				type: hasId && !options.incremental ? "PUT" : "POST",
				url: hasId ? this.target + id : this.target,
				data: object,
				dataType: "json",
				headers: lang.mixin({
					"Content-Type": "application/json",
					Accept: this.accepts,
					"If-Match": options.overwrite === true ? "*" : null,
					"If-None-Match": options.overwrite === false ? "*" : null
				}, this.headers, options.headers)
			});
	},
	add: function(object, options){
		// summary:
		//		Adds an object. This will trigger a PUT request to the server
		//		if the object has an id, otherwise it will trigger a POST request.
		// object: Object
		//		The object to store.
		// options: Store.PutDirectives?
		//		Additional metadata for storing the data.	 Includes an "id"
		//		property if a specific id is to be used.
		options = options || {};
		options.overwrite = false;
		return this.put(object, options);
	},
	remove: function(id, options){
		// summary:
		//		Deletes an object by its identity. This will trigger a DELETE request to the server.
		// id: Number
		//		The identity to use to delete the object
		// options: __HeaderOptions?
		//		HTTP headers.
		options = options || {};
		return $.ajax({
			type: 'DELETE',
			url: this.target + id,
			headers: lang.mixin({}, this.headers, options.headers)
		});
	},
	query: function(query, options){
		// summary:
		//		Queries the store for objects. This will trigger a GET request to the server, with the
		//		query added as a query string.
		// query: Object
		//		The query to use for retrieving objects from the store.
		//	options: Store.QueryOptions?
		//		The optional arguments to apply to the resultset.
		//	returns: Store.QueryResults
		//		The results of the query, extended with iterative methods.
		options = options || {};

		var headers = lang.mixin({ Accept: this.accepts }, this.headers, options.headers);

		if(options.start >= 0 || options.count >= 0){
			//set X-Range for Opera since it blocks "Range" header
			headers.Range = headers["X-Range"] = "" + 
				"items=" + (options.start || '0') + '-' +
				(("count" in options && options.count != Infinity) ?
					(options.count + (options.start || 0) - 1) : '');
		}
		var hasQuestionMark = this.target.indexOf("?") > -1;
		if(query && typeof query == "object"){
			query = $.param(query);
			query = query ? (hasQuestionMark ? "&" : "?") + query: "";
		}
		if(options && options.sort){
			var sortParam = this.sortParam;
			query += (query || hasQuestionMark ? "&" : "?") + (sortParam ? sortParam + '=' : "sort(");
			for(var i = 0; i<options.sort.length; i++){
				var sort = options.sort[i];
				query += (i > 0 ? "," : "") + (sort.descending ? '-' : '+') + encodeURIComponent(sort.attribute);
			}
			if(!sortParam){
				query += ")";
			}
		}
		var results = $.ajax({
			type: "GET",
			url: this.target + (query || ""),
			dataType: "json",
			headers: headers
		});
		results.total = results.then(function(){
			var range = results.xhr.getResponseHeader("Content-Range");
			return range && (range = range.match(/\/(.*)/)) && +range[1];
		});
		return QueryResults(results);
	}
});

return JsonRest;
});