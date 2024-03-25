import styled from "@emotion/styled";
import PropTypes from "prop-types";
import React from "react";
import "./Icon.scss";

/**
 * Component that renders an icon on the informative panel.
 */
export default function Icon({ panelWidth, iconWidth, side, styles, onClick, image, imageCustomClass }) {
  let cssForSide = {
    right: `calc(${panelWidth} - ${iconWidth} / 2);`,
  };
  if (side === "left") {
    cssForSide = { left: cssForSide.right };
  }

  const Img = styled.img`
    ${styles && styles.default}

    ${cssForSide}

    &:hover,
    &:focus,
    &:active {
      ${styles && styles.hover}
    }
  `;

  return <Img onClick={onClick} src={image} className={`icon ${imageCustomClass}`} />;
}

Icon.propTypes = {
  styles: PropTypes.shape({
    default: PropTypes.shape({}).isRequired,
    hover: PropTypes.shape({}),
  }),
  panelWidth: PropTypes.string.isRequired,
  iconWidth: PropTypes.string.isRequired,
  side: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  image: PropTypes.string.isRequired,
  imageCustomClass: PropTypes.string.isRequired,
};

Icon.defaultProps = {
  styles: null,
};
