import PropTypes from "prop-types";
import React from "react";
import { isTimeInRange, Logger } from "../helpers";
import { Settings } from "../index";
import "./InteractiveOverlay.scss";
import VideoComponentFactory from "./VideoComponents";

/**
 * Component that renders the interactive overlay on top of the video player.
 */
export default class InteractiveOverlay extends React.Component {
  static propTypes = {
    actions: PropTypes.shape({
      getPlayerSize: PropTypes.func.isRequired,
      getPlayerTime: PropTypes.func.isRequired,
      setPlayerTime: PropTypes.func.isRequired,
      pausePlayer: PropTypes.func.isRequired,
      playPlayer: PropTypes.func.isRequired,
      getVideoId: PropTypes.func.isRequired,
    }).isRequired,
    registerPlayerEvent: PropTypes.func.isRequired,
    unregisterPlayerEvent: PropTypes.func.isRequired,
    videoSequenceDefinition: PropTypes.shape({
      url: PropTypes.string.isRequired,
      version: PropTypes.number.isRequired,
      sequence: PropTypes.array.isRequired,
      components: PropTypes.shape({}).isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      sequence: [],
      activeComponents: {},
    };
  }

  componentDidMount() {
    // Process the video sequence definition
    const {
      videoSequenceDefinition: { url, version, sequence: sequenceDef, components: componentsDef },
      actions,
      registerPlayerEvent,
    } = this.props;

    const { sequence: stateSequence, activeComponents: stateActiveComponents } = this.state;

    // Check that version of ISD matches
    if (version !== Settings.ISD_VERSION) {
      Logger.warn(
        `Version in the ISD file (${version}) does not match the one supported by IVA (${Settings.ISD_VERSION}); some features may not work.`
      );
    }

    const sequence = [...stateSequence];
    for (const seq of sequenceDef) {
      // Check that the referenced component really exists
      const componentRef = seq.component;
      if (!componentsDef.hasOwnProperty(componentRef)) {
        Logger.warn(`Undefined component reference "${componentRef}" in ${url}; skipping.`);
        continue;
      }
      const componentDef = componentsDef[componentRef];

      // Check that the component's nature exists
      const { nature } = componentDef;
      if (!VideoComponentFactory.natureIsValid(nature)) {
        Logger.warn(`Undefined nature "${nature}" in component "${componentRef}" in ${url}; skipping."`);
        continue;
      }

      // Finally, create the component...
      const element = {
        start: seq.start,
        end: seq.end,
        component: VideoComponentFactory.create(componentDef.nature, {
          key: seq.component,
          ...componentDef[componentDef.nature],
          actions,
        }),
      };

      // ... and add it to the sequence
      sequence.push(element);
    }
    this.setState({ sequence });

    // Then register a timeupdate event to check/run the components on any new
    // update. This is fired every 15-250 milliseconds, depending on the
    // playback technology in use.
    Logger.info("Registered 'timeupdate' event on player.");
    registerPlayerEvent("timeupdate", () => {
      const time = actions.getPlayerTime();
      Logger.info(`Playback time: ${time}`);

      // On each time update, check the elements in the sequence to find the
      // ones that have to be executed
      const { sequence: newStateSequence } = this.state;
      newStateSequence.forEach((element) => {
        const { component } = element;
        const componentKey = `${component.key}-${element.start}-${element.end}`;

        // Check if the player's time has already reached the component starting
        // time
        if (isTimeInRange(time, element.start)) {
          // Add the component to the state to "mark" it as active. By changing
          // the state, the component will be rendered again, thus running again
          // the reducer to add the active components to the DOM
          const activeComponents = { ...stateActiveComponents };

          // ... but first, ensure that the component does not already exist in
          // the active components container; we don't want to execute it more
          // than once if this listener triggers too fast
          if (!activeComponents[componentKey]) {
            activeComponents[componentKey] = component;

            // After the state is actually updated, we have a reference to the
            // component, so we can use it.
            this.setState({ activeComponents }, () => {
              activeComponents[componentKey].ref.current.execute(component.key);
            });
          }
        }

        // Check if the component life has ended
        if (stateActiveComponents[componentKey] && (time < element.start || time >= element.end)) {
          // Then, remove it from the state
          const activeComponents = { ...stateActiveComponents };
          activeComponents[componentKey] = undefined;
          this.setState({ activeComponents });

          Logger.info(`Active component "${componentKey}" removed.`);
        }
      });
    });
  }

  componentWillUnmount() {
    const { unregisterPlayerEvent } = this.props;

    unregisterPlayerEvent("timeupdate");
  }

  activeComponentRenderer = (key) => {
    const { activeComponents } = this.state;
    return activeComponents[key];
  };

  render() {
    const { activeComponents } = this.state;

    return <div className="interactive-overlay">{Object.keys(activeComponents).map(this.activeComponentRenderer)}</div>;
  }
}
