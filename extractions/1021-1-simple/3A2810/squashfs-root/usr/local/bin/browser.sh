#!/bin/sh
#

echo "Enter browser.sh"
export OPERA_FB_DEVICE="/dev/fb0"
export OPERA_FB_FORMAT="ARGB32"
#export OPERA_FONTS="/usr/browser/fonts"
# export LD_DEBUG="files"
export OPERA_HOME="/tmp/browser/opera_home"
export OPERA_DIR="/usr/browser/opera_dir"
export OPERA_FB_DOUBLEBUFFER="YES"
export OPERA_SHOW_MOUSEPOINTER="NO"
export OPERA_SHOW_NAVIGATIONWINDOW="YES"
export OPERA_SHOW_MANAGERWINDOW="NO"
export OPERA_SHOW_STATUSWINDOW="YES"
export LD_LIBRARY_PATH="/usr/local/lib"
export UVA_DRM_LIB_DIR="/usr/lib"
echo "Call browserstub" $PWD
export SEGFAULT_SIGNALS=all 
export LD_PRELOAD=/mnt/sda1/bbb/libSegFault.so 
export SEGFAULT_USE_ALTSTACK=1 
#ntpdate clock.stdtime.gov.tw
/usr/local/bin/browserstub 0
#/tmp/browserstub 0
