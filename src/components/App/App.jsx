import CssBaseline from "@mui/material/CssBaseline";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { matchPath, useLocation, useNavigate, useParams } from "react-router-dom";
import InteractiveVideoPlayer from "../InteractiveVideoPlayer";
import "./App.scss";

/**
 * Main component of the application.
 */
class App extends Component {
  static propTypes = {
    params: PropTypes.shape({
      videoId: PropTypes.string,
    }).isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      fadeBackgroundClass: "",
    };
  }

  static handleSubmitId = (event) => {
    if (event.key === "Enter") {
      window.location.href = event.target.value;
    }
  };

  fadeBackground = (shouldFadeBackground) => {
    this.setState({
      fadeBackgroundClass: shouldFadeBackground ? "fade-bg" : "",
    });
  };

  render() {
    const {
      params: { videoId },
      location: { pathname },
    } = this.props;

    const { fadeBackgroundClass } = this.state;
    const baseUrl = "TODO: REPLACE WITH $AWS_IVA_CONTENT_URL";
    let videoUrl = `${baseUrl}/${videoId}/video.mp4`;
    let videoSequenceDefinitionUrl = `${baseUrl}/${videoId}/isd.yml`;

    // Video ID has a .local extension? Then load it from the videos/ directory
    const videoIdParts = videoId.split(".");
    if (videoIdParts.pop() === "local") {
      videoUrl = `/videos/${videoIdParts[0]}/video.mp4`;
      videoSequenceDefinitionUrl = `/videos/${videoIdParts[0]}/isd.yml`;
    }

    // Check for the /v/ path in URL; if present, apply styles to set the
    // video to fullscreen. Useful when embedding in another site.
    const isFullScreenVideo = !!matchPath("/embed/:videoId", pathname);

    // The interactive video player raw element that will be rendered
    const ivpElement = (
      <InteractiveVideoPlayer
        isFullScreenVideo={isFullScreenVideo}
        videoId={videoId}
        videoUrl={videoUrl}
        videoSequenceDefinitionUrl={videoSequenceDefinitionUrl}
        onFadeBackground={this.fadeBackground}
      />
    );

    return isFullScreenVideo ? (
      ivpElement
    ) : (
      <>
        <CssBaseline />
        <div className={`App ${fadeBackgroundClass}`}>{ivpElement}</div>
      </>
    );
  }
}

// eslint-disable-next-line react/function-component-definition
const withRouter = (WrappedComponent) => (props) => {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <WrappedComponent params={params} navigate={navigate} location={location} {...props} />;
};

export default withRouter(App);
