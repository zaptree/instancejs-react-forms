import React, { Component } from 'react';
import { Field, withShouldComponentUpdate } from '../Forms';

class Textfield extends Component {
  render() {
    const { name, defaultValue, type, validate, required, id, className, placeholder, disabled } = this.props;
    return (
      <Field
        name={name}
        defaultValue={defaultValue}
        validate={validate}
        required={required}
        // value, trigger, validationError, active
        component={({ value, trigger }) => (
          <input
            id={id}
            className={className}
            disabled={disabled}
            placeholder={placeholder}
            name={name}
            value={value}
            type={type}
            onChange={(e) => {
                let newValue = e.target.value;
                if (type === 'number') {
                  newValue = parseFloat(newValue);
                }
                trigger([
                  { type: 'onChange', value: newValue },
                  { type: 'onValidate' },
                  { type: 'onTouched' },
                ]);
              }}
            onBlur={() => {
                trigger([
                  { type: 'onDirty' },
                  { type: 'onValidate' },
                ]);
              }}
          />
          )}
      />
    );
  }
}

export default withShouldComponentUpdate(Textfield);
