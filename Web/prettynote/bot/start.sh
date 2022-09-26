#!/bin/bash

/etc/init.d/redis-server start

sudo --set-home --user node node /home/node/bot.js &
sudo --set-home --user node node /home/node/server.js