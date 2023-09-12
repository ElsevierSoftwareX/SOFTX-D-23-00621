/* eslint-disable no-console */

export function isTimeInRange(millis, start, threshold = 300) {
  return millis >= start && millis <= start + threshold;
}

export function isDevelopment() {
  return !process.env.NODE_ENV || process.env.NODE_ENV === "development";
}
export class Logger {
  static log(msg) {
    if (!isDevelopment()) {
      return;
    }

    console.log(msg);
  }

  static info(msg) {
    if (!isDevelopment()) {
      return;
    }

    console.info(`%c ${msg}`, "color: #00f");
  }

  static warn(msg) {
    if (!isDevelopment()) {
      return;
    }

    console.warn(msg);
  }

  static error(msg) {
    console.error(msg);
  }
}
