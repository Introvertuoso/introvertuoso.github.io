#!/bin/bash

CONFIG_FILE=_config.yml

# Ensure dependencies are matched and start Jekyll with live reloading
bundle check || bundle install
bundle exec jekyll serve --watch --port=8080 --host=0.0.0.0 --livereload --verbose --trace --force_polling &

while true; do
  inotifywait -q -e modify,move,create,delete $CONFIG_FILE
  if [ $? -eq 0 ]; then
    echo "Change detected to $CONFIG_FILE, restarting Jekyll"
    jekyll_pid=$(pgrep -f jekyll)
    kill -KILL $jekyll_pid
    bundle exec jekyll serve --watch --port=8080 --host=0.0.0.0 --livereload --verbose --trace --force_polling &
  fi
done
