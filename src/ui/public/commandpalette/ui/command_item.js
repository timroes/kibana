import React from 'react';
import chrome from 'ui/chrome';
import {
  KuiFlexGroup,
  KuiFlexItem
} from 'ui_framework/components';

import classNames from 'classnames';

export function CommandItem(props) {
  const { command } = props;
  const iconUrl = command.entry.icon ? chrome.addBasePath(command.entry.icon) : null;
  const icon = iconUrl ? <img src={iconUrl}/> : null;
  const hotkey = command.entry.hotkey;
  const classes = classNames('commandpalette__item', {
    'commandpalette__item--selected': props.selected
  });
  return (
    <li
      className={classes}
    >
      <KuiFlexGroup>
        <KuiFlexItem grow={false} className="commandpalette__icon">{icon}</KuiFlexItem>
        <KuiFlexItem className="synopsis">
          <h4 className="kuiTextTitle synopsisTitle">
            {command.entry.title}
          </h4>
          <p className="kuiText kuiSubduedText">
            {command.entry.desc}
          </p>
        </KuiFlexItem>
        {
          hotkey &&
          <div className="commandpalette__hotkey">
            { hotkey.ctrl && <span className="commandpalette__key">Ctrl</span> }
            { hotkey.shift && <span className="commandpalette__key">Shift</span> }
            <span className="commandpalette__key">{ hotkey.letter }</span>
          </div>
        }
      </KuiFlexGroup>
    </li>
  );
}
