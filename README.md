crontab -e
@reboot cd /nextSoundboard/ && git pull && npm start dev2

TODO :
use an array for current played sound (to handle the case and style if multiple sound is played at the same time)
