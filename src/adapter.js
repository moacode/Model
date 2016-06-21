/**
 * Adapter Object
 *
 * Defines the base adapter object, interface and provides a basic
 * method signature of methods that must be implemented across extended adapters.
 *
 * @author 	Josh Smith <josh@customd.com>
 * @version 0.0.3
 * @date   	2016-06-19
 *
 * @since  0.0.4  Added delete methods to the interface
 * @since  0.0.3  Added update_where method
 * @since  0.0.2  Added method to return pre-populated ID where clause
 * @since  0.0.1  Introduced
 *
 * @todo : Complete update, update_where, update_where_in, delete methods
 * @todo : Typecasting, allow searching on strings and int for IDs and other data.
 *
 */
(function(){

	"use strict"

	var plugin = {
		name 	: 'Adapter',
		version : '0.0.3'
	}, Adapter, _fn = {};

	/**
	 * Simple method to check scope of the calling object
	 *
	 * @author Josh Smith <josh@customd.com>
	 * @since  0.0.1      Introduced
	 * @date   2016-06-18
	 *
	 * @return {boolean}   True or False
	 */
	_fn.check_scope = function check_scope(){

		if( ! _fn.adapter.isinstanceof(this) )
		{
			throw new Error('Scope must be an instance of Adapter.');
		}

		return true;
	};

	/**
	 * Returns an object containing where clause for searching on IDs
	 *
	 * @author Josh Smith <josh@customd.com>
	 * @since  0.0.2      Added method to return pre-populated ID where clause
	 * @date   2016-06-19
	 *
	 * @param  {integer}   id        ID of the object
	 * @return {object}              Pre-populated where object
	 */
	_fn.get_id_where = function get_id_where(id){
		var key = this.settings.keys.primary;
		return function(iteratee, func){
			return iteratee[key] == id;
		};
	}

	/**
	 * Define the Adapter contructor function
	 *
	 * @author Josh Smith <josh@customd.com>
	 * @since  0.0.1      Introduced
	 * @date   2016-06-15
	 *
	 * @return {object}
	 */
	_fn.adapter = (function(){

		/**
		 * Define defaults for each Adapter
		 * @type {object}
		 */
		var _defaults = {
			name 	: '',
			enabled : true,
		};

		/**
		 * Defines the interface, each adapter should implement
		 * @type {object}
		 */
		var _interface = {

			insert				: {type: 'create'},
			insert_or_update	: {type: 'create'},
			get					: {type: 'read'},
			get_where			: {type: 'read'},
			get_all				: {type: 'read'},
			update				: {type: 'update'},
			update_where		: {type: 'update'},
			update_where_in		: {type: 'update'},
			delete 				: {type: 'delete'},
			delete_where 		: {type: 'delete'},
			delete_where_in 	: {type: 'delete'},
			delete_all 			: {type: 'delete'},
			like				: {type: 'query'},
			where				: {type: 'query'},
			where_in 			: {type: 'query'},
			where_or_in 		: {type: 'query'},
			where_not_in 		: {type: 'query'},
			sort				: {type: 'query'},
			offset				: {type: 'query'},
			limit				: {type: 'query'},

		};

		/**
		 * Proprietary Adapter constructor
		 * Sets up the Adapter object
		 *
		 * @author Josh Smith <josh@customd.com>
		 * @since  0.0.1      Introduced
		 * @date   2016-06-15
		 *
		 */
		Adapter = function Adapter(settings, methods){

			var self = this;

			/**
			 * Adapter settings object
			 * @type {object}
			 */
			this.settings = _.defaultsDeep({}, settings, _defaults);

			if( _.isFunction(methods) )
			{
				methods = methods(this.settings, Adapter.prototype);
			}

			if( _.isPlainObject(methods) )
			{
				_.forOwn(methods, function(value, key){
					self[key] = value;
				});
			}

			return this;
		}

		/**
		 * Sets the Adapter prototype
		 * @type {object}
		 */
		Adapter.prototype = {

			/**
			 * Sets values into the source collection
			 * Expects the scope to be the collection.
			 *
			 * @author Josh Smith <josh@customd.com>
			 * @since  0.0.1      Introduced
			 * @date   2016-04-17
			 *
			 * @param  {mixed} 		data 	Data to set
			 * @return {integer}            Size of the merged collection
			 */
			insert : function insert(collection, data){
				_fn.check_scope.call(this);

				// Make sure this is an array
				if( !_.isArray(collection) ) return null;

				// Set collections
				if( _.isArray(data) )
				{
					_.each(data, function(value, key){
						collection.push(value);
					});
				}

				// Set objects
				else if( _.isObject(data) )
				{
					collection.push(data);
				}

				return _.size(collection);
			},

			/**
			 * Inserts or Updates content into the passed collection
			 *
			 * @author Josh Smith <josh@customd.com>
			 * @since  0.0.1      Introduced
			 * @date   2016-06-18
			 *
			 * @param  {array}   collection  Collection to insert or update data into
			 * @param  {array}   data        Data array to merge into the collection
			 * @return {integer}             Size of the merged collection
			 */
			insert_or_update : function insert_or_update(collection, data){
				_fn.check_scope.call(this);

				// Make sure we get arrays for both objects
				if( !_.isArray(collection) || !_.isArray(data) ) return [];

				// Merge data into the collection
				var merged = this.settings.methods.merge(data, collection, this.settings.keys);

				// Splice the array to empty the contents.
				// Loop through the merged contents and push the contents back into the array.
				// We do this so we don't lose the reference to the original passed collection, and can
				// mutate the contents, which is actually mutating the contents of the array within the adapter that called this method.
				collection.splice(0,collection.length); _.each(merged, function(obj){ collection.push(obj); });

				return _.size(collection);
			},

			/**
			 * Get a record from the collection
			 *
			 * @author Josh Smith <josh@customd.com>
			 * @since  0.0.1      Introduced
			 * @date   2016-04-17
			 *
			 * @param  {integer}   id        ID of the record to get
			 * @return {object}              Found record
			 */
			get : function get(collection, id){
				_fn.check_scope.call(this);
				return this.get_where(_fn.get_id_where.call(this, id), null, 1);
			},

			/**
			 * Get a record matching filters
			 *
			 * @author Josh Smith <josh@customd.com>
			 * @since  0.0.1      Introduced
			 * @date   2016-04-17
			 *
			 * @param  {object}   where      An object of where parameters
			 * @param  {string}   order      Property and direction to order results
			 * @param  {integer}  limit      Number of results to limit to
			 * @return {array}               An array of objects
			 */
			get_where : function get_where(collection, where, order, limit){
				_fn.check_scope.call(this);

				where = _.isObject(where) 	? where : {};
				order = _.isString(order) 	? order : '';
				limit = _.isInteger(limit)	? limit : 0;

				// Filter the internal array
				var result = _.filter(collection, where);

				if( ! _.isEmpty(order) )
				{
					// Split the ordering pairs
					var pairs 		= {key : [], sort : []},
						ordering 	= order.split(',');

					// Work out the ordering arrays
					_.each(ordering, function(value, key){
						var sep = value.split(' ');
						pairs.key.push(sep[0]);
						pairs.sort.push(sep[1]);
					});
				}

				// Process ordering
				if( ! _.isEmpty(ordering) )
				{
					result = _.orderBy(result, pairs.key, pairs.sort);
				}

				// Process limits
				if( limit > 0 )
				{
					result = result.slice(0,limit);
				}

				return (limit === 1) ? result.pop() : result;
			},

			/**
			 * Get all records
			 *
			 * @author Josh Smith <josh@customd.com>
			 * @since  0.0.1      Introduced
			 * @date   2016-04-17
			 *
			 * @param  {string}   order      Property and direction to order results
			 * @param  {integer}  limit      Number of results to limit to
			 * @return {array}               An array of result objects
			 */
			get_all : function get_all(collection, order, limit){
				_fn.check_scope.call(this);
				return this.get_where(collection, {}, order, limit);
			},

			/**
			 * Updates an object with a specific ID
			 *
			 * @author Josh Smith <josh@customd.com>
			 * @since  0.0.1      Introduced
			 * @date   2016-06-19
			 *
			 * @param  {array}     collection  Data collection
			 * @param  {object}    data        Data to update with
			 * @param  {integer}   id          ID of the object to update
			 * @return {object} 			   Result object
			 */
			update : function update(collection, data, id){
				_fn.check_scope.call(this);
				var result = this.update_where(data, _fn.get_id_where.call(this, id));
				return result.length === 0 ? {} : result.pop();
			},

			/**
			 * Updates objects in the collection matching the where clause
			 *
			 * @author Josh Smith <josh@customd.com>
			 * @since  0.0.3      Added update_where method
			 * @date   2016-06-19
			 *
			 * @param  {array}    collection Data collection
			 * @param  {object}   data       Data to update with
			 * @param  {object}   where      An object of where parameters
			 * @return {array}               An array of updated objects
			 */
			update_where : function update_where(collection, data, where){
				_fn.check_scope.call(this);

				if( !_.isArray(collection) || !_.isPlainObject(data) || !_.isObject(where) )
				{
					return [];
				}

				// Filter the collection down matching the where clauses.
				var found = _.filter(collection, where);

				// Return if the object doesn't exist
				if( _.isUndefined(found) ){ return []; }

				// Loop each found object and merge data in
				_.each(found, function(o){ _.merge(o, data); });

				return found;
			},

			/**
			 * Updates objects in the collection with the passed data, for matching key/values
			 *
			 * @author Josh Smith <josh@customd.com>
			 * @since  1.0.0      Introduced
			 * @date   2016-06-21
			 *
			 * @param  {array}    collection Data collection
			 * @param  {object}   data       Data to update with
			 * @param  {string}   key        Key of the properties to match on
			 * @param  {values}   values     Values matching the passed key
			 * @return {array}               An array of updated objects
			 */
			update_where_in : function update_where_in(collection, data, key, values){
				_fn.check_scope.call(this);
			},

			/**
			 * Deletes an object from the collection
			 *
			 * @author Josh Smith <josh@customd.com>
			 * @since  0.0.4  Added delete methods to the interface
			 * @date   2016-06-21
			 *
			 * @param  {array}    collection Data collection
			 * @param  {integer}  id         ID of the object to delete
			 * @return {object}              Deleted object
			 */
			delete : function(collection, id){
				_fn.check_scope.call(this);
				var result = this.delete_where(_fn.get_id_where.call(this, id), 1);
				return result.length === 0 ? {} : result.pop();
			},

			/**
			 * Deletes objects in the collection matching the where clause
			 *
			 * @author Josh Smith <josh@customd.com>
			 * @since  0.0.4  Added delete methods to the interface
			 * @date   2016-06-19
			 *
			 * @param  {array}    collection Data collection
			 * @param  {object}   where      An object of where parameters
			 * @param  {integer}  limit      Limit objects to tbe deleted
			 * @return {array}               An array of deleted objects
			 */
			delete_where : function delete_where(collection, where, limit){
				_fn.check_scope.call(this);

				if( !_.isArray(collection) || !_.isObject(where) )
				{
					return [];
				}

				// Filter the collection down matching the where clauses.
				var to_delete 	= [],
					found 		= _.filter(collection, where);

				// Return if the object doesn't exist
				if( _.isUndefined(found) ){ return []; }

				// Loop the collection, and determine where the objects sit
				_.each(collection, function(obj, i){
					_.each(found, function(o, j){
						if( obj === o ) to_delete.push(i);
					});
				});

				return _.pullAt(collection, to_delete);
			},

			/**
			 * Deletes objects in the collection for matching key/values
			 *
			 * @author Josh Smith <josh@customd.com>
			 * @since  0.0.4  Added delete methods to the interface
			 * @date   2016-06-21
			 *
			 * @param  {array}    collection Data collection
			 * @param  {string}   key        Key of the properties to match on
			 * @param  {values}   values     Values matching the passed key
			 * @return {array}               An array of deleted objects
			 */
			delete_where_in : function delete_where_in(collection, key, values){
				_fn.check_scope.call(this);
			},

			/**
			 * Deletes all objects from the collection
			 *
			 * @author Josh Smith <josh@customd.com>
			 * @since  0.0.4  Added delete methods to the interface
			 * @date   2016-06-21
			 *
			 * @param  {array}    collection Data collection
			 * @param  {integer}  id         ID of the object to delete
			 * @return {object}              Deleted object
			 */
			delete_all : function delete_all(collection){
				_fn.check_scope.call(this);

				if( !_.isArray(collection) )
				{
					return [];
				}

				return collection.splice(0,collection.length);
			},

			/**
			 * [like description]
			 * @author Josh Smith <josh@customd.com>
			 * @since  0.0.1      Introduced
			 * @date   2016-04-17
			 *
			 * @param  {[type]}   like       [description]
			 * @return {[type]}              [description]
			 */
			like : function like(like){
				_fn.check_scope.call(this);
			},

			/**
			 * [where description]
			 * @author Josh Smith <josh@customd.com>
			 * @since  0.0.1      Introduced
			 * @date   2016-04-17
			 *
			 * @return {[type]}   [description]
			 */
			where : function where(){
				_fn.check_scope.call(this);
			},

			/**
			 * [sort description]
			 * @author Josh Smith <josh@customd.com>
			 * @since  0.0.1      Introduced
			 * @date   2016-04-17
			 *
			 * @return {[type]}   [description]
			 */
			sort : function sort(){
				_fn.check_scope.call(this);
			},

			/**
			 * [offset description]
			 * @author Josh Smith <josh@customd.com>
			 * @since  0.0.1      Introduced
			 * @date   2016-04-17
			 *
			 * @return {[type]}   [description]
			 */
			offset : function offset(){
				_fn.check_scope.call(this);
			},

			/**
			 * [limit description]
			 * @author Josh Smith <josh@customd.com>
			 * @since  0.0.1      Introduced
			 * @date   2016-04-17
			 *
			 * @return {[type]}   [description]
			 */
			limit : function limit(){
				_fn.check_scope.call(this);
			},

			/**
			 * [next description]
			 * @author Josh Smith <josh@customd.com>
			 * @since  0.0.1      Introduced
			 * @date   2016-04-17
			 *
			 * @return {Function} [description]
			 */
			next : function next(){
				_fn.check_scope.call(this);
			},

			/**
			 * [prev description]
			 * @author Josh Smith <josh@customd.com>
			 * @since  0.0.1      Introduced
			 * @date   2016-04-17
			 *
			 * @return {[type]}   [description]
			 */
			previous : function previous(){
				_fn.check_scope.call(this);
			},

			/**
			 * Updates the settings within the scoped adapter
			 *
			 * @author Josh Smith <josh@customd.com>
			 * @since  0.0.1      Introduced
			 * @date   2016-06-18
			 *
			 * @param  {object}   settings   An object of settings
			 */
			set_settings : function set_settings(settings){
				return _.defaultsDeep(this.settings, settings);
			},
		};
		Adapter.prototype.constructor = Adapter;

		/**
		 * Factory method, builds an instance of the Adapter object
		 *
		 * @author Josh Smith <josh@customd.com>
		 * @since  0.0.1      Introduced
		 * @date   2016-06-15
		 *
		 * @param  {object}  methods 	Adapter interface methods
		 * @return {object}  Adapter 	instance
		 */
		var _extend = function extend(methods){
			return function(settings){
				return new Adapter(settings, methods)
			};
		}

		return {

			/**
			 * Internal version of this plugin
			 * @type {string}
			 */
			version : plugin.version,

			/**
			 * Priviliged method definition
			 * @type {function}
			 */
			extend 	: _extend,

			/**
			 * Priviliged interface definition
			 * @type {function}
			 */
			interface : _interface

		};

	})();

	/**
	 * Returns whether the passed model is an instance of Adapter
	 *
	 * @author Josh Smith <josh@customd.com>
	 * @since  0.0.1      Introduced
	 * @date   2016-04-19
	 *
	 * @param  {object}   adapter    Adapter Object
	 * @return {boolean}             True or False
	 */
	_fn.adapter.isinstanceof = function isinstanceof(adapter){
		return adapter instanceof Adapter;
	};

	window[plugin.name] = _fn.adapter;

})();


