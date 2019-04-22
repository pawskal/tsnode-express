import http from 'http';
import { info } from 'nodejs-lite-logger';
import application from './server';
import {ITransportProvider} from "../lib";
application.start((express, configProvider, transport: ITransportProvider) =>{
    transport.subscribe(configProvider.transportChannel);
})
