import React, { Component } from "react";
import {
  Image,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import * as Color from "../../style/Colors";
import * as String from "../../style/Strings";
import * as Dimen from "../../style/Dimensions";
import ViewShot from "react-native-view-shot";
import * as Constants from '../../utils/Constants';
//import { NavigationActions, StackActions } from "react-navigation";
//import Orientation from 'react-native-orientation';
import Orientation from "react-native-orientation-locker";
import AsyncStorage from '@react-native-async-storage/async-storage';

let imagePath = "";
let previewUri = "";
let markerId = 0;
let maker;
let xValue = 0;
let yValue = 0;
let markerWidth = 0;
let markerHeight = 0;
let imageProperty;
let markerStyle = "";

const arrow = require("../../images/marker/arrow.png");
const circle = require("../../images/marker/circle.png");
const location = require("../../images/marker/location.png");
const { width, height } = Dimensions.get("window");
const screenWidth = width;
const screenHeight = height;

/** Textbox class compoenent */
class TextBoxScreen extends Component {
  constructor(props) {
    super(props);
    // const { params } = this.props.navigation.state;
    const { params } = this.props.route;
    imagePath = params ? params.imageData : "";
    previewUri = params ? params.previewUri : "";
    markerStyle = params ? params.markerStyle : "";
    markerId = params ? params.markerId : 0;
    maker = params ? params.marker : 4;
    xValue = params ? params.locationX : 0;
    yValue = params ? params.locationY : 0;
    imageProperty = params ? params.imageProperty : "";

    //  this.markerImage(maker);
    this.state = {
      image: imagePath,
      textField: "",
      markerImage: maker,
      markerStyle: markerStyle,
      showText: false,
      locationX: xValue,
      locationY: yValue,
      hideIcon: false,
      hoverRight: 20,
      isKeyboardOpen: false,
      textfieldWidth: "100%",
      bottomViewHeight: 200,
      isDoubleClick: false,
      translation_common: Constants.common_text
    };
  }

  /** compoenent lifecycle methods */
  UNSAFE_componentWillMount() {
    StatusBar.setHidden(true);
  }

  componentDidMount() {
    Orientation.lockToPortrait();
    this.keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      this._keyboardDidShow
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      this._keyboardDidHide
    );
  }
  componentWillUnmount() {
    Orientation.lockToPortrait();

    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  /** Keyboard events */
  _keyboardDidShow = () => {
    this.setState({ isKeyboardOpen: true });
  };

  _keyboardDidHide = () => {
    this.setState({ isKeyboardOpen: false });
  };

  /** set textbox filed */
  setField(textField) {
    let xPosition = this.state.locationX;
    let yPosition = this.state.locationY;
    let textLength = textField.length;
    let textfieldWidth = screenWidth - xValue - 10;
    // let numberOfLines=this.getNumberOfLines(textField,Dimen.mediumText,10,100)
    if (textLength > 1) {
      this.setState({ showText: true, textField, textfieldWidth });
    } else if (textLength > 20) {
      this.setState({
        locationX: 20,
        hoverRight: 20,
        markerStyle: "",
        textField,
        textfieldWidth
      });
    } else {
      if (xValue < 100) {
        xValue = 100;
      }
      if (yValue < 100) {
        yValue = 150;
      }
      if (xValue > screenWidth - 100) {
        xValue = screenWidth - 50;
      }
      if (yValue > screenHeight - 100) {
        yValue = screenHeight - 100;
      }

      this.setState({
        showText: false,
        locationX: xValue - 50,
        locationY: yValue - 40,
        textField,
        textfieldWidth
      });
    }
    // this.setState({textField: textField})

    if (
      textLength === 30 ||
      textLength === 80 ||
      textLength === 120 ||
      textLength === 140 ||
      textLength === 160
    ) {
      this.setState({ locationY: this.state.locationY - 5 });
    }
  }

  /** function for the getting the number of line
   * @param text - pass text for getting line 
   * @param fontSize - pass the font size 
   * @param containerWidth - pass container detail
   */
  getNumberOfLines(text, fontSize, fontConstant, containerWidth) {
    let cpl = Math.floor(containerWidth / (fontSize / fontConstant));
    const words = text.split(" ");
    const elements = [];
    let line = "";

    while (words.length > 0) {
      if (
        line.length + words[0].length + 1 <= cpl ||
        (line.length === 0 && words[0].length + 1 >= cpl)
      ) {
        let word = words.splice(0, 1);
        if (line.length === 0) {
          line = word;
        } else {
          line = line + " " + word;
        }
        if (words.length === 0) {
          elements.push(line);
        }
      } else {
        elements.push(line);
        line = "";
      }
    }
    return elements.length;
  }

  markerImage(value) {
    if (value === 1) {
      yValue = yValue - 50;
      xValue = xValue - 20;
    } else if (value === 2) {
      yValue = yValue - 50;
      xValue = xValue - 40;
    } else {
      yValue = yValue - 42;
      xValue = xValue - 30;
    }
    //this.state.locationY-55, left: this.state.locationX-15
  }

  /** capture screen shot of screen*/
  async _captureScreen() {
    // Keyboard.dismiss();
    let missionId = await AsyncStorage.getItem("missionId");
    let pageIndex = await AsyncStorage.getItem("pageIndex");
    // this.setState({ hideIcon: true });
    if (!this.state.isDoubleClick) {
      this.setState({ isDoubleClick: true })
      setTimeout(() => {
        this.refs.viewShot.capture().then(uri => {
          if (
            imageProperty.hasOwnProperty("scale_enabled") &&
            imageProperty.scale_enabled === 1
          ) {
            this.setState({ isDoubleClick: false })
            this.props.navigation.navigate("ScaledImage", {
              imageData: uri,
              previewUri: previewUri,
              markerId: markerId,
              captionText: this.state.textField,
              imageProperty: imageProperty
            });
          } else {
            global.previewUri = previewUri.uri;
            global.imageData = uri;
            global.markerId = markerId;
            global.scaleId = 0;
            global.captionText = this.state.textField;
            global.type = "capture";

            // const backAction = NavigationActions.back({
            //   key: global.screenKey
            // });
            // this.props.navigation.dispatch(backAction);
            this.props.navigation.navigate({ name: 'SurveyBox' })

            setTimeout(() => {
              this.setState({ isDoubleClick: false })
            }, 5000);
            // const resetAction = StackActions.reset({
            //     index: 0,
            //     actions: [NavigationActions.navigate({
            //         routeName: 'SurveyBox', params: {
            //             imageData: uri,
            //             previewUri: previewUri.uri,
            //             markerId: markerId,
            //             scaleId: 0,
            //             captionText: this.state.textField,
            //             missionId: missionId,
            //             pageIndex: pageIndex,
            //             from: 'scale'
            //         }
            //     })],
            // });
            // this.props.navigation.dispatch(resetAction);
          }
          //this.setState({ hideIcon: false });
        });
      }, 300);
    }
  }
  bottomViewLayout = (e) => {
    const { height } = e.nativeEvent.layout
    this.setState({ bottomViewHeight: height })
  }
  /** compoenent render method */
  render() {
    const {
      markerStyle,
      locationY,
      locationX,
      isKeyboardOpen,
      textfieldWidth
    } = this.state;
    const { goBack } = this.props.navigation;
    const {
      innerView,
      back,
      tick,
      bottomContainer,
      inputView,
      InputText,
      text,
      overlayView,
      textBoxView,
      bottomCon,
      hoverText,
      keyOnView,
      keyOffView
    } = styles;
    let dynamicMarkerStyle = Object.assign({}, markerStyle);
    if (Object.keys(dynamicMarkerStyle).length > 0) {
      dynamicMarkerStyle = {};
      // dynamicMarkerStyle.marginLeft = 200;
    }
    return (
      <KeyboardAvoidingView
        style={innerView}
        behavior={Platform.OS === "ios" ? "padding" : ""}
        enabled
      >
        <View
          style={isKeyboardOpen === true && Platform.OS === "android" ? keyOnView : keyOffView
          }
        >
          <ViewShot style={[innerView, { marginBottom: this.state.bottomViewHeight }]} ref="viewShot" options={{ format: "jpg", quality: 0.9 }}>

            <Image style={{ flex: 1, overflow: "visible" }} source={{ uri: this.state.image }} />

            {this.state.showText && (
              <View
                style={[
                  {
                    position: "absolute",
                    bottom: 10,
                    justifyContent: 'center',
                    alignSelf: 'center',
                    maxWidth: '90%'
                  }
                ]}
              >
                <View style={overlayView}>
                  <Text
                    style={[
                      hoverText,
                      {
                        fontSize: 16,
                        paddingLeft: 5,
                        paddingRight: 5,
                        textAlign: 'center'
                      }
                    ]}
                  >
                    {this.state.textField}
                  </Text>
                </View>
              </View>
            )}
          </ViewShot>

          <View style={bottomContainer} onLayout={(event) => { this.bottomViewLayout(event) }}>
            <Text numberOfLines={10} style={[text]}>
              {imageProperty.instruction_text !== ""
                ? imageProperty.instruction_text
                : ""}
            </Text>
            <TouchableWithoutFeedback
              onPress={() => {
                this.textBox.focus();
              }}
            >
              <View style={inputView}>
                <TextInput
                  ref={input => {
                    this.textBox = input;
                  }}
                  style={InputText}
                  value={this.state.textField}
                  multiline={true}
                  underlineColorAndroid={Color.colorWhite}
                  returnKeyLabel="Done"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  placeholder={this.state.translation_common[global.language].Enter_Text}
                  placeholderColor={Color.colorLitGrey}
                  placeholderTextColor={Color.colorLitGrey}
                  selectionColor={"black"}
                  keyboardType={"default"}
                  onChangeText={textField => this.setField(textField)}
                />
              </View>
            </TouchableWithoutFeedback>

            <View style={styles.tickMarkContainer}>
              {!this.state.hideIcon && (
                <TouchableOpacity
                  hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                  style={back} onPress={() => goBack()}>
                  <Image
                    style={{ width: 30, height: 30 }}
                    source={require("../../images/survey/camera_back.png")}
                  />
                </TouchableOpacity>
              )}

              {!this.state.hideIcon && (
                <TouchableOpacity
                  hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                  style={tick}
                  onPress={() => {
                    Keyboard.dismiss();
                    setTimeout(() => {
                      this._captureScreen();
                    }, 1000);
                  }}
                >
                  <Image
                    style={{ width: 30, height: 30 }}
                    source={require("../../images/survey/tick.png")}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView >
    );
  }
}

export default TextBoxScreen;

/** UI styles used for this component */
const styles = ScaledSheet.create({
  innerView: {
    flex: 1,
    flexDirection: "column",
    overflow: "visible"
  },
  keyOnView: {
    flex: 0.9
  },
  keyOffView: {
    flex: 1
  },
  tickMarkContainer: {
    marginHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  tick: {
    margin: 10,
    alignSelf: "center",
  },
  back: {
    margin: 10,
    alignSelf: "center",
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    width: "100%",
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: Color.colorImageCaptureBg
  },
  text: {
    color: Color.colorWhite,
    fontSize: Dimen.normalText,
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 10,
    paddingHorizontal: 10,
    opacity: 1
  },
  hoverText: {
    width: "100%",
    color: Color.colorWhite,
    fontSize: Dimen.mediumText,
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 10,
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
    opacity: 1,
    flex: 1,
    flexWrap: "wrap"
  },
  inputView: {
    backgroundColor: Color.colorWhite,
    alignSelf: "stretch",
    justifyContent: "flex-start",
    height: 100,
    borderRadius: Dimen.radius,
    borderColor: Color.colorWhite,
    borderWidth: 1,
    marginLeft: "30@s",
    marginRight: "30@s",
    marginBottom: 5
  },
  //textInput fields
  InputText: {
    fontSize: Dimen.normalText,
    textAlign: "left",
    fontWeight: "normal",
    width: "100%",
    margin: 0,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 10,
    paddingRight: 10,
    color: Color.colorBlack,
    backgroundColor: Color.colorWhite,
  },
  overlayView: {
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: Dimen.radius,
    alignItems: 'center',
    justifyContent: 'center'
  },
  textBoxView: {
    position: "absolute"
  },
  circle: {
    width: 60,
    height: 80
  },
  location: {
    width: 35,
    height: 50
  },
  arrow: {
    width: 60,
    height: 60
  },
  bottomCon: {
    width: "100%",
    position: "absolute",
    backgroundColor: Color.colorImageCaptureBg,
    flex: 1,
    bottom: 0,
    flexDirection: "row",
    alignSelf: "stretch",
    height: 200,
    left: 0
  }
});
