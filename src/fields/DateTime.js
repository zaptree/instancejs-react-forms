/* eslint-disable */
import React, { Component } from 'react';
import { Field, withShouldComponentUpdate } from '../Forms';

class Textfield extends Component {
  render() {
    const { name, defaultValue, validate, required, id, className } = this.props;
    return (
      <Field
        name={name}
        defaultValue={defaultValue}
        validate={validate}
        required={required}
        // value, trigger, validationError, active
        component={({ value, trigger }) => {
          const convertedValue = (new Date(Number(value) || Date.now())).toISOString();
          return (
            <input
              id={id}
              className={className}
              name={name}
              value="2017-08-27T15:27:03.265"
              type="datetime-local"
              onChange={(e) => {
                trigger([
                  { type: 'onChange', value: (new Date(e.target.value)).getTime() },
                  { type: 'onValidate' },
                  { type: 'onTouched' },
                ]);
              }}
              onBlur={(e) => {
                trigger([
                  { type: 'onDirty' },
                  { type: 'onValidate' },
                ]);
              }}
            />
          );
        }}
      />
    );
  }
}

export default withShouldComponentUpdate(Textfield);
