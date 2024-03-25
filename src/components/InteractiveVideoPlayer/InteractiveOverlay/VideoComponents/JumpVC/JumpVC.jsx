import PropTypes from "prop-types";
import React from "react";
import { Logger } from "../../../helpers";
import "./JumpVC.scss";

/**
 * Component that jumps the player's playback to a specific time.
 */
export default class JumpVC extends React.Component {
  // Force this component to has that nature
  static nature = "jump-vc";

  // Ensure received props belong to these types
  static propTypes = {
    to: PropTypes.number.isRequired,
    repeat: PropTypes.number.isRequired,
    actions: PropTypes.shape({
      setPlayerTime: PropTypes.func.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);

    // Initial state
    this.state = {
      repetitions: 0,
    };
  }

  // Bang
  execute(key) {
    Logger.info(`+ JumpVC executed: ${key}`);

    const { actions, repeat, to } = this.props;
    const { repetitions } = this.state;

    if (repeat !== -1) {
      this.setState((prevState, _props) => ({
        repetitions: prevState.repetitions + 1,
      }));
    }

    // Check if this component still has more repetitions
    const willJump = repetitions <= repeat || repeat === -1;
    if (willJump) {
      // Jump player's playback to the specified time
      actions.setPlayerTime(to);

      Logger.info(`  Repetition: ${repeat === -1 ? "forever" : `${repetitions} out ${repeat}`}`);
    }
  }

  // If this interactive video component were to render something, do it here
  render() {
    return null;
  }
}
