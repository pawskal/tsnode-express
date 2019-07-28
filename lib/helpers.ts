export class ConfigProvider {
  [x: string]: any;
  constructor(config: any) {
    Object.assign(this, { logLevels: [], printStack: false }, config)
  }
}
