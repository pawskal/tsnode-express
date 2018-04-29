import Application from './application';
import Injector from './injector';
import * as Interfaces from './interfaces';

const { Service,
        Controller,
        Authorization,
        Get, 
        Post, 
        Put, 
        Patch, 
        Delete,
        Before,
        After } = Injector;

export { Application,
        Service,
        Controller,
        Authorization,
        Get, 
        Post, 
        Put, 
        Patch, 
        Delete,
        Before,
        After };

export default Interfaces;
