(function () {

var fs = require('fs');


var defaultListeners;
var server;

utils = exports;


utils.hasProperty = function (obj, prop) {
	return Object.prototype.hasOwnProperty.call(Object(obj), prop);
};

utils.fileCache = null;

utils.initServer = function (http,serverOptions) {
  server = http;

  defaultListeners = server.listeners('request');
  options = serverOptions || {};
  if (!options.selfServe) {
    server.removeAllListeners('request');
    server.on('request', publicResponseHandler);
  }
};

var publicResponseHandler = function (request, response) {
  var i;
  if (request.method === 'GET') {

    if (request.url.split('?')[0] === '/sbr/backbone-exp-imp.js') {
      serveFile(__dirname.substring(0,__dirname.length-3) + 'public/backbone-exp-imp.js', request, response);
    } else {
      // Make sure default listeners are still handled
      for (i in defaultListeners) {
        defaultListeners[i].call(server, request, response);
      }
    }
  } else {
    for (i in defaultListeners) {
      // Make sure default listeners are still handled
      defaultListeners[i].call(server, request, response);
    }
  }
};

var serveFile = function (filename, request, response) {
	console.log(filename);
	if (utils.fileCache) {
		response.writeHead(200);
		response.write(utils.fileCache);
		response.end();
	} else {
		fs.readFile(filename, function (err, data) {
			var text = data.toString();
			response.writeHead(200);
			response.write(text);
			response.end();
			utils.fileCache = text;
		});
	}
};

})()