#!/bin/sh
#

echo "Enter vudu.sh"

#export VLOGTOCONSOLE=1
#export VLOGLEVEL=info

if [ -f "/misc/vudu-wifionly.txt" ]; then
	export VUDU_LINK_INTERFACE=ra0
	echo "wifionly"
else
	echo "non-wifi"
fi

#export VUDU_LINK_INTERFACE=ra0
#LD_PRELOAD=/lib/libSegFault.so ./usr/local/bin/vudu_client
./usr/local/bin/vudu_client $1 $2 $3 $4 $5 $6 

