/* eslint-disable react/no-multi-comp */
/**
 * TODO: make own get() for higher performance that memoizes intelligently
 */
import React, { PureComponent, Component } from 'react';
import PropTypes from 'prop-types';
import fpSet from 'lodash/fp/set';
import get from 'lodash/get';
import omit from 'lodash/omit';
import each from 'lodash/each';

export class Form extends PureComponent {
  constructor(props) {
    super(props);
    this.trigger = this.trigger.bind(this);
    this.onRegister = this.onRegister.bind(this);
    this.onUnregister = this.onUnregister.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.fields = {};
    this.queue = [];
    this.validator = props.validator || Validator;
  }

  getChildContext() {
    const { state } = this.props;
    return {
      onRegister: this.onRegister,
      onUnregister: this.onUnregister,
      trigger: this.trigger,
      submit: this.onSubmit,
      state,
    };
  }

  componentDidMount() {
    const { validateOnMount } = this.props;
    if (validateOnMount) {
      this.queue = this.queue.concat({
        action: {
          type: 'onValidate',
        },
      });
    }
    // call the queue for the initialization events that where queued up for the newly registered fields
    this.runQueue();
  }

  componentDidUpdate() {
    // if new fields where added causing this component to re-render we want to call the queue for the initialization
    // events that where queued up for the newly added fields
    this.runQueue();
  }

  onRegister(field) {
    const { name, defaultValue } = field;
    this.fields[name] = field;
    if (defaultValue) {
      // to avoid multiple calls to onFormChange when setting all the defaultValues we queue them up
      // and then run them all at once
      this.queue = this.queue.concat({
        action: {
          type: 'onDefaultValue',
          defaultValue,
        },
        name,
      });
    }
  }

  onUnregister({ name }) {
    this.fields = omit(this.fields, name);
  }

  onFormChange(state, action) {
    const { onChange } = this.props;
    onChange(state, action);
  }

  onSubmit(event) {
    event && event.preventDefault();
    const { onSubmit } = this.props;
    let { state } = this.props;

    state = this.reducer(null, state, { type: 'onTouchedDirtyAll' });
    state = this.reducer(null, state, { type: 'onValidate' });

    // if there are no errors call th onSubmit method
    if (!state.errors || !Object.keys(state.errors).length) {
      onSubmit && onSubmit(state);
    } else if (state.errors !== this.props.state.errors) {
      // not checking is state changed in general since dirty fields will have likely changed
      // but maybe we need to change the check to state !== this.props.state instead
      this.onFormChange(state, [{ action: { type: 'onSubmit' } }]);
    }
  }

  reducer(name, state, action) {
    let { data } = state;
    switch (action.type) {
      case 'onChange': {
        return {
          ...state,
          data: fpSet(name, action.value, data),
        };
      }
      case 'onDefaultValue': {
        const { defaultValue } = action;
        if (defaultValue && typeof get(data, name) === 'undefined') {
          data = fpSet(name, defaultValue, data);
        }
        return {
          ...state,
          data,
        };
      }
      case 'onDirty': {
        const dirty = state.dirty ? { ...state.dirty, [name]: true } : { [name]: true };
        return {
          ...state,
          dirty,
        };
      }
      case 'onTouchedDirtyAll': {
        const dirty = {};
        const touched = {};
        each(this.fields, (field) => {
          dirty[field.name] = true;
          touched[field.name] = true;
        });
        return {
          ...state,
          dirty,
          touched,
        };
      }
      case 'onTouched': {
        const touched = state.touched ? { ...state.touched, [name]: true } : { [name]: true };
        return {
          ...state,
          touched,
        };
      }
      case 'onValidate': {
        const errors = this.validator(data, this.fields);
        if (errors === state.errors) {
          return state;
        }
        return {
          ...state,
          errors,
        };
      }
      case 'onActive': {
        return {
          ...state,
        };
      }
      default:
        return state;
    }
  }

  runQueue() {
    this.run(this.queue);
    this.queue = [];
  }

