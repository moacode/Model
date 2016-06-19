/**
 * RESTful Adapter
 *
 * @author 	Josh Smith <josh@customd.com>
 * @version 0.0.1
 * @date   	2016-06-19
 *
 * @since  0.0.1 Introduced
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

		// Give access to parent instance settings
		var _settings = settings;

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
				'url' 		: _settings.endpoint.replace(/\/+$/, '') + '/' + endpoint,
				'dataType'	: 'json',
				'timeout' 	: _settings.timeout,
				'headers' 	: {},
			};

			if( method !== 'get' && data )
			{
				request.data = data;
			}

			$.ajax(request).done(function(response){
				$request_promise.resolve(response[_settings.attribute]);
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

			},

			/**
			 * Get data matching the where criteria
			 *
			 * @author Josh Smith <josh@customd.com>
			 * @since  0.0.1      Introduced
			 * @date   2016-04-19
			 *
			 * @param  {object}   where      [description]
			 * @param  {string}   order      [description]
			 * @param  {integer}  limit      [description]
			 * @return {array}               [description]
			 */
			get_where : function get_where(where, order, limit){
				return _make_request('get', _parse_query(where, order, limit));
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