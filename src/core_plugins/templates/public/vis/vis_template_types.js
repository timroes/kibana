import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';
import { CATEGORY } from 'ui/vis/vis_category';
import { SavedObjectsClient } from 'ui/saved_objects';
import uiRoutes from 'ui/routes';

import chrome from 'ui/chrome';

import image from './vis_icon.svg';

import { TemplateVis } from './template_vis';
import { TemplateVisEditor } from './template_vis_editor';

const waitForTemplateVis = new Promise(resolve => {
  chrome.dangerouslyGetActiveInjector().then(($injector) => {
    const $http = $injector.get('$http');
    const savedObjects = new SavedObjectsClient({ $http });

    savedObjects.find({
      type: 'vis-template',
      perPage: 10000,
    }).then(templates => {
      templates.savedObjects.forEach(template => {
        VisTypesRegistryProvider.register((Private, $injector) => {
          const VisFactory = Private(VisFactoryProvider);
          return VisFactory.createReactVisualization({
            name: `vis-template-${template.id}`,
            templateConfig: JSON.parse(template.attributes.config),
            title: template.attributes.title,
            description: 'A custom created visualization.',
            category: CATEGORY.OTHER,
            image,
            visConfig: {
              component: TemplateVis,
              savedVis: () => $injector.get('SavedVis'),
            },
            editorConfig: {
              optionsTemplate: TemplateVisEditor,
              enableAutoApply: true,
            },
            requestHandler: 'none',
            responseHandler: 'none',
          });
        });
      });
      resolve();
    });
  });
});

uiRoutes.addSetupWork(() => {
  return waitForTemplateVis;
});

export { waitForTemplateVis };
