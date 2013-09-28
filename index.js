var _ = require('lodash');

module.exports = {
    buildValidator: buildValidator,
    ValidationError: ValidationError,
    validString: validString,
    validNumber: validNumber,
    chain: chain,
    and: chain,
    conjunction: chain,
    or: disjunction,
    disjunction: disjunction
};

function buildValidator(description) {
    'use strict';
    var validator = {},
        must_have = [];
    _.forOwn(description, function (value, key) {
        if (key[0] === "?") {
            validator[key.slice(1)] = description[key];
        } else if (key[0] === "-") {
            must_not_have.push(key.slice(1));
        } else {
            must_have.push(key);
            validator[key] = description[key];
        }
    });
    return function validate(object, err) {
        if (!_.all(must_have, _.curry(_.has)(object))) {
            var missing_keys = _.difference(must_have, _.keys(object))
            return err(object, missing_keys, new ValidationError("VALIDATION ERROR: Object does not contain all required fields"));
        } else {
            _.forOwn(validator, function(valid_func, key) {
                if (object.hasOwnProperty(key)) {
                    object[key] = valid_func(object[key], key);
                }
            });
            if (_.any(object, is_validation_error)) {
                return err(object);
            } else {
                return object;
            }
        }
    };
}

function ValidationError(message, key, value) {
    this.key = key;
    this.value = value;
    this.message = message;
}

function is_validation_error(value) {
    return value instanceof ValidationError;
}

function validString(value) {
    return abstractValid(value, _.isString, "String");
}

function validNumber(value) {
    return abstractValid(value, _.isNumber, "Number");
}

function abstractValid(value, type_func, type) {
    return function(input, key) {
        if (type_func(input)) {
            if (value && input !== value) {
                return new ValidationError(input + " does not equal required value " + value, key, input);
            } else {
                return input;
            }
        } else {
            return new ValidationError((key || "Input") + " is not of required type " + type, key, input);
        }
    }
}

function maybe(f) {
    return function() {
        if (arguments[0] instanceof ValidationError) return arguments[0];
        else return f.apply(this, arguments);
    }
}

function chain() {
    var args = Array.prototype.slice.call(arguments);
    args = args.map(function(func) {
        return maybe(func);
    });
    return _.compose.apply(this, args.reverse());
}

function disjunction() {
    var args = Array.prototype.slice.call(arguments);
    return function(input) {
        var inputs = Array.prototype.slice.call(arguments);
        args = _.map(args, function(func) {
            return func.apply(this, inputs);
        });
        if (!_.all(args, is_validation_error)) {
            return input;
        } else return args;
    }
}
