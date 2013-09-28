node-invalid
============

Simple value/object validator for NodeJS.

Syntax
======

When defining a description object, all keys specified that are not prefaced with the symbol "?" are required in the input object.

For example:

    {
        "foo": ...,
        "bar": ...,
        "?baz": ...
    }

If passed as a description to create a validator function would result in a validator which upon execution would invoke the error callback if a given object did not have the properties "foo" and "bar", but which would permit objects that lack the property "baz", but still perform the specified actions on the property "baz" if it is present.

Chaining and Manipulation
=========================

The chain function can be used to chain multiple validators together. If any validator in the chain results in a validation error, subsequent validators in the chain are not executed and the result of the entire chain will be the error.

Functions passed as validators may manipulate rather than validate data. This is particularly useful when chained to functions performing validation.

For example:

    {
        "foo": chain(validString(), function(v) { return v.toUpperCase(); })
    }

If passed as a description to create a validator function would result in a validator which upon execution would assert that the value of the property "foo" is a string, and only if it is call #String.prototype.toUpperCase on it.

TODO:
=====

* ☑ Describe the desired structure of an object by passing an object to the validator, using special syntax for the keys and validation functions for the values.

* ☑ Allows multiple rules to be specified with conjunction/disjunction.

* ☐ Allows rules to specify inputs and outputs to functions, validating that the function behaves as expected.

* ☑ Allows multiple rules to be chained, and for rules to be functions that manipulate rather than validate data.
