var photos_model;
(function(){

	var Photos_Model = Model.extend({
		settings : {
			keys : {
				primary : 'id',
			},
		},
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

		var $photos_list = $('.js__photos'); $photos_list.empty();

		_.each(photos, function(photo){
			$('.js__photos').append('<li><figure>'+photo.get_img_src_html()+'<figcaption>'+photo.title+'</figcaption></figure></li>');
		});

	});


})();