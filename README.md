### acapp

### Runtime configuration

Set these environment variables in production:

- `SIMPLE_JWT_SIGNING_KEY`: signing key for JWT tokens. Rotate this if the old hard-coded key was ever deployed.
- `ACWING_APP_ID`: AcWing OAuth app id. Defaults to `165` for local compatibility.
- `ACWING_APP_SECRET`: AcWing OAuth app secret. This must be configured for AcWing login to work.

The multiplayer consumer can start without `match_system` installed, but matching will close the websocket until `match_system.src.match_server.match_service` is available on `PYTHONPATH` and the match server is running.
