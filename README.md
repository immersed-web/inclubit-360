### Inclubit 360
Incubit 360 is a solution for enabling real-time communication between a 360 video camera and a VR-headset.
The system is implemented using web technologies. The client side consists of a website and/or a desktop application.

### App / Website
The source code for the client side is implemented using the web framework [Quasar](https://quasar.dev/). Quasar has built in support for deploying the source code as either of:
  - Website
    - Single Page Application (SPA)
    - Server Side Rendered website (SSR)
    - Progressive Web App (PWA)
  - Mobile App (Android and IOS)
  - Desktop App (Windows and OSX)


### Backend
The backend consists of a few different server programs that are needed to host and serve the website content, as well as establish the link between the two peers. These services are run as [docker](https://www.docker.com/) containers. Docker is a way to run and configure a virtual subsystem/environment (container) within an OS. 
In this project, the containers are configured and defined in a docker-compose file. [Docker compose](https://docs.docker.com/compose/) is a tool for defining and running multiple containers at the same time. 

The different containers are:
  - Static File Server with automatic HTTPS
  - Signaling Server
  - STUN/TURN Server

#### File Server
The file server is an instance of [Caddy v2](https://caddyserver.com/). Caddy is a server software written in the language Go. It has built in functionality for retrieving and setting up https certificates using the free, open and automated certificate authority, [Let's Encrypt](https://letsencrypt.org/). 


////
* How caddy reverse proxies socketio and does static file serving on the rest
* How the signaling is responsible for passing on link info between the peers
* how COTURN handles STUN and TURN packets
* a section about how webrtc works
* needed ports
* describe the scripts
* describe the config of .env
* installation/setup instruction
* 
