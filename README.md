# Documentation

* [Wiki](https://github.com/JeromeParadis/server-backbone-redis/wiki)
* or at the bottome of this README

# Dependencies

	npm install underscore
	npm install backbone
	npm install redis

# Install (coming soon to NPM once I upload examples and tests from another project)

Not just yet!!

	npm install server-backbone-redis
	
# MIT License

Copyright (c) 2011 Jerome Paradis

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.


# Thanks
 
* xport()/mport() code taken from this fine article: http://andyet.net/blog/2011/feb/15/re-using-backbonejs-models-on-the-server-with-node/

# Disclaimer / To Do

* Use at your own risk
* Some code is redundant. Some cleanup to do.
* Haven't tested for Redis injection vulnerability. Sanitize/check IDs on server before doing any fetch/create, etc.
* It was created to do everything on the server and push some updates to the client through socket.io. Could add some express routes and backbone.js code on client-side to make calls from the client.
* No Redis pub/sub features

# Howto

## Documentation

This module does two things:

* sharing of models through server and client for a single code base
* using Redis on the server-side as a data store to Backbone

## Backbone Models
You can share your Backbone models for a single definition on the server and the client. Example of a ./models/models.js file. It uses CommonJS to include the right stuff when included in a node application. On the server side and client side, you will always use models.Backbone instead of Backbone.

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

## New JSON export/import model methods (available on server and client)
### xport()
Exports object to JSON.
### mport()
Import data into object from JSON.
EJS example:

    var user1 = new models.User();
    user1.mport('<%- user1.xport() %>');
    

## New server-side Backbone properties/methods
### setClient(rc)
Setup Redis client to avoid creating a second Redis connection.
### initServer(app)
Setup a connect/express app with a handler to add a new server route the xport/mport script to the client. Script can be then include on the client:
    <script type="text/javascript" src="/sbr/backbone-exp-imp.js"></script> 
### debug
Set this property to true to show debugging information.

## Typical usage on the server:
Once your models.js file is defined like above to include the server-side redis stuff. You simply include your models:

    var models = require('./models/models');
You can access Backbone through models.Backbone.


## Typical includes on the client:

    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.5.1/jquery.min.js"></script> 
    <script type="text/javascript" src="http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.1.7/underscore-min.js"></script> 
    <script type="text/javascript" src="http://cdnjs.cloudflare.com/ajax/libs/backbone.js/0.5.1/backbone-min.js"></script> 
    <script type="text/javascript" src="/models/models.js"></script> 
    <script type="text/javascript" src="/sbr/backbone-exp-imp.js"></script> 


