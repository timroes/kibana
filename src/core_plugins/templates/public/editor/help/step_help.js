import React from 'react';
import {
  EuiCode,
  EuiSteps,
  EuiText,
} from '@elastic/eui';

const helpSteps = [
  {
    title: 'Create an editor',
    children: (
      <EuiText>
        Use the <EuiCode>Add Control</EuiCode> button on bottom of the screen
        to add controls to your editor.
      </EuiText>
    )
  },
  {
    title: 'Assign fields to variables',
    children: (
      <EuiText>
        Use the <EuiCode>Variable name</EuiCode> setting for each field to assign its
        value to a variable.
      </EuiText>
    )
  },
  {
    title: 'Write your template',
    children: (
      <EuiText>
        Write a <em>Kibana visualization pipeline</em> by using the <EuiCode>Pipeline template</EuiCode>
        button at the bottom. You can use <EuiCode>{`{{varName}}`}</EuiCode> in the template
        to refer to values from the editor. The editor currently support Handlebars syntax.
      </EuiText>
    )
  },
  {
    title: 'Save your template',
    children: (
      <EuiText>
        Give your template a name at the top of the screen, then hit <EuiCode>Save</EuiCode>
        to make it available as a new visualization to users.
      </EuiText>
    )
  }
];

function StepHelp() {
  return (
    <EuiSteps
      headingElement="h2"
      steps={helpSteps}
    />
  );
}

export { StepHelp };
