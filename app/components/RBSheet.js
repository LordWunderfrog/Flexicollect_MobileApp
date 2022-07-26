/**
 * unused component  - Only for the referance
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { View, Modal, TouchableOpacity, Animated, PanResponder, StyleSheet } from "react-native";

const SUPPORTED_ORIENTATIONS = [
  "portrait",
  "portrait-upside-down",
  "landscape",
  "landscape-left",
  "landscape-right"
];

/** unused component  */

class RBSheet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      animatedHeight: new Animated.Value(0),
      pan: new Animated.ValueXY()
    };

    this.createPanResponder(props);
  }

  setModalVisible(visible) {
    const { height, minClosingHeight, duration, onClose } = this.props;
    const { animatedHeight, pan } = this.state;
    if (visible) {
      this.setState({ modalVisible: visible });
      Animated.timing(animatedHeight, {
        toValue: height,
        duration,
        useNativeDriver: false
      }).start();
    } else {
      Animated.timing(animatedHeight, {
        toValue: minClosingHeight,
        duration,
        useNativeDriver: false
      }).start(() => {
        pan.setValue({ x: 0, y: 0 });
        this.setState({
          modalVisible: visible,
          animatedHeight: new Animated.Value(0)
        });

        if (typeof onClose === "function") onClose();
      });
    }
  }

  /** Pan responder  */
  createPanResponder(props) {
    const { closeOnSwipeDown, height } = props;
    const { pan } = this.state;
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => closeOnSwipeDown,
      onPanResponderMove: (e, gestureState) => {
        if (gestureState.dy > 0) {
          Animated.event([null, { dy: pan.y }])(e, gestureState);
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        if (height / 4 - gestureState.dy < 0) {
          this.setModalVisible(false);
        } else {
          Animated.spring(pan, { toValue: { x: 0, y: 0 } }).start();
        }
      }
    });
  }

  /** open RB sheet method */
  open() {
    this.setModalVisible(true);
  }

  /** close RB sheet method */
  close() {
    this.setModalVisible(false);
  }

  /** component rendering */
  render() {
    const { closeOnPressMask, children, customStyles } = this.props;
    const { animatedHeight, pan, modalVisible } = this.state;
    const panStyle = {
      transform: pan.getTranslateTransform()
    };

    return (
      <Modal
        transparent
        animationType="none"
        visible={modalVisible}
        supportedOrientations={SUPPORTED_ORIENTATIONS}
        onRequestClose={() => {
          this.setModalVisible(false);
        }}
      >
        <View style={[styles.wrapper, customStyles.wrapper]}>
          <TouchableOpacity
            style={styles.mask}
            activeOpacity={1}
            onPress={() => (closeOnPressMask ? this.close() : {})}
          />
          <Animated.View
            {...this.panResponder.panHandlers}
            style={[panStyle, styles.container, customStyles.container, { height: animatedHeight }]}
          >
            {children}
          </Animated.View>
        </View>
      </Modal>
    );
  }
}

RBSheet.propTypes = {
  height: PropTypes.number,
  minClosingHeight: PropTypes.number,
  duration: PropTypes.number,
  closeOnSwipeDown: PropTypes.bool,
  closeOnPressMask: PropTypes.bool,
  customStyles: PropTypes.objectOf(PropTypes.object),
  onClose: PropTypes.func,
  children: PropTypes.node
};

RBSheet.defaultProps = {
  height: 260,
  minClosingHeight: 0,
  duration: 300,
  closeOnSwipeDown: false,
  closeOnPressMask: true,
  customStyles: {},
  onClose: null,
  children: <View />
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#00000077"
  },
  mask: {
    flex: 1,
    backgroundColor: "transparent"
  },
  container: {
    backgroundColor: "#fff",
    width: "100%",
    height: 0,
    overflow: "hidden"
  }
});

export default RBSheet;