// 	/*
// 	 * Handles the caching mechanism of localStorage
// 	 *
// 	 * @author Josh Smith <josh@customd.com>
// 	 * @since  0.0.1      Introduced
// 	 * @date   2016-04-17
// 	 *
// 	 * @return {object}   An object of functions
// 	 */

// 	localstorage : function localstorage(settings){

// 		var _settings = {
// 			key : 'result'
// 		};

// 		// Keep an internal array for performance.
// 		// We'll use this to determine whether to update localStorage or not.
// 		var _internal = [];

// 		// Deep clone the settings
// 		_settings = _.defaultsDeep({}, settings, _settings);

// 		/**
// 		 * Gets an item from cache
// 		 *
// 		 * @author Josh Smith <josh@customd.com>
// 		 * @since  0.0.1      Introduced
// 		 * @date   2016-04-21
// 		 *
// 		 * @param  {[type]}   id         [description]
// 		 * @return {[type]}              [description]
// 		 */
// 		this.get = function get(id){
// 			return this.get_where({id: id}, null, 1);
// 		};

// 		/**
// 		 * Gets all items from cache
// 		 *
// 		 * @author Josh Smith <josh@customd.com>
// 		 * @since  0.0.1      Introduced
// 		 * @date   2016-04-21
// 		 *
// 		 * @param  {[type]}   order      [description]
// 		 * @param  {[type]}   limit      [description]
// 		 * @return {[type]}              [description]
// 		 */
// 		this.get_all = function get_all(order, limit){
// 			return this.get_where({}, order, limit);
// 		};

