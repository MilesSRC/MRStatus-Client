# MRSTATUS-CLIENT
Made for interacting with status.milesr.dev to seemlessly add services, watch them, and fetch status' to display them for users.

## Requirements:
You must be running a status server to use this client
If you have access to one, you must have an API key (this is usually retreieved on startup of the server or manual input)

## Usage:
in a file where you can access it via globals or etc.

### Service Example
```typescript
import Client from 'mrstatus';
const client = new Client({
    key: 'your-api-key-here',
    type: 'service', // or 'machine' to define a server
    name: 'your-service-name-here',
    description: 'your-service-description-here',
    machine: 'your-machine-name-here',
    port: 0000, /* needs to be a number to reach this service, optional, you can use a common port like 80 or 8080 if you need to. but something is required here */
    version: require('package.json').version,
    url: 'http://status.milesr.dev/', // a url to reach this service
});

// Methods:
client.forceUpdate(): Void; // Sends a forceful update to the server

client.updateVersion(version: string): Void; // Updates the version of the service

client.reconnect(): Void; // Reconnects to the server

client.issues(): Void; // Notifies the server of issues, like errors or warnings popping up.

client.setAuthFallback(() => {}): Void; // Sets a function to be called when the client fails to authenticate
```

### Machine Example
```typescript
import Client from 'mrstatus';
const client = new Client({
    key: 'your-api-key-here',
    type: 'machine', // or 'service' to define a service
    name: 'your-machine-name-here',
    ip: 'resolve-your-ip-here',
    url: 'http://status.milesr.dev/', // a url to reach this machine
});
```

# ⚠️ Warning:
Machine clients are not allowed to do many methods as the server only requires information about them when nessecary.

Clients also start up and start connecting on initalization.