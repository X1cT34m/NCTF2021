#!/bin/bash

/etc/init.d/redis-server start


for _ in {1..4}; do
  sudo --set-home --user node node /home/node/worker.js &
done

sudo --set-home --user node node /home/node/server.js
