#!/bin/sh

export LD_LIBRARY_PATH=/usr/local/lib
if [ -d "/misc/cinemanow/v2/CN/1_00" ] || [ -d "/misc/cinemanow/v2/CN/41_00" ] || [ -d "/misc/cinemanow/v2/TRU/1_00" ] || [ -d "/misc/cinemanow/v2/CPX/41_00" ] || [ -d "/misc/cinemanow/v2/TT/1_00" ] || [ -d "/misc/cinemanow/v2/KHM/82_00" ]
then
echo "credential folder already exists"
else
echo "create the credential folder"
mkdir -p /misc/cinemanow/v2/CPX/41_00
mkdir -p /misc/cinemanow/v2/TRU/1_00
mkdir -p /misc/cinemanow/v2/CN/1_00
mkdir -p /misc/cinemanow/v2/CN/41_00
mkdir -p /misc/cinemanow/v2/TT/1_00
mkdir -p /misc/cinemanow/v2/KHM/82_00

fi

/usr/local/bin/cinemanow/v2_4/OrbitTestApp $* 