  run(actionPayloads) {
    let { state } = this.props;
    actionPayloads.forEach(({ name, action }) => {
      if (Array.isArray(action)) {
        action.forEach((_action) => {
          state = this.reducer(name, state, _action);
        });
      } else {
        state = this.reducer(name, state, action);
      }
    });
    if (state !== this.props.state) {
      this.onFormChange(state, actionPayloads);
    }
  }

  trigger(actionPayload) {
    this.run([actionPayload]);
  }

  render() {
    const {
      children,
      element = 'form',
      // unused props here to omit from ...rest
      state,
      onSubmit,
      onChange,
      validateOnMount,
      ...rest
    } = this.props;
    const props = {
      ...rest,
    };
    if (element === 'form') {
      props.onSubmit = this.onSubmit;
    }
    return React.createElement(element, props, children);
  }
}
Form.childContextTypes = {
  onRegister: PropTypes.func,
  onUnregister: PropTypes.func,
  trigger: PropTypes.func,
  submit: PropTypes.func,
  state: PropTypes.object,
};

export class FormControl extends PureComponent {
  constructor(props) {
    super(props);
    this.onRegister = this.onRegister.bind(this);
    this.state = {
      name: props.name,
    };
  }

  getChildContext() {
    return {
      onRegister: this.onRegister,
      name: this.state.name,
    };
  }

  onRegister(field) {
    const { onRegister } = this.context;
    onRegister(field);
    // if name was not passed in as a prop we get it from the registration of the Field
    if (!this.state.name) {
      this.setState({ name: field.name });
    }
  }

  render() {
    const { className, children } = this.props;
    const { state } = this.context;
    const { name } = this.state;
    const isDirty = state.dirty && state.dirty[name];
    const isTouched = state.touched && state.touched[name];
    const hasError = state.errors && state.errors[name];

    const classes = [className || 'form-group'];

    if (isDirty) {
      classes.push('field-dirty');
    }
    if (isTouched) {
      classes.push('field-touched');
    }
    if (hasError) {
      classes.push('field-error');
    }


    return (
      <div className={classes.join(' ')}>
        {children}
      </div>
    );
  }
}
FormControl.contextTypes = {
  onRegister: PropTypes.func,
  onUnregister: PropTypes.func,
  trigger: PropTypes.func,
  state: PropTypes.object,
};
FormControl.childContextTypes = {
  onRegister: PropTypes.func,
  name: PropTypes.string,
};

export class Field extends PureComponent {
  constructor(props, context) {
    super(props, context);

    // this.onChange = this.onChange.bind(this);
    // this.onDirty = this.onDirty.bind(this);
    // this.onValidate = this.onValidate.bind(this);
    // this.onActive = this.onActive.bind(this);
    this.trigger = this.trigger.bind(this);
  }

  componentWillMount() {
    const { onRegister } = this.context;
    onRegister(this.props);
  }

  componentWillUnmount() {
    const { onUnregister } = this.context;
    onUnregister(this.props);
  }

  getValue() {
    const { name } = this.props;
    const { data } = this.context.state;
    // get actually memoizes converting the string to an array (up to 500 items)
    // so performance should be good and no need to worry about using it
    // unless forms are really big, I could manually use lodash/_stringToPath to
    // get path in the constructor and save it there instead
    const value = get(data, name) || '';
    return value;
  }

  trigger(action) {
    const { name } = this.props;
    const { trigger } = this.context;
    trigger({
      action,
      name,
    });
  }

  render() {
    const { name, component } = this.props;
    const { errors, activeField } = this.context.state;

    return component({
      // onChange: this.onChange,
      // onDirty: this.onDirty,
      // onValidate: this.onValidate,
      // onActive: this.onActive,

      trigger: this.trigger,
      value: this.getValue(),
      error: errors && errors[name],
      active: activeField === name,
    });
  }
}
Field.contextTypes = {
  onRegister: PropTypes.func,
  onUnregister: PropTypes.func,
  trigger: PropTypes.func,
  state: PropTypes.object,
};

