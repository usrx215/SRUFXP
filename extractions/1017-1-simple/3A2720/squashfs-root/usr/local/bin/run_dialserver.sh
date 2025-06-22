#!/bin/sh

#export LD_LIBRARY_PATH=/usr/local/lib:/usr/lib:/lib
#export NF_IDFILE=/misc/nf/sysdata/SDK.bin
#export NF_DATA_DIR=/mnt/sda1/netflix_qt/data
#export QWS_DISPLAY=directfb
#export QT_PLUGIN_PATH=/plugins

echo "Enter run_dialserver"
echo "start dialserver"
/usr/local/bin/dialserver /usr/local/bin/netflix_qt/netflix_qt.sh /usr/share/netflix/32/data
#/usr/local/bin/dialserver /usr/local/bin/netflix_qt/netflix_qt.sh /usr/share/netflix/32/data
#/usr/local/bin/netflix_qt/dialserver /mnt/sda1/netflix_qt/netflix_qt.sh /mnt/sda1/netflix_qt/data
