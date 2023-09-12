import styled from "@emotion/styled";
import PropTypes from "prop-types";
import PubSub from "pubsub-js";
import React from "react";
import c from "../../../../constants";
import "./ClickableRegion.scss";

export default function ClickableRegion({ styles, onSelect, correct, actions, videoSize, points }) {
  const Region = styled.polygon`
    ${styles && styles.default}

    &:hover,
    &:focus,
    &:active {
      ${styles && styles.hover}
    }
  `;

  const handleOnClick = () => {
    actions.setPlayerTime(onSelect);

    // Register whether the user selected a correct region or not
    PubSub.publish(c.PUBSUB_TOPIC_GA_EVENT, {
      category: c.GA_EVENT_CATEGORY_VC,
      action: correct ? c.GA_EVENT_ACTION_VC_CLICKABLE_REGION_CORRECT : c.GA_EVENT_ACTION_VC_CLICKABLE_REGION_INCORRECT,
      label: actions.getVideoId(),
    });

    // TODO: Handle also "link" natures
  };

  const percentagePointsToReal = (point, _i) => {
    const x = (point[0] / 100) * videoSize.w;
    const y = (point[1] / 100) * videoSize.h;
    return `${x},${y} `;
  };

  return (
    <Region className="clickable-region" points={points.map(percentagePointsToReal).join("")} onClick={handleOnClick} />
  );
}

ClickableRegion.propTypes = {
  styles: PropTypes.shape({
    default: PropTypes.shape({}).isRequired,
    hover: PropTypes.shape({}),
  }),
  onSelect: PropTypes.number.isRequired,
  correct: PropTypes.bool,
  actions: PropTypes.shape({
    setPlayerTime: PropTypes.func.isRequired,
    getVideoId: PropTypes.func.isRequired,
  }).isRequired,
  videoSize: PropTypes.shape({
    w: PropTypes.number.isRequired,
    h: PropTypes.number.isRequired,
  }).isRequired,
  points: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
};

ClickableRegion.defaultProps = {
  styles: null,
  correct: false,
};
