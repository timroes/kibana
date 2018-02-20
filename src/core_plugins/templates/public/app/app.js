import React from 'react';
import ReactDOM from 'react-dom';

import 'ui/autoload/all';

import uiRoutes from 'ui/routes';
import { uiModules } from 'ui/modules';

import { TemplateEditor } from '../editor/editor_component';
import './template_app.less';

uiModules.get('kibana/templateEditor', [])
  .component('templateEditor', {
    controller: ($element, $http) => {
      ReactDOM.render(
        <TemplateEditor $http={$http} />,
        $element[0]
      );
    }
  });

uiRoutes.enable();
uiRoutes.when('/', {
  template: '<template-editor></template-editor>',
  reloadOnSearch: false,
});
