var testCase = require('nodeunit').testCase;
var Backbone = require('../server-backbone-redis')
var async = require('async');

var rc = redis.createClient();

module.exports = testCase({
    setUp: function (callback) {
	this.models = {};
	this.models.Backbone = Backbone;
	this.models.TestChatMessage = Backbone.Model.extend({
		defaults: {
			"user":		null,
			"message": 	null
		},
		name: "testchat"
	});
	this.models.TestVolatile = Backbone.Model.extend({
		defaults: {
			"user":		null,
			"message": 	null
		},
		name: "testvol",
		expiration: 1 // 1 second expiration
	});
	this.models.TestChatMessageCollection = Backbone.Collection.extend({
	    model: this.models.TestChatMessage
	});
        callback();
    },
    tearDown: function (callback) {
        // clean up
        callback();
    },
    testSetClient: function (test) {
	test.expect(1);
        test.ok(Backbone.setClient(rc), 'setClient failed().');
        test.done();
    },
    testCreateRecords: function (test) {
	test.expect(9);
	var chat1 = new this.models.TestChatMessage({user: 1, message:'Test 1'});
	test.equal(chat1.xport(),'{"id":null,"cid":"c0","attrs":{"user":1,"message":"Test 1"}}');
	var chat2 = new this.models.TestChatMessage({user: 2, message:'Test 2'});
	test.equal(chat2.xport(),'{"id":null,"cid":"c1","attrs":{"user":2,"message":"Test 2"}}');
	var chat3 = new this.models.TestChatMessage({user: 1, message:'Test 3'});
	test.equal(chat3.xport(),'{"id":null,"cid":"c2","attrs":{"user":1,"message":"Test 3"}}');
	async.series(
		[async.apply(function(cb) {
			chat1.save({},{success: function(model) {
				test.ok(parseInt(model.get("id")) > 0,'ID attribute not created.');
				test.ok(parseInt(model.id) > 0, 'ID object not created.');
				cb(null,1);
				}, error: function(err) {
					cb("Error saving chat1",1);
			}});
		}),
		async.apply(function(cb) {
			chat2.save({},{success: function(model) {
				test.ok(parseInt(model.get("id")) > 0,'ID attribute not created.');
				test.ok(parseInt(model.id) > 0, 'ID object not created.');
				cb(null,2);
				}, error: function(err) {
					cb("Error saving chat2",2);
			}});
		}),
		async.apply(function(cb) {
			chat3.save({},{success: function(model) {
				test.ok(parseInt(model.get("id")) > 0,'ID attribute not created.');
				test.ok(parseInt(model.id) > 0, 'ID object not created.');
				cb(null,3);
				}, error: function(err) {
					cb("Error saving chat3",3);
			}});
		})

		],function(err,results) {
			if (err) {
				throw new Error("Unexpected error running tests: " + err);
			}
			test.done();
		}
	);
    },
    testSaveIdLoadRecords: function (test) {
	var models = this.models;
	test.expect(10);

	async.series(
		[async.apply(function(cb) {
			Backbone.search_delete(models.TestChatMessage,"*",function(results) {
					test.ok(parseInt(results) > 0,'Could not cleanup records.');
					cb(null,1);
				},function(err) {
				cb("Error saving chat1",1);
			});
		}),async.apply(function(cb) {
			var chat1 = new models.TestChatMessage({id:"test1",user: 1, message:'Test 1'});
			chat1.save({id:"test1"},{success: function(model) {
				test.equal(model.get("id"),"test1",'ID attribute not created.');
				test.equal(model.id,"test1", 'ID object not created.');
				cb(null,1);
				}, error: function(err) {
					cb("Error saving chat1",1);
			}});
		}),async.apply(function(cb) {
			var chat1 = new models.TestChatMessage({id: "test1"});
			chat1.fetch({success: function(model) {
				test.equal(parseInt(model.get("user")),1,"test1",'No the right record.');
				test.equal(model.id,"test1",'No the right record.');
				test.equal(model.get('message'),"Test 1", 'Not the right record.');
				cb(null,2);
				}, error: function(err) {
					cb("Error saving chat1",2);
			}});
		}),async.apply(function(cb) {
			var chat2 = new models.TestChatMessage({id:"test2",user: 2, message:'Test 2'});
			chat2.save({id:"test2"},{success: function(model) {
				test.equal(model.get("id"),"test2",'ID attribute not created.');
				test.equal(model.id,"test2", 'ID object not created.');
				cb(null,1);
				}, error: function(err) {
					cb("Error saving chat2",1);
			}});
		}),async.apply(function(cb) {
			var chat3 = new models.TestChatMessage({id:"test3",user: 1, message:'Test 3'});
			chat3.save({id:"test3"},{success: function(model) {
				test.equal(model.get("id"),"test3",'ID attribute not created.');
				test.equal(model.id,"test3", 'ID object not created.');
				cb(null,1);
				}, error: function(err) {
					cb("Error saving chat3",1);
			}});
		})
		],function(err,results) {
			if (err) {
				throw new Error("Unexpected error running tests: " + err);
			}
			test.done();
		}
	);
    },testBulkLoadRecords: function (test) {
	var models = this.models;
	test.expect(4);

	async.series(
		[async.apply(function(cb) {
			var chats = new models.TestChatMessageCollection();
			chats.fetch({success: function(results) {
				test.equal(results.length,3,"Incorrect number of records found.");
				cb(null,1);
				}, error: function(err) {
					cb("Error loading chats",1);
			}});
		}),async.apply(function(cb) {
			Backbone.search(models.TestChatMessage,"test1",function(results) {
				test.equal(results.length,1,"Incorrect number of records found.");
				cb(null,2);
				}, function(err) {
					cb("Error loading chat",2);
			});
		}),async.apply(function(cb) {
			Backbone.search(models.TestChatMessage,"*",function(results) {
				test.equal(results.length,3,"Incorrect number of records found.");
				cb(null,3);
				}, function(err) {
					cb("Error loading chat",3);
			});
		}),async.apply(function(cb) {
			Backbone.search_delete(models.TestChatMessage,"*",function(deleted) {
				test.equal(parseInt(deleted),3,"Incorrect number of records deleted.");
				cb(null,3);
				}, function(err) {
					cb("Error cleaning up",3);
			});
		})
		],function(err,results) {
			if (err) {
				throw new Error("Unexpected error running tests: " + err);
			}
			test.done();
		}
	);
    },testUpdates: function (test) {
	var models = this.models;
	test.expect(7);
	
	var chat1 = new models.TestChatMessage({id:"test1",user: 1, message:'Test 1'});
	async.series(
		[async.apply(function(cb) {
			chat1.save({id:"test1"},{success: function(model) {
				test.equal(model.get("id"),"test1",'ID attribute not created.');
				test.equal(model.id,"test1", 'ID object not created.');
				cb(null,1);
				}, error: function(err) {
					cb("Error saving chat1",1);
			}});
		}),async.apply(function(cb) {
			chat1.save({message:"Test 1 Updated"},{success: function(model) {
				test.equal(model.get('message'),"Test 1 Updated", 'Not the right record.');
				cb(null,2);
				}, error: function(err) {
					cb("Error updating chat1",2);
			}});
		}),async.apply(function(cb) {
			var chat_s = new models.TestChatMessage({id: "test1"});
			chat_s.fetch({success: function(model) {
				test.equal(parseInt(model.get("user")),1,"test1",'No the right record.');
				test.equal(model.id,"test1",'Not the right record.');
				test.equal(model.get('message'),"Test 1 Updated", 'Not the right record.');
				cb(null,2);
				}, error: function(err) {
					cb("Error saving chat1",3);
			}});
		}),async.apply(function(cb) {
			Backbone.search_delete(models.TestChatMessage,"*",function(deleted) {
				test.equal(parseInt(deleted),1,"Incorrect number of records deleted.");
				cb(null,3);
				}, function(err) {
					cb("Error cleaning up",4);
			});
		})
		],function(err,results) {
			if (err) {
				throw new Error("Unexpected error running tests: " + err);
			}
			test.done();
		}
	);
    },testVolatile: function (test) {
	var models = this.models;
	test.expect(4);
	
	var vol1 = new models.TestVolatile({id:"testvol1",message:'Test 1'});
	async.series(
		[async.apply(function(cb) {	//create record
			vol1.save({id:"testvol1"},{success: function(model) {
				test.equal(model.get("id"),"testvol1",'ID attribute not created.');
				test.equal(model.id,"testvol1", 'ID object not created.');
				cb(null,1);
				}, error: function(err) {
					cb("Error saving vol1",1);
			}});
		}),async.apply(function(cb) {  // check it was created
			var vol_s = new models.TestVolatile({id: "testvol1"});
			vol_s.fetch({success: function(model) {
				test.equal(model.id,"testvol1",'Not the right record.');
				cb(null,2);
				}, error: function(err) {
					cb("Error loading vol1",3);
			}});
		}),async.apply(function(cb) {  //wait more than one second
			setTimeout(function() {
				cb(null,3);
			},1500);
		}),async.apply(function(cb) {  //wait more than one second
			var vol_s = new models.TestVolatile({id: "testvol1"});
			vol_s.fetch({success: function(model) {
					console.log("Volatile: " + model);
					test.ok(false,'Volatile record found when should be deleted.');
					cb(null,4);
				}, error: function(err) {
					test.ok(true);
					cb(null,4);
			}});			
		})
		],function(err,results) {
			if (err) {
				throw new Error("Unexpected error running tests: " + err);
			}
			test.done();
		}
	);
    }
});

