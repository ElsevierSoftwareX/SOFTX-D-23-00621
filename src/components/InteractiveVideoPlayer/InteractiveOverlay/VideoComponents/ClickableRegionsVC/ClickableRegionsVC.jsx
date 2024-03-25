import PropTypes from "prop-types";
import React from "react";
import { Logger } from "../../../helpers";
import ClickableRegion from "./ClickableRegion";
import "./ClickableRegionsVC.scss";

/**
 * Component that renders a list of interactive clickable regions on the video.
 */
export default class ClickableRegionsVC extends React.Component {
  // Force this component to has that nature
  static nature = "clickable-regions-vc";

  // Ensure received props belong to these types
  static propTypes = {
    regions: PropTypes.arrayOf(
      PropTypes.shape({
        points: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number).isRequired).isRequired,
        onSelect: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        correct: PropTypes.bool.isRequired,
        styles: PropTypes.shape({}),
      }).isRequired
    ).isRequired,
    actions: PropTypes.shape({
      setPlayerTime: PropTypes.func.isRequired,
      getVideoId: PropTypes.func.isRequired,
      getPlayerSize: PropTypes.func.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);

    // Initial state
    this.state = {
      display: false,
    };
  }

  // Bang
  execute(key) {
    Logger.info(`+ ClickableRegionsVC executed: ${key}`);

    this.setState({ display: true });
  }

  // If this interactive video component were to render something, do it here
  render() {
    const { actions, regions } = this.props;
    const { display } = this.state;
    const videoSize = actions.getPlayerSize();

    const regionRenderer = (region, i) => (
      <ClickableRegion
        key={i}
        points={region.points}
        onSelect={region.onSelect}
        correct={region.correct}
        styles={region.styles}
        actions={actions}
        videoSize={videoSize}
      />
    );

    return (
      display && (
        <div className="clickable-regions-wrapper">
          <svg viewBox={`0 0 ${videoSize.w} ${videoSize.h}`}>{regions.map(regionRenderer)}</svg>
        </div>
      )
    );
  }
}
