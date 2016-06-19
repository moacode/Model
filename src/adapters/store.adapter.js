(function(){

	"use strict";

	/**
	 * Implements the default Store adapter
	 *
	 * @author Josh Smith <josh@customd.com>
	 * @since  0.0.1      Introduced
	 * @date   2016-06-15
	 *
	 * @param  {object}		Settings
	 * @param  {function}	Implementation
	 * @return {object}     Adapter method implementation
	 */
	Adapter.Store = Adapter.extend(function(settings, parent){

		var _internal = [];

		return {

			name : 'Store',

			/**
			 * Overrides the default interface set method
			 *
			 * @author Josh Smith <josh@customd.com>
			 * @since  0.0.1      Introduced
			 * @date   2016-04-19
			 *
			 * @param  {mixed} data  Data to insert
			 */
			insert : function insert(data){
				return parent.insert.call(this, _internal, data) || {};
			},

			/**
			 * Inserts or updates data within the collection
			 *
			 * @author Josh Smith <josh@customd.com>
			 * @since  0.0.1      Introduced
			 * @date   2016-06-19
			 *
			 * @param  {array}   data       An array of objects
			 * @return {[type]}             [description]
			 */
			insert_or_update : function(data){
				return parent.insert_or_update.apply(this, [_internal, data]) || [];
			},

			/**
			 * Updates an object in the collection with the passed data
			 *
			 * @author Josh Smith <josh@customd.com>
			 * @since  0.0.1      Introduced
			 * @date   2016-06-19
			 *
			 * @param  {array}     collection  Data collection
			 * @param  {object}    data        Data to update with
			 * @param  {integer}   id          ID of the object to update
			 * @return {boolean}
			 */
			update : function update(data, id){
				return parent.update.apply(this, [_internal, data, id]) || {};
			},

			update_where : function update_where(data, where){
				return parent.update_where.apply(this, [_internal, data, where]) || [];
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
				var result = parent.get.apply(this, [_internal, id]);
				return _.isArray(result) && result.length === 0 ? {} : result;
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
				return parent.get_where.apply(this, [_internal, where, order, limit]) || [];
			},

		};

	});

})();