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
          let convertedValue = '';
          if (value) {
            const now = new Date(value);
            const day = (`0${now.getUTCDate()}`).slice(-2);
            const month = (`0${now.getUTCMonth() + 1}`).slice(-2);
            convertedValue = `${now.getUTCFullYear()}-${month}-${day}`;
          }

          return (
            <input
              id={id}
              className={className}
              name={name}
              value={convertedValue}
              type="date"
              onChange={(e) => {
                const val = e.target.value;
                trigger([
                  { type: 'onChange', value: val ? (new Date(val)).getTime() : 0 },
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
          );
        }}
      />
    );
  }
}

export default withShouldComponentUpdate(Textfield);
