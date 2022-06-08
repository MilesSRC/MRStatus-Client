import axios from 'axios';
import root from 'app-root-path';
import fs from 'fs';
import { io, Socket } from 'socket.io-client';

interface MRStatusService {
    name: string,
    description: string,
    machine: string,
    url: string,
    port: number,
    version: string,

    process: {
        pid: number,
        ram: number,
        cpu: number
    }
}

interface MRStatusSpecs {
    cpu?: number;
    ram: number;
    disk: number;
    network: number;
}

interface MRStatusMachine {
    name: string,
    ip: string,
    url: string,

    capabilities: MRStatusSpecs
}

interface MRStatusSettings {
    key: string;
    api: string;
    type: 'service' | 'machine';
    data: MRStatusService | MRStatusMachine;
}

interface MRStatusHandshakeResponse {
    message: string;
    version: string;
    socket: number;
    polling: number;
}

export class Client {
    private socket!: Socket;
    private pollingRate: number = 10000;
    private machineRetry: number = 0;
    private handshakeRetry: number = 0;
    private onReady: Function[] = [];

    private initalized: boolean = false;
    private connected: boolean = false;
    private authorized: boolean = false;

    constructor(private readonly settings: MRStatusSettings|undefined) {
        if(settings == undefined && fs.existsSync(`${root}/mrs.config.json`)){
            this.settings = JSON.parse(fs.readFileSync(`${root}/mrs.config.json`, 'utf8')) as MRStatusSettings;
        } else if(settings == undefined && !fs.existsSync(`${root}/mrs.config.json`)){ 
            throw new Error("No settings provided");
        } else if(settings != undefined){
            this.settings = settings;
        }

        if(this.settings == undefined)
            throw new Error("No settings provided");
        
        /* Handshake with server at startup */
        this.handshake();
    }

    private handshake(){
        /* Handshake with server at startup */
        axios.get(`${this.settings?.api}/api/`).then(res => {
            const handshake: MRStatusHandshakeResponse = res.data;
            this.pollingRate = handshake.polling;

            this.socket = io(this.settings?.api + "/socket/");
            this.socket.on('error', (err) => {
                throw err;
            });

            this.socket.on('message', (message: any) => {
                switch(message){
                    case 'AuthorizationRejectException':
                        throw new Error('APIKey is invalid, please check your settings');
                    case 'InvalidDataException':
                        throw new Error('Invalid data sent to server, please check your settings');
                    case "MachineNotFoundException":
                        this.machineRetry++;

                        setTimeout(() => {
                            /* Send data over */
                            this.socket.emit("submitData", {
                                type: this.settings?.type,
                                data: this.settings?.data
                            });
                        }, 5000);

                        if(this.machineRetry > 3)
                            throw new Error("Machine not found, please check your settings");
                        
                        break;
                    case "DataRejected":
                        throw new Error("Server rejected client data, please check your settings")
                    case 'Authorized':
                        this.authorized = true;
                        return this.ready();
                    case 'Hello':
                        this.connected = true;
                        this.socket.emit('authorize', this.settings?.key);
                        break;
                }
            });

            this.socket.on('disconnect', () => {
                this.connected = false;
                this.authorized = false;
            })
        }).catch(err => {
            if(err.response == undefined){
                this.handshakeRetry++;

                setTimeout(() => this.handshake(), 5000);

                if(this.handshakeRetry == 3)
                    console.warn("Could not connect to server, please check your settings");
            } else if(err.response){
                if (err.response.status == 429) {
                    throw new Error("Server ratelimited client handshake, please check your settings");
                } else if (err.response.status == 404) {
                    throw new Error("Server not found, please check your settings");
                } else if (err.response.status == 403) {
                    throw new Error("Server rejected client handshake, please check your settings");
                } else {
                    throw new Error("Server returned status code " + err.response.status + ", please check your settings");
                }
            }
        });
    }

    private ready(){
        /* Callbacks */
        if(!this.initalized)
            this.onReady.forEach(callback => { callback() });

        /* Init */
        this.initalized = true;

        /* Send data over */
        this.socket.emit("submitData", {
            type: this.settings?.type,
            data: this.settings?.data
        });

        /* Send updates when connected and authorized every pollingRate */
        if(this.connected && this.authorized){
            this.socket.emit("update", {
                data: {
                    process: {
                        pid: process.pid,
                        ram: process.memoryUsage().heapUsed,
                    }
                }
            });
        }

        setInterval(() => {
            if(this.connected && this.authorized){
                this.socket.emit("update", {
                    data: this.settings?.data
                });
            }
        }, this.pollingRate);
    }

    public once(callback: Function) {
        this.onReady.push(callback);
    }
}