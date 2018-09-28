# WSN4CPPS
 This repository host the necessary code, files, scripts and libraries to run a working demostrator of the [BEinCPPS](http://www.beincpps.eu/) Real World Asset WSN4CPPS. 
 
 ![alt text](https://static.wixstatic.com/media/03d390_8708eaa4f99440b4b59a7242a0ad76ef~mv2.png/v1/fill/w_222,h_42,al_c,q_80,usm_0.66_1.00_0.01/03d390_8708eaa4f99440b4b59a7242a0ad76ef~mv2.webp "Beincpps logo")

<span style="color:blue"> _BEinCPPS project aims to integrate and experiment a Fl-based machine-factory—cloud service platform ﬁrstly intensively in ﬁve selected S3 Vanguard regions, afterwards extensively in all European regions, bv involving local competence centers and manufacturing SMEs. The ﬁnal aim of this Innovation Action is to dramatically improve the adoption of CPPSs all over Europe by means of the creation, nurturing and flourishing of CPS-driven regional innovation ecosystems, made of competence centers, manufacturing
 enterprises and IT SMEs._</span>
 
 Basically, the example consists of a set of wireless sensor nodes which perform a temperature(sensor interfaces are tunable) sensing task. 
 The nodes are able to connect with a wireless gateway, which is present in the form of a Raspberry Pi. This gateway allow floor plant systems, such as 
 SCADAS or other controller software, to gather sensor data via 2 flows or widely adopted industry protocols: MQTT or OPC-UA.
 The gateway software provided also includes a Webapp UI to assist during deployment of the Wireless Sensor Network, allowing to check connectivity and quality information,
 and check the correct flows operation.
 
> **Note:**
> WSN nodes firmware is precompiled for using with Zolertia REMOTE devices. Source files are included in order to allow compiling for other supported HW (based on TI CC2538 chipset).
> The provided software for GATEWAY assumes it will be run on a Raspberry PI 3
>
> For the best result, we encourage you to follow this HW guidelines.

## Prerequisites:

  - `[MUST]` Install node.js (assuming debian):
     ```
     curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
	 sudo apt install nodejs
	 ```
	 
  - `[MUST]` Install node-opcua as a node package
    ```
    cd
    mkdir gateway
    cd gateway
    npm install node-opcua
    ```
	 
  - `[OPTIONAL BUT RECOMMENDED]` Install nginx for the UI:
   ``` 
     sudo apt install nginx
   ```

## Installing the modules:  
*1. Get the `contiki.zip` file inside `WSN node firmware` folder and unzip contents into `/home/pi/contiki`

Upload gateway wsn node (border-router) firmware:   
```
cd contiki/examples/ipv6/rpl-border-router/
sudo make border-router.upload
```
	
Upload nodes firmware: 
```
cd contiki/examples/ipv6/rpl-udp/
sudo make NODEID=0xYYYY udp-client.upload    
```
(NODEIS is to predefine the IP and ID the node will have, and it consists of 4 hexadecimal digits, avoid starting with 0001, i.e: 0x0002)

(if more than one node is connected to USB, please make sure you upload to the correct one. The usb for uploading can be chosen with the option MOTES=/dev/ttyUSBX, predefined is ttyUSB0, which is first one connected)

*2. In `Gateway software folder`, copy and place `wsn-server.js` and `app.js` into `/home/pi`  and give execution permissions ( sudo chmod ...)  

```
cd /home/pi/gateway
sudo npm install
```
															
*3. In `Gateway software folder`, copy and place `DEMO.sh` and `WSN-test.sh` into `/home/pi/gw/node_modules/node-opcua` 

*4. `OPTIONAL` if nginx: unzip the `wsn4cpps_hmi` in `/var/www/html`
   This enables a web UI that shows the network topology and a dashboard with what nodes are sending, useful for knowing if network deployed is OK and sending correctly. The counterpart is that it requires a mqtt broker. For your convenience, this demo runs an internal MQTT broker
   to see the UI, make sure all rest of modules are working (by launching DEMO.sh) and access in a browser  `http://[raspberry_ip]/tool`
	
*5. Install a node.js mqtt broker locally (write down pi's IP address before hand):

```
npm install mosca pino -g
```
__OR change Broker IP and port on:__

```	
/home/pi/gateway/wsn-server.js   line 4   -> const client = mqtt.connect('ws://IP:port');  
	
/var/www/html/tool/js/main.js  line 396  ->   var net = [{
															'id': 'MQTT',
															'ip': 'IP',
															'port': port
														}
```
														
DEMO.sh has a line commented that can launch mosca local broker in port 3000, uncomment to enable
	

## LAUNCHING THE SYSTEM

If everything was installed correctly, simply run the WSN application by:
   - Ensure the node with border-router code is connected to usb
   - (at home/pi) sudo ./DEMO.sh
   - Locate nodes where desired. The LED will show red color if there is no connection, and turn yellow/blue/green to show quality when connected (green is best). LED can be turn off and on with user button. For battery saving, it is recommended to turn it off after placed where desired.
   - Accessing the url of the UI will show connected nodes and network topology and stats, and also a dashboard for monitoring the data being sent.
   - Data can also be retreived by any comercial or open source OPC-UA Client, such as UA Expert, using the following endpoint:
   `opc.tcp://[GATEWAY_IP]:4334`
   
Please note this guide might require some configuration depending on the system and HW running. For further information or asssitance, please contact the [developer - ITI](http://www.iti.es/contacto/)
