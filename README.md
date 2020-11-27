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


## Backend

### Overview
The backend consists of a few different server programs that are needed to host and serve the website content, as well as establish the link between the two peers. These services are run as [docker](https://www.docker.com/) containers. Docker is a way to run and configure a virtual subsystem/environment (container) within an OS. 
In this project, the containers are configured and defined in a docker-compose file. [Docker compose](https://docs.docker.com/compose/) is a tool for defining and running multiple containers at the same time. 

The different containers are:
  - Static File Server with automatic HTTPS
  - Signaling Server
  - STUN/TURN Server

#### File Server
The file server is an instance of [Caddy v2](https://caddyserver.com/). Caddy is a server software written in the language Go. It has built in functionality for retrieving and setting up https certificates using the free, open and automated certificate authority, [Let's Encrypt](https://letsencrypt.org/). 

#### Signaling server
The signaling server is responsible for handling the negotiation between the two peers when setting up the [webRTC](https://webrtc.org/) (web Real Time Communication) link.
The signaling server is a nodejs-application

#### STUN/TURN
The STUN/TURN server is an instance of the open-source implemenation [COTURN](https://github.com/coturn/coturn). It's responsible for a some of the technical details involved when running a webRTC connection.
In general terms:
 * **STUN** - Helps the peers to find their own **external** ip-address, so they can give it to the other peer (via the siganling server).
 * **TURN** - If the peers for some reason can't setup a *direct* link using their external ip-addresses, the communication will fall back to using TURN. TURN is relaying all the communication data through the server. Usually this will be needed if the peers are behind a [symmetric NAT](https://en.wikipedia.org/wiki/Network_address_translation)

### Installation

#### Ports
The following ports are required to be opened on the backend server:
* 

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