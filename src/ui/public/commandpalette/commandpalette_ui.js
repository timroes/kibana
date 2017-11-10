import React, { Component } from 'react';
import classNames from 'classnames';

import FocusTrap from 'focus-trap-react';

import { registry } from './commandpalette';
import { CommandItem } from './ui/command_item';

import { keyCodes } from 'ui_framework/services';

import './commandpalette.less';

// TODO: refactor, split up components more
// TODO: Keep keyboard focus inside component

const LIMIT_RESULTS = 5;

export class CommandPalette extends Component {

  state = {
    filteredCommands: [],
    filteredCommandsOffset: 0,
    open: false,
    query: '',
    selectedIndex: 0,
  };

  execute = (cmd) => {
    if (cmd) {
      registry.execute(cmd)
        .then(this.close);
    }
  };

  moveSelection = (direction) => {
    this.setState((prev) => {
      let newIndex = Math.min(prev.selectedIndex + direction, prev.filteredCommands.length - 1);
      let newOffset = prev.filteredCommandsOffset;
      if (newIndex < 0) {
        newOffset = Math.max(0, newOffset + newIndex);
        newIndex = 0;
      } else if (newIndex >= LIMIT_RESULTS) {
        newOffset = Math.min(newOffset + (newIndex - LIMIT_RESULTS + 1), prev.filteredCommands.length - LIMIT_RESULTS);
        newIndex = LIMIT_RESULTS - 1;
      }
      return {
        filteredCommandsOffset: newOffset,
        selectedIndex: newIndex,
      };
    });
  };

  onInputKeyDown = (ev) => {
    if (ev.keyCode === keyCodes.ESCAPE) {
      ev.preventDefault();
      this.close();
    } else if (ev.keyCode === keyCodes.ENTER) {
      const cmd = this.state.filteredCommands[this.state.selectedIndex];
      ev.preventDefault();
      this.execute(cmd);
    } else if (ev.keyCode === keyCodes.UP) {
      ev.preventDefault();
      this.moveSelection(-1);
    } else if (ev.keyCode === keyCodes.DOWN) {
      ev.preventDefault();
      this.moveSelection(1);
    }
  };

  onInputChange = (ev) => {
    this.setState({
      query: ev.target.value,
      filteredCommandsOffset: 0,
      selectedIndex: 0,
    });
    registry.find(ev.target.value)
      .then(filteredCommands => {
        this.setState({ filteredCommands });
      });
  };

  close = () => {
    this.setState({
      open: false,
      filteredCommands: [],
      filteredCommandsOffset: 0,
      query: '',
      selectedIndex: 0,
    });
  };

  onBodyKeyPress = (ev) => {
    if ((ev.key === 'K' || ev.key === 'P') && ev.shiftKey && ev.ctrlKey) {
      ev.preventDefault();
      this.setState({
        open: true
      });
    } else {
      // TODO: will find be polyfilled?
      const command = registry.commands.find(cmd => {
        if (!cmd.entry.hotkey) return;
        const hotkey = cmd.entry.hotkey;
        return !!hotkey.shift === ev.shiftKey &&
          !!hotkey.ctrl === ev.ctrlKey &&
          hotkey.keyCode === ev.keyCode;
      });
      if (command) {
        ev.preventDefault();
        this.execute(command);
      }
    }
  };

  componentDidMount() {
    document.querySelector('body').addEventListener('keypress', this.onBodyKeyPress);
  }

  componentWillUnmount() {
    document.querySelector('body').removeEventListener(this.onBodyKeyPress);
  }


  _renderCommand = (cmd, index) => {
    return (
      <CommandItem
        key={cmd.entry.id}
        command={cmd}
        selected={index === this.state.selectedIndex}
      />
    );
  };

  _renderFilteredCommands = () => {
    const { filteredCommandsOffset: offset, filteredCommands } = this.state;
    const commands = filteredCommands.slice(offset, offset + LIMIT_RESULTS).map(this._renderCommand);
    return (
      commands
    );
  };

  render() {
    const commandpaletteClass = classNames('commandpalette', {
      'commandpalette--open': this.state.open
    });
    return (
      <div className={commandpaletteClass}>
        <div
          className="commandpalette__backdrop"
          onClick={this.close}
        />
        <FocusTrap
          active={this.state.open}
          focusTrapOptions={{
            clickOutsideDeactivates: true
          }}
        >
          <div className="commandpalette__dialog">
            <input
              type="text"
              className="commandpalette__input"
              onChange={this.onInputChange}
              onKeyDown={this.onInputKeyDown}
              value={this.state.query}
            />
            <ul className="commandpalette__commands">
              { this._renderFilteredCommands() }
            </ul>
            { this.state.filteredCommands.length > LIMIT_RESULTS &&
              <div className="commandpalette_moreItems">
                and { this.state.filteredCommands.length - LIMIT_RESULTS } more results
              </div>
            }
          </div>
        </FocusTrap>
      </div>
    );
  }
}
