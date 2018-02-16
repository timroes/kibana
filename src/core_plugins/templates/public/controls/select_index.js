import React, { Component } from 'react';
import chrome from 'ui/chrome';
import { SavedObjectsClientProvider } from 'ui/saved_objects';
import Select from 'react-select';

import {
  EuiFormRow,
} from '@elastic/eui';

class SelectIndex extends Component {

  state = {
    indexPatterns: [],
  };

  async getIndexPatterns(search) {
    const injector = await chrome.dangerouslyGetActiveInjector();
    const Private = injector.get('Private');
    const savedObjectsClient = Private(SavedObjectsClientProvider);
    const response = await savedObjectsClient.find({
      type: 'index-pattern',
      fields: ['title'],
      search: `${search}*`,
      search_fields: ['title'],
      perPage: 100
    });
    return response.savedObjects;
  }

  loadOptions = (input, callback) => {
    this.getIndexPatterns(input).then((indexPatternSavedObjects) => {
      const options = indexPatternSavedObjects.map((indexPatternSavedObject) => {
        return {
          name: indexPatternSavedObject.attributes.title,
          id: indexPatternSavedObject.id,
        };
      });
      callback(null, { options: options });
    });
  }

  onChange = (value) => {
    this.props.onChange(value);
  };

  render() {
    const { id, options, value } = this.props;
    return (
      <EuiFormRow
        label={options.label}
        helpText={options.helpText}
      >
        <Select.Async
          className="index-pattern-react-select"
          placeholder={options.placeholder}
          value={value}
          loadOptions={this.loadOptions}
          onChange={this.onChange}
          resetValue={''}
          valueKey="id"
          labelKey="name"
          inputProps={{ id }}
        />
      </EuiFormRow>
    );
  }
}

export default {
  id: 'select_index',
  name: 'Index Selection',
  icon: 'indexMapping',
  component: SelectIndex,
  options: [
    {
      id: 'label',
      name: 'Label',
      type: 'text',
      required: true,
      default: 'Select index',
    },
    {
      id: 'placeholder',
      name: 'Placeholder',
      type: 'text',
      default: 'Select index pattern...'
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
