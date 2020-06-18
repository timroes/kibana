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
import ReactDOM from 'react-dom';
import { I18nProvider } from '@kbn/i18n/react';
import { RefreshInterval, TimeRange, Query, Filter } from 'src/plugins/data/public';
import { CoreStart } from 'src/core/public';
import { Start as InspectorStartContract } from 'src/plugins/inspector/public';
import uuid from 'uuid';
import { i18n } from '@kbn/i18n';
import { getSavedObjectFinder } from '../../../../saved_objects/public';
import { openAddPanelFlyout } from '../../../../embeddable/public';
import { UiActionsStart } from '../../ui_actions_plugin';
import {
  Container,
  ContainerInput,
  EmbeddableInput,
  ViewMode,
  EmbeddableFactory,
  IEmbeddable,
  EmbeddableStart,
  PanelState,
} from '../../embeddable_plugin';
import { DASHBOARD_CONTAINER_TYPE } from './dashboard_constants';
import { createPanelState } from './panel';
import { DashboardPanelState } from './types';
import { DashboardViewport } from './viewport/dashboard_viewport';
import {
  KibanaContextProvider,
  KibanaReactContext,
  KibanaReactContextValue,
} from '../../../../kibana_react/public';
import { PLACEHOLDER_EMBEDDABLE } from './placeholder';
import { PanelPlacementMethod, IPanelPlacementArgs } from './panel/dashboard_panel_placement';
import { DashboardSection } from '../../types';
import { panelsInSection } from '../sections';
import { DashboardToolbar } from './dashboard_toolbar';

export interface DashboardContainerInput extends ContainerInput {
  viewMode: ViewMode;
  filters: Filter[];
  query: Query;
  timeRange: TimeRange;
  refreshConfig?: RefreshInterval;
  expandedPanelId?: string;
  useMargins: boolean;
  title: string;
  description?: string;
  isEmbeddedExternally?: boolean;
  isFullScreenMode: boolean;
  panels: {
    [panelId: string]: DashboardPanelState<EmbeddableInput & { [k: string]: unknown }>;
  };
  sections?: DashboardSection[];
}

interface IndexSignature {
  [key: string]: unknown;
}

export interface InheritedChildInput extends IndexSignature {
  filters: Filter[];
  query: Query;
  timeRange: TimeRange;
  refreshConfig?: RefreshInterval;
  viewMode: ViewMode;
  hidePanelTitles?: boolean;
  id: string;
}

export interface DashboardContainerOptions {
  application: CoreStart['application'];
  overlays: CoreStart['overlays'];
  notifications: CoreStart['notifications'];
  embeddable: EmbeddableStart;
  inspector: InspectorStartContract;
  SavedObjectFinder: React.ComponentType<any>;
  ExitFullScreenButton: React.ComponentType<any>;
  uiActions: UiActionsStart;
  core: CoreStart;
}

interface SectionIdMeta {
  sectionId: string;
}

/**
 * Returns whether a given unknown parameter contains section id meta information,
 * i.e. is an object with a sectionId key.
 */
function isSectionIdMeta(param: unknown): param is SectionIdMeta {
  return typeof param === 'object' && param !== null && 'sectionId' in param;
}

export type DashboardReactContextValue = KibanaReactContextValue<DashboardContainerOptions>;
export type DashboardReactContext = KibanaReactContext<DashboardContainerOptions>;

export class DashboardContainer extends Container<InheritedChildInput, DashboardContainerInput> {
  public readonly type = DASHBOARD_CONTAINER_TYPE;

  public renderEmpty?: undefined | (() => React.ReactNode);

  constructor(
    initialInput: DashboardContainerInput,
    private readonly options: DashboardContainerOptions,
    parent?: Container
  ) {
    super(
      {
        ...initialInput,
      },
      { embeddableLoaded: {} },
      options.embeddable.getEmbeddableFactory,
      parent
    );
  }

