import React, { Component } from 'react';
import { Field, withShouldComponentUpdate } from '../Forms';

class Checkbox extends Component {
  render() {
    const {
      name, value: checkboxValue, unCheckedValue, defaultChecked, type, validate, required, id, className, disabled,
    } = this.props;

    const onValue = typeof value === 'undefined' ? true : checkboxValue;
    const offValue = typeof value === 'undefined' ? false : unCheckedValue;

    return (
      <Field
        name={name}
        defaultValue={defaultChecked ? onValue : offValue}
        validate={validate}
        required={required}
        component={({ value, trigger }) => {
          const checked = value === onValue;
          return (
            <input
              id={id}
              className={className}
              disabled={disabled}
              name={name}
              value={onValue}
              checked={checked}
              type={type}
              onChange={(e) => {
                trigger([
                  { type: 'onChange', value: e.target.checked ? onValue : offValue },
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

export default withShouldComponentUpdate(Checkbox);
