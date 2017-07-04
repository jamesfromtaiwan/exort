import { Service, Injectable } from './service';
import { KeyValuePair, _ } from './misc';
import * as moment from 'moment';

/**
 * Rule interface
 */
export interface ValidationRule {
  name: string;
  async?: boolean;
  handle(this: FieldValidator): boolean | Promise<boolean>;
  message: string;
  attrs: KeyValuePair<string | number>;
}

/**
 * FieldValidationError interface
 */
export interface FieldValidationError {
  rule: string;
  message: string;
}

/**
 * FormValidationError class
 */
export class FormValidationError extends Error {

  /**
   * FormValidationError constructor
   * @param {KeyValuePair<FieldValidationError[]>} fieldErrors
   * @param {string} message
   */
  constructor(public readonly fields: KeyValuePair<FieldValidationError[]>, message?: string) {
    super(message || 'Invalid form input');
    this.name = this.constructor.name;
  }

  /**
   * Get first error message from a particular field
   * @param  {string} fieldName
   * @return {string | undefined}
   */
  public getFirstMessage(fieldName: string): string | undefined {
    if (typeof this.fields[fieldName] == 'undefined' || !this.fields[fieldName].length) return;
    return this.fields[fieldName][0].message;
  }

  /**
   * Generate combined error message
   * @param  {string} mergeToken
   * @return {string}
   */
  public getCompiledMessage(mergeToken: string = '\n'): string {
    let message: string[] = [];
    for (let fieldName in this.fields) {
      for (let fieldError of this.fields[fieldName]) {
        message.push(fieldError.message);
      }
    }
    return message.join(mergeToken);
  }
}

/**
 * Rules class
 */
export class FieldValidator {

  /**
   * Rules to apply
   * @type {KeyValuePair<ValidationRule>}
   */
  private rules: KeyValuePair<ValidationRule> = {};

  /**
   * Validation errors occured
   * @type {FieldValidationError[]}
   */
  private errors: FieldValidationError[] = [];

  /**
   * Field label
   * @type {string}
   */
  public readonly fieldLabel: string;

  /**
   * Rules constructor
   * @param {FormValidator} validator
   * @param {string} fieldName
   * @param {string} fieldLabel
   */
  constructor(private validator: FormValidator, public readonly fieldName: string, fieldLabel?: string) {
    this.fieldLabel = fieldLabel || _.lowerCase(fieldName);
  }

  /**
   * Email rule
   * @return {this}
   */
  public email(message?: string): this {
    this.rules['email'] = {
      name: 'email',
      handle(this) {
        return this.validator.getValidation().isEmail(this.validator.getInput(this.fieldName));
      },
      message: message || Validation.RULE_MESSAGES.email,
      attrs: {
        label: this.fieldLabel
      }
    };
    return this;
  }

  /**
   * The field under validation must be yes, on, 1, or true. This is useful for validating "Terms of Service" acceptance.
   * @param  {string} message
   * @return {this}
   */
  public accepted(message?: string): this {
    this.rules['accepted'] = {
      name: 'accepted',
      handle(this) {
        return this.validator.getValidation().isAccepted(this.validator.getInput(this.fieldName));
      },
      message: message || Validation.RULE_MESSAGES.accepted,
      attrs: {
        label: this.fieldLabel
      }
    };
    return this;
  }

  /**
   * The field under validation must be a value after a given date. The dates will be passed into moment library.
   * @param  {moment.MomentInput} date
   * @param  {string} message
   * @return {this}
   */
  public after(date: moment.MomentInput, message?: string): this {
    if (!moment.isMoment(date)) {
      date = moment(date);
    }
    this.rules['after'] = {
      name: 'after',
      handle(this) {
        return this.validator.getValidation().isAfter(this.validator.getInput(this.fieldName), date);
      },
      message: message || Validation.RULE_MESSAGES.after,
      attrs: {
        label: this.fieldLabel,
        date: date.toString()
      }
    };
    return this;
  }

