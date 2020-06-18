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

import React, { useCallback, useState, useMemo } from 'react';

import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiButtonEmpty,
  EuiButtonIcon,
  isColorDark,
  hexToRgb,
  EuiPopover,
  EuiPopoverTitle,
  EuiFormRow,
  EuiFieldText,
  EuiColorPicker,
  euiPaletteColorBlindBehindText,
  EuiPopoverFooter,
  EuiButton,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n/react';
import { EuiColorPickerOutput } from '@elastic/eui/src/components/color_picker/color_picker';
import { useDebounce } from 'react-use';
import { DashboardSection } from '../../types';
import { ViewMode } from '../../../../embeddable/public';

interface SectionHeaderProps {
  section: DashboardSection;
  viewMode: ViewMode;
  isCollapsed: boolean;
  onToggleSection: (id: string) => void;
  onAddPanelToSection: (id: string) => void;
  onSectionChange: (section: DashboardSection) => void;
  onRemoveSection: (id: string) => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  section,
  viewMode,
  isCollapsed,
  onToggleSection,
  onSectionChange,
  onAddPanelToSection,
  onRemoveSection,
}) => {
  const textColor = section.color && isColorDark(...hexToRgb(section.color)) ? '#FFF' : undefined;
  const palette = useMemo(() => euiPaletteColorBlindBehindText(), []);

  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [color, setColor] = useState(section.color);
  const [title, setTitle] = useState(section.title);

  const onUpdateSection = useCallback(() => {
    onSectionChange({
      ...section,
      color,
      title,
    });
  }, [onSectionChange, section, color, title]);

  // Debounce updating the section to the user of this component to 1 second,
  // so we're not spamming updates, e.g. when a user types or drags the color wheel
  useDebounce(
    () => {
      onSectionChange({
        ...section,
        color,
        title,
      });
    },
    1000,
    [onSectionChange, section, color, title]
  );

  const toggleSettings = useCallback(() => {
    setSettingsOpen((isOpen) => {
      return !isOpen;
    });
  }, []);
  const closeSettings = useCallback(() => {
    setSettingsOpen(false);
    onUpdateSection();
  }, [onUpdateSection]);

  const onChangeColor = useCallback((text: string, output: EuiColorPickerOutput) => {
    setColor(output.hex);
  }, []);

  const onSectionTitleChange = useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(ev.target.value);
  }, []);

  // Use all callbacks in a cached version, so the elements using them won't be rerendered constantly.
  const onToggle = useCallback(() => {
    onToggleSection(section.id);
  }, [onToggleSection, section.id]);

  const onRemove = useCallback(() => {
    onRemoveSection(section.id);
  }, [onRemoveSection, section.id]);

  const onAddPanel = useCallback(() => {
    onAddPanelToSection(section.id);
  }, [onAddPanelToSection, section.id]);

  return (
    <h1 style={{ backgroundColor: section.color, color: textColor }}>
      <EuiFlexGroup alignItems="center" gutterSize="s">
        <EuiFlexItem>
          <EuiButtonEmpty
            flush="left"
            iconType={isCollapsed ? 'arrowRight' : 'arrowDown'}
            onClick={onToggle}
            color="text"
          >
            {section.title}
          </EuiButtonEmpty>
        </EuiFlexItem>
        {viewMode === ViewMode.EDIT && (
          <>
            <EuiFlexItem grow={false}>
              <EuiButtonIcon
                iconType="plusInCircle"
                onClick={onAddPanel}
                aria-label="Add panel to this section"
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiPopover
                isOpen={isSettingsOpen}
                closePopover={closeSettings}
                withTitle
                ownFocus
                button={
                  <EuiButtonIcon
                    iconType="gear"
                    onClick={toggleSettings}
                    aria-label={i18n.translate('dashboard.section.settings', {
                      defaultMessage: 'Section settings',
                    })}
                  />
                }
              >
                <EuiPopoverTitle>
                  <FormattedMessage
                    id="dashboard.section.optionTitle"
                    defaultMessage="Section Options"
                  />
                </EuiPopoverTitle>
                <div>
                  <EuiFormRow
                    label={i18n.translate('dashboard.section.sectionTitle', {
                      defaultMessage: 'Section Title',
                    })}
                  >
                    <EuiFieldText value={title} onChange={onSectionTitleChange} />
                  </EuiFormRow>
                  <EuiFormRow
                    label={i18n.translate('dashboard.section.color', { defaultMessage: 'Color' })}
                  >
                    <EuiColorPicker
                      color={color}
                      onChange={onChangeColor}
                      showAlpha={false}
                      swatches={palette}
                    />
                  </EuiFormRow>
                </div>
                <EuiPopoverFooter>
                  <EuiButton color="danger" onClick={onRemove} fullWidth size="s">
                    <FormattedMessage
                      id="dashboard.section.remove"
                      defaultMessage="Remove section"
                    />
                  </EuiButton>
                </EuiPopoverFooter>
              </EuiPopover>
            </EuiFlexItem>
          </>
        )}
      </EuiFlexGroup>
    </h1>
  );
};
