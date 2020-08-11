#!/bin/env bash

# a clone of
# @see https://github.com/marcelstoer/nodemcu-custom-build/blob/master/ESP8266/script.sh
# some adaptions in file name and we only need the float build

#!/bin/env bash

set -e

echo "Running 'script' for ESP8266"
# https://github.com/nodemcu/nodemcu-firmware/pull/2545 removed the toolchain from the repository but the 1.5.4.1 branch
# will always depend on it
if [ -f tools/esp-open-sdk.tar.xz ]; then tar -Jxf tools/esp-open-sdk.tar.xz; elif [ -f tools/esp-open-sdk.tar.gz ]; then tar -zxf tools/esp-open-sdk.tar.gz; fi
export PATH=$PATH:$PWD/esp-open-sdk/sdk:$PWD/esp-open-sdk/xtensa-lx106-elf/bin
make all
cd bin/
#  timestamp=$(date "+%Y-%m-%d-%H-%M-%S")
#  base_file_name="nodemcu-$X_BRANCH-$X_NUMBER_OF_MODULES-modules-"$timestamp
#  file_name_float=$base_file_name"-float.bin"

# rename the file
module_hash=$(echo "${NODEMCU_MODULES}${X_LUA_FLASH_STORE}${X_SSL_ENABLED}${X_DEBUG_ENABLED}${X_FATFS_ENABLED}" | sha512sum | cut -c1-8)
file_name_float="nodemcu-$X_BRANCH-${module_hash}-float.bin"

srec_cat  -output "${file_name_float}" -binary 0x00000.bin -binary -fill 0xff 0x00000 0x10000 0x10000.bin -binary -offset 0x10000

# we don't need the integer build
#  cd ../
#  make clean
#  make EXTRA_CCFLAGS="-DLUA_NUMBER_INTEGRAL"
#  cd bin/
#  file_name_integer=$base_file_name"-integer.bin"
#  srec_cat -output "${file_name_integer}" -binary 0x00000.bin -binary -fill 0xff 0x00000 0x10000 0x10000.bin -binary -offset 0x10000
