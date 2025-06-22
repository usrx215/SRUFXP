#!/bin/sh
#

echo "Enter flickr.sh"

export LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH
export QT_QWS_FONTDIR=$1
echo $LD_LIBRARY_PATH
echo $QT_QWS_FONTDIR

#/usr/local/bin/sns/Flickr -qws -display directfb
if [ -e /mnt/sda1/Flickr ]; then
    echo "/mnt/sda1/Flickr -qws -display directfb"
    /mnt/sda1/Flickr -qws -display directfb
elif [ -e /mnt/sdb1/Flickr ]; then
    echo "/mnt/sdb1/Flickr -qws -display directfb"
    /mnt/sdb1/Flickr -qws -display directfb
else
    echo "/usr/local/bin/sns/Flickr -qws -display directfb"
    /usr/local/bin/sns/Flickr -qws -display directfb
fi