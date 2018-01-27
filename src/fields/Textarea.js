import React, { Component } from 'react';
import { Field, withShouldComponentUpdate } from '../Forms';

class Textarea extends Component {
  render() {
    const { name, defaultValue, validate, required, id, className, placeholder } = this.props;
    return (
      <Field
        name={name}
        defaultValue={defaultValue}
        validate={validate}
        required={required}
        // value, trigger, validationError, active
        component={({ value, trigger }) => (
          <textarea
            id={id}
            className={className}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={(e) => {
                trigger([
                  { type: 'onChange', value: e.target.value },
                  { type: 'onValidate' },
                  { type: 'onTouched' },
                ]);
              }}
            onBlur={() => {
                trigger({
                  type: 'onDirty',
                });
              }}
          />
          )}
      />
    );
  }
}

export default withShouldComponentUpdate(Textarea);