  protected createNewPanelState = <
    TEmbeddableInput extends EmbeddableInput,
    TEmbeddable extends IEmbeddable<TEmbeddableInput, any>
  >(
    factory: EmbeddableFactory<TEmbeddableInput, any, TEmbeddable>,
    partial: Partial<TEmbeddableInput> = {},
    meta?: unknown
  ): DashboardPanelState<TEmbeddableInput> => {
    const panelState = super.createNewPanelState(factory, partial);
    const sectionToAdd = isSectionIdMeta(meta) ? meta.sectionId : undefined;
    return createPanelState(
      panelState,
      panelsInSection(this.input.panels, sectionToAdd),
      sectionToAdd
    );
  };

  public showPlaceholderUntil<TPlacementMethodArgs extends IPanelPlacementArgs>(
    newStateComplete: Promise<Partial<DashboardPanelState>>,
    sectionId?: string,
    placementMethod?: PanelPlacementMethod<TPlacementMethodArgs>,
    placementArgs?: TPlacementMethodArgs
  ): void {
    const originalPanelState = {
      type: PLACEHOLDER_EMBEDDABLE,
      explicitInput: {
        id: uuid.v4(),
        disabledActions: [
          'ACTION_CUSTOMIZE_PANEL',
          'CUSTOM_TIME_RANGE',
          'clonePanel',
          'replacePanel',
          'togglePanel',
        ],
      },
    } as PanelState<EmbeddableInput>;
    const placeholderPanelState = createPanelState(
      originalPanelState,
      this.input.panels,
      sectionId,
      placementMethod,
      placementArgs
    );
    this.updateInput({
      panels: {
        ...this.input.panels,
        [placeholderPanelState.explicitInput.id]: placeholderPanelState,
      },
    });
    newStateComplete.then((newPanelState: Partial<PanelState>) => {
      const finalPanels = { ...this.input.panels };
      delete finalPanels[placeholderPanelState.explicitInput.id];
      const newPanelId = newPanelState.explicitInput?.id
        ? newPanelState.explicitInput.id
        : uuid.v4();
      finalPanels[newPanelId] = {
        ...placeholderPanelState,
        ...newPanelState,
        gridData: {
          ...placeholderPanelState.gridData,
          i: newPanelId,
        },
        explicitInput: {
          ...newPanelState.explicitInput,
          id: newPanelId,
        },
      };
      this.updateInput({
        panels: finalPanels,
        lastReloadRequestTime: new Date().getTime(),
      });
    });
  }

  private addNewToSection = async (sectionId: string) => {
    openAddPanelFlyout({
      embeddable: this,
      getAllFactories: this.options.embeddable.getEmbeddableFactories,
      getFactory: this.options.embeddable.getEmbeddableFactory,
      notifications: this.options.notifications,
      overlays: this.options.overlays,
      SavedObjectFinder: getSavedObjectFinder(
        this.options.core.savedObjects,
        this.options.core.uiSettings
      ),
      embeddableMetaInformation: {
        sectionId,
      },
    });
  };

  private onAddSection = () => {
    this.updateInput({
      sections: [
        ...(this.getInput().sections ?? []),
        {
          id: uuid(),
          title: i18n.translate('dashboard.section.newSectionDefaultName', {
            defaultMessage: 'Dashboard Section',
          }),
        },
      ],
    });
    this.options.notifications.toasts.addSuccess(
      i18n.translate('dashboard.section.newSectionSuccessToast', {
        defaultMessage: 'New section was added to bottom of dashboard.',
      })
    );
  };

  public render(dom: HTMLElement) {
    ReactDOM.render(
      <I18nProvider>
        <KibanaContextProvider services={this.options}>
          <DashboardToolbar onCreateSection={this.onAddSection} />
          <DashboardViewport
            renderEmpty={this.renderEmpty}
            container={this}
            PanelComponent={this.options.embeddable.EmbeddablePanel}
            onAddToSection={this.addNewToSection}
          />
        </KibanaContextProvider>
      </I18nProvider>,
      dom
    );
  }

  protected getInheritedInput(id: string): InheritedChildInput {
    const { viewMode, refreshConfig, timeRange, query, hidePanelTitles, filters } = this.input;
    return {
      filters,
      hidePanelTitles,
      query,
      timeRange,
      refreshConfig,
      viewMode,
      id,
    };
  }
}