export class FormError extends Component {
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return this.getError(this.context) !== this.getError(nextContext) || this.props.children !== nextProps.children;
  }

  getError({ name, state }) {
    const { dirty, touched } = this.props;
    // we can pass in dirty={false} to ignore if the field is dirty
    const isDirty = (state.dirty && state.dirty[name]) || dirty === false;
    // if dirty !== false we can safely ignore the touched
    const isTouched = dirty !== false || (state.touched && state.touched[name]) || touched === false;

    const error = name && isDirty && isTouched && state.errors && state.errors[name];
    // make sure we return false instead of a mix of undefined or false to avoid un-needed rerender
    if (!error) {
      return false;
    }
    return error;
  }

  render() {
    const error = this.getError(this.context);
    const { children } = this.props;

    return error ? <span className="validation-error">{children || error}</span> : null;
  }
}
FormError.contextTypes = {
  state: PropTypes.object,
  name: PropTypes.string,
};

export class SubmitButton extends PureComponent {
  render() {
    const { children, element = 'button', ...props } = this.props;
    return React.createElement(element, {
      ...props,
      onClick: (event) => {
        event.preventDefault();
        this.context.submit();
      }, 
    }, children);
  }
}
SubmitButton.contextTypes = {
  submit: PropTypes.func,
};

export const withShouldComponentUpdate = (WrappedComponent) => {
  class ShouldComponentUpdate extends Component {
    shouldComponentUpdate(nextProps, nextState, nextContext) {
      const keys = Object.keys(nextProps);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        // validate is always a new value when using the array syntax or thunk validators
        // this fixes the array syntax issue but not the thunk validators
        // if(key==='validate' && Array.isArray(nextProps[key])){
        //   for (let i = 0; i < nextProps[key].length; i++) {
        //     if(this.props[i][key] !== nextProps[key][i]){
        //       return true;
        //     }
        //   }
        // }else if(this.props[key] !== nextProps[key]){
        //   return true;
        // }

        if (key !== 'validate' && this.props[key] !== nextProps[key]) {
          return true;
        }
      }


      if (this.context.state !== nextContext.state) {
        const { state } = this.context;
        const nextContextState = nextContext.state;
        const { name } = this.props;
        const value = get(state.data, name);
        const nextValue = get(nextContextState.data, name);
        const isDirty = (state.dirty && state.dirty[name]) || false;
        const nextIsDirty = (nextContextState.dirty && nextContextState.dirty[name]) || false;
        const isTouched = (state.touched && state.touched[name]) || false;
        const nextIsTouched = (nextContextState.touched && nextContextState.touched[name]) || false;
        const hasError = (state.errors && state.errors[name]) || false;
        const nextHasError = (nextContextState.errors && nextContextState.errors[name]) || false;

        if (
          value !== nextValue ||
          isDirty !== nextIsDirty ||
          isTouched !== nextIsTouched ||
          hasError !== nextHasError
        ) {
          return true;
        }
      }
      return false;
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  }
  ShouldComponentUpdate.contextTypes = {
    state: PropTypes.object,
  };
  return ShouldComponentUpdate;
};


function runValidation(value, validate, data, validateEmpty = false) {
  const isEmpty = typeof value === 'undefined' || value === '' || value === null;
  const shouldValidate = !isEmpty || validateEmpty;
  let error;
  if (typeof validate === 'function') {
    error = shouldValidate && validate(value, data);
  } else if (validate instanceof RegExp) {
    if (shouldValidate && (typeof value !== 'string' || !value.match(validate))) {
      error = true;
    }
  } else if (Array.isArray(validate)) {
    let i = 0;
    while (i < validate.length && !error) {
      error = runValidation(value, validate[i], data, validateEmpty);
      i++;
    }
  } else if (typeof validate === 'object' && validate.validator) {
    // passing in the empty will allow for validating validators with empty even if value is empty
    error = runValidation(value, validate.validator, data, validate.empty);
    if (error && validate.message) {
      error = validate.message;
    }
  }
  return error;
}

function Validator(data, fields) {
  let errors;
  each(fields, (field) => {
    const { validate, name } = field;
    if (validate) {
      const value = get(data, name);

      const error = runValidation(value, validate, data);

      if (error) {
        errors = errors || {};
        errors[name] = error;
      }
    }
  });
  return errors;
}