  /**
   * The field under validation must be a valid date according to moment library
   * @param  {string} message
   * @return {this}
   */
  public date(message?: string): this {
    this.rules['date'] = {
      name: 'date',
      handle(this) {
        return this.validator.getValidation().isDate(this.validator.getInput(this.fieldName));
      },
      message: message || Validation.RULE_MESSAGES.date,
      attrs: {
        label: this.fieldLabel
      }
    };
    return this;
  }

  /**
   * The field under validation must be present in the input data and not empty.
   * @param  {string} message
   * @return {this}
   */
  public required(message?: string): this {
    this.rules['required'] = {
      name: 'required',
      handle(this) {
        return !this.validator.getValidation().isEmpty(this.validator.getInput(this.fieldName));
      },
      message: message || Validation.RULE_MESSAGES.required,
      attrs: {
        label: this.fieldLabel
      }
    };
    return this;
  }

  /**
   * The field under validation must be a value after or equal to the given date. The dates will be passed into moment library.
   * @param  {moment.MomentInput} date
   * @param  {string} message
   * @return {this}
   */
  public afterOrEqual(date: moment.MomentInput, message?: string): this {
    if (!moment.isMoment(date)) {
      date = moment(date);
    }
    this.rules['afterOrEqual'] = {
      name: 'afterOrEqual',
      handle(this) {
        return this.validator.getValidation().isAfterOrEqual(this.validator.getInput(this.fieldName), date);
      },
      message: message || Validation.RULE_MESSAGES.afterOrEqual,
      attrs: {
        label: this.fieldLabel,
        date: date.toString()
      }
    };
    return this;
  }

  /**
   * The field under validation must be entirely alphabetic characters.
   * @param  {string} message
   * @return {this}
   */
  public alpha(message?: string): this {
    this.rules['alpha'] = {
      name: 'alpha',
      handle(this) {
        return this.validator.getValidation().isAlpha(this.validator.getInput(this.fieldName));
      },
      message: message || Validation.RULE_MESSAGES.alpha,
      attrs: {
        label: this.fieldLabel
      }
    };
    return this;
  }

  /**
   * The field under validation may have alpha-numeric characters, as well as dashes and underscores.
   * @param  {string} message
   * @return {this}
   */
  public alphaDash(message?: string): this {
    this.rules['alphaDash'] = {
      name: 'alphaDash',
      handle(this) {
        return this.validator.getValidation().isAlphaDash(this.validator.getInput(this.fieldName));
      },
      message: message || Validation.RULE_MESSAGES.alphaDash,
      attrs: {
        label: this.fieldLabel
      }
    };
    return this;
  }

  /**
   * The field under validation must be entirely alpha-numeric characters.
   * @param  {string} message
   * @return {this}
   */
  public alphaNum(message?: string): this {
    this.rules['alphaNum'] = {
      name: 'alphaNum',
      handle(this) {
        return this.validator.getValidation().isAlphaNum(this.validator.getInput(this.fieldName));
      },
      message: message || Validation.RULE_MESSAGES.alphaNum,
      attrs: {
        label: this.fieldLabel
      }
    };
    return this;
  }

  /**
   * The field under validation must be a JavasScript array.
   * @param  {string} message
   * @return {this}
   */
  public array(message?: string): this {
    this.rules['array'] = {
      name: 'array',
      handle(this) {
        return this.validator.getValidation().isArray(this.validator.getInput(this.fieldName));
      },
      message: message || Validation.RULE_MESSAGES.array,
      attrs: {
        label: this.fieldLabel
      }
    };
    return this;
  }

  /**
   * The field under validation must be a value preceding the given date. The dates will be passed into moment library.
   * @param  {moment.MomentInput} date
   * @param  {string} message
   * @return {this}
   */
  public before(date: moment.MomentInput, message?: string): this {
    if (!moment.isMoment(date)) {
      date = moment(date);
    }
    this.rules['before'] = {
      name: 'before',
      handle(this) {
        return this.validator.getValidation().isBefore(this.validator.getInput(this.fieldName), date);
      },
      message: message || Validation.RULE_MESSAGES.before,
      attrs: {
        label: this.fieldLabel,
        date: date.toString()
      }
    };
    return this;
  }

