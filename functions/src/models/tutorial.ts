import Model from './model';
import Step from './step';
import { validateUrlPath } from './path-oerators';
import { URL } from "url";


export interface Parameter {
  key: string;
  value: string;
}

export interface Settings {
  once: boolean;
}

export default class Tutorial extends Model {
  name: string|null = null;

  description: string|null = null;

  domain: string|null = null;

  pathOperator = 'EQUALS';

  pathValue: string|null = null;

  parameters: Array<Parameter> = [];

  settings: Settings = {
    once: true,
  };

  buildUrl: string|null = null;

  isActive: boolean = false;

  steps: Array<Step> = [];

  gaId: string|null = null;

  gaPropertyId: string|null = null;

  constructor(init?: Partial<Tutorial>) {
    super();
    Object.assign(this, init);
  }

  couldBeShownOn(url: URL, strictCheck: boolean = false): boolean {
    let valid = false
    if (this.pathValue) {
      valid = validateUrlPath(this.pathOperator, this.pathValue, url.pathname);
    }
    if (strictCheck && this.domain && valid) {
      valid = new URL(this.domain).hostname === url.hostname;
    }
    return valid;
  }

  hasSameParameters(url: URL, strictCheck: boolean = false): boolean {
    let valid = true;
    this.parameters.forEach((parameter: Parameter) => {
      if (url.searchParams.get(parameter.key) !== parameter.value) {
        valid = false;
      }
    });
    if (strictCheck && valid) {
      valid = Array.from(url.searchParams).length === this.parameters.length;
    }
    return valid;
  }

  toPlainObject() {
    return super.toPlainObject([
      'createdAt',
      'updatedAt',
      'steps'
    ]);
  }
}
