export default function (kibana) {

  return new kibana.Plugin({
    uiExports: {
      app: {
        title: 'Customize',
        order: -1000,
        description: 'Time series expressions for everything',
        icon: 'plugins/templates/icon.svg',
        main: 'plugins/templates/app',
        injectVars: function (server) {
          // const config = server.config();
          // return {
          //   kbnIndex: config.get('kibana.index'),
          //   esShardTimeout: config.get('elasticsearch.shardTimeout'),
          //   esApiVersion: config.get('elasticsearch.apiVersion')
          // };
        },
        uses: [
        ]
      },
      // visTypes: ['plugins/templates/templates']
    }
  });
}
