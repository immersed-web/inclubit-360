#THERE'S A NEW VERSION OF INCLUBIT. CHECK IT OUT


# Inclubit 360
Inclubit 360 is a solution for enabling real-time communication between a 360 video camera and a VR-headset.
The system is implemented using web technologies. The client side consists of a website running in a browser.

## App / Website
The source code for the client side is implemented using the web framework [Quasar](https://quasar.dev/). Quasar has built in support for deploying the source code as either of:
  - Website
    - Single Page Application (SPA)
    - Server Side Rendered website (SSR)
    - Progressive Web App (PWA)
  - Mobile App (Android and IOS)
  - Desktop App (Windows and OSX)

In this project the main focus has been to deploy the application as an SPA. It should (in theory) be possible, though, to deploy it as any of the others, for example a PWA.

## Backend

### Overview
The backend consists of a few different server programs that are needed to host and serve the website content, as well as establish the link between the two peers. These services are run as [docker](https://www.docker.com/) containers. Docker is a way to run and configure a virtual subsystem/environment (container) within an OS. 
In this project, the containers are configured and defined in a docker-compose file. [Docker compose](https://docs.docker.com/compose/) is a tool for defining and running multiple containers at the same time. 

The different containers are:
  - **Caddy**. Reverse proxy and static file server with automatic HTTPS
  - **Signaling Server**. WebRTC signaling implemented with nodejs and socket.io
  - **Auth Server**. Nodejs express app implementing basic authentication.
  - **STUN/TURN Server**. An instance of COTURN open source TURN-server

#### Caddy
The file server is an instance of [Caddy v2](https://caddyserver.com/). Caddy is a server software written in the language Go. It has built in functionality for retrieving and setting up https certificates using the free, open and automated certificate authority, [Let's Encrypt](https://letsencrypt.org/). In this project, Caddy is set up to act as both a static file server as well as a reverse proxy for the signaling server and auth endpoint. Key parts of the caddy configuration:
```
route { 
  route /auth/* {
    uri strip_prefix /auth 
    reverse_proxy auth:6060
  }
  reverse_proxy /socket.io/* signaling:3000
  root * /dist/spa
  try_files {path} /index.html
  file_server {
    root /dist/spa
  }
}
```
Looking at the configuration you can see that requests that matches the path ".../socket.io/..." are reverse proxied to the signaling server. The requests that matches ".../auth/..." are stripped of the "auth" prefix in the url and then proxied to the auth endpoint.
All other requests are handled as static file requests.

#### Signaling server
The signaling server is responsible for handling the negotiation between the two peers when setting up the [webRTC](https://webrtc.org/) (web Real Time Communication) link.
The signaling server is a nodejs-application

#### Auth server
The auth endpoint is a node.js server running express.js. The authentication is very rudimentary and uses [basic access authentication](https://en.wikipedia.org/wiki/Basic_access_authentication).
The node server is running in a container. The user list is kept in a json file that is mounted through a docker volume folder. The passwords are stored as is (not hashed, that is), so be sure to never reuse passwords from other services (or passwords that in some other way are considered personal).

>**Note**: Regarding navigation the auth is only used to protect some routes in the frontend. Because of the nature of SPA-applications it's not possible to 100% restrict access to those routes. SPA applications usually bundle the whole app and sends to the client, so the client have actually already downloaded the relevant pages. The frontend merely tries to check whether the user should be allowed to see it or not. Because this happens client side a bad actor could in theory extract/modify the client-side code to get access to the (already downloaded) restricted routes/pages. Although this might sound alarming it shouldn't be considered a big concern. What in reality needs protection is the data and not the interface. In this web application, the most important role of the auth server on backend-side is to restrict access to the media relaying server (COTURN) to only logged in users.

#### STUN/TURN
The STUN/TURN server is an instance of the open-source implemenation [COTURN](https://github.com/coturn/coturn). It's responsible for a some of the technical details involved when running a webRTC connection.
In general terms:
 * **STUN** - Helps the peers to find their own **external** ip-address, so they can give it to the other peer (via the signaling server).
 * **TURN** - If the peers for some reason can't setup a *direct* link using their external ip-addresses, the communication will fall back to using TURN. TURN is relaying all the communication data through the server. Usually this will be needed if the peers are behind a [symmetric NAT](https://en.wikipedia.org/wiki/Network_address_translation)
#### Data flow
![Server data flow](inclubit-server-flow.png)

### Installation

> **Prerequisites:** Initially you will need [Git](https://git-scm.com/) to be able to fetch the repository. There are some additional prerequisites to be able to run the backend. There are a few bash scripts included in the repository to help with installing those requirements. Have a look below in the section [Bash utility scripts](#bash-utility-scripts)

#### .env
This project relies on an .env file to configure relevant aspects of the system.
There is an example called `example.env` in the folder *./backend/docker*. This is just an example file. You need to create an .env file (the filename should be **.env**, only), and in this file provide the relevant settings. One way would be to duplicate the example file, rename it to .env and set the correct environment variables in the file. The example file looks like this:

**example.env**
```
# This file configures the relevant parts of the docker containers
# The file should be in same directory as docker-compose.yml on your server

### MAIN CONFIG ###

### Advicable to set the following two so they are in sync http=80, https=443
BACKEND_SERVER_PROTOCOL=https
BACKEND_DEFAULT_PORT_NUMBER=443
# The domain name of the server that runs all the containers
BACKEND_SERVER=a.domain.that.you.have.registered.and.owns

### TURN SERVER CONFIG ###
TURN_UDP_PORT=3478
TURN_TLS_PORT=5349

### THE COMMENT BELOW THIS LINE IS USED BY A SCRIPT TO REMOVE VARIABLES AFTWERWARDS
### PUT VARIABLES THAT SHOULDN*T BE INCLUDED IN FRONTEND AFTER THIS LINE
### [DONT CHANGE THIS LINE!!!] BACKEND_ONLY_VARIABLES 

### AUTH CONFIG
ADMIN_USER=adminuser
ADMIN_PASSWORD=such-secret-wow
SHARED_TURN_SECRET=SuperSecretTextSharedByAuthServerAndCoturnServer
```
A normal setup would require setting new values for:
- BACKEND_SERVER
- SHARED_TURN_SECRET
- ADMIN_USER
- ADMIN_PASSWORD

The rest could be left as is.

#### Instructions
To install inclubit backend and run it on your own server, you first need to retrieve the repository from github.
Using the terminal, go to your home folder on the server:
```
cd ~
```
Clone the repository from github:
```
git clone https://github.com/Dealerpriest/inclubit-360.git
```
Now let's install and setup everything.
cd into docker folder:
```
cd inclubit-360/backend/docker`
```
install docker:
```
./setup-docker.sh
```
install nodejs:
```
./setup.node.sh
```
build and copy frontend website:
```
./prepare-spa-build.sh
```

Now let's run the project:
```
docker-compose up --build
```


#### Update to new version
If you want to update to a new version available on github, you need to stop the docker services, pull the latest version from github, run the frontend build script, and start the docker services. If there has been any canges to how the users are stored, you might need to reset the file **users.json** (open it and clear all it's content)
Steps:
- cd into `inclubit-360/backend/docker`
- run `docker-compose down`
- run `git pull`  (if you have made local changes you might have to discard those before being able to pull)
- run the shell script `prepare-spa-build.sh`
- possibly, reset/change the file **users.json** to reflect new changes (easiest is probably to clear all text in the file, which will remove all users)
- run `docker-compose up --build`

#### Bash Utility Scripts
There are some shell scripts provided to help with seting up the environment for running the backend:
* `setup-docker.sh` - This script will attempt to download and install docker as well as docker-compose. It will try to enable docker as a daemon that starts automatically on boot. It will also create a folder called docker-persistence, for mounting volumes of the docker-containers. The volumes are used to store persistent data between building/tearing down the docker containers.
* `setup-node.sh` - This script will download and install nodejs. Nodejs is required to run the signaling server. It's also required to build the frontend website from sourcecode.
* `prepare-spa-build.sh` - This script will build the inclubit 360 frontend website and copy the result to the caddy folder to be used by the Caddy docker container. This script requires nodejs to be installed.

>**Tip:** If you can't seem to run the scripts it can be that they aren't marked as executables and thus the `./file.sh` syntax won't work. You could then either `chmod +x` the files to be executable, or perhaps easier, run them like so `/bin/bash file.sh`


#### Ports
The following ports are required to be opened on the backend server:

| Ports | Protocol  | Description |
| -------: | -------: | :----- |
| 22    | TCP       | If you need to SSH in to the server (you will) |
| 80    | TCP       | Serve standard http requests |
| 443   | TCP       | Serve standard https requests |
| 3478  | UDP       | Turn server UDP Port |
| 5349  | TCP       | Turn server TLS Port |
| 49152-65535 | UDP | Turn server p2p relaying ports |

## Credit
The project to develop and create this software was initiated by Lèv Grunberg.
The development of version 1.0.0 was a collaboration between the following organisations:
- Reasearch Institutes of Sweden (RISE)
- Kungsbacka Kommun
- Eskilstuna Kommun

## Copyright & License
This codebase (excluding external dependencies, such as libraries and/or software frameworks) is written by me, Gunnar Oledal.
External dependencies, such as libraries and/or software frameworks in this repository, holds up to their own respective licenses.

```
Inclubit 360. Web application for realtime streaming of 360 video to Virtual Reality
Copyright (c) 2021-present Gunnar Oledal gunnar.oledal@gmail.com

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
```
