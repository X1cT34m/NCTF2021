#!/bin/bash
cd /app
java -jar /app/*.jar \
|| java -jar /app/*.jar \
|| java -jar /app/*.jar \
|| tail -F /etc/passwd
