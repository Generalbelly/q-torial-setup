import Model from './model';

interface Trigger {
  target: string;
  event: string;
  waitingTime: number;
}

export default class Step extends Model {
  type: string = 'tooltip'; // tooltip, modal

  trigger: Trigger = {
    target: 'window', // window #id, .class
    event: 'load', // load, click, focus, error, null
    waitingTime: 0,
  };

  highlightTarget: string|null = null // #id, .class, modal

  config: Object = {};

  order: number = 0;

  pathOperator: string = 'EQUALS'; // ALL, EQUALS, STARTS_WITH, ENDS_WITH, CONTAINS, REGEX, NOT_EQUALS

  pathValue: string|null = null;

  constructor(init?: Partial<Step>) {
    super();
    Object.assign(this, init);
  }
}
