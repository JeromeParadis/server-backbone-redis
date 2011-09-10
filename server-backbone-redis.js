(function () {
        _ = require('underscore')._;
        Backbone = require('backbone');
        redis = require('redis');
        utils = require('./lib/utils.js');
        
        BackboneExpImp = require('./public/backbone-exp-imp.js');
        BackboneServer = exports;
	Backbone.Model.prototype.xport = BackboneExpImp.xport;
	Backbone.Model.prototype.mport = BackboneExpImp.mport;

	
	var BackboneServer;
	BackboneServer.VERSION = "0.0.1";
	
	var bbred = {};
	bbred.rc = null;
	bbred.setClient = function(client) {
		bbred.rc = client;
	};
	
	bbred.debug = false;
	bbred.initServer = utils.initServer;
	bbred.search = function(model,keypattern,cb,cb_err) {
		if (!bbred.rc)
			bbred.rc = redis.createClient();
		var rc = bbred.rc;
		
		model_name = new model().name;
		if (bbred.debug)
			console.log("SEARCHING for :" + model_name + keypattern);
		rc.keys(model_name + ":" + keypattern, function (error, replies) {
			if (replies && replies.length > 0) {
				if (bbred.debug)
					console.log("GETTING " + JSON.stringify(replies));
				rc.mget(replies, function(err,results) {
					if (!err) {
						var models = new Array();
						if (results) {
							results.forEach(function (reply, i) {
								var m = new model();
								m.mport(reply);
								models[i] = m;
							});
						}
						cb && cb(models);
					}
					else {
						cb_err && cb_err(err);
					}
				});
			}
			else {
				if (error)
					cb_err && cb_err(err);
				else
					cb && cb(new Array());
			}
		    });
		
	};

	bbred.search_delete = function(model,keypattern,cb,cb_err) {
		if (!bbred.rc)
			bbred.rc = redis.createClient();
		var rc = bbred.rc;

		model_name = new model().name
		rc.keys(model_name + ":" + keypattern, function (error, replies) {
			if (replies && replies.length > 0) {
				rc.del(replies, function(err,results) {
					if (results) {
						cb && cb(results);
					}
					else {
						if (err)
							cb_err && cb_err(err);
						else
							cb && cb("0");
					}
				});
			}
			else {
				if (error)
					cb_err && cb_err(err);
				else
					cb && cb("0");
			}
		    });
	};

	
	Backbone.sync = function(method, model, options) {

	  var model_name = model.name;
	  var model_expiration = model.expiration;
	  if (bbred.debug)
	  	console.log("MODEL: " + model_name)
	  if (!bbred.rc)
		bbred.rc = redis.createClient();
	  var rc = bbred.rc;
	  if (bbred.debug)
	  	console.log("METHOD: " + method);
	  switch (method) {
	    case "read":
	    	if (bbred.debug)
			console.log("READ: " + JSON.stringify(model))
		if (model.id) {
			var key = model.name + ":" + model.id;
			if (bbred.debug)
				console.log("GET RESULT:" + rc.get(key));
			rc.get(model.name + ":" + model.id,function(err,reply) {
				if (bbred.debug)
					console.log("GET REPLY: " + reply);
				if (reply) {
					model.mport(reply);
					options.success(model);
				}
				else {
					if (bbred.debug)
						console.log("FETCH ERROR");
					options.error(err);
				}
			});
		}
		else { // collection
			model_name = new model.model().name
			rc.keys(model_name + ":*", function (error, replies) {
				// TODO: check for empty replies or error
			        rc.mget(replies, function(err,results) {
			        	var models = new Array();
			        	if (results) {
			        		if (bbred.debug)
							console.log("nb items: " + results.length);
						results.forEach(function (reply, i) {
							if (bbred.debug)
								console.log("Item " + i + ": " + results[i]);
							var m = new model.model();
							m.mport(reply);
							models[i] = m;
						});
						if (bbred.debug)
							console.log("All " + model_name + "s: " + results);
					}
					options.success(models);
				});
			    });
		}
	 	break;
	    case "create": 
		rc.incr("next." + model_name + ".id",function(err,reply) {
			if (reply) {
				var id = parseInt(reply);
				model.id = model.attributes.id = id;
				if (bbred.debug)
					console.log("ID = " + id + " object:" + model.xport());
				if (model_expiration) {
					rc.setex(model_name + ":" + model.id,model_expiration,model.xport(),function(e,r) {
						if (bbred.debug) {
							console.log("SET REPLY: " + r);
							console.log("SET ERROR: " + e);
						}
						if (r) {
							// TODO: CLONE!!!
							options.success(model);
						}
						else {
							if (bbred.debug)
								console.log("SYNC ERROR: " + e);
							options.error(e);
						}
					});					
				}
				else {
					rc.set(model_name + ":" + model.id,model.xport(),function(e,r) {
						if (bbred.debug) {
							console.log("SET REPLY: " + r);
							console.log("SET ERROR: " + e);
						}
						if (r) {
							// TODO: CLONE!!!
							options.success(model);
						}
						else {
							if (bbred.debug)
								console.log("SYNC ERROR: " + e);
							options.error(e);
						}
					});
					
				}
			}
			else {
				if (bbred.debug)
					console.log("INCR ERROR");
				options.error(err);
			}
		});
	 	break;
	    case "update":
	    	if (bbred.debug)
			console.log("UPDATE ID = " + model.id + " object:" + model.xport());
		if (model_expiration) {
			rc.setex(model_name + ":" + model.id,model.expiration,model.xport(),function(e,r) {
				if (r) {
					// TODO: CLONE!!!
					options.success(model);
				}
				else {
					if (bbred.debug)
						console.log("SYNC ERROR: " + e);
					options.error(e);
				}
			});
		}
		else {
			rc.set(model_name + ":" + model.id,model.xport(),function(e,r) {
				if (r) {
					// TODO: CLONE!!!
					options.success(model);
				}
				else {
					if (bbred.debug)
						console.log("SYNC ERROR: " + e);
					options.error(e);
				}
			});			
		}
	 	break;
	    case "delete":
		rc.del(model_name + ":" + model.id,function(e,r) {
			if (r) {
				if (bbred.debug)
					console.log("DEL SUCCESS: " + r);
				options.success(model);
			}
			else {
				if (bbred.debug)
					console.log("DEL ERROR: " + e);
				options.error(e);
			}
		});
	 	break;
	  }

	};
	_.extend(BackboneServer,Backbone);
	if (bbred.debug)
		console.log(BackboneServer);
	_.extend(BackboneServer,bbred);

})()