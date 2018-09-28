angular.module('MetronicApp').controller('mqttController', function($scope,$rootScope,$filter, SensorTypeService, networkConfigService) {
    
         $scope.broker=networkConfigService.get('MQTT').ip;
         $scope.port=networkConfigService.get('MQTT').port;
         
         //if(client===undefined)
         var client = new Paho.MQTT.Client($scope.broker, 3000, "client-MC");
      //   console.log(client);
   /* $scope.$on('$viewContentLoaded', function() {   
        App.initAjax(); // initialize core components       
         
    });*/

   
    $scope.types=SensorTypeService.list();
    $scope.chartid='myFirstChart';
    // set sidebar closed and body solid layout mode
    $scope.settings.layout.pageContentWhite = true;
    $scope.settings.layout.pageBodySolid = false;
    $scope.settings.layout.pageSidebarClosed = false;
   /* console.log('Going to open mqtt connection');*/
   
    $scope.count=0;
    var rx=[];
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;
    client.connect({onSuccess:onConnect});
    $scope.count_total=0;
    $scope.nodes=[]; 
     $scope.sensors=[];
     $rootScope.temper=[0];
     $scope.mean=0;
     /*******************************************/
     


  $scope.data=[[]]; //$scope.data2=[[]];
      /********************************************/
         
    function onConnect() {
      // Once a connection has been made, make a subscription
      console.log("onConnect");
      client.subscribe("capri/sensors/#");
      client.subscribe("capri/gw/#");
      client.subscribe("$SYS/#");
     
    //  message = new Paho.MQTT.Message("syn");
    //  message.destinationName = "capri/hmi/on";
    //  client.send(message); 
    };
    function onConnectionLost(responseObject) {
      if (responseObject.errorCode !== 0)
            console.log("onConnectionLost:"+responseObject.errorMessage);
            //   console.log("onConnectionLost: Lost connection response unknown");
           //if(client===undefined)
           // var client = new Paho.MQTT.Client($scope.broker, 3000, "client-MC");
    };
    function onMessageArrived(message) {
        
            var timestamp= new Date(); 
            var payload=message.payloadString;
            console.log("["+$filter('date')(timestamp,'medium')+"] "+message.destinationName+' = '+message.payloadString);
            var topic=message.destinationName.split('/');
            switch(topic[0]){
                case '$SYS': 
                       // console.log(topic +'--->'+payload); 
                        if(topic[2]=='clients' && topic[3]=='connected')$scope.clientscon=payload;
                        if(topic[2]=='clients' && topic[3]=='maximum')$scope.clientsmax=payload;
                        if(topic[2]=='publish' && topic[3]=='received')$scope.mesrx=payload;
                        if(topic[2]=='version')$scope.version=payload;
                        if(topic[2]=='uptime')$scope.uptime=payload;
                        if(topic[2]=='memory'&&topic[4]=='current')$scope.memo=(payload/(1024*1024)).toFixed(2);
                        if(topic[2]=='clients'&& topic[4]=='connected')$scope.clientscon=payload;
                        $scope.$apply();
                        break;
                case 'capri':
                        if(topic[1]!='nodes'){
                         $scope.ontime=payload;    
                         var id=topic[2];
                         if(topic[1]=='sensors'){if ($scope.count==0){$scope.mean=payload;$scope.count=1;};$rootScope.temper.push(payload);$scope.$apply(updatesensors(payload,topic[3],timestamp)); }
                        }else{
                        var id=topic[2];
                        $scope.idno=id;
                        $scope.topic=message.destinationName;
                        $scope.count_total++;
                        $scope.$apply(updatenode(payload,id));}
                    break;
             }
           
    };	
    $scope.uptime=function(ontime){
               var now = new Date().getTime();
               
               return (now-ontime)/1000;
    } 
    //function updateserverstats(payload){}
    function updatenode(payload,id){
         $scope.$watch();
         var i; var nw=true; var r; var ids=[];var par=[]; var pdr=[]; 

            var temp=new Array();
            temp=payload.split(',');
            $scope.temperature=temp[1];
            for(var i in $scope.types){
                if(temp[0]==$scope.types[i].id)$scope.mag=$scope.types[i].magnitude;
            }
           var seq=temp[2];
           var etx=temp[6];
           var q=temp[7];
           var par1=Number(temp[8]).toString(16); var par2=Number(temp[9]).toString(16);
           var parent=par1+par2;
           var neig=temp[3];
           var rssi=temp[4];
           var totalpdr=0;
            if($scope.nodes[0]!=null){                
                for(i in $scope.nodes){
                    if($scope.nodes[i].id==id){
                       if($scope.nodes[i].parent!=parent){nw=true;}else{nw=false;}
                       var lost=seq-$scope.nodes[i].seq-1;
                       if(lost<0)lost=0;
                       rx=parseInt($scope.nodes[i].rx)+1;
                       $scope.nodes[i]={'id':id,'etx':etx,'parent':parent,'neighbors':neig,'rssi':rssi,'q':q,'seq':seq,'lost':$scope.nodes[i].lost+lost,'rx':rx,'value':temp[1],'type':temp[0]}; 
                       r=true;
                       break;
                    }else{
                        r=false;
                    }
                }
                if(!r){ 
                    rx[0]=1;
                    $scope.nodes.push({'id':id,'etx':etx,'parent':parent,'neighbors':2,'rssi':-56,'q':q,'seq':seq,'lost':0,'rx':rx[0]}); nw=true;                   
                }               
               
                for(i in $scope.nodes){
                    ids.push($scope.nodes[i].id);
                    par.push($scope.nodes[i].parent);
                }
                par=_.difference(par,ids); 
                $scope.root=par[0];  
            }else{
               rx[0]=1;
               $scope.nodes[0]={'id':id,'etx':etx,'parent':parent,'neighbors':2,'rssi':-56,'q':q,'seq':seq,'lost':0,'rx':rx[0]};
            }
            var totalost=0;
            for(i in $scope.nodes){
                pdr[i]=($scope.nodes[i].seq-$scope.nodes[i].lost)/($scope.nodes[i].seq);
                totalpdr=totalpdr+pdr[i];
                totalost=totalost+$scope.nodes[i].lost;
            }
            $scope.totlost=totalost;
            $scope.totalpack=100*totalpdr/$scope.nodes.length;
            $scope.nodeid=id;
            $scope.etx=etx;
            //console.log(nw);
            if(nw){
                 $scope.$apply(drawchart());
            }
           
    }
    function updatesensors(payload,type,time){
       //  $scope.$watch();
        
          //  var temp=new Array();
           // temp=payload.split(',');
            var temperature=(parseInt($scope.mean)+parseInt(payload))/2;
            $scope.mean=temperature;
            
            
            for(var i in $scope.types){
                if(type==$scope.types[i].id){$scope.variable=$scope.types[i].name;$scope.mag=$scope.types[i].magnitude;break;}
            }
                      
                        try{
                            if(type=='3303'){   
                                $scope.amChartOptions.data.shift();
                                $scope.amChartOptions.data.push({"category": time,"column-1": temperature});
                                //$scope.$apply($scope.amChartOptions);
                                 $scope.$broadcast('amCharts.updateData',$scope.amChartOptions.data,'myTempChart');
                                console.log($scope.amChartOptions.data);}
                            if(type=='3302'){   
                               var pres= parseInt(payload);
                               $scope.amChartOptionsPIR.data.shift();
                               $scope.amChartOptionsPIR.data.push({"category": time,"column-1": pres});
                               //$scope.$apply($scope.amChartOptions);
                                $scope.$broadcast('amCharts.updateData',$scope.amChartOptionsPIR.data,'mypirChart');
                               console.log($scope.amChartOptions.data);}
                    }catch(e){console.log('Data still undefined, waiting next round')};			
    }
    
    
    /***********charts********************/
          
    $scope.amChartOptions ={
	"type": "serial",
	"categoryField": "category",
	"dataDateFormat": "YYYY-MM-DD",
	"startDuration": 1,
	"categoryAxis": {
		"autoRotateCount": 1,
		"classNameField": "",
		"gridPosition": "start",
		"parseDates": false,
		"color": "#000000",
		"fontSize": 0,
		"title": ""
	},
	"chartCursor": {
		"enabled": true
	},
	"trendLines": [],
	"graphs": [
		{
			"fillAlphas": 0.3,
			"fontSize": 0,
			"id": "AmGraph-1",
			"negativeBase": -3,
			"tabIndex": 0,
                        "lineColor": "#28acb8",
			"title": "graph 1",
			"type": "smoothedLine",
			"valueField": "column-1"
		}
	],
	"guides": [],
	"valueAxes": [
		{
			"id": "ValueAxis-1",
			"title": "IPSO 3303: Temperature"
		}
	],
	"allLabels": [],
	"balloon": {},
	"titles": [
		{
			"id": "Title-1",
			"size": 15,
			"text": ""
		}
	],
	"data": [
		{
			"category": "2014-03-01",
			"column-1": 20
		},
		{
			"category": "2014-03-02",
			"column-1": 20
		},
		{
			"category": "2014-03-03",
			"column-1": 20
		},
		{
			"category": "2014-03-04",
			"column-1": 20
		},
		{
			"category": "2014-03-05",
			"column-1": 20
		},
		{
			"category": "2014-03-06",
			"column-1": 20
		},
		{
			"category": "2014-03-07",
			"column-1": 20
		},
		{
			"category": "2014-03-08",
			"column-1": 20
		},
		{
			"category": "2014-03-09",
			"column-1": 20
		},
		{
			"category": "2014-03-10",
			"column-1": 20
		},
		{
			"category": "2014-03-11",
			"column-1": 20
		},
		{
			"category": "2014-03-12",
			"column-1": 20
		},
		{
			"category": "2014-03-13",
			"column-1": 20
		},
		{
			"category": "2014-03-14",
			"column-1": 20
		},
		{
			"category": "2014-03-15",
			"column-1": 20
		}
	]
};
$scope.amChartOptionsPIR ={
	"type": "serial",
	"categoryField": "category",
	"dataDateFormat": "YYYY-MM-DD",
	"startDuration": 1,
	"categoryAxis": {
		"autoRotateCount": 1,
		"classNameField": "",
		"gridPosition": "start",
		"parseDates": false,
		"color": "#000000",
		"fontSize": 0,
		"title": ""
	},
	"chartCursor": {
		"enabled": true
	},
	"trendLines": [],
	"graphs": [
		{
			"fillAlphas": 0.3,
			"fontSize": 0,
			"id": "AmGraph-1",
			"negativeBase": -3,
			"tabIndex": 0,
                        "lineColor": "#F1C40F",
			"title": "graph 1",
			"type": "column",
			"valueField": "column-1"
		}
	],
	"guides": [],
	"valueAxes": [
		{
			"id": "ValueAxis-1",
			"title": "IPSO 3302: Presence"
		}
	],
	"allLabels": [],
	"balloon": {},
	"titles": [
		{
			"id": "Title-1",
			"size": 15,
			"text": ""
		}
	],
	"data": [
		{
			"category": "2014-03-01",
			"column-1": 0
		},
		{
			"category": "2014-03-02",
			"column-1": 0
		},
		{
			"category": "2014-03-03",
			"column-1": 0
		},
		{
			"category": "2014-03-04",
			"column-1": 0
		}
	]
};
  
   
});
angular.module('MetronicApp').controller('tempgraphsCtrl', ['$scope','$rootScope','$filter',function($scope,$rootScope,$filter){
 
 /******************************************/
 
 
 /******************************************/
 
 
 $scope.labels=[];
 $scope.series = ['WSN Temperature Mean Value'];
 
 
  $scope.onClick = function (points, evt) {
    console.log(points, evt);
  };
  $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }];
  $scope.options = {
    scales: {
      yAxes: [
        {
          id: 'y-axis-1',
          type: 'linear',
          display: true,
          position: 'left'
        }
      ]
    }
  };


  $scope.data=[[]];

 /* $scope.$watchCollection(function($rootScope) { return $rootScope.temper },
              function(newValue) { 
                  //console.log(newValue);
                  if($scope.data[0].length >= 10){$scope.data[0].shift();$scope.labels.shift();}
                  $scope.data[0].push(parseInt($rootScope.temper[$rootScope.temper.length-1]));
                  console.log($scope.data);
                  $scope.labels.push($filter('date')(Date.now(),'mediumTime'))
        }
             );*/

  
}])