declare module 'rrule' {
  export class RRule {
    constructor(options: RRuleOptions);
    all(callback: (date: Date) => void): Date[];
    static fromString(ruleString: string): RRule;
    static readonly SU: number;
    static readonly MO: number;
    static readonly TU: number;
    static readonly WE: number;
    static readonly TH: number;
    static readonly FR: number;
    static readonly SA: number;
  }

  export class RRuleSet extends RRule {
    constructor();
    addRule(rule: RRule): void;
    all(): Date[];
  }

  export interface RRuleOptions {
    freq: number;
    dtstart: Date;
    until: Date;
    byweekday?: (typeof RRule)[keyof typeof RRule][];  // Allows using RRule constants
    interval?: number;
  }

  export const rrulestr: (rule: string) => RRule;
}
