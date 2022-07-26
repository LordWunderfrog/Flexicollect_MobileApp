import React, { Component } from 'react';
//import Orientation from "react-native-orientation";
import Orientation from "react-native-orientation-locker";
import VideoPlayer from "react-native-video-controls";
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  View
} from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';

/** Video Preview class component */
class PreviewVideo extends Component {
  constructor(props) {
    super(props)
    //const { params } = this.props.navigation.state;
    const { params } = this.props.route;
    VideoUri = params ? params.VideoUri : '';
    this.state = {
      Video: VideoUri,
    }
  }

  /** Component life cycle methods */
  componentDidMount() {
    Orientation.unlockAllOrientations();
  }
  componentWillUnmount() {
    Orientation.lockToPortrait();
  }

  /* reset video player playing time when video reach to end */
  onEnd = () => {
    this.player.setSeektime(0)
    this.setState({ paused: true })
  }

  /** component rendering */
  render() {
    return (
      <SafeAreaView style={styles.container}>
        <VideoPlayer
          ref={ref => {
            this.player = ref;
          }}
          style={styles.fullscreen}
          source={{ uri: this.state.Video }}
          disableVolume={true}
          disableFullscreen={true}
          onBack={() => this.props.navigation.navigate("SurveyBox")}
          onEnd={() => this.onEnd()}
        />
      </SafeAreaView >
    );
  }
}

export default PreviewVideo;

/** UI styles used for this component */
const styles = ScaledSheet.create({
  container: {
    height: '100%',
    width: '100%',
    backgroundColor: 'black'
    // paddingTop: '10%',
    // paddingBottom: '10%',
    // paddingRight: '5%',
    // paddingLeft: '5%'
  },
  fullscreen: {
    //position: "absolute",
    flex: 1,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  },
});