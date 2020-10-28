#!/bin/bash

echo "using nodesource to install nodejs LTS"
curl -sL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs