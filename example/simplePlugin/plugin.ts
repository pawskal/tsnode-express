import {IPlugin, ConfigProvider, Application} from "tsnode-express";
import {success, warning, error, info} from 'nodejs-lite-logger';

@Reflect.metadata('design', 'paramtypes')
export class TestPlugin implements IPlugin {

    private _params: any;

    constructor(public application: Application, private config: ConfigProvider) {

    }

    public setParams(params: any){
        this._params = params;
    }

    get params(){
        return this._params;
    }

    getConfig(key: string){
        return this.config[key];
    }
}