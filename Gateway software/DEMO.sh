#!/bin/bash
### BEGIN INIT INFO
# Provides: WSN test
# Required-Start: $local_fs $syslog
# Required-Stop: $local_fs $syslog
# Default-Start: 2 3 4 5
# Default-Stop: 0 1 6
# Short Description: Wsn test
# Description:Start Wsn test at boot time
### END INIT INFO

cd /home/pi
./WSN-test.sh &
cd /home/pi/gw/node_modules/node-opcua
sudo node wsn-server.js &
sudo node app.js &
sudo mosca -v --http-port 3000 --http-bundle --http-static ./ | bunyan

