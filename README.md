# Inclubit 360
Incubit 360 is a solution for enabling real-time communication between a 360 video camera and a VR-headset.
The system is implemented using web technologies. The client side consists of a website and/or a desktop application.

## App / Website
The source code for the client side is implemented using the web framework [Quasar](https://quasar.dev/). Quasar has built in support for deploying the source code as either of:
  - Website
    - Single Page Application (SPA)
    - Server Side Rendered website (SSR)
    - Progressive Web App (PWA)
  - Mobile App (Android and IOS)
  - Desktop App (Windows and OSX)
In this project the main focus has been to deploy the application as an SPA and desktop application. It should be possible, though, to deploy it as any of the others, for example a PWA.

## Backend

### Overview
The backend consists of a few different server programs that are needed to host and serve the website content, as well as establish the link between the two peers. These services are run as [docker](https://www.docker.com/) containers. Docker is a way to run and configure a virtual subsystem/environment (container) within an OS. 
In this project, the containers are configured and defined in a docker-compose file. [Docker compose](https://docs.docker.com/compose/) is a tool for defining and running multiple containers at the same time. 

The different containers are:
  - Caddy. Reverse proxy and static file server with automatic HTTPS
  - Signaling Server
  - STUN/TURN Server

#### Caddy
The file server is an instance of [Caddy v2](https://caddyserver.com/). Caddy is a server software written in the language Go. It has built in functionality for retrieving and setting up https certificates using the free, open and automated certificate authority, [Let's Encrypt](https://letsencrypt.org/). In this project, Caddy is set up to act as both a static file server aswell as a reverse proxy for the signaling server. Key parts of the caddy configuration:
```
    reverse_proxy /socket.io/* signaling:3000
    file_server {
      root /srv
    }
  }
```
Looking at the configuration you can see that requests that matches the path ".../socket.io/..." is reverse proxied to the signaling server. All other requests are handled as static file requests.

#### Signaling server
The signaling server is responsible for handling the negotiation between the two peers when setting up the [webRTC](https://webrtc.org/) (web Real Time Communication) link.
The signaling server is a nodejs-application

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
# The domain name of the robbit server that in turn runs all the containers
BACKEND_SERVER=a.domain.that.you.have.registered.and.owns

### TURN SERVER CONFIG ###
TURN_USER=REPLACETHISWITHSOMENICENAME
TURN_PASSWORD=USEANICESECRET
TURN_UDP_PORT=3478
TURN_TLS_PORT=5349
```
A normal setup would require settings the BACKEND_SERVER, TURN_USER and TURN_PASSWORD. The rest could be left as is.

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


#### Bash Utility Scripts
There are some shell scripts provided to help with seting up the environment for running the backend:
* `setup-docker.sh` - This script will attempt to download and install docker as well as docker-compose. It will try to enable docker as a daemon that starts automatically on boot. It will also create a folder called docker-persistence, for mounting volumes of the docker-containers. The volumes are used to store persistent data between building/tearing down the docker containers.
* `setup-node.sh` - This script will download and install nodejs. Nodejs is required to run the signaling server. It's also required to build the frontend website from sourcecode.
* `prepare-spa-build.sh` - This script will build the inclubit 360 frontend website and copy the result to the caddy folder to be used by Caddy. This script requires nodejs to be installed.


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



// TODO README:
* How caddy reverse proxies socketio and does static file serving on the rest
* How the signaling is responsible for passing on link info between the peers
* how COTURN handles STUN and TURN packets
* a section about how webrtc works
* needed ports
* describe the scripts
* describe the config of .env
* installation/setup instruction
* Investigate running docker on [vmware](https://vmware.github.io/vic-product/assets/files/html/1.3/vic_app_dev/deploy_multiple_docker_compose.html)
* Investigate running on azure
* Investigate running on windows server