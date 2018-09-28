// requires and config for the mqtt agent
const mqtt = require('mqtt')
const client = mqtt.connect('ws://localhost:3000');

/* requires and configs for the udp WSN gateway server*/
var PORT = 5678;
var events = require('events');

var myEmitter = new events.EventEmitter();

//var HOST = 'ip6-localhost';
var HOST = 'fdd0::1';

var dgram = require("dgram");
//var moment = require("momentjs");
var gw = dgram.createSocket("udp6");
var nodeId = 0;
var nd=0;
//var temper = [];
var temper;
var x,y,z,pow,rele;
var timestamp = [];
var wsnmotes=[];
var noderecord=[];
var motes;
var done=false;
var type=0;
var n=6;
/*********************MQTT handler***************************/
client.on('connect', function()  { 
  // Inform controllers that virtual-wall is connected
  var now = new Date().getTime();
  var tim=now.toString();
  console.log("Broker connected, enabling communication, starting publishers...");
  client.publish('capri/gw/connected', tim);
  client.subscribe('capri/hmi/on');
  client.subscribe('capri/setipso/+');
})

client.on('message', function(topic, message)  { 
  console.log(topic) ;
  if(topic === 'capri/hmi/on') {
	  var now = new Date().getTime();
     var tim=now.toString();
    client.publish('capri/gw/connected', tim);
  }
 
})

function sendStateUpdate (state,rinfo) {
  console.log('\nSending stats update of WSN_node_'+nodeId)
  client.publish('capri/nodes/'+nodeId+'/state', ''+state+','+rinfo.address);
}

function sendSensorUpdate (state,t,x,y,z,pw,rl,rinfo) {
  console.log('\nSending sensor update of WSN_node_'+nodeId);
  client.publish('capri/sensors/'+nodeId+'/temperature', t+','+rinfo.address);
  client.publish('capri/sensors/'+nodeId+'/accel_xyz', x+','+y+','+z+','+rinfo.address);
  client.publish('capri/sensors/'+nodeId+'/power_cons', pw+','+rinfo.address);
  client.publish('capri/sensors/'+nodeId+'/actuator', rl+','+rinfo.address);
}

function synchro (rinfo){
  var now = new Date().getTime();
  var tim=now.toString();
  var msg = new Buffer( tim );

  gw.send( msg, 0, msg.length, rinfo.port, rinfo.address );
}
/*function setipso (rinfo,type){

    var msg=type;
	
  gw.send( msg, 0, msg.length, rinfo.port, rinfo.address );
}*/
/**
 * Want to notify controller that virtual-wall is disconnected before shutting down
 */
function handleAppExit (options, err) {
  if (err) {
    console.log(err.stack)
  }

  if (options.cleanup) {
    client.publish('capri/gw/connected', 'false')
  }

  if (options.exit) {
    process.exit()
  }
}

function uniq_fast(a) {
    var seen = {};
    var out = [];
    var len = a.length;
    var j = 0;
    for(var i = 0; i < len; i++) {
         var item = a[i];
         if(seen[item] !== 1) {
               seen[item] = 1;
               out[j++] = item;
         }
    }
    return out;
}

function doint(hex) {
     // Reversed the order because the added values need to 16^i for each value since 'F' is position 1 and 'E' is position 0
    var hex = val.split('').reverse().join('');
  
    // Set the Decimal variable as a integer
    var dec = 0;
  
    // Loop through the length of the hex to iterate through each character
    for (i = 0; i < hex.length; i++) {
      
        // Obtain the numeric value of the character A=10 B=11 and so on..
        // you could also change this to var conv = parseInt(hex[i], 16) instead
        var conv = '0123456789ABCDEF'.indexOf(hex[i]);
      
        // Calculation performed is the converted value * (16^i) based on the position of the character
        // This is then added to the original dec variable.  'FE' for example
        // in Reverse order [E] = (14 * (16 ^ 0)) + [F] = (15 * (16 ^ 1)) 
        dec += conv * Math.pow(16, i);
      
    }
  
    // Returns the added decimal value
    return dec;
}

