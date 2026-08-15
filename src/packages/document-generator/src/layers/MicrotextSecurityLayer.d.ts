import type { SecurityLayer } from './SecurityLayer';

export class MicrotextSecurityLayer extends SecurityLayer {
  constructor(dataHash: string, config?: Record<string, any>);
}

