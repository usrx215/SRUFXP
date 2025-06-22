#!/bin/sh
#

echo "Enter facebook.sh, this version base on changelist: 212044"

export LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH
export QT_QWS_FONTDIR=$1
echo $LD_LIBRARY_PATH
echo $QT_QWS_FONTDIR


if [ -e /mnt/sda1/QFacebook ]; then
    echo "/mnt/sda1/QFacebook -qws -display directfb"
    /mnt/sda1/QFacebook -qws -display directfb
elif [ -e /mnt/sdb1/QFacebook ]; then
    echo "/mnt/sdb1/QFacebook -qws -display directfb"
    /mnt/sdb1/QFacebook -qws -display directfb
else
    echo "/usr/local/bin/sns/QFacebook -qws -display directfb"
    /usr/local/bin/sns/QFacebook -qws -display directfb
fi


