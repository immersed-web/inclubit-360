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

> **Prerequisites:** Initially you will need [Git](https://git-scm.com/) to be able to fetch the repository. There are some additional prerequisites to be able to run the backend. There are a few bash scripts included in the repository to help with installing those requirements. Have a look below in the section "**bash utility scripts**"

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

#### Bash Utility Scripts
There are some shell scripts provided to help with seting up the environment for running the backend:


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