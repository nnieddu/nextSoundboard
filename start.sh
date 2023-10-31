#!/bin/sh
# hcitool -i hci0 scan // to scan available devices

bluetoothctl <<EOF
trust 00:58:50:52:1A:4D
connect 00:58:50:52:1A:4D
EOF

cd ./soundboard_backend
npm start &
sleep 5
cd ..
npm run dev2