import React, { Component } from 'react';
import pick from 'lodash/pick';

import { Field, withShouldComponentUpdate } from '../Forms';

class Select extends Component {
  render() {
    const { name, options, defaultValue, validate, required, id, className, children, emptyLabel, displayEmpty } = this.props;
    return (
      <Field
        name={name}
        defaultValue={defaultValue}
        validate={validate}
        required={required}
        // value, trigger, validationError, active
        component={({ value, trigger }) => (
          <select
            id={id}
            className={className}
            name={name}
            value={value}
            onChange={(e) => {
                trigger([
                  { type: 'onChange', value: e.target.value },
                  { type: 'onValidate' },
                  { type: 'onTouched' },
                  { type: 'onDirty' },
                ]);
              }}
          >
            {displayEmpty || (!value && typeof emptyLabel !== 'undefined') ? (
              <option value="" key="$$emtpy$$">{emptyLabel || ''}</option>
              ) : null}
            {options ? options.map((option) => {
                if (typeof option === 'string') {
                  return <option value={option} key={option}>{option}</option>;
                }
                const { label, ...props } = option;
                const allowedProps = pick(props, ['disabled', 'label', 'selected', 'value']);
                return (<option {...allowedProps} key={props.value}>{label || option.value}</option>);
              }) : children}

          </select>
          )}
      />
    );
  }
}

export default withShouldComponentUpdate(Select);
