/**
 * RESTful Adapter
 *
 * @author 	Josh Smith <josh@customd.com>
 * @version 0.0.3
 * @date   	2016-06-19
 *
 * @since  0.0.3 	Updated get_where method to use custom attributes on top of existing ordering.
 * @since  0.0.2 	Added get_all method
 * @since  0.0.1 	Introduced
 *
 * @todo : Add if-modiied-since timestamp. Only search for more results after the configured time period.
 */
(function(){

	"use strict";

	/**
	 * Implements the default Restful adapter
	 *
	 * @author Josh Smith <josh@customd.com>
	 * @since  0.0.1      Introduced
	 * @date   2016-06-15
	 *
	 * @param  {object}		Settings
	 * @param  {function}	Implementation
	 * @return {object}     Adapter method implementation
	 */
	Adapter.Restful = Adapter.extend(function(settings, parent){

		var defaults = {
			attribute 	: null,
			attributes 		: {
				like 		: 'like',
				limit		: 'limit',
				order 		: 'order',
				sort 		: 'sort'
			},
			dataType	: 'json',
			endpoint 	: '',
			headers 	: {},
			io 			: ['r'],
			params 		: {},
			prefetch 	: false,
			timeout 	: 10000,
		};

		// Give access to parent instance settings
		var _settings = _.defaultsDeep(settings, defaults);

		/**
		 * Create a GET style query string from the passed parameters
		 *
		 * @author Josh Smith <josh@customd.com>
		 * @since  0.0.1      Introduced
		 * @date   2016-04-21
		 *
		 * @param  {object}   params     An object of parameters
		 * @return {string}              Query string
		 */
		var _parse_query = function _parse_query(params){

			var query_string = '';

			// Loop the params, and build a query string
			if( _.isPlainObject(params) )
			{
				_.each(params, function(resource,key){

					if( !_.isNull(resource) )
					{
						if( query_string === '' ){ query_string = '?'; } else{ query_string += '&';}
						query_string += encodeURIComponent(key) + '=' + encodeURIComponent(resource);
					}

				});
			}
			// Just assign the parameters
			else if( params ){ query_string = params; }

			return query_string;
		};

		/**
		 * Private API request method
		 *
		 * @author Josh Smith <josh@customd.com>
		 * @since  1.0.0 Introduced.
		 *
		 * @param  {String} method GET|PUT|POST|DELETE
		 * @param  {Object} data   Data to Put/Post
		 * @return {Object}        Ajax Promise
		 */
		var _make_request = function _make_request(method, endpoint, data){

			var $request_promise = $.Deferred();

			// Build a request object
			var request = {
				'method' 	: method,
				'url' 		: _settings.endpoint.replace(/\/+$/, '') + endpoint,
				'dataType'	: 'json',
				'timeout' 	: _settings.timeout,
				'headers' 	: {},
			};

			if( method !== 'get' && data )
			{
				request.data = data;
			}

			// Return the response data, filtered by key if set.
			$.ajax(request).done(function(response){
				var request_data = (_.isString(_settings.attribute) ? response[_settings.attribute] : response);
				$request_promise.resolve(request_data);
			});

			return $request_promise;
		};

		return {

			name : 'RESTful',

			/**
			 * Overrides the default interface insert method
			 *
			 * @author Josh Smith <josh@customd.com>
			 * @since  0.0.1      Introduced
			 * @date   2016-04-19
			 * @see    Default insert method {@link insert}
			 *
			 * @param  {mixed} data  Data to insert
			 */
			insert : function insert(data){

			},

			/**
			 * Override the default interface get method
			 *
			 * @author Josh Smith <josh@customd.com>
			 * @since  0.0.1      Introduced
			 * @date   2016-04-19
			 *
			 * @param  {integer}   id        ID of the object
			 * @return {object}              Result object
			 */
			get : function get(id){
				var where = {}; where[_settings.keys.primary] = id;
				return this.get_where(where, null, 1);
			},

			/**
			 * Override the default interface get method
			 *
			 * @author Josh Smith <josh@customd.com>
			 * @since  0.0.2      Added get_all method
			 * @date   2016-04-19
			 *
			 * @param  {integer}   id        ID of the object
			 * @return {object}              Result object
			 */
			get_all : function get_all(order, limit){
				return this.get_where({}, order, limit);
			},

			/**
			 * Get data matching the where criteria
			 *
			 * @author Josh Smith <josh@customd.com>
			 * @since  0.0.3      Updated get_where method to use custom attributes on top of existing ordering.
			 * @date   2016-04-19
			 *
			 * @param  {object}   where      Where clause
			 * @param  {string}   order      Order clause
			 * @param  {integer}  limit      Limit clause
			 * @return {array}               A collection of matching data
			 */
			get_where : function get_where(where, order, limit){

				// Make a new object that doesn't mutate the original where object
				var query = _.defaults({}, query, where);

				// Use the order parameter as extra resource filtering, if an object.
				if( _.isPlainObject(order) )
				{
					_.each(order, function(param, resource){

						// Work out if this attribute has been defined, otherwise use its raw form.
						var attribute = _.isUndefined(_settings.attributes[resource]) ? resource : _settings.attributes[resource];

						// Add this attribute to the query
						query[attribute] = param;

					});
				}

				// Use it to set the defined order
				else if( !_.isUndefined(order) )
				{
					query[_settings.attributes.order] = order;
				}

				// Set the limit parameter
				if( !_.isUndefined(limit) ){ query[_settings.attributes.limit] = limit; }

				return _make_request('get', _parse_query(query));
			},

			/**
			 * Prefetches data from the API
			 *
			 * @author Josh Smith <josh@customd.com>
			 * @since  0.0.1      Introduced
			 * @date   2016-04-21
			 *
			 * @return {object}   Promise
			 */
			prefetch : function prefetch(){
				return this.get_where(_settings.params, _settings.order, _settings.limit);
			}

		};

	});

})();