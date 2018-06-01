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
  EuiFlexGroup,
  EuiFlexItem,
  EuiSideNav,
  EuiTitle,
} from '@elastic/eui';

import './navigation.scss';
import logo from './kibana_logo.svg';

function renderMenuItem({ href, children, className, meta, ...rest }) {
  const isBeta = meta && meta.stage === 'beta';
  const type = meta && meta.type;
  return (
    <a
      href={href}
      role="menuitem"
      className={className}
      {...rest}
    >
      <EuiFlexGroup gutterSize="xs">
        {isBeta &&
          <EuiFlexItem grow={false}>
            <EuiBadge
              color="danger"
            >
              Beta
            </EuiBadge>
          </EuiFlexItem>
        }
        <EuiFlexItem>
          {children}
        </EuiFlexItem>
        {type === 'jsdoc' &&
          <EuiFlexItem grow={false}>
            <EuiBadge color="primary">
              JS
            </EuiBadge>
          </EuiFlexItem>
        }
        {type === 'swagger' &&
          <EuiFlexItem grow={false}>
            <EuiBadge color="accent">
              REST
            </EuiBadge>
          </EuiFlexItem>
        }
      </EuiFlexGroup>
    </a>
  );
}

function Navigation({ contents, activeSlug }) {
  const menu = contents.map((group, groupIndex) => ({
    name: group.title,
    id: `group${groupIndex}`,
    items: group.items.map((item, index) => ({
      name: item.title,
      id: `group${groupIndex}item${index}`,
      href: item.slug,
      isSelected: item.slug === activeSlug,
      meta: {
        stage: item.stage,
        type: item.type,
      }
    })),
  }));
  return (
    <nav className="navigation">
      <header className="navigation__header">
        <a href="/">
          <img height="60px" src={logo} />
          <EuiTitle size="xs">
            <h1>Developer Documentation</h1>
          </EuiTitle>
        </a>
      </header>
      <EuiSideNav
        items={menu}
        renderItem={renderMenuItem}
      />
    </nav>
  );
}

export { Navigation };
