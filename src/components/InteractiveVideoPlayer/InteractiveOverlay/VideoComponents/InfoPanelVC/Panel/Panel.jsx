import styled from "@emotion/styled";
import PropTypes from "prop-types";
import React from "react";
import "./Panel.scss";

function Panel({ side, styles, content }) {
  let cssForSide = { right: 0 };
  if (side === "left") {
    cssForSide = { left: 0 };
  }

  const Div = styled.div`
    ${styles && styles.default}

    ${cssForSide}
  `;

  return (
    <Div className="panel">
      <iframe title="Informative panel" src={content} frameBorder="0" />
    </Div>
  );
}

Panel.propTypes = {
  styles: PropTypes.shape({
    default: PropTypes.shape({}).isRequired,
    hover: PropTypes.shape({}),
  }),
  side: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
};

Panel.defaultProps = {
  styles: null,
};

// We use React.memo(...) (or extend the component from PureComponent in case
// not a functional component) since we don't want it to be re-rendered if there
// is a change in the state of the parent (InfoPanelVC)
export default React.memo(Panel);
