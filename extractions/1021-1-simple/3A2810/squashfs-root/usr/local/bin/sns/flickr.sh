#!/bin/sh
#

echo "Enter flickr.sh"

export LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH
export QT_QWS_FONTDIR=$1
echo $LD_LIBRARY_PATH
echo $QT_QWS_FONTDIR

#/usr/local/bin/sns/Flickr -qws -display directfb

echo "/usr/local/bin/sns/Flickr -qws -display directfb"
/usr/local/bin/sns/Flickr -qws -display directfb
