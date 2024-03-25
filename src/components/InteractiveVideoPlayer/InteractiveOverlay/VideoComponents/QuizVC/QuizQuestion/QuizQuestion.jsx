import { PropTypes } from "prop-types";
import React from "react";
import "./QuizQuestion.scss";

/**
 * Component that renders the quiz question.
 */
export default function QuizQuestion({ question }) {
  return <h2 className="quiz-question-header" dangerouslySetInnerHTML={{ __html: question }} />;
}

QuizQuestion.propTypes = {
  question: PropTypes.string.isRequired,
};
