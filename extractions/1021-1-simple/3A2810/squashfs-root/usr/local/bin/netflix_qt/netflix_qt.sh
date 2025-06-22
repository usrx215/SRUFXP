#!/bin/sh

#Netflix 4.0 config
#defaut source is delicated App Icon
#it will be set in setenv("NF_BUTTON_SRC") in nf_stub. 
echo "### Start Netflix from button source: "${NF_BUTTON_SRC}
echo "### Start Netflix contains title id: " ${NF_TITLE_ID}
TRACE=7
if [ "$NF_DBG_TRACE" = "" ]; then
	TRACE=7
else
	TRACE=$NF_DBG_TRACE
fi

echo "### Start Netflix with Trace Level: "${TRACE}

echo "### Start Netflix with params: "${LAUNCHPARAMS}

export NF_IDFILE=/misc/nf/sysdata/SDK.bin
#read-only resource data(css,html, ca files)
export NF_DATA_DIR=/usr/share/netflix/32/data
export QWS_DISPLAY=directfb
export NF_DISK_CACHE_PATH=/tmp/nf/gibbon
export NF_CACHE_PATH=/misc/nf/cache
export QT_PLUGIN_PATH=/plugins

echo "Call nfq_stub" $PWD
#/usr/local/bin/netflix_qt/netflix -Q source_type=${NF_BUTTON_SRC} -jz -T ${TRACE}
/usr/local/bin/netflix_qt/netflix -Q source_type=${NF_BUTTON_SRC}
echo "******netflix qt process exit!******"
