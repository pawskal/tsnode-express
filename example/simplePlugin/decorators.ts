import { PLUGIN_NAME } from "./index";
import { Injector } from "tsnode-express";


function testDecorator(): Function {
    return (target: any, fname: string, descriptor: PropertyDescriptor): void => {
        const plugin: any = this.plugins.get(PLUGIN_NAME);

        if(!plugin) {
            this.plugins.set(
                PLUGIN_NAME,
                {
                   data: [fname]
                }
            )
        } else {
            plugin.data = [...plugin.data, fname];
        }
    }
}

export const TestDecorator: Function = testDecorator.bind(Injector.getInstance());