(function () {
    var server = false, models;
    if (typeof exports !== 'undefined') {
        Backbone = require('../../../server-backbone-redis');

        models = exports;
        server = true;

    } else {
        models = this.models = {};
    }

	models.Backbone = Backbone;
	
    //
    //models
    //
	models.User = Backbone.Model.extend({
		defaults: {
			"id":		null,
			"name":		null,
			"entry":        null
		},
		initialize: function() {
			var time = new Date();
			if (!this.get("entry"))
				this.set({entry: time});
		},
		name: "testuser"
	});

	models.UsersCollection = Backbone.Collection.extend({
	    model: models.User
	});

	models.Wrapper = Backbone.Model.extend({});
	


})()