  /**
   * The field under validation must be a value preceding or equal to the given date. The dates will be passed into moment library.
   * @param  {moment.MomentInput} date
   * @param  {string} message
   * @return {this}
   */
  public beforeOrEqual(date: moment.MomentInput, message?: string): this {
    if (!moment.isMoment(date)) {
      date = moment(date);
    }
    this.rules['beforeOrEqual'] = {
      name: 'beforeOrEqual',
      handle(this) {
        return this.validator.getValidation().isBeforeOrEqual(this.validator.getInput(this.fieldName), date);
      },
      message: message || Validation.RULE_MESSAGES.beforeOrEqual,
      attrs: {
        label: this.fieldLabel,
        date: date.toString()
      }
    };
    return this;
  }

  /**
   * Add error message
   * @param  {string} ruleName
   * @param  {string} message
   * @param  {KeyValuePair<string | number>} attrs
   * @return {void}
   */
  public addError(ruleName: string, message: string, attrs?: KeyValuePair<string | number>): void {
    this.errors.push({ rule: ruleName, message: _.template(message)(attrs || {}) });
  }

  /**
   * Get errors
   * @return {FieldValidationError[]}
   */
  public getErrors(): FieldValidationError[] {
    return this.errors;
  }

  /**
   * Check validation errors is not empty
   * @return {boolean}
   */
  public hasErrors(): boolean {
    return this.errors.length ? true : false;
  }

  /**
   * Validate field and save errors
   * @return {boolean}
   */
  public async check(): Promise<boolean> {
    this.errors = [];
    for (let rule in this.rules) {

      let pass = true;
      if (this.rules[rule].async) {
        pass = await this.rules[rule].handle.call(this);
      } else {
        pass = this.rules[rule].handle.call(this);
      }

      if (!pass) {
        this.addError(rule, this.rules[rule].message, this.rules[rule].attrs);
      }
    }

    return this.hasErrors();
  }
}

/**
 * FormValidator class
 */
export class FormValidator {

  /**
   * Map of field validators
   * @type {KeyValuePair<FieldValidator>}
   */
  private fields: KeyValuePair<FieldValidator> = {};

  /**
   * Map of validation errors
   * @type {KeyValuePair<FieldValidationError[]>}
   */
  private fieldErrors: KeyValuePair<FieldValidationError[]> = {};

  /**
   * Validator constructor
   * @param {Validation} context
   * @param {KeyValuePair<any>} input
   */
  constructor(private validation: Validation, private input: KeyValuePair<any> = {}) {}

  /**
   * Initiate rules for the given field name
   * @param  {string} fieldName
   * @param  {string} fieldLabel
   * @return {FieldValidator}
   */
  public field(fieldName: string, fieldLabel?: string): FieldValidator {
    if (!this.fields[fieldName]) {
      this.fields[fieldName] = new FieldValidator(this, fieldName, fieldLabel);
    }
    return this.fields[fieldName];
  }

  /**
   * Get validation service instance
   * @return {Validation}
   */
  public getValidation(): Validation {
    return this.validation;
  }

  /**
   * Get a value from input
   * @param  {string} key
   * @return {any}
   */
  public getInput(key: string): any {
    return this.input[key];
  }

  /**
   * Validate all fields
   * @return {Promise<boolean>}
   */
  public async validate(): Promise<boolean> {
    let valid = true;
    this.fieldErrors = {};
    for (let fieldName in this.fields) {
      await this.fields[fieldName].check();
      if (this.fields[fieldName].hasErrors()) {
        this.fieldErrors[fieldName] = this.fields[fieldName].getErrors();
        valid = false;
      }
    }
    return valid;
  }

  /**
   * Check if form validator has errors
   * @return {boolean}
   */
  public hasErrors(): boolean {
    return Object.keys(this.fieldErrors).length > 0;
  }

  /**
   * Validate and throw error if validation fails
   * @return {Promise<void>}
   */
  public async validateAndThrow(): Promise<void> {
    if (!(await this.validate())) {
      throw new FormValidationError(this.getErrors());
    }
  }

