import PropTypes from "prop-types";
import React from "react";
import { Logger } from "../../../helpers";
import QuizChoice from "./QuizChoice";
import QuizQuestion from "./QuizQuestion";
import "./QuizVC.scss";

/**
 * Component that renders a quiz question and its choices.
 */
export default class QuizVC extends React.Component {
  // Force this component to has that nature
  static nature = "quiz-vc";

  // Ensure received props belong to these types
  static propTypes = {
    question: PropTypes.string.isRequired,
    choices: PropTypes.arrayOf(
      PropTypes.shape({
        answer: PropTypes.node.isRequired,
        correct: PropTypes.bool.isRequired,
        onSelect: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      }).isRequired
    ).isRequired,
    actions: PropTypes.shape({
      setPlayerTime: PropTypes.func.isRequired,
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
    Logger.info(`+ QuizVC executed: ${key}`);

    this.setState({ display: true });
  }

  // If this interactive video component were to render something, do it here
  render() {
    const { actions, question, choices } = this.props;
    const { display } = this.state;

    const choiceRenderer = (choice, i) => (
      <li key={i}>
        <QuizChoice answer={choice.answer} correct={choice.correct} onSelect={choice.onSelect} actions={actions} />
      </li>
    );

    return (
      display && (
        <div className="question-wrapper">
          <QuizQuestion question={question} />
          <ul className="choices-wrapper">{choices.map(choiceRenderer)}</ul>
        </div>
      )
    );
  }
}
