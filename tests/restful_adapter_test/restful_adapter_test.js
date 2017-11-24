var photos_model;
(function(){

	var $photos_list = $('.js__photos');

	var Photos_Model = Model.extend({
		adapters : [
			Adapter.Restful({
				endpoint 	: 'http://jsonplaceholder.typicode.com/photos',
				attribute 	: null,
				attributes 	: {
					sort  : '_sort',
					order : '_order',
					limit : '_limit'
				},
				prefetch 	: false,
				io 			: ['r']
			})
		]
	}, {
		result_model : Result.extend({

			on_load : function on_load(){
				var $el = $('<li><figure>'+this.get_img_src_html()+'<figcaption>'+this.title+'</figcaption></figure></li>').appendTo($photos_list);
				this.$el = $el;
			},

			on_remove : function on_remove(){
				this.$el.fadeOut().promise().done(function(){
					$(this).remove();
				});
			},

			get_img_src_html: function get_img_src_html(){
				return '<img src="'+this.get_thumbnail_url()+'"></img>';
			},
			get_thumbnail_url: function get_thumbnail_url(){
				return this.thumbnailUrl;
			}
		})
	});

	// Initialise a Users Model instance.
	photos_model = new Photos_Model();

	photos_model.get_where({albumId: 85}, {sort : 'title', order : 'ASC'}, 10).then(function(photos){
		$photos_list.find('span').remove();
	});


})();