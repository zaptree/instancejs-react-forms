import React, { Component } from 'react';
import { Field, withShouldComponentUpdate } from '../Forms';

class Radio extends Component {
  render() {
    const { name, value: radioValue, defaultChecked, type, validate, required, id, className, disabled } = this.props;


    return (
      <Field
        name={name}
        defaultValue={defaultChecked ? radioValue : undefined}
        validate={validate}
        required={required}
        component={({ value, trigger }) => {
          const checked = value === radioValue;
          return (
            <input
              id={id}
              disabled={disabled}
              className={className}
              name={name}
              value={radioValue}
              checked={checked}
              type={type}
              onChange={() => {
                trigger([
                  { type: 'onChange', value: radioValue },
                  { type: 'onValidate' },
                  { type: 'onTouched' },
                  { type: 'onDirty' },
                ]);
              }}
            />
          );
        }}
      />
    );
  }
}

export default withShouldComponentUpdate(Radio);
