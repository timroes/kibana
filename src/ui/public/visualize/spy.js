import $ from 'jquery';
import { render, unmountComponentAtNode } from 'react-dom';
import React from 'react';
import { SpyModesRegistryProvider } from '../registry/spy_modes';
import { uiModules } from '../modules';
import spyTemplate from './spy.html';
import { PersistedState } from '../persisted_state';

uiModules
  .get('app/visualize')
  .directive('visualizeSpy', function (Private, $compile, $timeout) {

    const spyModes = Private(SpyModesRegistryProvider);

    return {
      restrict: 'E',
      template: spyTemplate,
      scope: {
        vis: '<',
        searchSource: '<',
        uiState: '<',
        visElement: '<',
      },
      link: function ($scope, $el) {

        // If no uiState has been passed, create a local one for this spy.
        if (!$scope.uiState) $scope.uiState = new PersistedState({});

        let currentSpy;
        let defaultModeName;

        const $container = $el.find('[data-spy-content-container]');

        $scope.modes = [];

        $scope.currentMode = null;
        $scope.maximizedSpy = false;
        $scope.forceMaximized = false;

        function checkForcedMaximized() {
          $timeout(() => {
            if ($scope.visElement && $scope.currentMode && $scope.visElement.height() < 180) {
              $scope.forceMaximized = true;
            } else {
              $scope.forceMaximized = false;
            }
          });
        }

        checkForcedMaximized();


        /**
         * Filter for modes that should actually be active for this visualization.
         * This will call the showMode method of the mode, pass it the vis object.
         * Depending on whether or not that returns a truthy value, it will be shown
         * or not. If the method is not present, the mode will always be shown.
         */
        function filterModes() {
          $scope.modes = spyModes.inOrder.filter(mode =>
            mode.showMode ? mode.showMode($scope.vis) : true
          );
          defaultModeName = $scope.modes.length > 0 ? $scope.modes[0].name : null;
        }

        filterModes();
        $scope.$watch('vis', filterModes);

        function syncFromUiState() {
          $scope.currentMode = $scope.uiState.get('spy.mode.name');
          $scope.maximizedSpy = $scope.uiState.get('spy.mode.fill');
        }

        /**
         * Write our current state into the uiState.
         * This will write the name and fill (maximized) into the uiState
         * if a panel is opened (currentMode is set) or it will otherwise
         * remove the spy key from the uiState.
         */
        function updateUiState() {
          if ($scope.currentMode) {
            $scope.uiState.set('spy.mode', {
              name: $scope.currentMode,
              fill: $scope.maximizedSpy,
            });
          } else {
            $scope.uiState.set('spy', null);
          }
        }

        // Initially sync the panel state from the uiState.
        syncFromUiState();

        // Whenever the uiState changes, update the settings from it.
        $scope.uiState.on('change', syncFromUiState);
        $scope.$on('$destroy', () => $scope.uiState.off('change', syncFromUiState));

        $scope.setSpyMode = function setSpyMode(modeName) {
          $scope.currentMode = modeName;
          updateUiState();
          $scope.$emit('render');
        };

        $scope.toggleDisplay = function () {
          // If the spy panel is already shown (a currentMode is set),
          // close the panel by setting the name to null, otherwise open the
          // panel (i.e. set it to the default mode name).
          if ($scope.currentMode) {
            $scope.setSpyMode(null);
            $scope.forceMaximized = false;
          } else {
            $scope.setSpyMode(defaultModeName);
            checkForcedMaximized();
          }
        };

        /**
         * Should we currently show the spy panel. True if a currentMode has been set.
         */
        $scope.shouldShowSpyPanel = () => {
          return !!$scope.currentMode;
        };

        /**
         * Toggle maximized state of spy panel and update the UI state.
         */
        $scope.toggleMaximize = function () {
          $scope.maximizedSpy = !$scope.maximizedSpy;
          updateUiState();
        };

        /**
         * Whenever the maximized state changes, we also need to toggle the class
         * of the visualization.
         */
        $scope.$watchMulti(['maximizedSpy', 'forceMaximized'], () => {
          $scope.visElement.toggleClass('spy-only', $scope.maximizedSpy || $scope.forceMaximized);
        });

        /**
         * Renders the currently active spy via its React component to the DOM.
         * This method must only be called if the current spy is a react spy.
         */
        function renderReactSpy() {
          render(
            React.createElement(currentSpy.component, { vis: $scope.vis }),
            currentSpy.$container[0]
          );
        }

        /**
         * Watch for changes of the currentMode. Whenever it changes, we render
         * the new mode into the template. Therefore we remove the previously rendered
         * mode (if existing) and compile and bind the template of the new mode.
         */
        $scope.$watch('currentMode', (mode, prevMode) => {
          if (mode === prevMode && (currentSpy && currentSpy.mode === mode)) {
            // When the mode hasn't changed and we have already rendered it, return.
            return;
          }

          const newMode = spyModes.byName[mode];

          if (currentSpy) {
            // In case we already had a spy loaded, we clean it up first.
            if (currentSpy.$scope) {
              // In case of an Angular spy, destroy the scope
              currentSpy.$scope.$destroy();
            } else {
              // In case of a react spy, unregister the vis $scope watch
              // and unmount the React component.
              currentSpy.visWatch();
              unmountComponentAtNode(currentSpy.$container[0]);
            }
            // Remove the actual container element.
            currentSpy.$container.remove();
            currentSpy = null;
          }

          // If we want haven't specified a new mode we won't do anything further.
          if (!newMode) {
            // Reset the forced maximized flag if we are about to close the panel.
            $scope.forceMaximized = false;
            return;
          }

          const contentContainer = $('<div class="visualize-spy-content">');

          if (newMode.component) {
            // Render via react
            // In case $scope.vis updates, we need to rerender the component
            const visWatch = $scope.$watch('vis', renderReactSpy);
            currentSpy = {
              component: newMode.component,
              visWatch: visWatch,
              $container: contentContainer,
              mode: mode,
            };
            $container.append(contentContainer);
            renderReactSpy();
          } else {
            // Render via Angular
            const contentScope = $scope.$new();
            contentContainer.append($compile(newMode.template)(contentScope));

            currentSpy = {
              $scope: contentScope,
              $container: contentContainer,
              mode: mode,
            };

            $container.append(contentContainer);
            newMode.link && newMode.link(currentSpy.$scope, currentSpy.$element);
          }

        });
      }
    };
  });
