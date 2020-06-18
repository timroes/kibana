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
import { Subscription } from 'rxjs';
import { ViewMode } from '../../../../../embeddable/public';
import { EmbeddableStart } from '../../../embeddable_plugin';
import { DashboardContainer, DashboardReactContextValue } from '../dashboard_container';
import { DashboardGrid } from '../grid';
import { context } from '../../../../../kibana_react/public';
import { DashboardPanelState } from '../types';
import { DashboardSection } from '../../../types';
import { panelsInSection, panelsExcludingSection, SectionHeader } from '../../sections';

export interface DashboardViewportProps {
  container: DashboardContainer;
  renderEmpty?: (sectionId?: string) => React.ReactNode;
  PanelComponent: EmbeddableStart['EmbeddablePanel'];
  onAddToSection: (sectionId: string) => void;
}

interface State {
  isFullScreenMode: boolean;
  useMargins: boolean;
  title: string;
  description?: string;
  panels: { [key: string]: DashboardPanelState };
  sections?: DashboardSection[];
  isEmbeddedExternally?: boolean;
  viewMode: ViewMode;
  collapsedStates: { [panelId: string]: boolean };
}

export class DashboardViewport extends React.Component<DashboardViewportProps, State> {
  static contextType = context;

  public readonly context!: DashboardReactContextValue;
  private subscription?: Subscription;
  private mounted: boolean = false;
  constructor(props: DashboardViewportProps) {
    super(props);
    const {
      isFullScreenMode,
      panels,
      useMargins,
      title,
      isEmbeddedExternally,
      viewMode,
      sections,
    } = this.props.container.getInput();

    this.state = {
      isFullScreenMode,
      panels,
      useMargins,
      title,
      sections,
      isEmbeddedExternally,
      viewMode,
      collapsedStates: {},
    };
  }

  public componentDidMount() {
    this.mounted = true;
    this.subscription = this.props.container.getInput$().subscribe(() => {
      const {
        isFullScreenMode,
        useMargins,
        title,
        description,
        isEmbeddedExternally,
        viewMode,
        panels,
        sections,
      } = this.props.container.getInput();
      if (this.mounted) {
        this.setState({
          isFullScreenMode,
          description,
          useMargins,
          title,
          isEmbeddedExternally,
          viewMode,
          panels,
          sections,
        });
      }
    });
  }

  public componentWillUnmount() {
    this.mounted = false;
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  public onExitFullScreenMode = () => {
    this.props.container.updateInput({
      isFullScreenMode: false,
    });
  };

  private onToggleSection = (sectionId: string) => {
    this.setState((prevState) => ({
      ...prevState,
      collapsedStates: {
        ...prevState.collapsedStates,
        [sectionId]: !prevState.collapsedStates[sectionId],
      },
    }));
  };

  private onSectionChanged = (section: DashboardSection) => {
    this.props.container.updateInput({
      sections: this.state.sections?.map((s) => (s.id === section.id ? section : s)),
    });
  };

  private onRemoveSection = (sectionId: string) => {
    // TODO: most likely needs to do more cleanup, or should use the remove panel action?
    this.props.container.updateInput({
      sections: this.state.sections?.filter((s) => s.id !== sectionId),
      panels: panelsExcludingSection(this.state.panels, sectionId),
    });
  };

  private onGridLayoutChanged = (panels: { [key: string]: DashboardPanelState }) => {
    const newPanels = Object.fromEntries(
      Object.entries(this.state.panels).map(([panelId, panel]) => [
        panelId,
        panels[panelId] ?? panel,
      ])
    );
    this.props.container.updateInput({
      panels: newPanels,
    });
  };

  private renderEmptyScreen() {
    const { renderEmpty } = this.props;
    const { isEmbeddedExternally, isFullScreenMode } = this.state;
    return (
      <div className="dshDashboardEmptyScreen">
        {isFullScreenMode && (
          <this.context.services.ExitFullScreenButton
            onExitFullScreenMode={this.onExitFullScreenMode}
            toggleChrome={!isEmbeddedExternally}
          />
        )}
        {renderEmpty && renderEmpty()}
      </div>
    );
  }

  private renderSection = (section: DashboardSection) => {
    const { viewMode, collapsedStates } = this.state;
    const isCollapsed = collapsedStates[section.id];
    const sectionPanels = panelsInSection(this.state.panels, section.id);
    return (
      <React.Fragment key={section.id}>
        <SectionHeader
          viewMode={viewMode}
          section={section}
          onSectionChange={this.onSectionChanged}
          isCollapsed={isCollapsed}
          onToggleSection={this.onToggleSection}
          onAddPanelToSection={this.props.onAddToSection}
          onRemoveSection={this.onRemoveSection}
        />
        <div style={{ display: isCollapsed ? 'none' : 'block' }}>
          {Object.keys(sectionPanels).length === 0 && this.props.renderEmpty?.(section.id)}
          <DashboardGrid
            container={this.props.container}
            PanelComponent={this.props.PanelComponent}
            panels={sectionPanels}
            onLayoutChanged={this.onGridLayoutChanged}
          />
        </div>
      </React.Fragment>
    );
  };

  private renderContainerScreen() {
    const { container, PanelComponent } = this.props;
    const {
      isEmbeddedExternally,
      isFullScreenMode,
      panels,
      title,
      description,
      useMargins,
      sections,
    } = this.state;
    const panelsWithoutSection = panelsInSection(panels);
    return (
      <div
        data-shared-items-count={Object.values(panelsWithoutSection).length}
        data-shared-items-container
        data-title={title}
        data-description={description}
        className={useMargins ? 'dshDashboardViewport-withMargins' : 'dshDashboardViewport'}
      >
        {isFullScreenMode && (
          <this.context.services.ExitFullScreenButton
            onExitFullScreenMode={this.onExitFullScreenMode}
            toggleChrome={!isEmbeddedExternally}
          />
        )}
        {Object.entries(panelsWithoutSection).length === 0 && this.props.renderEmpty?.()}
        <DashboardGrid
          panels={panelsWithoutSection}
          container={container}
          PanelComponent={PanelComponent}
          onLayoutChanged={this.onGridLayoutChanged}
        />
        {sections?.map(this.renderSection)}
      </div>
    );
  }

  public render() {
    const isCompletelyEmpty =
      !this.state.sections?.length && !Object.entries(this.state.panels).length;
    return (
      <React.Fragment>
        {isCompletelyEmpty ? this.renderEmptyScreen() : null}
        {!isCompletelyEmpty && this.renderContainerScreen()}
      </React.Fragment>
    );
  }
}
