
if [ ! -e /var/local ]; then
    mkdir /var/local
fi

#!/bin/sh

/usr/local/bin/ixchariot/ixchariot-v6.4/ixchariot/endpoint &