/**
 * Handle the different ways an application can shutdown
 */
process.on('exit', handleAppExit.bind(null, {
  cleanup: true
}))
process.on('SIGINT', handleAppExit.bind(null, {
  exit: true
}))
process.on('uncaughtException', handleAppExit.bind(null, {
  exit: true
}))

/***********************end MQTT**************************/

/**********************OPCUA handler************************/
var opcua = require("node-opcua");

var server = new opcua.OPCUAServer({
   port: 4334 // the port of the listening socket of the server
});

server.buildInfo.productName = "BEinCPPS-WSN";
server.buildInfo.buildNumber = "0004";
server.buildInfo.buildDate = new Date(2017,4,28);


       function extract_id(mote_name) {
           var p;
	
	   for(var i=0;i<wsnmotes.length;i++){           
	    if(wsnmotes[i].id==mote_name){p=i;break;}}			
           return new opcua.Variant({dataType: opcua.DataType.string, value: wsnmotes[p].id });
       }
       function extract_value_tem(mote_name) {
           var p;         
		   for(var i=0;i<wsnmotes.length;i++){
			   if(wsnmotes[i].id==mote_name ){
				   p=i;break;
				   }
			}			
           return new opcua.Variant({dataType: opcua.DataType.Double, value: wsnmotes[p].temp });
       }
	   function extract_value_x(mote_name) {
           var p;         
		   for(var i=0;i<wsnmotes.length;i++){
			   if(wsnmotes[i].id==mote_name ){
				   p=i;break;
				   }
			}			
           return new opcua.Variant({dataType: opcua.DataType.Double, value: wsnmotes[p].x });
       }
	   function extract_value_y(mote_name) {
           var p;         
		   for(var i=0;i<wsnmotes.length;i++){
			   if(wsnmotes[i].id==mote_name ){
				   p=i;break;
				   }
			}			
           return new opcua.Variant({dataType: opcua.DataType.Double, value: wsnmotes[p].y });
       }
	   function extract_value_z(mote_name) {
           var p;         
		   for(var i=0;i<wsnmotes.length;i++){
			   if(wsnmotes[i].id==mote_name ){
				   p=i;break;
				   }
			}			
           return new opcua.Variant({dataType: opcua.DataType.Double, value: wsnmotes[p].z });
       }
	   function extract_value_pow(mote_name) {
           var p;         
		   for(var i=0;i<wsnmotes.length;i++){
			   if(wsnmotes[i].id==mote_name ){
				   p=i;break;
				   }
			}			
           return new opcua.Variant({dataType: opcua.DataType.Double, value: wsnmotes[p].pow });
       }
	   function extract_value_rele(mote_name) {
           var p;         
		   for(var i=0;i<wsnmotes.length;i++){
			   if(wsnmotes[i].id==mote_name ){
				   p=i;break;
				   }
			}
           return new opcua.Variant({dataType: opcua.DataType.Int16, value: wsnmotes[p].rele });
       }
	   function extract_value_pres(mote_name) {
           var p;
          
	   for(var i=0;i<wsnmotes.length;i++){if(wsnmotes[i].id==mote_name){p=i;break;}}			
           return new opcua.Variant({dataType: opcua.DataType.Boolean, value: wsnmotes[p].value });
       }
       function extract_time(mote_name) {
           var p;
	   for(var i=0;i<wsnmotes.length;i++){if(wsnmotes[i].id==mote_name){p=i;break;}}			
           return new opcua.Variant({dataType: opcua.DataType.string, value: wsnmotes[p].timestamp });
       }

 function create_MoteNode(mote_name) {
           // declare the mote node
           try{

			    server.engine.addressSpace.addObject({organizedBy: motes, browseName: mote_name });
		   /*switch(type){
			   case '3303':
					  server.engine.addressSpace.addVariable({
						   componentOf: mote_name,
						   nodeId: mote_name+"Temperature",
						   browseName: "Temperature",
						   dataType: "Double",
						   value: {  get: function () { return extract_value_tem(mote_name,"value"); } }
						});break;
				case '3302':
					server.engine.addressSpace.addVariable({
						   componentOf: mote_name,
						   nodeId: mote_name+"presence",
						   browseName: "presence",
						   dataType: "Int",
						   value: {  get: function () { return extract_value_pres(mote_name,"value"); } }
					   });break;
		   }*/
		   console.log("Adding variables to mote object namespace::::::::::::::::::::::::::::::::::");
		   //var ns=doint(mote_name);
		  // ns=(Math.random()*100).toFixed(0);
		   ns=nd;
		   server.engine.addressSpace.addVariable({
						   componentOf: mote_name,
						   nodeId: "ns="+ns+";s=Temperature",
						   browseName: "Temperature",
						   dataType: "Double",
						   value: {  get: function () { return extract_value_tem(mote_name,"value"); } }
			});
			
			server.engine.addressSpace.addVariable({
						   componentOf: mote_name,
						   nodeId: "ns="+ns+";s=accel_X",
						   browseName: "accel_X",
						   dataType: "Double",
						   value: {  get: function () { return extract_value_x(mote_name,"value"); } }
			});
			
			server.engine.addressSpace.addVariable({
						   componentOf: mote_name,
						   nodeId: "ns="+ns+";s=accel_Y",
						   browseName: "accel_Y",
						   dataType: "Double",
						   value: {  get: function () { return extract_value_y(mote_name,"value"); } }
			});
			server.engine.addressSpace.addVariable({
						   componentOf: mote_name,
						   nodeId: "ns="+ns+";s=accel_Z",
						   browseName: "accel_Z",
						   dataType: "Double",
						   value: {  get: function () { return extract_value_z(mote_name,"value"); } }
			});
			server.engine.addressSpace.addVariable({
						   componentOf: mote_name,
						   nodeId: "ns="+ns+";s=power_cons",
						   browseName: "power_cons",
						   dataType: "Double",
						   value: {  get: function () { return extract_value_pow(mote_name,"value"); } }
			});
			server.engine.addressSpace.addVariable({
						   componentOf: mote_name,
						   nodeId: "ns="+ns+";s=actuator",
						   browseName: "actuator",
						   dataType: "Int16",
						   value: {  get: function () { return extract_value_rele(mote_name,"value"); } }
			});
           server.engine.addressSpace.addVariable({
               componentOf: mote_name,
               browseName: "id",
	           nodeId:"ns="+ns+";s=id",
               dataType: "String",
               value: {  get: function () { return extract_id(mote_name,"id"); } }
           });
           server.engine.addressSpace.addVariable({
               componentOf: mote_name,
	           nodeId: "ns="+ns+";s=Timestamp",
               browseName: "Timestamp",
               dataType: "String",
               value: {  get: function () { return extract_time(mote_name,"timestamp"); } }
           });
		   
      
       }catch(err){console.log("Address Space not ready, waiting for next object: "+err);};
 }
