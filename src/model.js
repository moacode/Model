/**
 * Model v2.
 * Lightweight Data Models & Result objects for client side operations.
 *
 * @author  	Josh Smith <josh@customd.com>
 * @version 	0.0.12
 * @requires 	Adapter, lodash
 * @date    	15/04/2016
 *
 * @since  		0.0.12 Updated core prototype to generate direct methods automatically
 * @since  		0.0.11 Updated result prototype with on_load and on_remove methods.
 * @since  		0.0.10 Added method {@link _fn.setup_result} to fire load methods on creation of result objects
 * @since  		0.0.9 Improved firing of load events when creating result objects from multiple adapter results.
 * @since  		0.0.8 Removed Model.prototype._build_result method and made private under _fn object.
 * @since  		0.0.7 Improved versioning object
 * @since 		0.0.6 Fixed syntax error in plugin versioning
 * @since  		0.0.5 Fixed bug {@link _fn.process_adapter_data} where un-merged array was being returned when Store was the only adapter being used.
 * @since  		0.0.4 Added valueOf method to the Result object
 * @since  		0.0.3 Updated adapter method types
 * @since  		0.0.2 Updated merge method to copy object properties from new array into the source.
 * @since   	0.0.1 Introduced
 *
 */
(function(){

	"use strict"

	if( typeof Adapter === 'undefined' ) throw new Error('Adapter object must be included.');

	/**
	 * Define the plugin details
	 * @type {string}
	 */
	var plugin = {
		version	: '0.0.7',
		author 	: 'Josh Smith <josh@customd.com>',
		model 	: {
			name	: 'Model'
		},
		result 	: {
			name	: 'Result'
		},
	};

	/**
	 * Define the Model and Result
	 * @type {object}
	 */
	var	Model, Result;

	/**
	 * Plugin internal methods object
	 * @type {object}
	 */
	var	_fn = {};

	/**
	 * Generic method that assigns properties to the passed object
	 *
	 * @author Josh Smith <josh@customd.com>
	 * @since  0.0.1      Introduced
	 * @date   2016-04-18
	 *
	 * @param  {object}   properties Properties to assign
	 * @param  {object}   scope      Object to assign to
	 * @return {object}              Object
	 */
	_fn.assign_properties = function assign_properties(properties, scope){

		// Set defaults
		properties 	= (!_.isPlainObject(properties) ? {} : properties);

		// Loop the properties
		_.forOwn(properties, function(value, key){

			// Check if this property is an object, and if it exists on the Model.
			// If it does, we want to extend it rather than overwrite it completely.
			if( _.isPlainObject(scope[key]))
			{
				scope[key] = _.defaultsDeep({}, value, scope[key]);
			}

			// Just store it on the object
			else
			{
				scope[key] = value;
			}

		});

		return scope;
	};

	/**
	 * Shim method
	 * Creates a shimmed object from the passed parameters.
	 *
	 * We use this to create named constructor functions for the model/result objects.
	 *
	 * @author Josh Smith <josh@customd.com>
	 * @since  0.0.1      Introduced
	 * @date   2016-04-18
	 *
	 * @param  {function} constructor 	Constructor function to be called
	 * @param  {object}   properties 	An object of properties
	 * @param  {object}   shared     	An object of prototypal properties
	 * @return {function}              	Function shim
	 */
	_fn.shim = function shim(constructor, properties, shared){

		var constructor = (!_.isFunction(constructor) ? function(){} : constructor),
			properties 	= (properties 	=== undefined || properties === null ? {} : properties),
			shared 		= (shared 		=== undefined || shared 	=== null ? {} : shared);

		// Extend the shared and properties variables with defaults
		shared 		= _.defaults({}, shared);
		properties 	= _.defaults({}, properties);

		return (function(data){
			return constructor.apply(this, [properties, shared, data]);
		});
	};

	/**
	 * Returns whether the passed data is empty
	 *
	 * @author Josh Smith <josh@customd.com>
	 * @since  0.0.1      Introduced
	 * @date   2016-04-19
	 *
	 * @param  {mixed}   	data   Data to check
	 * @return {Boolean}           True or False
	 */
	_fn.empty = function empty(data){

		var is_empty = false;

		// Set the result to null, if we don't have a valid result
		if( !_.isNumber(data) && !_.isString(data) && _.isEmpty(data) )
		{
			is_empty = true;
		}

		return is_empty;
	};

	/**
	 * Helper method to process plain objects into result objects
	 *
	 * @author Josh Smith <josh@customd.com>
	 * @since  0.0.1      Introduced
	 * @date   2016-04-19
	 *
	 * @param  {mixed}   source     Source object or array
	 * @return {mixed}              Object or array
	 */
	_fn.process_result_objects = function process_result_objects(source){

		var self = this;

		if( _fn.empty(source) )
		{
			return [];
		}

		// Convert to a result object, if it's not an instance.
		if( _.isArray(source) )
		{
			_.each(source, function(v, i){
				if( ! _fn.result.isinstanceof(v) ){ source[i] = _fn.build_result.call(self, v); }
			});
		}
		else if( _.isObject(source) )
		{
			if( ! _fn.result.isinstanceof(source) ){ source = _fn.build_result.call(self, source); }
		}

		return source;
	};

	/**
	 * Builds a result object from the passed data
	 *
	 * @author Josh Smith <josh@customd.com>
	 * @since  0.0.8 	Removed Model.prototype._build_result method and made private under _fn object.
	 * @date   2016-04-19
	 *
	 * @param  {mixed}   data   An array or object of data
	 * @return {mixed}          A result object or array of result objects
	 */
	_fn.build_result = function build_result(data){

		var self = this;

		// Create a default result object function if not defined
		if( ! _.isFunction(this.result_model) )
		{
			this.result_model = _fn.result.extend();
		}

		if( ! _.isArray(data) )
		{
			// Create a singular result object
			data = _fn.setup_result.call(self, data);
		}
		else
		{
			// Create an array of result objects
			_.each(data, function(value, key){
				data[key] = _fn.setup_result.call(self, value);
			});
		}

		return data;
	};

	/**
	 * Creates the result object and performs additional method calls.
	 * Triggers the add event and fires the on_load result method.
	 *
	 * @author Josh Smith <josh@customd.com>
	 * @since  0.0.10      Added method to fire load methods on creation of result objects
	 * @date   2016-06-21
	 *
	 * @param  {object}   data       Result object properties
	 * @return {object}              Result object
	 */
	_fn.setup_result = function setup_result(data){

		// Create a new result object
		var result_object = new this.result_model(data);

		// Run the on_load method
		result_object.on_load();

		// Trigger the 'add' event
		this.trigger('add', [result_object]);

		return result_object;
	};

	/**
	 * Sets up the link between model core methods and the Adapter interface methods.
	 *
	 * @author Josh Smith <josh@customd.com>
	 * @since  0.0.1      Introduced
	 * @date   2016-06-16
	 *
	 * @param  {object}   method   	 Adapter method
	 * @param  {object}   settings   Adapter method settings
	 * @return {function}            Function to be run
	 */
	_fn.integrate_adapter_method = function(method, settings, args){

		var self = this;

		// Create a new read promise object
		var promise = new Promise(function(resolve, reject){

			// Build promises for running this adapter method against all registered adapters.
			var promises = _fn.adapter_promises_factory.apply(self, [method, settings, args]);

			// Resolve all promises at once.
			Promise.all(promises).then(function(){

				var results = Array.prototype.slice.call(arguments);

				// Make a scope object, that holds all scoped variables.
				var scope = {
					method : method,
					settings : settings,
					args : args,
					promise : {
						resolve : resolve,
						reject 	: reject
					}
				};

				// Resolves the overall promise
				_fn.process_adapter_data.apply(self, [results, scope]);

			}, function(reason){
				console.log(reason); resolve([]);
			});

		});

		return promise;
	}

	/**
	 * Creates an array of promises for running the passed method, settings and arguments against each registered adapter.
	 *
	 * @author Josh Smith <josh@customd.com>
	 * @since  0.0.3      Updated adapter method types
	 * @date   2016-06-17
	 *
	 * @param  {string}   method     Method to run against each adapter
	 * @param  {object}   settings   Method settings.
	 * @param  {array}    args       An array of arguments to be used with each method call.
	 * @return {array}               An array of promise objects.
	 */
	_fn.adapter_promises_factory = function adapter_promises_factory(method, settings, args){

		var self 		= this,
			result 		= [],
			promises 	= [];

		// Loop through each adapter
		_.each(self.adapters, function(adapter){

			if( Adapter.isinstanceof(adapter) === false )
				throw new Error('adapter must be an instance of Adapter.');

			// Perform different action on the method type
			switch(settings.type)
			{
				// Creates result objects and uses the default read case to create the store promises.
				case 'create':

					// Convert the results into result objects.
					// This is ignored if an array or object is not passed.
					args[0] = _fn.process_result_objects.call(self, args[0]);

				default:

					// Call the adapter method in context of the adapter object, passing args used on the model.
					result = adapter[method].apply(adapter, args);

					// Create a promise from the result, and add to the promises array
					promises.push(_fn.create_adapter_request_promise(result));

				break;
			}

		});

		return promises;
	}

	/**
	 * Creates an adapter result promise
	 *
	 * @author Josh Smith <josh@customd.com>
	 * @since  0.0.1      Introduced
	 * @date   2016-06-16
	 *
	 * @param  {object}   result     Object or Promise object
	 * @return {object}              Promise object
	 */
	_fn.create_adapter_request_promise = function create_adapter_request_promise(result){

		// Result itself is a promise i.e. from an Ajax request
		if( _.isObject(result) && typeof result.then === 'function' )
		{
			return result;
		}

		// Store the result value inside an immediately resolving promise
		var adapter_promise = new Promise(function(resolve, reject){
			resolve(result);
		});

		return adapter_promise;
	}

	/**
	 * Processes the result of the adapter promises, and handles how data is stored back between interfaces.
	 * Accepts a 'scope' object that captures needed variables from the calling scope.
	 *
	 * @author Josh Smith <josh@customd.com>
	 * @since  0.0.9 	Improved firing of load events when creating result objects from multiple adapter results.
	 * @since  0.0.5	Fixed bug where un-merged array was being returned when Store was the only adapter being used.
	 * @date   2016-06-17
	 *
	 * @param  {array}    results    An array of results, resolved from the Promises
	 * @param  {object}   scope      Scope object.
	 * @return {void}
	 */
	_fn.process_adapter_data = function process_adapter_data(adapter_results, scope){

		var self = this;

		switch(scope.settings.type)
		{
			// Process result objects from multiple adapters for read requests
			case 'read':

				// Pop the results
				adapter_results = adapter_results.pop();

				// We have a direct match in the Store, just resolve the promise with results.
				if( this.adapters.length === 1 )
				{
					// Flatten the array, as we don't need to work with the results of each adapter
					scope.promise.resolve(_.flatten(adapter_results));
				}

				// Store the found results in the other adapters
				else
				{
					var data, promises = [],
						collection_length = adapter_results[0]; // Store collection data length. Always accessible at position zero.

					// Define a callback to read updated information from the store
					var resolve_scope_promise = function(){
						scope.promise.resolve(self.store[scope.method].apply(self.store, scope.args));
					};

					// Merge adapater result data together
					data = _fn.merge_adapter_data.call(self, adapter_results);

					// Detect if we've made any changes to the internal Store array
					// If no changes are made, exit early by resolving the scope promise
					if( data.length <= collection_length ) resolve_scope_promise();

					// Convert the results into result objects.
					// We need to do this here as well, as the results came from another adapter and will be raw objects.
					// We want to store all data as result objects.
					var result_objects = _fn.process_result_objects.call(self, data);

					// Loop through all the adapters in reverse order. This ensures all results end up
					// being saved back into the Store adapter. We keep track of when this is done using promises.
					_.forEachRight(self.adapters, function(adapter){
						var result = adapter.insert_or_update.apply(adapter, [result_objects]); // insert or update
						promises.push(_fn.create_adapter_request_promise(result));
					});

					// Once all found results have been saved back to all tried adapters, load the final result set from
					// the Store adapter. This is guranteed to have the latest result set available, and will be in Result object format.
					Promise.all(promises).then(function(results){ resolve_scope_promise(); });
				}

			break;

			// Process deletion data
			case 'delete':

				adapter_results = adapter_results.pop();

				// We only care about the store deletion results
				var data = adapter_results[0];

				// Loop the deleted data, and fire the on_remove method
				if( _.isArray(data) && data.length > 0 )
				{
					_.each(data, function(o){ o.on_remove(); });
				}
				else if( !_.isArray(data) && _.isObject(data) )
				{
					data.on_remove();
				}

				// Resolve the promise with the deleted data
				return scope.promise.resolve(data);

			break;

			// Process the results from multiple adapters for other requests.
			default:
				scope.promise.resolve(adapter_results);
			break;
		}

		return true;
	}

	/**
	 * Merges a collection of results from adapters into a single collection.
	 *
	 * Merge is based on:
	 *
	 * 	• Keys (defined on model)
	 * 	• Object content
	 * 	• If-modified-since 
	 *
	 * @author Josh Smith <josh@customd.com>
	 * @since  0.0.1      Introduced
	 * @date   2016-06-17
	 *
	 * @param  {array}   data      An array of adapter data
	 * @return {array}             An array of merged adapter data
	 */
	_fn.merge_adapter_data = function merge_adapter_data(data){

		// Base case, entire array is merged? Return it.
		if( data.length === 1 ){ return data.pop(); }

		// Splice the last two segments out of the adapter data array
		var seg = data.splice(-2);

		// Push the merged segments in place of the spliced segment.
		data.push(this.methods.merge(seg[1], seg[0], this.settings.keys));

		// Recursively continue the merge.
		return merge_adapter_data(data);
	}

	/**
	 * Merge two arrays of objects based on the following:
	 *
	 * 	• Colliding primary key
	 * 	• Colliding foreign keys
	 * 	• Modified key value
	 * 	• Created key value
	 *
	 * @author Josh Smith <josh@customd.com>
	 * @since  0.0.2      Updated merge method to copy object properties from new array into the source.
	 * @date   2016-06-18
	 *
	 * @param  {array}   a          Array of objects to be merged
	 * @param  {array}   b          Array of objects to be merged into
	 * @param  {object}  keys       Object of primary and foreign keys
	 * @return {array}              An array of merged objects
	 */
	_fn.merge = function merge(a, b, keys){

		if( !_.isArray(a) || !_.isArray(b) ) return [];

		// Loop through the source array of objects
		_.each(b, function(obj, i){

			// Make sure we have an object with a primary key, before attempting a merge.
			if( _.isObject(obj) && !_.isUndefined(obj[keys.primary]) )
			{
				// Loop the array of new objects
				_.each(a, function(o, j){

					// Make sure this object has a primary key value, and matches the source objects primary key.
					// Note: We do a loose type comparison here, as int vs. string IDs are a pain.
					if( _.isObject(o) && !_.isUndefined(o[keys.primary]) && o[keys.primary] == obj[keys.primary] )
					{
						// Merge the objects and pull from the array of new objects
						// Both these methods mutate the source object/array.
						_.merge(obj, o); _.pullAt(a, j);
					}

					// Detect foreign key constraints here

				});
			}

		});

		return _.flatten([b,a]);
	};

	/**
	 * Define the Model Constructor Function
	 *
	 * @author Josh Smith <josh@customd.com>
	 * @since  0.0.6 Fixed syntax error in plugin versioning
	 * @date   2016-04-18
	 *
	 * @return {function}
	 */
	_fn.model = (function(){

		/**
		 * Define the Model Defaults
		 * @type {object}
		 */
		var	_defaults = {

			settings : {
				keys	 	: {
					primary : 'id',
					foreign : []
				},
				init : false
			},
			methods 	: {
				merge : _fn.merge
			},
			adapters 	: [],
		};

		/**
		 * Constructor Function for the Core Model
		 *
		 * @author Josh Smith <josh@customd.com>
		 * @since  0.0.1      Introduced
		 * @date   2016-04-16
		 *
		 */
		var core = function core(){};

		/**
		 * Core Prototype Object for inherited models.
		 * Maps Adapter interface functions to the model core.
		 *
		 * @author Josh Smith <josh@customd.com>
		 * @since  0.0.12     Updated core prototype to generate direct methods automatically
		 * @since  0.0.1      Introduced
		 * @date   2016-06-16
		 *
		 * @return {object}
		 */
		core.prototype = (function(){

			var adapter_methods = Adapter.interface,
				core_methods 	= {};

			// Setup the link between adapter interface and core methods
			_.each(adapter_methods, function(settings, method){

				// Add an interfaced core method for each adapter.
				core_methods[method] = function(){
					return _fn.integrate_adapter_method.apply(this, [method, settings, arguments]);
				};

				// Add a direct core method for the store adapter
				core_methods[method+'_direct'] = function(){
					var args = Array.prototype.slice.call(arguments);
					return this.store[method].apply(this.store, args);
				};

			});

			return core_methods;

		})(); core.prototype.constructor = core;

		/**
		 * Proprietary Model Constructor
		 * Sets up the basic model definition and provides the prototype link.
		 *
		 * @author Josh Smith <josh@customd.com>
		 * @since  0.0.1      Introduced
		 * @date   2016-04-16
		 *
		 * @param  	{Object}   properties  Properties for the model object
		 * @param  	{Object}   shared 	   Shared protypal properties and method
		 * @return  {Object}   this  	   Model Object
		 */
		Model = function Model(properties, shared, data)
		{
			// Get the prototype link
			var self = this, _proto_ = Object.getPrototypeOf(this);

			// Assign default properties to this Model object
			_fn.assign_properties(_defaults, this);

			// Assign configurable properties to this Model object
			_fn.assign_properties(properties, this);

			// Assign the prototypal properties
			_fn.assign_properties(shared, _proto_);

			/**
			 * Setup the default Adapter
			 * @type {object}
			 */
			this.store = Adapter.Store();

			// Add the store adapter as the first
			this.adapters.unshift(this.store);

			// Add the same settings to each adapter
			_.each(this.adapters, function(adapter){
				adapter.set_settings({
					keys 	: self.settings.keys,
					methods : {
						merge : _fn.merge
					}
				});
			});

			// Add the constructor data to a collection
			if( ! _.isUndefined(data) ) this.insert(data);

			return this;
		}

		// Set the Model prototype and constructor
		Model.prototype = Object.create(core.prototype);
		Model.prototype.constructor = Model;

		/**
		 * Polymorphic method that extends Model and returns a Model object.
		 *
		 * @author Josh Smith <josh@customd.com>
		 * @since  0.0.1      Introduced
		 * @date   2016-04-15
		 *
		 * @param  {object}   properties   Properties to set on the Model object.
		 * @param  {object}   shared   	   Properties to share across all model objects.
		 * @return {object}    			   Model Object
		 */
		var extend = function extend(properties, shared){

			// Create the shimmed object
			var shim 	= _fn.shim(Model, properties, shared),
				events 	= {};

			// Create the shim's prototype and set the constructor.
			shim.prototype = Object.create(Model.prototype);
			shim.prototype.constructor = shim;

			/**
			 * Custom Events trigger initialiser
			 *
			 * @author Josh Smith <josh@customd.com>
			 * @since  0.0.1      Introduced
			 * @date   2016-06-16
			 *
			 * @param  {string}   event      Event type to subscribe to
			 * @param  {Function} callback   Callback to run on event
			 * @return {void}
			 */
			shim.prototype.on = function(event, callback){
				return events[event] = callback;
			}

			/**
			 * Custom Events trigger method
			 *
			 * @author Josh Smith <josh@customd.com>
			 * @since  0.0.1      Introduced
			 * @date   2016-06-16
			 *
			 * @param  {string}   event      Event to be called
			 * @param  {array}    args       Arguments to be passed
			 * @return {mixed}
			 */
			shim.prototype.trigger = function(event, args){

				if( _.isFunction(events[event]) )
				{
					return events[event].apply(this, args);
				}

				return undefined;
			}

			return shim;
		};

		return {

			/**
			 * Internal version of this plugin
			 * @type {string}
			 */
			version : plugin.version,

			/**
			 * Author of this plugin
			 * @type {string}
			 */
			author 	: plugin.author,

			/**
			 * Priviliged method definition
			 * @type {Function}
			 */
			extend 	: extend

		};

	})();

	/**
	 * Returns whether the passed model is an instance of Model
	 *
	 * @author Josh Smith <josh@customd.com>
	 * @since  0.0.1      Introduced
	 * @date   2016-04-19
	 *
	 * @param  {object}   model      Model Object
	 * @return {boolean}             True or False
	 */
	_fn.model.isinstanceof = function isinstanceof(model){
		return model instanceof Model;
	};

	/**
	 * Define the Result Object Constructor
	 *
	 * @author Josh Smith <josh@customd.com>
	 * @since  0.0.11 Updated result prototype with on_load and on_remove methods.
	 * @since  0.0.6 Fixed syntax error in plugin versioning
	 * @date   2016-04-18
	 *
	 * @return {function}
	 */
	_fn.result = (function(){

		/**
		 * Constructor function for the Core prototype
		 *
		 * @author Josh Smith <josh@customd.com>
		 * @since  0.0.1      Introduced
		 * @date   2016-04-18
		 *
		 */
		var core = function core(){};

		/**
		 * Core Prototype
		 * @type {object}
		 */
		core.prototype = (function(){

			return {

				/**
				 * Fired when a result object is inserted into a collection
				 *
				 * @author Josh Smith <josh@customd.com>
				 * @since  1.0.0      Introduced
				 * @date   2016-06-21
				 *
				 * @return {void}
				 */
				on_load : function on_load(){},

				/**
				 * Fired when a result object is removed from a collection
				 *
				 * @author Josh Smith <josh@customd.com>
				 * @since  1.0.0      Introduced
				 * @date   2016-06-21
				 *
				 * @return {void}
				 */
				on_remove : function on_remove(){},

				/**
				 * Returns a string representation of this object
				 *
				 * @author Josh Smith <josh@customd.com>
				 * @since  0.0.1      Introduced
				 * @date   2016-04-18
				 *
				 * @return {string}   Object Representation
				 */
				toString : function toString(){
					return JSON.stringify(this);
				},

				/**
				 * Returns a plain object representation of the result object
				 *
				 * @author Josh Smith <josh@customd.com>
				 * @since  0.0.4 Added valueOf method
				 * @date   2016-06-19
				 *
				 * @return {[type]}   [description]
				 */
				valueOf : function valueOf(){

					var values = {};

					for(var prop in this)
					{
						if( this.hasOwnProperty(prop) )
						{
							values[prop] = this[prop];
						}
					}

					return values;
				}

			};

		})();

		/**
		 * Core prototype constructor
		 * @type {function}
		 */
		core.prototype.constructor = core;

		/**
		 * Proprietary Result Object Constructor Function
		 *
		 * @author Josh Smith <josh@customd.com>
		 * @since  0.0.1      Introduced
		 * @date   2016-04-18
		 *
		 * @param  {object}   properties An object of properties (unused in this method, but kept for API consistency)
		 * @param  {object}   shared     An object of prototypal properties
		 * @param  {object}   data 		 An object of result properties
		 */
		Result = function Result(properties, shared, data){

			// Get the prototype link
			var _proto_ = Object.getPrototypeOf(this);

			// Assign the data to properties, as these are the result properties.
			properties = data;

			// Assign the data properties
			_fn.assign_properties(properties, this);

			// Assign the prototypal properties
			_fn.assign_properties(shared, _proto_);

			return this;
		};

		/**
		 * Set the Result objects prototype and constructor
		 * @type {object}
		 */
		Result.prototype = Object.create(core.prototype);
		Result.prototype.constructor = Result;

		/**
		 * Polymorphic method that extends CD_Result and returns a Result object.
		 *
		 * @author Josh Smith <josh@customd.com>
		 * @since  0.0.1      Introduced
		 * @date   2016-04-18
		 *
		 * @param  {object}   shared     An object of prototypal properties
		 * @return {object}              Result object
		 */
		var _extend = function extend(shared){

			// Create the shimmed object
			var shim = _fn.shim(Result, {}, shared);

			// Create the shim's prototype and set the constructor.
			shim.prototype = Object.create(Result.prototype);
			shim.prototype.constructor = shim;

			return shim;
		};

		return {

			/**
			 * Internal version of this plugin
			 * @type {string}
			 */
			version : plugin.version,

			/**
			 * Author of this plugin
			 * @type {string}
			 */
			author 	: plugin.author,

			/**
			 * Priviliged method definition.
			 * Allows access to the internal extend method.
			 * @type {Function}
			 */
			extend 	: _extend

		};

	})();

	/**
	 * Returns whether the passed model is an instance of Result
	 *
	 * @author Josh Smith <josh@customd.com>
	 * @since  0.0.1      Introduced
	 * @date   2016-04-19
	 *
	 * @param  {object}   result      Result Object
	 * @return {boolean}             True or False
	 */
	_fn.result.isinstanceof = function isinstanceof(result){
		return result instanceof Result;
	};


	// Scope this plugin to the global object
	window[plugin.model.name] 	= _fn.model;
	window[plugin.result.name] 	= _fn.result;

})();