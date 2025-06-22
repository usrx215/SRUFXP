#!/bin/sh
#

echo "Enter pandora.sh"
echo "Call pandorastub" $PWD

export QT_QWS_FONTDIR=$1
echo $QT_QWS_FONTDIR

/usr/local/bin/pandora/PandoraApp -qws -display directfb
