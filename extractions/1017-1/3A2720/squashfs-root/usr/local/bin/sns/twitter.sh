#!/bin/sh
#

echo "Enter twitter.sh, this version base on changelist: 212044"

export LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH
export QT_QWS_FONTDIR=$1
echo $LD_LIBRARY_PATH
echo $QT_QWS_FONTDIR


if [ -e /mnt/sda1/Twitter ]; then
    echo "/mnt/sda1/Twitter -qws -display directfb"
    /mnt/sda1/Twitter -qws -display directfb
elif [ -e /mnt/sdb1/Twitter ]; then
    echo "/mnt/sdb1/Twitter -qws -display directfb"
    /mnt/sdb1/Twitter -qws -display directfb
else
    echo "/usr/local/bin/sns/Twitter -qws -display directfb"
    /usr/local/bin/sns/Twitter -qws -display directfb
fi