  /**
   * Get errors
   * @return {KeyValuePair<FieldValidationError[]>}
   */
  public getErrors(): KeyValuePair<FieldValidationError[]> {
    return this.fieldErrors;
  }
}

/**
 * Validator class
 */
@Injectable()
export class Validation extends Service {

  /**
   * Map of rule messages
   * @type {Object}
   */
  public static readonly RULE_MESSAGES = {
    accepted: 'The ${label} must be accepted.',
    activeUrl: 'The ${label} is not a valid URL.',
    after: 'The ${label} must be a date after ${date}.',
    afterOrEqual: 'The ${label} must be a date after or equal to ${date}.',
    alpha: 'The ${label} may only contain letters.',
    alphaDash: 'The ${label} may only contain letters, numbers, and dashes.',
    alphaNum: 'The ${label} may only contain letters and numbers.',
    array: 'The ${label} must be an array.',
    before: 'The ${label} must be a date before ${date}.',
    beforeOrEqual: 'The ${label} must be a date before or equal to ${date}.',
    between: {
      numeric: 'The ${label} must be between ${min} and ${max}.',
      file: 'The ${label} must be between ${min} and ${max} kilobytes.',
      string: 'The ${label} must be between ${min} and ${max} characters.',
      array: 'The ${label} must have between ${min} and ${max} items.'
    },
    boolean: 'The ${label} field must be true or false.',
    confirmed: 'The ${label} confirmation does not match.',
    date: 'The ${label} is not a valid date.',
    dateFormat: 'The ${label} does not match the format :format.',
    different: 'The ${label} and ${other} must be different.',
    digits: 'The ${label} must be ${digits} digits.',
    digitsBetween: 'The ${label} must be between ${min} and ${max} digits.',
    dimensions: 'The ${label} has invalid image dimensions.',
    distinct: 'The ${label} field has a duplicate value.',
    email: 'The ${label} must be a valid email address.',
    exists: 'The selected ${label} is invalid.',
    file: 'The ${label} must be a file.',
    filled: 'The ${label} field must have a value.',
    image: 'The ${label} must be an image.',
    in: 'The selected ${label} is invalid.',
    inArray: 'The ${label} field does not exist in ${other}.',
    integer: 'The ${label} must be an integer.',
    ip: 'The ${label} must be a valid IP address.',
    ipv4: 'The ${label} must be a valid IPv4 address.',
    ipv6: 'The ${label} must be a valid IPv6 address.',
    json: 'The ${label} must be a valid JSON string.',
    max: {
      numeric: 'The ${label} may not be greater than ${max}.',
      file: 'The ${label} may not be greater than ${max} kilobytes.',
      string: 'The ${label} may not be greater than ${max} characters.',
      array: 'The ${label} may not have more than ${max} items.'
    },
    mimes: 'The ${label} must be a file of type: ${values}.',
    mimeTypes: 'The ${label} must be a file of type: ${values}.',
    min: {
      numeric: 'The ${label} must be at least ${min}.',
      file: 'The ${label} must be at least ${min} kilobytes.',
      string: 'The ${label} must be at least ${min} characters.',
      array: 'The ${label} must have at least ${min} items.'
    },
    notIn: 'The selected ${label} is invalid.',
    numeric: 'The ${label} must be a number.',
    present: 'The ${label} field must be present.',
    regex: 'The ${label} format is invalid.',
    required: 'The ${label} field is required.',
    requiredIf: 'The ${label} field is required when ${other} is :value.',
    requiredUnless: 'The ${label} field is required unless ${other} is in ${values}.',
    requiredWith: 'The ${label} field is required when ${values} is present.',
    requiredWithAll: 'The ${label} field is required when ${values} is present.',
    requiredWithout: 'The ${label} field is required when ${values} is not present.',
    requiredWithoutAll: 'The ${label} field is required when none of ${values} are present.',
    same: 'The ${label} and ${other} must match.',
    size: {
      numeric: 'The ${label} must be ${size}.',
      file: 'The ${label} must be ${size} kilobytes.',
      string: 'The ${label} must be ${size} characters.',
      array: 'The ${label} must contain ${size} items.'
    },
    string: 'The ${label} must be a string.',
    timezone: 'The ${label} must be a valid zone.',
    unique: 'The ${label} has already been taken.',
    uploaded: 'The ${label} failed to upload.',
    url: 'The ${label} format is invalid.',
  };

