### NGINX and Node composed

This is an example of NGINX composed together with two node processes.

- The node server is set to fail 5% of the time and shut down.
- The NGINX server will retry the next upstream when it gets a 502 or 503.
- Docker restarts processes that die.

This results in very high availability for the deployment.
