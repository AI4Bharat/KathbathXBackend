# Crowdsourcing Toolkit for Low-resource Communities

## Code Organization

The `server` folder implements the following three components: `backend` is the
main server built on top of nodejs, `frontend` is a react webapp that allows
admins and work requestors to interact with the main server, and the `box` is the
box server built on top of nodejs. The client app will be interacting with the 
`box` server. The remaining folders `core`, `common`, and `utils` contain various
modules that are shared between these three components of the server.

## Setup Instructions

Please see `INSTALL.md` for installation and setup instructions.

## License

We have released this code under the MIT license. Please see `LICENSE.txt` for
details.