// 		/**
// 		 * Gets specific items from cache
// 		 * @author Josh Smith <josh@customd.com>
// 		 * @since  0.0.1      Introduced
// 		 * @date   2016-04-21
// 		 *
// 		 * @param  {[type]}   where      [description]
// 		 * @param  {[type]}   order      [description]
// 		 * @param  {[type]}   limit      [description]
// 		 * @return {[type]}              [description]
// 		 */
// 		this.get_where = function get_where(where, order, limit){

// 			// See if this result exists in cache first.
// 			var cached = _fn.get_where.apply(_internal, [where, order, limit]);

// 			if( _fn.empty(cached) )
// 			{
// 				// Get the localStorage data
// 				var data = JSON.parse(localStorage.getItem(_settings.key));

// 				// Get the result from cache
// 				cached = _fn.get_where.apply(data, [where, order, limit]);
// 			}

// 			return cached;

// 		};

// 		/**
// 		 * Overrides the default interface set method.
// 		 *
// 		 * @author Josh Smith <josh@customd.com>
// 		 * @since  0.0.1      Introduced
// 		 * @date   2016-04-21
// 		 *
// 		 * @param  {mixed}   value  Value to set
// 		 */
// 		this.set = function set(value){

// 			// Make sure we have a value
// 			if( _fn.empty(value) )
// 			{
// 				return null;
// 			}

