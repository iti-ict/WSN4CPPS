var express = require("express");
var port = 3700;

var num_nodes=2;

var opcua = require("node-opcua");
var async = require("async");
var color = require("colors");

var client = new opcua.OPCUAClient({

});

var hostname = require("os").hostname();
hostname = hostname.toLowerCase();
var endpointUrl = "opc.tcp://" + hostname + ":4334/";

var the_subscription,the_session;

var userIdentity  = null;
//xx var  userIdentity = { userName: "opcuauser", password: "opcuauser" };


async.series([
    function(callback) {
        console.log(" connecting to ", endpointUrl.cyan.bold);
        client.connect(endpointUrl,callback);
    },
    function(callback) {


        client.createSession(userIdentity,function (err,session){
            if (!err) {
                the_session = session;
                console.log(" session created".yellow);
            }
            callback(err);
        });
    },
   function(callback) {
	the_session.browse("RootFolder", function(err,browse_result){
	    if(!err) {
        	browse_result[0].references.forEach(function(reference) {
	        //console.log( reference.browseName.toString());
		//console.log(reference);
        	});
    	}
   
	});
/******************************************************************************/
var browsePath = [
    opcua.browse_service.makeBrowsePath("RootFolder","/Objects/WSN"),
];

var productNameNodeId;
the_session.translateBrowsePath(browsePath, function (err, results) {
    if (!err) {
      console.log(results[0].toString());
      productNameNodeId = results[0].targets[0].targetId;
      console.log(productNameNodeId);
    }
});
/***************************************************************************/
        the_subscription=new opcua.ClientSubscription(the_session,{
            requestedPublishingInterval: 1000,
            requestedMaxKeepAliveCount:  2,
            requestedLifetimeCount:      10,
            maxNotificationsPerPublish:  10,
            publishingEnabled: true,
            priority: 10
        });
//xx the_subscription.monitor("i=155",DataType.Value,function onchanged(dataValue){
//xx    console.log(" temperature has changed " + dataValue.value.value);
//xx });
        the_subscription.on("started",function(){
            console.log("subscription started");
            callback();
        }).on("keepalive",function(){
            console.log("keepalive");
        }).on("terminated",function(){
            console.log(" TERMINATED ------------------------------>"); 
        });

    }
],function(err) {
    if (!err) {
        startHTTPServer();
    } else {
        // cannot connect to client
        console.log(err);
    }
});


//var nodeIdToMonitor = "ns=1;s=Temperature";
var nodeIdToMonitor = "s=Mote_2Temperature";

function startHTTPServer() {


    var app = express();
    app.get("/", function(req, res){
        res.send("It works!");
    });

    app.use(express.static(__dirname + '/'));

    var io = require('socket.io').listen(app.listen(port));

    io.sockets.on('connection', function (socket) {
//        socket.on('send', function (data) {
//            io.sockets.emit('message', data);
//        });
    });

 
	//var nodeIdArr=["s=Mote_1Temperature","s=Mote_2Temperature","s=Mote_3Temperature","s=Mote_4Temperature","s=Mote_5presence"];
	
	var nodeIdArr=[];
	for(var i=0;i<num_nodes;i++){
		nodeIdArr.push("ns="+i+";s=Temperature");
		nodeIdArr.push("ns="+i+";s=accel_X");
		nodeIdArr.push("ns="+i+";s=accel_Y");
		nodeIdArr.push("ns="+i+";s=accel_Z");
		nodeIdArr.push("ns="+i+";s=pow_cons");
		nodeIdArr.push("ns="+i+";s=actuator");
		nodeIdArr.push("ns="+i+";s=id");
		nodeIdArr.push("ns="+i+";s=Timestamp");
	}
	async.each(nodeIdArr,function(nodeid,callback){
		 var monitoredItem = the_subscription.monitor(
			{
			    nodeId: opcua.resolveNodeId(nodeid),
			    attributeId: 13
			},
			{
			    samplingInterval: 100,
			    discardOldest: true,
			    queueSize: 10
			},opcua.read_service.TimestampsToReturn.Both
			);
		console.log("------------------"+nodeid+"--------------------");
		monitoredItem.on("changed", function(dataValue){
			console.log(dataValue);
			io.sockets.emit('message', {
			    value: dataValue.value.value,
			    timestamp: dataValue.sourceTimestamp-290000000,
			    nodeId: nodeid,
			    browseName: "Temperature",
			    showobj:dataValue
			});
		    });
	});
}

console.log("Listening on port " + port);
