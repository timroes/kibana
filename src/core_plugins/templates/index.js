import mappings from './mappings.json';

export default function (kibana) {

  return new kibana.Plugin({
    uiExports: {
      app: {
        title: 'Vis Creator',
        order: -1000,
        description: 'Time series expressions for everything',
        icon: 'plugins/templates/app/app_icon.svg',
        main: 'plugins/templates/app/app',
        uses: [
          'fieldFormats',
          'savedObjectTypes'
        ]
      },
      mappings,
      visTypes: ['plugins/templates/vis/vis_template_types'],
    }
  });
}
