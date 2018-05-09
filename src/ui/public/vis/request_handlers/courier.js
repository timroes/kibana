import _ from 'lodash';
import { SearchSourceProvider } from '../../courier/data_source/search_source';
import { VisRequestHandlersRegistryProvider } from '../../registry/vis_request_handlers';
import { getRequestInspectorStats, getResponseInspectorStats } from '../../courier/utils/courier_inspector_utils';
import { tabifyAggResponse } from '../../agg_response/tabify/tabify';

const CourierRequestHandlerProvider = function (Private, courier, timefilter) {
  const SearchSource = Private(SearchSourceProvider);

  /**
   * This function builds tabular data from the response and attaches it to the
   * inspector. It will only be called when the data view in the inspector is opened.
   */
  async function buildTabularInspectorData(vis, searchSource) {
    const table = tabifyAggResponse(vis.getAggConfig().getResponseAggs(), searchSource.finalResponse, {
      canSplit: false,
      asAggConfigResults: false,
      partialRows: true,
    });
    const columns = table.columns.map((col, index) => {
      const field = col.aggConfig.getField();
      const isCellContentFilterable =
        col.aggConfig.isFilterable()
        && (!field || field.filterable);
      return ({
        name: col.title,
        field: `col${index}`,
        filter: isCellContentFilterable && ((value) => {
          const filter = col.aggConfig.createFilter(value);
          vis.API.queryFilter.addFilters(filter);
        }),
        filterOut: isCellContentFilterable && ((value) => {
          const filter = col.aggConfig.createFilter(value);
          filter.meta = filter.meta || {};
          filter.meta.negate = true;
          vis.API.queryFilter.addFilters(filter);
        }),
      });
    });
    const rows = [];
    const rowsRaw = [];
    table.rows.forEach(row => {
      const { formatted, raw } = row.reduce((prev, cur, index) => {
        prev.raw[`col${index}`] = cur;
        const fieldFormatter = table.columns[index].aggConfig.fieldFormatter('text');
        prev.formatted[`col${index}`] = fieldFormatter(cur);
        return prev;
      }, { formatted: {}, raw: {} });
      rows.push(formatted);
      rowsRaw.push(raw);
    });

    return await new Promise(resolve => {
      setTimeout(() => resolve({ columns, rows, rowsRaw }), 3000);
    });

    return { columns, rows, rowsRaw };
  }

  /**
   * TODO: This code can be removed as soon as we got rid of inheritance in the
   * searchsource and pass down every filter explicitly.
   * we're only adding one range filter against the timeFieldName to ensure
   * that our filter is the only one applied and override the global filters.
   * this does rely on the "implementation detail" that filters are added first
   * on the leaf SearchSource and subsequently on the parents.
   */
  function removeSearchSourceParentTimefilter(searchSource) {
    searchSource.addFilterPredicate((filter, state) => {
      if (!filter.range) {
        return true;
      }

      const index = searchSource.index() || searchSource.getParent().index();
      const timeFieldName = index && index.timeFieldName;
      if (!index || !timeFieldName) {
        return true;
      }

      // Only check if we need to filter out this filter if it's actual a range filter
      // on our time field and not any other field.
      if (!filter.range[timeFieldName]) {
        return true;
      }

      return !(state.filters || []).find(f => f.range && f.range[timeFieldName]);
    });

  }

  return {
    name: 'courier',
    handler: function (vis, { appState, queryFilter, searchSource, timeRange }) {

      // Create a new search source that inherits the original search source
      // but has the propriate timeRange applied via a filter.
      // This is a temporary solution until we properly pass down all required
      // information for the request to the request handler (https://github.com/elastic/kibana/issues/16641).
      // Using callParentStartHandlers: true we make sure, that the parent searchSource
      // onSearchRequestStart will be called properly even though we use an inherited
      // search source.
      const requestSearchSource = new SearchSource().inherits(searchSource, { callParentStartHandlers: true });

      // For now we need to mirror the history of the passed search source, since
      // the spy panel wouldn't work otherwise.
      Object.defineProperty(requestSearchSource, 'history', {
        get() {
          return requestSearchSource._parent.history;
        },
        set(history) {
          return requestSearchSource._parent.history = history;
        }
      });

      // Add the explicit passed timeRange as a filter to the requestSearchSource.
      requestSearchSource.filter(() => {
        return timefilter.get(searchSource.index(), timeRange);
      });

      removeSearchSourceParentTimefilter(requestSearchSource);

      if (queryFilter && vis.editorMode) {
        searchSource.set('filter', queryFilter.getFilters());
        searchSource.set('query', appState.query);
      }

      // AggConfig contains circular reference to vis, which contains visualization parameters,
      // which we should not look at
      const copyAggs = (aggs) => {
        return aggs.map(agg => {
          return {
            type: agg.type,
            params: agg.params
          };
        });
      };

      const shouldQuery = () => {
        if (!searchSource.lastQuery || vis.reload) return true;
        if (!_.isEqual(_.cloneDeep(searchSource.get('filter')), searchSource.lastQuery.filter)) return true;
        if (!_.isEqual(_.cloneDeep(searchSource.get('query')), searchSource.lastQuery.query)) return true;
        if (!_.isEqual(_.cloneDeep(copyAggs(vis.aggs.getRequestAggs())), searchSource.lastQuery.aggs)) return true;
        if (!_.isEqual(_.cloneDeep(timeRange), searchSource.lastQuery.timeRange)) return true;

        return false;
      };

      return new Promise((resolve, reject) => {
        if (shouldQuery()) {
          delete vis.reload;

          vis.API.inspectorAdapters.requests.reset();
          const request = vis.API.inspectorAdapters.requests.start('Data request');
          request.stats(getRequestInspectorStats(requestSearchSource));

          requestSearchSource.onResults().then(resp => {
            searchSource.lastQuery = {
              filter: _.cloneDeep(searchSource.get('filter')),
              query: _.cloneDeep(searchSource.get('query')),
              aggs: _.cloneDeep(copyAggs(vis.aggs.getRequestAggs())),
              timeRange: _.cloneDeep(timeRange)
            };

            request
              .stats(getResponseInspectorStats(searchSource, resp))
              .ok({ json: resp });

            searchSource.rawResponse = resp;

            return _.cloneDeep(resp);
          }).then(async resp => {
            for (const agg of vis.getAggConfig()) {
              if (_.has(agg, 'type.postFlightRequest')) {
                const nestedSearchSource = new SearchSource().inherits(requestSearchSource);
                resp = await agg.type.postFlightRequest(resp, vis.aggs, agg, nestedSearchSource);
              }
            }

            searchSource.finalResponse = resp;

            vis.API.inspectorAdapters.data.setTabularLoader(() => buildTabularInspectorData(vis, searchSource));

            resolve(resp);
          }).catch(e => reject(e));

          searchSource.getSearchRequestBody().then(req => {
            request.json(req);
          });

          courier.fetch();
        } else {
          resolve(searchSource.finalResponse);
        }
      });
    }
  };
};

VisRequestHandlersRegistryProvider.register(CourierRequestHandlerProvider);

export { CourierRequestHandlerProvider };