function addnew(i){
	    console.log("Found and allocating the following motes and their resources: ");
		console.log("\033[0;32m" + wsnmotes[i].id + ": \033[0m");
		console.log("\033[1;32m  -> " + Object.keys(wsnmotes[i])+" \033[0m");
		console.log("\033[1;32m  -> IP:" + wsnmotes[i].address+" \033[0m");
		create_MoteNode(wsnmotes[i].id);
		var endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
        console.log("The primary server endpoint url is ", endpointUrl );
	/*for(var i=0;i<wsnmotes.length;i++){
		console.log("\033[0;32m" + wsnmotes[i].id + ": \033[0m");
		console.log("\033[1;32m  -> " + Object.keys(wsnmotes[i])+" \033[0m");
		create_MoteNode(wsnmotes[i].id,wsnmotes[i].type);			
	}*/
}
function post_initialize() {
    console.log("::::::::Updating WSN Motes namespace:::::::: ");
    function construct_my_address_space(server) {
       // declare some folders
        motes  = server.engine.addressSpace.addFolder("ObjectsFolder",{ browseName: "WSN"});
       
	    console.log("........................................................ \n");
        
	console.log("\033[32;47m ::::::::::::::::::::::::: OPC-UA SERVER ONLINE :::::::::::::::::::::::::: \033[0m");

    }
    construct_my_address_space(server);
    server.start(function() {
        console.log("Server is now listening ... ( press CTRL+C to stop)");
        console.log("Port: ", server.endpoints[0].port);
        var endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
        console.log("The primary server endpoint url is ", endpointUrl );
	    console.log("\033[32;47m :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: \033[0m");    
    });
}
server.initialize(post_initialize);

