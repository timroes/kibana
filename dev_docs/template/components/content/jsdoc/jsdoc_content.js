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

import { JsdocToc } from './jsdoc_toc';
import { JsdocEntry } from './entry/jsdoc_entry';

import './jsdoc.scss';

import {
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';

function buildJsdocTree(jsdoc) {
  const byId = jsdoc.reduce((prev, curr) => {
    prev[curr.id] = curr;
    return prev;
  }, {});
  return jsdoc.reduce((prev, curr) => {
    if (curr.memberof) {
      if (!byId[curr.memberof].children) {
        byId[curr.memberof].children = [];
      }
      byId[curr.memberof].children.push(curr);
    } else {
      if (!prev.byKind[curr.kind]) {
        prev.byKind[curr.kind] = [];
      }
      prev.byKind[curr.kind].push(curr);
      prev.ordered.push(curr);
    }
    return prev;
  }, { byKind: {}, ordered: [] });
}

function JsdocContent({ page }) {
  const tree = buildJsdocTree(page.jsdoc);
  return (
    <EuiFlexGroup>
      <EuiFlexItem>
        {tree.ordered.map(entry => <JsdocEntry key={entry.id} entry={entry} />)}
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <JsdocToc
          jsdoc={tree.byKind}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}

export { JsdocContent };
