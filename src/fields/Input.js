import React, { Component } from 'react';
import Textfield from './Textfield';
import DateTime from './DateTime';
import Checkbox from './Checkbox';
import Radio from './Radio';

class Input extends Component {
  render() {
    const { type = 'text' } = this.props;
    const components = {
      'datetime-local': DateTime,
      datetime: DateTime,
      date: Textfield,
      text: Textfield,
      number: Textfield,
      email: Textfield,
      password: Textfield,
      checkbox: Checkbox,
      radio: Radio,
    };
    const FieldComponent = components[type];

    return <FieldComponent {...this.props} />;
  }
}

export default Input;