/*********************initialize UDP gateway to publish data ***********************/

gw.on("error", function (err) {
  console.log("server error:\n" + err.stack);
  gw.close();
});

gw.on("message", function (msg, rinfo) {
//var payload=parseInt('0x'+msg.toString('hex').match(/.{2}/g).reverse().join(""),16);
var s=msg.slice(0); 
 s=s.toString();
//console.log(msg+' Data RX: '+s);
 var rep=false; var rp=false;

 var ip=''+rinfo.address.slice(rinfo.address.lastIndexOf(":")+1);
 
 /* 
 switch(ip){
	 case 'b28e':var node_id='s=Mote_4';break;
	 case 'b31c':var node_id='s=Mote_1';break;
	 case 'b2a9':var node_id='s=Mote_3';break;
	 case '2c1f':var node_id='s=Mote_2';break;
	 case '8488': var node_id='s=Mote_5';break;
	 default:var node_id='s=Mote_n';break;
 }*/

 nodeId=rinfo.address.slice(rinfo.address.lastIndexOf(":")+1);
 node_id='s=Mote_'+ip;
 //node_id=nodeId;
 var time=new Date();
 var data=new Array();
 data=s.split(',');
  
    timestamp=time.getTime();	
	
if(data[0]!='Q'){	
	temper=ca2(data[1])/2;
	x=(ca2(data[2])*0.0392).toFixed(3);
	y=(ca2(data[3])*0.0392).toFixed(3);
	z=(ca2(data[4])*0.0392).toFixed(3);
	pow=data[5];
	rele=data[6]%31;
    
    var obj={'id':node_id,'temp':temper,'x':temper,'y':temper,'z':temper,'pow':temper,'rele':rele,'timestamp':timestamp,'address':rinfo.address};
      for(var i=0;i<wsnmotes.length;i++){
		if(wsnmotes.length>0){ 
			if(wsnmotes[i].id==node_id){
				
				rep=true;
				    wsnmotes[i].temp=temper;
					wsnmotes[i].x=x;
					wsnmotes[i].y=y;
					wsnmotes[i].z=z;
					wsnmotes[i].pow=pow;
					wsnmotes[i].rele=rele;
			        wsnmotes[i].timestamp=timestamp;
				console.log("[INFO] Value updated:" +s+ " - on node:" + node_id);
				break;
				}			
		}
		else{break;}
                  
	}
	if(!rep){wsnmotes.push(obj);addnew(wsnmotes.length-1);nd=nd+1;}	
    sendSensorUpdate(s,temper,x,y,z,pow,rele,rinfo);
}else
{
	sendStateUpdate(s,rinfo);
	}

});
function ca2(num){
	if(num>32768){
		return (num-65536);
	}else{return num;}
};
gw.on("listening", function () {
  var address = gw.address();
  console.log("\033[31;47m BEinCPPS WSN GATEWAY starting on ports\n 5678 for WSN \n 4334 for OPC-UA \n 3000for MQTT\033[0m");
});

gw.bind(PORT);
