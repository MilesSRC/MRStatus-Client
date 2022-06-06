const { Client } = require('../dist/index.js');
const machine = new Client({
    api: `http://localhost:3000`,
    type: 'machine',
    key: "",

    data: {
        name: 'destiny',
        ip: '10.0.0.1',
        url: 'http://milesr.dev/',

        capabilities: {
            ram: 200000,
            disk: 20^5,
            network: 1000*1000*1000,
        }
    }
})

machine.once(() => {
    const client = new Client({
        api: `http://localhost:3000`,
        key: "",
        type: `service`,
        data: {
            name: `simple-service`,
            version: `1.0.0`,
            description: `A simple service`,
            machine: 'destiny',
            url: 'destiny.guardianbot.io',
            port: 3000,
    
            process: {
                pid: process.pid,
                ram: process.memoryUsage().heapUsed,
                cpu: 0
            }
        }
    });
})