// 			// Set the data
// 			var ids  = [],
// 				data = _.isArray(value) ? value : [value];

// 			// Iterate through the internal objects
// 			_.each(_internal, function(v,k){
// 				ids.push(v.id);
// 			});

// 			// Determine what values to set
// 			var to_set = _.filter(data, function(o){ return ids.indexOf(o.id) === -1; });

// 			// Store the data in our internal array
// 			var updated = _fn.set.call(_internal, to_set);

// 			// Set localStorage cache
// 			if( !_fn.empty(updated) )
// 			{
// 				localStorage.setItem(_settings.key, JSON.stringify(_internal));
// 			}

// 			return updated;
// 		};

// 		/**
// 		 * Busts the localStorage cache
// 		 *
// 		 * @author Josh Smith <josh@customd.com>
// 		 * @since  0.0.1      Introduced
// 		 * @date   2016-04-21
// 		 *
// 		 * @return {boolean}   True on successful cache clear
// 		 */
// 		this.bust = function bust(){

// 			// Remove localStorage Cache
// 			localStorage.removeItem(_settings.key);

// 			// Set the interal cache to an empty array
// 			_internal = [];

// 			return true;
// 		};

// 		// Set the cached localStorage into the interal array on load.
// 		_.each(this.get_all(), function(obj){
// 			_internal.push(obj);
// 		});

// 		return this;
// 	},