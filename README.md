# Documentation

* [Wiki](https://github.com/JeromeParadis/server-backbone-redis/wiki)

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