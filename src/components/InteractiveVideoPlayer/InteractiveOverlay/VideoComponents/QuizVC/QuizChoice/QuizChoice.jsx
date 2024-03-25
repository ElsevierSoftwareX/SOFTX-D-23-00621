import { PropTypes } from "prop-types";
import React from "react";
import "./QuizChoice.scss";

/**
 * Component that renders a quiz choice.
 */
export default function QuizChoice({ onSelect, actions, answer }) {
  const handleOnClick = () => {
    actions.setPlayerTime(onSelect);

    // TODO: Handle also "link" natures
  };

  return (
    <button type="button" className="quiz-choice-button" onClick={handleOnClick}>
      <h3 dangerouslySetInnerHTML={{ __html: answer }} />
    </button>
  );
}

QuizChoice.propTypes = {
  actions: PropTypes.shape({
    setPlayerTime: PropTypes.func.isRequired,
  }).isRequired,
  onSelect: PropTypes.number.isRequired,
  answer: PropTypes.string.isRequired,
};
