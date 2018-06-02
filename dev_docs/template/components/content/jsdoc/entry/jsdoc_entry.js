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

import { JsdocEntryTitle } from './jsdoc_entry_title';
import { JsdocEntryParams } from './jsdoc_entry_params';
import { JsdocTypes } from '../jsdoc_types';

import {
  EuiCodeBlock,
  EuiHorizontalRule,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';

function JsdocEntry({ entry }) {
  return (
    <div className="jsdoc-entry">
      <JsdocEntryTitle entry={entry} />
      <EuiText>
        <p>{entry.description}</p>
      </EuiText>
      {entry.params && entry.params.length > 0 &&
        <JsdocEntryParams
          title="Params"
          params={entry.params}
        />
      }
      {entry.properties && entry.properties.length > 0 &&
        <JsdocEntryParams
          title="Properties"
          params={entry.properties}
        />
      }
      {entry.returns && entry.returns.length > 0 &&
        <React.Fragment>
          <EuiSpacer size="m" />
          <EuiTitle size="xs">
            <h3>Returns</h3>
          </EuiTitle>
          <EuiSpacer size="s" />
          {entry.returns.map((ret, index) => (
            <React.Fragment key={index}>
              <div>
                <em>Type:</em> <JsdocTypes types={ret.type} />
              </div>
              <EuiSpacer size="s" />
              <EuiText>
                <p>{ret.description}</p>
              </EuiText>
            </React.Fragment>
          ))}
        </React.Fragment>
      }
      {entry.examples && entry.examples.length > 0 &&
        <React.Fragment>
          <EuiSpacer size="m" />
          <EuiTitle size="xs">
            <h3>Examples</h3>
          </EuiTitle>
          <EuiSpacer size="s" />
          <EuiText>
            {entry.examples.map((example, index) => {
              return (
                <EuiCodeBlock language="js" paddingSize="m" key={index}>
                  {example}
                </EuiCodeBlock>
              );
            })}
          </EuiText>
        </React.Fragment>
      }
      <EuiHorizontalRule size="half" margin="xl" />
    </div>
  );
}


export { JsdocEntry };
