var users_model;
(function(){

	var Users_Model = Model.extend({
		settings : {
			keys : {
				primary : 'user_id',
			},
		}
	}, {
		result_model : Result.extend({
			say_hello : function say_hello(){
				return this.fullname + ' says hello.';
			},
			get_age : function get_age(){
				return 'I am ' + this.age + ' years old.';
			},
			get_fullname : function get_fullname(){
				return this.fullname;
			},
			get_status_color : function get_status_color(){
				return this.status === 'active' ? 'green' : 'red';
			}
		})
	});

	// Initialise a Users Model instance.
	users_model = new Users_Model();

	// Create an event handler to increment the number of users added
	users_model.on('add', function(item){
		var $users_count = $('.js__number_users_added');
		var number_added = parseInt($users_count.text())+1;
		$users_count.text(number_added);
	});

	// Insert users into the collection. Note: This can also be done on model initialisation
	users_model.insert([
		{user_id: 1, fullname: 'Melvin Gallagher', age: 32, occupation: 'Construction Worker', status: 'active'},
		{user_id: 2, fullname: 'Tanek Herman', age: 24, occupation: 'Digger Driver', status: 'inactive'},
		{user_id: 3, fullname: 'Reagan Ruiz', age: 50, occupation: 'Project Manager', status: 'active'},
		{user_id: 4, fullname: 'Xena Rivers', age: 33, occupation: 'Receptionist', status: 'active'},
		{user_id: 5, fullname: 'Bevis Gentry', age: 42, occupation: 'Accountant', status: 'active'},
		{user_id: 6, fullname: 'Ursa Espinoza', age: 48, occupation: 'Janitor', status: 'inactive'}
	]);

	// Get all users, then write names to a list.
	users_model.get_all().then(function(users){
		users.forEach(function(user){
			$('.js__all_users').append('<li>'+user.get_fullname()+'</li>');
		});
	});

	// Get all active users, then write names to a list.
	users_model.get_where({status: 'active'}).then(function(users){
		users.forEach(function(user){
			$('.js__active_users').append('<li><span style="color:'+user.get_status_color()+';">'+user.get_fullname()+'</span></li>');
		});

		// Get a random active user
		var rand = Math.floor((Math.random() * 4) + 1)-1;
		$('.js__employee_of_the_month').text(users[rand].get_fullname());
	});

	// Get all inactive users, then write names to a list.
	users_model.get_where({status: 'inactive'}).then(function(users){
		users.forEach(function(user){
			$('.js__inactive_users').append('<li><span style="color:'+user.get_status_color()+';">'+user.get_fullname()+'</span></li>');
		});
	});


})();