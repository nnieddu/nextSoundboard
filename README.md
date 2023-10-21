crontab -e
@reboot cd /nextSoundboard/ && git pull && npm start dev
