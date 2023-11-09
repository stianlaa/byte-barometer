# Byte-Barometer Watchdog

This is a simple service to start up the backend when someone arrives at the byte-barometer site. It is added to conserve GPU resources as much as possible, and save on costs.

## Watchdog structure

The watchdog consists consists of a basic flask REST server that offers a `/status` endpoint where clients can fetch the current backend status.

It also has a `request` client towards paperspace, and keeps track of when the most recent request to `/status` was, so that when a timeout has passed it fetches the existing backend config and disables the service. When a new request is received at `/status` it launches the backend anew.
