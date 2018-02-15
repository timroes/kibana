import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';
import { CATEGORY } from 'ui/vis/vis_category';
import { SavedObjectsClient } from 'ui/saved_objects';

import chrome from 'ui/chrome';

import image from './vis_icon.svg';

import { TemplateVis } from './template_vis';
import { TemplateVisEditor } from './template_vis_editor';

const waitForTemplateVis = new Promise(resolve => {
  // TODO: DANGER!!!
  chrome.dangerouslyGetActiveInjector().then(($injector) => {
    const $http = $injector.get('$http');
    console.log('Dangerously got stuff');

    const savedObjects = new SavedObjectsClient({ $http });

    savedObjects.find({
      type: 'vis-template',
      perPage: 10000,
    }).then(templates => {
      templates.savedObjects.forEach(template => {
        console.log(`Create vis type for`, template);

        VisTypesRegistryProvider.register(Private => {
          const VisFactory = Private(VisFactoryProvider);
          return VisFactory.createReactVisualization({
            name: `vis-template-${template.id}`,
            templateId: template.id,
            templateConfig: JSON.parse(template.attributes.config),
            title: template.attributes.title,
            description: 'A custom created visualization.',
            category: CATEGORY.OTHER,
            image,
            visConfig: {
              component: TemplateVis
            },
            editorConfig: {
              optionsTemplate: TemplateVisEditor,
              enableAutoApply: true,
            },
            requestHandler: 'none',
            responseHandler: 'none',
            // options: {
            //   showQueryBar: false,
            //   showFilterBar: false,
            //   showIndexSelection: false
            // },
          });
        });
      });
      resolve();
    });
  });
});

export { waitForTemplateVis };
