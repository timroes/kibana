import chrome from 'ui/chrome';

class CommandRegistry {

  commands = [];

  register(entry, action) {
    const command = {
      entry, action
    };
    this.commands.push(command);
    return {
      unregister: () => {
        this.commands.splice(this.commands.indexOf(command), 1);
      },
      enable: () => {
        command.disabled = false;
      },
      disable: () => {
        command.disabled = true;
      }
    };
  }

  find(query) {
    return new Promise((resolve) => {
      // TODO: Better filter logic
      const filteredCommands = this.commands.filter((cmd) =>
        !cmd.disabled  &&
        cmd.entry.title.toLowerCase().includes(query.toLowerCase())
      );
      resolve(filteredCommands);
    });
  }

  execute(command) {
    return new Promise((resolve) => {
      if (typeof command.action === 'string') {
        // TODO: properly add base path
        window.location.href = chrome.addBasePath(command.action);
        resolve();
      } else if (typeof command.action === 'function') {
        resolve(command.action(/* TODO: some parameters */));
      }
    });
  }

}

const registry = new CommandRegistry();
export { registry };
