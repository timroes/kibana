import React, { Component } from 'react';
import chrome from 'ui/chrome';
import Select from 'react-select';

import SelectIndexControl from './select_index';

import {
  EuiFormRow,
} from '@elastic/eui';

class SelectIndex extends Component {

  currentLoadedIndexPattern = null;

  state = {
    indexPatterns: [],
  };

  async getIndexPatternFields() {
    const pattern = this.props.editorState[this.props.options.index];
    if (pattern && pattern.id) {
      this.currentLoadedIndexPattern = pattern;
      const injector = await chrome.dangerouslyGetActiveInjector();
      const indexPatterns = injector.get('indexPatterns');
      const indexPattern = await indexPatterns.get(pattern.id);
      return indexPattern.fields;
    }
    return [];
  }

  loadOptions = async (input, callback) => {
    const fields = await this.getIndexPatternFields();
    const options = fields.map(field => {
      return {
        name: field.name,
        type: field.type,
      };
    });
    callback(null, { options });
  }

  componentWillReceiveProps(props) {
    if (props.editorState[props.options.index] !== this.currentLoadedIndexPattern) {
      this.select.loadOptions('');
    }
  }

  onChange = (value) => {
    this.props.onChange(value);
  };

  render() {
    const { id, options, value, editorState } = this.props;
    const isDisabled = !editorState[options.index] || !editorState[options.index].id;
    return (
      <EuiFormRow
        label={options.label}
        helpText={options.helpText}
      >
        <Select.Async
          ref={el => this.select = el}
          className="index-pattern-react-select"
          disabled={isDisabled}
          placeholder={options.placeholder}
          value={value}
          loadOptions={this.loadOptions}
          onChange={this.onChange}
          resetValue={''}
          labelKey="name"
          valueKey="name"
          inputProps={{ id }}
          cache={false}
        />
      </EuiFormRow>
    );
  }
}

export default {
  id: 'select_field',
  name: 'Field Selection',
  icon: 'indexMapping',
  component: SelectIndex,
  // TODO: Options to filter field type would be nice
  options: [
    {
      id: 'label',
      name: 'Label',
      type: 'text',
      required: true,
      default: 'Select field',
    },
    {
      id: 'index',
      name: 'Index Pattern',
      type: 'controlSelect',
      required: true,
      help: 'Specify the index pattern selection, that .',
      filter: {
        type: SelectIndexControl.id
      },
    },
    {
      id: 'placeholder',
      name: 'Placeholder',
      type: 'text',
      default: 'Select field...'
    },
    {
      id: 'helpText',
      name: 'Help Text',
      type: 'text',
      help: 'Will be shown below the text field if specified.',
    },
  ],
  defaultValue: false,
};