  /**
   * Check if value given is a valid email address
   * @param  {string} val
   * @return {boolean}
   */
  public isEmail(val: string): boolean {
    return new RegExp(
      `^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))` +
      `@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$`
    ).test(val);
  }

  /**
   * Check if value is yes, 1 or true
   * @param  {boolean | string | number} val
   * @return {boolean}
   */
  public isAccepted(val: string | boolean | number): boolean {
    if (typeof val == 'string') {
      return val.toLowerCase() == 'yes';
    } else if (typeof val == 'boolean') {
      return val == true;
    } else if (typeof val == 'number') {
      return val == 1;
    }
    return false;
  }

  /**
   * Date validation
   * @param  {moment.MomentInput} date
   * @return {boolean}
   */
  public isDate(date: moment.MomentInput): boolean {
    return moment(date).isValid();
  }

  /**
   * Empty check
   * @param  {any} val
   * @return {boolean}
   */
  public isEmpty(val: any): boolean {
    if (_.isNone(val)) {
      return true;
    }
    let str = `${val}`.replace(/\s/g, '');
    return str.length > 0 ? false : true;
  }

  /**
   * After date validation
   * @param  {moment.MomentInput} dateToCheck
   * @param  {moment.MomentInput} afterDate
   * @return {boolean}
   */
  public isAfter(dateToCheck: moment.MomentInput, afterDate: moment.MomentInput): boolean {
    return moment(dateToCheck).isAfter(afterDate);
  }

  /**
   * After or same date validation
   * @param  {moment.MomentInput} dateToCheck
   * @param  {moment.MomentInput} afterDate
   * @return {boolean}
   */
  public isAfterOrEqual(dateToCheck: moment.MomentInput, afterDate: moment.MomentInput) {
    return moment(dateToCheck).isSameOrAfter(afterDate);
  }

  /**
   * Alphabetic characters validation
   * @param  {string} val
   * @return {boolean}
   */
  public isAlpha(val: string): boolean {
    return (/^[a-zA-Z]+$/).test(val);
  }

  /**
   * Alpha dash validation
   * @param  {string} val
   * @return {boolean}
   */
  public isAlphaDash(val: string): boolean {
    return (/^[a-zA-Z0-9_\-]+$/).test(val);
  }

  /**
   * Alpha numeric validation
   * @param  {string} val
   * @return {boolean}
   */
  public isAlphaNum(val: string): boolean {
    return (/^[a-zA-Z0-9]+$/).test(val);
  }

  /**
   * Array validation
   * @param  {any} val
   * @return {boolean}
   */
  public isArray(val: any): boolean {
    return Array.isArray(val) && val instanceof Array;
  }

  /**
   * Before date validation
   * @param  {moment.MomentInput} dateToCheck
   * @param  {moment.MomentInput} beforeDate
   * @return {boolean}
   */
  public isBefore(dateToCheck: moment.MomentInput, beforeDate: moment.MomentInput): boolean {
    return moment(dateToCheck).isBefore(beforeDate);
  }

  /**
   * Before or same date validation
   * @param  {moment.MomentInput} dateToCheck
   * @param  {moment.MomentInput} beforeDate
   * @return {boolean}
   */
  public isBeforeOrEqual(dateToCheck: moment.MomentInput, beforeDate: moment.MomentInput) {
    return moment(dateToCheck).isSameOrBefore(beforeDate);
  }

  /**
   * Create FormValidator instance
   * @param  {KeyValuePair<any>} input
   * @return {FormValidator}
   */
  public createForm(input: KeyValuePair<any>): FormValidator {
    return new FormValidator(this, input);
  }
}