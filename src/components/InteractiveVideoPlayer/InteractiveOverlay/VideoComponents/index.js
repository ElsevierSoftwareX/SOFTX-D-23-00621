import React from "react";
import { Logger } from "../../helpers";
import ClickableRegionsVC from "./ClickableRegionsVC";
import InfoPanelVC from "./InfoPanelVC";
import JumpVC from "./JumpVC";
import QuizVC from "./QuizVC";

/**
 * Class used to instantiate video components.
 * It has to be edited every time you want to add a new video component, by
 * modifying:
 * 1) the static _factoryMethods array.
 * 2) create a new function that will be binded in the above array.
 */
export default class VideoComponentFactory {
  // Add here new creation methods for existing video components
  static _factoryMethods = {
    [ClickableRegionsVC.nature]: VideoComponentFactory._createClickableRegionsVC.bind(),
    [InfoPanelVC.nature]: VideoComponentFactory._createInfoPanelVC.bind(),
    [JumpVC.nature]: VideoComponentFactory._createJumpVC.bind(),
    [QuizVC.nature]: VideoComponentFactory._createQuizVC.bind(),
  };

  static create(nature, argsObj) {
    if (!VideoComponentFactory.natureIsValid(nature)) {
      Logger.warn(`Trying to create an element with undefined nature: "${nature}"`);
      return null;
    }

    return VideoComponentFactory._factoryMethods[nature](argsObj);
  }

  static natureIsValid(nature) {
    return VideoComponentFactory._factoryMethods.hasOwnProperty(nature);
  }

  // Factory methods impl ======================================================
  static _createClickableRegionsVC({ key, regions, actions }) {
    return React.createElement(ClickableRegionsVC, {
      key,
      regions,
      actions,
      ref: React.createRef(),
    });
  }

  static _createInfoPanelVC({ key, content, side, transitionDuration, pause, iconShow, iconHide, styles, actions }) {
    return React.createElement(InfoPanelVC, {
      key,
      content,
      side,
      transitionDuration,
      pause,
      iconShow,
      iconHide,
      styles,
      actions,
      ref: React.createRef(),
    });
  }

  static _createJumpVC({ key, to, repeat, actions }) {
    return React.createElement(JumpVC, {
      key,
      to,
      repeat,
      actions,
      ref: React.createRef(),
    });
  }

  static _createQuizVC({ key, question, choices, actions }) {
    return React.createElement(QuizVC, {
      key,
      question,
      choices,
      actions,
      ref: React.createRef(),
    });
  }
}
