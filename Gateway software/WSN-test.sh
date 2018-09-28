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

cd /home/pi/contiki/examples/ipv6/rpl-border-router
echo -e "\n\033[0;32m::::Launching WSN GW, Sink started, deploy nodes::::\n"
echo -e ":::::> Data redirected to log file (on screen for debugging) <:::::\n\033[0m\033[1;33m"

until sudo make connect-router ; do
echo "Service 'connect-router'of WSNGW crashed with exit code #?. Respawning..." >&2
sleep 1
done

