# Byte-Barometer Watchdog

This is a simple service to start up the backend when someone visits the byte-barometer site. It is added to conserve GPU resources as much as possible, and save on costs.

## Watchdog structure

The watchdog consists consists of a basic flask REST server that exposes a `/status` endpoint where clients can fetch the current backend status. If the backend is currently scaled down to 0 instances the watchdog scales it up to 1.