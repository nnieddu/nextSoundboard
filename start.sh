# hcitool -i hci0 scan
bluetoothctl
trust 00:58:50:52:1A:4D
connect 00:58:50:52:1A:4D
cd ./soundboard_backend && npm start
cd .. && npm run dev2