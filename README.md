Copyright (c) 2011 Jerome Paradis

# Wiki

	Documentation: https://github.com/JeromeParadis/server-backbone-redis/wiki

# Dependencies

	npm install underscore
	npm install backbone
	npm install redis

# Install

	npm install server-backbone-redis
	
# MIT License

# Disclaimer / To Do

* Use at your own risk
* Some code is redundant. Some cleanup to do.
* Haven't tested for Redis injection vulnerability. Sanitize/check IDs on server before doing any fetch/create, etc.
* It was created to do everything on the server and push some updates to the client through socket.io. Could add some express routes and backbone.js code on client-side to make calls from the client.
* No Redis pub/sub features