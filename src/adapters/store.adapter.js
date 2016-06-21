/**
 * Store Adapter
 * Implements the default adapter. Model is dependant on this adapter.
 *
 * @author 	Josh Smith <josh@customd.com>
 * @version 0.0.2
 * @date   	2016-06-19
 *
 * @since  0.0.2 	Updated comments and method ordering
 * @since  0.0.1 	Introduced
 *
 */

(function(){

	"use strict";

	/**
	 * Implements the default Store adapter
	 *
	 * @author Josh Smith <josh@customd.com>
	 * @since  0.0.2 	  Updated comments and method ordering
	 * @since  0.0.1      Introduced
	 * @date   2016-06-15
	 *
	 * @param  {object}		Settings
	 * @param  {function}	Implementation
	 * @return {object}     Adapter method implementation
	 */
	Adapter.Store = Adapter.extend(function(settings, parent){

		var collection = [];

		return {

			name : 'Store',

			/**
			 * @extends 	{Adapter}
			 * @implements 	{insert}
			 */
			insert : function insert(data){
				return parent.insert.call(this, collection, data) || {};
			},

			/**
			 * @extends 	{Adapter}
			 * @implements 	{insert_or_update}
			 */
			insert_or_update : function(data){
				return parent.insert_or_update.apply(this, [collection, data]) || [];
			},

			/**
			 * @extends 	{Adapter}
			 * @implements 	{get}
			 */
			get : function get(id){
				var result = parent.get.apply(this, [collection, id]);
				return _.isArray(result) && result.length === 0 ? {} : result;
			},

			/**
			 * @extends 	{Adapter}
			 * @implements 	{get_where}
			 */
			get_where : function get_where(where, order, limit){
				return parent.get_where.apply(this, [collection, where, order, limit]) || [];
			},

			/**
			 * @extends 	{Adapter}
			 * @implements 	{get_all}
			 */
			get_all : function get_all(order, limit){
				return parent.get_all.apply(this, [collection, order, limit]) || [];
			},

			/**
			 * @extends 	{Adapter}
			 * @implements 	{update}
			 */
			update : function update(data, id){
				return parent.update.apply(this, [collection, data, id]) || {};
			},

			/**
			 * @extends 	{Adapter}
			 * @implements 	{update_where}
			 */
			update_where : function update_where(data, where){
				return parent.update_where.apply(this, [collection, data, where]) || [];
			},

			/**
			 * @extends 	{Adapter}
			 * @implements 	{delete}
			 */
			delete : function(id){
				var result = parent.delete.apply(this, [collection, id]);
				return _.isArray(result) && result.length === 0 ? {} : result;
			},

			/**
			 * @extends 	{Adapter}
			 * @implements 	{delete_where}
			 */
			delete_where : function delete_where(where, limit){
				return parent.delete_where.apply(this, [collection, where, limit]) || [];
			},

			/**
			 * @extends 	{Adapter}
			 * @implements 	{delete_all}
			 */
			delete_all : function delete_all(){
				return parent.delete_all.apply(this, [collection]) || [];
			}

		};

	});

})();