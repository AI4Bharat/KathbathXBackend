# Platform Installation Instructions

In this document, we will describe the basic setup and installation of the
platform. You can setup and try out the platform using a single machine and a
smartphone.

## Prerequisites

Karya uses the following apps for things for operating. Most of the requirements will be handled by the
setup script except for Azure blob store and Google OpenID.

1. **Postgresql Server** (version 12 or above) - Postgres drives our main database. (Done by setup script)
2. **Redis Server** - Needed for bull library. (Done by setup script)
3. **Azure blob store** - You need to provide the account name and key as part of the
   configuration
4. **Google OpenID Client ID** - This is needed for authenticating work
   providers and admins with the server.
5. **Keycloak** - Karya uses Keycloak for role management on the server side. (Done by the setup script)

## Common Setup

### 1. Clone the repository.

### 2. Before we run the setup script we have to specify the database details.
    
1. Specify the database name, user name and password.
2. Uncomment the SQL queries.

### 3. Run the setup script
1. Specify the SERVER_DOMAIN and ADMIN_EMAIL in the `setup.sh` file.
2. Run the script `bash setup.sh`.

Note: The setup script handles the following things:
- Install all the requirements like PostgreSQL, Redis, and Keycloak.
- Setup nginx as a reverse proxy and add SSL
- Build the NodeJS app.

## Keycloak Setup

### 1. Start the keycloak server

`# keycloak-16.1.0> ./bin/standalone.sh`

### 2. Create an admin account on keycloak
1. Before you can use Keycloak, you need to create an admin account, which will be used to log in to the Keycloak admin console.
2. Open `http://localhost:8080/auth` or `<SERVER_URL>/keycloak/auth` in your web browser. The welcome page opens, confirming that the server is running.
3. Enter a username and password to create an initial admin user.

Note: The keycloak username and password are required in the following steps.

## Main server setup

### 1. Rename the .sample.env to .env in the server/backend and fill in all the required details.

### 2. Reset the database

`# server/backend> node dist/scripts/ResetDB.js`

This command resets the database and bootstraps authentication. Anyone who
wants to sign up on the platform (admin/work provider) needs an access code.
This script sets up an admin record and spits out the access code for the admin
to sign up.

### 3. Start the server

`# server/backend> node dist/Server.js`

## Setup the frontend

### 1. Setup the config file

Copy the `.sample.env` file to `.env` and fill out the fields.

### 2. Run the frontend server

`# server/frontend> npm start`

### 3. Sign up the admin user

Open the frontend server URL on a browser. Sign up using the admin access code
that you received from the backend `ResetDB.js` script.

### 4. Create a new box

Click on the "Box" tab and generate an access code for a new box.

## Box Server Setup

### 1. Setup the config file

Copy the `.sample.env` file to `.env` and fill out the fields.

### 2. Setup box-specific config

Copy the `.sample.box` file to another file (say `.box.1`) and fill out the
details of the box.


### 3. Start the box server

`# server/box> node dist/Server.js`
