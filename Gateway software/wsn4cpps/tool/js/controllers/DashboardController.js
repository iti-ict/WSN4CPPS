angular.module('MetronicApp').controller('DashboardController', function($scope,  SensorTypeService,networkConfigService,nodestatsService) {
    /*$scope.$on('$viewContentLoaded', function() {   
        // initialize core components
        App.initAjax();
    });*/
   //$scope=$scope;
   
   $scope.types=SensorTypeService.list();
   
    // set sidebar closed and body solid layout mode
    $scope.settings.layout.pageContentWhite = true;
    $scope.settings.layout.pageBodySolid = false;
    $scope.settings.layout.pageSidebarClosed = false;
   //  var client=brokerService.client();
    console.log('Going to open mqtt connection');
    var broker=networkConfigService.get('MQTT').ip;
    var client = new Paho.MQTT.Client(broker, 3000, "client-DC");
    var rx=[];
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;
    client.connect({onSuccess:onConnect});
    $scope.count_total=0;
   // $scope.nodes=nodestatsService.list().splice(0,1);
    $scope.nodes=[];
    console.log(nodestatsService.list());
    //if(nodestatsService.isinit()){$scope.nodes=[];}else{ $scope.nodes=nodestatsService.list();}
    $scope.chart = {};
            var oldedg=[
        {from: 1, to: 2},
        {from: 1, to: 2},
        {from: 2, to: 4},
        {from: 2, to: 5}
        ];
    function onConnect() {
      // Once a connection has been made, make a subscription
      console.log("onConnect");
      client.subscribe("capri/nodes/#");
      client.subscribe("capri/gw/#");
     
      message = new Paho.MQTT.Message("syn");
      message.destinationName = "capri/hmi/on";
      client.send(message); 
    };
    function onConnectionLost(responseObject) {
      if (responseObject.errorCode !== 0)
              console.log("onConnectionLost:"+responseObject.errorMessage);
    };
    function onMessageArrived(message) {
            var timestamp= Date.now(); 
            var payload=message.payloadString;
           // console.log("["+$filter('date')(timestamp,'medium')+"] "+message.destinationName+' = '+message.payloadString);
            var topic=message.destinationName.split('/');
           if(topic[1]!='nodes'){
               $scope.ontime=payload;
               // var now = new Date().getTime();
               //console.log(now +'-->'+payload);
              // $scope.time=now-payload;             
           }else{
            var id=topic[2];
            $scope.idno=id;
            $scope.topic=message.destinationName;
            $scope.count_total++;
            $scope.$apply(updatenode(payload,id));}
    };	
    $scope.uptime=function(ontime){
               var now = new Date().getTime();
               
               return (now-ontime)/1000;
    } 
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
                       if($scope.nodes[i].rx===undefined){$scope.nodes[i].rx=0};
                       rx=parseInt($scope.nodes[i].rx)+1;
                       $scope.nodes[i]={'id':id,'etx':etx,'parent':parent,'neighbors':neig,'rssi':rssi,'q':q,'seq':seq,'lost':$scope.nodes[i].lost+lost,'rx':rx,'value':temp[1],'type':temp[0]}; 
                       //nodestatsService.save($scope.nodes[i]);
                       r=true;
                       break;
                    }else{
                        r=false;
                    }
                }
                if(!r){ 
                    rx[0]=1;
                    $scope.nodes.push({'id':id,'etx':etx,'parent':parent,'neighbors':2,'rssi':-56,'q':q,'seq':seq,'lost':0,'rx':rx[0]}); //nodestatsService.save($scope.nodes[i]); 
                    nw=true;                   
                }               
                /******root detection *********/
                for(i in $scope.nodes){
                    ids.push($scope.nodes[i].id);
                    par.push($scope.nodes[i].parent);
                }
                par=_.difference(par,ids); 
                $scope.root=par[0];  
            }else{
               rx[0]=1;
               $scope.nodes[0]={'id':id,'etx':etx,'parent':parent,'neighbors':2,'rssi':-56,'q':q,'seq':seq,'lost':0,'rx':rx[0]}; //nodestatsService.save($scope.nodes[i]);
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
                 $scope.$apply(createtop());
            }
           
    }
    /*************test tree view topology**********/
    function createtop(){
        var top=[]; var i; var c=1;  var p={}; var l={};
        var newedge=[];
        top.push({id: c, label:$scope.root, color: {background:'#7BE141',border:'green',highlight:{background:'red',border:'blue'}}});
        for(i in $scope.nodes){
                c=c+1;
                 top.push({id:c, label:$scope.nodes[i].id});                             
         }
        for(i in $scope.nodes){
               p=_.findWhere(top, {label: $scope.nodes[i].parent}); 
               l=_.findWhere(top, {label: $scope.nodes[i].id});              
              if(p){newedge.push({from:l.id, to:p.id});}
         }
    
    var nodes = new vis.DataSet(top);
    
    // create an array with edges
    // create a network 
    oldedg=newedge; 
    var edges = new vis.DataSet(newedge);
    var container = document.getElementById('mynetwork');

    // provide the data in the vis format
    var data = {
        nodes: nodes,
        edges: edges
    };
    var options = {};

    // initialize your network!
    var network = new vis.Network(container, data, options);    
    }
   
});