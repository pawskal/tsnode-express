export abstract class IInjectedService {
  stub: string
};

export class InjectedService extends IInjectedService {
  stub: string
  constructor(opts) {
    super();
    Object.assign(this, opts);
  }
}
