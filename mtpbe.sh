#!/usr/bin/bash

if [ $# -ne 1 ]; then
        echo "Usage: $0 [binFile]" && exit 0
fi

! [[ -e $1 ]] && echo "File does not exist. Exiting." && exit 1
FOLDERNAME=$(basename -s .bin $1)
[[ -e $FOLDERNAME ]] && echo "Folder already exists. Exiting." && exit 1
[[ $FOLDERNAME == $(basename $1) ]] && echo "File does not have a .bin extension. Exiting." && exit 1
mkdir -vp $FOLDERNAME && cd $FOLDERNAME

FILECOUNT=$((16#$(hexdump -ve '1/4 "%.2x"' -n 4 "$1")))
for (( FILEINDEX = 0 ; FILEINDEX < $FILECOUNT ; FILEINDEX++ )); do
	ENTRYOFFSET=$(( 20 * $FILEINDEX + 4 ))
	FILESIZE=$((16#$(hexdump -ve '1/4 "%.2x"' -n 4 -s $(( ENTRYOFFSET + 12 )) "$1")))
	FILEOFFSET=$((16#$(hexdump -ve '1/4 "%.2x"' -n 4 -s $(( ENTRYOFFSET + 16 )) "$1")))
	dd if=$1 of="$FILEINDEX.png" skip=${FILEOFFSET}B bs=$FILESIZE count=1 status=none
done
