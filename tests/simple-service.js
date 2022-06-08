const { Client } = require('../dist/index.js');
const os = require('os');

const machine = new Client({
    api: `http://localhost:3000`,
    type: 'machine',
    key: "4dcb7e3df71f064f9c92d0a50aa86eeb0e3871dc455d6071debc504e65090d60db3b6507cf69ad04ad59e8310168f855c6928ffaf6cb5b57fd28322a7907f9b376a4fcff95c7d9a4798acd30d69d2a32fa0764363c2e9210b2a3a0e4817d6b85db680be6267eb9200152112027224a7528494e6d0e277757bd6788cadfe3c9ab3e9ce279d2078b368621a455e62ee544e753b3ded4babeef8a753b9cbcdadb9eae675c097ba7963a39ba9502ff290d13d1048725b5cfd73d5e4582a875ec84ebc0dcfacf51e3e93080819e406663dee117381c3a3837cfe91068225075c063c06f2cfeb13ac9279b47377ee31083f6ca6e867974a632a0933f873b339d84f7eb",

    data: {
        name: 'destiny',
        ip: '10.0.0.1',
        url: 'https://milesr.dev/',

        capabilities: {
            ram: os.totalmem(),
            disk: 20^5,
            network: 1000*1000*1000,
        }
    }
})

const machine2 = new Client({
    api: `http://localhost:3000`,
    type: 'machine',
    key: "",

    data: {
        name: 'titan',
        ip: '10.0.0.1',
        url: 'https://milesr.dev/',

        capabilities: {
            ram: os.totalmem(),
            disk: 20^5,
            network: 1000*1000*1000,
        }
    }
})

machine.once(() => {
    for(let i=0; i < 10; i++){
        new Client({
            api: `http://localhost:3000`,
            key: "",
            type: `service`,
            data: {
                name: `simple-service-${i}`,
                version: `1.0.0`,
                description: `A simple service`,
                machine: 'destiny',
                url: 'https://destiny.guardianbot.io',
                port: 3000,
        
                process: {
                    pid: process.pid,
                    ram: process.memoryUsage().heapUsed,
                    cpu: 0
                }
            }
        });
    }
})