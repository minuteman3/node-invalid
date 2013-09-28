var _ = require('lodash');


function invalid(description) {
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
            return new ValidationError(key + " is not of required type " + type, key, input);
        }
    }
}
