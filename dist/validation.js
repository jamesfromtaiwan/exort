"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = require("./service");
const misc_1 = require("./misc");
const moment = require("moment");
/**
 * Rules class
 */
class FieldValidator {
    /**
     * Rules constructor
     * @param {FormValidator} validator
     * @param {string} fieldName
     * @param {string} fieldLabel
     */
    constructor(validator, fieldName, fieldLabel) {
        this.validator = validator;
        this.fieldName = fieldName;
        /**
         * Rules to apply
         * @type {KeyValuePair<ValidationRule>}
         */
        this.rules = {};
        /**
         * Validation errors occured
         * @type {ValidationError[]}
         */
        this.errors = [];
        this.fieldLabel = fieldLabel || misc_1._.lowerCase(fieldName);
    }
    /**
     * Email rule
     * @return {this}
     */
    email(message) {
        this.rules['email'] = {
            name: 'email',
            handle() {
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
    accepted(message) {
        this.rules['accepted'] = {
            name: 'accepted',
            handle() {
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
    after(date, message) {
        if (!moment.isMoment(date)) {
            date = moment(date);
        }
        this.rules['after'] = {
            name: 'after',
            handle() {
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
    date(message) {
        this.rules['date'] = {
            name: 'date',
            handle() {
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
    required(message) {
        this.rules['required'] = {
            name: 'required',
            handle() {
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
    afterOrEqual(date, message) {
        if (!moment.isMoment(date)) {
            date = moment(date);
        }
        this.rules['afterOrEqual'] = {
            name: 'afterOrEqual',
            handle() {
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
    alpha(message) {
        this.rules['alpha'] = {
            name: 'alpha',
            handle() {
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
    alphaDash(message) {
        this.rules['alphaDash'] = {
            name: 'alphaDash',
            handle() {
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
    alphaNum(message) {
        this.rules['alphaNum'] = {
            name: 'alphaNum',
            handle() {
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
    array(message) {
        this.rules['array'] = {
            name: 'array',
            handle() {
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
    before(date, message) {
        if (!moment.isMoment(date)) {
            date = moment(date);
        }
        this.rules['before'] = {
            name: 'before',
            handle() {
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
    beforeOrEqual(date, message) {
        if (!moment.isMoment(date)) {
            date = moment(date);
        }
        this.rules['beforeOrEqual'] = {
            name: 'beforeOrEqual',
            handle() {
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
    addError(ruleName, message, attrs) {
        this.errors.push({ rule: ruleName, message: misc_1._.template(message)(attrs || {}) });
    }
    /**
     * Get errors
     * @return {ValidationError[]}
     */
    getErrors() {
        return this.errors;
    }
    /**
     * Check validation errors is not empty
     * @return {boolean}
     */
    hasErrors() {
        return this.errors.length ? true : false;
    }
    /**
     * Validate field and save errors
     * @return {boolean}
     */
    check() {
        return __awaiter(this, void 0, void 0, function* () {
            this.errors = [];
            for (let rule in this.rules) {
                let pass = true;
                if (this.rules[rule].async) {
                    pass = yield this.rules[rule].handle.call(this);
                }
                else {
                    pass = this.rules[rule].handle.call(this);
                }
                if (!pass) {
                    this.addError(rule, this.rules[rule].message, this.rules[rule].attrs);
                }
            }
            return this.hasErrors();
        });
    }
}
exports.FieldValidator = FieldValidator;
/**
 * FormValidator class
 */
class FormValidator {
    /**
     * Validator constructor
     * @param {Validation} context
     * @param {KeyValuePair<any>} input
     */
    constructor(validation, input = {}) {
        this.validation = validation;
        this.input = input;
        /**
         * Map of field validators
         * @type {KeyValuePair<FieldValidator>}
         */
        this.fields = {};
        /**
         * Map of validation errors
         * @type {KeyValuePair<ValidationError[]>}
         */
        this.fieldErrors = {};
    }
    /**
     * Initiate rules for the given field name
     * @param  {string} fieldName
     * @param  {string} fieldLabel
     * @return {FieldValidator}
     */
    field(fieldName, fieldLabel) {
        if (!this.fields[fieldName]) {
            this.fields[fieldName] = new FieldValidator(this, fieldName, fieldLabel);
        }
        return this.fields[fieldName];
    }
    /**
     * Get validation service instance
     * @return {Validation}
     */
    getValidation() {
        return this.validation;
    }
    /**
     * Get a value from input
     * @param  {string} key
     * @return {any}
     */
    getInput(key) {
        return this.input[key];
    }
    /**
     * Validate all fields
     * @return {Promise<boolean>}
     */
    validate() {
        return __awaiter(this, void 0, void 0, function* () {
            let valid = true;
            this.fieldErrors = {};
            for (let fieldName in this.fields) {
                yield this.fields[fieldName].check();
                if (this.fields[fieldName].hasErrors()) {
                    this.fieldErrors[fieldName] = this.fields[fieldName].getErrors();
                    valid = false;
                }
            }
            return valid;
        });
    }
    /**
     * Get errors
     * @return {KeyValuePair<ValidationError[]>}
     */
    getErrors() {
        return this.fieldErrors;
    }
}
exports.FormValidator = FormValidator;
/**
 * Validator class
 */
let Validation = class Validation extends service_1.Service {
    /**
     * Check if value given is a valid email address
     * @param  {string} val
     * @return {boolean}
     */
    isEmail(val) {
        return new RegExp(`^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))` +
            `@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$`).test(val);
    }
    /**
     * Check if value is yes, 1 or true
     * @param  {boolean | string | number} val
     * @return {boolean}
     */
    isAccepted(val) {
        if (typeof val == 'string') {
            return val.toLowerCase() == 'yes';
        }
        else if (typeof val == 'boolean') {
            return val == true;
        }
        else if (typeof val == 'number') {
            return val == 1;
        }
        return false;
    }
    /**
     * Date validation
     * @param  {moment.MomentInput} date
     * @return {boolean}
     */
    isDate(date) {
        return moment(date).isValid();
    }
    /**
     * Empty check
     * @param  {any} val
     * @return {boolean}
     */
    isEmpty(val) {
        if (misc_1._.isNone(val)) {
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
    isAfter(dateToCheck, afterDate) {
        return moment(dateToCheck).isAfter(afterDate);
    }
    /**
     * After or same date validation
     * @param  {moment.MomentInput} dateToCheck
     * @param  {moment.MomentInput} afterDate
     * @return {boolean}
     */
    isAfterOrEqual(dateToCheck, afterDate) {
        return moment(dateToCheck).isSameOrAfter(afterDate);
    }
    /**
     * Alphabetic characters validation
     * @param  {string} val
     * @return {boolean}
     */
    isAlpha(val) {
        return (/^[a-zA-Z]+$/).test(val);
    }
    /**
     * Alpha dash validation
     * @param  {string} val
     * @return {boolean}
     */
    isAlphaDash(val) {
        return (/^[a-zA-Z0-9_\-]+$/).test(val);
    }
    /**
     * Alpha numeric validation
     * @param  {string} val
     * @return {boolean}
     */
    isAlphaNum(val) {
        return (/^[a-zA-Z0-9]+$/).test(val);
    }
    /**
     * Array validation
     * @param  {any} val
     * @return {boolean}
     */
    isArray(val) {
        return Array.isArray(val) && val instanceof Array;
    }
    /**
     * Before date validation
     * @param  {moment.MomentInput} dateToCheck
     * @param  {moment.MomentInput} beforeDate
     * @return {boolean}
     */
    isBefore(dateToCheck, beforeDate) {
        return moment(dateToCheck).isBefore(beforeDate);
    }
    /**
     * Before or same date validation
     * @param  {moment.MomentInput} dateToCheck
     * @param  {moment.MomentInput} beforeDate
     * @return {boolean}
     */
    isBeforeOrEqual(dateToCheck, beforeDate) {
        return moment(dateToCheck).isSameOrBefore(beforeDate);
    }
    /**
     * Create FormValidator instance
     * @param  {KeyValuePair<any>} input
     * @return {FormValidator}
     */
    createForm(input) {
        return new FormValidator(this, input);
    }
};
/**
 * Map of rule messages
 * @type {Object}
 */
Validation.RULE_MESSAGES = {
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
Validation = __decorate([
    service_1.Injectable()
], Validation);
exports.Validation = Validation;
//# sourceMappingURL=validation.js.map