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

import { FormattedMessage } from '@kbn/i18n/react';
import classnames from 'classnames';
import { sortByOrder } from 'lodash';
import React, { ChangeEvent } from 'react';

import {
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiKeyPadMenu,
  EuiKeyPadMenuItemButton,
  EuiModalBody,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSpacer,
  EuiTitle,
} from '@elastic/eui';
import { NewVisHelp } from './new_vis_help';
import { VisHelpText } from './vis_help_text';

import { memoizeLast } from 'ui/utils/memoize';
import { VisType } from 'ui/vis';

interface VisTypeListEntry extends VisType {
  highlighted: boolean;
}

interface TypeSelectionProps {
  onVisTypeSelected: (visType: VisType) => void;
  visTypesRegistry: VisType[];
  showLabVis: boolean;
}

interface TypeSelectionState {
  highlightedType: VisType | null;
  query: string;
}

class TypeSelection extends React.Component<TypeSelectionProps, TypeSelectionState> {
  public state = {
    highlightedType: null,
    query: '',
  };

  private readonly getFilteredVisTypes = memoizeLast(this.filteredVisTypes);

  public render() {
    const { query, highlightedType } = this.state;
    const visTypes = this.getFilteredVisTypes(this.props.visTypesRegistry, query);
    return (
      <React.Fragment>
        <EuiModalHeader>
          <EuiModalHeaderTitle>
            <FormattedMessage
              id="kbn.visualize.newVisWizard.title"
              defaultMessage="New Visualizations"
            />
          </EuiModalHeaderTitle>
        </EuiModalHeader>
        <EuiFlexGroup gutterSize="none">
          <EuiFlexItem grow={false}>
            <EuiModalBody className="visNewVisDialog__body">
              <EuiFlexGroup direction="column">
                <EuiFlexItem grow={false}>
                  <EuiFieldSearch
                    placeholder="Filter"
                    value={query}
                    onChange={this.onQueryChange}
                  />
                </EuiFlexItem>
                <EuiFlexItem grow={true}>
                  <EuiKeyPadMenu
                    className="visNewVisDialog__types"
                    data-test-subj="visNewDialogTypes"
                  >
                    {visTypes.map(this.renderVisType)}
                  </EuiKeyPadMenu>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiModalBody>
          </EuiFlexItem>
          <EuiFlexItem className="visNewVisDialog__description">
            {highlightedType && <VisHelpText visType={highlightedType} />}
            {!highlightedType && (
              <React.Fragment>
                <EuiTitle size="s">
                  <h2>
                    <FormattedMessage
                      id="kbn.visualize.newVisWizard.selectVisType"
                      defaultMessage="Select a visualization type"
                    />
                  </h2>
                </EuiTitle>
                <EuiSpacer size="m" />
                <NewVisHelp />
              </React.Fragment>
            )}
          </EuiFlexItem>
        </EuiFlexGroup>
      </React.Fragment>
    );
  }

  private filteredVisTypes(visTypes: VisType[], query: string): VisTypeListEntry[] {
    const types = visTypes.filter(type => {
      // Filter out all lab visualizations if lab mode is not enabled
      if (!this.props.showLabVis && type.stage === 'lab') {
        return false;
      }

      // Filter out visualizations in the hidden category
      if (type.hidden) {
        return false;
      }

      return true;
    });

    let entries: VisTypeListEntry[];
    if (!query) {
      entries = types.map(type => ({ ...type, highlighted: false }));
    } else {
      const q = query.toLowerCase();
      entries = types.map(type => {
        const matchesQuery =
          type.name.toLowerCase().includes(q) ||
          type.title.toLowerCase().includes(q) ||
          (typeof type.description === 'string' && type.description.toLowerCase().includes(q));
        return { ...type, highlighted: matchesQuery };
      });
    }

    return sortByOrder(entries, ['highlighted', 'title'], ['desc', 'asc']);
  }

  private renderVisType = (visType: VisTypeListEntry) => {
    let stage = {};
    if (visType.stage === 'experimental') {
      stage = {
        betaBadgeLabel: 'Experimental',
        betaBadgeTooltipContent: 'This visualization is yet experimental.',
      };
    } else if (visType.stage === 'lab') {
      stage = {
        betaBadgeLabel: 'Lab',
        betaBadgeTooltipContent: 'This visualization is in an early experimental lab state.',
      };
    }
    const isDisabled = this.state.query !== '' && !visType.highlighted;
    const legacyIconClass = classnames(
      'kuiIcon',
      'visNewVisDialog__typeLegacyIcon',
      visType.legacyIcon
    );
    return (
      <EuiKeyPadMenuItemButton
        key={visType.name}
        label={<span data-test-subj="visTypeTitle">{visType.title}</span>}
        onClick={() => this.props.onVisTypeSelected(visType)}
        onFocus={() => this.highlightType(visType)}
        onMouseEnter={() => this.highlightType(visType)}
        onMouseLeave={() => this.highlightType(null)}
        onBlur={() => this.highlightType(null)}
        className="visNewVisDialog__type"
        data-test-subj={`visType-${visType.name}`}
        data-vis-stage={visType.stage}
        disabled={isDisabled}
        {...stage}
      >
        {visType.image && (
          <img src={visType.image} aria-hidden="true" className="visNewVisDialog__typeImage" />
        )}
        {!visType.image && visType.legacyIcon && <span className={legacyIconClass} />}
        {!visType.image &&
          !visType.legacyIcon && (
            <EuiIcon type={visType.icon} size="l" color="secondary" aria-hidden="true" />
          )}
      </EuiKeyPadMenuItemButton>
    );
  };

  private highlightType(visType: VisType | null) {
    this.setState({
      highlightedType: visType,
    });
  }

  private onQueryChange = (ev: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      query: ev.target.value,
    });
  };
}

export { TypeSelection };
