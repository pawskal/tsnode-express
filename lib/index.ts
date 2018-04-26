import Application from './application';
import { Injector } from './injector';

import * as Interfaces from './interfaces';

Injector.getInstance();

const { Service,
        Controller,
        Authorization,
        Get, 
        Post, 
        Put, 
        Patch, 
        Delete } = Injector;

export { Application,
        Service,
        Controller,
        Authorization,
        Get, 
        Post, 
        Put, 
        Patch, 
        Delete };

export default Interfaces;