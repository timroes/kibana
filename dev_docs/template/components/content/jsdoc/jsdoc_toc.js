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

import {
  EuiBadge,
  EuiSideNav,
} from '@elastic/eui';

import { KINDS } from './kinds';

function JsdocToc({ jsdoc }) {
  console.log(jsdoc);
  const items = KINDS.map(kind => {
    if (!jsdoc[kind.key] || jsdoc[kind.key].length === 0) {
      return null;
    }

    return {
      id: `kind_${kind.key}`,
      name: kind.name,
      icon: <EuiBadge color={kind.color}>{kind.abbr}</EuiBadge>,
      items: jsdoc[kind.key].map(entry => ({
        id: entry.id,
        name: entry.name,
        href: `#${entry.id}`,
        items: entry.children && entry.children.map(child => ({
          id: child.id,
          name: child.name,
          href: `#${child.id}`,
        })),
      })),
    };
  }).filter(section => section !== null);

  return (
    <EuiSideNav
      className="jsdoc__toc"
      items={items}
    />
  );
}

export { JsdocToc };
