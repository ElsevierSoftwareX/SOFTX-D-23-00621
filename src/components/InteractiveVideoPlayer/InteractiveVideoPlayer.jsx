import yaml from "js-yaml";
import PropTypes from "prop-types";
import PubSub from "pubsub-js";
import React, { StrictMode } from "react";
import ReactGA from "react-ga";
import videojs from "video.js";
import c from "./constants";
import { Logger } from "./helpers";
import InteractiveOverlay from "./InteractiveOverlay";
import "./InteractiveVideoPlayer.scss";
import PlayOverlay from "./PlayOverlay";

export default class InteractiveVideoPlayer extends React.Component {
  static propTypes = {
    isFullScreenVideo: PropTypes.bool.isRequired,
    videoId: PropTypes.string.isRequired,
    videoUrl: PropTypes.string.isRequired,
    videoSequenceDefinitionUrl: PropTypes.string.isRequired,
    onFadeBackground: PropTypes.func.isRequired,
  };

  // Subscriber methods for PubSub
  static registerMetricsPageViewSubscriber = (_topic, path) => {
    Logger.info(`[PubSub] Registered GA page view: ${path}`);
    ReactGA.pageview(path);
  };

  static registerMetricsEventSubscriber = (_topic, data) => {
    Logger.info(`[PubSub] Registered GA event: ${JSON.stringify(data)}`);
    ReactGA.event(data);
  };

  static registerMetricsTimingSubscriber = (_topic, data) => {
    Logger.info(`[PubSub] Registered GA timing: ${JSON.stringify(data)}`);
    ReactGA.timing(data);
  };

  constructor(props) {
    super(props);

    // Initialize Google Analytics
    ReactGA.initialize("UA-78440552-7", {
      debug: false,
      titleCase: false,
      gaOptions: {
        siteSpeedSampleRate: 100,
      },
    });

    // Create a ref (ID) for the HTML video element
    this.videoElement = React.createRef();

    // Changes to this state will provoke a React render event
    this.state = {
      loaded: false,
      playing: false,
      manualPause: true,
      focusClass: "",
      videoSequenceDefinition: null,
    };
  }

  // Instantiate Video.js after component creation
  componentDidMount() {
    // Register a listener to force unload the component on page exit
    window.addEventListener("beforeunload", this.componentCleanup);

    const { videoId, videoUrl, videoSequenceDefinitionUrl } = this.props;
    const videoJsOptions = {
      autoplay: false,
      controls: false,
      fill: true,
      preload: "auto",
      sources: [
        {
          src: videoUrl,
          type: "video/mp4",
        },
      ],
    };

    // Subscribe functions to events
    PubSub.subscribe(c.PUBSUB_TOPIC_GA_PAGE_VIEW, this.registerMetricsPageViewSubscriber);
    PubSub.subscribe(c.PUBSUB_TOPIC_GA_EVENT, this.registerMetricsEventSubscriber);
    PubSub.subscribe(c.PUBSUB_TOPIC_GA_TIMING, this.registerMetricsTimingSubscriber);

    // Load video sequence definition file from AWS S3 into the component state
    const startLoadingISDTime = Date.now();
    fetch(videoSequenceDefinitionUrl)
      .then((response) => response.text())
      .then((text) => yaml.load(text))
      .then((yamlData) => {
        // Register the ISD loading time on GA
        const millis = Date.now() - startLoadingISDTime;
        PubSub.publish(c.PUBSUB_TOPIC_GA_TIMING, {
          category: c.GA_TIMING_CATEGORY_LOADING_TIME,
          variable: c.GA_TIMING_VARIABLE_ISD_LOAD,
          value: millis,
        });

        // Update the state with the parsed ISD
        this.setState({
          videoSequenceDefinition: {
            url: videoSequenceDefinitionUrl,
            ...yamlData,
          },
        });
      })
      .catch((error) => Logger.error(`Failed because: ${error}`));

    this.player = videojs(this.videoElement.current, { ...videoJsOptions });
    const startLoadingVideoTime = Date.now();
    this.player.one("loadedmetadata", () => {
      // Register the video loading time on GA
      const millis = Date.now() - startLoadingVideoTime;
      PubSub.publish(c.PUBSUB_TOPIC_GA_TIMING, {
        category: c.GA_TIMING_CATEGORY_LOADING_TIME,
        variable: c.GA_TIMING_VARIABLE_VIDEO_LOAD,
        value: millis,
      });
    });

    this.registerPlayerEvent("ended", () => {
      PubSub.publish(c.PUBSUB_TOPIC_GA_EVENT, {
        category: c.GA_EVENT_CATEGORY_VIDEO,
        action: c.GA_EVENT_ACTION_VIDEO_ENDED,
        label: videoId,
      });
    });

    // Register an event when IVA loads a video
    PubSub.publish(c.PUBSUB_TOPIC_GA_EVENT, {
      category: c.GA_EVENT_CATEGORY_VIDEO,
      action: c.GA_EVENT_ACTION_VIDEO_LOAD,
      label: videoId,
      nonInteraction: true,
    });

    // Register an event when page view
    PubSub.publish(c.PUBSUB_TOPIC_GA_PAGE_VIEW, videoId);

    // Actions available for the interactive video components
    this.actions = {
      getPlayerSize: this.getPlayerSize,
      getPlayerTime: this.getPlayerTime,
      setPlayerTime: this.setPlayerTime,
      pausePlayer: this.pausePlayer,
      playPlayer: this.playPlayer,
      getVideoId: this.getVideoId,
    };
  }

