var express = require('express'),
    ejs = require('ejs'),
    redis = require('redis'),
    models = require('./models/models'),
    settings = require('./settings');

var app = express.createServer();

var port = process.env.PORT || settings.port || 8080;    


var rc = redis.createClient();

models.Backbone.setClient(rc);	// Set redis connection for Backbone store to share DB connection (instead of using a second instance)
models.Backbone.initServer(app);
models.Backbone.debug = (settings.env == "development");

console.log("Debug mode:" + models.Backbone.debug);

/**************** SETUP SERVER **************/

app.configure(function(){
	app.set('port', port);
	app.set('view engine', 'ejs');
	app.set('view options', { layout: false });
	app.use(express.bodyParser());
});

app.configure('development', function() {
	app.use(express.errorHandler({
		dumpExceptions: true,
		showStack: true
	}));
});

app.configure('production', function() {
	app.use(express.errorHandler());
});

/**************** ROUTING **************/

app.get('/models/models.js', function(req, res){
	res.sendfile('./models/models.js');
});

app.get('/js/*.js', function(req, res){
	res.sendfile('./'+req.url);
});

app.get('/', function(req, res, params) {
	var user1 = new models.User();
	var user2 = new models.User();
	user1.save({name: "Sample User 1"},{success: function(model1) {
		user2.save({name: "Sample User 2"},{success: function(model2) {
			models.Backbone.search(models.User,"*",function(data) {
				var users = new models.UsersCollection(data);
				var wrapper = new models.Wrapper({users: users});
				res.render('index', {user1: model1, user2: model2, wrapper:wrapper});
			});
		}});
	}});
});

app.get('/cleanup', function(req, res) {
	models.Backbone.search_delete(models.User,"*",function(result) {
		res.render('cleaned');
	});
});


app.listen(port);