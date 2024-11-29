#!/bin/bash 

# DON'T PUT http/https in the url
SERVER_DOMAIN=""
ADMIN_EMAIL=""

if [[ $SERVER_DOMAIN == "" ]]; then
    echo "Invalid server domain"
    exit
fi

if [[ $ADMIN_EMAIL == "" ]]; then
    echo "Invalid server domain"
    exit
fi

sudo apt install curl ca-certificates

# Required for postgresql
sudo install -d /usr/share/postgresql-common/pgdg
sudo curl -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc --fail https://www.postgresql.org/media/keys/ACCC4CF8.asc

# Create the repository configuration file:
sudo sh -c 'echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'

sudo apt update
sudo apt -y upgrade
sudo apt -y autoremove


# Downloading keycloak
sudo apt install -y default-jdk
wget -O keycloak.tar.gz https://github.com/keycloak/keycloak/releases/download/16.1.0/keycloak-16.1.0.tar.gz
tar -xvf keycloak.tar.gz -C ../..

# Install postgresql and setup db
sudo apt install -y postgresql-16 postgresql-client-16
sudo -H -u postgres bash -c "psql -f db-setup.sql"

# Install nodejs
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt install -y nodejs

# Install redis server
sudo apt install -y redis-server
sudo service redis-server start

# Setting up nginx
sudo apt install -y nginx
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -n --agree-tos --email $ADMIN_EMAIL -d $SERVER_DOMAIN --redirect
cp server-nginx-config nginx-config
sed -i "s/SERVER_DOMAIN/$SERVER_DOMAIN/g" nginx-config
sudo cp /etc/nginx/sites-available/default nginx-default.bak
sudo cp nginx-config /etc/nginx/sites-available/default
sudo nginx -t
sudo service nginx restart

cd ../server/
npm install
npx lerna bootstrap
npx lerna run compile