  // Destroy player on unmount
  componentWillUnmount() {
    this.componentCleanup();
    window.removeEventListener("beforeunload", this.componentCleanup);
  }

  // Custom method to be called for a clean exit
  componentCleanup = () => {
    const { videoId } = this.props;

    // Send an event about the video playing time (in seconds)
    PubSub.publishSync(c.PUBSUB_TOPIC_GA_EVENT, {
      category: c.GA_EVENT_CATEGORY_VIDEO,
      action: c.GA_EVENT_ACTION_VIDEO_PLAYED_SECONDS,
      label: videoId,
      value: Math.trunc(this.player.currentTime()),
    });

    // Free resources from the videojs player
    this.unregisterPlayerEvent("ended");
    if (this.player) {
      this.player.dispose();
    }

    // Release all subscribers
    PubSub.clearAllSubscriptions();

    // ;)
    Logger.info("💩 Successfully unmounted! Bye! 💩");
  };

  // Player exposed methods
  getPlayerSize = () => ({
    w: this.player.videoWidth(),
    h: this.player.videoHeight(),
  });

  getPlayerTime = () => Math.trunc(this.player.currentTime() * 1000);

  setPlayerTime = (millis) => {
    this.player.currentTime(millis / 1000);
  };

  pausePlayer = () => {
    this.player.pause();
  };

  playPlayer = () => {
    this.player.play();
  };

  getVideoId = () => {
    const { videoId } = this.props;
    return videoId;
  };

  registerPlayerEvent = (event, cb) => {
    this.player.on(event, cb);
  };

  unregisterPlayerEvent = (event) => {
    this.player.off(event);
  };

  // Play / Pause button click
  handlePlayButtonClick = () => {
    const { isFullScreenVideo, onFadeBackground } = this.props;
    const { manualPause } = this.state;

    let shouldFadeBackground = false;
    let paused = this.player.paused();
    if (paused) {
      if (manualPause) {
        // Register an event for playing the video
        PubSub.publish(c.PUBSUB_TOPIC_GA_EVENT, {
          category: c.GA_EVENT_CATEGORY_VIDEO,
          action: c.GA_EVENT_ACTION_VIDEO_PLAY,
          label: this.videoId,
        });

        this.player.play();
        shouldFadeBackground = true;
      } else {
        // In case the video was paused programatically, ignore the click on
        // this button
        return;
      }
    } else {
      // Register an event for pausing the video
      PubSub.publish(c.PUBSUB_TOPIC_GA_EVENT, {
        category: c.GA_EVENT_CATEGORY_VIDEO,
        action: c.GA_EVENT_ACTION_VIDEO_PAUSE,
        label: this.videoId,
      });

      this.player.pause();
    }

    if (!isFullScreenVideo) {
      onFadeBackground(shouldFadeBackground);
    }

    paused = this.player.paused();
    this.setState({
      loaded: true,
      playing: !paused,
      manualPause: paused,
      focusClass: !paused ? "video-focus" : "",
    });
  };

  render() {
    const { isFullScreenVideo } = this.props;
    const { loaded } = this.state;

    const { focusClass, playing, videoSequenceDefinition } = this.state;
    const fullScreenClassesPrefix = isFullScreenVideo ? "-fs" : "";

    return (
      <StrictMode>
        <div data-vjs-player>
          <div
            className={`player-wrapper${fullScreenClassesPrefix} ${
              focusClass ? focusClass + fullScreenClassesPrefix : ""
            }`}
          >
            <video ref={this.videoElement} className={`video-js${fullScreenClassesPrefix}`}>
              <track kind="captions" default />
            </video>
            {loaded && (
              <InteractiveOverlay
                className={!playing && "hide"}
                actions={this.actions}
                registerPlayerEvent={this.registerPlayerEvent}
                unregisterPlayerEvent={this.unregisterPlayerEvent}
                videoSequenceDefinition={videoSequenceDefinition}
              />
            )}
            <PlayOverlay onClick={this.handlePlayButtonClick} isPlaying={playing} />
          </div>
        </div>
      </StrictMode>
    );
  }
}
