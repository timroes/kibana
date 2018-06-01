/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';

import { JsdocTypes } from '../jsdoc_types';

import {
  EuiCode,
  EuiInMemoryTable,
  EuiSpacer,
  EuiTitle,
  EuiToolTip,
} from '@elastic/eui';

function JsdocEntryParams({ params, title }) {
  const columns = [
    { field: 'name', name: 'Name', render: (value, item) => {
      const name = (
        <EuiCode className="jsdoc-param__name">
          {item.optional ? `[${value}]` : value}
        </EuiCode>
      );
      if (!item.optional) {
        return name;
      }

      return (
        <EuiToolTip content="This parameter is optional">
          {name}
        </EuiToolTip>
      );
    } },
    { field: 'type', name: 'Type', render: value => <JsdocTypes types={value} /> },
    { field: 'description', name: 'Description' },
  ];
  if (params.some(param => param.hasOwnProperty('defaultvalue'))) {
    columns.push({
      field: 'defaultvalue',
      name: 'Default Value',
      render: value => <EuiCode>{JSON.stringify(value)}</EuiCode>
    });
  }
  return (
    <React.Fragment>
      <EuiSpacer size="m"/>
      <EuiTitle size="xs">
        <h3>{title}</h3>
      </EuiTitle>
      <EuiInMemoryTable
        className="jsdoc-entry__params-table"
        columns={columns}
        items={params}
      />
    </React.Fragment>
  );
}

export { JsdocEntryParams };
