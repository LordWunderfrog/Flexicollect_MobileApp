//https://stackoverflow.com/questions/54626359/react-native-fs-ios-not-showing-files-in-the-document-directory
import React, { Component } from "react";
import {
  View,
  Text,
  Platform,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  // ScrollView,
  Dimensions,
  StatusBar,
  Keyboard,
  SectionList,
  FlatList,
  ImageBackground,
  TouchableWithoutFeedback,
  PermissionsAndroid,
  KeyboardAvoidingView,
  Alert,
  AppState,
  Button,
  Linking,
  VirtualizedList
} from "react-native";
import { PERMISSIONS, check, request, RESULTS, openSettings } from 'react-native-permissions';
import GeolocationIOS from "@react-native-community/geolocation";
import Geolocation from 'react-native-geolocation-service'
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { WebView } from "react-native-webview";
//import GPSState from "react-native-gps-state";
import { ScaledSheet } from "react-native-size-matters";
import * as Color from "../../style/Colors";
import * as Dimension from "../../style/Dimensions";
import * as Constants from "../../utils/Constants";
import * as Service from "../../utils/Api";
import * as String from "../../style/Strings";
import * as Dimen from "../../style/Dimensions";
import * as CAMERASTYLE from "../../style/Camera";
import Slider from '@react-native-community/slider';
import { ScrollView } from "react-native-gesture-handler";
// import {
//   NavigationActions,
//   SafeAreaView,
//   StackActions
// } from "react-navigation";
import { CommonActions } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HeaderView from "../HeaderView";
import CarouselPager from "../../components/CarouselPager";
import ScalableImage from "../../components/ScalableImage";
import { AndroidBackHandler } from "react-navigation-backhandler";
import axios from "axios";
import RNFS from "react-native-fs";
import { Table, TableWrapper, Row, Cell } from "react-native-table-component";
import VideoPlayer from "react-native-video-controls";
import Sound from "react-native-sound";
import MapView, { Marker } from "react-native-maps";
import ImagePicker from "react-native-customized-image-picker";
import DocumentPicker from "react-native-document-picker";
import AudioRecorderPlayer from "react-native-audio-recorder-player";
import RNFetchBlob from "rn-fetch-blob";
import RBSheet from "react-native-raw-bottom-sheet";
// import AutoHeightWebView from 'react-native-autoheight-webview';
import DeviceInfo from "react-native-device-info";
//import RNCompress from "react-native-compress";
import { RNCamera } from "react-native-camera";
// Commen the below line for IOS build - The support for 4.2 Swift is not available yet.
import { ProcessingManager } from "react-native-video-processing";
//import Orientation from 'react-native-orientation';
import Orientation from "react-native-orientation-locker";
import cloneDeep from 'lodash/cloneDeep';
//import * as ImagePickerCrop from './ImagePicker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { RNFFmpeg } from 'react-native-ffmpeg';
// import HTMLView from "react-native-render-html";
import RenderHtml from 'react-native-render-html';
import DropDownPicker from '../../components/DropDownPicker'
import { measureConnectionSpeed } from '../../components/GetNetworkSpeed';
import Mailer from 'react-native-mail';

const videoCompressOptions = {
  //width: 720,
  //height: 1280,
  bitrateMultiplier: 5,
  minimumBitrate: 500000
};

const img_speaker = require("../../images/audioIcon/ui_speaker.png");
const img_pause = require("../../images/audioIcon//ui_pause.png");
const img_play = require("../../images/audioIcon/ui_play.png");
const img_playjumpleft = require("../../images/audioIcon/ui_playjumpleft.png");
const img_playjumpright = require("../../images/audioIcon/ui_playjumpright.png");

const { width, height } = Dimensions.get("window");
const calRatio = 16 * (width / height);
const screenWidth = width;
const screenHeight = height;
const ratio = (calRatio < 9 ? width / 9 : height / 18) / (360 / 9);

/** Status bar settings */
// const MyStatusBar = ({ backgroundColor, ...props }) => (
//   <View style={[styles.statusBar, { backgroundColor }]}>
//     <StatusBar translucent backgroundColor={backgroundColor} {...props} />
//   </View>
// );


let realContentHeight = [];

const uploadBegin = response => {
  const jobId = response.jobId;
  //console.log("UPLOAD HAS BEGUN! JobId: " + jobId);
};

const uploadProgress = response => {
  const percentage = Math.floor(
    (response.totalBytesSent / response.totalBytesExpectedToSend) * 100
  );
  //console.log("UPLOAD IS " + percentage + "% DONE!");
};

// let sound = null;
let status;
let missionId = 0;
let missionName = "";
let gpsHidden = 0;
let capturedImageUri;
let previewUri = "";
let markerId = 0;
let scaleId = 0;
let captionText = "";
let imageWidth = 50;
let imageHeight = 40;
let pageIndex = 0;
let cameraIcon = require("../../images/survey/photo_camera.png");
let captureImageIcon = require("../../images/survey/photo_capture.png");
let cameraIconCircle = require("../../images/survey/photo_circle.png");
let radioOuterCircle = require("../../images/profile/border_bg.png");
let radioInnerDot = require("../../images/profile/dot_circle.png");
// let imageIcon = require('../../images/profile/gallery.png');
let videoIcon = require("../../images/survey/video_camera.png");
let audioIcon = require("../../images/survey/audio-record-icon.png");
let barcodeIcon = require("../../images/survey/barcode_camera.png");
let capturedImageBase64 = "";
let mediaImageBase64 = "";
let isCaptureImageAdded = false;
let isBarcodeImageAdded = false;
let id = -1;
let mFrom = "";
let captureIndex = -1;
let captureUri = require("../../images/survey/photo_camera.png");

let barCodeId = "";
let productName = "";
let productDescription = "";
let halfOpacity = 0.2;
let lightDarkOpacity = 0.3;
let fullOpacity = 1;
let scannedImageBase64Data = "";
let apiKey = "";
// Question response queue process properties
let questionResponseQue = [];
let backBtnFired = false;

// Conditional matches process properties
let nextQuestionArrayPosition = 0;
let questionOffsets = [];
let latestTarget;
let stopSubmit = false;
let isSubmitted = false;
let presentPositions = { current: 0, next: 1 };
let region;
const locationIcon = require("../../images/survey/marker_icon.png");
const ASPECT_RATIO = width / height;
const LATITUDE = 0.0;
const LONGITUDE = 0.0;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const SPACE = 0.01;
let isGpsModified = false;
let totalQuestions = [];
let tmpList = [];
let LastAccess_nextPage = 0;
let LastAccess_prevPage = 0;
let LastAccess_pageCount = 0;
let isAlertVisible = false;
let isAlertPresent = false;

const record = require("../../images/survey/record.png");
const closeIcon = require("../../images/survey/closeIconWhite.png");
// const recording = require('../../images/survey/recording.png');
const stopRecording = require("../../images/survey/stop.png");
// const playAudio = require('../../images/survey/play.png');
// const pauseAudio = require('../../images/survey/pause.png');
let addressRetryAttempt = 0;
const MEDIA_TIMEOUT = 900;

let horizontalPages = [];
let netState = "offline";

let cardHeight = 0;
let cardYheight = 0;

const BODY_TAG_PATTERN = /\<\/ *body\>/;

// Do not add any comments to this! It will break because all line breaks will removed for
// some weird reason when this script is injected.
var script = `
;(function() {
var wrapper = document.createElement("div");
wrapper.id = "height-wrapper";
while (document.body.firstChild) {
    wrapper.appendChild(document.body.firstChild);
}
document.body.appendChild(wrapper);
var i = 0;
function updateHeight() {
    document.title = wrapper.clientHeight;
    window.location.hash = ++i;
}
updateHeight();
window.addEventListener("load", function() {
    updateHeight();
    setTimeout(updateHeight, 1000);
});
window.addEventListener("resize", updateHeight);
}());
`;


const style = `
<style>
body, html, #height-wrapper {
    margin: 0;
    padding: 0;
}
#height-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
}
</style>
<script>
${script}
</script>
`;

const codeInject = (html) => html.replace(BODY_TAG_PATTERN, style + "</body>");

/** Html render tag style */
const normalTagsStyles = {
  p: {
    color: "#D6D6D6",
    fontSize: Dimension.normalText,
    fontStyle: "italic",
    padding: 0,
    margin: 0
  }
}
const darkBluetagsStyles = {
  p: {
    color: Color.colorDarkBlue,
    fontSize: Dimension.normalText,
    padding: 0,
    margin: 0
  }
}
const extraLargetagsStyles = {
  p: {
    fontSize: Dimension.extraLargeText,
    color: Color.colorDarkBlue,
    fontWeight: "bold",
    padding: 0,
    margin: 0
  }
}

/** survey class */
class SurveyBox extends Component {
  constructor(props) {
    super(props);
    // const { params } = this.props.navigation.state;
    const { params } = this.props.route
    missionId = params ? params.missionId : 0;
    missionName = params ? params.missionName : "";
    pageIndex = params ? params.pageIndex : 0;
    captureIndex = parseInt(pageIndex); // to find the captured image index , which is used during answer post
    capturedImageUri = params ? params.imageData : "";
    previewUri = params ? params.previewUri : "";
    markerId = params ? params.markerId : 0;
    scaleId = params ? params.scaleId : 0;
    mFrom = params ? params.from : "";
    captionText = params ? params.captionText : "";
    barCodeId = params ? params.barCode : "";
    // Reset question response queue process properties
    questionResponseQue = [];
    backBtnFired = false;

    // Reset conditional matches process properties
    latestTarget = undefined;
    questionOffsets = [];
    totalQuestions = [];
    stopSubmit = false;
    isSubmitted = false;
    presentPositions = { current: 0, next: 1 };
    isGpsModified = false;
    addressRetryAttempt = 0;
    nextQuestionArrayPosition = 0;
    //console.log('capturedImageUri::', previewUri);

    this.state = {
      answer: "",
      pageCount: 0,
      leftArrow: pageIndex === 0 ? 0.3 : 1,
      rightArrow: 1,
      leftDisable: pageIndex === 0,
      rightDisable: false,
      questionsArr: [],
      questionBackupArr: [],
      tempQuesArray: [],
      arrLength: 0,
      isLoading: true,
      postAnswerLoader: false,
      minWidth: 100,
      missionId: missionId,
      imagePath: "",
      image64: "",
      refreshRender: true,
      multiLevelFalseSingleChoiceOuterArray: [],
      multiLevelFalseMultiChoiceOuterArray: [],
      multiLevelTrueSingleChoiceOuterArray: [],
      multiLevelTrueMultiChoiceOuterArray: [],
      dropDownArray: [],
      isScrollEnabled: true,
      // We don't know the size of the content initially, and the probably won't instantly try to scroll, so set the initial content height to 0
      screenHeight: 0,
      userAPIKey: "",
      // video attributes
      paused: true,
      playState: "paused", //playing, paused
      playSeconds: 0,
      duration: 0,
      audioLoader: false,
      mapRegion: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      },
      lastLat: 0.0,     //37.78825,
      lastLong: 0.0,    //-122.4324,
      isMapReady: false,
      locationAddress: null,
      addressLoader: false,
      appState: AppState.currentState,
      audioRecordingTime: "00:00:00",
      isAudioRecord: false,
      isRecordAudio: false,
      pickAudioGallery: true,
      bottomSheet: {
        type: null,
        index: null
      },
      scrollViewHeight: 0,
      scrollViewWidth: 0,
      isConditionalApplied: false,
      conditioalPositions: {
        currentPage: 0,
        nextPage: 0,
        currentQuestArrayPos: 0,
        nextQuestionArrayPos: 0
      },
      isComponentUpdating: true,
      initialLoader: false,
      showCamera: false,
      videoProcessing: false,
      nextPage: -1,
      prevPage: -1,
      isSubmit: false,
      isNoReturncheck: false,
      surveyQuesText: String.noSurveyQuestion,
      Language: global.language,
      translation: Constants.survey,
      translation_common: Constants.common_text,
      webview: false,
      scrollArrow: 'none',
      screenTime: 0,
      isSubmitDisable: false,
      isSlowNetwork: false
    };
    this.sliderEditing = false;
    this.audioRecorderPlayer = new AudioRecorderPlayer();
    this.audioRecorderPlayer.setSubscriptionDuration(0.09);
    this.updateOtherTextInput = this.updateOtherTextInput.bind(this);
    this.setAnswerForOtherInput = this.setAnswerForOtherInput.bind(this);
  }

  /** component life cycle method */
  UNSAFE_componentWillMount() {
    // this.getpagetranslation() //todo remove this while new key added 
  }
  componentDidMount() {
    /* lock screen portrait mode */
    Orientation.lockToPortrait();

    this.checkNetworkSpeed(missionId)
    //this.setupQuestionArrayBackup(missionId) //moved below after get question

    if (this.sound) {
      this.sound.release();
      this.sound = null;
    }

    if (this.timeout) {
      clearInterval(this.timeout);
    }

    /* listening event for device GPS status */
    // GPSState.addListener(status => {
    //   switch (status) {
    //     case GPSState.NOT_DETERMINED:
    //       alert(
    //         "Please, allow the location, for us to get your current location!"
    //       );
    //       break;

    //     case GPSState.RESTRICTED:
    //       /* ask GPS access permission */
    //       this.askPermissionToEnableLocation();
    //       break;

    //     case GPSState.DENIED:
    //       break;

    //     case GPSState.AUTHORIZED_ALWAYS:
    //       break;

    //     case GPSState.AUTHORIZED_WHENINUSE:
    //       /* get device current location */
    //       this.getUserCurrentLocation();
    //       break;

    //     case GPSState.AUTHORIZED:
    //       break;
    //   }
    // });
    // //Get the current GPS state
    // GPSState.getStatus().then(status => {
    //   //console.log('STATE::', status)
    // });

    // setTimeout(() => {
    //   GPSState.requestAuthorization(GPSState.AUTHORIZED_WHENINUSE);
    // }, 500);

    /* get all question for selected mission */
    // this.getQuestions(missionId); //Moved below after network check

    this.appStatechangeListner = AppState.addEventListener("change", this._handleAppStateChange);

    /* get device current location */
    // this.getUserCurrentLocation();
    this.getLocationPermission();

    this.willFocus = this.props.navigation.addListener("focus", () => {
      //console.log('willFocus:', global.type)
      this.getParams();
    });
    this.timeout = setInterval(() => {
      if (
        this.sound &&
        this.sound.isLoaded() &&
        this.state.playState == "playing" &&
        !this.sliderEditing
      ) {
        this.sound.getCurrentTime((seconds, isPlaying) => {
          this.setState({ playSeconds: seconds });
        });
      }
    }, 100);

    this.startTimeTracking()
  }

  /** check network speed if slow network then set offline mode
   *  @missionId - passed mission id for getting question list 
   */
  checkNetworkSpeed = async (missionId) => {
    try {
      const networkSpeed = await measureConnectionSpeed();
      if (networkSpeed.finalspeed < 2.1) {
        this.setState({ isSlowNetwork: true }, () => {
          global.isSlowNetwork = true
          Constants.showSnack(this.state.translation[this.state.Language].SlowNetwork_Survey_Submit);
        })
      }
      else {
        global.isSlowNetwork = false
      }
    } catch (err) {
      global.isSlowNetwork = false
    }

    /* get all question for selected mission */
    this.getQuestions(missionId);

  }

  componentDidUpdate() {
    // StatusBar.setHidden(false);
  }

  componentWillUnmount() {
    this.stopTimeTracking()
    if (this.RBBottomSheet) {
      this.RBBottomSheet.close();
    }
    this.resetSound("paused");
    // Pause the audio player if it's running
    this.handleAudioPause();
    //GPSState.removeListener();
    // AppState.removeEventListener("change", this._handleAppStateChange);
    this.appStatechangeListner.remove()
  }

  /* Get mission language page translation data from api  */
  async getpagetranslation() {
    /** set forcefully offline if user profile set offine true then survey submit should be offline*/
    let setOffline = await AsyncStorage.getItem('setOffline') || false;   // not in use
    NetInfo.fetch().then(state => {
      let status = state.isConnected ? "online" : "offline";
      if (status === "online" && JSON.parse(setOffline) != true) {
        let url = Constants.BASE_URL + Service.TRANSLATION_PAGE + 'survey';
        axios.get(url).then(response => {
          // console.log(response.data)
          this.setState({ translation: response.data.data });
        })
          .catch((error) => {
            this.setState({ translation: Constants.survey });
          });
      }
      else {
        this.setState({ translation: Constants.survey });
      }
    })
  }

  /** setup question array backup
   * @param missionID - identify mission by id
   */
  setupQuestionArrayBackup = async (missionId) => {
    let questionBackupArrStored = await AsyncStorage.getItem('questionBackupArr_' + missionId);
    if (questionBackupArrStored !== null && questionBackupArrStored !== undefined && questionBackupArrStored !== '') {
      this.setState({ questionBackupArr: JSON.parse(questionBackupArrStored) })
    }
  }

  /**check location(gps) permission */
  getLocationPermission = () => {
    let permissionType = Platform.select({
      android: PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
      ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    })
    check(permissionType)
      .then((result) => {
        if (result == RESULTS.GRANTED) {
          /* get device current location */
          this.getUserCurrentLocation();
        }
        else if (result == RESULTS.UNAVAILABLE || result == RESULTS.DENIED || result == RESULTS.BLOCKED) {
          /** request location permission */
          this.requestLocationPermission()
        } else {
          /** ask second time permission by alert */
          setTimeout(() => {
            this.askPermissionToEnableLocation();
          }, 100);
        }
      })
      .catch((error) => {
        console.log('error permission', error)
      });
  }
  checkLocationPermission = () => {
    let permissionType = Platform.select({
      android: PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
      ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    })
    return check(permissionType)
      .then((result) => {
        return result
      })
      .catch((error) => {
        return error
      });
  }

  /** Request Location GPS permission */
  requestLocationPermission = () => {
    let permissionType = Platform.select({
      android: PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
      ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    })
    request(permissionType).then(result => {
      if (result == RESULTS.GRANTED) {
        /* get device current location */
        this.getUserCurrentLocation();
      } else {
        setTimeout(() => {
          this.askPermissionToEnableLocation();
        }, 100);
      }
    });
  }

  /* ask GPS access permission */
  askPermissionToEnableLocation = () => {
    if (!isAlertVisible) {
      isAlertVisible = true
      Alert.alert(
        this.state.translation[this.state.Language].Permission_Title,
        this.state.translation[this.state.Language].GPS_Permission_Msg,
        [
          {
            text: this.state.translation[this.state.Language].Cancel,
            onPress: () => { isAlertVisible = false },
            style: "cancel"
          },
          {
            text: this.state.translation[this.state.Language].OK,
            onPress: () => {
              // GPSState.openLocationSettings();
              //isAlertVisible = false
              openSettings().catch(() => console.log('cannot open settings'));
            }
          }
        ],
        { cancelable: false }
      )
    }

  };

  /* get device current location */
  getUserCurrentLocation = async () => {
    let statusOfLocation = await this.checkLocationPermission()

    if (Platform.OS == 'ios') {
      GeolocationIOS.getCurrentPosition(
        position => {
          let region = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: 0.00922 * 1.5,
            longitudeDelta: 0.00421 * 1.5
          };
          addressRetryAttempt = 0;
          this.onRegionChange(region, region.latitude, region.longitude);
        },
        error => {
          //if (GPSState.AUTHORIZED || GPSState.AUTHORIZED_ALWAYS) {
          if (statusOfLocation == RESULTS.GRANTED) {
            if (addressRetryAttempt < 3) {
              addressRetryAttempt++;
              setTimeout(() => {
                this.getUserCurrentLocation();
              }, 1000);
            } else {
              this.setState({
                addressLoader: false,
                locationAddress: this.state.translation_common[this.state.Language].We_CouldNot_GetYour_Location
              });
            }
          } else {
            this.setState({
              addressLoader: false,
              locationAddress: this.state.translation_common[this.state.Language].We_CouldNot_GetYour_Location
            });
          }
        },
        { enableHighAccuracy: false, timeout: 20000 }
      );
    }
    else {
      /**react-native-geolocation-service to solve 
       * location timeout issue in android used this lib */
      Geolocation.getCurrentPosition(
        position => {
          let region = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: 0.00922 * 1.5,
            longitudeDelta: 0.00421 * 1.5
          };
          addressRetryAttempt = 0;
          //console.log('CURRENT REGION::', region)
          this.onRegionChange(region, region.latitude, region.longitude);
        },
        error => {
          //if (GPSState.AUTHORIZED || GPSState.AUTHORIZED_ALWAYS) {
          if (statusOfLocation == RESULTS.GRANTED) {
            if (addressRetryAttempt < 3) {
              addressRetryAttempt++;
              setTimeout(() => {
                this.getUserCurrentLocation();
              }, 1000);
            } else {
              this.setState({
                addressLoader: false,
                locationAddress: this.state.translation_common[this.state.Language].We_CouldNot_GetYour_Location
              });
            }
          } else {
            this.setState({
              addressLoader: false,
              locationAddress: this.state.translation_common[this.state.Language].We_CouldNot_GetYour_Location
            });
          }
        },
        { enableHighAccuracy: false, timeout: 20000 }
      );
    }

    // navigator.geolocation.getCurrentPosition((position) => {
    //     let region = {
    //         latitude: position.coords.latitude,
    //         longitude: position.coords.longitude,
    //         latitudeDelta: 0.00922 * 1.5,
    //         longitudeDelta: 0.00421 * 1.5
    //     }
    //     addressRetryAttempt = 0;
    //     //console.log('CURRENT REGION::', region)
    //     this.onRegionChange(region, region.latitude, region.longitude);
    // }, error => {
    //     //console.log('LOCATION ERROR::',error)
    //     if (GPSState.AUTHORIZED || GPSState.AUTHORIZED_ALWAYS) {
    //         if (addressRetryAttempt < 3) {
    //             addressRetryAttempt++
    //             setTimeout(() => {
    //                 this.getUserCurrentLocation()
    //             }, 1000)

    //         } else {
    //             this.setState({ addressLoader: false, locationAddress: this.state.translation_common[this.state.Language].We_CouldNot_GetYour_Location })
    //         }
    //     } else {
    //         this.setState({ addressLoader: false, locationAddress: this.state.translation_common[this.state.Language].We_CouldNot_GetYour_Location })
    //     }
    // },
    //     {
    //         enableHighAccuracy: false,
    //         timeout: 25000,
    //         maximumAge: 3600000
    //     });
  };

  /** Method called when region change
   *  @param region - region area 
   *  @param lastLat - last identified latitude
   *  @param lastLong - last identified longitude
   *  @param index - question index
   */
  onRegionChange(region, lastLat, lastLong, index = null) {
    this.setState(
      {
        mapRegion: region,
        // If there are no new values set use the the current ones
        lastLat: lastLat || this.state.lastLat,
        lastLong: lastLong || this.state.lastLong,
        addressLoader: true
      },
      _ => {
        if (this.state.locationAddress == null) {
          /** Call fetching formated arress api first time while address not available */
          this.locationAddressFetcher(lastLat, lastLong, index);
        }
        else if (this.state.locationAddress && this.state.questionsArr.length > 0 && this.state.questionsArr[this.state.pageCount ? this.state.pageCount : 0].questionType == 'gps') {
          /** Call fetching formated arress api while GPS element and come to forground*/
          this.locationAddressFetcher(lastLat, lastLong, index);
        }
        else {
          this.setState({ addressLoader: false })
        }
      }
    );
  }

  /** fetched location formated address from the latlong
   *  @param lastLat - latitude 
   *  @param lastLong - longitude 
   *  @param index - question index
   */
  locationAddressFetcher = (lastLat, lastLong, index) => {
    let location = [];
    let address = null;
    let url =
      "https://maps.googleapis.com/maps/api/geocode/json?address=" +
      lastLat +
      "," +
      lastLong +
      "&key=" +
      String.googleApiKey;
    //console.log('FETCH ADDRESS::', url);
    fetch(url)
      .then(response => response.json())
      .then(responseJson => {
        location = responseJson;
        // //console.log(location.results[0].formatted_address)
        if (location.results.length > 0) {
          address = location.results[0].formatted_address;
        } else {
          address = this.state.translation_common[this.state.Language].Address_NotFound;
        }
        this.setState(
          {
            locationAddress: address,
            addressLoader: false
          },
          _ => {
            if (index !== null) {
              this.addAnswerForGps(index);
            }
          }
        );
      });
  };

  /**
   * Add selected GPS coordination to answer
   * @param {Number} index Current question array element
   */
  addAnswerForGps(index) {
    let questionArray = this.state.questionsArr[index];
    const { lastLat, lastLong } = this.state;
    let answer = {
      latitude: lastLat.toFixed(8),
      longitude: lastLong.toFixed(8)
    };
    questionArray.answer = answer;
    questionArray.isUpdated = true;
    let localArray = this.state.questionsArr;
    localArray[index] = questionArray;
  }

  /** Handle the application state change like. Called when application 
   *  comes from background to foreground and fore ground to backgeound and active state
   *  @param nextAppState - changed next state of application 
   */
  _handleAppStateChange = (nextAppState) => {
    StatusBar.setHidden(false);
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      //console.log('App has come to the foreground!');
      this.setState({ addressLoader: true });
      setTimeout(() => {
        this.getUserCurrentLocation();
        this.startTimeTracking()
      }, 1000);
    }
    else {
      this.stopTimeTracking()
    }
    this.setState({ appState: nextAppState });
  };

  /* get related component params */
  async getParams() {
    missionId = global.missionId;
    pageIndex = global.pageIndex;
    captureIndex = global.pageIndex;

    if (global.type === "scan") {
      barCodeId = global.barCode;
      previewUri = global.previewUri;
      productName = global.productName;
      productDescription = global.productDescription;
      this.setPreviewImageSize();
      this.setScanCapturedAnswerLocally(captureIndex);
      /*RNFS.readFile(previewUri, "base64").then(res => {
        scannedImageBase64Data = res;
      });*/
    } else if (global.type === "capture") {
      capturedImageUri = global.imageData;
      previewUri = global.previewUri;
      markerId = global.markerId;
      scaleId = global.scaleId;
      mFrom = global.from;
      captionText = global.captionText;
      this.setPreviewImageSize();
      this.setCapturedAnswerLocally(captureIndex);
      /*if (previewUri !== "" && previewUri !== undefined) {
        this.convertUriToBase64();
      }*/
    } else if (global.type === "imageupload") {
      previewUri = global.previewUri;
      this.setPreviewImageSize();
      this.addAnswerForSelectedImageMedia(captureIndex);
      /*if (previewUri !== "" && previewUri !== undefined) {
        RNFS.readFile(previewUri, "base64").then(res => {
          mediaImageBase64 = res;
        });
        //this.addAnswerForSelectedImageMedia(global.base64Image,captureIndex);
      }*/
    }

    global.previewUri = "";
    //global.base64Image = '';
    global.screenKey = "";
    global.pageIndex = 0;
    global.missionId = "";
    global.barCode = "";
    global.type = "";
    global.imageData = "";
    global.markerId = 0;
    global.scaleId = 0;
    global.captionText = "";
  }

  /* Set preview image height and width */
  setPreviewImageSize() {
    if (capturedImageUri !== "" && capturedImageUri !== undefined) {
      captureUri = { uri: capturedImageUri };
      imageWidth = 260;
      imageHeight = 360;
    } else if (previewUri !== "" && previewUri !== undefined) {
      captureUri = { uri: previewUri };
      imageWidth = 260;
      imageHeight = 360;
    }

    if (pageIndex === undefined) {
      pageIndex = 0;
    }
  }

  /**
   * This function used to convert Image URI to base64 format
   * previewUri - Preview Image URI
   * capturedImageUri - Marker/Scaled image URI
   * */
  async convertUriToBase64() {
    if (capturedImageUri !== undefined && capturedImageUri !== "") {
      RNFS.readFile(capturedImageUri, "base64").then(res => {
        capturedImageBase64 = res;
      });
    } else if (previewUri !== undefined && previewUri !== "") {
      RNFS.readFile(previewUri, "base64").then(res => {
        capturedImageBase64 = res;
      });
    }
  }


  /**
   * This function calls Get 'mission_survey' API to get all questions from the server
   * If last accessed survey questions is available in local storage, function will return local questions
   * If device is offline, returns survey questions from local storage
   * @param mid - selected mission id
   * */
  async getQuestions(mid) {
    let LastAccess = false;
    let questionArr_temp = await AsyncStorage.getItem(mid.toString() + '_LastAccess');
    if (questionArr_temp !== null && questionArr_temp !== undefined && questionArr_temp !== '') {
      let LastAccess_questionArr = JSON.parse(questionArr_temp);
      LastAccess_questionArr.questionArr = JSON.parse(LastAccess_questionArr.questionArr)
      if (LastAccess_questionArr.questionArr.length > 0) {
        let allQuestions = LastAccess_questionArr.questionArr;
        LastAccess = true;
        pageIndex = LastAccess_questionArr.pageCount;

        let tmp_ans = await AsyncStorage.getItem("inp_" + mid.toString());

        if (tmp_ans != null) {
          tmpList = JSON.parse(tmp_ans);
          for (let i = 0; i < tmpList.length; i++) {
            for (let j = 0; j < allQuestions.length; j++) {
              if (allQuestions[j].questionID == tmpList[i].question_id && !tmpList[i].hasOwnProperty("noreturn") && !tmpList[i].hasOwnProperty("loop_number") && !tmpList[i].hasOwnProperty("loop_set") &&
                !allQuestions[j].hasOwnProperty("noreturn") && !allQuestions[j].hasOwnProperty("loop_number") && !allQuestions[j].hasOwnProperty("loop_set")) {
                allQuestions[j].answer = tmpList[i].answer;
              }
            }

          }

          for (let j = 0; j < allQuestions.length; j++) {
            let loop_answers = [];
            if (allQuestions[j].loop_answers) {
              loop_answers = allQuestions[j].loop_answers;
            }
            for (let i = 0; i < tmpList.length; i++) {
              if (allQuestions[j].questionID == tmpList[i].question_id && !tmpList[i].hasOwnProperty("noreturn")
                && tmpList[i].hasOwnProperty("loop_number") && tmpList[i].hasOwnProperty("loop_set") && !allQuestions[j].hasOwnProperty("noreturn")
                && allQuestions[j].hasOwnProperty("loop_number") && allQuestions[j].hasOwnProperty("loop_set")) {

                let match = false;
                for (let k = 0; k < loop_answers.length; k++) {
                  if (loop_answers[k].loop_number == tmpList[i].loop_number && loop_answers[k].loop_triggered_qid == tmpList[i].loop_triggered_qid
                    && loop_answers[k].loop_set == tmpList[i].loop_set) {
                    match = true;
                  }
                }

                if (match == false) {
                  let obj = {};
                  obj.loop_number = tmpList[i].loop_number;
                  obj.loop_set = tmpList[i].loop_set;
                  obj.loop_triggered_qid = tmpList[i].loop_triggered_qid;
                  obj.answers = tmpList[i].answer;
                  loop_answers.push(obj);
                }
              }
            }

            if (loop_answers.length > 0) {
              allQuestions[j].loop_answers = loop_answers;
            }
          }
        }

        this.addQuestionBasedOnChoiceType(allQuestions);
        let leftDisable = false;
        if (LastAccess_questionArr.pageCount === 0 && LastAccess_questionArr.pageCount === LastAccess_questionArr.prevpage) { leftDisable = true }
        if (LastAccess_questionArr.prevpage < 0) { leftDisable = true }
        this.setState(
          {
            translation: Constants.survey,
            arrLength: allQuestions.length,
            questionsArr: allQuestions,
            isLoading: false,
            initialLoader: true,
            nextPage: LastAccess_questionArr.nextPage,
            prevPage: LastAccess_questionArr.prevpage,
            pageCount: LastAccess_questionArr.pageCount,
            leftArrow: leftDisable === true ? 0.3 : 1,
            rightArrow: LastAccess_questionArr.pageCount === LastAccess_questionArr.nextPage ? 0.3 : 1,
            leftDisable: leftDisable,
            rightDisable: LastAccess_questionArr.pageCount === LastAccess_questionArr.nextPage,
          },
          () => {
            this.componentUpdateHandler(allQuestions.length, true);
          }
        );
      }
    }
    if (!LastAccess) {
      let onBoardArr = [];
      let screenerArr = [];
      let mainQuestionArr = [];
      let allQuestions = [];
      //this.setState({ questionsArr: [] });
      let api_key = await AsyncStorage.getItem("api_key");
      netState = await AsyncStorage.getItem("NetworkState");
      Constants.saveKey("missionId", missionId.toString());
      global.missionId = missionId.toString();


      let tmp_ans = await AsyncStorage.getItem("inp_" + mid.toString());
      let mid_sync_status = await AsyncStorage.getItem("survey_sync_" + mid.toString());
      let quesObj = await AsyncStorage.getItem(mid.toString());

      /** set forcefully offline if user profile set offine true then survey submit should be offline*/
      let setOffline = await AsyncStorage.getItem('setOffline') || false;  // not in use

      let url =
        Constants.BASE_URL_V2 + Service.MISSION_SURVEY + this.state.missionId;
      NetInfo.fetch().then(state => {
        status = state.isConnected ? "online" : "offline";
        if (status === "online" && this.state.isSlowNetwork != true) {
          axios
            .get(url, {
              headers: {
                "Content-Type": "application/json",
                Auth: api_key
              },
              timeout: Constants.TIMEOUT
            })
            .then(response => {
              if (response.data.status === 200) {
                if (response.data.hasOwnProperty("mission_surveys")) {
                  response.data.mission_surveys.map(data => {
                    gpsHidden =
                      data.gps_hidden !== undefined ? data.gps_hidden : 0;
                    if (data.hasOwnProperty("survey_type")) {


                      if (data.survey_type === "onboard") {
                        if (data.hasOwnProperty("questions")) {
                          if (data.questions.length > 0) {
                            data.questions.map(result => {
                              let que = {
                                answer:
                                  result.answers != null ? result.answers : "",
                                properties: result.question.properties,
                                survey_id: data.survey_id,
                                questionID: result.question.question_id,
                                questionType: result.question.type,
                                surveyAnsTagId: result.survey_answer_tag_id
                                  ? result.survey_answer_tag_id
                                  : "",
                                conditions: result.question.hasOwnProperty(
                                  "conditions"
                                )
                                  ? result.question.conditions
                                  : [],
                                handler: result.question.hasOwnProperty(
                                  "handler"
                                )
                                  ? result.question.handler
                                  : null,
                                uniqueID: result.id
                              };
                              if (result.hasOwnProperty('loop_answers')) {
                                que.loop_answers = result.loop_answers
                              }
                              onBoardArr.push(que);
                            });
                          }
                        }
                        if (onBoardArr.length > 0) {
                          onBoardArr.map(data => {
                            allQuestions.push(data);
                          });
                        }
                      }

                      if (data.survey_type === "screener") {
                        if (data.hasOwnProperty("questions")) {
                          if (data.questions.length > 0) {
                            data.questions.map(result => {
                              let que = {
                                answer:
                                  result.answers != null ? result.answers : "",
                                properties: result.question.properties,
                                survey_id: data.survey_id,
                                questionID: result.question.question_id,
                                questionType: result.question.type,
                                surveyAnsTagId: result.survey_answer_tag_id
                                  ? result.survey_answer_tag_id
                                  : "",
                                conditions: result.question.hasOwnProperty(
                                  "conditions"
                                )
                                  ? result.question.conditions
                                  : [],
                                handler: result.question.hasOwnProperty(
                                  "handler"
                                )
                                  ? result.question.handler
                                  : null,
                                uniqueID: result.id
                              };
                              if (result.hasOwnProperty('loop_answers')) {
                                que.loop_answers = result.loop_answers
                              }
                              screenerArr.push(que);
                            });
                          }
                        }

                        if (screenerArr.length > 0) {
                          screenerArr.map(data => {
                            allQuestions.push(data);
                          });
                        }


                      }


                      if (data.survey_type === "main") {
                        if (data.hasOwnProperty("questions")) {
                          if (data.questions.length > 0) {
                            data.questions.map(result => {
                              let que = {
                                answer:
                                  result.answers != null ? result.answers : "",
                                properties: result.question.properties,
                                survey_id: data.survey_id,
                                questionID: result.question.question_id,
                                questionType: result.question.type,
                                surveyAnsTagId: result.survey_answer_tag_id
                                  ? result.survey_answer_tag_id
                                  : "",
                                conditions: result.question.hasOwnProperty(
                                  "conditions"
                                )
                                  ? result.question.conditions
                                  : [],
                                handler: result.question.hasOwnProperty(
                                  "handler"
                                )
                                  ? result.question.handler
                                  : null,
                                uniqueID: result.id
                              };
                              if (result.hasOwnProperty('loop_answers')) {
                                que.loop_answers = result.loop_answers
                              }
                              mainQuestionArr.push(que);
                            });
                          }
                        }
                        if (mainQuestionArr.length > 0) {
                          mainQuestionArr.map(data => {
                            allQuestions.push(data);
                          });
                        }
                      }
                    }
                  });



                  //this.actionForNavigationIcon(parseInt(pageIndex));
                  if (tmp_ans != null) {
                    tmpList = JSON.parse(tmp_ans);
                    for (let i = 0; i < tmpList.length; i++) {
                      for (let j = 0; j < allQuestions.length; j++) {
                        if (allQuestions[j].questionID == tmpList[i].question_id && !tmpList[i].hasOwnProperty("noreturn") && !tmpList[i].hasOwnProperty("loop_number") && !tmpList[i].hasOwnProperty("loop_set") &&
                          !allQuestions[j].hasOwnProperty("noreturn") && !allQuestions[j].hasOwnProperty("loop_number") && !allQuestions[j].hasOwnProperty("loop_set")) {
                          allQuestions[j].answer = tmpList[i].answer;
                        }

                      }

                    }

                    for (let j = 0; j < allQuestions.length; j++) {
                      let loop_answers = [];
                      if (allQuestions[j].loop_answers) {
                        loop_answers = allQuestions[j].loop_answers;
                      }
                      for (let i = 0; i < tmpList.length; i++) {
                        if (allQuestions[j].questionID == tmpList[i].question_id && !tmpList[i].hasOwnProperty("noreturn")
                          && tmpList[i].hasOwnProperty("loop_number") && tmpList[i].hasOwnProperty("loop_set") && !allQuestions[j].hasOwnProperty("noreturn")
                          && allQuestions[j].hasOwnProperty("loop_number") && allQuestions[j].hasOwnProperty("loop_set")) {
                          let match = false;
                          for (let k = 0; k < loop_answers.length; k++) {
                            if (loop_answers[k].loop_number == tmpList[i].loop_number && loop_answers[k].loop_triggered_qid == tmpList[i].loop_triggered_qid
                              && loop_answers[k].loop_set == tmpList[i].loop_set) {
                              match = true
                            }
                          }

                          if (match == false) {
                            let obj = {};
                            obj.loop_number = tmpList[i].loop_number;
                            obj.loop_set = tmpList[i].loop_set;
                            obj.loop_triggered_qid = tmpList[i].loop_triggered_qid;
                            obj.answers = tmpList[i].answer;
                            loop_answers.push(obj);
                          }
                        }
                      }

                      if (loop_answers.length > 0) {
                        allQuestions[j].loop_answers = loop_answers;
                      }
                    }

                  }

                  let target = [];
                  let temp_questionsArr = allQuestions;
                  for (let j = 0; j < allQuestions.length; j++) {
                    if (allQuestions[j].conditions.length > 0) {
                      for (let i = 0; i < allQuestions[j].conditions.length; i++) {
                        for (let m = 0; m < allQuestions[j].conditions[i].source.length; m++) {
                          if (allQuestions[j].conditions[i].source[m].state === "" && allQuestions[j].conditions[i].target.do === "loop_set") {
                            allQuestions[j].conditions[i].target.condition = true
                            target.push(allQuestions[j].conditions[i].target);
                          }
                        }
                      }
                    }


                    if (target) {
                      for (let k = 0; k < target.length; k++) {
                        for (let j = 0; j < allQuestions.length; j++) {
                          for (let n = 0; n < target[k].multifield.length; n++) {
                            if (allQuestions[j].handler === target[k].multifield[n].value) {
                              allQuestions[j].isDefault_loopset = true;
                            }
                          }
                        }
                      }
                      for (let k = 0; k < target.length; k++) {
                        if (target[k].hasOwnProperty('condition') && target[k].condition === true && target[k].do === "loop_set") {
                          this.state.questionsArr = temp_questionsArr;
                          this.create_loop(allQuestions, target[k], j, 'loop_set')
                          temp_questionsArr = this.state.questionsArr
                        }
                      }
                    }

                    target = [];
                  }

                  allQuestions = temp_questionsArr;
                  this.state.questionsArr = [];

                  /*if(quesObj != null) {
                    let cacQuestions = JSON.parse(quesObj);
                    for(let i=0; i < cacQuestions.length; i++ )
                    {
                      for(let j=0; j < allQuestions.length; j++ ){
                        if( allQuestions[j].questionID == cacQuestions[i].questionID && allQuestions[j].questionType == "info") {
                          if(allQuestions[j].properties.info_type == "video" && allQuestions[j].properties.info_video && cacQuestions[i].properties.info_video &&
                          allQuestions[j].properties.info_video != "" && cacQuestions[i].properties.info_video != "") {
                            let name = allQuestions[j].properties.info_video;
                            let cacName = cacQuestions[i].properties.info_video;
                            let downloaded = await RNFS.exists(cacName).then(exists => {
                              if (exists) {
                              console.log("Already exists " + cacName);
                              return true;
                              } else {
                              return false;
                              }
                            });		
                            let filename = name.substring(name.lastIndexOf("/") + 1, name.length);
                            let cache_name = cacName.substring(cacName.lastIndexOf("/") + 1, cacName.length);
                            filename = filename.replace(/%20/g, "_");
                          	
                            if(filename === cache_name && downloaded){
                              allQuestions[j].properties.info_video = cacQuestions[i].properties.info_video
                            }
                          }
                        }
                      }
                    	
                    }
                  }*/

                  this.addQuestionBasedOnChoiceType(allQuestions);

                  if (allQuestions.length !== 0) {
                    this.setState(
                      {
                        arrLength: allQuestions.length,
                        questionsArr: allQuestions,
                        isLoading: false,
                        initialLoader: true,
                        nextPage: allQuestions.length > 1 ? 1 : 0,
                        prevpage: 0,
                        pageCount: 0,
                        leftDisable: true,
                        rightDisable: allQuestions.length === 1
                      },
                      _ => {
                        this.componentUpdateHandler(allQuestions.length, true);
                      }
                    );
                  } else {
                    this.setState({ isLoading: false });
                  }
                }
              } else if (response.data.status === 401) {
                Constants.showSnack(this.state.translation_common[this.state.Language].Session_Expired);
                this.moveToSignIn();
              }
            })
            .catch(error => {
              this.setState({ isLoading: false });
              //console.log('error', error)
            });
        } else {
          if (mid_sync_status && mid_sync_status == "success") {
            this.getLocalQuestions(mid);

          }
          else {
            // this.setState({ surveyQuesText: 'Offline Survey is not available. Please try again later when you are connected to the network.', isLoading: false });
            this.setState({ surveyQuesText: this.state.translation[this.state.Language].Survey_NotAvailable_For_Offline, isLoading: false });
          }
        }
      });
    }

    // /** set questionbackup array */
    this.setupQuestionArrayBackup(mid)
  }

  /** get offline answered question 
   *  @param mid - selected mission id 
   * */
  async getLocalQuestions(mid) {

    let tmp_ans = await AsyncStorage.getItem("inp_" + mid.toString());
    let quesObj = await AsyncStorage.getItem(mid.toString());
    let hidelist = [];
    let noretId = -1;
    if (quesObj != null) {

      let allQuestions = JSON.parse(quesObj);

      if (tmp_ans != null) {
        tmpList = JSON.parse(tmp_ans);
        for (let i = 0; i < tmpList.length; i++) {
          for (let j = 0; j < allQuestions.length; j++) {
            if (allQuestions[j].questionID == tmpList[i].question_id && !tmpList[i].hasOwnProperty("noreturn") && !tmpList[i].hasOwnProperty("loop_number") && !tmpList[i].hasOwnProperty("loop_set") &&
              !allQuestions[j].hasOwnProperty("noreturn") && !allQuestions[j].hasOwnProperty("loop_number") && !allQuestions[j].hasOwnProperty("loop_set")) {
              allQuestions[j].answer = tmpList[i].answer;
            }
          }

        }

        for (let j = 0; j < allQuestions.length; j++) {
          let loop_answers = [];
          if (allQuestions[j].loop_answers) {
            loop_answers = allQuestions[j].loop_answers;
          }
          for (let i = 0; i < tmpList.length; i++) {
            if (allQuestions[j].questionID == tmpList[i].question_id && !tmpList[i].hasOwnProperty("noreturn")
              && tmpList[i].hasOwnProperty("loop_number") && tmpList[i].hasOwnProperty("loop_set") && !allQuestions[j].hasOwnProperty("noreturn")
              && allQuestions[j].hasOwnProperty("loop_number") && allQuestions[j].hasOwnProperty("loop_set")) {
              let match = false;
              for (let k = 0; k < loop_answers.length; k++) {
                if (loop_answers[k].loop_number == tmpList[i].loop_number && loop_answers[k].loop_triggered_qid == tmpList[i].loop_triggered_qid
                  && loop_answers[k].loop_set == tmpList[i].loop_set) {
                  match = true;
                }
              }

              if (match == false) {
                let obj = {};
                obj.loop_number = tmpList[i].loop_number;
                obj.loop_set = tmpList[i].loop_set;
                obj.loop_triggered_qid = tmpList[i].loop_triggered_qid;
                obj.answers = tmpList[i].answer;
                loop_answers.push(obj);
              }
            }
          }

          if (loop_answers.length > 0) {
            allQuestions[j].loop_answers = loop_answers;
          }
        }

        for (let i = 0; i < tmpList.length; i++) {
          if (tmpList[i].noreturn && tmpList[i].noreturn == 1) {
            hidelist = hidelist.concat(tmpList[i].hideList);
            noretId = tmpList[i].unique_id;
          }
        }

        let tempQuestions = [];
        for (let i = 0; i < allQuestions.length; i++) {
          if (!hidelist.includes(allQuestions[i].uniqueID) && allQuestions[i].uniqueID > noretId) {
            tempQuestions.push(allQuestions[i])
          }

        }
        allQuestions = tempQuestions;
      }

      let target = [];
      let temp_questionsArr = allQuestions;
      for (let j = 0; j < allQuestions.length; j++) {
        if (allQuestions[j].conditions.length > 0) {
          for (let i = 0; i < allQuestions[j].conditions.length; i++) {
            for (let m = 0; m < allQuestions[j].conditions[i].source.length; m++) {
              if (allQuestions[j].conditions[i].source[m].state === "" && allQuestions[j].conditions[i].target.do === "loop_set") {
                allQuestions[j].conditions[i].target.condition = true
                target.push(allQuestions[j].conditions[i].target);
              }
            }
          }
        }


        if (target) {
          for (let k = 0; k < target.length; k++) {
            for (let j = 0; j < allQuestions.length; j++) {
              for (let n = 0; n < target[k].multifield.length; n++) {
                if (allQuestions[j].handler === target[k].multifield[n].value) {
                  allQuestions[j].isDefault_loopset = true;
                }
              }
            }
          }
          for (let k = 0; k < target.length; k++) {
            if (target[k].hasOwnProperty('condition') && target[k].condition === true && target[k].do === "loop_set") {
              this.state.questionsArr = temp_questionsArr;
              this.create_loop(allQuestions, target[k], j, 'loop_set')
              temp_questionsArr = this.state.questionsArr
            }
          }
        }

        target = [];
      }

      allQuestions = temp_questionsArr;
      this.state.questionsArr = [];

      this.addQuestionBasedOnChoiceType(allQuestions);
      if (allQuestions.length !== 0) {
        gpsHidden = allQuestions[0].gpsHidden;
        this.setState(
          {
            arrLength: allQuestions.length,
            questionsArr: allQuestions,
            isLoading: false,
            initialLoader: true,
            nextPage: allQuestions.length > 1 ? 1 : 0,
            prevpage: 0,
            pageCount: 0,
            leftDisable: true,
            rightDisable: allQuestions.length === 1
          },
          _ => {
            this.componentUpdateHandler(allQuestions.length, true);
          }
        );
      } else {
        this.setState({ isLoading: false });
      }
    } else {
      this.setState({ isLoading: false });
    }
  }

  /**
   * Handling component re rendering
   */
  componentUpdateHandler = (length, isInitialLoad) => {
    if (isInitialLoad) {
      setTimeout(() => {
        this.disableArrowUntilPagesAreLoaded(length);
      }, 3000);
    }
  };

  /**
   * Called function to disable arrow untol page loading
   * @param {*} length 
   */
  disableArrowUntilPagesAreLoaded(length) {
    this.setState({
      initialLoader: false
    });
  }

  /* if session expired move to signin page */
  moveToSignIn() {
    AsyncStorage.clear();
    setTimeout(() => {
      // const resetAction = StackActions.reset({
      //   index: 0,
      //   actions: [NavigationActions.navigate({ routeName: "SignIn" })]
      // });
      // this.props.navigation.dispatch(resetAction);
      const resetAction = CommonActions.reset({
        index: 0,
        routes: [{ name: 'SignIn' }],
      });
      this.props.navigation.dispatch(resetAction);
    }, 500);
  }

  /**
   * Add questions to appropriate array based on choice_type
   * */
  addQuestionBasedOnChoiceType(allQuestions) {

    this.state.multiLevelFalseSingleChoiceOuterArray = [];
    this.state.multiLevelFalseMultiChoiceOuterArray = [];
    this.state.multiLevelTrueSingleChoiceOuterArray = [];
    this.state.multiLevelTrueMultiChoiceOuterArray = [];
    this.state.dropDownArray = []
    if (allQuestions.length > 0) {
      if (allQuestions[0].properties.length > 0) {
        if (allQuestions[0].properties.hasOwnProperty("length")) {
          let minWidth = allQuestions[0].properties.length * 5;
          this.setState({
            minWidth: minWidth
          });
        }
      }
      /**
       * adding questions to local array based on choice types
       *
       * @param item- each question object item
       *
       * @param mainIndex - question position/index
       * */
      allQuestions.map((item, mainIndex) => {
        if (item.questionType === "choice" && item.properties.display_type === "dropdown") {
          if (item.properties.options.length > 0) {
            let localArray = []
            item.properties.options.map((obj, index) => {
              if (item.answer !== null && item.answer.hasOwnProperty("label") && item.answer.label.length > 0 && item.answer.id == obj.id
              ) {
                localArray.push({
                  id: obj.id,
                  label: obj.label_text,
                  label_text: obj.label,
                  value: obj.label_text,
                  selected: true
                })
              }
              else {
                localArray.push({
                  id: obj.id,
                  label: obj.label_text,
                  label_text: obj.label,
                  value: obj.label_text,
                  selected: false
                })
              }
            })

            this.state.dropDownArray.push({
              index: mainIndex,
              data: localArray
            })
          }
        }
        else if (item.questionType === "choice") {
          /**
           * multilevel===1 and choiceType=='multiple'
           * */

          if (
            item.properties.multilevel === 1 &&
            item.properties.choice_type === "multiple"
          ) {
            if (item.properties.options.length > 0) {
              let multilevelTrueMultiChoiceInnerArray = [];

              let temp_options = item.properties.options;
              if (item.properties.hasOwnProperty('random') && item.properties.random === 1) {
                let other_options_swipe = temp_options;
                let other_options_swipe_temp = other_options_swipe;
                let other_id;
                other_options_swipe_temp.map((o, i) => {
                  if (o.id === "other") {
                    other_id = o;
                    other_options_swipe.splice(i, 1)
                  }
                })
                if (other_id !== undefined) {
                  other_options_swipe = this.shuffle(other_options_swipe);
                  other_options_swipe.push(other_id);
                  item.properties.options = other_options_swipe;
                } else {
                  other_options_swipe = this.shuffle(other_options_swipe_temp);
                  item.properties.options = other_options_swipe;
                }
              }

              item.properties.options.map((item1, index) => {
                let isClick = false;
                if (
                  item.answer !== null &&
                  item.answer.hasOwnProperty("selected_option") &&
                  Array.isArray(item.answer.selected_option) &&
                  item.answer.selected_option.length > 0
                ) {
                  isClick = this.checkChoiceSelected(
                    item1.id,
                    item.answer.selected_option
                  );
                }
                multilevelTrueMultiChoiceInnerArray.push({
                  id: item1.id,
                  title: item1.label,
                  title_text: item1.label_text,
                  data: this.addItem(item1.id, item1.sublabel, item1.sublabel_text, true, item.answer, index, item.properties.hasOwnProperty('random') ? item.properties.random === 1 ? true : false : false),
                  image:
                    item1.label_image !== "" ? { uri: item1.label_image } : "",
                  remote_image:
                    item1.remote_label_image ? item1.remote_label_image : "",
                  position: index,
                  headerClicked: isClick
                });
              });

              this.state.multiLevelTrueMultiChoiceOuterArray.push({
                index: mainIndex,
                data: multilevelTrueMultiChoiceInnerArray
              });
            }
          }

          /**
           * multilevel===1 and choiceType=='single'
           * */
          if (
            item.properties.multilevel === 1 &&
            item.properties.choice_type === "single"
          ) {
            if (item.properties.options.length > 0) {
              let multilevelTrueSingleChoiceInnerArray = [];

              let temp_options = item.properties.options;
              if (item.properties.hasOwnProperty('random') && item.properties.random === 1) {
                let other_options_swipe = temp_options;
                let other_options_swipe_temp = other_options_swipe;
                let other_id;
                other_options_swipe_temp.map((o, i) => {
                  if (o.id === "other") {
                    other_id = o;
                    other_options_swipe.splice(i, 1)
                  }
                })
                if (other_id !== undefined) {
                  other_options_swipe = this.shuffle(other_options_swipe);
                  other_options_swipe.push(other_id);
                  item.properties.options = other_options_swipe;
                } else {
                  other_options_swipe = this.shuffle(other_options_swipe_temp);
                  item.properties.options = other_options_swipe;
                }
              }

              item.properties.options.map((item1, index) => {
                let isClick = false;
                if (
                  item.answer !== null &&
                  item.answer.hasOwnProperty("selected_option") &&
                  Array.isArray(item.answer.selected_option) &&
                  item.answer.selected_option.length > 0
                ) {
                  isClick = this.checkChoiceSelected(
                    item1.id,
                    item.answer.selected_option
                  );
                }
                multilevelTrueSingleChoiceInnerArray.push({
                  id: item1.id,
                  title: item1.label,
                  title_text: item1.label_text,
                  data: this.addItem(item1.id, item1.sublabel, item1.sublabel_text, false, item.answer, index, item.properties.hasOwnProperty('random') ? item.properties.random === 1 ? true : false : false),
                  image:
                    item1.label_image !== "" ? { uri: item1.label_image } : "",
                  remote_image:
                    item1.remote_label_image ? item1.remote_label_image : "",
                  position: index,
                  headerClicked: isClick
                });
              });

              this.state.multiLevelTrueSingleChoiceOuterArray.push({
                index: mainIndex,
                data: multilevelTrueSingleChoiceInnerArray
              });
            }
          }

          /**
           * multilevel===0 and choiceType=='single'
           * */
          if (
            item.properties.multilevel === 0 &&
            item.properties.choice_type === "single"
          ) {
            if (item.properties.options.length > 0) {
              let multilevelFalseSingleChoiceInnerArray = [];

              multilevelFalseSingleChoiceInnerArray = this.addSingleLevel(
                item.properties.options,
                false,
                item.answer
              );

              if (item.properties.hasOwnProperty('random') && item.properties.random === 1) {
                let temp_arry = multilevelFalseSingleChoiceInnerArray;
                let other_options_swipe_temp = temp_arry;
                let other_id;
                other_options_swipe_temp.map((o, i) => {
                  if (o.id === "other") {
                    other_id = o;
                    temp_arry.splice(i, 1)
                  }
                })
                if (other_id !== undefined) {
                  multilevelFalseSingleChoiceInnerArray = this.shuffle(temp_arry);
                  multilevelFalseSingleChoiceInnerArray.push(other_id);
                } else {
                  multilevelFalseSingleChoiceInnerArray = this.shuffle(multilevelFalseSingleChoiceInnerArray);
                }
              }

              this.state.multiLevelFalseSingleChoiceOuterArray.push({
                index: mainIndex,
                data: multilevelFalseSingleChoiceInnerArray
              });


            }
          }

          /**
           * multilevel===0 and choiceType=='multiple'
           * */
          if (
            item.properties.multilevel === 0 &&
            item.properties.choice_type === "multiple"
          ) {
            if (item.properties.options.length > 0) {
              let multilevelFalseMultiChoiceInnerArray = [];

              multilevelFalseMultiChoiceInnerArray = this.addSingleLevel(
                item.properties.options,
                true,
                item.answer
              );

              if (item.properties.hasOwnProperty('random') && item.properties.random === 1) {
                let temp_arry = multilevelFalseMultiChoiceInnerArray;
                let other_options_swipe_temp = temp_arry;
                let other_id;
                other_options_swipe_temp.map((o, i) => {
                  if (o.id === "other") {
                    other_id = o;
                    temp_arry.splice(i, 1)
                  }
                })
                if (other_id !== undefined) {
                  multilevelFalseMultiChoiceInnerArray = this.shuffle(temp_arry);
                  multilevelFalseMultiChoiceInnerArray.push(other_id);
                } else {
                  multilevelFalseMultiChoiceInnerArray = this.shuffle(multilevelFalseMultiChoiceInnerArray);
                }
              }


              this.state.multiLevelFalseMultiChoiceOuterArray.push({
                index: mainIndex,
                data: multilevelFalseMultiChoiceInnerArray
              });
            }
          }
        }
      });
    }
  }

  /* shuffle choice question array options */
  shuffle(arrList) {
    let ctr = arrList.length;
    let temp;
    let index;
    while (ctr > 0) {
      index = Math.floor(Math.random() * ctr);
      ctr--;
      temp = arrList[ctr];
      arrList[ctr] = arrList[index];
      arrList[index] = temp;
    }
    return arrList;
  }


  /**
   * Check if any sub level choice selected in choice type question
   * @param {Number} parentId Parent level Choice ID
   * @param {Array} selected Selected Answer array
   */
  checkChoiceSelected(parentId, selected) {
    let isSelected = false;
    for (let i = 0; i < selected.length; i++) {
      if (selected[i].id === parentId) {
        isSelected = true;
      }
    }
    return isSelected;
  }

  /**
   * setScannedImageAnswerLocally
   * local answer setup ,after scan bar code
   * @param page - selected page 
   * */
  setScanCapturedAnswerLocally(page) {
    let localArray = this.state.questionsArr;
    let answer = {
      barcode_id: barCodeId,
      product_name: productName,
      product_description: productDescription,
      image: previewUri
    };
    localArray[page].answer = answer;
    localArray[page].isUpdated = true;
    this.setState(
      {
        questionsArr: localArray
      },
      _ => {
        if (this.state.rightDisable === true) {
          this.executeConditions(answer);
        }
      }
    );
  }

  /**
   * setCapturedAnswerLocally
   * local answer setup ,after image capture
   * */
  setCapturedAnswerLocally(page) {
    let localArray = this.state.questionsArr;
    let answer = {
      caption_text: captionText,
      image: capturedImageUri === "" ? previewUri : capturedImageUri,
      image_preview: previewUri,
      marker_id: markerId,
      scale_image_id: scaleId
    };

    localArray[page].answer = answer;
    localArray[page].isUpdated = true;
    this.setState(
      {
        questionsArr: localArray
      },
      _ => {
        if (this.state.rightDisable === true) {
          this.executeConditions(answer);
        }
      }
    );
  }

  /**
   * add "isclicked" param to sub label array
   * @param itemArr - sublabel array
   * @param isMultiple - let array item to know whether is multiple choice option or not
   * @param answer - To pass answer array to compare already selected sublabel item
   * @param headerIndex - parent array position in this case "options" array
   * @return - subItemArr - modified sublabel array back to calling function
   * */
  addItem(pid, itemArr, isMultiple, answer, headerIndex, random) {
    let subItemArr = [];

    itemArr.map(item => {
      if (isMultiple) {
        if (answer != null && answer !== "") {
          if (answer.hasOwnProperty("selected_option")) {
            if (answer.selected_option.length > 0) {
              item.isClicked = false;
              answer.selected_option.map(subItem => {
                if (
                  subItem.id === pid &&
                  subItem.sublabel_id === item.id
                ) {
                  item.isClicked = true;
                }
              });
            }
          }
        } else {
          item.isClicked = false;
        }
        subItemArr.push(item);
      } else {
        if (answer != null && answer !== "") {
          if (answer.hasOwnProperty("selected_option")) {
            if (answer.selected_option.length > 0) {
              item.isClicked = false;
              answer.selected_option.map(subItem => {
                if (subItem.id === pid &&
                  subItem.sub_id === item.id) {
                  item.isClicked = true;
                }
              });
            }
          }
        } else {
          item.isClicked = false;
        }
        subItemArr.push(item);
      }
    });

    if (random) {
      return this.shuffle(subItemArr);
    }
    return subItemArr;
  }

  /**
   * This function used to match with already answered questions and make those answer default "checked" and return new object
   * @param itemArr - this is each object item of question array
   * @param isMultiple - To identify whether its multi choice or single choice
   * @param answer - this is answer object/array
   * @return - return new object
   * */
  addSingleLevel(itemArr, isMultiple, answer) {
    let itemId = -1;
    let subItemArr = [];
    itemArr.map(initem => {
      let item = cloneDeep(initem);
      if (!isMultiple) {
        // single
        if (answer != null && answer !== "") {
          itemId = answer.id;
        }
        item.isClicked = item.id === itemId ? true : false;

        subItemArr.push(item);
      } else {
        // multiple
        if (answer != null && answer !== "") {
          if (answer.hasOwnProperty("selected_option")) {
            if (answer.selected_option.length > 0) {
              item.isClicked = false;
              answer.selected_option.map(subItem => {
                if (item.id === subItem.id) {
                  item.isClicked = true;
                }
              });
            }
          }
        } else {
          item.isClicked = false;
        }
        subItemArr.push(item);
      }
    });

    return subItemArr;
  }

  /**
   * survey completed message and redirected to mission screen
   * @param key - keys to remove from local storage
   * */
  async surveyCompletion(key) {
    isAlertPresent = false
    backBtnFired = true;
    await AsyncStorage.removeItem(key);

    /** remove Active time Key */
    let activeTime_id = this.state.missionId.toString() + '_activeTime';
    await AsyncStorage.removeItem(activeTime_id);

    /** remove questionArraybackup key used for noReturn backup */
    let backupKey = 'questionBackupArr_' + this.state.missionId.toString()
    await AsyncStorage.removeItem(backupKey);

    Constants.showSnack(this.state.translation[this.state.Language].Survey_Completed);
    this.onBackButtonPressAndroid();
  }

  /**
   * Validate limit char on question type input
   * @param {Array} questionArr Curruent Question Array
   * @param {Object} questionObj Current Answer
   */
  limitCharValidation(questionArr, answer) {
    let limit = {
      limitValid: true,
      limitMessage: ''
    };
    let min = questionArr.properties.hasOwnProperty("minimum")
      ? questionArr.properties.minimum
      : null;
    let max = questionArr.properties.hasOwnProperty("maximum")
      ? questionArr.properties.maximum
      : null;
    let textLength = answer && answer.text ? answer.text.length : 0;
    if (min !== null && max !== null) {
      if (textLength < min) {
        limit.limitValid = false;
      } else if (textLength > max) {
        limit.limitValid = false;
      }
      limit.limitMessage =
        limit.limitValid === false
          ? "Please answer between " + min + " and " + max + " characters"
          : limit.limitMessage;
    } else if (min !== null) {
      if (textLength < min) {
        limit.limitValid = false;
        limit.limitMessage =
          limit.limitValid === false
            ? "Please answer with " + min + " or more characters"
            : limit.limitMessage;
      }
    } else if (max !== null) {
      if (textLength > max) {
        limit.limitValid = false;
        limit.limitMessage =
          limit.limitValid === false
            ? "Please answer within " + max + " characters"
            : limit.limitMessage;
      }
    }
    return limit;
  }

  /**
   * this method used to return new object based on user given answer and return new question object
   * @param currentQuestArrayPos - current pager position/question index
   * @return - new question object
   * */
  questionPostObject(currentQuestArrayPos, retryArray) {
    let questionObj = "";

    let questionArr = []
    if (retryArray && retryArray.length > 0) {
      /** case when - retry for submition then take full array while noreturn
       *  and main array is skiped until no return so it will merged both and retry for submition
       */
      questionArr = retryArray[currentQuestArrayPos];
    }
    else {
      /** normal case */
      questionArr = this.state.questionsArr[currentQuestArrayPos];
    }

    if (questionArr.questionType === "capture") {
      questionObj = {
        mission_id: this.state.missionId,
        survey_id: questionArr.survey_id,
        question_id: questionArr.questionID,
        question_type: questionArr.questionType,
        survey_answer_tag_id: questionArr.surveyAnsTagId,
        answer: {
          image: capturedImageBase64,
          scale_image_id: scaleId,
          marker_id: markerId,
          caption_text: captionText
        }
      };
    } else if (questionArr.questionType === "barcode") {
      questionObj = {
        mission_id: this.state.missionId,
        survey_id: questionArr.survey_id,
        question_id: questionArr.questionID,
        question_type: questionArr.questionType,
        survey_answer_tag_id: questionArr.surveyAnsTagId,
        answer: {
          barcode_id: barCodeId,
          product_name: productName,
          product_description: productDescription,
          image: scannedImageBase64Data
        }
      };
    } else if (questionArr.questionType === "upload") {
      let answer = {
        media_type: questionArr.answer.media_type,
        media_format: questionArr.answer.media_format,
        media: mediaImageBase64
      };
      questionObj = {
        mission_id: this.state.missionId,
        survey_id: questionArr.survey_id,
        question_id: questionArr.questionID,
        question_type: questionArr.questionType,
        survey_answer_tag_id: questionArr.surveyAnsTagId,
        answer: answer
      };
    } else {
      questionObj = {
        mission_id: this.state.missionId,
        survey_id: questionArr.survey_id,
        question_id: questionArr.questionID,
        question_type: questionArr.questionType,
        survey_answer_tag_id: questionArr.surveyAnsTagId,
        answer: questionArr.answer
      };
    }

    if (questionArr.isloop) {
      questionObj.loop_number = questionArr.loop_number;
      questionObj.loop_set = questionArr.loop_set_num;
      questionObj.loop_triggered_qid = questionArr.loop_triggered_qid;
      //delete questionArr.isloop
    }

    return questionObj;
  }

  /**
   * create duplicate question based on loop condition
   * Find a trigger question in condition
   * Find loop question set is next or previous question in selected survey questions
   * create duplicate question based on conditon or user entered number
   * calculate loopset number based on set of question
   * copy condition to duplicate condition
   * insert duplicate loop question array to main array specific index
   * @param questionsArray - question array list
   * @param condition - condition for the looping 
   * @param parentIndex - main page index
   * @param label - looping type
   */
  create_loop(questionsArray, condition, parentIndex, label) {
    let newquestionsArray = cloneDeep(this.state.questionsArr);
    let questionsArr = cloneDeep(this.state.questionsArr);
    let arry = [];
    let questionID = questionsArray[parentIndex].questionID;
    let newquesarr = {};
    let conditionistrue = false;
    let conditions = cloneDeep(condition.multifield)
    let loopset_condition = cloneDeep(condition.multifield)
    let spliceparentIndex = parentIndex
    let loop_triggered_ques = conditions.length;
    let future_questuion = false;
    let with_trigger = false;
    let check_loop_ques_next = false
    let check_with_condition = true;
    let move_condition = false;
    let num_loop = null;
    let old_value = null;
    let new_value = null;
    let set_loop_number = false;
    let newconditions = []
    if (label === 'loop') {
      if (newquestionsArray[parentIndex].hasOwnProperty('isloop_only')) {
        conditionistrue = newquestionsArray[parentIndex].isloop_only
      }
    } else if (label === 'loop_set') {
      if (newquestionsArray[parentIndex].hasOwnProperty('isloop_set')) {
        conditionistrue = newquestionsArray[parentIndex].isloop_set
      }
      num_loop = condition.num_loop
      if (num_loop === '' || num_loop < 1) {
        conditionistrue = true;
      }
    } else if (label === 'loop_input') {
      if (newquestionsArray[parentIndex].hasOwnProperty('isloop_input')) {
        conditionistrue = newquestionsArray[parentIndex].isloop_input
      }
      if (newquestionsArray[parentIndex].hasOwnProperty('loop_inputvalue')) {
        old_value = newquestionsArray[parentIndex].loop_inputvalue
        new_value = newquestionsArray[parentIndex].answer.text
        new_value = parseInt(new_value)
        old_value = parseInt(old_value)
        if (old_value !== new_value) {
          conditionistrue = false;
          this.clear_loopinput(questionsArray, condition, parentIndex, label)
          this.clear_loop_answer(questionsArray, condition, parentIndex, label)
          newquestionsArray = cloneDeep(this.state.questionsArr);
          questionsArr = cloneDeep(this.state.questionsArr);

        }
      }
      num_loop = newquestionsArray[parentIndex].answer.text
      num_loop = parseInt(num_loop)
    }

    if (!conditionistrue) {
      if (condition.hasOwnProperty('condition') && condition.condition) {
        check_with_condition = false;
      }

      condition.multifield.map((m, cindex) => {
        if (m.value === questionsArray[parentIndex].handler) {
          loop_triggered_ques = cindex
          with_trigger = true;
        }
      })
      //  Find previous or future question
      if (condition.multifield.length > 0) {
        if (loop_triggered_ques !== null && loop_triggered_ques > 0) {
          questionsArr.map((c, g) => {
            if (!c.hasOwnProperty('loop_number') &&
              condition.multifield[loop_triggered_ques - 1].value === c.handler &&
              parentIndex < g
            ) {
              future_questuion = true;
              spliceparentIndex = g
            }
          })
        }
      }
      if (future_questuion) {
        if (questionsArray[parentIndex + 1].handler === condition.multifield[0].value) {
          check_loop_ques_next = true;
        }
      }
      if (label === 'loop') {
        if (future_questuion) {
          if (with_trigger) {
            let temp = {}
            temp = condition.multifield[condition.multifield.length - 1];
            newconditions.push(temp)
            move_condition = true;
          } else {
            conditionistrue = true;
          }
        } else {
          if (with_trigger) {
            // conditions = [];
            newconditions = condition.multifield
            spliceparentIndex = parentIndex;
            move_condition = true;
          } else {
            // conditions = [];
            newconditions = condition.multifield
            spliceparentIndex = parentIndex;
          }
        }
      } else if (label === 'loop_set') {
        if (check_with_condition) {
          if (future_questuion) {
            if (with_trigger) {
              if (num_loop === 1 || num_loop === 0) {
                let temp = {};
                temp = condition.multifield[condition.multifield.length - 1]
                newconditions.push(temp)
                move_condition = true;
              } else {
                num_loop = num_loop - 1;
                let trigger_Ques = {};
                trigger_Ques = condition.multifield[loop_triggered_ques];
                let temp = []
                loopset_condition = conditions.splice(loop_triggered_ques, 1)
                for (let i = 0; i < num_loop; i++) {
                  conditions.map((m, cindex) => {
                    temp.push(m)
                  })
                }
                temp.push(trigger_Ques)
                newconditions = temp
                spliceparentIndex = parentIndex + condition.multifield.length - 1;
                move_condition = true;
              }
            } else {
              if (num_loop === 1 || num_loop === 0) {
                conditionistrue = true;
              } else {
                num_loop = num_loop - 1;
                // conditions = [];       
                for (let i = 0; i < num_loop; i++) {
                  loopset_condition.map((m, cindex) => {
                    newconditions.push(m)
                  })
                }
              }
            }
          } else {
            if (with_trigger) {
              let trigger_Ques = {};
              trigger_Ques = condition.multifield[loop_triggered_ques];
              let temp = []
              loopset_condition = conditions.splice(loop_triggered_ques, 1)
              for (let i = 0; i < num_loop; i++) {
                conditions.map((m, cindex) => {
                  temp.push(m)
                })
              }
              temp.push(trigger_Ques)
              newconditions = temp
              move_condition = true;
            } else {
              for (let i = 0; i < num_loop; i++) {
                loopset_condition.map((m, cindex) => {
                  newconditions.push(m)
                })
              }
            }
          }
        } else {
          if (num_loop === 1 || num_loop === 0) {
            conditionistrue = true;
          } else {
            num_loop = num_loop - 1;
            //  conditions = [];       
            for (let i = 0; i < num_loop; i++) {
              loopset_condition.map((m, cindex) => {
                newconditions.push(m)
              })
            }
          }
        }
      } else if (label === 'loop_input') {
        if (future_questuion) {
          if (num_loop === 1) {
            newquestionsArray[parentIndex].isloop_input = true;
            newquestionsArray[parentIndex].loop_inputvalue = num_loop;
            this.state.questionsArr = newquestionsArray;
            conditionistrue = true;
          } else {
            num_loop = num_loop - 1;
            for (let i = 0; i < num_loop; i++) {
              loopset_condition.map((m, cindex) => {
                newconditions.push(m)
              })
            }
          }
        } else {
          for (let i = 0; i < num_loop; i++) {
            loopset_condition.map((m, cindex) => {
              newconditions.push(m)
            })
          }
        }
      }

    }

    if (!conditionistrue) {
      let num_loop_diff = loopset_condition.length;
      let calc_loop_num = 0;
      let loop_set_num = 1;
      let loop_number = 1;
      if (label === 'loop') {
        newquestionsArray[parentIndex].isloop_only = true;
      } else if (label === 'loop_set') {
        newquestionsArray[parentIndex].isloop_set = true;
      } else if (label === 'loop_input') {
        newquestionsArray[parentIndex].isloop_input = true;
        newquestionsArray[parentIndex].loop_inputvalue = parseInt(newquestionsArray[parentIndex].answer.text);
      }

      if (questionsArray[parentIndex].hasOwnProperty('loop_set_num') &&
        questionsArray[parentIndex].hasOwnProperty('loop_set_end') &&
        questionsArray[parentIndex].loop_set_end == true
      ) {
        loop_set_num = questionsArray[parentIndex].loop_set_num + 1;
      }

      newconditions.map((m, cindex) => {
        questionsArr.map((q, index) => {
          let check = false;
          if (!check && m.value === q.handler) {
            if (q.hasOwnProperty('loop_number')) { check = true; }
            if (!check) {
              if (label === 'loop_input') {
                if (calc_loop_num >= num_loop_diff) {
                  loop_set_num = loop_set_num + 1
                  calc_loop_num = 0;
                  loop_number = 1;
                }
              }
              check = true;
              newquesarr = {};
              newquesarr.answer = ""
              newquesarr.handler = q.handler;
              newquesarr.properties = q.properties;
              newquesarr.loop_triggered_qid = questionID;
              newquesarr.loop_number = label === 'loop_input' ?
                loop_number : cindex + 1;
              newquesarr.loop_set_num = loop_set_num;
              newquesarr.questionType = q.questionType;
              newquesarr.surveyAnsTagId = q.surveyAnsTagId;
              newquesarr.survey_id = q.survey_id;
              newquesarr.uniqueID = q.uniqueID;
              newquesarr.questionID = q.questionID;
              newquesarr.isloop = true;
              if (cindex === newconditions.length - 1) {
                newquesarr.loop_set_end = true
              }
              if (newquesarr.hasOwnProperty('loop_set_end') && newquesarr.loop_set_end === true) {
                newquesarr.conditions = this.setloopquesconditions(q.conditions, questionID, loop_set_num, cindex + 1, move_condition, move_condition)
              } else {
                if (label === 'loop_input') {
                  newquesarr.conditions = this.setloopquesconditions(q.conditions, questionID, loop_set_num, loop_number, false, false)
                } else {
                  newquesarr.conditions = this.setloopquesconditions(q.conditions, questionID, loop_set_num, cindex + 1, false, false)
                }
              }
              if (questionsArr[index].loop_answers && questionsArr[index].loop_answers.length > 0) {
                questionsArr[index].loop_answers.map((a, aindex) => {
                  if (label === 'loop_input') {
                    if (questionID === a.loop_triggered_qid && a.loop_set === loop_set_num && loop_number === a.loop_number) {
                      newquesarr.answer = a.answers;
                    }
                  } else {
                    if (questionID === a.loop_triggered_qid && a.loop_set === loop_set_num && ((cindex + 1) === a.loop_number)) {
                      newquesarr.answer = a.answers;
                    }
                  }
                })
              }

              arry.push(newquesarr)
              if (label === 'loop_input') {
                calc_loop_num = calc_loop_num + 1;
                loop_number = loop_number + 1;
              }

            }
          }

        })
      })
      if (arry.length > 0) {
        newquestionsArray.splice(spliceparentIndex + 1, 0, ...arry)
        this.addQuestionBasedOnChoiceType(newquestionsArray)
        this.state.questionsArr = newquestionsArray;
      }
    }
  }

  /** hiding the loop question that is not matched
   *  @param condition - condition for the looping
   *  @param questionsArray - Question array
   *  @param parentIndex - parent main question index
   */
  hide_unMetTarget_loopques(condition, questionsArray, parentIndex) {
    let loop_triggered_ques = false;
    let triggerd_ques_index = condition.multifield.length - 1;
    let future_questuion = false;
    let check_loop_ques_next = false;
    condition.multifield.map((m, cindex) => {
      if (m.value === questionsArray[parentIndex].handler) {
        if (triggerd_ques_index > 0) {
          triggerd_ques_index = triggerd_ques_index - 1;
          loop_triggered_ques = true;
        } else {
          loop_triggered_ques = true;
        }

      }
    })

    //  Find previous or future question
    if (condition.multifield.length > 0) {
      questionsArray.map((c, g) => {
        if (condition.multifield[triggerd_ques_index].value === c.handler && !c.loop_triggered_qid &&
          parentIndex < g
        ) {
          future_questuion = true;;
          // spliceparentIndex = g
        }
      })
    }

    if (future_questuion) {
      if (loop_triggered_ques) {
        condition.isHide = true;
        condition.multifield[condition.multifield.length - 1].trigger = true;
      } else {
        condition.isHide = true;
      }
    }
    else {
      condition.isHide = false;
    }
  }

  /** manage clear loop question answer function 
   * @param surveyAnsTagId - answer tag id
   * @param question_id - selected question id
   * @param loop_triggered_qid - looping triggered question id   
   * @param loop_number - loop number
  */
  clear_loop(surveyAnsTagId, question_id, loop_triggered_qid, loop_set_num, loop_number) {
    this.clear_local(surveyAnsTagId, question_id, loop_triggered_qid, loop_set_num, loop_number);
    this.clear_loop_api(surveyAnsTagId, question_id, loop_triggered_qid, loop_set_num, loop_number);
  }

  /**
   * clear loop question answer in question array
   * @param surveyAnsTagId - answer tag id
   * @param question_id - selected question id
   * @param loop_triggered_qid - looping triggered question id   
   * @param loop_number - loop number
   */
  clear_local(surveyAnsTagId, question_id, loop_triggered_qid, loop_set_num, loop_number) {

    if (question_id !== null) {
      this.state.questionsArr.map((m, i) => {
        if (question_id === m.questionID && !m.loop_triggered_qid) {
          m.answer = ""
        }
      })
    }
    else if (loop_triggered_qid !== null) {
      if (loop_set_num !== null) {
        if (loop_number !== null) {
          let arr = []
          this.state.questionsArr.map((m, n) => {
            if (m.hasOwnProperty('loop_answers') && m.loop_answers.length > 0) {
              m.loop_answers.map((l, j) => {
                if (loop_triggered_qid === l.loop_triggered_qid && loop_set_num === l.loop_set
                  && loop_number === l.loop_number) {
                  arr.push(j)
                }
              })
              if (arr.length > 0) {
                let arryset = [...new Set(arr)]
                for (var i = arryset.length - 1; i >= 0; i--) {
                  m.loop_answers.splice(arryset[i], 1);
                }
              }
              arr = []
            }

          })
        } else {
          let arr = []
          this.state.questionsArr.map((m, n) => {
            if (m.hasOwnProperty('loop_answers') && m.loop_answers.length > 0) {
              m.loop_answers.map((l, j) => {
                if (loop_triggered_qid === l.loop_triggered_qid && l.loop_set >= loop_set_num) {
                  arr.push(j)
                }
              })
              if (arr.length > 0) {
                let arryset = [...new Set(arr)]
                for (var i = arryset.length - 1; i >= 0; i--) {
                  m.loop_answers.splice(arryset[i], 1);
                }
                arr = []
              }
            }

          })

        }
      } else {
        let arr = []
        this.state.questionsArr.map((m, n) => {
          if (m.hasOwnProperty('loop_answers') && m.loop_answers.length > 0) {
            m.loop_answers.map((l, j) => {
              if (loop_triggered_qid === l.loop_triggered_qid) {
                arr.push(j)
              }
            })
            if (arr.length > 0) {
              let arryset = [...new Set(arr)]
              for (var i = arryset.length - 1; i >= 0; i--) {
                m.loop_answers.splice(arryset[i], 1);
              }
              arr = []
            }
          }
        })
      }

    }
  }

  /**
   * clear loop question answer in server based on user selected answer
   * clear loop question answer in local storage based on user selected answer
   * @param surveyAnsTagId - answer tag id
   * @param question_id - selected question id
   * @param loop_triggered_qid - looping triggered question id   
   * @param loop_number - loop number
   */
  async clear_loop_api(surveyAnsTagId, question_id, loop_triggered_qid, loop_set_num, loop_number) {
    let url = '';
    if (question_id !== null) {
      url = Constants.BASE_URL_V2 + Service.CLEAR_LOOP_ANSWERS + surveyAnsTagId + '&question_id=' + question_id;
    }
    else if (loop_triggered_qid !== null) {
      url = Constants.BASE_URL_V2 + Service.CLEAR_LOOP_ANSWERS + surveyAnsTagId + '&loop_triggered_qid=' + loop_triggered_qid;
      if (loop_set_num !== null) {
        url = url + '&loop_set=' + loop_set_num;
        if (loop_number !== null) {
          url = url + '&loop_number=' + loop_number;
        }
      }
    }
    let mid = this.state.missionId.toString();
    apiKey = await AsyncStorage.getItem("api_key");
    /** set forcefully offline if user profile set offine true then survey submit should be offline*/
    let setOffline = await AsyncStorage.getItem('setOffline') || false;   // not in use

    NetInfo.fetch().then(state => {
      status = state.isConnected ? "online" : "offline";
      if (status === "online" && JSON.parse(setOffline) != true) {
        axios
          .get(url, {
            headers: {
              "Content-Type": "application/json",
              Auth: apiKey
            },
            timeout: Constants.TIMEOUT
          })
          .then(response => {
            //console.log('loopClear',response.data)
          })
      }
    })
    let remList = [];
    //clear offline answers
    if (question_id && question_id >= 0) {
      for (let i = 0; i < tmpList.length; i++) {
        if (tmpList[i].question_id == question_id && !tmpList[i].loop_triggered_qid) {
          remList.push(i);
        }
      }
    } else {
      for (let i = 0; i < tmpList.length; i++) {
        if (loop_number && loop_number > 0) {
          if (tmpList[i].loop_triggered_qid && loop_triggered_qid == tmpList[i].loop_triggered_qid && tmpList[i].loop_set &&
            tmpList[i].loop_set == loop_set_num && tmpList[i].loop_number && tmpList[i].loop_number == loop_number) {
            remList.push(i)
          }
        }
        else if (loop_set_num && loop_set_num > 0) {
          if (tmpList[i].loop_triggered_qid && loop_triggered_qid == tmpList[i].loop_triggered_qid && tmpList[i].loop_set &&
            tmpList[i].loop_set >= loop_set_num) {
            remList.push(i)
          }
        } else {
          if (tmpList[i].loop_triggered_qid && loop_triggered_qid == tmpList[i].loop_triggered_qid) {
            remList.push(i)
          }
        }
      }

    }

    let newList = [];
    for (let i = 0; i < tmpList.length; i++) {
      let match = false;
      for (let j = 0; j < remList.length; j++) {
        if (remList[j] == i) {
          match = true
        }
      }
      if (match == false) {
        newList.push(tmpList[i])
      }
    }
    tmpList = newList;
    Constants.saveKey("inp_" + mid, JSON.stringify(tmpList));
  }

  /**
   * managing function for clear loop question answer
   * @param questionsArray - Question array
   * @param currentQuesIndx - current question index
   * @param label - looping lable typw
   */
  clear_loop_answer(questionsArray, conditions, currentQuesIndx, label) {
    let surveyAnsTagId = questionsArray[currentQuesIndx].surveyAnsTagId;
    let questionID = questionsArray[currentQuesIndx].questionID;
    let loop_triggered_qid = null;
    let loop_set_num = null;
    let loop_number = null;
    if (questionsArray[currentQuesIndx].hasOwnProperty('loop_triggered_qid') && questionsArray[currentQuesIndx].loop_triggered_qid >= 0) {
      loop_triggered_qid = questionsArray[currentQuesIndx].loop_triggered_qid;
    }
    if (loop_triggered_qid !== null) {
      loop_set_num = questionsArray[currentQuesIndx].loop_set_num;
      loop_number = questionsArray[currentQuesIndx].loop_number;
    }
    if (label === 'loop' || label === 'loop_set') {
      if (loop_triggered_qid === null) {
        this.clear_loop(surveyAnsTagId, null, questionID, null, null)
      } else {
        this.clear_loop(surveyAnsTagId, null, loop_triggered_qid, loop_set_num + 1, null)
      }
    } else if (label === 'loop_input') {
      if (loop_triggered_qid === null) {
        this.clear_loop(surveyAnsTagId, null, questionID, null, null)
      } else {
        this.clear_loop(surveyAnsTagId, null, loop_triggered_qid, null, null)
      }
    } else if (label === 'hide') {
      if (questionsArray[currentQuesIndx].hasOwnProperty('isDefault_loopset')) {
        this.clear_loop(surveyAnsTagId, questionID, null, null, null)
      } else {
        this.clear_loop(surveyAnsTagId, questionID, null, null, null)
        this.clear_loop(surveyAnsTagId, null, questionID, null, null)
      }
    } else if (label === 'hide_loop') {
      this.clear_loop(surveyAnsTagId, null, loop_triggered_qid, loop_set_num, loop_number)
    }
  }

  /* remove loop question to main array based on loop condition */
  clear_looponly(questionsArray, condition, parentIndex, label) {
    if (questionsArray[parentIndex].hasOwnProperty('isloop_only') && questionsArray[parentIndex].isloop_only === true) {
      let newquestionsArray = cloneDeep(this.state.questionsArr);
      let questionsArr = cloneDeep(this.state.questionsArr);
      let arry = [];
      let conditions = cloneDeep(condition.multifield);
      let loop_set_num = true;
      conditions.push({
        value: questionsArray[parentIndex].handler
      })
      if (questionsArray[parentIndex].hasOwnProperty('loop_set_num')) {
        loop_set_num = questionsArray[parentIndex].loop_set_num;
      }
      questionsArr.map((q, index) => {
        let check = false;
        conditions.map((m, cindex) => {
          if (!check && m.value === q.handler && q.hasOwnProperty('loop_triggered_qid') &&
            q.loop_triggered_qid === questionsArray[parentIndex].questionID
          ) {
            if (loop_set_num === true) {
              arry.push(index)
            } else if (loop_set_num < q.loop_set_num) {
              arry.push(index)
            }
          }
        })
      })
      if (loop_set_num) {
        newquestionsArray[parentIndex].isloop_only = false;
      }
      if (arry.length > 0) {
        let arryset = [...new Set(arry)]
        for (var i = arryset.length - 1; i >= 0; i--) {
          newquestionsArray.splice(arryset[i], 1);
        }
        this.addQuestionBasedOnChoiceType(newquestionsArray)

        this.state.questionsArr = newquestionsArray;
      }
    }
  }

  /* remove loop question to main array based on loop condition */
  clear_loopset(questionsArray, condition, parentIndex, label) {
    if (questionsArray[parentIndex].hasOwnProperty('isloop_set') && questionsArray[parentIndex].isloop_set === true) {
      let newquestionsArray = cloneDeep(this.state.questionsArr);
      let questionsArr = cloneDeep(this.state.questionsArr);
      let arry = [];

      let conditions = cloneDeep(condition.multifield);
      let loop_set_num = true;
      conditions.push({
        value: questionsArray[parentIndex].handler
      })
      if (questionsArray[parentIndex].hasOwnProperty('loop_set_num')) {
        loop_set_num = questionsArray[parentIndex].loop_set_num;
      }
      questionsArr.map((q, index) => {
        let check = false;
        conditions.map((m, cindex) => {
          if (!check && m.value === q.handler && q.hasOwnProperty('loop_triggered_qid') &&
            q.loop_triggered_qid === questionsArray[parentIndex].questionID
          ) {
            if (loop_set_num === true) {
              arry.push(index)
            }
            else {
              if (loop_set_num < q.loop_set_num) {
                arry.push(index)

              }
            }
          }
        })
      })
      if (loop_set_num) {
        newquestionsArray[parentIndex].isloop_set = false;
      }
      if (arry.length > 0) {
        let arryset = [...new Set(arry)]
        for (var i = arryset.length - 1; i >= 0; i--) {
          newquestionsArray.splice(arryset[i], 1);
        }
        this.addQuestionBasedOnChoiceType(newquestionsArray)

        this.state.questionsArr = newquestionsArray;
      }
    }
  }

  /* remove loop question to main array based on user entered number */
  clear_loopinput(questionsArray, condition, parentIndex, label) {
    if (questionsArray[parentIndex].hasOwnProperty('isloop_input') && questionsArray[parentIndex].isloop_input === true) {
      let newquestionsArray = cloneDeep(this.state.questionsArr);
      let questionsArr = cloneDeep(this.state.questionsArr);
      let arry = [];

      questionsArr.map((q, index) => {
        let check = false;
        condition.multifield.map((m, cindex) => {
          if (!check && m.value === q.handler && q.hasOwnProperty('loop_triggered_qid') &&
            q.loop_triggered_qid === questionsArray[parentIndex].questionID
          ) {
            arry.push(index)

          }
        })
      })
      if (arry.length > 0) {
        let arryset = [...new Set(arry)]
        for (var i = arryset.length - 1; i >= 0; i--) {
          newquestionsArray.splice(arryset[i], 1);
        }
        this.addQuestionBasedOnChoiceType(newquestionsArray)

        this.state.questionsArr = newquestionsArray;
      }
    }
  }

  /**
   * copy condition to created loop question
   * add trigged question id , loop number and loop setnumber to loop question condition array
   */
  setloopquesconditions(conditions, id, loop_set_num, index, check, future_questuion) {
    let condition = cloneDeep(conditions);
    let newcondition = cloneDeep(conditions)
    if (condition.length > 0) {
      let arry = []
      if (check) {
        for (let i = 0; i < condition.length; i++) {
          newcondition[i].target.loop_triggered_qid = id;
          newcondition[i].target.loop_number = index;
          newcondition[i].target.loop_set_num = loop_set_num;
          if (future_questuion === true) {
            newcondition[i].target.loop = true;
          }
        }
      } else {
        for (let i = 0; i < condition.length; i++) {
          if (condition[i].target.do === 'loop' || condition[i].target.do === 'loop_set' || condition[i].target.do === 'loop_input') {
            arry.push(i)
          }
          else {
            newcondition[i].target.loop_triggered_qid = id;
            newcondition[i].target.loop_number = index;
            newcondition[i].target.loop = true;
            newcondition[i].target.loop_set_num = loop_set_num;
          }
        }
      }
      if (arry.length > 0) {
        for (var i = arry.length - 1; i >= 0; i--) {
          newcondition.splice(arry[i], 1);
        }
      }

    }
    return newcondition
  }


  /**
   * Post answer to server 
   * @param {object} questionObj - current question answer based on question type
   * @param {boolean} isSubmit - when user click submit or not
   * @param {boolean} noReturn - current question is noreturn property or not
   * @param {boolean} isFromRetry - isnot check previous post is in progress while upload from retry or remaing question.
   * if question type is multimedia get media uri to local saved path
   * post answer to server
   */
  async postAnswerToServer(questionObj, currentPage, isSubmit, noReturn, isFromRetry, retryArray) {
    let { questionsArr, pageCount, prevPage, questionBackupArr } = this.state;
    let hiddenQuestions = [];
    let upload_file = '';
    let upload_filename = '';

    /** if comes from retry option then use  */
    if (isFromRetry && (retryArray && retryArray.length) > 0) {
      questionsArr = retryArray
    }

    /** skip if previous post progress but if isfrom retry then not skip */
    if (isFromRetry != true && questionObj.question_type === "upload" && questionsArr[currentPage].answer['media'] && questionsArr[currentPage].answer['media'] != "" &&
      questionsArr[currentPage].answer['media_type'] && questionsArr[currentPage].answer['media_type'] == "video") {

      if (questionResponseQue[questionsArr[currentPage].questionID] === false) {
        //skip as previous post in progress - and if isFromRetry then not check in progress. 
        return;
      }
    }

    // Add current lat and long titude to GPS widget
    if (questionObj.question_type === "gps") {
      const { lastLat, lastLong } = this.state;
      let answer = {
        latitude: lastLat.toFixed(8),
        longitude: lastLong.toFixed(8),
        address: this.state.locationAddress
      };
      questionObj.answer = answer;
      //by K
      questionsArr[currentPage].isUpdated = true
      questionsArr[currentPage].answer = answer
    }
    // If GPS enable for any type question add current lat and long titude to the answer object
    if (gpsHidden == 1) {
      let gpsCoord = questionObj.answer;
      gpsCoord.latitude = this.state.lastLat;
      gpsCoord.longitude = this.state.lastLong;
      questionObj.answer = gpsCoord;
      if (questionObj.question_type === "input") {
        if (typeof questionObj.answer === "string") {
          let answer = {
            text: questionObj.answer,
            latitude: this.state.lastLat,
            longitude: this.state.lastLong
          };
          questionObj.answer = answer;
        }
      }
    }

    let devCoord = {};
    if (questionObj.answer) {
      devCoord = questionObj.answer
    };
    devCoord.deviceName = DeviceInfo.getDeviceName()
      ? await DeviceInfo.getDeviceName()
      : "";
    devCoord.deviceId = DeviceInfo.getDeviceId()
      ? DeviceInfo.getDeviceId()
      : "";
    devCoord.systemName = DeviceInfo.getSystemName()
      ? DeviceInfo.getSystemName()
      : "";
    devCoord.systemVersion = DeviceInfo.getSystemVersion()
      ? DeviceInfo.getSystemVersion()
      : "";
    questionObj.answer = devCoord;

    apiKey = await AsyncStorage.getItem("api_key");
    let mid = this.state.missionId.toString();
    let keysList = await AsyncStorage.getItem('ans_keys_list');
    let missionObject = await AsyncStorage.getItem('missionData');

    /**Offline survey mission store for export */
    let enableOfflineBackup = await AsyncStorage.getItem('enableOfflineBackup');
    let offlineData = await AsyncStorage.getItem('offlineExport')
    let offlineExportData = JSON.parse(offlineData)
    let offlineExportArray = []
    if (offlineExportData !== null && offlineExportData !== undefined && offlineExportData.length > 0) {
      offlineExportArray = offlineExportData
    }

    /** setting url for the post answer */
    let url = Constants.BASE_URL_V2 + Service.POST_ANSWER;
    if (Platform.OS == 'android') {
      if (questionObj.question_type === "upload" && questionsArr[currentPage].answer && questionsArr[currentPage].answer['media_type'] && questionsArr[currentPage].answer['media_type'] == "video") {
        url = Constants.BASE_URL_V3 + Service.POST_UPLOAD_ANSWER_MULTIPART;
      } else if (questionObj.question_type === "upload") {
        url = Constants.BASE_URL_V2 + Service.POST_UPLOAD_ANSWER_BASE64;
      }
    }
    else {
      if (questionObj.question_type === 'upload') {
        url = Constants.BASE_URL_V2 + Service.POST_UPLOAD_ANSWER_BASE64;
      }
    }

    /**isSubmit = true - last question */
    if (isSubmit === true) {
      let queueCompleted = this.checkPreviousPostInprogress();
      if (queueCompleted == false && isFromRetry != true) {
        //Constants.showSnack(this.state.translation[this.state.Language].Processing_Msg);
        Constants.showSnack(this.state.translation[this.state.Language].Processing_Msg, true).then(() => {
          this.decrement('swipe', 100)
        });
        return;
      }

      this.setState({ isSubmit: true });
      questionObj.submit = true;

      for (let i = 0; i < questionsArr.length; i++) {
        if (
          questionsArr[i].isHide && questionsArr[i].isHide === true
        ) {
          hiddenQuestions.push(questionsArr[i].uniqueID)
        }
      }

      questionObj.hide_list = hiddenQuestions;

      //add active time to question object
      let activeTime_id = this.state.missionId.toString() + '_activeTime';
      let savedTime = await AsyncStorage.getItem(activeTime_id);
      if (savedTime !== null && savedTime !== undefined && savedTime !== '') {
        questionObj.activeTime = JSON.parse(savedTime)
      }
      else {
        questionObj.activeTime = 0
      }
    }

    //console.log(questionObj.hide_list);
    questionResponseQue[questionsArr[currentPage].questionID] = false;

    if (noReturn && noReturn == 1) {
      this.setState({ isNoReturncheck: true });
    }

    if (Platform.OS == 'android' && questionObj.question_type === "upload" && questionsArr[currentPage].answer['media'] && questionsArr[currentPage].answer['media'] != "" &&
      questionsArr[currentPage].answer['media_type'] && questionsArr[currentPage].answer['media_type'] == "video") {
      let name = questionsArr[currentPage].answer['media'];
      let filename = name.substring(name.lastIndexOf(".") + 1, name.length);
      questionObj.answer['media'] = '';
      upload_file = questionsArr[currentPage].answer['media']
      upload_filename = filename;

    }

    else if (questionObj.question_type === "upload" && questionsArr[currentPage].answer['media'] && questionsArr[currentPage].answer['media'] != "") {
      questionObj.answer['media'] = await RNFS.readFile(questionsArr[currentPage].answer['media'], "base64");
      let mediaPath = questionsArr[currentPage].answer['media']
      let name = questionObj.survey_id.toString() + questionObj.question_id.toString() + (new Date().getTime()).toString()
      let filename = name + '.' + (mediaPath && mediaPath.substring(mediaPath.lastIndexOf(".") + 1));
      let path_name = RNFS.DocumentDirectoryPath + "/" + filename;
      await RNFS.writeFile(path_name, questionObj.answer['media'], 'base64')
        .then((success) => {
          questionsArr[currentPage].answer['media'] = "file://" + path_name;
        })
        .catch((err) => {
          //console.log(err.message);
        });

      // questionObj.answer['media'] = await RNFS.readFile(questionsArr[currentPage].answer['media'], "base64");
      // let name = questionsArr[currentPage].answer['media'];
      // let ext = name.substring(name.lastIndexOf("."), name.length);
      // let filename = questionObj.survey_id.toString() + questionObj.question_id.toString() + (new Date().getTime()).toString() + ext;
      // let path_name = RNFS.DocumentDirectoryPath + "/" + filename;
      // await RNFS.writeFile(path_name, questionObj.answer['media'], 'base64')
      //   .then((success) => {
      //     questionsArr[currentPage].answer['media'] = "file://" + path_name;
      //   })
      //   .catch((err) => {
      //     //console.log(err.message);
      //   });
    }
    else if (questionObj.question_type === "capture" && questionsArr[currentPage].answer['image'] && questionsArr[currentPage].answer['image'] != "") {
      questionObj.answer['image'] = await RNFS.readFile(questionsArr[currentPage].answer['image'], "base64");
      var mediaPath = questionsArr[currentPage].answer['image']
      let name = questionObj.survey_id.toString() + questionObj.question_id.toString() + (new Date().getTime()).toString()
      let filename = name + '.' + (mediaPath && mediaPath.substring(mediaPath.lastIndexOf(".") + 1));
      let path_name = RNFS.DocumentDirectoryPath + "/" + filename;
      await RNFS.writeFile(path_name, questionObj.answer['image'], 'base64')
        .then((success) => {
          questionsArr[currentPage].answer['image'] = "file://" + path_name;
        })
        .catch((err) => {
          //console.log(err.message);
        });

      // questionObj.answer['image'] = await RNFS.readFile(questionsArr[currentPage].answer['image'], "base64");
      // let name = questionsArr[currentPage].answer['image'];
      // let ext = name.substring(name.lastIndexOf("."), name.length);
      // let filename = questionObj.survey_id.toString() + questionObj.question_id.toString() + (new Date().getTime()).toString() + ext;
      // let path_name = RNFS.DocumentDirectoryPath + "/" + filename;
      // await RNFS.writeFile(path_name, questionObj.answer['image'], 'base64')
      //   .then((success) => {
      //     questionsArr[currentPage].answer['image'] = "file://" + path_name;
      //   })
      //   .catch((err) => {
      //     //console.log(err.message);
      //   });

    }
    else if (questionObj.question_type === "barcode" && questionsArr[currentPage].answer['image'] && questionsArr[currentPage].answer['image'] != "") {
      questionObj.answer['image'] = await RNFS.readFile(questionsArr[currentPage].answer['image'], "base64");
      var mediaPath = questionsArr[currentPage].answer['image']
      let name = questionObj.survey_id.toString() + questionObj.question_id.toString() + (new Date().getTime()).toString()
      let filename = name + '.' + (mediaPath && mediaPath.substring(mediaPath.lastIndexOf(".") + 1));
      let path_name = RNFS.DocumentDirectoryPath + "/" + filename;
      await RNFS.writeFile(path_name, questionObj.answer['image'], 'base64')
        .then((success) => {
          questionsArr[currentPage].answer['image'] = "file://" + path_name;
        })
        .catch((err) => {
          //console.log(err.message);
        });

      // questionObj.answer['image'] = await RNFS.readFile(questionsArr[currentPage].answer['image'], "base64");
      // let name = questionsArr[currentPage].answer['image'];
      // let ext = name.substring(name.lastIndexOf("."), name.length);
      // let filename = questionObj.survey_id.toString() + questionObj.question_id.toString() + (new Date().getTime()).toString() + ext;
      // let path_name = RNFS.DocumentDirectoryPath + "/" + filename;
      // await RNFS.writeFile(path_name, questionObj.answer['image'], 'base64')
      //   .then((success) => {
      //     questionsArr[currentPage].answer['image'] = "file://" + path_name;
      //   })
      //   .catch((err) => {
      //     //console.log(err.message);
      //   });

    }

    if (questionObj.question_type === "scale" && questionObj.answer && questionObj.answer.selected_option) {
      let options = questionObj.answer.selected_option;
      for (let l = 0; l < options.length; l++) {
        if (options[l].image_id && options[l].image_id != "" && options[l].remote_image_id && options[l].remote_image_id != "") {
          questionObj.answer.selected_option[l].image_id = options[l].remote_image_id;
        }
        if (options[l].image && options[l].image.image_id && options[l].image.image_id != "" && options[l].image.remote_image_id && options[l].image.remote_image_id != "") {
          questionObj.answer.selected_option[l].image.image_id = options[l].image.remote_image_id;
        }

      }
    }

    if (questionObj.question_type === "choice" && questionObj.answer && questionObj.answer.label_image && questionObj.answer.remote_label_image
      && questionObj.answer.label_image != "" && questionObj.answer.remote_label_image != "") {
      questionObj.answer.label_image = questionObj.answer.remote_label_image;
    }

    if (questionObj.question_type === "choice" && questionObj.answer && questionObj.answer.selected_option) {
      let options = questionObj.answer.selected_option;
      for (let l = 0; l < options.length; l++) {
        if (options[l].label_image && options[l].label_image != "" && options[l].remote_label_image && options[l].remote_label_image != "") {
          questionObj.answer.selected_option[l].label_image = options[l].remote_label_image;
        }
        if (options[l].sub_label_image && options[l].sub_label_image != "" && options[l].remote_sub_label_image && options[l].remote_sub_label_image != "") {
          questionObj.answer.selected_option[l].sub_label_image = options[l].remote_sub_label_image;
        }
      }
    }

    if (questionObj.question_type !== "gps" && questionObj.question_type !== "info" && questionsArr[currentPage].properties.refcode) {
      questionObj.answer.refcode = questionsArr[currentPage].properties.refcode;
    }

    /** set forcefully offline if user profile set offine true then survey submit should be offline*/
    let setOffline = await AsyncStorage.getItem('setOffline') || false;  // not in use
    await NetInfo.fetch().then(async (state) => {
      status = state.isConnected ? "online" : "offline";
      if (status === "online" && this.state.isSlowNetwork != true) {
        //this.saveSurvey()
        if (Platform.OS == 'ios') {
          //  this.postAnswerCall(url, questionObj, questionsArr, currentPage, isSubmit)
          await axios
            .post(url, questionObj, {
              headers: {
                "Content-Type": "application/json",
                Auth: apiKey
              },
              timeout: Constants.TIMEOUT
            })
            .then(response => {
              questionResponseQue[questionsArr[currentPage].questionID] = true;
              // this.state.questionsArr[currentPage].isUpdated = false;
              // this.state.questionsArr[currentPage].isSubmited = true;  //check if meadia sucessfully uploaded
              questionsArr[currentPage].isUpdated = false;
              questionsArr[currentPage].isSubmited = true;
              if (response.data.survey_answer_tag_id && response.data.survey_answer_tag_id > -1) {
                questionObj.survey_answer_tag_id = response.data.survey_answer_tag_id;
                questionsArr[currentPage].survey_answer_tag_id = response.data.survey_answer_tag_id;
                //Constants.saveKey('id_inp_' + mid, response.data.survey_answer_tag_id.toString());
              }
              if (backBtnFired === true) {
                this.onBackButtonPressAndroid();
              }

              if (questionObj.question_type == "capture") {
                questionObj.answer['image'] = questionsArr[currentPage].answer['image'];

              } else if (questionObj.question_type == "barcode") {
                questionObj.answer['image'] = questionsArr[currentPage].answer['image']

              } else if (questionObj.question_type == "upload") {
                questionObj.answer['media'] = questionsArr[currentPage].answer['media']

              }
              if (tmpList.length > 0) {
                let match = false;
                for (let k = 0; k < tmpList.length; k++) {
                  if (tmpList[k].question_id == questionObj.question_id && !tmpList[k].noreturn
                    && !tmpList[k].loop_number && !questionObj.loop_number && !tmpList[k].loop_set && !questionObj.loop_set) {
                    match = true;
                    tmpList[k].answer = questionObj.answer;
                  } else if (tmpList[k].question_id == questionObj.question_id && !tmpList[k].noreturn
                    && tmpList[k].loop_number && questionObj.loop_number && tmpList[k].loop_number == questionObj.loop_number
                    && tmpList[k].loop_triggered_qid == questionObj.loop_triggered_qid
                    && tmpList[k].loop_set == questionObj.loop_set) {
                    match = true;
                    tmpList[k].answer = questionObj.answer;
                  }

                }
                if (match === false) {
                  tmpList.push(questionObj);
                }
                if (isSubmit === false) {
                  Constants.saveKey("inp_" + mid, JSON.stringify(tmpList));
                }
              } else {
                tmpList.push(questionObj)
                if (isSubmit === false) {
                  Constants.saveKey("inp_" + mid, JSON.stringify(tmpList));
                }
              }

              /** Logfile TempCode*/
              this.storeLogFile(questionObj, true, response.data, true, true, isSubmit === true ? true : false)

              if (isSubmit === true) {

                let delList = [];
                for (var j = 0; j < tmpList.length; j++) {
                  let dquestionObj = tmpList[j];
                  if (dquestionObj.question_type === "upload" && dquestionObj.answer && dquestionObj.answer['media'] && dquestionObj.answer['media'] != '') {
                    delList.push(dquestionObj.answer['media']);
                  }
                  else if (dquestionObj.question_type === "capture" && dquestionObj.answer && dquestionObj.answer['image'] && dquestionObj.answer['image'] != '') {
                    delList.push(dquestionObj.answer['image']);
                  }
                  else if (dquestionObj.question_type === "barcode" && dquestionObj.answer && dquestionObj.answer['image'] && dquestionObj.answer['image'] != '') {
                    delList.push(dquestionObj.answer['image']);
                  }
                }
                tmpList = [];
                this.deleteItem(delList);
                Constants.saveKey("inp_" + mid, JSON.stringify(tmpList));
                let mission_id = this.state.missionId.toString() + '_LastAccess';
                Constants.saveKey(mission_id, '');

                /** increase count for the online submission by per user once submit survey 
                    for managing no of submition and number of submision per user
                */
                if (missionObject != null) {
                  let mData = JSON.parse(missionObject);
                  mData && mData.map((obj) => {
                    if (obj.id == this.state.missionId.toString()) {
                      obj['totalSubmissionByuser'] = (obj.totalSubmissionByuser ? obj.totalSubmissionByuser : 0) + 1;
                    }
                  })
                  Constants.saveKey("missionData", JSON.stringify(mData))
                }

                // //by-k
                // if (enableOfflineBackup && JSON.parse(enableOfflineBackup) == true) {
                //   /** if survey is kept as a backup no matter user is online or offline when 
                //     offline mission back toggle is enable */
                //   let missionTempData = missionObject && JSON.parse(missionObject) || []
                //   let selectedMission = missionTempData && missionTempData.filter((obj) => {
                //     return obj.id == this.state.missionId.toString();
                //   });
                //   let sub_key = mid + "_" + new Date().getTime();
                //   let offlineArray = this.removeImagedataFromInformationQuestion(questionsArr)
                //   let object = {
                //     mission_id: selectedMission[0].id,
                //     mission_name: selectedMission[0].mission_name,
                //     surveyData: questionBackupArr && questionBackupArr.length > 0 ? questionBackupArr.concat(offlineArray) : offlineArray,
                //     sub_key: sub_key,  //uniqid added for every survey submission
                //     isSynced: true,
                //     isOffline: false
                //   }
                //   offlineExportArray.push(object)
                //   Constants.saveKey('offlineExport', JSON.stringify(offlineExportArray))
                // }
                // else {
                //   /** if survey is not Kept as backup then clear files*/
                //   this.deleteItem(delList);
                // }

                setTimeout(() => {
                  this.setState({ isSubmit: false });
                  this.surveyCompletion("inp_" + mid);
                }, 500);
              } else if (noReturn && noReturn == 1) {
                this.checkNoReturnQues(questionsArr[currentPage], currentPage, isFromRetry);
              }
            })
            .catch(error => {
              /** Logfile TempCode*/
              this.storeLogFile(questionObj, false, error.response, true, true, isSubmit === true ? true : false)
              questionResponseQue[questionsArr[currentPage].questionID] = true;
              if (backBtnFired === true) {
                this.onBackButtonPressAndroid();
              }
              if (isSubmit === true) {
                this.setState({ isSubmit: false, isNoReturncheck: false });
                if (error.response.data.hasOwnProperty("mandatoryError")) {
                  // Constants.showSnack(error.response.data.mandatoryError)
                  this.showMandatoryError(error.response.data.mandatoryError, false)
                }
                else {
                  // Constants.showSnack('Server Error occurred in submitting the survey');
                  Constants.showSnack(this.state.translation[this.state.Language].Survey_Submitting_Error);
                }

              } else {
                this.setState({ isSubmit: false, isNoReturncheck: false });
                // Constants.showSnack(String.postingError + questionsArr[currentPage].properties.question);
                Constants.showSnack(this.state.translation_common[this.state.Language].Posting_Error, true).then(() => {
                  this.decrement('swipe', 100)
                });
              }

            });
        }
        else {
          if (questionObj.question_type != "upload" || (questionObj.question_type == "upload" && questionObj.answer && questionObj.answer.media_type != 'video')) {
            await axios
              .post(url, questionObj, {
                headers: {
                  "Content-Type": "application/json",
                  Auth: apiKey
                },
                timeout: Constants.TIMEOUT
              })
              .then(response => {
                questionResponseQue[questionsArr[currentPage].questionID] = true;
                // this.state.questionsArr[currentPage].isUpdated = false;
                // this.state.questionsArr[currentPage].isSubmited = true
                questionsArr[currentPage].isUpdated = false;
                questionsArr[currentPage].isSubmited = true;
                if (response.data.survey_answer_tag_id && response.data.survey_answer_tag_id > -1) {
                  questionObj.survey_answer_tag_id = response.data.survey_answer_tag_id;
                  questionsArr[currentPage].survey_answer_tag_id = response.data.survey_answer_tag_id
                  //Constants.saveKey('id_inp_' + mid, response.data.survey_answer_tag_id.toString());
                }
                if (backBtnFired === true) {
                  this.onBackButtonPressAndroid();
                }

                if (questionObj.question_type == "capture") {
                  questionObj.answer['image'] = questionsArr[currentPage].answer['image'];

                } else if (questionObj.question_type == "barcode") {
                  questionObj.answer['image'] = questionsArr[currentPage].answer['image']

                } else if (questionObj.question_type == "upload") {
                  questionObj.answer['media'] = questionsArr[currentPage].answer['media']

                }
                if (tmpList.length > 0) {
                  let match = false;
                  for (let k = 0; k < tmpList.length; k++) {
                    if (tmpList[k].question_id == questionObj.question_id && !tmpList[k].noreturn
                      && !tmpList[k].loop_number && !questionObj.loop_number && !tmpList[k].loop_set && !questionObj.loop_set) {
                      match = true;
                      tmpList[k].answer = questionObj.answer;
                    } else if (tmpList[k].question_id == questionObj.question_id && !tmpList[k].noreturn
                      && tmpList[k].loop_number && questionObj.loop_number && tmpList[k].loop_number == questionObj.loop_number
                      && tmpList[k].loop_triggered_qid == questionObj.loop_triggered_qid
                      && tmpList[k].loop_set == questionObj.loop_set) {
                      match = true;
                      tmpList[k].answer = questionObj.answer;
                    }

                  }
                  if (match === false) {
                    tmpList.push(questionObj);
                  }
                  if (isSubmit === false) {
                    Constants.saveKey("inp_" + mid, JSON.stringify(tmpList));
                  }
                } else {
                  tmpList.push(questionObj)
                  if (isSubmit === false) {
                    Constants.saveKey("inp_" + mid, JSON.stringify(tmpList));
                  }
                }

                /** Logfile TempCode*/
                this.storeLogFile(questionObj, true, response.data, false, true, isSubmit === true ? true : false)

                if (isSubmit === true) {

                  let delList = [];
                  for (var j = 0; j < tmpList.length; j++) {
                    let dquestionObj = tmpList[j];
                    if (dquestionObj.question_type === "upload" && dquestionObj.answer && dquestionObj.answer['media'] && dquestionObj.answer['media'] != '') {
                      delList.push(dquestionObj.answer['media']);
                    }
                    else if (dquestionObj.question_type === "capture" && dquestionObj.answer && dquestionObj.answer['image'] && dquestionObj.answer['image'] != '') {
                      delList.push(dquestionObj.answer['image']);
                    }
                    else if (dquestionObj.question_type === "barcode" && dquestionObj.answer && dquestionObj.answer['image'] && dquestionObj.answer['image'] != '') {
                      delList.push(dquestionObj.answer['image']);
                    }
                  }
                  tmpList = [];
                  this.deleteItem(delList);
                  Constants.saveKey("inp_" + mid, JSON.stringify(tmpList));
                  let mission_id = this.state.missionId.toString() + '_LastAccess';
                  Constants.saveKey(mission_id, '');

                  /** increase count for the online submission by per user once submit survey 
                  for managing no of submition and number of submision per user
                  */
                  if (missionObject != null) {
                    let mData = JSON.parse(missionObject);
                    mData && mData.map((obj) => {
                      if (obj.id == this.state.missionId.toString()) {
                        obj['totalSubmissionByuser'] = (obj.totalSubmissionByuser ? obj.totalSubmissionByuser : 0) + 1;
                      }
                    })
                    Constants.saveKey("missionData", JSON.stringify(mData))
                  }


                  // //by-k
                  // if (enableOfflineBackup && JSON.parse(enableOfflineBackup) == true) {
                  //   /** if survey is kept as a backup no matter user is online or offline when 
                  //  offline mission back toggle is enable */
                  //   let missionTempData = missionObject && JSON.parse(missionObject) || []
                  //   let selectedMission = missionTempData && missionTempData.filter((obj) => {
                  //     return obj.id == this.state.missionId.toString();
                  //   });
                  //   let sub_key = mid + "_" + new Date().getTime();
                  //   let offlineArray = this.removeImagedataFromInformationQuestion(questionsArr)
                  //   let object = {
                  //     mission_id: selectedMission[0].id,
                  //     mission_name: selectedMission[0].mission_name,
                  //     surveyData: questionBackupArr && questionBackupArr.length > 0 ? questionBackupArr.concat(offlineArray) : offlineArray,
                  //     sub_key: sub_key,  //uniqid added for every survey submission
                  //     isSynced: true,
                  //     isOffline: false
                  //   }
                  //   offlineExportArray.push(object)
                  //   Constants.saveKey('offlineExport', JSON.stringify(offlineExportArray))
                  // }
                  // else {
                  //   /** if survey is not Kept as backup then clear files*/
                  //   this.deleteItem(delList);
                  // }


                  setTimeout(() => {
                    this.setState({ isSubmit: false });
                    this.surveyCompletion("inp_" + mid);
                  }, 500);
                } else if (noReturn && noReturn == 1) {
                  this.checkNoReturnQues(questionsArr[currentPage], currentPage, isFromRetry);
                }
              })
              .catch(error => {
                /** Logfile TempCode*/
                this.storeLogFile(questionObj, false, error.response, false, true, isSubmit === true ? true : false)
                console.log('Error is', error)
                questionResponseQue[questionsArr[currentPage].questionID] = true;
                if (backBtnFired === true) {
                  this.onBackButtonPressAndroid();
                }
                if (isSubmit === true) {
                  this.setState({ isSubmit: false, isNoReturncheck: false });
                  if (error.response.data.hasOwnProperty("mandatoryError")) {
                    //Constants.showSnack(error.response.data.mandatoryError)
                    this.showMandatoryError(error.response.data.mandatoryError, false)
                  }
                  else {
                    //Constants.showSnack('Server Error occurred in submitting the survey');
                    Constants.showSnack(this.state.translation[this.state.Language].Survey_Submitting_Error);
                  }

                } else {
                  this.setState({ isSubmit: false, isNoReturncheck: false });
                  // Constants.showSnack(String.postingError + questionsArr[currentPage].properties.question);
                  Constants.showSnack(this.state.translation_common[this.state.Language].Posting_Error, true).then(() => {
                    this.decrement('swipe', 100)
                  });
                }

              });
          } else {
            //multi part upload
            let param = [
              //the value of name depends on the key from server
              { name: 'file', filename: upload_filename, type: 'video/mp4', data: RNFetchBlob.wrap(upload_file) },
              { name: 'metadata', data: JSON.stringify(questionObj) }
            ]
            await RNFetchBlob.fetch('POST', url, {
              "Content-Type": "multipart/form-data",
              Auth: apiKey
            }, [
              //the value of name depends on the key from server
              { name: 'file', filename: upload_filename, type: 'video/mp4', data: RNFetchBlob.wrap(upload_file) },
              { name: 'metadata', data: JSON.stringify(questionObj) }
            ])
              .then(response => response.json())
              .then(response => {
                if (response.status === 201) {

                  questionResponseQue[questionsArr[currentPage].questionID] = true;
                  // this.state.questionsArr[currentPage].isUpdated = false;
                  // this.state.questionsArr[currentPage].isSubmited = true;
                  questionsArr[currentPage].isUpdated = false;
                  questionsArr[currentPage].isSubmited = true;
                  if (response.survey_answer_tag_id && response.survey_answer_tag_id > -1) {
                    questionObj.survey_answer_tag_id = response.survey_answer_tag_id;
                    questionsArr[currentPage].survey_answer_tag_id = response.survey_answer_tag_id
                    //Constants.saveKey('id_inp_' + mid, response.data.survey_answer_tag_id.toString());
                  }
                  if (backBtnFired === true) {
                    this.onBackButtonPressAndroid();
                  }

                  if (questionObj.question_type == "capture") {
                    questionObj.answer['image'] = questionsArr[currentPage].answer['image'];

                  } else if (questionObj.question_type == "barcode") {
                    questionObj.answer['image'] = questionsArr[currentPage].answer['image']

                  } else if (questionObj.question_type == "upload") {
                    questionObj.answer['media'] = questionsArr[currentPage].answer['media']

                  }
                  if (tmpList.length > 0) {
                    let match = false;
                    for (let k = 0; k < tmpList.length; k++) {
                      if (tmpList[k].question_id == questionObj.question_id && !tmpList[k].noreturn
                        && !tmpList[k].loop_number && !questionObj.loop_number && !tmpList[k].loop_set && !questionObj.loop_set) {
                        match = true;
                        tmpList[k].answer = questionObj.answer;
                      } else if (tmpList[k].question_id == questionObj.question_id && !tmpList[k].noreturn
                        && tmpList[k].loop_number && questionObj.loop_number && tmpList[k].loop_number == questionObj.loop_number
                        && tmpList[k].loop_triggered_qid == questionObj.loop_triggered_qid
                        && tmpList[k].loop_set == questionObj.loop_set) {
                        match = true;
                        tmpList[k].answer = questionObj.answer;
                      }

                    }
                    if (match === false) {
                      tmpList.push(questionObj);
                    }
                    if (isSubmit === false) {
                      Constants.saveKey("inp_" + mid, JSON.stringify(tmpList));
                    }
                  } else {
                    tmpList.push(questionObj)
                    if (isSubmit === false) {
                      Constants.saveKey("inp_" + mid, JSON.stringify(tmpList));
                    }
                  }

                  /** Logfile TempCode*/
                  this.storeLogFile(questionObj, true, response, false, true, isSubmit === true ? true : false)

                  if (isSubmit === true) {

                    let delList = [];
                    for (var j = 0; j < tmpList.length; j++) {
                      let dquestionObj = tmpList[j];
                      if (dquestionObj.question_type === "upload" && dquestionObj.answer && dquestionObj.answer['media'] && dquestionObj.answer['media'] != '') {
                        delList.push(dquestionObj.answer['media']);
                      }
                      else if (dquestionObj.question_type === "capture" && dquestionObj.answer && dquestionObj.answer['image'] && dquestionObj.answer['image'] != '') {
                        delList.push(dquestionObj.answer['image']);
                      }
                      else if (dquestionObj.question_type === "barcode" && dquestionObj.answer && dquestionObj.answer['image'] && dquestionObj.answer['image'] != '') {
                        delList.push(dquestionObj.answer['image']);
                      }
                    }
                    tmpList = [];
                    this.deleteItem(delList);
                    Constants.saveKey("inp_" + mid, JSON.stringify(tmpList));
                    let mission_id = this.state.missionId.toString() + '_LastAccess';
                    Constants.saveKey(mission_id, '');

                    /** increase count for the online submission by per user once submit survey 
                       for managing no of submition and number of submision per user
                    */
                    if (missionObject != null) {
                      let mData = JSON.parse(missionObject);
                      mData && mData.map((obj) => {
                        if (obj.id == this.state.missionId.toString()) {
                          obj['totalSubmissionByuser'] = (obj.totalSubmissionByuser ? obj.totalSubmissionByuser : 0) + 1;
                        }
                      })
                      Constants.saveKey("missionData", JSON.stringify(mData))
                    }

                    // //by-k
                    // if (enableOfflineBackup && JSON.parse(enableOfflineBackup) == true) {
                    //   let missionTempData = missionObject && JSON.parse(missionObject) || []
                    //   let selectedMission = missionTempData && missionTempData.filter((obj) => {
                    //     return obj.id == this.state.missionId.toString();
                    //   });
                    //   let sub_key = mid + "_" + new Date().getTime();
                    //   let offlineArray = this.removeImagedataFromInformationQuestion(questionsArr)
                    //   let object = {
                    //     mission_id: selectedMission[0].id,
                    //     mission_name: selectedMission[0].mission_name,
                    //     surveyData: questionBackupArr && questionBackupArr.length > 0 ? questionBackupArr.concat(offlineArray) : offlineArray,
                    //     sub_key: sub_key,  //uniqid added for every survey submission
                    //     isSynced: true,
                    //     isOffline: false
                    //   }
                    //   offlineExportArray.push(object)
                    //   Constants.saveKey('offlineExport', JSON.stringify(offlineExportArray))
                    // } else {
                    //   /** if survey is not Kept as backup then clear files*/
                    //   this.deleteItem(delList);
                    // }


                    setTimeout(() => {
                      this.setState({ isSubmit: false });
                      this.surveyCompletion("inp_" + mid);
                    }, 500);
                  } else if (noReturn && noReturn == 1) {
                    this.checkNoReturnQues(questionsArr[currentPage], currentPage, isFromRetry);
                  }
                } else {

                  questionResponseQue[questionsArr[currentPage].questionID] = true;
                  if (backBtnFired === true) {
                    this.onBackButtonPressAndroid();
                  }
                  if (isSubmit === true) {
                    this.setState({ isSubmit: false, isNoReturncheck: false });
                    if (response.mandatoryError) {
                      //Constants.showSnack(response.mandatoryError)
                      this.showMandatoryError(response.mandatoryError, false)
                    }
                    else {
                      // Constants.showSnack('Server Error occurred in submitting the survey');
                      Constants.showSnack(this.state.translation[this.state.Language].Survey_Submitting_Error);
                    }

                  } else {
                    this.setState({ isSubmit: false, isNoReturncheck: false });
                    // Constants.showSnack(String.postingError + questionsArr[currentPage].properties.question);
                    Constants.showSnack(this.state.translation_common[this.state.Language].Posting_Error, true).then(() => {
                      this.decrement('swipe', 100)
                    });
                  }
                }
              })
              .catch(error => {
                /** Logfile TempCode*/
                this.storeLogFile(questionObj, false, error.response, false, true, isSubmit === true ? true : false)
                questionResponseQue[questionsArr[currentPage].questionID] = true;
                if (backBtnFired === true) {
                  this.onBackButtonPressAndroid();
                }
                if (isSubmit === true) {
                  this.setState({ isSubmit: false, isNoReturncheck: false });
                  // Constants.showSnack('Server Error occurred in submitting the survey');
                  Constants.showSnack(this.state.translation[this.state.Language].Survey_Submitting_Error);

                } else {
                  this.setState({ isSubmit: false, isNoReturncheck: false });
                  // Constants.showSnack(String.postingError + questionsArr[currentPage].properties.question);
                  Constants.showSnack(this.state.translation_common[this.state.Language].Posting_Error, true).then(() => {
                    this.decrement('swipe', 100)
                  });
                }
              });

          }
        }
      } else {
        //this.saveSurvey()
        questionResponseQue[questionsArr[currentPage].questionID] = true;
        if (backBtnFired === true) {
          this.onBackButtonPressAndroid();
        }
        let subExceeded = false;
        if (missionObject != null) {
          let mData = JSON.parse(missionObject);

          for (let i = 0; i < mData.length; i++) {
            if (mData[i].id == this.state.missionId && (mData[i].per_user_submission_type === 'single' && mData[i].totalSubmissionByuser > 0)) {
              subExceeded = true;
            }
            else if (mData[i].id == this.state.missionId && (mData[i].per_user_submission_type === 'multiple' &&
              mData[i].no_submissions_per_user > 0 && mData[i].totalSubmissionByuser >= mData[i].no_submissions_per_user)) {
              subExceeded = true;
            } else if (mData[i].id == this.state.missionId && (mData[i].submission > 0 &&
              mData[i].user_submission >= mData[i].submission)) {
              subExceeded = true;
            }
          }

        }

        if (subExceeded === false) {
          if (questionObj.question_type == "capture") {
            questionObj.answer['image'] = questionsArr[currentPage].answer['image'];

          } else if (questionObj.question_type == "barcode") {
            questionObj.answer['image'] = questionsArr[currentPage].answer['image']

          } else if (questionObj.question_type == "upload") {
            questionObj.answer['media'] = questionsArr[currentPage].answer['media']

          }
          let sub_key = mid + "_" + new Date().getTime();
          if (tmpList.length > 0) {
            let match = false;
            for (let k = 0; k < tmpList.length; k++) {
              if (tmpList[k].question_id == questionObj.question_id && !tmpList[k].noreturn
                && !tmpList[k].loop_number && !questionObj.loop_number && !tmpList[k].loop_set && !questionObj.loop_set) {
                match = true;
                tmpList[k].answer = questionObj.answer;
                if (isSubmit === true) {
                  tmpList[k].sub_key = sub_key;
                }
              } else if (tmpList[k].question_id == questionObj.question_id && !tmpList[k].noreturn
                && tmpList[k].loop_number && questionObj.loop_number && tmpList[k].loop_number == questionObj.loop_number
                && tmpList[k].loop_triggered_qid == questionObj.loop_triggered_qid
                && tmpList[k].loop_set == questionObj.loop_set) {
                match = true;
                tmpList[k].answer = questionObj.answer;
                if (isSubmit === true) {
                  tmpList[k].sub_key = sub_key;
                }
              }
            }
            if (match === false) {
              if (isSubmit === true) {
                questionObj.sub_key = sub_key;
              }
              tmpList.push(questionObj);
            }
            if (isSubmit === false) {
              Constants.saveKey("inp_" + mid, JSON.stringify(tmpList));
            }
          } else {
            if (isSubmit === true) {
              questionObj.sub_key = sub_key;
            }
            tmpList.push(questionObj)
            if (isSubmit === false) {
              Constants.saveKey("inp_" + mid, JSON.stringify(tmpList));
            }
          }
          this.state.questionsArr[currentPage].isUpdated = false;
          if (isSubmit === true) {
            //let sub_key = mid + "_" + new Date().getTime();
            Constants.saveKey(sub_key, JSON.stringify(tmpList))
            if (keysList != null) {
              let keys = JSON.parse(keysList);
              keys.push(sub_key);
              Constants.saveKey('ans_keys_list', JSON.stringify(keys))
            } else {
              let keys = [];
              keys.push(sub_key);
              Constants.saveKey('ans_keys_list', JSON.stringify(keys))
            }
            //await this.deleteItem("inp_" + mid, "id_inp_" + mid);
            if (missionObject != null) {
              let mData = JSON.parse(missionObject);

              let offlineArray = this.removeImagedataFromInformationQuestion(this.state.questionsArr)
              for (let i = 0; i < mData.length; i++) {
                if (mData[i].id == this.state.missionId) {
                  mData[i].user_submission = mData[i].user_submission + 1;
                  mData[i]['totalSubmissionByuser'] = (mData[i].totalSubmissionByuser ? mData[i].totalSubmissionByuser : 0) + 1
                  //mData[i].total_submissionDone_perUser = (mData[i].total_submissionDone_perUser ? mData[i].total_submissionDone_perUser : 0) + 1;
                  //by-k
                  let object = {
                    mission_id: mData[i].id,
                    mission_name: mData[i].mission_name,
                    surveyData: this.state.questionBackupArr && this.state.questionBackupArr.length > 0 ? this.state.questionBackupArr.concat(offlineArray) : offlineArray,
                    sub_key: sub_key,  //uniqid added for every survey submission
                    isSynced: false,
                    isOffline: true
                  }
                  offlineExportArray.push(object)

                }
              }
              Constants.saveKey("missionData", JSON.stringify(mData))

              Constants.saveKey('offlineExport', JSON.stringify(offlineExportArray))
            }

            //console.log(JSON.stringify(tmpList));
            tmpList = [];
            Constants.saveKey("inp_" + mid, JSON.stringify(tmpList))
            let mission_id = this.state.missionId.toString() + '_LastAccess';
            Constants.saveKey(mission_id, '');

            setTimeout(() => {
              this.setState({ isSubmit: false });
              this.surveyCompletion("inp_" + mid);
            }, 500);
          } else if (noReturn && noReturn == 1) {
            this.checkNoReturnQues(questionsArr[currentPage], currentPage, isFromRetry);
          }
          else {
            this.setState({ isSubmit: false, isNoReturncheck: false });
          }
          /** Logfile TempCode*/
          this.storeLogFile(questionObj, true, 'Offline Submited', Platform.OS == 'ios' ? true : false, false, isSubmit === true ? true : false)
        } else {
          this.setState({ isSubmit: false, isNoReturncheck: false });
          Constants.showSnack(this.state.translation[this.state.Language].Submission_Exceeded);
          /** Logfile TempCode*/
          this.storeLogFile(questionObj, true, 'submition exeeded', Platform.OS == 'ios' ? true : false, false, isSubmit === true ? true : false)
        }
      }
    });

  }


  /** Logfile TempCode*/
  /** Store response and request in log file for temporary to catch submit and disappear issue */
  async storeLogFile(questionObj, isSucess, resposeObj, isIos, isOnline, isSubmitLast) {
    let logPath = await this.getLogPath()
    console.log('Log file is', logPath)
    let readFiledata = ''
    if (await RNFS.exists(logPath)) {
      readFiledata = await RNFS.readFile(logPath, "utf8");
    }
    let surveySubmitedStatus = isSubmitLast == true ? "Survey submitted successfully with tag id ==" + questionObj.survey_answer_tag_id : ""

    let strWritedata = readFiledata + '\n \n'
      + "Mission_Name: " + missionName + '\n'
      + "Mission_ID: " + this.state.missionId + '\n \n'
      + "REQUEST : " + new Date() + '\n \n'
      + JSON.stringify(questionObj) + "\n \n"
      + "Response: " + JSON.stringify(resposeObj) + '\n'
      + "is_Sucess= " + isSucess + '\n'
      + "is_Ios= " + isIos + '\n'
      + "is_Online= " + isOnline + '\n'
      + "Is_Submit= " + isSubmitLast + '\n'
      + surveySubmitedStatus + '\n'
      + "======================================================================"


    RNFS.writeFile(logPath, strWritedata, 'utf8')
      .then(async (success) => {
        console.log('success', success)
      })
      .catch((err) => {
        console.log('Error in write file', err.message);
      });
  }

  /** Logfile TempCode*/
  async getLogPath() {
    let logPath = ''
    if (Platform.OS == 'android') {
      logPath = RNFS.DownloadDirectoryPath + "/" + missionName + "_RequestLog.txt"
    }
    else {
      await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/LogFile/`)
      logPath = RNFS.DocumentDirectoryPath + "/" + "LogFile" + "/" + missionName + "_RequestLog.txt";
    }
    return logPath
  }

  /** Logfile TempCode*/
  async getMissionLogPath() {
    let logPath = ""
    if (Platform.OS == 'android') {
      logPath = RNFS.DownloadDirectoryPath + "/" + "MissionLog.txt"
    }
    else {
      logPath = RNFS.DocumentDirectoryPath + "/" + "LogFile" + "/" + "MissionLog.txt";
    }
    return logPath
  }

  /** Logfile TempCode*/
  supportActionClieck = async () => {
    let logPath = await this.getLogPath()
    let missionLogPath = await this.getMissionLogPath()
    let attachmentsObj = {
      path: logPath,
      type: 'text',
    }
    let attachmentsObj1 = {
      path: missionLogPath,
      type: 'text',
    }

    Mailer.mail({
      subject: 'Flexicollect Support Request',
      recipients: ['flexicollect-support@eolasinternational.com'],
      ccRecipients: [''],
      bccRecipients: [''],
      body: '',
      //customChooserTitle: "This is my new title", // Android only (defaults to "Send Mail")
      isHTML: true,
      attachments: [attachmentsObj, attachmentsObj1]
    }, (error, event) => {
      console.log('email send error is', error)
    });
  }

  /** temp solution : Remove imaeg data from the infomation element infotext with image
   *  - so to remove size issue in storing image data in offline storage 
   *  - remove that data from text and image tag from html content
   */
  removeImagedataFromInformationQuestion(getOfflineArray) {
    if (getOfflineArray.length > 0) {
      getOfflineArray.map(obj => {
        let infoText = obj.properties.info_text
        if (infoText && infoText.indexOf('<img') > -1) {
          var mySubString = infoText.substring(
            infoText.indexOf("<img"),
            infoText.lastIndexOf("\"/>")
          );
          let newText = infoText.replace(mySubString, "<img src=\"");
          obj.properties.info_text = newText ? newText : ''
        }
      })
    }
    return getOfflineArray
  }

  /** mandatory element error alert */
  showMandatoryError(message, isFromNoReturn, uptoNoreturnArray, currentQuesIndx) {
    if (!isAlertPresent) {
      isAlertPresent = true;
      Alert.alert(
        '',
        message,
        [
          {
            text: this.state.translation[this.state.Language].Try_Again, onPress: () => { this.mandatoryAlertTryAgainAction(isFromNoReturn, uptoNoreturnArray, currentQuesIndx) }
          }
        ],
        { cancelable: false },
      );
    }
  }
  /** Alert button action */
  mandatoryAlertTryAgainAction = async (isFromNoReturn, uptoNoreturnArray, currentQuesIndx) => {
    /** Case 1 - if no return is not there and normal array is there 
    *  Case 2 - if no return is there then only upto no return array checked
    *  All that case will concate array and check for remainign element and try again to upload
    */
    let concatArray = this.state.questionBackupArr && this.state.questionBackupArr.concat(uptoNoreturnArray && uptoNoreturnArray.length > 0 ? uptoNoreturnArray : this.state.questionsArr)
    let filteredQues = this.removeHiddenQuestion(concatArray);
    let remainingElement = this.checkMandatoryQuestionIsRemaining(filteredQues)
    if (remainingElement && remainingElement.length > 0) {
      if (isFromNoReturn) {
        /** isFromNoReturn for yes  "No return" is there */
        // let lastIndexOfNoreturnObj = uptoNoreturnArray && uptoNoreturnArray.length - 1
        // remainingElement.push(lastIndexOfNoreturnObj)
        this.uploadRemaningMissingElementUntilNoReturn(remainingElement, filteredQues, currentQuesIndx)
      }
      else {
        /** false for no return is not there */
        this.uploadRemaningMissingElement(remainingElement, filteredQues)
      }
    }
    setTimeout(() => {
      isAlertPresent = false
    }, 3000);



    // if (isFromNoReturn) {
    //   //check up to no return element - and pass array based on that.
    //   console.log('No return case')
    //   let filteredQues = this.removeHiddenQuestion(uptoNoreturnArray);
    //   console.log('filteredQues send after hidden', filteredQues)
    //   let remainingElement = this.checkMandatoryQuestionIsRemaining(filteredQues)
    //   if (remainingElement && remainingElement.length > 0) {
    //     /** isFromNoReturn for yes  "No return" is not there */
    //     this.uploadRemaningMissingElementUntilNoReturn(remainingElement, filteredQues)
    //   }
    // }
    // else {
    //   console.log('Normal case')
    //   let filteredQues = this.removeHiddenQuestion(this.state.questionsArr);
    //   console.log('filteredQues lenth', filteredQues.length)
    //   console.log('this.state.questionsArr lentgh', this.state.questionsArr.length)
    //   let remainingElement = this.checkMandatoryQuestionIsRemaining(filteredQues)
    //   if (remainingElement && remainingElement.length > 0) {
    //     /** false for no return is not there */
    //     this.uploadRemaningMissingElement(remainingElement)
    //   }
    // }

  }
  checkMandatoryQuestionIsRemaining(questionsArr) {
    let arrErrorElementindex = [];
    questionsArr && questionsArr.map(async (obj, index) => {
      let properties = obj.properties
      if (properties.hasOwnProperty("mandatory") && properties.mandatory == 1) {
        /** If mandatory question and if its not added then upload from storage */
        if (obj.questionType === "input") {
          if (obj.answer && obj.answer.text && obj.answer.text != "" && obj.hasOwnProperty("isSubmited") && obj.isSubmited == true) {
          }
          else {
            arrErrorElementindex.push(index)
          }
        }
        else if (obj.questionType === "choice" && obj.properties.display_type === "dropdown") {
          if (obj.answer && ((obj.answer.label_text && obj.answer.label_text.length > 0)) && obj.hasOwnProperty("isSubmited") && obj.isSubmited == true) {
          }
          else {
            arrErrorElementindex.push(index)
          }
        }
        else if ((obj.questionType === "choice") || obj.questionType === "scale") {
          if (obj.answer && ((obj.answer.selected_option && obj.answer.selected_option.length > 0) ||
            (obj.answer.label && obj.answer.label != "")) && obj.hasOwnProperty("isSubmited") && obj.isSubmited == true) {
          }
          else {
            arrErrorElementindex.push(index)
          }
        }
        else if (obj.questionType === "upload") {
          if (obj.answer && obj.answer.media && obj.answer.media != "" && obj.hasOwnProperty("isSubmited") && obj.isSubmited == true) {
          }
          else {
            arrErrorElementindex.push(index)
          }
        } else if (obj.questionType === "capture" || obj.questionType === "barcode") {
          if (obj.answer && obj.answer.image && obj.answer.image != "" && obj.hasOwnProperty("isSubmited") && obj.isSubmited == true) {
          }
          else {
            arrErrorElementindex.push(index)
          }
        }
        else if (obj.questionType === "gps") {
          if (obj.answer && obj.answer.latitude != "" && obj.answer.longitude != "" && obj.answer.address != "" && obj.hasOwnProperty("isSubmited") && obj.isSubmited == true) {
          }
          else {
            arrErrorElementindex.push(index)
          }
        }
      }
      else {
        /** If not mandatory question then only upload question that has answer */
        if (!obj.answer || obj.hasOwnProperty("isSubmited") && obj.isSubmited == true) {
          /** case when optional condition not having answer and already submited then not add */
        }
        else {
          arrErrorElementindex.push(index)
        }
      }
    })
    return arrErrorElementindex
  }

  uploadRemaningMissingElement = async (arrRemaingIndex, retryArray) => {
    if (arrRemaingIndex && arrRemaingIndex.length > 0) {
      this.setState({ postAnswerLoader: true })
      for (let i = 0; i < arrRemaingIndex.length; i++) {
        let isSubmitstatus = i != (arrRemaingIndex.length - 1) ? false : true
        let questionObj = this.questionPostObject(arrRemaingIndex[i], retryArray);
        if (isSubmitstatus) {
          /** submit true for the last object */
          questionObj['submit'] = true
        }
        await this.postAnswerToServer(questionObj, arrRemaingIndex[i], isSubmitstatus, 0, true, retryArray)
      }
      this.setState({ postAnswerLoader: false })

      // console.log('Arrremaining id is', arrRemaingIndex)
      // const value = await Promise.allSettled(arrRemaingIndex.map(async (objID, index) => {
      //   let indexOfObj = retryArray && retryArray.findIndex(item => item.questionID === objID);
      //   if (indexOfObj) {
      //     let questionObj = this.questionPostObject(indexOfObj, retryArray);
      //     let isSubmitstatus = index != (arrRemaingIndex.length - 1) ? false : true
      //     if (isSubmitstatus) {
      //       /** submit true for the last object */
      //       questionObj['submit'] = true
      //     }
      //     await this.postAnswerToServer(questionObj, indexOfObj, isSubmitstatus, 0, true, retryArray)
      //   }
      //   // if (retryArray[index].questionID == objID) {
      //   //   let questionObj = this.questionPostObject(index, retryArray);
      //   //   let isSubmitstatus = index != (arrRemaingIndex.length - 1) ? false : true
      //   //   if (isSubmitstatus) {
      //   //     /** submit true for the last object */
      //   //     questionObj['submit'] = true
      //   //     console.log('Is submit if condition')
      //   //   }
      //   //   await this.postAnswerToServer(questionObj, index, isSubmitstatus, 0, true, retryArray)
      //   // }
      // }))
      //   .then(results => {
      //     console.log('resultls --->', results)
      //   });


      // this.setState({ postAnswerLoader: true })
      // for (let i = 0; i < arrRemaingIndex.length; i++) {
      //   let isSubmitstatus = i != (arrRemaingIndex.length - 1) ? false : true
      //   console.log("isSubmitstatusisSubmitstatus", isSubmitstatus);
      //   let questionObj = this.questionPostObject(arrRemaingIndex[i], retryArray);
      //   if (isSubmitstatus) {
      //     /** submit true for the last object */
      //     questionObj['submit'] = true
      //     console.log('Is submit if condition')
      //   }
      //   // if (questionObj.question_type != 'upload' || questionObj.question_type != 'capture' || questionObj.question_type != 'barcode') {
      //   //   await delay(i * 100)
      //   // }
      //   await this.postAnswerToServer(questionObj, arrRemaingIndex[i], isSubmitstatus, 0, true, retryArray)
      // }
      // this.setState({ postAnswerLoader: false })




      // const promises = arrRemaingIndex.map(async (objIndex, index) => {
      //   let isSubmitstatus = objIndex != (arrRemaingIndex.length - 1) ? false : true
      //   let questionObj = this.questionPostObject(objIndex, retryArray);

      //   if (questionObj.question_type != 'upload') {
      //     console.log('inside delay')
      //     await delay(1000)
      //   }
      //   await this.postAnswerToServer(questionObj, objIndex, isSubmitstatus, 0, true, retryArray)
      // });
      // const results = await getInParallel(promises);
      // console.log('results', results)



      // await Promise.all(
      //   arrRemaingIndex.map((objIndex, index) => {
      //     let isSubmitstatus = index != (arrRemaingIndex.length - 1) ? false : true
      //     let questionObj = this.questionPostObject(objIndex, retryArray);
      //     if (isSubmitstatus) {
      //       /** submit true for the last object */
      //       questionObj['submit'] = true
      //     }
      //     setTimeout(async () => {
      //       await this.postAnswerToServer(questionObj, objIndex, isSubmitstatus, 0, true, retryArray)
      //     }, 2000);
      //   })
      // )



      // let promiseBuffer = []
      // arrRemaingIndex.map(async (objIndex, index) => {
      //   try {
      //     let isSubmitstatus = index != (arrRemaingIndex.length - 1) ? false : true
      //     let questionObj = this.questionPostObject(objIndex, retryArray);
      //     if (isSubmitstatus) {
      //       /** submit true for the last object */
      //       questionObj['submit'] = true
      //     }
      //     // setTimeout(async () => {
      //     promiseBuffer.push(this.postAnswerToServer(questionObj, objIndex, isSubmitstatus, 0, true, retryArray))
      //     // }, 1000);
      //   } catch (err) {
      //     console.log('error', err)
      //   }
      // })
      // console.log('Promise buffer', promiseBuffer)
      // setTimeout(async () => {
      //   await Promise.all(promiseBuffer)
      // }, 1000);



      // Working final code
      // return await Promise.push(arrRemaingIndex.map(async (objIndex, index) => {
      //   try {
      //     let isSubmitstatus = index != (arrRemaingIndex.length - 1) ? false : true
      //     let questionObj = this.questionPostObject(objIndex, retryArray);
      //     if (isSubmitstatus) {
      //       /** submit true for the last object */
      //       questionObj['submit'] = true
      //     }
      //     //console.log('final object to submit', questionObj)
      //     return await this.postAnswerToServer(questionObj, objIndex, isSubmitstatus, 0, true, retryArray)
      //   } catch (err) {
      //     console.log('error', err)
      //   }
      // }));
    }

    /** Working code 1 */
    // if (arrRemaingIndex && arrRemaingIndex.length > 0) {
    //   Promise.all(
    //     arrRemaingIndex.map((objIndex, index) => {
    //       return new Promise((resolve) => {
    //         try {
    //           let isSubmitstatus = index != (arrRemaingIndex.length - 1) ? false : true
    //           let questionObj = this.questionPostObject(objIndex, retryArray);
    //           console.log('normal condition questionObj', questionObj)
    //           this.postAnswerToServer(questionObj, objIndex, isSubmitstatus, 0, true, retryArray)
    //           resolve()
    //         } catch (err) {
    //           console.log('error', err)
    //         }
    //       })
    //     })
    //   ).then(() => {
    //       console.log('Complete');
    //     })
    // }

    /** Working code 2 */
    // console.log('normal condition')
    // if (arrRemaingIndex && arrRemaingIndex.length > 0) {
    //   var promises = arrRemaingIndex.map(async (objIndex, index) => {
    //     try {
    //       let isSubmitstatus = index != (arrRemaingIndex.length - 1) ? false : true
    //       let questionObj = this.questionPostObject(objIndex, retryArray);
    //       console.log('normal condition questionObj', questionObj)
    //       await this.postAnswerToServer(questionObj, objIndex, isSubmitstatus, 0, true, retryArray)
    //     } catch (err) {
    //       console.log('error', err)
    //     }
    //   });
    //   await Promise.push(promises).then(function (results) {
    //     console.log("Result", results);
    //   })
    // }
  }

  uploadRemaningMissingElementUntilNoReturn = async (arrRemaingIndex, retryArray, currentQuesIndx) => {
    if (arrRemaingIndex && arrRemaingIndex.length > 0) {
      this.setState({ postAnswerLoader: true })
      for (let i = 0; i < arrRemaingIndex.length; i++) {
        let questionObj = this.questionPostObject(arrRemaingIndex[i], retryArray);
        await this.postAnswerToServer(questionObj, arrRemaingIndex[i], false, 0, true, retryArray)
      }
      this.setState({ postAnswerLoader: false })
      await this.checkNoReturnQues(retryArray[currentQuesIndx], currentQuesIndx, true)

      // return await Promise.push(arrRemaingIndex.map(async (objIndex, index) => {
      //   try {
      //     if (index == arrRemaingIndex.length - 1) {
      //       /** Question object | index | if last index then pass - no return 1 
      //        * | Previous process not check if its from retry so passed true */
      //       let questionObj = this.questionPostObject(objIndex, retryArray);
      //       return await this.postAnswerToServer(questionObj, objIndex, false, 1, true, retryArray)
      //     }
      //     else {
      //       /** Question object | index | if not last index then pass - no return 0 
      //        * | Previous process not check if its from retry so passed true */
      //       let questionObj = this.questionPostObject(objIndex, retryArray);
      //       return await this.postAnswerToServer(questionObj, objIndex, false, 0, true, retryArray)
      //     }
      //   } catch (err) {
      //     console.log('error', err)
      //   }
      // }));

      /** Working condition */
      // if (i == arrRemaingIndex.length - 1) {
      //   /** Question object | index | if last index then pass - no return 1 
      //    * | Previous process not check if its from retry so passed true */
      //   let questionObj = this.questionPostObject(arrRemaingIndex[i], retryArray);
      //   console.log('Last object', questionObj)
      //   await this.postAnswerToServer(questionObj, arrRemaingIndex[i], false, 1, true, retryArray)
      // }
      // else {
      //   /** Question object | index | if not last index then pass - no return 0 
      //    * | Previous process not check if its from retry so passed true */
      //   console.log('object at pervious index', arrRemaingIndex[i])
      //   let questionObj = this.questionPostObject(arrRemaingIndex[i], retryArray);
      //   await this.postAnswerToServer(questionObj, arrRemaingIndex[i], false, 0, true, retryArray)
      // }


      // return await Promise.push(arrRemaingIndex.map(async (objIndex, index) => {
      //   try {
      //     if (index == arrRemaingIndex.length - 1) {
      //       /** Question object | index | if last index then pass - no return 1 
      //        * | Previous process not check if its from retry so passed true */
      //       let questionObj = this.questionPostObject(objIndex, retryArray);
      //       return await this.postAnswerToServer(questionObj, objIndex, false, 1, true, retryArray)
      //     }
      //     else {
      //       /** Question object | index | if not last index then pass - no return 0 
      //        * | Previous process not check if its from retry so passed true */
      //       let questionObj = this.questionPostObject(objIndex, retryArray);
      //       return await this.postAnswerToServer(questionObj, objIndex, false, 0, true, retryArray)
      //     }
      //   } catch (err) {
      //     console.log('error', err)
      //   }
      // }));
    }


    // if (arrRemaingIndex && arrRemaingIndex.length > 0) {
    //   return await Promise.push(arrRemaingIndex.map(async (objIndex, index) => {
    //     try {
    //       if (index == arrRemaingIndex.length - 1) {
    //         /** Question object | index | if last index then pass - no return 1 
    //          * | Previous process not check if its from retry so passed true */
    //         let questionObj = this.questionPostObject(objIndex, retryArray);
    //         return await this.postAnswerToServer(questionObj, objIndex, false, 1, true, retryArray)
    //       }
    //       else {
    //         /** Question object | index | if not last index then pass - no return 0 
    //          * | Previous process not check if its from retry so passed true */
    //         let questionObj = this.questionPostObject(objIndex, retryArray);
    //         return await this.postAnswerToServer(questionObj, objIndex, false, 0, true, retryArray)
    //       }
    //     } catch (err) {
    //       console.log('error', err)
    //     }
    //   }));
    // }


    // return new Promise(async (resolve, reject) => {
    //   this.setState({ postAnswerLoader: true })
    //   for (let i = 0; i < arrRemaingIndex.length; i++) {
    //     let questionObj = this.questionPostObject(arrRemaingIndex[i], retryArray);
    //     await this.postAnswerToServer(questionObj, arrRemaingIndex[i], false, 0, true, retryArray)
    //   }
    //   this.setState({ postAnswerLoader: false })
    //   // this.checkNoReturnQues(retryArray[currentQuesIndx], currentQuesIndx, true)
    //   console.log('Resolve first condition')
    //   resolve()
    // })
  }

  /**
   * if mission submited, clear locally saved files
   * @param - filelist - all file list to remove
   */
  async deleteItem(fileList) {
    /** Logfile TempCode for delete log file*/
    let missonLogPath = await this.getMissionLogPath()
    fileList.push(missonLogPath)
    let logPath = await this.getLogPath()
    fileList.push(logPath)

    try {
      for (let i = 0; i < fileList.length; i++) {
        RNFS.unlink(fileList[i])
          .then(() => {
            //console.log('File deleted ' + fileList[i]);
          })
          .catch((err) => {
            //console.log('Error in File delete ' + fileList[i]);
            // console.log(err)
          });
      }
    } catch (error) {
      //console.log(error.message);
    }
  }

  /**
   * set navigate buttons opacity and click enable and disable
   * */
  actionForNavigationIcon(page) {
    this.setState({ pageCount: page });
    if (page === 0 && page !== this.state.arrLength - 1) {
      this.setState({
        leftArrow: 0.3,
        rightArrow: 1,
        leftDisable: true,
        rightDisable: this.state.questionsArr.length === 1
      });
    } else if (page === this.state.arrLength - 1) {
      this.setState({
        leftArrow: 1,
        rightArrow: 0.3,
        rightDisable: true,
        leftDisable: false
      });
    } else {
      this.setState({
        leftArrow: 1,
        rightArrow: 1,
        leftDisable: false,
        rightDisable: false
      });
    }
  }

  /** navigate to next question 
   * @param nextPage - next page 
   * @param questionarray - curent survey all question array 
  */
  actionForNavNextIcon(nextPage, nextExists, currentPage, page, questionsArray) {
    this.horizontalCarousel.updateViews(questionsArray.length);

    if (nextExists === false) {
      this.setState(
        {
          leftArrow: 1,
          rightArrow: 0.3,
          rightDisable: true,
          leftDisable: false,
          pageCount: nextPage,
          prevPage: currentPage,
          nextPage: page,
          questionsArr: questionsArray
        },
        _ => {
          if (nextPage > currentPage) {
            this.horizontalCarousel.goToPage(nextPage);
            LastAccess_pageCount = nextPage;
            LastAccess_prevPage = currentPage;
            LastAccess_nextPage = page;
            this.saveSurvey();
          } else {
            this.horizontalCarousel.goToPage(currentPage);
            LastAccess_pageCount = nextPage;
            LastAccess_prevPage = currentPage;
            LastAccess_nextPage = page;
            this.saveSurvey();
          }
        }
      );
    } else {
      this.setState(
        {
          leftArrow: 1,
          rightArrow: 1,
          leftDisable: false,
          rightDisable: false,
          pageCount: nextPage,
          prevPage: currentPage,
          nextPage: page,
          questionsArr: questionsArray
        },
        _ => {
          if (nextPage > currentPage) {
            this.horizontalCarousel.goToPage(nextPage);
            LastAccess_pageCount = nextPage;
            LastAccess_prevPage = currentPage;
            LastAccess_nextPage = page;
            this.saveSurvey();
          } else {
            this.horizontalCarousel.goToPage(currentPage);
            LastAccess_pageCount = nextPage;
            LastAccess_prevPage = currentPage;
            LastAccess_nextPage = page;
            this.saveSurvey();
          }
        }
      );
    }
  }

  /** navigate to previous question 
    * @param prevPage - previous page 
    * @param prevExists - check previous exist
    * @param currentPage - current page no
    * @param time - time to delay
  */
  actionForNavPrevIcon(prevPage, prevExists, currentPage, page, time) {
    if (prevExists === false) {
      this.setState(
        {
          leftArrow: 0.3,
          rightArrow: 1,
          rightDisable: false,
          leftDisable: true,
          pageCount: prevPage,
          nextPage: currentPage,
          prevPage: page
        },
        _ => {
          setTimeout(() => {
            if (prevPage > page) {
              this.horizontalCarousel.goToPage(prevPage);
            } else {
              this.horizontalCarousel.goToPage(page);
            }
          }, time)
        }
      );
    } else {
      this.setState(
        {
          leftArrow: 1,
          rightArrow: 1,
          leftDisable: false,
          rightDisable: false,
          pageCount: prevPage,
          nextPage: currentPage,
          prevPage: page
        },
        _ => {
          setTimeout(() => {
            if (prevPage > page) {
              this.horizontalCarousel.goToPage(prevPage);
            } else {
              this.horizontalCarousel.goToPage(page);
            }
          }, time)
        }
      );
    }
  }

  /** update next icon based on avaibiltiy of question */
  actionForUpdateNextIcon() {
    this.horizontalCarousel.updateViews(this.state.questionsArr.length);
    this.setState({
      leftArrow: 1,
      rightArrow: 1,
      leftDisable: false,
      rightDisable: false
    });
  }

  /**
   * Validate input type question when conditions exist in the question
   * @param {String} value User defined value
   * @param {String} matchValue Conditional Match value
   * @param {String} condition Condition Type
   */
  conditionValidation(val, matchVal, condition, target, selectedp_id, selected_id, source) {
    let isMatch = false;
    let multiple_value = true;
    const value =
      val !== null && typeof val === "string" ? val.toLowerCase() : val;
    const matchValue =
      typeof matchVal === "string" ? matchVal.toLowerCase() : matchVal;

    switch (condition) {
      case "equal":
        if (target === "Value_Multiple_Any") {
          for (let mv = 0; mv < matchVal.length; mv++) {
            if (matchVal[mv].hasOwnProperty('id')) {
              if (matchVal[mv].hasOwnProperty('p_id') && matchVal[mv].hasOwnProperty('id')) {
                if (matchVal[mv].id === selected_id && matchVal[mv].p_id === selectedp_id) {
                  isMatch = true;
                  break;
                }
              } else {
                if (matchVal[mv].id === selected_id) {
                  isMatch = true;
                  break;
                }
              }
            } else {
              let matchValue = typeof matchVal[mv].value === "string" ? matchVal[mv].value.toLowerCase() : matchVal[mv].value;
              if (matchValue === value) {
                isMatch = true;
                break;
              }
            }
          }
        } else if (target === "Value_Multiple_All") {
          for (let mv = 0; mv < matchVal.length; mv++) {
            if (matchVal[mv].hasOwnProperty('id')) {
              if (matchVal[mv].hasOwnProperty('p_id') && matchVal[mv].hasOwnProperty('id')) {
                if (matchVal[mv].id !== selected_id && matchVal[mv].p_id !== selectedp_id) {
                  multiple_value = false;
                }
              } else {
                if (matchVal[mv].id !== selected_id) {
                  multiple_value = false;
                }
              }
            } else {
              let matchValue = typeof matchVal[mv].value === "string" ? matchVal[mv].value.toLowerCase() : matchVal[mv].value;
              if (matchValue !== value) {
                multiple_value = false;
              }
            }
          }

          isMatch = multiple_value

        } else {
          if (source && source.hasOwnProperty('id')) {
            if (source.hasOwnProperty('p_id') && source.hasOwnProperty('id')) {
              isMatch = source.p_id == selectedp_id && source.id == selected_id;
            } else {
              isMatch = source.id == selected_id;
            }
          } else {
            isMatch = value == matchValue;
          }
        }
        break;
      case "notequal":
        if (target === "Value_Multiple_Any") {
          for (let mv = 0; mv < matchVal.length; mv++) {
            if (matchVal[mv].hasOwnProperty('id')) {
              if (matchVal[mv].hasOwnProperty('p_id') && matchVal[mv].hasOwnProperty('id')) {
                if (matchVal[mv].id === selected_id && matchVal[mv].p_id === selectedp_id) {
                  multiple_value = false;
                }
              }
              else {
                if (matchVal[mv].id === selected_id) {
                  multiple_value = false;
                }
              }
            } else {
              let matchValue = typeof matchVal[mv].value === "string" ? matchVal[mv].value.toLowerCase() : matchVal[mv].value;
              if (matchValue === value) {
                multiple_value = false;
              }
            }
          }
          isMatch = multiple_value
        } else if (target === "Value_Multiple_All") {
          for (let mv = 0; mv < matchVal.length; mv++) {
            if (matchVal[mv].hasOwnProperty('id')) {
              if (matchVal[mv].hasOwnProperty('p_id') && matchVal[mv].hasOwnProperty('id')) {
                if (matchVal[mv].source.p_id == selectedp_id && matchVal[mv].source.id == selected_id) {
                  multiple_value = false;
                }
              } else {
                if (matchVal[mv].id == selected_id) {
                  multiple_value = false;
                }
              }
            } else {
              let matchValue = typeof matchVal[mv].value === "string" ? matchVal[mv].value.toLowerCase() : matchVal[mv].value;
              if (matchValue == value) {
                multiple_value = false;
              }
            }
          }
          isMatch = multiple_value
        } else {
          if (source && source.hasOwnProperty('id')) {
            if (source.hasOwnProperty('p_id') && source.hasOwnProperty('id')) {
              isMatch = source.p_id != selectedp_id && source.id != selected_id;
            } else {
              isMatch = source.id != selected_id;
            }
          } else {
            isMatch = value != matchValue;
          }
        }
        break;
      case "contain":
        isMatch = value !== null && value.includes(matchValue);
        break;
      case "notcontains":
        isMatch = value !== null && !value.includes(matchValue);
        break;
      case "starts":
        isMatch = value !== null && value.startsWith(matchValue);
        break;
      case "notstarts":
        isMatch = value !== null && !value.startsWith(matchValue);
        break;
      case "ends":
        isMatch = value !== null && value.endsWith(matchValue);
        break;
      case "notends":
        isMatch = value !== null && !value.endsWith(matchValue);
        break;
      case "empty":
        isMatch = value === "" || value === null;
        break;
      case "filled":
        isMatch = value !== "" && value !== null;
        break;
      default:
        break;
    }
    return isMatch;
  }


  /**
   * Get input type "target field" question answer
   * @param {Object} selected Field question answer
   */
  inputFieldAnswer(selected) {
    let answer;
    answer = selected.answer;
    return answer;
  }

  /**
   * Get Choice type "target field" question answer
   * @param {Object} selected Field question answer
   */
  choiceFieldAnswer(selected) {
    let answer;
    let selecteAnswer = selected.answer;
    // Single choice type with multi level list
    if (
      selecteAnswer.choice_type === "single" &&
      selecteAnswer.multilevel === 1 &&
      selecteAnswer.hasOwnProperty("selected_option") &&
      selecteAnswer.selected_option.length > 0
    ) {
      answer = selecteAnswer.selected_option[0].sublabel;
      // Single choice type with single level list
    } else if (
      selecteAnswer.choice_type === "single" &&
      selecteAnswer.multilevel === 0
    ) {
      answer = selecteAnswer.label;
    }
    return answer;
  }

  /**
   * Get Capture type "target field" question answer
   * @param {Object} selected Field question answer
   * @param {Array} condition Current Question Condition
   */
  captureFieldAnswer(selected) {
    let answer;
    let selecteAnswer = selected.answer;
    // Get captured text from another question for match value
    if (selecteAnswer.hasOwnProperty("caption_text")) {
      answer = selecteAnswer.caption_text;
    } else if (selecteAnswer.hasOwnProperty("scale_image_id")) {
      answer = selecteAnswer.scale_image_id;
    }
    return answer;
  }

  /**
   * Get Scale type "target field" question answer
   * @param {Object} selected Field question answer
   */
  scaleFieldAnswer(selected) {
    let answer;
    let selecteAnswer = selected.answer;
    // Get selected answer from another question
    if (
      selecteAnswer.hasOwnProperty("selected_option") &&
      selecteAnswer.selected_option.length > 0
    ) {
      answer =
        selecteAnswer.selected_option[selecteAnswer.selected_option.length - 1]
          .value;
    }
    return answer;
  }

  /**
   * Get Barcode type "target field" question answer
   * @param {Object} selected Field question answer
   */
  barCodeFieldAnswer(selected) {
    let answer;
    let selecteAnswer = selected.answer;
    // Get captured barcode from another question
    if (selecteAnswer.hasOwnProperty("barcode_id")) {
      answer = selecteAnswer.barcode_id;
    }
    return answer;
  }

  /**
   * Get the field question answer based on type
   * @param {Object} selected Field question answer
   */
  getFieldQuesionAnswer(selected) {
    let answer;
    if (selected && selected.hasOwnProperty("questionType")) {
      let type = selected.questionType;
      if (type === "input") {
        answer = this.inputFieldAnswer(selected);
      } else if (type === "choice") {
        answer = this.choiceFieldAnswer(selected);
      } else if (type === "capture") {
        answer = this.captureFieldAnswer(selected);
      } else if (type === "scale") {
        if (
          selected.hasOwnProperty("scale_type") &&
          selected.scale_type === "scale"
        ) {
          answer = this.scaleFieldAnswer(selected);
        }
      } else if (type === "barcode") {
        answer = this.barCodeFieldAnswer(selected);
      }
    }
    return answer;
  }

  /**
   * Get target question based on user answer's
   * validate condition based on question type
   * @param {Array} conditions Conditions array
   * @param {String} answer User defined value
   */
  getConditionalTarget(
    conditions,
    answer,
    type,
    question,
    target,
    unMetTarget,
    release
  ) {

    let check = true;
    for (let i = 0; i < conditions.length; i++) {
      let match = 0;
      for (let j = 0; j < conditions[i].source.length; j++) {
        if (conditions[i].source[j].state === "" && conditions[i].target.do === "loop_set") {
          conditions[i].target.condition = true
          target.push(conditions[i].target);
          check = false;
        }
      }
    }
    if (check) {
      if ((answer && Object.keys(answer).length > 0) || (type == 'input')) {
        if (type === "input") {
          this.inputConditionalTarget(conditions, answer, target, unMetTarget);
        } else if (type === "choice") {
          this.choiceConditionalTarget(conditions, answer, target, unMetTarget, release);
        } else if (type === "capture") {
          this.captureConditionalTarget(
            conditions,
            answer,
            question,
            target,
            unMetTarget
          );
        } else if (type === "scale") {
          if (
            answer &&
            answer.hasOwnProperty("scale_type") &&
            answer.scale_type === "scale"
          ) {
            this.scaleConditionalTarget(conditions, answer, target, unMetTarget, release);
          } else if (
            answer &&
            answer.hasOwnProperty("scale_type") &&
            answer.scale_type === "table"
          ) {
            this.tableConditionalTarget(
              conditions,
              answer,
              question,
              target,
              unMetTarget
            );
          }
        } else if (type === "barcode") {
          this.barcodeConditionalTarget(conditions, answer, target, unMetTarget, release);
        }
      } else {
        for (let j = 0; j < conditions.length; j++) {
          if (release || conditions[j].target.do !== 'release') {
            unMetTarget.push(conditions[j].target);
          }
        }
      }
    }
  }


  /**
   * Input type questions Get target question based on user answer's
   * @param {Array} conditions Conditions Array
   * @param {String} answer User defined value
   */
  inputConditionalTarget(conditions, answer, target, unMetTarget) {
    let { questionsArr } = this.state;

    for (let i = 0; i < conditions.length; i++) {
      if (conditions[i].target.do !== 'release') {
        let match = 0;
        // Match with current question answer when target is value
        for (let j = 0; j < conditions[i].source.length; j++) {
          let isMatch = false;
          if (conditions[i].source[j].state !== "") {
            if (conditions[i].source[j].target !== "field" && conditions[i].source[j].state !== "loop_input") {
              isMatch = this.conditionValidation(
                answer.text !== undefined ? answer.text : answer,
                conditions[i].source[j].match_value,
                conditions[i].source[j].state
              );
              if (isMatch) {
                match = match + 1;
              }

              // Match with another question answer when target is field
            } else if (conditions[i].source[j].target === "field") {
              let matchValue;
              for (let j = 0; j < questionsArr.length; j++) {
                if (
                  questionsArr[j].question.handler ===
                  conditions[i].source[j].matchid &&
                  !matchValue
                ) {
                  matchValue = this.getFieldQuesionAnswer(questionsArr[j]);
                }
              }
              if (matchValue !== undefined) {
                isMatch = this.conditionValidation(
                  answer.text !== undefined ? answer.text : answer,
                  matchValue,
                  conditions[i].source[j].state
                );
              }
              if (isMatch) {
                match = match + 1;
              }
            }
            else if (conditions[i].source[j].state === 'loop_input') {
              let matchValue = answer.text !== undefined ? answer.text : '';
              matchValue = parseInt(matchValue)
              if (isNaN(matchValue)) {
              } else {
                if (matchValue !== 0) {
                  match = match + 1;
                  conditions[i].target.do = 'loop_input'
                }
              }
            }
          }
        }
        if (conditions[i].rule && conditions[i].rule === "any" && match > 0) {
          target.push(conditions[i].target);
        } else if (
          conditions[i].rule &&
          conditions[i].rule === "and" &&
          match == conditions[i].source.length
        ) {
          target.push(conditions[i].target);
        } else {
          unMetTarget.push(conditions[i].target);
        }
      }
    }
  }


  /**
   * Choice type questions Get target question for single selection
   * @param {Array} conditions Conditions Array
   * @param {String} selected Selected value
   */
  choiceSingleLevelTarget(conditions, selected, target, unMetTarget, release, selectedp_id, selected_id) {
    let { questionsArr } = this.state;

    for (let i = 0; i < conditions.length; i++) {
      if (release || conditions[i].target.do !== 'release') {
        let match = 0;
        // Match with current question answer when target is value
        for (let j = 0; j < conditions[i].source.length; j++) {

          let isMatch = false;
          if (conditions[i].source[j].state !== "") {
            if (conditions[i].source[j].target !== "field") {
              if (selected !== undefined) {
                isMatch = this.conditionValidation(
                  selected,
                  conditions[i].source[j].match_value,
                  conditions[i].source[j].state,
                  conditions[i].source[j].target,
                  selectedp_id,
                  selected_id,
                  conditions[i].source[j]
                );
                if (isMatch) {
                  match = match + 1;
                }
              }
              // Match with another question answer when target is field
            } else if (conditions[i].source[j].target === "field") {
              let matchValue;
              for (let j = 0; j < questionsArr.length; j++) {
                if (
                  questionsArr[j].question.handler ===
                  conditions[i].source[j].matchid &&
                  !matchValue
                ) {
                  matchValue = this.getFieldQuesionAnswer(questionsArr[j]);
                }
              }
              if (matchValue !== undefined) {
                isMatch = this.conditionValidation(
                  selected,
                  matchValue,
                  conditions[i].source[j].state
                );
                if (isMatch) {
                  match = match + 1;
                }
              }
            }
          }
        }
        if (conditions[i].rule && conditions[i].rule === "any" && match > 0) {
          target.push(conditions[i].target);
        } else if (
          conditions[i].rule &&
          conditions[i].rule === "and" &&
          match == conditions[i].source.length
        ) {
          target.push(conditions[i].target);
        } else {
          unMetTarget.push(conditions[i].target);
        }
      }
    }
  }

  /**
   * Choice type questions Get target question for multi selection
   * @param {Array} conditions Conditions Array
   * @param {String} selected Selected value
   */
  choiceMultiLevelTarget(conditions, selected, target, unMetTarget, label, release) {
    for (let i = 0; i < conditions.length; i++) {
      if (release || conditions[i].target.do !== 'release') {
        let match = 0;
        // Match with current question answer when target is value
        for (let j = 0; j < conditions[i].source.length; j++) {
          let isMatch = false;
          let isNotEqual = true;
          if (conditions[i].source[j].state !== "") {
            if (conditions[i].source[j].target !== "field") {
              if (conditions[i].source[j].target === "Value_Multiple_Any") {
                if (conditions[i].source[j].match_value.length && conditions[i].source[j].match_value.length > 0) {
                  if (conditions[i].source[j].state === "equal") {
                    for (let eq = 0; eq < selected.length; eq++) {
                      for (let mv = 0; mv < conditions[i].source[j].match_value.length; mv++) {
                        if (conditions[i].source[j].match_value[mv].hasOwnProperty('id')) {
                          if (conditions[i].source[j].match_value[mv].hasOwnProperty('p_id') && conditions[i].source[j].match_value[mv].hasOwnProperty('id')) {
                            if (
                              selected[eq]['sublabel_id'] ===
                              conditions[i].source[j].match_value[mv].id &&
                              selected[eq]['id'] ===
                              conditions[i].source[j].match_value[mv].p_id
                            ) {
                              isMatch = true;
                            }
                          } else {
                            if (
                              selected[eq]['id'] ===
                              conditions[i].source[j].match_value[mv].id
                            ) {
                              isMatch = true;
                            }
                          }
                        } else {
                          if (
                            selected[eq][`${label}`] ===
                            conditions[i].source[j].match_value[mv].value
                          ) {
                            isMatch = true;
                          }
                        }
                      }
                    }
                  } else if (conditions[i].source[j].state === "notequal") {
                    for (let neq = 0; neq < selected.length; neq++) {
                      for (let mv = 0; mv < conditions[i].source[j].match_value.length; mv++) {
                        if (conditions[i].source[j].match_value[mv].hasOwnProperty('id')) {
                          if (conditions[i].source[j].match_value[mv].hasOwnProperty('p_id') && conditions[i].source[j].match_value[mv].hasOwnProperty('id')) {
                            if (
                              selected[neq]['sublabel_id'] ===
                              conditions[i].source[j].match_value[mv].id &&
                              selected[neq]['id'] ===
                              conditions[i].source[j].match_value[mv].p_id
                            ) {
                              isNotEqual = false;
                            }
                          } else {
                            if (
                              selected[neq]['id'] ===
                              conditions[i].source[j].match_value[mv].id
                            ) {
                              isNotEqual = false;
                            }
                          }
                        } else {
                          if (
                            selected[neq][`${label}`] ===
                            conditions[i].source[j].match_value[mv].value
                          ) {
                            isNotEqual = false;
                          }
                        }
                      }
                    }
                    isMatch = isNotEqual;
                  }
                }
              } else if (conditions[i].source[j].target === "Value_Multiple_All") {
                if (conditions[i].source[j].match_value.length && conditions[i].source[j].match_value.length > 0) {
                  if (conditions[i].source[j].state === "equal") {
                    let multiple_match = false;
                    let match_index = [];
                    for (let eq = 0; eq < selected.length; eq++) {
                      for (let mv = 0; mv < conditions[i].source[j].match_value.length; mv++) {
                        if (conditions[i].source[j].match_value[mv].hasOwnProperty('id')) {
                          if (conditions[i].source[j].match_value[mv].hasOwnProperty('p_id') && conditions[i].source[j].match_value[mv].hasOwnProperty('id')) {
                            if (
                              selected[eq]['sublabel_id'] ===
                              conditions[i].source[j].match_value[mv].id &&
                              selected[eq]['id'] ===
                              conditions[i].source[j].match_value[mv].p_id
                            ) {
                              multiple_match = true;
                              match_index.push(mv);
                            } else {
                              multiple_match = false
                            }
                          } else {
                            if (
                              selected[eq]['id'] ===
                              conditions[i].source[j].match_value[mv].id
                            ) {
                              multiple_match = true;
                              match_index.push(mv);
                            } else {
                              multiple_match = false
                            }
                          }
                        } else {
                          if (
                            selected[eq][`${label}`] ===
                            conditions[i].source[j].match_value[mv].value
                          ) {
                            multiple_match = true;
                            match_index.push(mv);
                          } else {
                            multiple_match = false
                          }
                        }
                      }
                      isMatch = match_index.length === conditions[i].source[j].match_value.length
                    }
                  } else if (conditions[i].source[j].state === "notequal") {
                    let multiple_match = false;
                    let match_index = [];
                    for (let neq = 0; neq < selected.length; neq++) {
                      for (let mv = 0; mv < conditions[i].source[j].match_value.length; mv++) {
                        if (conditions[i].source[j].match_value[mv].hasOwnProperty('id')) {
                          if (conditions[i].source[j].match_value[mv].hasOwnProperty('p_id') && conditions[i].source[j].match_value[mv].hasOwnProperty('id')) {
                            if (
                              selected[neq]['sublabel_id'] !==
                              conditions[i].source[j].match_value[mv].id &&
                              selected[neq]['id'] !==
                              conditions[i].source[j].match_value[mv].p_id
                            ) {
                              multiple_match = true;
                              match_index.push(mv);
                            } else {
                              multiple_match = false;
                            }
                          } else {
                            if (
                              selected[neq]['id'] !==
                              conditions[i].source[j].match_value[mv].id
                            ) {
                              multiple_match = true;
                              match_index.push(mv);
                            } else {
                              multiple_match = false;
                            }
                          }
                        } else {
                          if (
                            selected[neq][`${label}`] !==
                            conditions[i].source[j].match_value[mv].value
                          ) {
                            multiple_match = true;
                            match_index.push(mv);
                          } else {
                            multiple_match = false;
                          }
                        }
                      }
                    }
                    isMatch = match_index.length === conditions[i].source[j].match_value.length
                  }
                }
              }
              if (conditions[i].source[j].state === "equal") {
                if (conditions[i].source[j].hasOwnProperty('id')) {
                  if (conditions[i].source[j].hasOwnProperty('p_id') && conditions[i].source[j].hasOwnProperty('id')) {
                    for (let eq = 0; eq < selected.length; eq++) {
                      if (
                        selected[eq]['id'] ==
                        conditions[i].source[j].p_id &&
                        selected[eq]['sublabel_id'] ==
                        conditions[i].source[j].id
                      ) {
                        isMatch = true;
                      }
                    }
                  } else {
                    for (let eq = 0; eq < selected.length; eq++) {
                      if (
                        selected[eq]['id'] ==
                        conditions[i].source[j].id
                      ) {
                        isMatch = true;
                      }
                    }
                  }
                } else {
                  for (let eq = 0; eq < selected.length; eq++) {
                    if (
                      selected[eq][`${label}`] ==
                      conditions[i].source[j].match_value
                    ) {
                      isMatch = true;
                    }
                  }
                }
              } else if (conditions[i].source[j].state === "notequal") {
                if (conditions[i].source[j].hasOwnProperty('id')) {
                  if (conditions[i].source[j].hasOwnProperty('p_id') && conditions[i].source[j].hasOwnProperty('id')) {
                    for (let eq = 0; eq < selected.length; eq++) {
                      if (
                        selected[eq]['id'] ===
                        conditions[i].source[j].p_id &&
                        selected[eq]['sublabel_id'] ===
                        conditions[i].source[j].id
                      ) {
                        isNotEqual = false;
                      }
                    }
                  } else {
                    for (let eq = 0; eq < selected.length; eq++) {
                      if (
                        selected[eq]['id'] ===
                        conditions[i].source[j].id
                      ) {
                        isNotEqual = false;
                      }
                    }
                  }
                } else {
                  for (let neq = 0; neq < selected.length; neq++) {
                    if (
                      selected[neq][`${label}`] ==
                      conditions[i].source[j].match_value
                    ) {
                      isNotEqual = false;
                    }
                  }
                }
                isMatch = isNotEqual;
              }
              if (isMatch) {
                match = match + 1;
              }
            }
          }
        }
        if (conditions[i].rule && conditions[i].rule === "any" && match > 0) {
          target.push(conditions[i].target);
        } else if (
          conditions[i].rule &&
          conditions[i].rule === "and" &&
          match == conditions[i].source.length
        ) {
          target.push(conditions[i].target);
        } else {
          unMetTarget.push(conditions[i].target);
        }
      }
    }
  }

  /**
   * Choice type questions Get target question based on user answer's
   * @param {Array} conditions Conditions Array
   * @param {String} answer User defined value
   */
  choiceConditionalTarget(conditions, answer, target, unMetTarget, release) {
    let selected;
    let selected_id = null;
    let selectedp_id = null;

    if (answer) {
      // Single choice type with multi level list
      if (
        answer.choice_type === "single" &&
        answer.multilevel === 1 &&
        answer.hasOwnProperty("selected_option") &&
        answer.selected_option.length > 0
      ) {
        selected = answer.selected_option[0].sublabel;
        selectedp_id = answer.selected_option[0].id;
        selected_id = answer.selected_option[0].sub_id;

        this.choiceSingleLevelTarget(conditions, selected, target, unMetTarget, release, selectedp_id, selected_id);
        // Single choice type with single level list
      } else if (
        answer.choice_type === "single" &&
        answer.multilevel === 0 &&
        answer.label &&
        answer.label != ""
      ) {
        selected = answer.label;
        selected_id = answer.id;
        this.choiceSingleLevelTarget(conditions, selected, target, unMetTarget, release, selectedp_id, selected_id);
        // Multi choice type with single level list
      } else if (
        answer.choice_type === "multiple" &&
        answer.multilevel === 0 &&
        answer.hasOwnProperty("selected_option") &&
        answer.selected_option.length > 0
      ) {
        selected = answer.selected_option;
        this.choiceMultiLevelTarget(
          conditions,
          selected,
          target,
          unMetTarget,
          "label",
          release
        );
        // Multi choice type with Multi level list
      } else if (
        answer.choice_type === "multiple" &&
        answer.multilevel === 1 &&
        answer.hasOwnProperty("selected_option") &&
        answer.selected_option.length > 0
      ) {
        selected = answer.selected_option;
        this.choiceMultiLevelTarget(
          conditions,
          selected,
          target,
          unMetTarget,
          "sublabel",
          release
        );
      } else {
        for (let i = 0; i < conditions.length; i++) {
          if (release || conditions[i].target.do !== 'release') {
            unMetTarget.push(conditions[i].target);
          }
        }
      }
    } else {
      for (let i = 0; i < conditions.length; i++) {
        if (release || conditions[i].target.do !== 'release') {
          unMetTarget.push(conditions[i].target);
        }
      }
    }
  }

  /**
   * Capture type questions Get target question based on user answer's
   * @param {Array} conditions Conditions Array
   * @param {String} answer User defined value
   */
  captureConditionalTarget(conditions, answer, question, target, unMetTarget) {
    let { questionsArr } = this.state;

    let selected;
    let selectedScale;
    if (answer && answer.hasOwnProperty("caption_text")) {
      selected = answer.caption_text;
    }

    if (answer && answer.hasOwnProperty("scale_image_id")) {
      selectedScale = answer.scale_image_id;
    }

    for (let i = 0; i < conditions.length; i++) {
      if (conditions[i].target.do !== 'release') {
        let match = 0;
        // Match with current question answer when target is value
        for (let j = 0; j < conditions[i].source.length; j++) {
          let isMatch = false;
          // Match with same question answer when target is field
          if (conditions[i].source[j].state !== "") {
            if (conditions[i].source[j].target !== "field") {
              if (conditions[i].source[j].target === "value") {
                if (selected !== undefined) {
                  isMatch = this.conditionValidation(
                    selected,
                    conditions[i].source[j].match_value,
                    conditions[i].source[j].state
                  );
                }
              } else if (conditions[i].source[j].target === "scale_value") {
                if (selectedScale !== undefined) {
                  isMatch = this.conditionValidation(
                    selectedScale.toString(),
                    conditions[i].source[j].match_value.toString(),
                    conditions[i].source[j].state
                  );
                }
              }

              if (isMatch) {
                match = match + 1;
              }
            } // Match with another question answer when target is field
            else if (conditions[i].source[j].target === "field") {
              let matchValue;
              for (let j = 0; j < questionsArr.length; j++) {
                if (
                  questionsArr[j].handler === conditions[i].source[j].matchid &&
                  !matchValue
                ) {
                  matchValue = this.getFieldQuesionAnswer(questionsArr[j]);
                }
              }

              if (matchValue !== undefined) {
                isMatch = this.conditionValidation(
                  selected,
                  matchValue,
                  conditions[i].source[j].state
                );
                if (isMatch) {
                  match = match + 1;
                }
              }
            }
          }
        }
        if (conditions[i].rule && conditions[i].rule === "any" && match > 0) {
          target.push(conditions[i].target);
        } else if (
          conditions[i].rule &&
          conditions[i].rule === "and" &&
          match == conditions[i].source.length
        ) {
          target.push(conditions[i].target);
        } else {
          unMetTarget.push(conditions[i].target);
        }
      }
    }
  }


  /**
   * Scale type questions Get target question if icon type is emoji
   * @param {Array} conditions Conditions Array
   * @param {String} selected Selected value
   */
  scaleSingleConditionalTarget(conditions, selected, target, unMetTarget, release) {
    let { questionsArr } = this.state;

    for (let i = 0; i < conditions.length; i++) {
      if (release || conditions[i].target.do !== 'release') {
        let match = 0;
        // Match with current question answer when target is value
        for (let j = 0; j < conditions[i].source.length; j++) {
          let isMatch = false;
          if (conditions[i].source[j].state !== "") {
            if (conditions[i].source[j].target !== "field") {
              if (selected !== undefined) {
                isMatch = this.conditionValidation(
                  selected,
                  conditions[i].source[j].match_value,
                  conditions[i].source[j].state,
                  conditions[i].source[j].target
                );
                if (isMatch) {
                  match = match + 1;
                }
              }
              // Match with another question answer when target is field
            } else if (conditions[i].source[j].target === "field") {
              let matchValue;
              for (let j = 0; j < questionsArr.length; j++) {
                if (
                  questionsArr[j].question.handler ===
                  conditions[i].source[j].matchid &&
                  !matchValue
                ) {
                  matchValue = this.getFieldQuesionAnswer(questionsArr[j]);
                }
              }
              if (matchValue !== undefined) {
                isMatch = this.conditionValidation(
                  selected,
                  matchValue,
                  conditions[i].source[j].state
                );
                if (isMatch) {
                  match = match + 1;
                }
              }
            }
          }
        }
        if (conditions[i].rule && conditions[i].rule === "any" && match > 0) {
          target.push(conditions[i].target);
        } else if (
          conditions[i].rule &&
          conditions[i].rule === "and" &&
          match == conditions[i].source.length
        ) {
          target.push(conditions[i].target);
        } else {
          unMetTarget.push(conditions[i].target);
        }
      }
    }
  }

  /**
   * Scale type questions Get target question based on user answer's
   * @param {Array} conditions Conditions Array
   * @param {String} answer User defined value
   */
  scaleConditionalTarget(conditions, answer, target, unMetTarget, release) {
    let selected;

    if (answer) {
      // Get selected answer
      if (
        answer &&
        answer.hasOwnProperty("selected_option") &&
        answer.selected_option.length > 0
      ) {
        if (answer.icon_type === "emoji") {
          selected = answer.selected_option[0].value;
          this.scaleSingleConditionalTarget(
            conditions,
            selected,
            target,
            unMetTarget,
            release
          );
        } else if (answer.icon_type === "image") {
          let lastSelected = answer.selected_option.length - 1;
          selected = answer.selected_option[lastSelected].value;
          this.scaleSingleConditionalTarget(
            conditions,
            selected,
            target,
            unMetTarget,
            release
          );
        }
      }
    }
  }

  /**
   * Find the condition source with selected answer
   * @param {Question Object} questionObj Current question object
   * @param {Any} condition Current question condition
   */
  tableConditonalSourceMap(selected, questionObj, source) {
    let isMatch = false;
    let matchOptionId;
    let matchValueId;
    let question = questionObj;
    if (questionObj.hasOwnProperty("table_content")) {
      question = questionObj.table_content;
    }
    const { table_options, table_value } = question;
    // using loop through find the condition source option id
    if (table_options) {
      for (let i = 0; i < table_options.length; i++) {
        if (source.match_option === table_options[i].value) {
          matchOptionId = table_options[i].id;
        }
      }
    }
    // using loop through find the condition source value id
    if (table_value) {
      for (let i = 0; i < table_value.length; i++) {
        if (source.match_value === table_value[i].value) {
          matchValueId = table_value[i].id;
        }
      }
    }
    // Check the matching condition with table options and values
    if (matchOptionId !== undefined && matchValueId !== undefined) {
      let matchObj = {
        optionId: matchOptionId,
        valueId: matchValueId
      };
      isMatch = this.tableConditonalValidate(selected, matchObj, source.state);
    }
    return isMatch;
  }

  /**
   * Validate the table
   * @param {Array} selected Selected answer
   * @param {Object} matchObj Matching row and column as object
   * @param {Object} condition Current condition object
   */
  tableConditonalValidate(selected, matchObj, condition) {
    let isMatch = false;
    const { valueId, optionId } = matchObj;

    if (condition === "equal") {
      for (let i = 0; i < selected.length; i++) {
        if (
          selected[i].id === matchObj.valueId &&
          selected[i].image.id === matchObj.optionId &&
          isMatch === false
        ) {
          isMatch = true;
        }
      }
      if (
        selected[valueId] !== undefined &&
        selected[valueId].image.id === optionId
      ) {
        isMatch = true;
      }
    } else if (condition === "notequal") {
      let notEqual = true;
      for (let i = 0; i < selected.length; i++) {
        if (
          selected[i].id === matchObj.valueId &&
          selected[i].image.id === matchObj.optionId &&
          notEqual === true
        ) {
          notEqual = false;
        }
      }
      isMatch = notEqual;
    }
    return isMatch;
  }

  /**
   * Scale type questions Get target question based on user answer's
   * @param {Array} conditions Conditions Array
   * @param {String} answer User defined value
   */
  tableConditionalTarget(conditions, answer, question, target, unMetTarget) {
    // let {questionsArr} = this.state;

    let selected;

    if (answer) {
      // Get selected answer
      if (
        answer &&
        answer.hasOwnProperty("selected_option") &&
        answer.selected_option.length > 0
      ) {
        selected = answer.selected_option;
      }
    }
    for (let i = 0; i < conditions.length; i++) {
      if (conditions[i].target.do !== 'release') {
        let match = 0;
        // Match with current question answer when target is value
        for (let j = 0; j < conditions[i].source.length; j++) {
          if (conditions[i].source[j].state !== "") {
            if (conditions[i].source[j].target !== "field") {
              if (selected !== undefined) {
                let isMatch = this.tableConditonalSourceMap(
                  selected,
                  question,
                  conditions[i].source[j]
                );
                if (isMatch) {
                  match = match + 1;
                }
              }
            }
          }
        }
        if (conditions[i].rule && conditions[i].rule === "any" && match > 0) {
          target.push(conditions[i].target);
        } else if (
          conditions[i].rule &&
          conditions[i].rule === "and" &&
          match == conditions[i].source.length
        ) {
          target.push(conditions[i].target);
        } else {
          unMetTarget.push(conditions[i].target);
        }
      }
    }
  }

  /**
   * Barcode type questions Get target question based on user answer's
   * @param {Array} conditions Conditions Array
   * @param {String} answer User defined value
   */
  barcodeConditionalTarget(conditions, answer, target, unMetTarget, release) {
    let { questionsArr } = this.state;

    let selected;

    if (answer) {
      // Get captured barcode from answer
      if (answer && answer.hasOwnProperty("barcode_id")) {
        selected = answer.barcode_id;
      }
    }
    for (let i = 0; i < conditions.length; i++) {
      if (release || conditions[i].target.do !== 'release') {
        let match = 0;
        // Match with current question answer when target is value
        for (let j = 0; j < conditions[i].source.length; j++) {
          let isMatch = false;
          if (conditions[i].source[j].state !== "") {
            if (conditions[i].source[j].target !== "field") {
              if (selected !== undefined) {
                isMatch = this.conditionValidation(
                  selected,
                  conditions[i].source[j].match_value,
                  conditions[i].source[j].state,
                  conditions[i].source[j].target
                );
                if (isMatch) {
                  match = match + 1;
                }
              }
              // Match with another question answer when target is field
            } else if (conditions[i].source[j].target === "field") {
              let matchValue;
              for (let j = 0; j < questionsArr.length; j++) {
                if (
                  questionsArr[j].question.handler ===
                  conditions[i].source[j].matchid &&
                  !matchValue
                ) {
                  matchValue = this.getFieldQuesionAnswer(questionsArr[j]);
                }
              }
              if (matchValue !== undefined) {
                isMatch = this.conditionValidation(
                  selected,
                  matchValue,
                  conditions[i].source[j].state,
                  conditions[i].source[j].target
                );
                if (isMatch) {
                  match = match + 1;
                }
              }
            }
          }
        }
        if (conditions[i].rule && conditions[i].rule === "any" && match > 0) {
          target.push(conditions[i].target);
        } else if (
          conditions[i].rule &&
          conditions[i].rule === "and" &&
          match == conditions[i].source.length
        ) {
          target.push(conditions[i].target);
        } else {
          unMetTarget.push(conditions[i].target);
        }
      }
    }
  }

  /* reset video player playing time if video reach to end */
  onEnd = () => {
    this.player.setSeektime(0)
    this.setState({ paused: true })
  }

  /**
   * reset the sound instance to null and release the sound
   */
  resetSound = playState => {
    if (this.sound) {
      this.sound.setCurrentTime(0);
      this.sound.release();
      this.sound = null;
    }
    this.setState({ audioLoader: true, duration: 0, playState });
  };

  /**
   * Create a new instance for sound
   */
  setSound = filepath => {
    this.setState({ playState: "playing", audioLoader: true, duration: 0 });
    this.sound = new Sound(filepath, "", error => {
      if (error) {
        // Alert.alert('Notice', 'audio file error. (Error code : 1)');
        this.setState({ playState: "paused" });
      } else {
        if (this.sound && this.sound.getDuration() > 0) {
          this.setState({
            playState: "playing",
            audioLoader: false,
            duration: this.sound.getDuration()
          });
          this.sound.play(this.playComplete);
        }
      }
    });
  };

  /**
   * this method used for page change on navigation button click
   * validate current question condition
   * check noreturn flag include current question
   * if noreturn flag include current question user cannot go to previous
   * check current condition to hide or show or create loop question etc...
   * */
  increment() {
    if (this.state.initialLoader === true) {
      return false;
    } else if (this.state.videoProcessing === true) {
      Constants.showSnack(this.state.translation_common[this.state.Language].Processing_Image);
      return false;
    }
    else {
      Keyboard.dismiss();
      this.state.webview = false;

      let currentPage = this.state.pageCount;
      let conditions = this.state.questionsArr[currentPage].conditions;
      let questionsArray = this.state.questionsArr;
      let arrLength = questionsArray.length;
      let target = [];
      let unMetTarget = [];
      let releasetarget = [];
      let releaseunMetTarget = [];
      let currentQuesIndx = this.state.pageCount;
      let nextQuesIdx = currentPage + 1;
      let mandatoryError = false;
      let release_mission = [];
      let update = questionsArray[currentQuesIndx].hasOwnProperty("isUpdated") ? questionsArray[currentQuesIndx].isUpdated : null;

      //check for text input limit validation
      if (questionsArray[currentQuesIndx].questionType === "input" && questionsArray[currentQuesIndx].properties.hasOwnProperty("limitchar") &&
        questionsArray[currentQuesIndx].properties.limitchar === 1) {

        let limit_check = this.limitCharValidation(questionsArray[currentQuesIndx], questionsArray[currentQuesIndx].answer);
        if (
          limit_check.limitValid === false
        ) {
          Constants.showSnack(limit_check.limitMessage);
          return;
        }
      }

      /** check choice type element set limit */
      if (questionsArray[currentQuesIndx].questionType === 'choice' && questionsArray[currentQuesIndx].properties.hasOwnProperty('setlimit') && questionsArray[currentQuesIndx].properties.setlimit == 1) {
        let ansObj = questionsArray[currentQuesIndx].answer
        let count = ansObj.selected_option && ansObj.selected_option.length || 0
        let objProperty = questionsArray[currentQuesIndx].properties
        if (count < objProperty.minlimit) {
          Constants.showSnack('Please select minimum ' + objProperty.minlimit + ' options')
          return;
        }
      }

      /**
       * check current question include release mission in condition
       * add release mission project id and mission id to current question answer object
       */
      if (conditions.length > 0) {
        this.getConditionalTarget(
          conditions,
          questionsArray[currentQuesIndx].answer,
          questionsArray[currentQuesIndx].questionType,
          questionsArray[currentQuesIndx].properties,
          releasetarget,
          releaseunMetTarget,
          true
        );
        if (releasetarget.length > 0) {

          if (questionsArray[currentQuesIndx].hasOwnProperty('answer')) {
            for (let i = 0; i < releasetarget.length; i++) {
              if (releasetarget[i].do === 'release') {
                let relObj = {
                  project: releasetarget[i].project,
                  mission: releasetarget[i].mission
                }
                release_mission.push(relObj);

              }
            }

          }
        } else if (releaseunMetTarget.length > 0) {
          if (questionsArray[currentQuesIndx].hasOwnProperty('answer')) {

            release_mission = [];

          }
        }
      }

      if (
        questionsArray[currentQuesIndx].properties.hasOwnProperty(
          "mandatory"
        ) &&
        questionsArray[currentQuesIndx].properties.mandatory === 1
      ) {
        if (questionsArray[currentQuesIndx].questionType === "input") {
          if (
            questionsArray[currentQuesIndx].answer &&
            questionsArray[currentQuesIndx].answer.text &&
            questionsArray[currentQuesIndx].answer.text != ""
          ) {
            if (
              questionsArray[currentQuesIndx].hasOwnProperty("isUpdated") &&
              questionsArray[currentQuesIndx].isUpdated === true
            ) {

              let questionObj = this.questionPostObject(currentQuesIndx);
              if (questionsArray[currentQuesIndx].properties.hasOwnProperty("noreturn") &&
                questionsArray[currentQuesIndx].properties.noreturn === 1) {
                this.postAnswerToServer(questionObj, currentQuesIndx, false, 1);
              }
              else {
                this.postAnswerToServer(questionObj, currentQuesIndx, false);
              }
            }

          } else {
            mandatoryError = true;
            Constants.showSnack(this.state.translation[this.state.Language].Mandatory_Msg);
          }
        } else if (questionsArray[currentQuesIndx].questionType === "choice" && questionsArray[currentQuesIndx].properties.display_type === "dropdown") {
          if (
            questionsArray[currentQuesIndx].answer &&
            ((questionsArray[currentQuesIndx].answer.label_text &&
              questionsArray[currentQuesIndx].answer.label_text.length >
              0))) {
            if (
              questionsArray[currentQuesIndx].hasOwnProperty("isUpdated") &&
              questionsArray[currentQuesIndx].isUpdated === true
            ) {
              let questionObj = this.questionPostObject(currentQuesIndx);
              questionObj['release_mission'] = release_mission;
              if (questionsArray[currentQuesIndx].properties.hasOwnProperty("noreturn") &&
                questionsArray[currentQuesIndx].properties.noreturn === 1) {
                this.postAnswerToServer(questionObj, currentQuesIndx, false, 1);
              }
              else {
                this.postAnswerToServer(questionObj, currentQuesIndx, false);
              }
            }
          }
          else {
            mandatoryError = true;
            Constants.showSnack(this.state.translation[this.state.Language].Mandatory_Msg);
          }
        }
        else if (
          questionsArray[currentQuesIndx].questionType === "choice") {
          if (
            questionsArray[currentQuesIndx].answer &&
            ((questionsArray[currentQuesIndx].answer.selected_option &&
              questionsArray[currentQuesIndx].answer.selected_option.length >
              0))) {
            let selected_option = questionsArray[currentQuesIndx].answer.selected_option;
            let other = false;
            for (let k = 0; k < selected_option.length; k++) {
              if (selected_option[k].id === 'other') {
                other = true;
              }
            }
            if (other) {
              if (questionsArray[currentQuesIndx].answer.hasOwnProperty('other_value') &&
                questionsArray[currentQuesIndx].answer.other_value !== "") {
                if (
                  questionsArray[currentQuesIndx].hasOwnProperty("isUpdated") &&
                  questionsArray[currentQuesIndx].isUpdated === true
                ) {
                  let questionObj = this.questionPostObject(currentQuesIndx);
                  questionObj['release_mission'] = release_mission;
                  if (questionsArray[currentQuesIndx].properties.hasOwnProperty("noreturn") &&
                    questionsArray[currentQuesIndx].properties.noreturn === 1) {
                    this.postAnswerToServer(questionObj, currentQuesIndx, false, 1);
                  }
                  else {
                    this.postAnswerToServer(questionObj, currentQuesIndx, false);
                  }
                }
              } else {
                mandatoryError = true;
                Constants.showSnack(this.state.translation[this.state.Language].Mandatory_Msg);
              }
            } else {
              if (
                questionsArray[currentQuesIndx].hasOwnProperty("isUpdated") &&
                questionsArray[currentQuesIndx].isUpdated === true
              ) {
                let questionObj = this.questionPostObject(currentQuesIndx);
                questionObj['release_mission'] = release_mission;
                if (questionsArray[currentQuesIndx].properties.hasOwnProperty("noreturn") &&
                  questionsArray[currentQuesIndx].properties.noreturn === 1) {
                  this.postAnswerToServer(questionObj, currentQuesIndx, false, 1);
                }
                else {
                  this.postAnswerToServer(questionObj, currentQuesIndx, false);
                }
              }
            }
          }
          else if (questionsArray[currentQuesIndx].answer &&
            questionsArray[currentQuesIndx].answer.hasOwnProperty('id')) {

            if (questionsArray[currentQuesIndx].answer.id === 'other') {
              if (questionsArray[currentQuesIndx].answer.hasOwnProperty('other_value') &&
                questionsArray[currentQuesIndx].answer.other_value !== "") {
                if (
                  questionsArray[currentQuesIndx].hasOwnProperty("isUpdated") &&
                  questionsArray[currentQuesIndx].isUpdated === true
                ) {
                  let questionObj = this.questionPostObject(currentQuesIndx);
                  questionObj['release_mission'] = release_mission;
                  if (questionsArray[currentQuesIndx].properties.hasOwnProperty("noreturn") &&
                    questionsArray[currentQuesIndx].properties.noreturn === 1) {
                    this.postAnswerToServer(questionObj, currentQuesIndx, false, 1);
                  }
                  else {
                    this.postAnswerToServer(questionObj, currentQuesIndx, false);
                  }
                }
              } else {
                mandatoryError = true;
                Constants.showSnack(this.state.translation[this.state.Language].Mandatory_Msg);
              }
            } else {
              if (
                questionsArray[currentQuesIndx].hasOwnProperty("isUpdated") &&
                questionsArray[currentQuesIndx].isUpdated === true
              ) {
                let questionObj = this.questionPostObject(currentQuesIndx);
                questionObj['release_mission'] = release_mission;
                if (questionsArray[currentQuesIndx].properties.hasOwnProperty("noreturn") &&
                  questionsArray[currentQuesIndx].properties.noreturn === 1) {
                  this.postAnswerToServer(questionObj, currentQuesIndx, false, 1);
                }
                else {
                  this.postAnswerToServer(questionObj, currentQuesIndx, false);
                }
              }
            }
          }
          else {
            mandatoryError = true;
            Constants.showSnack(this.state.translation[this.state.Language].Mandatory_Msg);
          }

        }

        else if (questionsArray[currentQuesIndx].questionType === "scale") {
          if (questionsArray[currentQuesIndx].properties.scale_type == "table"
            && questionsArray[currentQuesIndx].answer &&
            ((questionsArray[currentQuesIndx].answer.selected_option &&
              questionsArray[currentQuesIndx].answer.selected_option.length < questionsArray[currentQuesIndx].properties.table_content.table_value.length
            ))) {
            /** need to select option in every row if table scale type mendatory  */
            mandatoryError = true;
            Constants.showSnack(this.state.translation[this.state.Language].Mandatory_Msg);
          }
          else if (
            questionsArray[currentQuesIndx].answer &&
            ((questionsArray[currentQuesIndx].answer.selected_option &&
              questionsArray[currentQuesIndx].answer.selected_option.length >
              0) ||
              (questionsArray[currentQuesIndx].answer.label &&
                questionsArray[currentQuesIndx].answer.label != ""))
          ) {
            if (
              questionsArray[currentQuesIndx].hasOwnProperty("isUpdated") &&
              questionsArray[currentQuesIndx].isUpdated === true
            ) {
              let questionObj = this.questionPostObject(currentQuesIndx);
              questionObj['release_mission'] = release_mission;
              if (questionsArray[currentQuesIndx].properties.hasOwnProperty("noreturn") &&
                questionsArray[currentQuesIndx].properties.noreturn === 1) {
                this.postAnswerToServer(questionObj, currentQuesIndx, false, 1);
              }
              else {
                this.postAnswerToServer(questionObj, currentQuesIndx, false);
              }
            }

          } else {
            mandatoryError = true;
            Constants.showSnack(this.state.translation[this.state.Language].Mandatory_Msg);
          }
        }

        else if (questionsArray[currentQuesIndx].questionType === "upload") {
          if (
            questionsArray[currentQuesIndx].answer &&
            questionsArray[currentQuesIndx].answer.media &&
            questionsArray[currentQuesIndx].answer.media != ""
          ) {
            if (
              questionsArray[currentQuesIndx].hasOwnProperty("isUpdated") &&
              questionsArray[currentQuesIndx].isUpdated === true
            ) {
              let questionObj = this.questionPostObject(currentQuesIndx);
              if (questionsArray[currentQuesIndx].properties.hasOwnProperty("noreturn") &&
                questionsArray[currentQuesIndx].properties.noreturn === 1) {
                this.postAnswerToServer(questionObj, currentQuesIndx, false, 1);
              }
              else {
                this.postAnswerToServer(questionObj, currentQuesIndx, false);
              }
            }
          } else {
            mandatoryError = true;
            Constants.showSnack(this.state.translation[this.state.Language].Mandatory_Msg);
          }
        } else if (
          questionsArray[currentQuesIndx].questionType === "capture" ||
          questionsArray[currentQuesIndx].questionType === "barcode"
        ) {
          if (
            questionsArray[currentQuesIndx].answer &&
            questionsArray[currentQuesIndx].answer.image &&
            questionsArray[currentQuesIndx].answer.image != ""
          ) {
            if (
              questionsArray[currentQuesIndx].hasOwnProperty("isUpdated") &&
              questionsArray[currentQuesIndx].isUpdated === true
            ) {
              let questionObj = this.questionPostObject(currentQuesIndx);
              questionObj['release_mission'] = release_mission;
              if (questionsArray[currentQuesIndx].properties.hasOwnProperty("noreturn") &&
                questionsArray[currentQuesIndx].properties.noreturn === 1) {
                this.postAnswerToServer(questionObj, currentQuesIndx, false, 1);
              }
              else {
                this.postAnswerToServer(questionObj, currentQuesIndx, false);
              }

            }
          } else {
            mandatoryError = true;
            Constants.showSnack(this.state.translation[this.state.Language].Mandatory_Msg);
          }
        }
        else if (questionsArray[currentQuesIndx].questionType === "gps") {
          let questionObj = this.questionPostObject(currentQuesIndx);
          if (questionsArray[currentQuesIndx].properties.hasOwnProperty("noreturn") &&
            questionsArray[currentQuesIndx].properties.noreturn === 1) {
            this.postAnswerToServer(questionObj, currentQuesIndx, false, 1);
          }
          else {
            this.postAnswerToServer(questionObj, currentQuesIndx, false);
          }
        }
      } else if (questionsArray[currentQuesIndx].questionType === "gps") {
        let questionObj = this.questionPostObject(currentQuesIndx);
        if (questionsArray[currentQuesIndx].properties.hasOwnProperty("noreturn") &&
          questionsArray[currentQuesIndx].properties.noreturn === 1) {
          this.postAnswerToServer(questionObj, currentQuesIndx, false, 1);
        }
        else {
          this.postAnswerToServer(questionObj, currentQuesIndx, false);
        }
      } else if (
        questionsArray[currentQuesIndx].hasOwnProperty("isUpdated") &&
        questionsArray[currentQuesIndx].isUpdated === true
      ) {
        let questionObj = this.questionPostObject(currentQuesIndx);
        questionObj['release_mission'] = release_mission;
        if (questionsArray[currentQuesIndx].properties.hasOwnProperty("noreturn") &&
          questionsArray[currentQuesIndx].properties.noreturn === 1) {
          this.postAnswerToServer(questionObj, currentQuesIndx, false, 1);
        }
        else {
          this.postAnswerToServer(questionObj, currentQuesIndx, false);
        }
      }
      if (
        questionsArray[nextQuesIdx] &&
        questionsArray[nextQuesIdx].questionType === "upload"
      ) {
        if (questionsArray[nextQuesIdx].answer && questionsArray[nextQuesIdx].answer.media_type && questionsArray[nextQuesIdx].answer.media_type === "audio") {
          this.resetSound("paused");
        }
      }

      //questionsArray = this.state.questionsArr;
      if (mandatoryError === false) {
        if (conditions.length > 0 && (!questionsArray[currentQuesIndx].hasOwnProperty("isUpdated") || (update && update === true))) {
          // if (conditions.length > 0 && (questionsArray[currentQuesIndx].answer || questionsArray[currentQuesIndx].questionType == "input")) {
          this.getConditionalTarget(
            conditions,
            questionsArray[currentQuesIndx].answer,
            questionsArray[currentQuesIndx].questionType,
            questionsArray[currentQuesIndx].properties,
            target,
            unMetTarget,
            false
          );
          if (unMetTarget) {
            for (let k = 0; k < unMetTarget.length; k++) {
              if (
                unMetTarget[k].hasOwnProperty("multifield") &&
                unMetTarget[k].multifield.length > 0
              ) {
                if (!questionsArray[currentQuesIndx].hasOwnProperty("isUpdated") || (update && update === true)) {
                  //
                  if (!unMetTarget[k].hasOwnProperty('loop') && (unMetTarget[k].do === "loop" ||
                    unMetTarget[k].do === "loop_input" || unMetTarget[k].do === "loop_set")) {
                    this.hide_unMetTarget_loopques(unMetTarget[k], questionsArray, currentQuesIndx)
                  }
                  //
                  if (update && update === true) {
                    if (unMetTarget[k].do === "loop") {
                      this.clear_looponly(questionsArray, unMetTarget[k], currentQuesIndx, 'loop')
                      this.clear_loop_answer(questionsArray, unMetTarget[k], currentQuesIndx, 'loop')
                    } else if (unMetTarget[k].do === "loop_set") {
                      this.clear_loopset(questionsArray, unMetTarget[k], currentQuesIndx, 'loop_set')
                      this.clear_loop_answer(questionsArray, unMetTarget[k], currentQuesIndx, 'loop_set')
                    } else if (unMetTarget[k].do === "loop_input") {
                      questionsArray[currentQuesIndx].loop_inputvalue = 0;
                      this.clear_loopinput(questionsArray, unMetTarget[k], currentQuesIndx, 'loop_input')
                      this.clear_loop_answer(questionsArray, unMetTarget[k], currentQuesIndx, 'loop_input')
                    }
                    questionsArray = this.state.questionsArr
                  }
                  //
                }
                /* hide or show hide question based on user selection */
                for (let j = 0; j < unMetTarget[k].multifield.length; j++) {
                  for (let i = 0; i < questionsArray.length; i++) {
                    if (unMetTarget[k].loop) {
                      if (unMetTarget[k].multifield[j].value === questionsArray[i].handler && questionsArray[i].loop_triggered_qid === unMetTarget[k].loop_triggered_qid
                        && questionsArray[i].loop_set_num === unMetTarget[k].loop_set_num
                      ) {
                        if (unMetTarget[k].do === "show_multiple") {
                          if (unMetTarget[k].loop_number < questionsArray[i].loop_number) {
                            questionsArray[i].isHide = false;
                            break;
                          }
                        } else if (unMetTarget[k].do === "hide_multiple") {
                          if (unMetTarget[k].loop_number < questionsArray[i].loop_number) {
                            questionsArray[i].isHide = false;
                            break;
                          }
                        }

                      }
                      // break;
                    } else {
                      if (
                        unMetTarget[k].multifield[j].value ===
                        questionsArray[i].handler && !questionsArray[i].hasOwnProperty("loop_number")
                      ) {

                        if (unMetTarget[k].do === "show_multiple") {
                          questionsArray[i].isHide = false;
                        } else if (unMetTarget[k].do === "hide_multiple") {
                          questionsArray[i].isHide = false;
                        }
                        //
                        if (unMetTarget[k].hasOwnProperty('isHide') && unMetTarget[k].isHide) {
                          if (unMetTarget[k].multifield[j].hasOwnProperty('trigger') && unMetTarget[k].multifield[j].trigger) {
                            // skip triggerd ques in the list
                          } else {
                            questionsArray[i].isHide = true;
                            if (update && update === true) {
                              this.clear_loop_answer(questionsArray, target[k], i, 'hide')
                            }
                          }
                        }
                        //
                      }
                    }
                  }
                }
                questionsArray = this.state.questionsArr;
              } else {
                for (let i = 0; i < questionsArray.length; i++) {
                  if (unMetTarget[k].loop) {
                    if (unMetTarget[k].handler === questionsArray[i].handler && questionsArray[i].loop_triggered_qid === unMetTarget[k].loop_triggered_qid
                      && questionsArray[i].loop_set_num === unMetTarget[k].loop_set_num
                    ) {
                      if (unMetTarget[k].do === "show") {
                        if (unMetTarget[k].loop_number < questionsArray[i].loop_number) {
                          questionsArray[i].isHide = false;
                          break;
                        }
                      } else if (unMetTarget[k].do === "hide") {
                        if (unMetTarget[k].loop_number < questionsArray[i].loop_number) {
                          questionsArray[i].isHide = false;
                          break;
                        }
                      }

                    }
                  } else {
                    if (unMetTarget[k].handler === questionsArray[i].handler && !questionsArray[i].hasOwnProperty("loop_number")) {
                      if (unMetTarget[k].do === "show") {
                        questionsArray[i].isHide = false;
                      } else if (unMetTarget[k].do === "hide") {
                        questionsArray[i].isHide = false;
                      }
                    }
                  }
                }
              }
              questionsArray = this.state.questionsArr;
            }

          }
          if (target) {
            for (let k = 0; k < target.length; k++) {
              if (
                target[k].hasOwnProperty("multifield") &&
                target[k].multifield.length > 0
              ) {
                //
                if (!target[k].hasOwnProperty('loop') && (target[k].do === "loop" ||
                  target[k].do === "loop_input" || target[k].do === "loop_set")) {
                  this.hide_unMetTarget_loopques(target[k], questionsArray, currentQuesIndx)
                }

                if (!questionsArray[currentQuesIndx].hasOwnProperty("isUpdated") || (update && update === true)) {
                  if (target[k].do === "loop") {
                    this.create_loop(questionsArray, target[k], currentQuesIndx, 'loop')
                  } else if (target[k].do === "loop_set" && !target[k].hasOwnProperty('condition')) {
                    this.create_loop(questionsArray, target[k], currentQuesIndx, 'loop_set')
                  } else if (target[k].do === "loop_input") {
                    this.create_loop(questionsArray, target[k], currentQuesIndx, 'loop_input')
                  }
                  questionsArray = this.state.questionsArr
                  //
                }
                for (let j = 0; j < target[k].multifield.length; j++) {
                  for (let i = 0; i < questionsArray.length; i++) {
                    if (target[k].loop) {
                      if (target[k].multifield[j].value === questionsArray[i].handler && questionsArray[i].loop_triggered_qid === target[k].loop_triggered_qid
                        && questionsArray[i].loop_set_num === target[k].loop_set_num
                      ) {
                        if (target[k].do === "show_multiple") {
                          if (target[k].loop_number < questionsArray[i].loop_number) {
                            questionsArray[i].isHide = false;
                            break;
                          }
                        } else if (target[k].do === "hide_multiple") {
                          if (target[k].loop_number < questionsArray[i].loop_number) {
                            questionsArray[i].isHide = true;
                            this.clear_loop_answer(questionsArray, target[k], i, 'hide_loop')
                            break;
                          }
                        }

                      }
                      // break;
                    } else {
                      if (
                        target[k].multifield[j].value ===
                        questionsArray[i].handler && !questionsArray[i].hasOwnProperty("loop_number")
                      ) {
                        if (target[k].do === "show_multiple") {
                          questionsArray[i].isHide = false;
                        } else if (target[k].do === "hide_multiple") {
                          questionsArray[i].isHide = true;
                          this.clear_loop_answer(questionsArray, target[k], i, 'hide')
                        }
                        //
                        if (target[k].hasOwnProperty('isHide') && target[k].isHide === true) {
                          if (target[k].multifield[j].hasOwnProperty('trigger') && target[k].multifield[j].trigger) {
                            target[k].multifield[j].trigger = false
                            // questionsArray[i].isHide = false;
                          } else {
                            questionsArray[i].isHide = false;
                          }

                        }
                        //

                      }
                    }
                  }
                }
                questionsArray = this.state.questionsArr;
              } else {
                for (let i = 0; i < questionsArray.length; i++) {
                  if (target[k].loop) {
                    if (target[k].handler === questionsArray[i].handler && questionsArray[i].loop_triggered_qid === target[k].loop_triggered_qid
                      && questionsArray[i].loop_set_num === target[k].loop_set_num
                    ) {
                      if (target[k].do === "show") {
                        if (target[k].loop_number < questionsArray[i].loop_number) {
                          questionsArray[i].isHide = false;
                          break;
                        }
                      } else if (target[k].do === "hide") {
                        if (target[k].loop_number < questionsArray[i].loop_number) {
                          questionsArray[i].isHide = true;
                          this.clear_loop_answer(questionsArray, target[k], i, 'hide_loop');
                          break;
                        }

                      }
                    }
                  } else {
                    if (target[k].handler === questionsArray[i].handler && !questionsArray[i].hasOwnProperty("loop_number")) {
                      if (target[k].do === "show") {
                        questionsArray[i].isHide = false;
                      } else if (target[k].do === "hide") {
                        questionsArray[i].isHide = true;
                        this.clear_loop_answer(questionsArray, target[k], i, 'hide')

                      }
                    }
                  }
                }
              }
              questionsArray = this.state.questionsArr;
            }

          }
        }

        // this.setState({
        //   questionsArr : questionsArray
        // }, () => {
        let nextPage = currentPage;
        let nextExists = false;
        let copyquestionArray = questionsArray;
        let copyarrLength = copyquestionArray.length;

        for (let i = currentPage; i < copyquestionArray.length; i++) {
          if (
            i > currentPage &&
            (!copyquestionArray[i].isHide || copyquestionArray[i].isHide === false)
          ) {
            nextPage = i;
            break;
          }
        }
        let page = nextPage;
        if (nextPage == copyarrLength - 1) {
          nextExists = false;
        } else {
          for (let i = nextPage; i < copyquestionArray.length; i++) {
            if (
              i > nextPage &&
              (!copyquestionArray[i].isHide || copyquestionArray[i].isHide === false)
            ) {
              nextExists = true;
              page = i;
              break;
            }
          }
        }
        if (
          !copyquestionArray[currentQuesIndx].properties.hasOwnProperty(
            "noreturn"
          ) ||
          copyquestionArray[currentQuesIndx].properties.noreturn === 0
        ) {
          this.actionForNavNextIcon(nextPage, nextExists, currentPage, page, copyquestionArray);
        }
        if (copyquestionArray[currentQuesIndx].properties.hasOwnProperty("noreturn") && copyquestionArray[currentQuesIndx].properties.noreturn === 1 &&
          (!copyquestionArray[currentQuesIndx].hasOwnProperty("isUpdated") || copyquestionArray[currentQuesIndx].isUpdated === false)) {
          this.checkNoReturnQues(copyquestionArray[currentQuesIndx], currentQuesIndx);
        }
        // })

      }
    }
  }

  /** Get hidden questions based on condition
    * @param currentQuesIndx - current question index
  */
  getHiddenQuestions(currentQuesIndx) {
    let questionsArray = this.state.questionsArr;
    let currentPage = this.state.pageCount;
    let conditions = this.state.questionsArr[currentPage].conditions;
    let arrLength = questionsArray.length;
    let target = [];
    let unMetTarget = [];

    if (conditions.length > 0 && questionsArray[currentQuesIndx].answer) {
      this.getConditionalTarget(
        conditions,
        questionsArray[currentQuesIndx].answer,
        questionsArray[currentQuesIndx].questionType,
        questionsArray[currentQuesIndx].properties,
        target,
        unMetTarget,
        false
      );


      if (unMetTarget) {
        for (let k = 0; k < unMetTarget.length; k++) {
          if (
            unMetTarget[k].hasOwnProperty("multifield") &&
            unMetTarget[k].multifield.length > 0
          ) {
            for (let j = 0; j < unMetTarget[k].multifield.length; j++) {
              for (let i = 0; i < questionsArray.length; i++) {
                if (
                  unMetTarget[k].multifield[j].value ===
                  questionsArray[i].handler
                ) {
                  if (unMetTarget[k].do === "show_multiple") {
                    questionsArray[i].isHide = false;
                  } else if (unMetTarget[k].do === "hide_multiple") {
                    questionsArray[i].isHide = false;
                  }
                  break;
                }
              }
            }
          } else {
            for (let i = 0; i < questionsArray.length; i++) {
              if (unMetTarget[k].handler === questionsArray[i].handler) {
                if (unMetTarget[k].do === "show") {
                  questionsArray[i].isHide = false;
                } else if (unMetTarget[k].do === "hide") {
                  questionsArray[i].isHide = false;
                }
              }
            }
          }
        }
      }
      if (target) {
        for (let k = 0; k < target.length; k++) {
          if (
            target[k].hasOwnProperty("multifield") &&
            target[k].multifield.length > 0
          ) {
            for (let j = 0; j < target[k].multifield.length; j++) {
              for (let i = 0; i < questionsArray.length; i++) {
                if (
                  target[k].multifield[j].value ===
                  questionsArray[i].handler
                ) {
                  if (target[k].do === "show_multiple") {
                    questionsArray[i].isHide = false;
                  } else if (target[k].do === "hide_multiple") {
                    questionsArray[i].isHide = true;
                  }
                  break;
                }
              }
            }
          } else {
            for (let i = 0; i < questionsArray.length; i++) {
              if (target[k].handler === questionsArray[i].handler) {
                if (target[k].do === "show") {
                  questionsArray[i].isHide = false;
                } else if (target[k].do === "hide") {
                  questionsArray[i].isHide = true;
                }
              }
            }
          }
        }
      }
    }

    let hiddenQuestions = []

    for (let i = 0; i < questionsArray.length; i++) {
      if (
        questionsArray[i].isHide && questionsArray[i].isHide === true
      ) {
        hiddenQuestions.push(questionsArray[i].uniqueID)
      }
    }

    return hiddenQuestions;
  }

  /** remove hidden question from main questionsArray 
   *  @param questionsArray - survey question array
  */
  removeHiddenQuestion(questionsArray) {
    let questions = []
    let aviMultifiled = this.getIfMultifiledAvailable(questionsArray)
    for (let i = 0; i < questionsArray.length; i++) {
      let handlerData = questionsArray[i].handler
      if (
        !questionsArray[i].isHide || questionsArray[i].isHide === false
      ) {
        questions.push(questionsArray[i])
      }
      else if (aviMultifiled && aviMultifiled.some(obj => obj.value === handlerData)) {
        /** condition added for if hide element is contain by any other looping question then not hide that element
         *  to solve error hide element out side looping is also hiding in loop question so added this condition
        */
        questions.push(questionsArray[i])
      }
      // else if (questionsArray[i].conditions && questionsArray[i].conditions.length > 0) {
      //   /** condition added for if hide element is contain any condtion then not hide that element 
      //    *  to solve error hide element out side looping is also hiding in loop question so added this condition
      //   */
      //   let targetData = questionsArray[i].conditions[0].target
      //   console.log('Target condition', targetData)
      //   if (targetData && targetData.do == 'loop') {
      //     questions.push(questionsArray[i])
      //   }
      // }

    }
    return questions
  }

  /** getting if multifiled is available in looping condition */
  getIfMultifiledAvailable(questionsArray) {
    for (let j = 0; j < questionsArray.length; j++) {
      let conditionTemp = questionsArray[j].conditions
      if (conditionTemp && conditionTemp.length > 0) {
        for (let k = 0; k < conditionTemp.length; k++) {
          if (conditionTemp[k].target.do == "loop" && conditionTemp[k].target.hasOwnProperty('multifield')) {
            let targetMultifiled = conditionTemp[k].target.multifield
            return (targetMultifiled && targetMultifiled.length > 0) ? targetMultifiled : []
          }
        }
      }
    }
  }

  /* check Previous Post Inprogress */
  checkPreviousPostInprogress() {
    let queueCompleted = true;
    if (questionResponseQue.length > 0) {
      questionResponseQue.map(result => {
        if (result === false) {
          queueCompleted = false;
        }
      });
    }
    return queueCompleted;
  }

  /**
   * checking for the no return condition
   * @param {questionarray} validate current question no return property 
   * @param currentQuesIndx - current question index
   * if current question include no return property, reset questions 
   */
  async checkNoReturnQues(question, currentQuesIndx, isFromRetry) {
    try {

      let mid = this.state.missionId.toString();

      let queueCompleted = this.checkPreviousPostInprogress();
      if (queueCompleted == false && isFromRetry != true) {
        //Constants.showSnack(this.state.translation[this.state.Language].Processing_Msg);
        Constants.showSnack(this.state.translation[this.state.Language].Processing_Msg, true).then(() => {
          this.decrement('swipe', 100)
        });
        this.setState({ isNoReturncheck: false });
        return;
      }

      this.setState({ isNoReturncheck: true });

      let hiddenQuestions = this.getHiddenQuestions(currentQuesIndx);
      let apiKey = await AsyncStorage.getItem("api_key");
      let url =
        Constants.BASE_URL + Service.VALIDATE_NO_RETURN + this.state.missionId + '&survey_id=' + question.survey_id + '&question_id=' + question.questionID
        + '&survey_answer_tag_id=' + question.surveyAnsTagId + '&unique_id=' + question.uniqueID;
      let post_object = {
        hideList: hiddenQuestions
      }

      let post_object_offine = {}
      post_object_offine.mission_id = this.state.missionId;
      post_object_offine.survey_id = question.survey_id;
      post_object_offine.question_id = question.questionID;
      post_object_offine.survey_answer_tag_id = question.surveyAnsTagId;
      post_object_offine.unique_id = question.uniqueID;
      post_object_offine.hideList = hiddenQuestions;
      post_object_offine.noreturn = 1;

      /** set forcefully offline if user profile set offine true then survey submit should be offline*/
      let setOffline = await AsyncStorage.getItem('setOffline') || false;   // not in use

      NetInfo.fetch().then(async (state) => {
        status = state.isConnected ? "online" : "offline";
        if (status === "online" && this.state.isSlowNetwork != true) {
          axios
            .post(url, post_object, {
              headers: {
                "Content-Type": "application/json",
                Auth: apiKey
              },
              timeout: Constants.TIMEOUT
            })
            .then(response => {
              let mission_id = this.state.missionId.toString() + '_LastAccess';
              Constants.saveKey(mission_id, '');
              post_object_offine.survey_answer_tag_id = response.data.survey_answer_tag_id;
              if (tmpList.length > 0) {
                let match = false;
                for (let k = 0; k < tmpList.length; k++) {
                  if (tmpList[k].noreturn && tmpList[k].noreturn === 1 && tmpList[k].question_id == post_object_offine.question_id) {
                    tmpList[k] = post_object_offine;
                  }
                }
                if (match === false) {
                  tmpList.push(post_object_offine);
                }
                Constants.saveKey("inp_" + mid, JSON.stringify(tmpList));

              } else {
                tmpList.push(post_object_offine);
                Constants.saveKey("inp_" + mid, JSON.stringify(tmpList));
              }
              let tempBackupArray = this.state.questionsArr.slice(0, currentQuesIndx + 1)
              tempBackupArray = this.state.questionBackupArr.concat(tempBackupArray)
              this.setState(
                {
                  isLoading: true,
                  isNoReturncheck: false,
                  questionBackupArr: tempBackupArray
                },
                _ => {
                  Constants.saveKey('questionBackupArr_' + mid, JSON.stringify(this.state.questionBackupArr));
                  let questionsArray = this.state.questionsArr.slice(currentQuesIndx + 1);
                  let filteredQuestions = this.removeHiddenQuestion(questionsArray);
                  if (filteredQuestions.length > 0) {
                    this.addQuestionBasedOnChoiceType(filteredQuestions);
                    pageIndex = 0;
                    this.setState(
                      {
                        arrLength: filteredQuestions.length,
                        questionsArr: filteredQuestions,
                        nextPage: filteredQuestions.length > 1 ? 1 : 0,
                        prevpage: 0,
                        pageCount: 0,
                        leftDisable: true,
                        rightDisable: filteredQuestions.length === 1,
                        isLoading: false
                      });
                  } else {
                    let questionObj = this.questionPostObject(currentQuesIndx);
                    this.postAnswerToServer(questionObj, currentQuesIndx, true, 0);
                  }
                });

            }
            )
            .catch(error => {
              // Constants.showSnack(error.response.data.message)
              let tempBackupArray = this.state.questionsArr.slice(0, currentQuesIndx + 1)
              tempBackupArray = this.state.questionBackupArr.concat(tempBackupArray)
              /** Error message |  True - for is from noreturn | send upto no return array */
              this.showMandatoryError(error.response.data.message, true, tempBackupArray, currentQuesIndx)
              this.setState(
                {
                  isNoReturncheck: false
                });
            });
        }
        else {
          let mission_id = this.state.missionId.toString() + '_LastAccess';
          Constants.saveKey(mission_id, '');
          if (tmpList.length > 0) {
            let match = false;
            for (let k = 0; k < tmpList.length; k++) {
              if (tmpList[k].noreturn && tmpList[k].noreturn === 1 && tmpList[k].question_id == post_object_offine.question_id) {
                tmpList[k] = post_object_offine;
              }
            }
            if (match === false) {
              tmpList.push(post_object_offine);
            }
            Constants.saveKey("inp_" + mid, JSON.stringify(tmpList));

          } else {
            tmpList.push(post_object_offine);
            Constants.saveKey("inp_" + mid, JSON.stringify(tmpList));
          }

          let tempBackupArray = this.state.questionsArr.slice(0, currentQuesIndx + 1)
          tempBackupArray = this.state.questionBackupArr.concat(tempBackupArray)
          this.setState(
            {
              isLoading: true,
              isNoReturncheck: false,
              questionBackupArr: tempBackupArray
            },
            _ => {
              Constants.saveKey('questionBackupArr_' + mid, JSON.stringify(this.state.questionBackupArr));
              let questionsArray = this.state.questionsArr.slice(currentQuesIndx + 1);
              let filteredQuestions = this.removeHiddenQuestion(questionsArray);
              if (filteredQuestions.length > 0) {
                this.addQuestionBasedOnChoiceType(filteredQuestions);
                pageIndex = 0;
                this.setState(
                  {
                    arrLength: filteredQuestions.length,
                    questionsArr: filteredQuestions,
                    nextPage: filteredQuestions.length > 1 ? 1 : 0,
                    prevpage: 0,
                    pageCount: 0,
                    leftDisable: true,
                    rightDisable: filteredQuestions.length === 1,
                    isLoading: false
                  });
              } else {
                let questionObj = this.questionPostObject(currentQuesIndx);
                this.postAnswerToServer(questionObj, currentQuesIndx, true, 0);
              }
            });

        }
      })

    } catch (err) {
      Constants.showSnack(err.message);
      this.setState(
        {
          isNoReturncheck: false
        });
    }
  }

  /** validate current question condition 
    * @param answer - answer for validate
  */
  executeConditions(answer) {
    let currentPage = this.state.pageCount;
    let questionsArray = this.state.questionsArr;
    let conditions = questionsArray[currentPage].conditions;
    let arrLength = questionsArray.length;
    let target = [];
    let unMetTarget = [];

    this.getConditionalTarget(
      conditions,
      answer,
      questionsArray[currentPage].questionType,
      questionsArray[currentPage].properties,
      target,
      unMetTarget,
      false
    );


    if (unMetTarget) {
      for (let k = 0; k < unMetTarget.length; k++) {
        if (
          unMetTarget[k].hasOwnProperty("multifield") &&
          unMetTarget[k].multifield.length > 0
        ) {
          for (let j = 0; j < unMetTarget[k].multifield.length; j++) {
            for (let i = 0; i < questionsArray.length; i++) {
              if (
                unMetTarget[k].multifield[j].value === questionsArray[i].handler
              ) {
                if (unMetTarget[k].do === "show_multiple") {
                  questionsArray[i].isHide = false;
                } else if (unMetTarget[k].do === "hide_multiple") {
                  questionsArray[i].isHide = false;
                }
                break;
              }
            }
          }
        } else {
          for (let i = 0; i < questionsArray.length; i++) {
            if (unMetTarget[k].handler === questionsArray[i].handler) {
              if (unMetTarget[k].do === "show") {
                questionsArray[i].isHide = false;
              } else if (unMetTarget[k].do === "hide") {
                questionsArray[i].isHide = false;
              }
            }
          }
        }
      }
    }
    if (target) {
      for (let k = 0; k < target.length; k++) {
        if (
          target[k].hasOwnProperty("multifield") &&
          target[k].multifield.length > 0
        ) {
          for (let j = 0; j < target[k].multifield.length; j++) {
            for (let i = 0; i < questionsArray.length; i++) {
              if (target[k].multifield[j].value === questionsArray[i].handler) {
                if (target[k].do === "show_multiple") {
                  questionsArray[i].isHide = false;
                } else if (target[k].do === "hide_multiple") {
                  questionsArray[i].isHide = true;
                }
                break;
              }
            }
          }
        } else {
          for (let i = 0; i < questionsArray.length; i++) {
            if (target[k].handler === questionsArray[i].handler) {
              if (target[k].do === "show") {
                questionsArray[i].isHide = false;
              } else if (target[k].do === "hide") {
                questionsArray[i].isHide = true;
              }
            }
          }
        }
      }
    }
    let nextExists = false;

    if (currentPage == arrLength - 1) {
      nextExists = false;
    } else {
      for (let i = currentPage; i < questionsArray.length; i++) {
        if (
          i > currentPage &&
          (!questionsArray[i].isHide || questionsArray[i].isHide === false)
        ) {
          nextExists = true;
          break;
        }
      }
      if (nextExists === true) {
        this.actionForUpdateNextIcon();
      }
    }
  }

  /** this is pager previous action
  * @param from - from where navigate
  */
  decrement(from, time) {
    if (this.state.videoProcessing === true) {
      Constants.showSnack(this.state.translation_common[this.state.Language].Processing_Image);
      return false;
    }
    Keyboard.dismiss();
    let currentPage = this.state.pageCount;
    let prevPage = 0;
    let questionsArray = this.state.questionsArr;
    let arrLength = questionsArray.length;
    let prevExists = false;
    let prevQuesIdx = currentPage - 1;

    if (
      questionsArray[prevQuesIdx] &&
      questionsArray[prevQuesIdx].questionType === "upload"
    ) {
      if (questionsArray[prevQuesIdx].answer && questionsArray[prevQuesIdx].answer.media_type && questionsArray[prevQuesIdx].answer.media_type === 'audio') {
        const filepath = questionsArray[prevQuesIdx].answer
          ? questionsArray[prevQuesIdx].answer.media
          : null;
        if (filepath) {
          this.resetSound("paused");
        }
      }
    }

    for (let i = currentPage; i >= 0; i--) {
      if (
        i < currentPage &&
        (!questionsArray[i].isHide || questionsArray[i].isHide === false)
      ) {
        prevPage = i;
        break;
      }
    }

    let page = prevPage;
    if (prevPage == 0) {
      prevExists = false;
    } else {
      for (let i = prevPage; i >= 0; i--) {
        if (
          i < prevPage &&
          (!questionsArray[i].isHide || questionsArray[i].isHide === false)
        ) {
          prevExists = true;
          page = i;
          break;
        }
      }
    }
    if (from === 'swipe' && questionsArray[prevQuesIdx] && questionsArray[prevQuesIdx].hasOwnProperty('isHide') && questionsArray[prevQuesIdx].isHide === true) { time = 0 }
    this.actionForNavPrevIcon(prevPage, prevExists, currentPage, page, time);
  }

  /**
   * return keyboard type based on inputType
   * @param contentType - current input type
   * */
  inputType(contentType) {
    let type;
    if (contentType === "email") {
      type = "email-address";
    } else if (contentType === "number") {
      type = "numeric";
    } else {
      type = "default";
    }
    return type;
  }

  /**
   * captureImage 
   * @param questionArray - survey question array
   * @param index - current index
   * */
  async captureImage(questionArray, index) {
    // this.backHandler.remove();
    Constants.saveKey("pageIndex", this.state.pageCount.toString());
    global.pageIndex = index;
    if (questionArray.questionType === "barcode") {
      if (Platform.OS === "android") {
        this.requestCameraPermission(questionArray, questionArray.questionType);
      } else {
        check(PERMISSIONS.IOS.CAMERA).then(response => {
          if (response == 'granted') {
            this.props.navigation.navigate('BarCodeScanner', { imageProperty: questionArray.properties });
          } else if (response == 'unavailable' || response == 'denied' || response == 'blocked') {
            request(PERMISSIONS.IOS.CAMERA).then(response => {
              if (response == 'granted') {
                this.props.navigation.navigate('BarCodeScanner', { imageProperty: questionArray.properties });
              } else {
                // Constants.showSnack('Eolas needs access to your camera to scan barcode')
                this.askPermissionAlert(this.state.translation[this.state.Language].Camera_Barcode_Permission)
              }
            });
          } else {
            // Constants.showSnack('Eolas needs access to your camera to scan barcode')
            this.askPermissionAlert(this.state.translation[this.state.Language].Camera_Barcode_Permission)
          }
        });
      }
    } else {
      if (Platform.OS === "android") {
        this.requestCameraPermission(questionArray, questionArray.questionType);
      } else {
        check(PERMISSIONS.IOS.CAMERA).then(response => {
          if (response == 'granted') {
            this.props.navigation.navigate('TakePicture', { imageProperty: questionArray.properties });
          }
          else if (response == 'unavailable' || response == 'denied' || response == 'blocked') {
            request(PERMISSIONS.IOS.CAMERA).then(response => {
              if (response == 'granted') {
                this.props.navigation.navigate('TakePicture', { imageProperty: questionArray.properties });
              } else {
                this.askPermissionAlert(this.state.translation[this.state.Language].Camera_TakePicture_Permission)
                // Constants.showSnack('Eolas needs access to your camera to take pictures for survey')
              }
            });
          }
          else {
            this.askPermissionAlert(this.state.translation[this.state.Language].Camera_TakePicture_Permission)
            // Constants.showSnack('Eolas needs access to your camera to take pictures for survey')
          }
        });
      }
    }
  }

  /* ask camera permission */
  async requestCameraPermission(questionArray, type) {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: this.state.translation[this.state.Language].Permission_Title,
          message: this.state.translation[this.state.Language].Camera_General_Permission
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        Keyboard.dismiss();
        if (type === "barcode") {
          this.props.navigation.navigate("BarCodeScanner", {
            imageProperty: questionArray.properties
          });
        }
        else {
          this.props.navigation.navigate("TakePicture", {
            imageProperty: questionArray.properties
          });
        }
      } else {
        // Constants.showSnack(
        //   "Eolas needs access to your camera"
        // );
        this.askPermissionAlert(this.state.translation[this.state.Language].Camera_General_Permission)
      }
    } catch (err) { }
  }
  askPermissionAlert = (message) => {
    Alert.alert(
      this.state.translation[this.state.Language].Permission_Title,
      message,
      [
        {
          text: this.state.translation[this.state.Language].Cancel,
          onPress: () => { },
          style: "cancel"
        },
        {
          text: this.state.translation[this.state.Language].OK,
          onPress: () => {
            openSettings().catch(() => console.log('cannot open settings'));
          }
        }
      ],
      { cancelable: false }
    )
  }


  /**
   * Section header click handler method
   * @param index - header section position
   * @param isClick - to check whether header section expanded or not
   * @param isMultiple - check is it multi choice or single choice
   * @param parentIndex - the main index of whole question array/question position in view pager
   * */
  multiHeader(index, isClick, isMultiple, parentIndex) {
    const {
      multiLevelTrueSingleChoiceOuterArray,
      multiLevelTrueMultiChoiceOuterArray
    } = this.state;
    let questionCopy;
    if (isMultiple) {
      questionCopy = JSON.parse(
        JSON.stringify(multiLevelTrueMultiChoiceOuterArray[parentIndex].data)
      );
      questionCopy[index].headerClicked = !isClick;

      multiLevelTrueMultiChoiceOuterArray[parentIndex].data = questionCopy;

      this.setState({
        multiLevelTrueMultiChoiceOuterArray: multiLevelTrueMultiChoiceOuterArray
      });
    } else {
      questionCopy = JSON.parse(
        JSON.stringify(multiLevelTrueSingleChoiceOuterArray[parentIndex].data)
      );
      questionCopy[index].headerClicked = !isClick;
      multiLevelTrueSingleChoiceOuterArray[parentIndex].data = questionCopy;
      this.setState({
        multiLevelTrueSingleChoiceOuterArray: multiLevelTrueSingleChoiceOuterArray
      });
    }
  }

  /**
   * multi level and single selection
   * @param childIndex - this is child array position
   * @param headerIndex- this is parent array position
   * @param subItem - this is child array object in this case "sublabel" object
   * @param parentPosition - the main index of whole question array/question position in view pager
   * */
  singleCheck(
    childIndex,
    headerIndex,
    subItem,
    parentIndex,
    questionIndex,
    questionArray
  ) {
    let selectedItems = [];
    let answer;
    const { multiLevelTrueSingleChoiceOuterArray } = this.state;
    let questionCopy = JSON.parse(
      JSON.stringify(multiLevelTrueSingleChoiceOuterArray[parentIndex].data)
    );

    questionCopy.map((parentItem, parentIndex) => {
      parentItem.data.map((childItem, childIndex) => {
        if (childItem.isClicked == true) {
          questionCopy[parentIndex].data[childIndex].isClicked = false;
        }
      });
    });
    questionCopy[headerIndex].data[childIndex].isClicked = !subItem.isClicked;
    multiLevelTrueSingleChoiceOuterArray[parentIndex].data = questionCopy;
    this.setState({
      multiLevelTrueSingleChoiceOuterArray: multiLevelTrueSingleChoiceOuterArray
    });

    /**
     * Iterate through question array and only added clicked items to {@link selectedItems}
     * */
    questionCopy.map((item, pos) => {
      item.data.map(dataItem => {
        if (dataItem.isClicked) {
          let obj = {
            id: item.id,
            label: item.title,
            sub_id: dataItem.id,
            sublabel: dataItem.sublabel,
            label_image: item.image && item.image.uri ? item.image.uri : "",
            remote_label_image: item.remote_image ? item.remote_image : "",
            sub_label_image: dataItem.label_image,
            remote_sub_label_image: dataItem.remote_label_image ? dataItem.remote_label_image : ""
          };
          selectedItems.push(obj);
        }
        if (item.id !== 'other') {
          this.state.questionsArr[questionIndex].answer && this.state.questionsArr[questionIndex].answer.other_value ?
            delete this.state.questionsArr[questionIndex].answer.other_value : ''
        }
      });
    });

    /* create answer object */
    answer = {
      choice_type: "single",
      multilevel: 1,
      selected_option: selectedItems
    };
    questionArray.answer = answer; // replace answer object
    questionArray.isUpdated = true;
    let localArray = this.state.questionsArr;
    localArray[questionIndex] = questionArray; // replace question object
    this.setState(
      {
        questionsArr: localArray
      },
      _ => {
        if (this.state.rightDisable === true) {
          this.executeConditions(answer);
        }
      }
    );
  }

  /**
   * multi level and multi selection
   * @param childIndex - this is child array position
   * @param headerIndex- this is parent array position
   * @param subItem - this is child array object in this case "sublabel" object
   * @param parentPosition - the main index of whole question array/question position in view pager
   * */
  multipleCheck(
    childIndex,
    headerIndex,
    subItem,
    parentIndex,
    questionIndex,
    questionArray
  ) {
    let selectedItems = [];
    let answer;
    const { multiLevelTrueMultiChoiceOuterArray } = this.state;
    let questionCopy = JSON.parse(
      JSON.stringify(multiLevelTrueMultiChoiceOuterArray[parentIndex].data)
    );
    subItem.isClicked = !subItem.isClicked;
    questionCopy[headerIndex].data[childIndex] = subItem;

    /** Logic of non of above */
    questionCopy.map((obj1) => {
      obj1.data.map(obj2 => {
        if (subItem.id == "noneofabove" && obj2.id != "noneofabove") {
          obj2.isClicked = false
        }
        else if (subItem.id != "noneofabove" && obj2.id == "noneofabove") {
          obj2.isClicked = false
        }
        else {
          subItem.isClicked = subItem.isClicked
        }
      })
    })

    multiLevelTrueMultiChoiceOuterArray[parentIndex].data = questionCopy;
    this.setState({
      multiLevelTrueMultiChoiceOuterArray: multiLevelTrueMultiChoiceOuterArray
    });

    /**
     * Iterate through question array and only added clicked items to {@link selectedItems}
     * */
    questionCopy.map((item, pos) => {
      item.data.map(dataItem => {
        if (dataItem.isClicked) {
          let obj = {
            id: item.id,
            label: item.title,
            label_image: item.image && item.image.uri ? item.image.uri : "",
            remote_label_image: item.remote_image ? item.remote_image : "",
            sublabel: dataItem.sublabel,
            sublabel_id: dataItem.id,
            sub_label_image: dataItem.label_image,
            remote_sub_label_image: dataItem.remote_label_image ? dataItem.remote_label_image : ""
          };
          selectedItems.push(obj);
          if (item.id !== 'other') {
            this.state.questionsArr[questionIndex].answer && this.state.questionsArr[questionIndex].answer.other_value ?
              delete this.state.questionsArr[questionIndex].answer.other_value : ''
          }
        }
      });
    });

    /* create answer object */
    answer = {
      choice_type: "multiple",
      multilevel: 1,
      selected_option: selectedItems
    };
    questionArray.answer = answer; // replace answer object
    questionArray.isUpdated = true;
    let localArray = this.state.questionsArr;
    localArray[questionIndex] = questionArray; // replace question object
    this.setState(
      {
        questionsArr: localArray
      },
      _ => {
        if (this.state.rightDisable === true) {
          this.executeConditions(answer);
        }
      }
    );
  }

  /** change check box image based on user clicked 
  * @param isClick - boolian value for is click
  */
  imageCheckBox(isClick) {
    let img;
    if (isClick) {
      img = require("../../images/survey/check_fill.png");
    } else {
      img = require("../../images/survey/check_no_fill.png");
    }

    return img;
  }

  /* change expand image based on user clicked */
  headerClickImage(isClick) {
    let img;
    if (isClick) {
      img = require("../../images/survey/minimise.png");
    } else {
      img = require("../../images/survey/plus.png");
    }

    return img;
  }

  /**
   * single level and single selection
   * @param parentPosition - main index position
   * @param clickedIndex - cliked index
   * @param questionIndex - current question index
   * */
  singleLevelCheck(parentPosition, clickedIndex, questionIndex, questionArray) {
    let { multiLevelFalseSingleChoiceOuterArray } = this.state;
    let questionCopy = JSON.parse(
      JSON.stringify(multiLevelFalseSingleChoiceOuterArray[parentPosition].data)
    );
    let selectedItems = [];
    let answer = "";
    /**
     * Iterate through question array and only add clicked items to {@link selectedItems}
     * */
    questionCopy.map((item, index) => {
      item.isClicked = index === clickedIndex ? !item.isClicked : false;
      if (item.isClicked) {
        answer = {
          choice_type: "single",
          multilevel: 0,
          id: item.id,
          label: item.label,
          label_image: item.label_image,
          remote_label_image: item.remote_label_image ? item.remote_label_image : ""
        };
        if (item.id !== 'other') {
          this.state.questionsArr[questionIndex].answer && this.state.questionsArr[questionIndex].answer.other_value ?
            delete this.state.questionsArr[questionIndex].answer.other_value : ''
        }
      }
      selectedItems.push(item);
    });
    multiLevelFalseSingleChoiceOuterArray[parentPosition].data = selectedItems; //replace question object
    this.setState({
      multiLevelFalseSingleChoiceOuterArray: multiLevelFalseSingleChoiceOuterArray
    });

    questionArray.answer = answer; //replace answer object
    questionArray.isUpdated = true;
    let localArray = this.state.questionsArr;
    localArray[questionIndex] = questionArray; //replace question array
    this.setState(
      {
        questionsArr: localArray
      },
      _ => {
        if (this.state.rightDisable === true) {
          this.executeConditions(answer);
        }
      }
    );
  }

  /**
   * single level and multi selection
   * */
  singleLevelMultiCheck(
    index,
    item,
    parentPosition,
    questionIndex,
    questionArray
  ) {
    let selectedItems = [];
    let answer;
    const { multiLevelFalseMultiChoiceOuterArray } = this.state;
    let questionCopy = JSON.parse(
      JSON.stringify(multiLevelFalseMultiChoiceOuterArray[parentPosition].data)
    );
    item.isClicked = !item.isClicked;
    questionCopy[index] = item;

    let queProperty = questionArray && questionArray.properties
    if (queProperty && queProperty.setlimit == 1) {
      if (queProperty.setlimit_type == "setminmaxlimit") {
        var filteredArray = questionCopy.filter(function (element) { return element.isClicked == true })
        let selectedObjLenth = filteredArray && filteredArray.length
        if (selectedObjLenth > queProperty.maxlimit) {
          item.isClicked = false
          Constants.showSnack('Please select maximum ' + queProperty.maxlimit + ' options only')
        }
        else {
          item.isClicked = item.isClicked
        }
      }
      else {
        questionCopy.map((obj, pos) => {
          if (item.id == "noneofabove" && obj.id != "noneofabove") {
            obj.isClicked = false
          }
          else if (item.id != "noneofabove" && obj.id == "noneofabove") {
            obj.isClicked = false
          }
          else {
            item.isClicked = item.isClicked
          }
        })
      }
    }

    multiLevelFalseMultiChoiceOuterArray[parentPosition].data = questionCopy;
    this.setState({
      multiLevelFalseMultiChoiceOuterArray: multiLevelFalseMultiChoiceOuterArray
    });

    /**
     * Iterate through question array and only add clicked items to {@link selectedItems}
     * */
    questionCopy.map((item, pos) => {
      if (item.isClicked) {
        let obj = {
          id: item.id,
          label: item.label,
          label_image: item.label_image,
          remote_label_image: item.remote_label_image ? item.remote_label_image : ""
        };
        selectedItems.push(obj);
        if (item.id !== 'other') {
          this.state.questionsArr[questionIndex].answer && this.state.questionsArr[questionIndex].answer.other_value ?
            delete this.state.questionsArr[questionIndex].answer.other_value : ''
        }
      }
    });
    answer = {
      choice_type: "multiple",
      multilevel: 0,
      selected_option: selectedItems
    };
    questionArray.answer = answer; //replace answer object
    questionArray.isUpdated = true;
    let localArray = this.state.questionsArr;
    localArray[questionIndex] = questionArray; //replace question array
    this.setState(
      {
        questionsArr: localArray
      },
      _ => {
        if (this.state.rightDisable === true) {
          this.executeConditions(answer);
        }
      }
    );
  }

  /* return current question image source */
  setCaptureAnswer(questionArray) {
    let capture = "";
    if (
      questionArray.answer !== null &&
      questionArray.answer !== "" &&
      questionArray.hasOwnProperty("answer")
    ) {
      capture = { uri: questionArray.answer.image };
      imageWidth = 260;
      imageHeight = 360;
    }
    return capture;
  }

  /* To set view style based on answer or captured image */
  viewStyle(questionsArr) {
    if (questionsArr.answer == null || questionsArr.answer === "") {
      isCaptureImageAdded = false;
      return {
        marginTop: 100,
        alignSelf: "center"
      };
    } else {
      isCaptureImageAdded = true;
      return {
        position: "absolute",
        right: 0,
        top: -10
      };
    }
  }

  /**
   * To set answer for scan type from question object if it is available
   * @param questionArray - the object of question
   * */
  setScanAnswer(questionArray) {
    let capture = "";
    if (
      questionArray.answer !== null &&
      questionArray.answer !== "" &&
      questionArray.hasOwnProperty("answer")
    ) {
      capture = { uri: questionArray.answer.image };
      imageWidth = 260;
      imageHeight = 360;
    }
    return capture;
  }

  /**
   * To set view style based on answer or captured image
   * @param questionArray - the object of question
   * */
  scanStyle(questionsArr) {
    if (
      questionsArr.answer == null ||
      questionsArr.answer === "" ||
      !questionsArr.answer.hasOwnProperty("image")
    ) {
      isBarcodeImageAdded = false;
      return {
        marginTop: 100,
        alignSelf: "center"
      };
    } else {
      isBarcodeImageAdded = true;
      return {
        position: "absolute",
        right: 0,
        top: -10
      };
    }
  }

  /* save last access question position */
  saveSurvey = () => {
    let questionArr_temp = {
      questionArr: JSON.stringify(this.state.questionsArr),
      nextPage: LastAccess_nextPage,
      prevpage: LastAccess_prevPage,
      pageCount: LastAccess_pageCount
    }
    let mission_id = this.state.missionId.toString() + '_LastAccess';
    questionArr_temp = JSON.stringify(questionArr_temp);
    Constants.saveKey(mission_id, questionArr_temp);
  }

  /* user when click back button navigate to mission list */
  onBackButtonPressAndroid = () => {
    let queueCompleted = true;
    let { isLoading } = this.state;
    if (questionResponseQue.length > 0) {
      if (isLoading === false) {
        this.setState({ isLoading: true });
      }
      questionResponseQue.map(result => {
        if (result === false) {
          queueCompleted = false;
        }
      });
    }
    if (queueCompleted === true) {
      this.setState({ isLoading: false });
      backBtnFired = false;
      // Reset Stack
      // const resetAction = StackActions.reset({
      //   index: 0,
      //   actions: [NavigationActions.navigate({ routeName: "TabContainerBase" })]
      // });
      // this.props.navigation.dispatch(resetAction);
      const resetAction = CommonActions.reset({
        index: 0,
        routes: [{ name: 'TabContainerBase' }],
      });
      this.props.navigation.dispatch(resetAction);
    }
    return true;
  };

  /**
   * Get from Header view child
   */
  getFromHeaderChild = loading => {
    backBtnFired = true;
    this.setState({
      isLoading: loading
    });
  };

  /* set answer for inputtype question */
  setAnswerForInput(questionArray) {
    let inputAnswer = questionArray.answer;
    inputAnswer !== null ? inputAnswer : "";
    if (typeof inputAnswer === "string") {
      inputAnswer = inputAnswer !== null ? inputAnswer : "";
    } else if (inputAnswer) {
      inputAnswer = inputAnswer.text;
    }
    return inputAnswer !== null ? inputAnswer : "";
  }


  /* set answer for choice question other option textbox */
  setAnswerForOtherInput(questionArr, questionIndex) {
    let inputAnswer = questionArr.answer;
    if (inputAnswer) {
      return inputAnswer.other_value ? inputAnswer.other_value : "";
    }
    return "";
  }

  /* unused function */
  setWidthForInput(questionArray) {
    let length = 20;
    if (questionArray.properties.hasOwnProperty("length")) {
      length = questionArray.properties.length;
    }
    return length != null ? length * 5 : 0;
  }

  /**
   * update edit answer
   * @param questionArray - question array
   * @param answer - update answer for textinput 
   * */
  updateTextInput(questionArray, answer, index) {
    questionArray.answer = {
      text: answer
    };
    questionArray.isUpdated = true;
    let localArray = this.state.questionsArr;
    localArray[index] = questionArray;
    this.setState(
      {
        questionsArr: localArray
      },
      _ => {
        if (this.state.rightDisable === true) {
          this.executeConditions(answer);
        }
      }
    );
  }

  /**
   * Text input render method
   * @param - questionArray - Get question array and render value
   * @param - parentIndex - this is parent index to get particular question object
   * @return - it will return layout style for text input question
   * */
  layoutTextInputType(questionArray, parentIndex) {
    return (
      <View>
        <View style={styles.textBox}>
          <TextInput
            style={styles.InputText}
            value={this.setAnswerForInput(questionArray)}
            keyboardType={this.inputType(questionArray.properties.content_type)}
            multiline={true}
            onChangeText={answer =>
              this.updateTextInput(questionArray, answer, parentIndex)
            }
            underlineColorAndroid={Color.colorWhite}
          />
        </View>
        {/* <Text style={styles.hintText}>{questionArray.properties.sublabel}</Text> */}
        {questionArray.properties.hasOwnProperty("sublabel") && questionArray.properties.sublabel.length > 0 ?
          <RenderHtml
            source={{
              html: questionArray.properties.sublabel_text ? questionArray.properties.sublabel_text : questionArray.properties.sublabel
            }}
            contentWidth={width}
            baseStyle={styles.basestyleSublable}
            //baseFontStyle={styles.hintText}
            tagsStyles={normalTagsStyles}
          /> : null}
      </View>
    );
  }

  /**
   * Capture type question render method
   * @param questionArray - currnt survey question array
   * @return - it will return layout style for capture question type
   * */
  layoutCaptureTypeQuestion(questionArray, index) {
    const {
      captureAddIconCircle,
      captureEditIconCircle,
      captureIcon,
      captureEditIcon
    } = styles;
    let isGallery = false;
    if (
      questionArray.properties.hasOwnProperty("allow_gallery") &&
      questionArray.properties.allow_gallery == 1
    ) {
      isGallery = true;
    }
    return (
      <View style={{ marginTop: Dimen.marginTen }}>
        {questionArray.answer !== null && questionArray.answer !== "" && (
          <ScalableImage
            style={{
              alignSelf: "center",
              marginBottom: 10,
              overflow: "visible"
            }}
            width={imageWidth}
            source={this.setCaptureAnswer(questionArray)}
          />
        )}

        <View style={this.viewStyle(questionArray)}>
          <TouchableOpacity
            style={
              !isCaptureImageAdded
                ? captureAddIconCircle
                : captureEditIconCircle
            }
            onPress={() => {
              //this.captureImage(questionArray, index);
              if (isGallery == true) {
                let bottomSheet = {
                  type: "capture",
                  index: index
                };
                this.setState({ bottomSheet }, () => {
                  this.RBBottomSheet.open()
                })
              }
              else {
                this.captureImage(questionArray, index);
              }
            }}
          >
            <ImageBackground
              source={cameraIconCircle}
              style={
                !isCaptureImageAdded
                  ? captureAddIconCircle
                  : captureEditIconCircle
              }
            >
              <Image
                style={!isCaptureImageAdded ? captureIcon : captureEditIcon}
                source={captureImageIcon}
              />
            </ImageBackground>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /**
   * Take photo from camera
   * @param {Number} index Currenet question array element position
   */
  photoFromCamera(index) {
    ImagePicker.openCamera({
      width: CAMERASTYLE.WIDTH,
      height: CAMERASTYLE.HEIGHT,
      includeBase64: true,
      compressQuality: CAMERASTYLE.COMPRESS_QUALITY,
      cropping: false
    })
      .then(image => {
        if (Platform.OS === "android") {
          image.map(res => {
            let mime = res.mime.split("/");
            let type = mime[1];
            let source = { uri: res.path, data: res.data, type: type };
            this.addAnswerForSelectedMedia(index, source);
          });
        } else {
          let mime = image.mime.split("/");
          let type = mime[1];
          let source = { uri: image.path, data: image.data, type: type };
          this.addAnswerForSelectedMedia(index, source);
        }
      })
      .catch(e => {
        //console.log(e);
      });
  }

  /**
   * Take video from camera
   * @param {Number} index Currenet question array element position
   */
  videoFromCamera(index) {
    if (Platform.OS == 'ios') {
      ImagePicker.openCamera({
        width: CAMERASTYLE.WIDTH,
        height: CAMERASTYLE.HEIGHT,
        includeBase64: true,
        compressQuality: CAMERASTYLE.COMPRESS_QUALITY,
        cropping: false,
        isVideo: true
      }).then(video => {
        this.setState({ videoProcessing: true });
        let mime = video.mime.split("/");
        let type = mime[1];
        let path = video.path.replace(/(^\w+:|^)\/\//, '');
        //         RNCompress.compressVideo(path, "medium").then(compressedFile => {
        // let source = { uri: compressedFile.path, data: '', type: 'mp4' };
        //             this.addAnswerForSelectedMedia(index, source);
        //     })
        ProcessingManager.compress(path, videoCompressOptions)   // like VideoPlayer compress options
          .then((compressedVideo) => {
            let compressedPath = compressedVideo.replace('file://', '')
            let source = { uri: compressedPath, data: '', type: 'mp4' };
            this.addAnswerForSelectedMedia(index, source);
          })
      });
    }
    else {
      launchCamera({
        width: CAMERASTYLE.WIDTH,
        height: CAMERASTYLE.HEIGHT,
        includeBase64: true,
        // cropping: false,
        // isVideo: true
        mediaType: 'video',
        noData: false

      }, (res) => {
        if (!res.hasOwnProperty('didCancel') && res.didCancel !== true) {
          this.setState({ videoProcessing: true });
          let videoRes = res.assets[0]
          let path = videoRes.uri;
          let ext = videoRes.type.split("/")
          let questionArr = this.state.questionsArr[index];
          let filename = questionArr.survey_id.toString() + questionArr.questionID.toString() + (new Date().getTime()).toString() + '.' + ext[1];
          let newfile = RNFS.DocumentDirectoryPath + "/" + filename;

          RNFFmpeg.execute('-i ' + path + ' -vf "scale=iw/2:ih/2" ' + newfile)
            .then(result => {
              let source = {
                uri: 'file://' + newfile,
                data: "",
                type: 'mp4'
              };
              questionResponseQue[this.state.questionsArr[index].questionID] = true;
              this.addAnswerForSelectedMedia(index, source);

            }).catch(e => {
              //console.log(e);			
            });
        }
      });
    }

  }


  /**
   * Camera permission on run time
   * @param {String} type Image | Video
   * @param {Number} index Currenet question array element position
   */
  async cameraPermission(type, index) {
    if (Platform.OS === "android") {
      if (Platform.Version >= 23 && Platform.Version < 33) {
        try {
          const grantedCamera = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: this.state.translation[this.state.Language].Permission_Title,
              message: this.state.translation[this.state.Language].Camera_General_Permission
            }
          );
          if (grantedCamera === PermissionsAndroid.RESULTS.GRANTED) {
            const grantFile = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
              {
                title: this.state.translation[this.state.Language].Permission_Title,
                message: this.state.translation[this.state.Language].External_Storage_Permission
              }
            );
            if (grantFile === PermissionsAndroid.RESULTS.GRANTED) {
              if (type === "image") {
                this.photoFromCamera(index);
              } else if (type === "video") {
                this.videoFromCamera(index);
              }
            }
            else {
              this.askPermissionAlert(this.state.translation[this.state.Language].External_Storage_Permission)
            }
          }
          else {
            this.askPermissionAlert(this.state.translation[this.state.Language].Camera_General_Permission)
          }
        } catch (err) {
          //console.warn(err)
        }
      } else {
        if (type === "image") {
          this.photoFromCamera(index);
        } else if (type === "video") {
          this.videoFromCamera(index);
        }
      }
    } else {
      setTimeout(() => {
        if (type === "image") {
          check(PERMISSIONS.IOS.CAMERA).then(response => {
            if (response == 'granted') {
              this.photoFromCamera(index);
            } else if (response == 'unavailable' || response == 'denied' || response == 'blocked') {
              request(PERMISSIONS.IOS.CAMERA).then(response => {
                if (response == 'granted') {
                  this.photoFromCamera(index);
                } else {
                  // Constants.showSnack('Eolas needs access to your camera to take picture')
                  this.askPermissionAlert(this.state.translation[this.state.Language].Camera_TakePicture_Permission)
                }
              });
            } else {
              // Constants.showSnack('Eolas needs access to your camera to take picture')
              this.askPermissionAlert(this.state.translation[this.state.Language].Camera_TakePicture_Permission)
            }
          });
        } else if (type === "video") {
          check(PERMISSIONS.IOS.CAMERA).then(response => {
            if (response == 'granted') {
              this.setState({
                showCamera: true
              }, _ => {
                //console.log(this.state.showCamera)
              })
            } else if (response == 'unavailable' || response == 'denied' || response == 'blocked') {
              request(PERMISSIONS.IOS.CAMERA).then(response => {
                if (response == 'granted') {
                  this.setState({
                    showCamera: true
                  }, _ => {
                    //console.log(this.state.showCamera)
                  })
                } else {
                  // Constants.showSnack('Eolas needs access to your camera to take video for survey')
                  this.askPermissionAlert(this.state.translation[this.state.Language].Camera_Video_Permission)
                }
              });
            } else {
              // Constants.showSnack('Eolas needs access to your camera to take video for survey')
              this.askPermissionAlert(this.state.translation[this.state.Language].Camera_Video_Permission)
            }
          });
        }
      }, Constants.GALLERY_DELAY);
    }
  }

  /**
   * Take photo from gallery
   * @param {Number} index Currenet question array element position
   */
  /*photoFromGallery(index) {
    ImagePicker.openPicker({
      compressQuality: CAMERASTYLE.COMPRESS_QUALITY,
      includeBase64: true
    }).then(image => {
      this.setState({ changeImage: true });
      if (Platform.OS === "android") {
        image.map(res => {
          let mime = res.mime.split("/");
          let type = mime[1];
          let source = { uri: res.path, data: res.data, type: type };
          this.addAnswerForSelectedMedia(index, source);
        });
      } else {
        let mime = image.mime.split("/");
        let type = mime[1];
        let source = { uri: image.path, data: image.data, type: type };
        this.addAnswerForSelectedMedia(index, source);
      }
    });
  }*/

  /**
  * Take photo from gallery
  * @param {Number} index Currenet question array element position
  */
  photoFromGallery(index) {
    if (Platform.OS == 'ios') {
      ImagePicker.openPicker({
        compressQuality: CAMERASTYLE.COMPRESS_QUALITY,
        includeBase64: true
      }).then(image => {
        this.setState({ changeImage: true })
        // let mime = image.mime.split("/");
        let imagePath = `image/${image[0].path.split('.').slice(-1)[0]}`
        let mime = imagePath.split("/");
        let type = mime[1];
        let source = { uri: image[0].path, data: image[0].data, type: type };
        this.addAnswerForSelectedMedia(index, source);
      }).catch(e => {
        //console.log(e);
      });
    }
    else {
      launchImageLibrary({
        mediaType: 'photo',
        quality: CAMERASTYLE.COMPRESS_QUALITY_IMAGE,
        // noData: false,
        // storageOptions: {
        //   skipBackup: true,
        //   path: 'images',
        // },
      }, (res) => {
        if (!res.hasOwnProperty('didCancel') && res.didCancel !== true) {
          this.setState({ changeImage: true });
          let imageRes = res.assets[0]
          let mime = imageRes.fileName.split(".");
          let type = mime[1];
          let path = imageRes.uri;
          let source = { uri: path, data: "", type: type };
          this.addAnswerForSelectedMedia(index, source);
        }
      })
        .catch(e => {
          //console.log(e);
        });
    }

  }

  /** Image tagging element image take from gallary 
   * @param {Number} index Currenet question array element position
  */
  imageTaggingFromGallary(index) {
    let questionArrtosend = this.state.questionsArr[index]
    if (Platform.OS == 'ios') {
      ImagePicker.openPicker({
        compressQuality: CAMERASTYLE.COMPRESS_QUALITY,
        includeBase64: true
      }).then(image => {
        if (image && image[0].path) {
          global.pageIndex = index;
          this.props.navigation.navigate('PreviewImage', {
            imageData: image[0].path,
            imageProperty: questionArrtosend && questionArrtosend.properties,
            isFromGallary: true
          })
        }
      }).catch(e => {
        //console.log(e);
      });
    }
    else {
      launchImageLibrary({
        mediaType: 'photo',
        quality: CAMERASTYLE.COMPRESS_QUALITY_IMAGE,
        // noData: false,
        // storageOptions: {
        //   skipBackup: true,
        //   path: 'images',
        // },
      }, (res) => {
        if (!res.hasOwnProperty('didCancel') && res.didCancel !== true) {
          let imageRes = res.assets[0]
          if (imageRes.uri) {
            global.pageIndex = index;
            this.props.navigation.navigate('PreviewImage', {
              imageData: imageRes.uri,
              imageProperty: questionArrtosend && questionArrtosend.properties,
              isFromGallary: true
            })
          }
        }
      })
        .catch(e => {
          //console.log(e);
        });
    }
  }
  /**
   * Take video from gallery
   * @param {Number} index Currenet question array element position
   */
  /* videoFromGallery(index) {
    ImagePicker.openPicker({
      compressQuality: CAMERASTYLE.COMPRESS_QUALITY,
      includeBase64: true,
      isVideo: true
    })
      .then(video => {
        this.setState({ changeImage: true, videoProcessing: true });
        if (Platform.Version == 29) {
          video.map(res => {
            let mime = res.mime.split("/");
            let type = mime[1];
         
            RNCompress.compressVideo(res.path, "low").then(compressedFile => {
             let source = { uri: compressedFile.path, data: "", type: type };
             this.addAnswerForSelectedMedia(index, source);  
          }).catch(e => {
             // console.log(e);
          });
     
          });
        }
    else{
      video.map(res => {
            let mime = res.mime.split("/");
            let type = mime[1];
         
           ProcessingManager.compress(res.path, videoCompressOptions) // compress options
              .then(compressedVideo => {
             let source = { uri: compressedVideo.source, data: "", type: type };
             this.addAnswerForSelectedMedia(index, source);  
          }).catch(e => {
             // console.log(e);
          });
          });
    }
      })
      .catch(e => {
        //console.log(e);
      });
  } */

  /**
   * Take video from gallery
   * @param {Number} index Currenet question array element position
   */
  videoFromGallery(index) {
    if (Platform.OS == 'ios') {
      ImagePicker.openPicker({
        compressQuality: CAMERASTYLE.COMPRESS_QUALITY,
        includeBase64: true,
        isVideo: true
      }).then(video => {
        this.setState({ changeImage: true, videoProcessing: true });
        let mime = video[0].mime.split("/");
        let type = mime[1];
        let path = video[0].path.replace(/(^\w+:|^)\/\//, '');
        // RNCompress.compressVideo(path, "medium").then(compressedFile => {
        //   console.log('compressedFile', compressedFile)
        // Convert to base64 
        // })
        ProcessingManager.compress(path, videoCompressOptions)   // like VideoPlayer compress options
          .then((compressedVideo) => {
            let compressedPath = compressedVideo.replace('file://', '')
            RNFetchBlob.fs.readFile(compressedPath, 'base64')
              .then((data) => {
                let base64 = data;
                let source = { uri: compressedPath, data: base64, type: 'mp4' };
                this.addAnswerForSelectedMedia(index, source);
              })
          })
      }).catch(e => {
        //console.log(e);
      });
    }
    else {
      launchImageLibrary({
        mediaType: 'video',
        //noData: false,
      }, async (res) => {
        if (!res.hasOwnProperty('didCancel') && res.didCancel !== true) {
          this.setState({ changeImage: true, videoProcessing: true });
          let videoRes = res.assets[0]
          let filepath = await RNFetchBlob.fs.stat(videoRes.uri)
          let path = 'file://' + filepath.path;
          let ext = path.substring(path.lastIndexOf("."), path.length);
          let questionArr = this.state.questionsArr[index];
          let filename = questionArr.survey_id.toString() + questionArr.questionID.toString() + (new Date().getTime()).toString() + ext;
          let newfile = RNFS.DocumentDirectoryPath + "/" + filename;

          // RNFFmpeg.execute('-i ' + path + ' -vf "scale=iw/2:ih/2" ' + newfile)
          RNFFmpeg.executeWithArguments(["-i", path, "-vf", "scale=iw/2:ih/2", newfile])
            .then(result => {
              let source = {
                uri: 'file://' + newfile,
                data: "",
                type: 'mp4'
              };
              questionResponseQue[this.state.questionsArr[index].questionID] = true;
              this.addAnswerForSelectedMedia(index, source);

            }).catch(e => {
              //console.log(e);			
            });
        }
      })
        .catch(e => {
          //console.log(e);
        });
    }
  }

  /**
   * Take audio from gallery
   * @param {Number} index Currenet question array element position
   */
  async audioFromGallery(index) {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.audio]
      });
      if (Platform.OS == 'ios') {
        let absoluteAudioPath = res.uri.replace(/(^\w+:|^)\/\//, '');
        RNFetchBlob.fs.stat(absoluteAudioPath).then((pathRes) => {
          let path = pathRes.path.replace(/(^\w+:|^)\/\//, '');
          let absoluteAudioPath = Platform.OS === 'android' ? 'file://' + path : path;
          let mime = pathRes.path.split(".");
          let type = mime[mime.length - 1];
          // Convert to base64 
          RNFetchBlob.fs.readFile(absoluteAudioPath, 'base64')
            .then((data) => {
              let base64 = data;
              let source = { uri: path, data: base64, type: type };
              this.addAnswerForSelectedMedia(index, source);
            })
        }).catch((err) => {
          //console.log("Blob not working!", err);
        });
      }
      else {
        let path = res.uri.replace(/(^\w+:|^)\/\//, "");
        let absoluteAudioPath =
          Platform.OS === "android" ? "content://" + path : path;

        const dirs = RNFetchBlob.fs.dirs;
        const min = 1;
        const max = 999999;
        const random = Math.random() * (+max - +min) + +min;
        let uploadUrl = `${dirs.CacheDir}/record${random}.mp3`;
        // uploadUrl = Platform.OS === "android" ? "file://" + uploadUrl : uploadUrl;

        let type = res.type;
        // Convert to base64
        RNFetchBlob.fs
          .readFile(absoluteAudioPath, "base64")
          .then(data => {
            RNFetchBlob.fs
              .writeFile(uploadUrl, data, "base64")
              .then(createdFile => {
                let base64 = data;
                let source = { uri: uploadUrl, data: base64, type: 'mp3' };
                this.addAnswerForSelectedMedia(index, source);
              })
              .catch(e => console.log(e));
          })
          .catch(e => console.log(e));
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        console.log(err);
      }
    }
    // DocumentPicker.pick({
    //     type: [DocumentPicker.types.audio],
    // }, (res) => {
    //     if (error) {
    //         console.log(error);
    //     } else {
    //         // Get file path
    //         let path = res.uri.replace(/(^\w+:|^)\/\//, '');
    //         let absoluteAudioPath = Platform.OS === 'android' ? 'file://' + path : path;
    //         RNFetchBlob.fs.stat(absoluteAudioPath).then((pathRes) => {
    //             let path = pathRes.path.replace(/(^\w+:|^)\/\//, '');
    //             let absoluteAudioPath = Platform.OS === 'android' ? 'file://' + path : path;
    //             let mime = pathRes.type.split("/");
    //             let type = mime[1];
    //             // Convert to base64
    //             RNFetchBlob.fs.readFile(absoluteAudioPath, 'base64')
    //                 .then((data) => {
    //                     let base64 = data;
    //                     let source = { uri: path, data: base64, type: type };
    //                     this.addAnswerForSelectedMedia(index, source);

    //                 })
    //         }).catch((err) => {
    //             console.log("Blob not working!", err);
    //         });

    //     }
    // });

    this.setState({
      pickAudioGallery: true,
      isRecordAudio: false
    });
  }

  /**
   * Take audio from audio recorder
   * @param {Number} index Currenet question array element position
   */
  audioFromRecorder = async index => {
    // Pause the audio player if it's running
    this.handleAudioPause();

    const result = await this.audioRecorderPlayer.stopRecorder();
    this.audioRecorderPlayer.removeRecordBackListener();
    if (result) {
      let audioPath = result.replace(/(^\w+:|^)\/\//, "");
      const dirs = RNFetchBlob.fs.dirs;
      let absoluteAudioPath =
        Platform.OS === "android"
          ? `${dirs.CacheDir}/record${index}.mp3`
          : audioPath;
      // Convert to base64
      RNFetchBlob.fs.readFile(absoluteAudioPath, "base64").then(data => {
        let base64 = data;
        let source = { uri: absoluteAudioPath, data: base64, type: "mp3" };
        this.setState({
          pickAudioGallery: true,
          isRecordAudio: false,
          playSeconds: 0,
          duration: 0,
          audioRecordingTime: "00:00:00",
          isAudioRecord: false
        });
        this.addAnswerForSelectedMedia(index, source);
      });
    }
  };

  /**
   * Gallery permission on run time
   * @param {String} type Image | Video
   * @param {Number} index Currenet question array element position
   */
  async galleryPermission(type, index) {
    if (Platform.OS === "android") {
      if (Platform.Version >= 23 && Platform.Version < 33) {
        const grantedCamera = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: this.state.translation[this.state.Language].Permission_Title,
            message: this.state.translation[this.state.Language].Photos_General_Permission
          }
        );
        if (grantedCamera === PermissionsAndroid.RESULTS.GRANTED) {
          const grantFile = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: this.state.translation[this.state.Language].Permission_Title,
              message: this.state.translation[this.state.Language].External_Storage_Permission
            }
          );
          if (grantFile === PermissionsAndroid.RESULTS.GRANTED) {
            if (type === "image") {
              this.photoFromGallery(index);
            } else if (type === "video") {
              this.videoFromGallery(index);
            } else if (type === "audio") {
              this.audioFromGallery(index);
            } else if (type === "capture") {
              this.imageTaggingFromGallary(index);
            }
          }
          else {
            this.askPermissionAlert(this.state.translation[this.state.Language].External_Storage_Permission)
          }
        }
        else {
          this.askPermissionAlert(this.state.translation[this.state.Language].Photos_General_Permission)
        }
      } else {
        if (type === "image") {
          this.photoFromGallery(index);
        } else if (type === "video") {
          this.videoFromGallery(index);
        } else if (type === "audio") {
          this.audioFromGallery(index);
        } else if (type === "capture") {
          this.imageTaggingFromGallary(index);
        }
      }
    } else {
      setTimeout(() => {
        // if (type === "image") {
        //   this.photoFromGallery(index);
        // } else if (type === "video") {
        //   this.videoFromGallery(index);
        // } else if (type === "audio") {
        //   this.audioFromGallery(index);
        // }
        if (type === 'image') {
          check(PERMISSIONS.IOS.PHOTO_LIBRARY).then(response => {
            if (response == 'granted') {
              this.photoFromGallery(index);
            } else if (response == 'unavailable' || response == 'denied' || response == 'blocked') {
              request(PERMISSIONS.IOS.PHOTO_LIBRARY).then(response => {
                if (response == 'granted') {
                  this.photoFromGallery(index);
                } else {
                  //Constants.showSnack('Eolas needs access to your photos to get photo')
                  this.askPermissionAlert(this.state.translation[this.state.Language].Photos_General_Permission)
                }
              });
            } else {
              // Constants.showSnack('Eolas needs access to your photos to get photo')
              this.askPermissionAlert(this.state.translation[this.state.Language].Photos_General_Permission)
            }
          });

        } else if (type === 'video') {
          check(PERMISSIONS.IOS.PHOTO_LIBRARY).then(response => {
            if (response == 'granted') {
              this.videoFromGallery(index);
            } else if (response == 'unavailable' || response == 'denied' || response == 'blocked') {
              request(PERMISSIONS.IOS.PHOTO_LIBRARY).then(response => {
                if (response == 'granted') {
                  this.videoFromGallery(index);
                } else {
                  //Constants.showSnack('Eolas needs access to your photo to get videos')
                  this.askPermissionAlert(this.state.translation[this.state.Language].Photos_General_Permission)
                }
              });
            } else {
              //Constants.showSnack('Eolas needs access to your photo to get videos')
              this.askPermissionAlert(this.state.translation[this.state.Language].Photos_General_Permission)
            }
          });

        } else if (type === 'audio') {
          check(PERMISSIONS.IOS.MICROPHONE).then(response => {
            if (response == 'granted') {
              this.audioFromGallery(index);
            } else if (response == 'unavailable' || response == 'denied' || response == 'blocked') {
              request(PERMISSIONS.IOS.MICROPHONE).then(response => {
                if (response == 'granted') {
                  this.audioFromGallery(index);
                } else {
                  //Constants.showSnack('Eolas needs access to your microphone to record audio')
                  this.askPermissionAlert(this.state.translation[this.state.Language].Microphone_Permission)
                }
              });
            } else {
              //Constants.showSnack('Eolas needs access to your microphone to record audio')
              this.askPermissionAlert(this.state.translation[this.state.Language].Microphone_Permission)
            }
          });
        } else if (type === 'capture') {
          check(PERMISSIONS.IOS.PHOTO_LIBRARY).then(response => {
            if (response == 'granted') {
              this.imageTaggingFromGallary(index);
            } else if (response == 'unavailable' || response == 'denied' || response == 'blocked') {
              request(PERMISSIONS.IOS.PHOTO_LIBRARY).then(response => {
                if (response == 'granted') {
                  this.imageTaggingFromGallary(index);
                } else {
                  //Constants.showSnack('Eolas needs access to your photos to get photo')
                  this.askPermissionAlert(this.state.translation[this.state.Language].Photos_General_Permission)
                }
              });
            } else {
              // Constants.showSnack('Eolas needs access to your photos to get photo')
              this.askPermissionAlert(this.state.translation[this.state.Language].Photos_General_Permission)
            }
          });
        }
      }, Constants.GALLERY_DELAY);
    }
  }

  /* manage media access permission  */
  callMediaAccess(type, index, media) {
    this.RBBottomSheet.close();
    // Pause the audio player if it's running
    this.handleAudioPause();

    setTimeout(() => {
      if (media === "gallery") {
        this.galleryPermission(type, index);
      } else if (media === "live") {
        this.cameraPermission(type, index);
      } else if (media === "audio") {
        this.selectAudioRecorder();
      }
    }, MEDIA_TIMEOUT);
  }

  callMediaImageAccess(index) {
    this.RBBottomSheet.close();
    // Pause the audio player if it's running
    this.handleAudioPause();
    this.captureImage(this.state.questionsArr[index], index);
  }

  /**
   * Add to answer object in questions array for media type questions
   * @param {*} index
   * @param {*} file
   */
  addAnswerForSelectedMedia(index, file) {
    let { questionsArr } = this.state;
    let questionArray = questionsArr[index];
    let type = questionArray.properties.media_type;
    let answer = {
      media_type: type,
      media_format: file.type,
      media: file.uri,
      data: type == "audio" ? file.data : ""
    };
    if (type == "audio") {
      this.resetSound("paused");
    }

    questionArray.answer = answer;
    questionArray.isUpdated = true;
    questionArray.isModified = true;

    //mediaImageBase64 = file.data;

    let localArray = this.state.questionsArr;
    localArray[index] = questionArray;
    this.setState(
      {
        questionsArr: localArray,
        videoProcessing: false
      },
      _ => {
        //console.log(this.state.videoProcessing);
      }
    );
  }

  /** set answer for selected media question
   * @param index - Current index
  */
  addAnswerForSelectedImageMedia(index) {
    let { questionsArr } = this.state;
    let questionArray = questionsArr[index];
    let type = questionArray.properties.media_type;
    let answer = {
      media_type: "image",
      media_format: "jpg",
      media: previewUri,
      data: ""
    };
    questionArray.answer = answer;
    questionArray.isUpdated = true;
    questionArray.isModified = true;

    let localArray = this.state.questionsArr;
    localArray[index] = questionArray;
    this.setState({
      questionsArr: localArray
    });
  }

  /**
   * Get the src for Image type question in media upload
   * @param {Array} questionArray Current question array
   */
  mediaImageSource(questionArray) {
    let capture = "";
    if (
      questionArray.answer !== null &&
      questionArray.answer !== "" &&
      questionArray.hasOwnProperty("answer")
    ) {
      capture = { uri: questionArray.answer.media };
      imageWidth = 260;
      imageHeight = 360;
    }
    return capture;
  }

  /**
   * Check Media from gallery or live
   * @param {String} type Meida Type image|audio|video
   * @param {Number} index Qustion Index
   * @param {Boolean} isGallery Gallery Enable or Disable
   */
  mediaCheckFromGallery(type, index, isGallery) {
    let bottomSheet = {
      type: type,
      index: index
    };
    this.setState({ bottomSheet }, _ => {
      if (isGallery === false) {
        if (type === "audio") {
          this.selectAudioRecorder();
        } else {
          this.cameraPermission(type, index);
        }
      } else if (isGallery === true) {
        this.RBBottomSheet.open();
      }
    });
  }

  /**
   * Design the Image media type question widget
   * @param {Array} questionArray Current question array
   * @param {Number} index Current question array element position
   */
  layoutMediaImageTypeQuestion(questionArray, index) {
    const {
      meidaAddIcon,
      mediaEditLeftIcon,
      meidaEditRightIcon,
      mediaTop,
      mediaBottom,
      mediaImageRight,
      mediaImageLeft,
      captureMeidaIcon,
      captureMeidaEditIcon
    } = styles;
    let isImage = questionArray.answer !== null && questionArray.answer !== "";
    let imgHeight = height - 265;
    if (this.state.scrollViewHeight > 0) {
      imgHeight = this.state.scrollViewHeight - CAMERASTYLE.SUBTRACT_HEIGHT;
    }
    let isGallery = false;
    if (
      questionArray.properties.hasOwnProperty("allow_gallery") &&
      questionArray.properties.allow_gallery == 1
    ) {
      isGallery = true;
    }

    return (
      <View style={{ marginTop: Dimen.marginThirty }}>
        {questionArray.answer !== null && questionArray.answer !== "" && (
          <ScalableImage
            style={{
              alignSelf: "center",
              marginBottom: 10,
              overflow: "visible"
            }}
            width={imageWidth}
            //height={imgHeight}
            source={this.mediaImageSource(questionArray)}
          />
        )}
        <View style={isImage === false ? mediaTop : mediaImageRight}>
          <TouchableOpacity
            style={!isImage ? meidaAddIcon : meidaEditRightIcon}
            onPress={() => {
              if (isGallery === true) {
                this.mediaCheckFromGallery("image", index, isGallery);
              } else {
                //this.cameraPermission('image', index);
                this.captureImage(questionArray, index);
              }
            }}
          >
            <ImageBackground
              source={cameraIconCircle}
              style={!isImage ? meidaAddIcon : meidaEditRightIcon}
            >
              <Image
                style={!isImage ? captureMeidaIcon : captureMeidaEditIcon}
                source={cameraIcon}
              />
            </ImageBackground>
          </TouchableOpacity>
        </View>

        {/* {questionArray.answer !== null && questionArray.answer !== '' && isGallery === true &&
                    <View style={mediaImageLeft}>
                        <TouchableOpacity
                            style={mediaEditLeftIcon}
                            onPress={() => this.galleryPermission('image', index)}>
                            <ImageBackground source={cameraIconCircle}
                                style={mediaEditLeftIcon}>
                                <Image
                                    style={captureEditIcon}
                                    source={imageIcon} />
                            </ImageBackground>
                        </TouchableOpacity>
                    </View>
                }                 */}
      </View>
    );
  }

  /* EXTERNAL Storage permission on run time */
  async selectAudioRecorder() {
    if (Platform.OS == 'ios') {
      let permission = true;
      check(PERMISSIONS.IOS.MICROPHONE).then(response => {
        if (response == 'unavailable' || response == 'denied' || response == 'blocked') {
          request(PERMISSIONS.IOS.MICROPHONE).then(response => {
            if (response == 'granted') {
              this.setState({
                isRecordAudio: true,
                pickAudioGallery: false
              });
            }
            else {
              // Constants.showSnack('Eolas needs access to your microphone to record audio')
              this.askPermissionAlert(this.state.translation[this.state.Language].Microphone_Permission)
              permission = false;
            }
          });
        } else {
          this.setState({
            isRecordAudio: true,
            pickAudioGallery: false
          });
        }
      });
    }
    else {
      if (Platform.OS === "android" && Platform.Version >= 23 && Platform.Version < 33) {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: this.state.translation[this.state.Language].Permission_Title,
              message: this.state.translation[this.state.Language].External_Storage_Permission
            }
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          } else {
            this.askPermissionAlert(this.state.translation[this.state.Language].External_Storage_Permission)
            return;
          }
        } catch (err) {
          //console.warn(err);
          return;
        }
      }
      if (Platform.OS === "android") {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            {
              title: this.state.translation[this.state.Language].Permission_Title,
              message: this.state.translation[this.state.Language].Audio_Recorder_Permission
            }
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          } else {
            this.askPermissionAlert(this.state.translation[this.state.Language].Audio_Recorder_Permission)
            return;
          }
        } catch (err) {
          //console.warn(err);
          return;
        }
      }
      this.setState({
        isRecordAudio: true,
        pickAudioGallery: false
      });
    }

  }

  /* unused function */
  takePicture() {
    const options = {};
    //options.location = ...
    this.camera
      .capture({ metadata: options })
      .then(data => console.log(data))
      .catch(err => console.error(err));
  }

  /** Close method for closing recording audio model */
  closeAudioModel = () => {
    this.setState({
      pickAudioGallery: true,
      isRecordAudio: false,
      playSeconds: 0,
      duration: 0,
      audioRecordingTime: "00:00:00",
      isAudioRecord: false
    })
  }

  /**
   * Start audio recorder
   */
  audioRecordStart = async index => {
    this.setState({
      isAudioRecord: true
    });
    if (Platform.OS === "android" && Platform.Version >= 23 && Platform.Version < 33) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: this.state.translation[this.state.Language].Permission_Title,
            message: this.state.translation[this.state.Language].External_Storage_Permission
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        } else {
          this.askPermissionAlert(this.state.translation[this.state.Language].External_Storage_Permission)
          return;
        }
      } catch (err) {
        //console.warn(err);
        return;
      }
    }
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: this.state.translation[this.state.Language].Permission_Title,
            message: this.state.translation[this.state.Language].Audio_Recorder_Permission
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        } else {
          this.askPermissionAlert(this.state.translation[this.state.Language].Audio_Recorder_Permission)
          return;
        }
      } catch (err) {
        //console.warn(err);
        return;
      }
    }
    const dirs = RNFetchBlob.fs.dirs;
    const path = Platform.select({
      ios: "record.m4a",
      android: `${dirs.CacheDir}/record${index}.mp3`
    });

    const uri = await this.audioRecorderPlayer.startRecorder(path);
    // if (Platform.OS === "ios") {
    //   this.audioRecorderPlayer.setVolume(1.0);
    // }
    this.audioRecorderPlayer.addRecordBackListener(e => {
      this.setState({
        audioRecordingTime: this.audioRecorderPlayer.mmssss(
          Math.floor(e.currentPosition)
        )
      });
      return;
    });
  };

  /**
   * Design the Audio media type question widget
   * @param {Array} questionArray Current question array
   * @param {Number} index Current question array element position
   */
  layoutMediaAudioTypeQuestion(questionArray, index) {
    const {
      meidaAddIcon,
      meidaVideoAddIcon,
      mediaEditLeftIcon,
      meidaEditRightIcon,
      mediaTop,
      mediaBottom,
      mediaImageRight,
      mediaImageLeft,
      captureIcon,
      meidaVideoAddCaptureIcon,
      captureEditIcon,
      meidaVideoEditCaptureEditIcon,
      recordedAudioDuration
    } = styles;
    let isAudioAvail =
      questionArray.answer !== null && questionArray.answer !== "";
    const currentTimeString = this.getAudioTimeString(this.state.playSeconds);
    const durationString = this.getAudioTimeString(this.state.duration);
    let isGallery = false;
    if (
      questionArray.properties.hasOwnProperty("allow_gallery") &&
      questionArray.properties.allow_gallery == 1
    ) {
      isGallery = true;
    }

    return (
      <View style={{ marginTop: Dimen.marginThirty }}>
        {questionArray.answer !== null &&
          questionArray.answer !== "" &&
          this.state.pickAudioGallery === true && (
            <View style={styles.audioContainerMedia}>
              <View
                style={{
                  justifyContent: "center",
                  backgroundColor: "black",
                  minHeight: 200,
                  minWidth: 200
                }}
              >
                <Image
                  source={img_speaker}
                  style={{
                    width: 60,
                    height: 60,
                    marginTop: 35,
                    marginBottom: 5,
                    alignSelf: "center"
                  }}
                />
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    marginVertical: 15
                  }}
                >
                  <TouchableOpacity
                    onPress={this.jumpPrev5Seconds}
                    style={{ justifyContent: "center" }}
                  >
                    <Image
                      source={img_playjumpleft}
                      style={{ width: 30, height: 30 }}
                    />
                    <Text
                      style={{
                        position: "absolute",
                        alignSelf: "center",
                        marginTop: 1,
                        color: "white",
                        fontSize: 12
                      }}
                    >
                      5
                    </Text>
                  </TouchableOpacity>
                  {this.state.audioLoader && this.state.playState == "playing" && (
                    <ActivityIndicator
                      style={{
                        alignSelf: "center",
                        marginHorizontal: 20,
                        justifyContent: "center",
                        width: 30,
                        height: 30
                      }}
                      size="small"
                      color={Color.colorWhite}
                    />
                  )}
                  {!this.state.audioLoader &&
                    this.state.playState == "playing" && (
                      <TouchableOpacity
                        onPress={this.handleAudioPause}
                        style={{ marginHorizontal: 20 }}
                      >
                        <Image
                          source={img_pause}
                          style={{ width: 30, height: 30 }}
                        />
                      </TouchableOpacity>
                    )}
                  {this.state.playState == "paused" && (
                    <TouchableOpacity
                      onPress={() =>
                        this.handleAudioPlay(questionArray.answer.media, index)
                      }
                      style={{ marginHorizontal: 20 }}
                    >
                      <Image
                        source={img_play}
                        style={{ width: 30, height: 30 }}
                      />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={this.jumpNext5Seconds}
                    style={{ justifyContent: "center" }}
                  >
                    <Image
                      source={img_playjumpright}
                      style={{ width: 30, height: 30 }}
                    />
                    <Text
                      style={{
                        position: "absolute",
                        alignSelf: "center",
                        marginTop: 1,
                        color: "white",
                        fontSize: 12
                      }}
                    >
                      5
                    </Text>
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    marginVertical: 15,
                    marginHorizontal: 15,
                    flexDirection: "row"
                  }}
                >
                  <Text style={{ color: "white", alignSelf: "center" }}>
                    {currentTimeString}
                  </Text>
                  <Slider
                    onSlidingStart={this.onSliderEditStart}
                    onSlidingComplete={this.onSliderEditEnd}
                    onValueChange={this.onSliderEditing}
                    value={this.state.playSeconds}
                    maximumValue={this.state.duration}
                    maximumTrackTintColor="gray"
                    minimumTrackTintColor="white"
                    thumbTintColor="white"
                    style={{
                      flex: 1,
                      alignSelf: "center",
                      marginHorizontal: Platform.select({ ios: 5 })
                    }}
                  />
                  <Text style={{ color: "white", alignSelf: "center" }}>
                    {durationString}
                  </Text>
                </View>
              </View>
            </View>
          )}
        {this.state.pickAudioGallery === false && (
          <View>
            {this.state.isRecordAudio === true && (
              <View style={styles.recordercontainer}>
                <TouchableOpacity style={{ position: 'absolute', right: 10, top: 10 }}
                  onPress={() => { this.closeAudioModel() }}>
                  <Image style={{ height: 30, width: 30, tintColor: "white" }} source={closeIcon}></Image>
                </TouchableOpacity>
                <Text style={styles.txtRecordCounter}>
                  {this.state.audioRecordingTime}
                </Text>
                <View style={styles.viewRecorder}>
                  <View style={styles.recordBtnWrapper}>
                    <TouchableOpacity
                      onPress={() => this.audioRecordStart(index)}
                      style={{ justifyContent: "center" }}
                    >
                      <Image
                        source={record}
                        style={{ width: 100, height: 100 }}
                      />
                    </TouchableOpacity>
                  </View>
                  {this.state.isAudioRecord && (
                    <View style={styles.recordBtnWrapper}>
                      <TouchableOpacity
                        onPress={() => {
                          this.audioFromRecorder(index);
                        }}
                        style={{ justifyContent: "center" }}
                      >
                        <Image
                          source={stopRecording}
                          style={{ width: 60, height: 60 }}
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        )}
        {this.state.isRecordAudio === false && (
          <View style={isAudioAvail === false ? mediaTop : mediaImageRight}>
            <TouchableOpacity
              style={!isAudioAvail ? meidaVideoAddIcon : meidaEditRightIcon}
              onPress={() => {
                if (isGallery === true) {
                  this.mediaCheckFromGallery("audio", index, isGallery);
                } else {
                  this.selectAudioRecorder();
                }
              }}
            >
              <ImageBackground
                source={cameraIconCircle}
                style={!isAudioAvail ? meidaVideoAddIcon : meidaEditRightIcon}
              >
                <Image
                  style={
                    !isAudioAvail
                      ? meidaVideoAddCaptureIcon
                      : meidaVideoEditCaptureEditIcon
                  }
                  source={audioIcon}
                />
              </ImageBackground>
            </TouchableOpacity>
          </View>
        )}
        {/* {questionArray.answer !== null && questionArray.answer !== '' && isGallery === true &&
                    <View style={mediaImageLeft}>
                        <TouchableOpacity
                            style={mediaEditLeftIcon}
                            onPress={() => this.galleryPermission('audio', index)}>
                            <ImageBackground source={cameraIconCircle}
                                style={mediaEditLeftIcon}>
                                <Image
                                    style={captureEditIcon}
                                    source={imageIcon} />
                            </ImageBackground>
                        </TouchableOpacity>
                    </View>
                }                 */}
      </View>
    );
  }

  /* start video recording when user click start button */
  async startVideoRecording(index) {
    this.setState({ recording: true });
    // default to mp4 for android as codec is not set
    await this.camera.recordAsync().then(async data => {
      let uri = data.uri.replace(/(^\w+:|^)\/\//, "");
      RNFetchBlob.fs.exists(uri).then(exist => {
        RNFetchBlob.fs
          .stat(uri)
          .then(pathRes => {
            let path = pathRes.path;
            let mime = pathRes.type.split("/");
            let type = "mp4";
            // RNCompress.compressVideo(path, "low").then(compressedFile => {
            // });
            ProcessingManager.compress(path, videoCompressOptions)   // like VideoPlayer compress options
              .then((compressedVideo) => {
                let compressedPath = compressedVideo.replace('file://', '')
                RNFetchBlob.fs.stat(compressedPath).then((pathRes) => {
                  let source = { uri: compressedPath, data: '', type: type };
                  this.addAnswerForSelectedMedia(index, source);
                });
              })
          })
          .catch(e => {
            //console.log(e);
          });
      });
    });
  }

  /* stop video recording when click stop button */
  stopVideoRecording = index => {
    if (Platform.OS == 'ios') {
      this.camera.stopRecording();
      pageIndex = this.state.pageCount;
      this.setState({ recording: false, showCamera: false, cameraMode: true, videoProcessing: true }, _ => {
        //this.horizontalCarousel.goToPage(this.state.pageCount);
      });
    }
    else {
      this.setState({ recording: false, showCamera: false });
      this.camera.stopRecording();
    }
  };

  /* close camera view when click close button */
  closeVideoCamera = _ => {
    if (Platform.OS == 'ios') {
      pageIndex = this.state.pageCount;
      this.setState({ recording: false, showCamera: false, cameraMode: true }, _ => {
        //this.horizontalCarousel.goToPage(this.state.pageCount);
      });
    }
    else {
      this.setState({ recording: false, showCamera: false });
    }
  };

  /* Handle Camera mode */
  setVideoCamera = _ => {
    if (Platform.OS == 'ios') {
      this.setState({ cameraMode: !this.state.cameraMode })
    }
  }


  /**
   * Design the Video media type question widget
   * @param {Array} questionArray Current question array
   * @param {Number} index Current question array element position
   */
  layoutMediaVideoTypeQuestion(questionArray, index) {
    const {
      meidaAddIcon,
      meidaVideoAddIcon,
      mediaEditLeftIcon,
      meidaEditRightIcon,
      mediaTop,
      mediaBottom,
      mediaImageRight,
      mediaImageLeft,
      captureIcon,
      meidaVideoAddCaptureIcon,
      captureEditIcon,
      meidaVideoEditCaptureEditIcon
    } = styles;
    const { videoProcessing } = this.state;
    let isVideoAvail =
      questionArray.answer !== null && questionArray.answer !== "";
    let isGallery = false;
    if (
      questionArray.properties.hasOwnProperty("allow_gallery") &&
      questionArray.properties.allow_gallery == 1
    ) {
      isGallery = true;
    }

    return (
      <View style={{ marginTop: Dimen.marginThirty }}>
        {questionArray.answer !== null && questionArray.answer !== "" && (
          <View style={{ paddingTop: 220, margin: 10 }}>
            <VideoPlayer
              ref={ref => {
                this.player = ref;
              }}
              style={styles.fullscreen}
              toggleResizeModeOnFullscreen={false}
              source={{ uri: questionArray.answer.media }}
              paused={this.state.paused}
              disableVolume={true}
              disableBack={true}
              onEnd={() => this.onEnd()}
              onEnterFullscreen={() => this.setState(
                {
                  paused: true
                },
                _ => {
                  this.props.navigation.navigate("PreviewVideo", { VideoUri: questionArray.answer.media })
                }
              )}
            />
          </View>
        )}

        <View style={isVideoAvail === false ? mediaTop : mediaImageRight}>
          <TouchableOpacity
            style={!isVideoAvail ? meidaVideoAddIcon : meidaEditRightIcon}
            onPress={() => {
              if (isGallery === true) {
                this.mediaCheckFromGallery("video", index, isGallery);
              } else {
                this.cameraPermission("video", index);
              }
            }}
          >
            <ImageBackground
              source={cameraIconCircle}
              style={!isVideoAvail ? meidaVideoAddIcon : meidaEditRightIcon}
            >
              <Image
                style={
                  !isVideoAvail
                    ? meidaVideoAddCaptureIcon
                    : meidaVideoEditCaptureEditIcon
                }
                source={videoIcon}
              />
            </ImageBackground>
          </TouchableOpacity>
        </View>
        {videoProcessing && (
          <View
            style={{
              alignItems: "center",
              alignSelf: "center",
              paddingTop: 10,
              margin: 10
            }}
          >
            <Text style={{ fontSize: 12, color: "#000000", fontWeight: "500" }}>
              {this.state.translation[this.state.Language].Video_Processing_Msg}
            </Text>
          </View>
        )}
        {/* <View style={isVideoAvail === false ? mediaBottom : mediaImageLeft}>
                    <TouchableOpacity
                        style={!isVideoAvail ? meidaAddIcon : mediaEditLeftIcon}
                        onPress={() => this.galleryPermission('video', index)}>
                        <ImageBackground source={cameraIconCircle}
                                         style={!isVideoAvail ? meidaAddIcon : mediaEditLeftIcon}>
                            <Image
                                style={!isVideoAvail ? captureIcon : captureEditIcon}
                                source={imageIcon}/>
                        </ImageBackground>
                    </TouchableOpacity>
                </View> */}
      </View>
    );
  }

  /* layout media type question based on media type */
  layoutMediaUploadTypeQuestion(questionArray, index) {
    if (questionArray.hasOwnProperty("properties")) {
      let question = questionArray.properties;
      let type;
      if (question.hasOwnProperty("media_type")) {
        type = question.media_type;
      }
      return (
        <View>
          {type === "image" &&
            this.layoutMediaImageTypeQuestion(questionArray, index)}
          {type === "audio" &&
            this.layoutMediaAudioTypeQuestion(questionArray, index)}
          {type === "video" &&
            this.layoutMediaVideoTypeQuestion(questionArray, index)}
        </View>
      );
    }
  }

  /**
   * Scan type question render method
   * @return - it will return layout style for capture question type
   * */
  layoutScanTypeQuestion(questionArray, index) {
    const {
      captureAddIconCircle,
      captureEditIconCircle,
      captureIcon,
      captureEditIcon
    } = styles;
    let imgHeight = height - 265;
    if (this.state.scrollViewHeight > 0) {
      imgHeight = this.state.scrollViewHeight - CAMERASTYLE.SUBTRACT_HEIGHT;
    }

    return (
      <View style={{ marginTop: Dimen.marginTen }}>
        {questionArray.answer !== null &&
          questionArray.answer !== "" &&
          questionArray.answer.hasOwnProperty("image") && (
            <ScalableImage
              style={{
                alignSelf: "center",
                marginBottom: 10,
                overflow: "visible"
              }}
              width={imageWidth}
              //height={imgHeight}
              source={this.setScanAnswer(questionArray)}
            />
          )}

        <View style={this.scanStyle(questionArray)}>
          <TouchableOpacity
            style={
              !isBarcodeImageAdded
                ? captureAddIconCircle
                : captureEditIconCircle
            }
            onPress={() => this.captureImage(questionArray, index)}
          >
            <ImageBackground
              source={cameraIconCircle}
              style={
                !isBarcodeImageAdded
                  ? captureAddIconCircle
                  : captureEditIconCircle
              }
            >
              <Image
                style={!isBarcodeImageAdded ? captureIcon : captureEditIcon}
                source={barcodeIcon}
              />
            </ImageBackground>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /* unused funtion */
  onMapPress = (e, index) => {
    isGpsModified = true;
    let region = {
      latitude: e.latitude,
      longitude: e.longitude,
      latitudeDelta: e.latitudeDelta * 1.5,
      longitudeDelta: e.longitudeDelta * 1.5
    };
    this.onRegionChange(region, region.latitude, region.longitude, index);
  };

  /* unused funtion */
  onMapReady = e => {
    if (!this.state.isMapReady) {
      this.setState({ isMapReady: true });
    }
  };

  /**
   * GPS type question render method
   * @return - it will return layout style for GPS question type
   * */
  layoutGpsTypeQuestion(questionArray, index) {
    const { mapContainer, map, marker } = styles;
    const {
      mapRegion,
      lastLat,
      lastLong,
      scrollViewHeight,
      scrollViewWidth
    } = this.state;
    let mapViewHeight = scrollViewHeight - 100;
    let mapViewWidth = scrollViewWidth - 90;

    /** ask for permission again if not granted */
    // GPSState.getStatus().then(status => {
    //   if (status == 2) {
    //     this.askPermissionToEnableLocation()
    //   }
    // });
    let permissionType = Platform.select({
      android: PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
      ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    })
    check(permissionType)
      .then((result) => {
        if (result == RESULTS.DENIED) {
          this.askPermissionToEnableLocation()
        }
      })
      .catch((error) => {
        //..
      });

    // //console.log('MAP_ANSWER::', questionArray.hasOwnProperty('answer'))
    /* if (questionArray.hasOwnProperty('answer') && questionArray.answer !== '' && questionArray.answer !== null && isGpsModified === false) {
            isGpsModified == true;
            if (questionArray.answer.hasOwnProperty('latitude') && questionArray.answer.latitude !== '') {
                lastLat = parseInt(questionArray.answer.latitude);
                lastLong = parseInt(questionArray.answer.longitude);
                mapRegion = {
                    latitude: lastLat,
                    longitude: lastLong,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA
                }
            }
        } */
    return (
      <View style={mapContainer}>
        <MapView
          ref={ref => {
            this.mapView = ref;
          }}
          pitchEnabled={false}
          rotateEnabled={false}
          scrollEnabled={false}
          zoomEnabled={false}

          style={[map, { height: mapViewHeight, width: mapViewWidth }]}
          region={mapRegion}
          showsUserLocation={false}
          // onMapReady={this.onMapReady}
          // onMarkerDragStart={() => this.setState({isScrollEnabled: false})}
          // onMarkerDragEnd={() => this.setState({ isScrollEnabled: true })}
          //onTouchStart={() => this.setState({ isScrollEnabled: false })}
          onDragStart={e => log("onDragStart", e)}
          coordinate={{
            latitude: lastLat + 0.0001 || -36.82339,
            longitude: lastLong + 0.0001 || -73.03569
          }}
        // onRegionChangeComplete={(e) => this.onMapPress(e, index)}
        >
          <Marker
            coordinate={{
              latitude: lastLat + 0.0001 || -36.82339,
              longitude: lastLong + 0.0001 || -73.03569
            }}
          >
            <Image style={marker} source={locationIcon} />
          </Marker>
        </MapView>
        <View style={[styles.mapLocation]}>
          {this.state.addressLoader && netState == "online" && (
            <ActivityIndicator
              style={{
                alignSelf: "center",
                justifyContent: "center"
              }}
              size="small"
              color={Color.colorWhite}
            />
          )}
          {!this.state.addressLoader && (
            <Text numberOfLines={2} style={styles.mapLocationText}>
              {this.state.locationAddress ? this.state.locationAddress : this.state.translation_common[this.state.Language].We_CouldNot_GetYour_Location}
            </Text>
          )}
        </View>
        {/* <View style={markerFixed}>
                    <Image style={marker} source={locationIcon}/>
                </View> */}
      </View>
    );
  }

  /**
     * Scale type question view return
     * @param questionArray - the object of scale type question
     * @param parentIndex - question index
     * @return - return the view
     * When icon_type is emoji, and image key is present, then use only image, no need to display number inside the image even if number is present or not.
     - When icon_type is emoji, and image key is not present or it is empty value, then use "value" key and display number in rounded circle
     - When icon_type is image, then display number inside image when both image and value key exists
     - When icon_type is image, then display only  image when value key does not exists
     - When icon_type is image, then display only number inside circle when image  key does not exists
  */
  layoutScaleTypeQuestion(questionArray, parentIndex) {
    const {
      scaleImage,
      scaleContainer,
      noScaleFound,
      noScaleText,
      scaleValueText,
      numberRoundText,
      numberRoundView,
      scaleStartEndText,
      scaleValueTextStart,
      scaleValueTextEnd
    } = styles;
    if (questionArray.properties.hasOwnProperty("scale_content")) {
      let scaleContents = questionArray.properties.scale_content;
      let scaleContentsLength = scaleContents.length;
      let iconType = questionArray.properties.icon_type;
      let startText = questionArray.properties.hasOwnProperty("start_text")
        ? questionArray.properties.start_text
        : null;
      let endText = questionArray.properties.hasOwnProperty("end_text")
        ? questionArray.properties.end_text
        : null;

      return (
        <View style={scaleContainer}>
          {scaleContents.map((scaleContents, index) => {
            if (iconType === "image") {
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() =>
                    this.addAnswerForSelectedScale(
                      questionArray,
                      parentIndex,
                      scaleContents
                    )
                  }
                >
                  {scaleContents.hasOwnProperty("image_id") &&
                    scaleContents.image_id !== "" && (
                      <Image
                        style={[
                          scaleImage,
                          {
                            opacity: this.setOpacityForScaleImg(
                              scaleContents.id,
                              questionArray
                            )
                          }
                        ]}
                        source={{ uri: scaleContents.image_id }}
                      />
                    )}

                  {scaleContents.hasOwnProperty("value") &&
                    scaleContents.image_id !== "" && (
                      <Text
                        style={[
                          scaleContents.hasOwnProperty("image_id")
                            ? scaleValueText
                            : numberRoundText,
                          {
                            color:
                              this.setOpacityForScaleImg(
                                scaleContents.id,
                                questionArray
                              ) === 1
                                ? Color.colorWhite
                                : Color.colorTinyGrey
                          }
                        ]}
                      >
                        {scaleContents.value}
                      </Text>
                    )}
                  {scaleContents.hasOwnProperty("value") &&
                    scaleContents.image_id == "" && (
                      <Text
                        style={[
                          numberRoundText,
                          {
                            opacity: this.setOpacityForScaleImg(
                              scaleContents.id,
                              questionArray
                            ),
                            color:
                              this.setOpacityForScaleImg(
                                scaleContents.id,
                                questionArray
                              ) === 1
                                ? Color.colorWhite
                                : Color.colorTinyGrey
                          }
                        ]}
                      >
                        {scaleContents.value}
                      </Text>
                    )}

                  {index === 0 && startText !== null && (
                    <Text numberOfLines={5} style={scaleStartEndText}>
                      {startText}
                    </Text>
                  )}
                  {scaleContentsLength === index + 1 && endText !== null && (
                    <Text numberOfLines={5} style={scaleStartEndText}>
                      {endText}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            } else {
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() =>
                    this.addAnswerForSelectedScale(
                      questionArray,
                      parentIndex,
                      scaleContents
                    )
                  }
                >
                  {scaleContents.hasOwnProperty("image_id") &&
                    scaleContents.image_id !== "" ? (
                    <Image
                      style={[
                        scaleImage,
                        {
                          opacity: this.setOpacityForScale(
                            scaleContents.id,
                            questionArray
                          )
                        }
                      ]}
                      source={{ uri: scaleContents.image_id }}
                    />
                  ) : (
                    this.returnTextView(scaleContents, questionArray, index)
                  )}
                  {index === 0 && startText !== null && (
                    <Text numberOfLines={5} style={scaleStartEndText}>
                      {startText}
                    </Text>
                  )}
                  {scaleContentsLength === index + 1 && endText !== null && (
                    <Text numberOfLines={5} style={scaleStartEndText}>
                      {endText}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            }
          })}
        </View>
      );
    } else if (questionArray.properties.hasOwnProperty("table_content")) {
      return this.layoutScaleTypeTableQuestion(
        questionArray,
        parentIndex,
        "table_content"
      );
    } else if (
      questionArray.properties.hasOwnProperty("table_options") &&
      questionArray.properties.hasOwnProperty("table_value")
    ) {
      return this.layoutScaleTypeTableQuestion(
        questionArray,
        parentIndex,
        null
      );
    } else {
      return (
        <View style={noScaleFound}>
          <Text style={noScaleText}>{this.state.translation[this.state.Language].NO_Scale_Found}</Text>
        </View>
      );
    }
  }

  /**
   * There is issue to render round TextView in ios version, so decided to wrap TextView with view for IOS
   * and TextView alone for android
   * */
  returnTextView(scaleContents, questionArray, index) {
    const { scaleValueText, numberRoundText, numberRoundView } = styles;
    if (Platform.OS === "ios") {
      return (
        <View
          style={[
            numberRoundView,
            {
              opacity: this.setOpacityForScale(scaleContents.id, questionArray)
            }
          ]}
        >
          <Text
            style={[
              scaleContents.hasOwnProperty("image_id")
                ? scaleValueText
                : numberRoundText,
              {
                opacity: this.setOpacityForScale(
                  scaleContents.id,
                  questionArray
                )
              }
            ]}
          >
            {this.setScaleTextValue(scaleContents, index)}
          </Text>
        </View>
      );
    } else {
      return (
        <Text
          style={[
            numberRoundText,
            {
              opacity: this.setOpacityForScale(scaleContents.id, questionArray)
            }
          ]}
        >
          {this.setScaleTextValue(scaleContents, index)}
        </Text>
      );
    }
  }

  /**
   * Scale type table question view return
   * @param {Object} questionArray Object of Scale Table Question
   */
  layoutScaleTypeTableQuestion(questionArray, parentIndex, from) {
    const { tableScaleContainer } = styles;
    return (
      <View style={tableScaleContainer}>
        <ScrollView
          horizontal={true}
          onTouchStart={ev => {
            this.setState({ isScrollEnabled: false });
          }}
          // onMomentumScrollEnd={() => {
          //   this.setState({ isScrollEnabled: true });
          // }}
          onTouchEnd={() => {
            this.setState({ isScrollEnabled: true });
          }}
        // onScrollEndDrag={() => {
        //   this.setState({ isScrollEnabled: true });
        // }}
        >
          {questionArray.properties.grid_type === "image" &&
            this.layoutScaleTypeTableQuestionImg(
              questionArray,
              parentIndex,
              from
            )}
          {questionArray.properties.grid_type === "radio" &&
            this.layoutScaleTypeTableQuestionRadio(
              questionArray,
              parentIndex,
              from
            )}
        </ScrollView>
      </View>
    );
  }

  /**
   * Render Image Table type Scale question
   * @param {Array} questionArray Question Array
   * @param {Number} parentIndex Question Index
   */
  layoutScaleTypeTableQuestionImg(questionArray, parentIndex, from) {
    let question = questionArray.properties;
    if (from !== null) {
      question = questionArray.properties.table_content;
    }
    const { table_options, table_value } = question;

    let tableHead = [];
    let tableData = [];
    let widthArr = [100];
    tableHead.push("");
    let answer = [];
    if (
      questionArray.hasOwnProperty("answer") &&
      questionArray.answer !== "" &&
      questionArray.answer !== null
    ) {
      answer = questionArray.answer.selected_option;
    }
    if (table_options) {
      for (let i = 0; i < table_options.length; i++) {
        tableHead.push(table_options[i].value);
        // Set table cell width for all
        widthArr.push(100);
      }
    }
    if (table_value) {
      for (let i = 0; i < table_value.length; i++) {
        let tempData = [];
        tempData.push(table_value[i].value);
        for (let j = 0; j < table_value[i].image.length; j++) {
          let tempObj = {};
          tempObj.row_id = table_value[i].id;
          tempObj.id = table_value[i].image[j].id;
          tempObj.image_id = null;
          tempObj.value = null;
          tempObj.opacity = lightDarkOpacity;
          for (let k = 0; k < answer.length; k++) {
            if (answer[k].id === table_value[i].id) {
              if (answer[k].image.id === table_value[i].image[j].id) {
                tempObj.opacity = fullOpacity;
              } else {
                tempObj.opacity = lightDarkOpacity;
              }
            }
          }
          if (
            table_value[i].image[j].hasOwnProperty("image_id") &&
            table_value[i].image[j].image_id !== null &&
            table_value[i].image[j].image_id !== ""
          ) {
            tempObj.image_id = table_value[i].image[j].image_id;
          }
          if (
            table_value[i].image[j].hasOwnProperty("remote_image_id") &&
            table_value[i].image[j].remote_image_id !== null &&
            table_value[i].image[j].remote_image_id !== ""
          ) {
            tempObj.remote_image_id = table_value[i].image[j].remote_image_id;
          }
          if (
            table_value[i].image[j].hasOwnProperty("value") &&
            table_value[i].image[j].value !== null &&
            table_value[i].image[j].value !== ""
          ) {
            tempObj.value = table_value[i].image[j].value;
          }
          tempData.push(tempObj);
        }
        tableData.push(tempData);
      }
    }
    const imageElement = data => {
      if (data.image_id !== null) {
        return (
          <TouchableOpacity
            onPress={() =>
              this.addAnswerForSelectedScaleTable(
                questionArray,
                data,
                parentIndex,
                question
              )
            }
          >
            <Image
              style={{
                width: 20,
                height: 20,
                resizeMode: "contain",
                opacity: data.opacity
              }}
              source={{ uri: data.image_id }}
            />
          </TouchableOpacity>
        );
      }
      else {
        return (
          <TouchableOpacity
            onPress={() =>
              this.addAnswerForSelectedScaleTable(
                questionArray,
                data,
                parentIndex,
                question
              )
            }
          >
            <View style={{
              width: 20,
              height: 20,
              backgroundColor: Color.colorYellow,
              opacity: data.opacity
            }}>
            </View>
          </TouchableOpacity>
        )
      }
    };
    const {
      tableContainer,
      tableHeader,
      tableRow,
      tableHeadText,
      tableRowText,
      tableCellCol,
      tableCellFirstCol
    } = styles;
    return (
      <Table style={tableContainer} borderStyle={{ borderColor: "#fff" }}>
        <Row
          data={tableHead}
          style={tableHeader}
          textStyle={tableHeadText}
          widthArr={widthArr}
        />
        {tableData.map((rowData, index) => (
          <TableWrapper key={index} textStyle={tableRowText} style={tableRow}>
            {rowData.map((cellData, cellIndex) => (
              <Cell
                key={cellIndex}
                data={cellIndex !== 0 ? imageElement(cellData) : cellData}
                style={cellIndex === 0 ? tableCellFirstCol : tableCellCol}
                textStyle={{ color: Color.colorBlack }}
              />
            ))}
          </TableWrapper>
        ))}
      </Table>
    );
  }

  /**
   * Render Radio Table type Scale question
   * @param {Array} questionArray Question Array
   * @param {Number} parentIndex Question Index
   */
  layoutScaleTypeTableQuestionRadio(questionArray, parentIndex, from) {
    let question = questionArray.properties;
    if (from !== null) {
      question = questionArray.properties.table_content;
    }
    const { table_options, table_value } = question;
    // Head array holds each coloum
    let tableHead = [];
    let tableData = [];
    // Width array represents each coloum and set default first column width
    let widthArr = [100];
    // Head array default first column value is empty string
    tableHead.push("");
    let answer = [];
    if (
      questionArray.hasOwnProperty("answer") &&
      questionArray.answer !== "" &&
      questionArray.answer !== null
    ) {
      answer = questionArray.answer.selected_option;
    }
    if (table_options) {
      for (let i = 0; i < table_options.length; i++) {
        tableHead.push(table_options[i].value);
        // Set table cell width for all
        widthArr.push(100);
      }
    }
    if (table_value) {
      for (let i = 0; i < table_value.length; i++) {
        let tempData = [];
        tempData.push(table_value[i].value);
        for (let j = 0; j < table_options.length; j++) {
          let tempObj = {};
          (tempObj.row_id = table_value[i].id),
            (tempObj.id = table_options[j].id),
            (tempObj.option = table_options[j].value),
            (tempObj.value = table_value[i].value),
            (tempObj.isChecked = false);
          if (answer && answer.length > 0) {
            for (let k = 0; k < answer.length; k++) {
              if (answer[k].id === table_value[i].id) {
                if (
                  answer[k].hasOwnProperty("image") &&
                  answer[k].image.hasOwnProperty("id")
                ) {
                  if (answer[k].image.id === table_options[j].id) {
                    tempObj.isChecked = true;
                  }
                } else {
                  tempObj.isChecked = false;
                }
              }
            }
          }
          tempData.push(tempObj);
        }
        tableData.push(tempData);
      }
    }
    const radioElement = data => {
      return (
        <TouchableOpacity
          onPress={() =>
            this.addAnswerForSelectedScaleTable(
              questionArray,
              data,
              parentIndex,
              question
            )
          }
        >
          <ImageBackground
            style={styles.radioWhiteLeft}
            source={radioOuterCircle}
          >
            {data.isChecked && (
              <Image style={styles.blackDot} source={radioInnerDot} />
            )}
          </ImageBackground>
        </TouchableOpacity>
      );
    };
    const {
      tableContainer,
      tableHeader,
      tableRow,
      tableHeadText,
      tableRowText,
      tableCellCol,
      tableCellFirstCol
    } = styles;
    return (
      <Table style={tableContainer} borderStyle={{ borderColor: "#fff" }}>
        <Row
          data={tableHead}
          style={tableHeader}
          textStyle={tableHeadText}
          widthArr={widthArr}
        />
        {tableData.map((rowData, index) => (
          <TableWrapper key={index} textStyle={tableRowText} style={tableRow}>
            {rowData.map((cellData, cellIndex) => (
              <Cell
                key={cellIndex}
                data={cellIndex !== 0 ? radioElement(cellData) : cellData}
                style={cellIndex === 0 ? tableCellFirstCol : tableCellCol}
                textStyle={{ color: Color.colorBlack }}
              />
            ))}
          </TableWrapper>
        ))}
      </Table>
    );
  }

  /**
   * Selected Scale Table question's answer to an array
   * @param {Array} questionArray All Questions list
   * @param {Any} selectedContent Selected value
   * @param {Number} parentIndex Current Question Index
   */
  addAnswerForSelectedScaleTable = (
    questionArray,
    selectedContent,
    parentIndex,
    question
  ) => {

    // Set the parent scroll true
    this.setState({ isScrollEnabled: true });
    let obj = {};
    obj.image = {};
    obj.option = selectedContent.option
    obj.value = selectedContent.value
    obj.id = selectedContent.row_id;
    obj.image.id = selectedContent.id;
    if (
      selectedContent.hasOwnProperty("image_id") &&
      selectedContent.image_id !== null
    ) {
      obj.image.image_id = selectedContent.image_id;
    }
    if (
      selectedContent.hasOwnProperty("remote_image_id") &&
      selectedContent.remote_image_id !== null
    ) {
      obj.image.remote_image_id = selectedContent.remote_image_id;
    }
    if (
      selectedContent.hasOwnProperty("value") &&
      selectedContent.value !== null
    ) {
      obj.image.value = selectedContent.value;
    }

    let scaleTableSelectedAnswer = [];

    if (
      questionArray.properties &&
      questionArray.properties.hasOwnProperty("table_content") &&
      questionArray.hasOwnProperty("answer") &&
      questionArray.answer.hasOwnProperty("selected_option")
    ) {
      scaleTableSelectedAnswer = questionArray.answer.selected_option;
    }

    if (scaleTableSelectedAnswer.length > 0) {
      let match = false;
      for (let i = 0; i < scaleTableSelectedAnswer.length; i++) {
        if (selectedContent.row_id === scaleTableSelectedAnswer.id) {
          scaleTableSelectedAnswer[i] = obj;
          match = true;
        }
      }
      if (match == false) {
        let alreadyRowValueAdded = false;
        let valuePos = 0;
        for (let i = 0; i < scaleTableSelectedAnswer.length; i++) {
          if (scaleTableSelectedAnswer[i].id == obj.id) {
            alreadyRowValueAdded = true;
            valuePos = i;
            break;
          }
        }
        if (alreadyRowValueAdded) {
          scaleTableSelectedAnswer[valuePos] = obj;
        } else {
          scaleTableSelectedAnswer.push(obj);
        }
      }
    } else {
      scaleTableSelectedAnswer.push(obj);
    }
    let answer = {
      scale_type: questionArray.properties.scale_type,
      selected_option: scaleTableSelectedAnswer
    };

    const tableValue = question.table_value;
    let isSelectedAll = scaleTableSelectedAnswer.length === tableValue.length;

    questionArray.answer = answer;
    questionArray.isUpdated = true;
    questionArray.isSelectedAll = isSelectedAll;
    let localArray = this.state.questionsArr;
    localArray[parentIndex] = questionArray;
    this.setState(
      {
        questionsArr: localArray
      },
      _ => {
        if (this.state.rightDisable === true) {
          this.executeConditions(answer);
        }
      }
    );
  };

  /**
   * Set the scale type of scale question's value if available else display number by incrementing index position
   * */
  setScaleTextValue(scaleContents, index) {
    if (scaleContents.hasOwnProperty("value")) {
      return scaleContents.value;
    } else {
      return index + 1;
    }
  }

  /**
   * To change the opacity when user tap on scale image
   * @param selectedScaleId - selected scale id
   * @param questionArray - the object of scale type question
   * @return the opacity
   * */
  setOpacityForScale(selectedScaleId, questionArray) {
    if (questionArray.answer !== "" && questionArray.answer !== null) {
      if (questionArray.answer.hasOwnProperty("selected_option")) {
        if (selectedScaleId === questionArray.answer.selected_option.id) {
          return fullOpacity;
        } else if (Array.isArray(questionArray.answer.selected_option)) {
          if (selectedScaleId === questionArray.answer.selected_option[0].id) {
            return fullOpacity;
          }
        }
      }
      return halfOpacity;
    } else {
      return fullOpacity;
    }
  }

  /**
   * To change the opacity when user tap on scale image
   * @param selectedScaleId - selected scale id
   * @return the opacity
   * */
  setOpacityForScaleImg(selectedScaleId, question) {
    let scaleQuestSelRange = [];
    if (question.hasOwnProperty("answer")) {
      if (question.answer !== "" && question.answer !== null) {
        if (Array.isArray(question.answer.selected_option)) {
          let arrLen = question.answer.selected_option.length;
          scaleQuestSelRange[0] = question.answer.selected_option[0].id;
          scaleQuestSelRange[1] =
            question.answer.selected_option[arrLen - 1].id;
        } else if (question.answer.selected_option && question.answer.selected_option.hasOwnProperty('id') &&
          (question.answer.selected_option.id == 0 ||
            question.answer.selected_option.id > 0)
        ) {
          scaleQuestSelRange[0] = 0;
          scaleQuestSelRange[1] = question.answer.selected_option.id;
        }
      }
    }

    if (scaleQuestSelRange.length > 0) {
      if (scaleQuestSelRange.length === 1) {
        if (selectedScaleId === scaleQuestSelRange[0]) {
          return fullOpacity;
        } else {
          return halfOpacity;
        }
      } else if (
        selectedScaleId >= scaleQuestSelRange[0] &&
        selectedScaleId <= scaleQuestSelRange[1]
      ) {
        return fullOpacity;
      } else {
        return halfOpacity;
      }
    } else {
      return halfOpacity;
    }
  }

  /**
   * Get range for selecting scale type question
   * @param idx - selected scale id
   */
  currentScaleRangeByAnswered = idx => {
    /*const {questionsArr} = this.state;
        let question = questionsArr[idx];
        scaleQuestSelRange = [];
        if (question.hasOwnProperty('answer')) {
            if (question.answer !== '' && question.answer !== null) {
                if (Array.isArray(question.answer.selected_option)) {
                    let arrLen = question.answer.selected_option.length;
                    scaleQuestSelRange[0] = question.answer.selected_option[0].id;
                    scaleQuestSelRange[1] = question.answer.selected_option[arrLen - 1].id;
                } else if (question.answer.selected_option.id == 0 || question.answer.selected_option.id > 0) {
                    scaleQuestSelRange[0] = 0;
                    scaleQuestSelRange[1] = question.answer.selected_option.id;
                }
            }
        } */
  };

  /**
   * To replace the answer for selected scale
   * @param questionArray - the object of scale type question
   * @param parentIndex - question index
   * @param selectedContents - selected option of user selected scale
   * When icon_type is imgae, get the selection range and answer posting with more than one element in an selected_option array
   * When icon_type is imgae, selection range is same then posting the answer with one element in an selected_option array
   * */
  addAnswerForSelectedScale(questionArray, parentIndex, selectedContents) {
    let selected = [];
    let scaleQuestSelRange = [];
    selected[0] = selectedContents;
    let answer = {
      scale_type: questionArray.properties.scale_type,
      icon_type: questionArray.properties.icon_type,
      selected_option: selected
    };
    // Get scale range selection array if icon type is image
    if (answer.icon_type === "image") {
      let scaleContentArr = questionArray.properties.scale_content;
      selected = [];
      scaleQuestSelRange[0] = 0;
      scaleQuestSelRange[1] = selectedContents.id;
      for (let i = 0; i < scaleContentArr.length; i++) {
        if (
          scaleQuestSelRange[0] === scaleQuestSelRange[1] &&
          scaleQuestSelRange[0] === scaleContentArr[i].id
        ) {
          selected[0] = scaleContentArr[i];
        } else if (
          scaleQuestSelRange[0] <= scaleContentArr[i].id &&
          scaleQuestSelRange[1] >= scaleContentArr[i].id
        ) {
          selected.push(scaleContentArr[i]);
        }
      }
      answer.selected_option = selected;
    }
    questionArray.answer = answer;
    questionArray.isUpdated = true;

    let localArray = this.state.questionsArr;

    localArray[parentIndex] = questionArray;
    this.setState(
      {
        questionsArr: localArray
      },
      _ => {
        if (this.state.rightDisable === true) {
          this.executeConditions(answer);
        }
      }
    );
  }

  /**
   * Choice type question and dropdown 
   * @return - it will return layout
   * @param {*} questionIndex 
   * @param {*} questionArray - main question array  
   */
  choiceTypeDropDown(itemArray, parentIndex, questionIndex, questionArray) {
    return (
      // <ModalDropdown style={styles.dropdown_1}
      //   options={DEMO_OPTIONS_1}
      // />

      <View
        key={parentIndex}
        style={styles.dropdownWrap}>
        <DropDownPicker
          items={itemArray || []}
          searchable={false}
          containerStyle={{ height: 60 }}
          itemStyle={{ justifyContent: 'flex-start' }}
          labelStyle={{
            color: Color.colorDarkBlue,
            fontSize: Dimension.normalText
          }}
          dropDownStyle={{ backgroundColor: Color.colorWhite }}
          onChangeItem={item => {
            this.dropDownSelection(item, parentIndex, questionIndex, questionArray)
          }}
        />
      </View >

    )
  }
  /**
   * Dropdown item selection set answer
   * @param selectedItem - selected item
   * @param parentIndex - main index 
   * @param questionArray - survey question array 
   * */
  dropDownSelection(selectedItem, parentIndex, questionIndex, questionArray) {

    let { dropDownArray } = this.state;
    let answer = "";

    dropDownArray && dropDownArray[parentIndex].data.map((obj, index) => {
      if (obj.id == selectedItem.id) {
        obj['selected'] = true,
          answer = {
            choice_type: "single",
            display_type: "dropdown",
            multilevel: 0,
            id: obj.id,
            label: obj.label,
            label_text: obj.label_text,
            label_image: "",
            remote_label_image: ""
          };
      }
      else {
        obj['selected'] = false
      }
    })


    questionArray.answer = answer; //replace answer object
    questionArray.isUpdated = true;
    let localArray = this.state.questionsArr;
    localArray[questionIndex] = questionArray; //replace question array
    this.setState(
      {
        questionsArr: localArray
      },
      _ => {
        if (this.state.rightDisable === true) {
          this.executeConditions(answer);
        }
      }
    );
  }


  /**
   * Multilevel true and multi choice type render method
   * @return - it will return layout
   * @param itemInnerArray - this is innerArray of multiLevelTrueMultiChoiceOuterArray
   * @param parentPosition - this is question/view pager position
   * */
  multiLevelTrueMultiChoiceLayout(itemInnerArray, parentIndex, questionIndex, questionArray) {
    return (<SectionList
      key={parentIndex}
      style={styles.sectionListContainer}
      sections={
        itemInnerArray
      }

      renderSectionHeader={({ section }) => {
        return (
          <TouchableWithoutFeedback
            onPress={() => this.multiHeader(section.position, section.headerClicked, true, parentIndex)}>
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between'
                }}>
                <View flex={0.8} style={styles.headerItem}>
                  <Image
                    style={styles.plusImage}
                    source={this.headerClickImage(section.headerClicked)} />
                  {/* <Text style={styles.headerTitle}>{section.title}</Text> */}
                  {section.title ? <RenderHtml
                    source={{ html: section.title_text ? section.title_text : section.title }}
                    contentWidth={width}
                    baseStyle={styles.baseStyleSectionTitle}
                    //baseFontStyle={styles.headerTitle}
                    tagsStyles={darkBluetagsStyles}
                  /> : null}
                </View>
                <View flex={0.2}
                  style={{
                    justifyContent: 'center',
                    alignSelf: 'center',
                    alignItems: 'center',
                    alignContent: 'center',
                    paddingRight: 5
                  }} >
                  {
                    section.image !== '' && (
                      <Image
                        resizeMode={'contain'}
                        resizeMethod={'resize'}
                        style={styles.sectionProductImage}
                        source={section.image}
                      />
                    )
                  }
                </View>

              </View>
              <View style={styles.viewBg} />
            </View>
          </TouchableWithoutFeedback>
        )
      }}

      renderItem={({ item, index, section }) => {
        return (
          section.headerClicked && (
            <TouchableWithoutFeedback
              onPress={() => this.multipleCheck(index, section.position, item, parentIndex, questionIndex, questionArray)}>
              <View>
                <View style={styles.subItem}>
                  <View flex={0.9} style={[styles.subItemInnerView, {
                    paddingTop: 5,
                    paddingBottom: 5
                  }]}>
                    <Image style={styles.checkBoxImage}
                      source={this.imageCheckBox(item.isClicked)} />
                    {/* <Text style={styles.subText}>{item.sublabel}</Text> */}
                    {item.sublabel ?
                      <RenderHtml
                        source={{ html: item.sublabel_text ? item.sublabel_text : item.sublabel }}
                        contentWidth={width}
                        baseStyle={styles.baseStyleSubText}
                        //baseFontStyle={styles.subText}
                        tagsStyles={darkBluetagsStyles}
                      /> : null}
                  </View>
                  <View flex={0.1}
                    style={{
                      justifyContent: 'center',
                      alignSelf: 'center',
                      alignItems: 'center',
                      alignContent: 'center',
                      paddingRight: 5
                    }} >
                    {
                      item.label_image !== '' && item.label_image !== null && item.label_image !== undefined && (
                        <Image
                          resizeMode={'contain'}
                          resizeMethod={'resize'}
                          style={styles.sectionProductImage}
                          source={{ uri: item.label_image }}
                        />
                      )
                    }
                  </View>

                </View>
                {item.id === 'other' &&
                  <View style={styles.othertextbox}>
                    <TextInput
                      style={styles.othertextinput}
                      multiline={true}
                      editable={item.isClicked}
                      value={this.setAnswerForOtherInput(questionArray, questionIndex)}
                      onChangeText={text => this.updateOtherTextInput(questionArray, text, questionIndex, index)}
                      onFocus={() => { Platform.OS == 'ios' ? this.scrollView.scrollToEnd() : null }}
                    />
                  </View>
                }
                <View style={styles.viewBg} />
              </View>

            </TouchableWithoutFeedback>
          )

        )
      }

      }

      keyExtractor={(item, index) => index}

    />

    )
  }

  /**
   *
  Multilevel true and single choice type render method
   * @return - it will return layout
   * @param itemInnerArray - this is innerArray of multiLevelTrueSingleChoiceOuterArray
   * @param parentPosition - this is question/view pager position
   * */
  multiLevelTrueSingleChoiceLayout(itemInnerArray, parentPosition, questionIndex, questionArray) {
    return (
      <SectionList
        key={parentPosition}
        style={styles.sectionListContainer}
        sections={
          itemInnerArray
        }

        renderSectionHeader={({ section }) => {
          return (
            <View>
              <TouchableWithoutFeedback style={styles.headerItem}
                onPress={() => this.multiHeader(section.position, section.headerClicked, false, parentPosition)}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                  }}>
                  <View flex={0.8} style={styles.headerItem}>
                    <Image
                      style={styles.plusImage}
                      source={this.headerClickImage(section.headerClicked)} />
                    {/* <Text
                      style={styles.headerTitle}>{section.title}</Text> */}
                    {section.title ? <RenderHtml
                      source={{ html: section.title_text ? section.title_text : section.title }}
                      contentWidth={width}
                      baseStyle={styles.baseStyleSectionTitle}
                      //baseFontStyle={styles.headerTitle}
                      tagsStyles={darkBluetagsStyles}
                    /> : null}
                  </View>
                  <View flex={0.2}
                    style={{
                      justifyContent: 'center',
                      alignSelf: 'center',
                      alignItems: 'center',
                      alignContent: 'center',
                      paddingRight: 5
                    }} >
                    {
                      section.image !== '' && (
                        <Image
                          resizeMode={'contain'}
                          resizeMethod={'resize'}
                          style={styles.sectionProductImage}
                          source={section.image}
                        />
                      )
                    }
                  </View>
                </View>
              </TouchableWithoutFeedback>

              <View style={styles.viewBg} />
            </View>
          )
        }}

        renderItem={({ item, index, section }) => {
          return (
            section.headerClicked && (

              <TouchableWithoutFeedback
                onPress={() => this.singleCheck(index, section.position, item, parentPosition, questionIndex, questionArray)}>
                <View>
                  <View style={styles.subItem}>
                    <View flex={0.9} style={[styles.subItemInnerView, {
                      paddingTop: 5,
                      paddingBottom: 5
                    }]}>
                      <Image style={styles.checkBoxImage}
                        source={this.imageCheckBox(item.isClicked)} />
                      {/* <Text style={styles.subText}>{item.sublabel}</Text> */}
                      {item.sublabel ? <RenderHtml
                        source={{ html: item.sublabel_text ? item.sublabel_text : item.sublabel }}
                        contentWidth={width}
                        baseStyle={styles.baseStyleSubText}
                        //baseFontStyle={styles.subText}
                        tagsStyles={darkBluetagsStyles}
                      /> : null}
                    </View>
                    <View flex={0.1}
                      style={{
                        justifyContent: 'center',
                        alignSelf: 'center',
                        alignItems: 'center',
                        alignContent: 'center',
                        paddingRight: 5
                      }} >
                      {
                        item.label_image !== '' && item.label_image !== null && item.label_image !== undefined && (
                          <Image
                            resizeMode={'contain'}
                            resizeMethod={'resize'}
                            style={styles.sectionProductImage}
                            source={{ uri: item.label_image }}
                          />
                        )
                      }
                    </View>
                  </View>
                  {item.id === 'other' &&
                    <View style={styles.othertextbox}>
                      <TextInput
                        onFocus={() => { Platform.OS == 'ios' ? this.scrollView.scrollToEnd() : null }}
                        multiline={true}
                        style={styles.othertextinput}
                        editable={item.isClicked}
                        value={this.setAnswerForOtherInput(questionArray, questionIndex)}
                        onChangeText={text => {
                          this.updateOtherTextInput(questionArray, text, questionIndex, index),
                            Platform.OS == 'ios' ? this.scrollView.scrollToEnd() : null
                        }}
                      />
                    </View>
                  }
                  <View style={styles.viewBg} />
                </View>
              </TouchableWithoutFeedback>

            )

          )

        }

        }

        keyExtractor={(item, index) => index}

      />)
  }

  /**
   * Multilevel false and single choice type render method
   * @param item- list row item
   * @parentPosition- this is parent array position to get child array
   * @return - it will return layout
   * */
  multiLevelFalseSingleChoiceLayoutImageSizeLarge(
    itemstorender,
    parentPosition,
    questionIndex,
    questionArr,
    image_size,
    choice_type
  ) {
    return (
      <View
        //  key={Date.now()}
        style={styles.sectionListContainer}
      >
        <VirtualizedList
          data={itemstorender}
          getItem={(itemstorender, index) => itemstorender[index]}
          getItemCount={() => itemstorender.length}
          //  removeClippedSubviews={true}
          bounces={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => {
            return (
              <TouchableWithoutFeedback
                onPress={() => choice_type === 'single' ?
                  this.singleLevelCheck(
                    parentPosition,
                    index,
                    questionIndex,
                    questionArr
                  ) :
                  this.singleLevelMultiCheck(
                    index,
                    item,
                    parentPosition,
                    questionIndex,
                    questionArr
                  )
                }
              >
                <View>
                  <View style={{
                    paddingTop: 15,
                    paddingBottom: 15
                  }}>
                    {item.label_image !== "" &&
                      item.label_image !== null &&
                      item.label_image !== undefined && (
                        <Image
                          resizeMode={"contain"}
                          resizeMethod={'resize'}
                          style={[
                            //  styles.sectionProductImage,
                            {
                              width: '95%',
                              height: 160,
                              alignSelf: "center",
                              //  marginRight: 10
                            },
                            //  { marginRight: 10 }
                          ]}
                          source={{ uri: item.label_image }}
                        />
                      )}
                    <View
                      style={{
                        flexDirection: "row",
                        alignSelf: "stretch",
                        paddingTop: 10,
                        //  paddingBottom: 10,
                        marginLeft: 10
                      }}
                    >
                      <Image
                        style={styles.checkBoxImage}
                        source={this.imageCheckBox(item.isClicked)}
                      />
                      {/* <Text style={styles.subText}>{item.label}</Text> */}
                      {item.label ? <RenderHtml
                        source={{ html: item.label_text ? item.label_text : item.label }}
                        contentWidth={width}
                        baseStyle={styles.baseStyleSubText}
                        //baseFontStyle={styles.subText}
                        tagsStyles={darkBluetagsStyles}
                      /> : null}

                    </View>

                  </View>
                  {item.id === 'other' &&
                    <View>
                      <View style={styles.othertextbox}>
                        <TextInput
                          onFocus={() => { Platform.OS == 'ios' ? this.scrollView.scrollToEnd() : null }}
                          multiline={true}
                          editable={item.isClicked}
                          style={styles.othertextinput}
                          value={this.setAnswerForOtherInput(questionArr, questionIndex)}
                          onChangeText={text => {
                            this.updateOtherTextInput(questionArr, text, questionIndex, index),
                              Platform.OS == 'ios' ? this.scrollView.scrollToEnd() : null
                          }}
                        />
                      </View>
                    </View>
                  }
                  {/* <View style={styles.viewBg} /> */}
                </View>
              </TouchableWithoutFeedback>
            );
          }}
        />
      </View>
    );
  }

  /**
  * multilevel false layout with image size
  *Multilevel false and single choice medium || large image size type render method
  * */
  multiLevelFalseSingleChoiceLayoutImageSize(
    datatorender,
    parentPosition,
    questionIndex,
    questionArr,
    image_size,
    choice_type
  ) {
    let itemstorender = cloneDeep(datatorender);
    var idx = 0
    let result = [];
    let others = [];

    while (idx < itemstorender.length) {
      itemstorender[idx].index = idx;
      if (itemstorender[idx].id === 'other') {
        others.push(itemstorender[idx])
        itemstorender[idx] = {}
      }
      if (idx % 2 === 0) result.push([])
      result[result.length - 1].push(itemstorender[idx++])
    }
    others.length > 0 ? result.push(others) : false

    return (
      <View
        //key={Date.now()}
        style={styles.sectionListContainer}
      >
        <View
          style={{
            paddingBottom: 5,
            paddingTop: 5
          }}
        >
          <VirtualizedList
            data={result}
            getItem={(result, index) => result[index]}
            getItemCount={() => result.length}
            //  removeClippedSubviews={true}
            bounces={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => {
              return (
                <View key={index} style={{
                  flexDirection: 'row',
                  width: '100%',
                }}>
                  {item.map((elem, i) => (
                    item[i].hasOwnProperty('id') &&
                    <View
                      style={[{

                        width: elem.id === 'other' ? '100%' : '50%',
                        backgroundColor: 'white',
                        flexDirection: "column",
                        alignSelf: 'center',
                        justifyContent: 'center'
                      }]}
                    >
                      <TouchableWithoutFeedback
                        style={{
                          // flexDirection: "column",
                          width: '100%',
                          // alignSelf:'center',
                          // justifyContent :'center'
                        }}
                        onPress={() => choice_type === 'single' ?
                          this.singleLevelCheck(
                            parentPosition,
                            elem.index,
                            questionIndex,
                            questionArr
                          ) :
                          this.singleLevelMultiCheck(
                            elem.index,
                            elem,
                            parentPosition,
                            questionIndex,
                            questionArr
                          )
                        }
                      >
                        <View
                          style={[{
                            flexDirection: "column",
                            width: '100%',
                            marginBottom: 10,
                            marginTop: 10
                          }]}
                        >
                          <View style={[{
                            alignSelf: 'center',
                            justifyContent: 'center',

                          }, item.length > 1 ?
                            (item[0].label_image === "" ||
                              item[0].label_image === null ||
                              item[0].label_image === undefined) ?

                              (
                                item[1].label_image === "" ||
                                item[1].label_image === null ||
                                item[1].label_image === undefined
                              ) ? {} : { width: 120, height: 80 }
                              : { width: 120, height: 80 }
                            : (elem.label_image === "" ||
                              elem.label_image === null ||
                              elem.label_image === undefined) ? {} :
                              { width: 120, height: 80 }

                          ]}>

                            {elem.label_image !== "" &&
                              elem.label_image !== null &&
                              elem.label_image !== undefined && (
                                <Image
                                  resizeMode={"contain"}
                                  resizeMethod={'resize'}
                                  style={{
                                    width: 120,
                                    height: 80,
                                    alignSelf: "center",
                                  }}
                                  source={{ uri: elem.label_image }}
                                />
                              )}
                          </View>
                          <View
                            style={{
                              flexDirection: "row",
                              alignSelf: "center",
                              width: 120,
                              // paddingTop: 0,
                              marginTop: 5,
                              // paddingBottom: 10,
                              // marginLeft: 10,
                              // marginRight:10
                            }}
                          >
                            <Image
                              style={styles.checkBoxImage}
                              source={this.imageCheckBox(elem.isClicked)}
                            />
                            {/* <Text style={{
                              // styles.subText
                              color: Color.colorDarkBlue,
                              fontSize: Dimension.normalText,
                              paddingLeft: 10,
                              // marginRight: 20,
                              paddingRight: 10
                            }}>{elem.label}</Text> */}

                            {elem.label ? <RenderHtml
                              source={{ html: elem.label_text ? elem.label_text : elem.label }}
                              contentWidth={width}
                              baseStyle={styles.baseStyleSubText}
                              //baseFontStyle={styles.subText}
                              tagsStyles={darkBluetagsStyles}
                            /> : null}
                          </View>


                          {elem.id === 'other' &&
                            <View>
                              <View style={styles.othertextbox}>
                                <TextInput
                                  onFocus={() => { Platform.OS == 'ios' ? this.scrollView.scrollToEnd() : null }}
                                  multiline={true}
                                  editable={elem.isClicked}
                                  style={styles.othertextinput}
                                  value={this.setAnswerForOtherInput(questionArr, questionIndex)}
                                  onChangeText={text => {
                                    this.updateOtherTextInput(questionArr, text, questionIndex, elem.index),
                                      Platform.OS == 'ios' ? this.scrollView.scrollToEnd() : null
                                  }
                                  }
                                />
                              </View>
                            </View>
                          }
                          {/* <View style={styles.viewBg} /> */}
                        </View>
                      </TouchableWithoutFeedback>
                    </View>
                  ))}
                </View>
              );
            }}
          />
        </View>
      </View>
    );
  }

  /**
   * Multilevel false and single choice type render method
   * @param item- list row item
   * @parentPosition- this is parent array position to get child array
   * @return - it will return layout
   * */
  multiLevelFalseSingleChoiceLayout(itemstorender, parentPosition, questionIndex, questionArr) {
    return (
      <View
        // key={Date.now()}
        style={styles.sectionListContainer}
      >
        <VirtualizedList
          data={itemstorender}
          getItem={(itemstorender, index) => itemstorender[index]}
          getItemCount={() => itemstorender.length}
          // removeClippedSubviews={true}
          bounces={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => {
            return (
              <TouchableWithoutFeedback
                onPress={() => this.singleLevelCheck(parentPosition, index, questionIndex, questionArr)}>
                <View>
                  <View style={styles.flatContainer}>
                    <View flex={0.8} style={{
                      flexDirection: 'row',
                      alignSelf: 'stretch',
                      paddingTop: 10,
                      paddingBottom: 10,
                      marginLeft: 10
                    }}>
                      <Image
                        style={styles.checkBoxImage}
                        source={this.imageCheckBox(item.isClicked)} />
                      {/* <Text style={styles.subText}>{item.label}</Text> */}
                      {item.label ? <RenderHtml
                        source={{ html: item.label_text ? item.label_text : item.label }}
                        contentWidth={width}
                        baseStyle={styles.baseStyleSubText}
                        //baseFontStyle={styles.subText}
                        tagsStyles={darkBluetagsStyles}
                      /> : null}
                    </View>
                    <View flex={0.2}
                      style={{
                        justifyContent: 'center',
                        alignSelf: 'center',
                        alignItems: 'center',
                        alignContent: 'center',
                        paddingRight: 5
                      }} >
                      {
                        item.label_image !== '' && item.label_image !== null && item.label_image !== undefined && (
                          <Image
                            resizeMode={'contain'}
                            resizeMethod={'resize'}
                            style={[styles.sectionProductImage, { marginRight: 10 }]}
                            source={{ uri: item.label_image }}
                          />
                        )
                      }
                    </View>

                  </View>
                  {item.id === 'other' &&
                    <View>
                      <View style={styles.othertextbox}>
                        <TextInput
                          onFocus={() => { Platform.OS == 'ios' ? this.scrollView.scrollToEnd() : null }}
                          multiline={true}
                          editable={item.isClicked}
                          style={styles.othertextinput}
                          value={this.setAnswerForOtherInput(questionArr, questionIndex)}
                          onChangeText={text => {
                            this.updateOtherTextInput(questionArr, text, questionIndex, index),
                              Platform.OS == 'ios' ? this.scrollView.scrollToEnd() : null
                          }
                          }
                        />
                      </View>
                    </View>
                  }
                  <View style={styles.viewBg} />
                </View>
              </TouchableWithoutFeedback>
            );
          }}
        />
      </View>
    )
  }

  /**
   * Multilevel false and multi choice type render method
   * @param itemArray- list row item
   * @parentPosition- this is parent array position to get child array
   * @return - it will return layout
   * */
  multiLevelFalseMultiChoiceLayout(itemstorender, parentPosition, questionIndex, questionArr) {
    return (
      <View
        // key={Date.now()}
        style={styles.sectionListContainer}
      >
        <VirtualizedList
          data={itemstorender}
          getItem={(itemstorender, index) => itemstorender[index]}
          getItemCount={() => itemstorender.length}
          // removeClippedSubviews={true}
          bounces={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => {

            return (
              <TouchableWithoutFeedback
                onPress={() => this.singleLevelMultiCheck(index, item, parentPosition, questionIndex, questionArr)}>
                <View>
                  <View style={styles.flatContainer}>
                    <View flex={0.9} style={{
                      flexDirection: 'row',
                      marginLeft: 10,
                      alignSelf: 'stretch',
                      paddingTop: 10,
                      paddingBottom: 10
                    }}>
                      <Image
                        style={styles.checkBoxImage}
                        source={this.imageCheckBox(item.isClicked)} />
                      {/* <Text style={styles.subText}>{item.label}</Text> */}
                      {item.label ? <RenderHtml
                        source={{ html: item.label_text ? item.label_text : item.label }}
                        contentWidth={width}
                        baseStyle={styles.baseStyleSubText}
                        //baseFontStyle={styles.subText}
                        tagsStyles={darkBluetagsStyles}
                      /> : null}
                    </View>
                    <View flex={0.1}
                      style={{
                        justifyContent: 'center',
                        alignSelf: 'center',
                        alignItems: 'center',
                        alignContent: 'center',
                        paddingRight: 5
                      }} >
                      {
                        item.label_image !== '' && item.label_image !== null && item.label_image !== undefined && (
                          <Image
                            resizeMode={'contain'}
                            resizeMethod={'resize'}
                            style={[styles.sectionProductImage, { marginRight: 10 }]}
                            source={{ uri: item.label_image }}
                          />
                        )
                      }
                    </View>

                  </View>
                  {item.id === 'other' &&
                    <View>
                      <View style={styles.othertextbox}>
                        <TextInput
                          onFocus={() => { Platform.OS == 'ios' ? this.scrollView.scrollToEnd() : null }}
                          multiline={true}
                          editable={item.isClicked}
                          style={styles.othertextinput}
                          value={this.setAnswerForOtherInput(questionArr, questionIndex)}
                          onChangeText={text => {
                            this.updateOtherTextInput(questionArr, text, questionIndex, index),
                              Platform.OS == 'ios' ? this.scrollView.scrollToEnd() : null
                          }
                          }
                        />
                      </View>
                    </View>
                  }
                  <View style={styles.viewBg} />
                </View>
              </TouchableWithoutFeedback>
            );
          }}

        />
      </View>
    )
  }

  /* update choice question other option textbox onchange update */
  updateOtherTextInput(questionArray, text, questionIndex, index) {
    questionArray.answer.other_value = text;
    questionArray.isUpdated = true;
    let localArray = this.state.questionsArr;
    localArray[questionIndex] = questionArray;
    this.setState(
      {
        questionsArr: localArray
      })
  }

  /**
   * Dynamic styles on info type questions
   * @param {Object} dynamicStyle styles information
   */
  stylesInfoTypeQuestion(dynamicStyle) {
    let styles = {};
    if (dynamicStyle && dynamicStyle.font_style) {
      if (dynamicStyle.font_style === "bold") {
        styles.fontWeight = "bold";
      } else if (dynamicStyle.font_style === "italic") {
        styles.fontStyle = "italic";
      } else if (dynamicStyle.font_style === "underline") {
        styles.textDecorationLine = "underline";
      } else if (dynamicStyle.font_style === "strike") {
        styles.textDecorationLine = "line-through";
      }
    }
    if (dynamicStyle && dynamicStyle.text_align) {
      styles.textAlign = dynamicStyle.text_align;
    }
    return styles;
  }

  /**
   * Audio Play Functions 
   *  for the progress update
   */
  onSliderEditStart = () => {
    this.sliderEditing = true;
  };
  onSliderEditEnd = () => {
    this.sliderEditing = false;
  };
  onSliderEditing = value => {
    if (this.sound) {
      this.sound.setCurrentTime(value);
      this.setState({ playSeconds: value });
    }
  };

  /**
   * Audio File Play Function
   */
  handleAudioPlay = async (audioFile, index = null) => {
    let filepath;
    if (this.sound) {
      this.sound.play(this.playComplete);
      this.setState({ playState: "playing", audioLoader: false });
    } else {
      if (audioFile) {
        filepath = audioFile;
      } else if (index && !this.sound) {
        let localArray = this.state.questionsArr;
        currentArrValue = localArray[index];
        filepath = currentArrValue.answer.media;
      }

      if (filepath) {
        this.setSound(filepath);
      }
    }
  };

  /* reset audio player when reaches end */
  playComplete = success => {
    if (this.sound) {
      if (success) {
        //console.log('successfully finished playing');
      } else {
        //console.log('playback failed due to audio decoding errors');
        // Alert.alert('Notice', 'audio file error. (Error code : 2)');
      }
      this.setState({ playState: "paused", playSeconds: 0 });
      this.sound.setCurrentTime(0);
    }
  };

  /**
   * Audio File Pause Function
   */
  handleAudioPause = () => {
    if (this.sound) {
      this.sound.pause();
    }

    this.setState({ playState: "paused" });
  };

  /**
   * Audio Progress move 15 seconds front and back function
   */
  jumpPrev5Seconds = () => {
    this.jumpSeconds(-5);
  };
  jumpNext5Seconds = () => {
    this.jumpSeconds(5);
  };
  jumpSeconds = secsDelta => {
    if (this.sound) {
      this.sound.getCurrentTime((secs, isPlaying) => {
        let nextSecs = secs + secsDelta;
        if (nextSecs < 0) nextSecs = 0;
        else if (nextSecs > this.state.duration) nextSecs = this.state.duration;
        this.sound.setCurrentTime(nextSecs);
        this.setState({ playSeconds: nextSecs });
      });
    }
  };

  /**
   * Getting audio time duration string
   * @param {seconds} calculate total audio time duration
   */
  getAudioTimeString(seconds) {
    const h = parseInt(seconds / (60 * 60));
    const m = parseInt((seconds % (60 * 60)) / 60);
    const s = parseInt(seconds % 60);

    return (
      (h < 10 ? "0" + h : h) +
      ":" +
      (m < 10 ? "0" + m : m) +
      ":" +
      (s < 10 ? "0" + s : s)
    );
  }

  /** Handle navigation change */
  handleNavigationChange = (navState, idx) => {
    if (navState.title) {
      realContentHeight[idx] = parseInt(navState.title, 10) || 0; // turn NaN to 0
    }
    if (typeof this.props.onNavigationStateChange === "function") {
      this.props.onNavigationStateChange(navState);
    }
  }

  /**
   * Layout for info question type
   * @param {Array} questionArr Current question array
   */
  layoutInfoTypeQuestion(questionArr, idx) {
    const currentTimeString = this.getAudioTimeString(this.state.playSeconds);
    const durationString = this.getAudioTimeString(this.state.duration);
    let webViewScrollHeight = this.state.scrollViewHeight - 100;
    let webViewScrollWidth = this.state.scrollViewWidth - 100;
    let fontFamilyCss = `<head><meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0,user-scalable=0"><style type="text/css"> @font-face {font-family: 'Roboto-Medium'; src:url('/assets/Roboto-Medium.ttf')} p {margin:0; padding: 0}</style></head>`;
    let infoTextImage = "";
    let infoTextVideo = "";
    let infoTextAudio = "";
    if (
      questionArr.properties.info_type === "image" &&
      questionArr.properties.info_text &&
      questionArr.properties.info_text.length > 0
    ) {
      infoTextImage = questionArr.properties.info_text;
    } else if (
      questionArr.properties.info_type === "image"
    ) {
      infoTextImage = '<html><head></head><body></body></html>';
    } else if (
      questionArr.properties.info_type === "video" && questionArr.properties.info_text &&
      questionArr.properties.info_text.length > 0
    ) {
      infoTextVideo = questionArr.properties.info_text.replace(
        "</body>",
        '</body>'
      );
    } else if (
      questionArr.properties.info_type === "video"
    ) {
      infoTextVideo = '<html><head></head><body></body></html>';
    } else if (
      questionArr.properties.info_type === "audio" && questionArr.properties.info_text &&
      questionArr.properties.info_text.length > 0
    ) {
      infoTextAudio = questionArr.properties.info_text.replace(
        "</body>",
        '</audio></body>'
      );
    } else if (
      questionArr.properties.info_type === "audio"
    ) {
      infoTextAudio = '<html><head></head><body></body></html>';
    }

    return (
      <View>
        {/* Info TEXT */}
        {questionArr.properties.info_type === "text" ||
          (questionArr.properties.info_type === "none" && (
            <View
              style={{
                margin: 10
              }}
            >
              {questionArr.properties.hasOwnProperty("info_text") &&
                questionArr.properties.info_text.includes("</") === true && (
                  <ScrollView
                    style={{ flex: 1 }}
                    onTouchStart={ev => {
                      this.setState({ isScrollEnabled: true });
                    }}
                  >
                    <WebView
                      //customStyle={`* body { font-size: 40px; } `}
                      scalesPageToFit={false}
                      source={{
                        html: questionArr.properties.info_text.replace(
                          "<html><head></head>",
                          `<html>${fontFamilyCss}`
                        )
                      }}
                      onShouldStartLoadWithRequest={event => {
                        if (event.url && event.url.startsWith('http')) {
                          Linking.openURL(event.url)
                          return false
                        }
                        return true
                      }}
                      style={{
                        height: webViewScrollHeight,
                        width: webViewScrollWidth
                      }}
                    />
                  </ScrollView>
                )}
            </View>
          ))}
        {/* Info IMAGE */}
        {questionArr.properties.info_type === "image" && (
          <View
            style={{
              margin: 10,
              alignSelf: "center",
              flex: 1
            }}
          >
            <ScrollView>
              <View>
                <WebView
                  source={{
                    html: codeInject(infoTextImage.replace(
                      "<html><head></head>",
                      `<html>${fontFamilyCss}`)
                    )
                  }}
                  scalesPageToFit={false}
                  scrollEnabled={false}
                  javaScriptEnabled
                  onNavigationStateChange={navState => this.handleNavigationChange(navState, idx)}
                  onShouldStartLoadWithRequest={event => {
                    if (event.url && event.url.startsWith('http')) {
                      Linking.openURL(event.url)
                      return false
                    }
                    return true
                  }}
                  onLoadEnd={syntheticEvent => {
                    // update component to be aware of loading status
                    this.setState({ webview: true })
                  }}
                  onError={syntheticEvent => {
                    this.setState({ webview: true })
                  }}
                  style={{
                    width: webViewScrollWidth,
                    height: realContentHeight[idx]
                  }}
                />
                {this.state.webview &&
                  <Image
                    style={{
                      resizeMode: "contain",
                      minHeight: webViewScrollHeight - 100,
                      minWidth: webViewScrollWidth
                    }}
                    source={{ uri: questionArr.properties.info_image }}
                  />
                }
              </View>
            </ScrollView>

          </View>
        )}

        {/* Info VIDEO */}
        {questionArr.properties.info_type === "video" && (
          <View
            style={{
              margin: 10,
              alignSelf: "center",
              flex: 1
            }}
          >
            <ScrollView>
              {/* Info VIDEO - TOP - Web view */}
              <View>
                <WebView
                  source={{
                    html: codeInject(infoTextVideo.replace(
                      "<html><head></head>",
                      `<html>${fontFamilyCss}`)
                    )
                  }}
                  scalesPageToFit={false}
                  scrollEnabled={false}
                  javaScriptEnabled
                  onNavigationStateChange={navState => this.handleNavigationChange(navState, idx)}
                  onShouldStartLoadWithRequest={event => {
                    if (event.url && event.url.startsWith('http')) {
                      Linking.openURL(event.url)
                      return false
                    }
                    return true
                  }}
                  onLoadEnd={syntheticEvent => {
                    // update component to be aware of loading status
                    this.setState({ webview: true })
                  }}
                  onError={syntheticEvent => {
                    this.setState({ webview: true })
                  }}

                  style={{
                    width: webViewScrollWidth,
                    height: realContentHeight[idx]
                  }}
                />
                {this.state.webview &&
                  <VideoPlayer style={{ width: "100%", height: 200, marginTop: 10 }}
                    ref={ref => {
                      this.player = ref;
                    }}
                    resizeMode={"contain"}
                    toggleResizeModeOnFullscreen={false}
                    source={{ uri: questionArr.properties.info_video }}
                    paused={this.state.paused}
                    disableVolume={true}
                    disableBack={true}
                    onEnd={() => this.onEnd()}
                    onEnterFullscreen={() => this.setState(
                      {
                        paused: true
                      },
                      _ => {
                        this.props.navigation.navigate("PreviewVideo", { VideoUri: questionArr.properties.info_video })
                      }
                    )}
                  />
                }
              </View>
            </ScrollView>
          </View>
        )}
        {/* Info AUDIO */}
        {questionArr.properties.info_type === "audio" && (
          <View
            style={{
              margin: 10,
              alignSelf: "center",
              flex: 1
            }}
          >
            <ScrollView>
              <View>
                <WebView
                  source={{
                    html: codeInject(infoTextAudio.replace(
                      "<html><head></head>",
                      `<html>${fontFamilyCss}`
                    ))
                  }}
                  scalesPageToFit={false}
                  scrollEnabled={false}
                  javaScriptEnabled
                  onNavigationStateChange={navState => this.handleNavigationChange(navState, idx)}
                  onShouldStartLoadWithRequest={event => {
                    if (event.url && event.url.startsWith('http')) {
                      Linking.openURL(event.url)
                      return false
                    }
                    return true
                  }}

                  onLoadEnd={syntheticEvent => {
                    // update component to be aware of loading status
                    this.setState({ webview: true })
                  }}
                  onError={syntheticEvent => {
                    this.setState({ webview: true })
                  }}

                  style={{
                    width: webViewScrollWidth,
                    height: realContentHeight[idx]
                  }}
                />
                {this.state.webview &&
                  <VideoPlayer style={{ width: "100%", height: 50, marginTop: 10 }}
                    ref={ref => {
                      this.player = ref;
                    }}
                    resizeMode={"contain"}
                    toggleResizeModeOnFullscreen={false}
                    source={{ uri: questionArr.properties.info_audio }}
                    paused={this.state.paused}
                    disableVolume={true}
                    disableBack={true}
                    disableFullscreen={true}
                    disableSeekbar={true}
                  />
                }
              </View>
            </ScrollView>
          </View>
        )}
      </View>
    );
  }

  /**
   * Called on scroll view content size change
   * Get the scroll view content width and height
   * */
  onContentSizeChange = (contentWidth, contentHeight) => {
    let scrollHeight = contentHeight;
    if (cardHeight < contentHeight) {
      this.setState({ scrollArrow: 'down' });
    }
    else {
      this.setState({ scrollArrow: 'none' });
    }
  };

  /* calculate scroll close to bottom */
  isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };

  /* move scroll next position */
  nextScrollPage() {
    cardYheight = cardYheight + cardHeight;
    this.scrollView.scrollTo({ y: cardYheight - 50 })
  }

  /**
   * Disable parent scroll while table question scrolling
   */
  disableParentScroll() {
    return false;
  }

  /**
   * Submit survey
   */
  submitButtonClick = () => {
    this.stopTimeTracking()
    let questionsArray = this.state.questionsArr;
    let arrLength = questionsArray.length;
    let currentQuesIndx = this.state.pageCount;

    if (
      questionsArray[currentQuesIndx].properties.hasOwnProperty("mandatory") &&
      questionsArray[currentQuesIndx].properties.mandatory === 1
    ) {
      if (questionsArray[currentQuesIndx].questionType === "input") {
        if (
          questionsArray[currentQuesIndx].answer &&
          questionsArray[currentQuesIndx].answer.text &&
          questionsArray[currentQuesIndx].answer.text != ""
        ) {
          let questionObj = this.questionPostObject(currentQuesIndx);
          this.postAnswerToServer(questionObj, currentQuesIndx, true);
        } else {
          Constants.showSnack(this.state.translation[this.state.Language].Mandatory_Msg);
        }
      }
      else if (questionsArray[currentQuesIndx].questionType === "choice" && questionsArray[currentQuesIndx].properties.display_type === "dropdown") {
        if (
          questionsArray[currentQuesIndx].answer &&
          ((questionsArray[currentQuesIndx].answer.label_text &&
            questionsArray[currentQuesIndx].answer.label_text.length >
            0))) {
          let questionObj = this.questionPostObject(currentQuesIndx);
          this.postAnswerToServer(questionObj, currentQuesIndx, true);
        }
        else {
          Constants.showSnack(this.state.translation[this.state.Language].Mandatory_Msg);
        }
      }
      else if (
        (questionsArray[currentQuesIndx].questionType === "choice") ||
        questionsArray[currentQuesIndx].questionType === "scale"
      ) {
        if (questionsArray[currentQuesIndx].properties.scale_type == "table"
          && questionsArray[currentQuesIndx].answer &&
          ((questionsArray[currentQuesIndx].answer.selected_option &&
            questionsArray[currentQuesIndx].answer.selected_option.length < questionsArray[currentQuesIndx].properties.table_content.table_value.length
          ))) {
          /** need to select option in every row if table scale type mendatory  */
          Constants.showSnack(this.state.translation[this.state.Language].Mandatory_Msg);
        }
        else if (
          questionsArray[currentQuesIndx].answer &&
          ((questionsArray[currentQuesIndx].answer.selected_option &&
            questionsArray[currentQuesIndx].answer.selected_option.length >
            0) ||
            (questionsArray[currentQuesIndx].answer.label &&
              questionsArray[currentQuesIndx].answer.label != ""))
        ) {
          let questionObj = this.questionPostObject(currentQuesIndx);
          this.postAnswerToServer(questionObj, currentQuesIndx, true);
        } else {
          Constants.showSnack(this.state.translation[this.state.Language].Mandatory_Msg);
        }
      }
      else if (questionsArray[currentQuesIndx].questionType === "upload") {
        if (
          questionsArray[currentQuesIndx].answer &&
          questionsArray[currentQuesIndx].answer.media &&
          questionsArray[currentQuesIndx].answer.media != ""
        ) {
          let questionObj = this.questionPostObject(currentQuesIndx);
          this.postAnswerToServer(questionObj, currentQuesIndx, true);
        } else {
          Constants.showSnack(this.state.translation[this.state.Language].Mandatory_Msg);
        }
      } else if (
        questionsArray[currentQuesIndx].questionType === "capture" ||
        questionsArray[currentQuesIndx].questionType === "barcode"
      ) {
        if (
          questionsArray[currentQuesIndx].answer &&
          questionsArray[currentQuesIndx].answer.image &&
          questionsArray[currentQuesIndx].answer.image != ""
        ) {
          let questionObj = this.questionPostObject(currentQuesIndx);
          this.postAnswerToServer(questionObj, currentQuesIndx, true);
        } else {
          Constants.showSnack(this.state.translation[this.state.Language].Mandatory_Msg);
        }
      }
      else if (questionsArray[currentQuesIndx].questionType === "gps") {
        let questionObj = this.questionPostObject(currentQuesIndx);
        this.postAnswerToServer(questionObj, currentQuesIndx, true);
      }
    } else {
      let questionObj = this.questionPostObject(currentQuesIndx);
      this.postAnswerToServer(questionObj, currentQuesIndx, true);
    }
  };

  /** Method used for tracking the time spent by user
   *  on the particular survey
   */
  startTimeTracking = () => {
    this.setState({ screenTime: new Date() })
  }
  stopTimeTracking = async () => {
    let now = new Date()
    let thenTime = this.state.screenTime
    let totalTime = 0
    if (thenTime) {
      totalTime = totalTime + (Math.abs(now.getTime() - thenTime.getTime()))
    }
    let totalTimeInMinute = totalTime / 60000
    let activeTime_id = this.state.missionId.toString() + '_activeTime';
    let savedTime = await AsyncStorage.getItem(activeTime_id);
    if (savedTime !== null && savedTime !== undefined && savedTime !== '') {
      savedTime = JSON.parse(savedTime)
      let totalTimeToSave = parseFloat(savedTime) + parseFloat(totalTimeInMinute)
      totalTimeToSave = totalTimeToSave.toFixed(2)
      Constants.saveKey(activeTime_id, JSON.stringify(totalTimeToSave));
    }
    else {
      totalTimeInMinute = totalTimeInMinute.toFixed(2)
      Constants.saveKey(activeTime_id, JSON.stringify(totalTimeInMinute));
    }
  }

  /** Class render method */
  render() {
    const {
      questionsArr,
      multiLevelTrueMultiChoiceOuterArray,
      multiLevelTrueSingleChoiceOuterArray,
      multiLevelFalseSingleChoiceOuterArray,
      multiLevelFalseMultiChoiceOuterArray,
      dropDownArray,
      isLoading,
      arrLength,
      pageCount,
      leftDisable,
      leftArrow,
      rightDisable,
      rightArrow,
      postAnswerLoader,
      isScrollEnabled,
      bottomSheet,
      initialLoader,
      nextPage,
      prevPage,
      isSubmit,
      isNoReturncheck,
      surveyQuesText,
      Language,
      translation
    } = this.state;

    // debugger;
    horizontalPages = [];
    let currentPage = pageCount > prevPage ? 1 : 0;
    for (let i = 0; i < questionsArr.length; i++) {

      let pageCount = i;
      if (pageCount === this.state.pageCount) {
        horizontalPages.push(
          <View style={{ height: '100%', width: '100%' }} key={"page-" + pageCount}>
            <View
              style={{
                height: questionsArr[pageCount].questionType === "choice" ? this.state.scrollArrow === 'down' ? '95%' : '100%' : '100%',
                width: '100%'
              }}>
              <ScrollView
                key={"page-" + pageCount}
                onContentSizeChange={(contentWidth, contentHeight) => { this.onContentSizeChange(contentWidth, contentHeight) }}
                onScroll={({ nativeEvent }) => {
                  if (this.isCloseToBottom(nativeEvent)) {
                    this.setState({ scrollArrow: 'none' });
                  } else {
                    if (cardHeight < nativeEvent.contentSize.height) {
                      cardYheight = nativeEvent.contentOffset.y
                      this.setState({ scrollArrow: 'down' });
                    }
                    else {
                      this.setState({ scrollArrow: 'none' });
                    }
                  }
                }}
                scrollEnabled={
                  questionsArr[pageCount].questionType === "gps" ? false : (
                    questionsArr[pageCount].questionType === "scale" ||
                      questionsArr[pageCount].questionType === "info"
                      ? isScrollEnabled
                      : true)
                }
                scrollEventThrottle={0}
                showsVerticalScrollIndicator={false}
                ref={ref => (this.scrollView = ref)}
              >
                <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                  <View style={{ justifyContent: "flex-start", alignSelf: "stretch", flex: 1 }}>

                    {/* <View style={{ paddingTop: 20, paddingBottom: 0 }}>
                      <Text style={[styles.questionText]}>
                        {" "}
                        {questionsArr[pageCount].properties.question}
                        {questionsArr[pageCount].properties.mandatory === 1 ? (
                          <Text
                            style={{
                              fontSize: 20,
                              color: "red",
                              paddingLeft: 10
                            }}
                          >
                            {String.star}
                          </Text>
                        ) : (
                            ""
                          )}{" "}
                      </Text>
                    </View>

                    {questionsArr[pageCount].properties.hasOwnProperty(
                      "subheading"
                    ) && (
                        <Text
                          style={[
                            styles.hintText,
                            {
                              paddingBottom: 20,
                              paddingTop: 0
                            }
                          ]}
                        >
                          {questionsArr[pageCount].properties.subheading}
                        </Text>
                      )} */}

                    {/** Dynamic title html element*/}
                    <View style={{ paddingTop: 10, paddingBottom: 0 }}>
                      {questionsArr[pageCount].properties.question_text || questionsArr[pageCount].properties.question ? <RenderHtml
                        source={{ html: questionsArr[pageCount].properties.question_text ? questionsArr[pageCount].properties.question_text : questionsArr[pageCount].properties.question }}
                        contentWidth={width}
                        baseStyle={styles.baseStyleQuestionText}
                        //baseFontStyle={styles.questionText}
                        tagsStyles={extraLargetagsStyles}
                      /> : null}
                    </View>

                    {/** sub section of title */}
                    {(questionsArr[pageCount].properties.hasOwnProperty(
                      "subheading"
                    ) && questionsArr[pageCount].properties.subheading.length > 0) && (
                        <RenderHtml
                          source={{ html: questionsArr[pageCount].properties.subheading_text ? questionsArr[pageCount].properties.subheading_text : questionsArr[pageCount].properties.subheading }}
                          contentWidth={width}
                          baseStyle={styles.baseStyleSubTitle}
                          // baseFontStyle={styles.hintText}
                          tagsStyles={normalTagsStyles}
                        />
                      )}

                    {/** main remaing view after title and sub title */}
                    <View style={{ marginTop: 15 }}>

                      {/** Info question Type*/}
                      {questionsArr[pageCount].questionType === "info" &&
                        this.layoutInfoTypeQuestion(questionsArr[pageCount], pageCount)}

                      {/** TextInput question Type*/}
                      {questionsArr[pageCount].questionType === "input" &&
                        this.layoutTextInputType(
                          questionsArr[pageCount],
                          pageCount
                        )}

                      {/** Image question type - Image Tagging*/}
                      {questionsArr[pageCount].questionType === "capture" &&
                        this.layoutCaptureTypeQuestion(
                          questionsArr[pageCount],
                          pageCount
                        )}

                      {/** Scale type question*/}
                      {questionsArr[pageCount].questionType === "scale" &&
                        this.layoutScaleTypeQuestion(
                          questionsArr[pageCount],
                          pageCount
                        )}

                      {/** Image question type*/}
                      {questionsArr[pageCount].questionType === "barcode" &&
                        this.layoutScanTypeQuestion(
                          questionsArr[pageCount],
                          pageCount
                        )}

                      {questionsArr[pageCount].questionType === "gps" &&
                        this.layoutGpsTypeQuestion(
                          questionsArr[pageCount],
                          pageCount
                        )}

                      {/** choice type question and drop down */}
                      {/** working */}
                      {questionsArr[pageCount].questionType === "choice" &&
                        questionsArr[pageCount].properties.display_type === "dropdown" &&
                        dropDownArray.map(
                          (item, parentIndex) => {
                            if (item.index === pageCount) {
                              return this.choiceTypeDropDown(
                                item.data,
                                parentIndex,
                                pageCount,
                                questionsArr[pageCount]
                              )
                            }
                          }
                        )}


                      {/** multilevel true and multi choice*/}
                      {//multilevel true and multiple
                        questionsArr[pageCount].questionType === "choice" &&
                        // questionsArr[pageCount].properties.display_type === "choice" &&
                        questionsArr[pageCount].properties.choice_type ===
                        "multiple" &&
                        questionsArr[pageCount].properties.multilevel === 1 &&
                        multiLevelTrueMultiChoiceOuterArray.map(
                          (item, parentIndex) => {
                            if (item.index === pageCount) {
                              return this.multiLevelTrueMultiChoiceLayout(
                                item.data,
                                parentIndex,
                                pageCount,
                                questionsArr[pageCount]
                              );
                            }
                          }
                        )}


                      {/** multilevel true and Single choice*/}
                      {questionsArr[pageCount].questionType === "choice" &&
                        // questionsArr[pageCount].properties.display_type === "choice" &&
                        questionsArr[pageCount].properties.choice_type ===
                        "single" &&
                        questionsArr[pageCount].properties.multilevel === 1 &&
                        multiLevelTrueSingleChoiceOuterArray.map(
                          (item, parentIndex) => {
                            if (item.index === pageCount) {
                              return this.multiLevelTrueSingleChoiceLayout(
                                item.data,
                                parentIndex,
                                pageCount,
                                questionsArr[pageCount]
                              );
                            }
                          }
                        )}

                      {/**
                       * multilevel false and single choice and image_size small
                      * */}
                      {questionsArr[pageCount].questionType === "choice" &&
                        // questionsArr[pageCount].properties.display_type === "choice" &&
                        questionsArr[pageCount].properties.choice_type === "single" &&
                        questionsArr[pageCount].properties.multilevel === 0 && (
                          !questionsArr[pageCount].properties.hasOwnProperty('image_size') ||
                          questionsArr[pageCount].properties.image_size === 'small') &&
                        multiLevelFalseSingleChoiceOuterArray.map(
                          (item, parentIndex) => {
                            if (item.index === pageCount) {
                              return this.multiLevelFalseSingleChoiceLayout(
                                item.data,
                                parentIndex,
                                pageCount,
                                questionsArr[pageCount]
                              );
                            }
                          }
                        )
                      }

                      {/**
                      * multilevel false and single choice and image_size medium
                      * */}
                      {questionsArr[pageCount].questionType === "choice" &&
                        // questionsArr[pageCount].properties.display_type === "choice" &&
                        questionsArr[pageCount].properties.choice_type === "single" &&
                        questionsArr[pageCount].properties.multilevel === 0 &&
                        questionsArr[pageCount].properties.hasOwnProperty('image_size') &&
                        questionsArr[pageCount].properties.image_size === 'medium' &&
                        multiLevelFalseSingleChoiceOuterArray.map(
                          (item, parentIndex) => {
                            if (item.index === pageCount) {
                              return this.multiLevelFalseSingleChoiceLayoutImageSize(
                                item.data,
                                parentIndex,
                                pageCount,
                                questionsArr[pageCount],
                                questionsArr[pageCount].properties.image_size,
                                'single'
                              );
                            }
                          }
                        )
                      }

                      {/**
                      * multilevel false and single choice and image_size large
                      * */}
                      {questionsArr[pageCount].questionType === "choice" &&
                        // questionsArr[pageCount].properties.display_type === "choice" &&
                        questionsArr[pageCount].properties.choice_type === "single" &&
                        questionsArr[pageCount].properties.multilevel === 0 &&
                        questionsArr[pageCount].properties.hasOwnProperty('image_size') &&
                        questionsArr[pageCount].properties.image_size === 'large' &&
                        multiLevelFalseSingleChoiceOuterArray.map(
                          (item, parentIndex) => {
                            if (item.index === pageCount) {
                              return this.multiLevelFalseSingleChoiceLayoutImageSizeLarge(
                                item.data,
                                parentIndex,
                                pageCount,
                                questionsArr[pageCount],
                                questionsArr[pageCount].properties.image_size,
                                'single'
                              );
                            }
                          }
                        )
                      }

                      {/**
                      * multilevel false and multiple choice and image size small
                      * */
                        questionsArr[pageCount].questionType === "choice" &&
                        // questionsArr[pageCount].properties.display_type === "choice" &&
                        questionsArr[pageCount].properties.choice_type === "multiple" &&
                        questionsArr[pageCount].properties.multilevel === 0 && (
                          !questionsArr[pageCount].properties.hasOwnProperty('image_size') ||
                          questionsArr[pageCount].properties.image_size === 'small') &&
                        multiLevelFalseMultiChoiceOuterArray.map(
                          (item, parentIndex) => {
                            if (item.index === pageCount) {
                              return this.multiLevelFalseMultiChoiceLayout(
                                item.data,
                                parentIndex,
                                pageCount,
                                questionsArr[pageCount]
                              );
                            }
                          }
                        )}

                      {/**
                      * multilevel false and multiple choice and image size medium
                      * */}
                      {questionsArr[pageCount].questionType === "choice" &&
                        // questionsArr[pageCount].properties.display_type === "choice" &&
                        questionsArr[pageCount].properties.choice_type === "multiple" &&
                        questionsArr[pageCount].properties.multilevel === 0 &&
                        questionsArr[pageCount].properties.hasOwnProperty('image_size') &&
                        questionsArr[pageCount].properties.image_size === 'medium' &&
                        multiLevelFalseMultiChoiceOuterArray.map(
                          (item, parentIndex) => {
                            if (item.index === pageCount) {
                              return this.multiLevelFalseSingleChoiceLayoutImageSize(
                                item.data,
                                parentIndex,
                                pageCount,
                                questionsArr[pageCount],
                                questionsArr[pageCount].properties.image_size,
                                'multiple'
                              );
                            }
                          }
                        )
                      }

                      {/**
                      * multilevel false and multiple choice and image size large
                      * */}
                      {questionsArr[pageCount].questionType === "choice" &&
                        // questionsArr[pageCount].properties.display_type === "choice" &&
                        questionsArr[pageCount].properties.choice_type === "multiple" &&
                        questionsArr[pageCount].properties.multilevel === 0 &&
                        questionsArr[pageCount].properties.hasOwnProperty('image_size') &&
                        questionsArr[pageCount].properties.image_size === 'large' &&
                        multiLevelFalseMultiChoiceOuterArray.map(
                          (item, parentIndex) => {
                            if (item.index === pageCount) {
                              return this.multiLevelFalseSingleChoiceLayoutImageSizeLarge(
                                item.data,
                                parentIndex,
                                pageCount,
                                questionsArr[pageCount],
                                questionsArr[pageCount].properties.image_size,
                                'multiple'
                              );
                            }
                          }
                        )
                      }

                      {/** Media upload type question*/}
                      {questionsArr[pageCount].questionType === "upload" &&
                        this.layoutMediaUploadTypeQuestion(
                          questionsArr[pageCount],
                          pageCount
                        )}
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>

            {questionsArr[pageCount].questionType === "choice" && this.state.scrollArrow === 'down' &&
              <View style={{ height: '5%', width: '100%', }}>
                <TouchableOpacity
                  style={{
                    alignSelf: 'center',
                    justifyContent: 'center',
                    height: '100%',
                  }}
                  onPress={() => this.nextScrollPage()}
                >
                  <Image style={{ width: 20, height: 20, }}
                    source={require("../../images/survey/down_navigator.png")}
                  />
                </TouchableOpacity>
              </View>
            }
          </View>
        );
      }
      else {
        if (rightDisable && i > this.state.pageCount) {
          // skip question
        }

        else {
          horizontalPages.push(
            <View key={"page-" + pageCount}>
            </View>
          )
        }
      }
    }

    const { recording, processing } = this.state;

    let button = (
      <TouchableOpacity
        onPress={this.startVideoRecording.bind(this, pageCount)}
        style={styles.capture}
      >
        <View
          style={{
            width: 50,
            height: 50,
            backgroundColor: "red",
            borderRadius: 100
          }}
        />
      </TouchableOpacity>
    );

    if (recording) {
      button = (
        <TouchableOpacity
          onPress={this.stopVideoRecording.bind(this, pageCount)}
          style={styles.capture}
        >
          <View
            style={{
              width: 35,
              height: 35,
              flex: 0,
              backgroundColor: "red",
              justifyContent: "center",
              alignSelf: "center",
              alignItems: "center",
              marginTop: 7
            }}
          />
        </TouchableOpacity>
      );
    }

    if (processing) {
      button = (
        <View style={styles.capture}>
          <ActivityIndicator animating size={18} />
        </View>
      );
    }

    return (
      <View style={styles.videoCameraContainer}>
        {this.state.showCamera && (
          <View style={styles.videoCameraContainer}>
            <RNCamera
              ref={ref => {
                this.camera = ref;
              }}
              style={styles.preview}
              type={RNCamera.Constants.Type.back}
              flashMode={RNCamera.Constants.FlashMode.on}
              androidCameraPermissionOptions={{
                title: this.state.translation[this.state.Language].Permission_Title,
                message: this.state.translation[this.state.Language].Camera_General_Permission,
                buttonPositive: this.state.translation[this.state.Language].OK,
                buttonNegative: this.state.translation[this.state.Language].Cancel
              }}
              androidRecordAudioPermissionOptions={{
                title: this.state.translation[this.state.Language].Permission_Title,
                message: this.state.translation[this.state.Language].Audio_Recorder_Permission,
                buttonPositive: this.state.translation[this.state.Language].OK,
                buttonNegative: this.state.translation[this.state.Language].Cancel
              }}
              onGoogleVisionBarcodesDetected={({ barcodes }) => { }}
            />
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <TouchableOpacity>
                <View style={{ width: 50, height: 50 }} />
              </TouchableOpacity>
              {button}
              {!recording && (
                <TouchableOpacity
                  style={{ alignSelf: "center", marginRight: 10 }}
                  onPress={this.closeVideoCamera.bind(this)}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}
                  >
                    {translation[Language].Cancel}
                  </Text>
                </TouchableOpacity>
              )}
              {recording && (
                <TouchableOpacity>
                  <View style={{ width: 50, height: 50 }} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        {!this.state.showCamera && (
          <AndroidBackHandler onBackPress={this.onBackButtonPressAndroid}>
            <SafeAreaView
              style={{ backgroundColor: Color.colorDarkBlue, flex: 1 }}
              edges={['right', 'top', 'left']}
              forceInset={{
                bottom: "never",
                top: Platform.OS === "ios" ? (height === 812 ? 10 : 0) : 0
              }}
            >
              <StatusBar
                translucent
                backgroundColor={Color.colorBlack}
                barStyle="light-content"
              />
              <HeaderView
                title={missionName}
                type={1}
                queue={questionResponseQue}
                navigation={this.props.navigation}
                updateToSurveyParent={this.getFromHeaderChild}
                supportAction={this.supportActionClieck}
              />
              <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : ""}
                enabled
              >
                {!isLoading && arrLength > 0 && horizontalPages.length > 0 && (
                  <View style={styles.container}>
                    <View
                      style={styles.pager}
                      onLayout={e => {
                        cardHeight = e.nativeEvent.layout.height;
                        cardYheight = e.nativeEvent.layout.height;
                        this.setState({
                          scrollViewHeight: e.nativeEvent.layout.height,
                          scrollViewWidth: e.nativeEvent.layout.width
                        });
                      }}
                    >
                      {
                        <CarouselPager
                          initialPage={parseInt(pageIndex)}
                          lastPage={horizontalPages.length - 1}
                          currentPage={0}
                          ref={ref => (this.horizontalCarousel = ref)}
                          deltaDelay={10}
                          onPageChange={page => {

                          }}
                          onMove={scrollEnabled => {
                            {
                              //console.log('MOVING')
                            }
                            // this.setState({isScrollEnabled: scrollEnabled})
                          }}
                          onRightSwipe={
                            isScrollEnabled === true &&
                              initialLoader === false &&
                              rightDisable === false && isNoReturncheck === false
                              ? () => this.increment()
                              : () => this.disableParentScroll()
                          }
                          onLeftSwipe={
                            isScrollEnabled === true &&
                              initialLoader === false &&
                              leftDisable === false && isNoReturncheck === false
                              ? () => this.decrement('swipe', 100)
                              : () => this.disableParentScroll()
                          }
                          pageStyle={{
                            backgroundColor: Color.colorWhite,
                            borderRadius: 10,
                            elevation: 5
                          }}
                        >
                          {horizontalPages}
                        </CarouselPager>
                      }
                    </View>

                    <View style={styles.iconContainer}>
                      <View
                        style={{
                          flex: 1,
                          alignItems: "center",
                          alignSelf: "center"
                        }}
                      >
                        <TouchableOpacity
                          style={{ justifyContent: "center" }}
                          onPress={() => this.decrement("navButton", 0)}
                          disabled={leftDisable || isNoReturncheck}
                        >
                          {!leftDisable && initialLoader === false && (
                            <View
                              style={{
                                paddingVertical: 15,
                                paddingLeft: 50,
                                paddingRight: 60
                              }}
                            >
                              <Image
                                style={[
                                  styles.navigationIcon,
                                  { opacity: leftArrow }
                                ]}
                                source={require("../../images/survey/left_navigator.png")}
                              />
                            </View>
                          )}
                        </TouchableOpacity>
                      </View>

                      <View
                        style={{
                          flex: 1,
                          alignItems: "center",
                          alignSelf: "center"
                        }}
                      >
                        {rightDisable === true && initialLoader === false && (
                          <TouchableOpacity
                            style={styles.submit}
                            disabled={this.state.isSubmitDisable}
                            onPress={() => {
                              if (this.state.videoProcessing === true) {
                                Constants.showSnack(translation[Language].Video_Processing_Msg);
                              } else {
                                this.setState({ isSubmitDisable: true });
                                setTimeout(() => {
                                  this.setState({
                                    isSubmitDisable: false,
                                  });
                                }, 5000)  //preven double click qucikly
                                this.submitButtonClick()
                              }
                            }
                            }
                          >
                            <Text style={styles.submitText}>{translation[Language].Submit}</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      <View
                        style={{
                          flex: 1,
                          alignItems: "center",
                          alignSelf: "center"
                        }}
                      >
                        <TouchableOpacity
                          style={{ justifyContent: "center" }}
                          onPress={() => this.increment("onpress")}
                          disabled={rightDisable || isNoReturncheck}
                        >
                          {!rightDisable && initialLoader === false && isSubmit === false && isNoReturncheck === false && (
                            <View
                              style={{
                                paddingVertical: 15,
                                paddingLeft: 60,
                                paddingRight: 50
                              }}
                            >
                              <Image
                                style={[
                                  styles.navigationIcon,
                                  { opacity: rightArrow }
                                ]}
                                source={require("../../images/survey/right_navigator.png")}
                              />
                            </View>
                          )}

                          {initialLoader === true && (
                            <Text style={[styles.loaderLabel]}>
                              {translation[Language].Loading_Questions}
                            </Text>
                          )}


                          {isSubmit === true && (

                            <Text style={[styles.isSubmitLabel]}>{translation[Language].Submitting_Survey + '...'}</Text>

                          )}

                          {isNoReturncheck === true && (

                            <Text style={[styles.isSubmitLabel]}>{translation[Language].Validating_Msg}</Text>

                          )}

                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}

                {!isLoading && arrLength > 0 && (
                  <View>
                    <RBSheet
                      ref={ref => {
                        this.RBBottomSheet = ref;
                      }}
                      height={CAMERASTYLE.BOTTOM_SHEET_HEIGHT}
                      duration={CAMERASTYLE.BOTTOM_SHEET_DURATION}
                      closeOnSwipeDown={true}
                      customStyles={{
                        container: {
                          justifyContent: "center",
                          alignItems: "center"
                        }
                      }}
                    >
                      {/* Bottom Sheet */}
                      <View>
                        <View
                          style={[
                            styles.bottomSheetOption,
                            { marginBottom: 1 }
                          ]}
                        >
                          <TouchableOpacity
                            onPress={() => {
                              if (bottomSheet.type === "image" || bottomSheet.type === "capture") {
                                this.callMediaImageAccess(bottomSheet.index);
                              } else if (bottomSheet.type !== "audio") {
                                this.callMediaAccess(
                                  bottomSheet.type,
                                  bottomSheet.index,
                                  "live"
                                );
                              } else {
                                this.callMediaAccess(
                                  bottomSheet.type,
                                  bottomSheet.index,
                                  "audio"
                                );
                              }
                            }}
                          >
                            <Text style={styles.bottomSheetOptionText}>
                              {bottomSheet.type === "image"
                                ? translation[Language].Take_Photo
                                : bottomSheet.type === "audio"
                                  ? translation[Language].Take_Audio
                                  : bottomSheet.type === "video"
                                    ? translation[Language].Take_Video
                                    : translation[Language].Take_Photo}
                            </Text>
                          </TouchableOpacity>
                        </View>

                        <View
                          style={[
                            styles.bottomSheetOption,
                            { marginBottom: 1 }
                          ]}
                        >
                          <TouchableOpacity
                            onPress={() =>
                              this.callMediaAccess(
                                bottomSheet.type,
                                bottomSheet.index,
                                "gallery"
                              )
                            }
                          >
                            <Text style={styles.bottomSheetOptionText}>
                              {bottomSheet.type === "image"
                                ? translation[Language].Choose_Image
                                : bottomSheet.type === "audio"
                                  ? translation[Language].Choose_Audio
                                  : bottomSheet.type === "video"
                                    ? translation[Language].Choose_Video
                                    : translation[Language].Choose_Image}
                            </Text>
                          </TouchableOpacity>
                        </View>

                        <View style={styles.bottomSheetOption}>
                          <TouchableOpacity
                            onPress={() => this.RBBottomSheet.close()}
                          >
                            <Text style={styles.bottomSheetOptionText}>
                              {translation[Language].Cancel}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </RBSheet>
                  </View>
                )}

                {!isLoading && arrLength === 0 && (
                  <View
                    style={{
                      alignSelf: "center",
                      flex: 1,
                      justifyContent: "center"
                    }}
                  >
                    <Text style={{
                      color: Color.colorWhite, fontSize: 20, paddingLeft: 10,
                      paddingRight: 10
                    }}>
                      {surveyQuesText}
                    </Text>
                  </View>
                )}
                {isLoading && (
                  <ActivityIndicator
                    style={{
                      alignSelf: "center",
                      flex: 1,
                      justifyContent: "center"
                    }}
                    size="large"
                    color={Color.colorWhite}
                  />
                )}

                {postAnswerLoader && (
                  <View style={styles.transparentOverlay}>
                    <ActivityIndicator
                      style={{
                        alignSelf: "center",
                        flex: 1,
                        justifyContent: "center"
                      }}
                      size="large"
                      color={Color.colorWhite}
                    />
                  </View>
                )}
              </KeyboardAvoidingView>
            </SafeAreaView>
          </AndroidBackHandler>
        )}
      </View>
    );
  }
}

export default SurveyBox;

/** UI styles used for this component */
const styles = ScaledSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    backgroundColor: Color.colorSurveyBg
  },
  pager: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: Color.colorSurveyBg,
    paddingTop: 15
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "stretch",
    height: 80,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 5
  },
  navigationIcon: {
    width: 16,
    height: 25,
    alignSelf: "center"
  },
  questionText: {
    color: Color.colorDarkBlue,
    fontSize: Dimension.extraLargeText,
    justifyContent: "flex-start",
    fontWeight: "bold",
    paddingLeft: 20,
    paddingRight: 10,
    textAlign: "left",
    lineHeight: 20
  },
  textBox: {
    flexGrow: 1,
    flex: 1,
    borderColor: Color.colorDarkBlue,
    borderWidth: 0.5,
    borderRadius: 3,
    marginLeft: 20,
    marginTop: 5,
    justifyContent: "center",
    alignSelf: "baseline",
    marginRight: 20,
    width: "85%"
  },
  hintText: {
    fontSize: Dimension.normalText,
    color: "#D6D6D6",
    fontStyle: "italic",
    paddingLeft: 20,
    paddingTop: 5
  },
  loaderLabel: {
    fontSize: Dimension.normalText,
    color: "#D6D6D6",
    fontStyle: "italic",
    alignSelf: "center",
    marginTop: 10
  },
  isSubmitLabel: {
    fontSize: Dimension.normalText,
    color: '#D6D6D6',
    fontStyle: 'italic',
    alignSelf: 'center',
    marginTop: 8,
    paddingLeft: 5
  },
  //textInput fields
  InputText: {
    fontSize: Dimension.normalText,
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 5,
    paddingBottom: 5,
    textAlign: "left",
    fontWeight: "normal",
    flexWrap: "wrap",
    margin: 0,
    color: Color.colorBlack
  },
  submit: {
    borderRadius: 22,
    borderColor: Color.colorWhite,
    borderWidth: 2,
    justifyContent: "center",
    alignSelf: "center",
    backgroundColor: Color.colorDarkBlue,
    height: 45,
    width: "100%"
  },
  submitText: {
    color: Color.colorWhite,
    fontSize: Dimension.mediumText,
    fontWeight: "bold",
    alignSelf: "center"
  },
  transparentOverlay: {
    position: "absolute",
    backgroundColor: "rgba(52, 52, 52, 0.8)",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center"
  },
  cameraContainer: {
    width: 40,
    height: 40,
    marginLeft: 60,
    marginTop: 10,
    justifyContent: "center"
  },
  captureIcon: {
    width: 70,
    height: 60,
    alignSelf: "center",
    justifyContent: "center"
  },
  captureMeidaIcon: {
    width: 50,
    height: 40,
    alignSelf: "center",
    justifyContent: "center"
  },
  /**
   * section list
   * */
  sectionListContainer: {
    marginTop: Dimen.marginTen,
    marginLeft: Dimen.marginTen,
    marginRight: Dimen.marginTen,
    borderWidth: 1,
    borderColor: Color.colorGreyViewBg,
    marginBottom: Dimen.marginTen
  },
  headerItem: {
    flexDirection: "row",
    backgroundColor: Color.colorWhite,
    justifyContent: "flex-start",
    marginLeft: 5,
    padding: 10
  },
  subItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
    paddingBottom: 10
  },
  headerTitle: {
    color: Color.colorDarkBlue,
    fontSize: Dimension.normalText,
    paddingLeft: 8
  },
  subText: {
    color: Color.colorDarkBlue,
    fontSize: Dimension.normalText,
    paddingLeft: 10,
    marginRight: 20,
    paddingRight: 10
  },
  viewBg: {
    backgroundColor: Color.colorGreyViewBg,
    alignSelf: "stretch",
    height: 1
  },
  sectionProductImage: {
    width: 42,
    height: 33,
    alignSelf: "center",
    marginRight: 10
  },
  sectionProductmediumImage: {
    width: 100,
    height: 120,
    alignSelf: "center",
    // marginRight: 10
  },
  plusImage: {
    width: 17,
    height: 16,
    alignSelf: "center"
  },
  checkBoxImage: {
    width: 16,
    height: 16,
    alignSelf: "center"
  },
  subItemInnerView: {
    flexDirection: "row",
    marginLeft: 35,
    alignSelf: "center"
  },
  flatContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 5,
    paddingBottom: 5
  },
  captureEditIcon: {
    width: 40,
    height: 30
  },
  captureMeidaEditIcon: {
    width: 32,
    height: 26
  },
  captureEditIconCircle: {
    width: 50,
    height: 50,
    position: "absolute",
    right: 2,
    top: -5,
    alignItems: "center",
    justifyContent: "center"
  },
  captureAddIconCircle: {
    width: 97,
    height: 97,
    alignItems: "center",
    justifyContent: "center"
  },
  viewPosition: {
    position: "absolute",
    right: 0,
    top: -10
  },

  downArrow: {
    width: 30,
    height: 30
  },

  downArrowView: {
    width: 30,
    height: 30,
    position: "absolute",
    right: 10,
    bottom: 20,
    justifyContent: "flex-end"
  },
  scaleImage: {
    width: 40,
    height: 40,
    resizeMode: "contain"
  },
  scaleContainer: {
    flexDirection: "row",
    alignSelf: "stretch",
    justifyContent: "space-around",
    marginLeft: 10,
    marginRight: 10,
    marginTop: 30
  },
  noScaleFound: {
    flex: 1
  },
  noScaleText: {
    color: Color.colorBlack,
    fontSize: Dimension.mediumText,
    paddingLeft: 10,
    marginRight: 10,
    paddingRight: 10
  },
  scaleValueText: {
    width: 40,
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: Color.colorWhite,
    fontSize: Dimension.normalText,
    fontWeight: "bold",
    lineHeight: 37
  },
  numberRoundText: {
    width: 40,
    height: 40,
    lineHeight: 40,
    color: Color.colorWhite,
    fontSize: Dimen.normalText,
    borderRadius: 30,
    textAlign: "center",
    alignItems: "center",
    backgroundColor: Color.colorYellow,
    fontWeight: "bold"
  },
  scaleValueTextStart: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 16,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: Color.colorWhite,
    fontSize: Dimension.mediumText,
    fontWeight: "bold",
    lineHeight: 40
  },
  scaleValueTextEnd: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 10,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: Color.colorWhite,
    fontSize: Dimension.mediumText,
    fontWeight: "bold",
    lineHeight: 40
  },
  scaleStartEndText: {
    width: 40,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    color: Color.colorTinyGrey,
    fontSize: Dimension.fontSmall
  },
  numberRoundView: {
    width: 40,
    height: 40,
    lineHeight: 40,
    color: Color.colorWhite,
    fontSize: Dimen.mediumText,
    borderRadius: 30,
    overflow: "hidden",
    textAlign: "center",
    alignItems: "center",
    backgroundColor: Color.colorYellow,
    fontWeight: "bold"
  },
  tableScaleContainer: {
    flex: 1,
    alignSelf: "stretch",
    justifyContent: "space-around",
    margin: 10
  },
  tableContainer: { paddingBottom: 18 },
  tableHeader: { height: 50, backgroundColor: "#fff" },
  tableHeadText: {
    margin: 6,
    textAlign: "center",
    fontWeight: "100",
    color: Color.colorBlack
  },
  tableRowText: {
    margin: 6,
    textAlign: "center",
    fontWeight: "100",
    color: Color.colorBlack
  },
  tableRow: { flexDirection: "row", backgroundColor: "#F6F6F6", height: 40 },
  tableCellFirstCol: {
    flex: 1,
    width: 100,
    alignItems: "center",
    borderBottomWidth: 2,
    borderRightWidth: 2
  },
  tableCellCol: {
    flex: 1,
    width: 100,
    alignItems: "center",
    borderBottomWidth: 2,
    borderRightWidth: 0,
    borderLeftWidth: 0
  },
  tableDataWrapper: { marginTop: 1 },
  radioWhiteLeft: {
    borderRadius: 10,
    backgroundColor: Color.colorWhite,
    alignSelf: "center",
    width: 20,
    height: 20,
    justifyContent: "center"
  },

  blackDot: {
    width: 10,
    height: 10,
    alignSelf: "center"
  },
  fullscreen: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  },
  controls: {
    // backgroundColor: "rgba(0, 0, 0, 0.5)",
    height: 50,
    left: 10,
    bottom: 10,
    right: 10,
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    paddingBottom: 20
  },
  mainButton: {
    marginRight: 20
  },
  durations: {
    color: "#FFF",
    marginLeft: 10
  },
  buffering: {
    backgroundColor: "#000"
  },
  videoCover: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent"
  },
  audioContainer: {
    flex: 1,
    backgroundColor: "#fff"
  },
  audioContainerMedia: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 10
  },
  map: {
    // marginBottom: 50,
    marginLeft: 15,
    marginRight: 15
  },
  mapContainer: {
    flex: 1,
    width: "100%"
  },
  mapLocation: {
    alignItems: "center",
    justifyContent: "center",
    // position: "absolute",
    borderRadius: 5,
    backgroundColor: "black",
    height: 60,
    marginLeft: 12,
    marginRight: 15,
    padding: 10,
    bottom: 90
  },
  mapLocationText: {
    color: "white",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column"
  },
  mediaTop: {
    marginTop: 100,
    alignSelf: "center"
  },
  mediaBottom: {
    alignSelf: "center"
  },
  mediaImageLeft: {
    position: "absolute",
    left: 0,
    top: -10
  },
  mediaImageRight: {
    position: "absolute",
    right: 0,
    top: -10
  },
  meidaAddIcon: {
    width: 97,
    height: 97,
    alignItems: "center",
    justifyContent: "center"
  },
  meidaVideoAddIcon: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center"
  },
  meidaVideoAddCaptureIcon: {
    width: 50,
    height: 50,
    alignSelf: "center",
    justifyContent: "center"
  },
  meidaVideoEditCaptureEditIcon: {
    width: 32,
    height: 30
  },
  mediaEditLeftIcon: {
    width: 50,
    height: 50,
    position: "absolute",
    left: 0,
    top: -10,
    alignItems: "center",
    justifyContent: "center"
  },
  meidaEditRightIcon: {
    width: 50,
    height: 50,
    position: "absolute",
    right: 0,
    top: -10,
    alignItems: "center",
    justifyContent: "center"
  },
  markerFixed: {
    left: "50%",
    marginLeft: -24,
    marginTop: -48,
    position: "absolute",
    top: "50%"
  },
  marker: {
    height: 50,
    width: 35
  },
  recordercontainer: {
    flex: 1,
    backgroundColor: "rgb(65, 77, 107)",
    flexDirection: "column",
    alignItems: "center",
    // width: 270,
    // height: 450,
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 15
  },
  titleTxt: {
    marginTop: 30 * ratio,
    color: "white",
    fontSize: 28 * ratio
  },
  viewRecorder: {
    marginTop: 30 * ratio,
    width: "100%",
    alignItems: "center"
  },
  recordBtnWrapper: {
    flexDirection: "row",
    marginBottom: 100
  },
  recordBtnWrapper1: {
    flexDirection: "row",
    marginBottom: 20
  },
  viewPlayer: {
    marginTop: 40 * ratio,
    alignSelf: "stretch",
    alignItems: "center"
  },
  viewBarWrapper: {
    marginTop: 15 * ratio,
    marginHorizontal: 28 * ratio,
    alignSelf: "stretch"
  },
  viewBar: {
    backgroundColor: "#ccc",
    height: 4 * ratio,
    alignSelf: "stretch"
  },
  viewBarPlay: {
    backgroundColor: "white",
    height: 4 * ratio,
    width: 0
  },
  playStatusTxt: {
    marginTop: 8 * ratio,
    color: "#ccc"
  },
  playBtnWrapper: {
    flexDirection: "row",
    marginTop: 30 * ratio,
    marginBottom: 10 * ratio
  },
  btn: {
    borderColor: "white",
    borderWidth: 1 * ratio,
    marginLeft: 5 * ratio
  },
  txt: {
    color: "white",
    fontSize: 14 * ratio,
    marginHorizontal: 8 * ratio,
    marginVertical: 4 * ratio
  },
  txtRecordCounter: {
    marginTop: 50,
    color: "white",
    fontSize: 30,
    textAlignVertical: "center",
    fontWeight: "400",
    fontFamily: "Helvetica Neue",
    letterSpacing: 3,
    marginBottom: 50
  },
  txtCounter: {
    marginTop: 50,
    color: "white",
    fontSize: 25,
    textAlignVertical: "center",
    fontWeight: "400",
    fontFamily: "Helvetica Neue"
  },
  recordedAudioDuration: {
    flex: 1,
    marginTop: 70,
    marginBottom: 100
  },
  audioBtn: {
    flexDirection: "row",
    backgroundColor: "white",
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
    marginLeft: 20,
    borderRadius: 10
  },
  audioBtnTxt: {
    fontSize: 16,
    fontWeight: "400",
    color: "black",
    paddingTop: 7,
    paddingBottom: 7,
    paddingLeft: 20,
    paddingRight: 20,
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center"
  },
  bottomSheetOption: {
    flex: 1,
    width: width,
    alignSelf: "center",
    alignItems: "center",
    backgroundColor: Color.colorModal
  },
  bottomSheetOptionText: {
    flex: 1,
    alignContent: "center",
    textAlignVertical: "center",
    fontSize: Dimension.mediumText,
    color: Color.colorWhite,
    paddingTop: 5,
    paddingBottom: 5
  },
  preview: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  capture: {
    flex: 0,
    width: 60,
    height: 60,
    backgroundColor: "#fff",
    borderRadius: 100,
    padding: 5,
    alignSelf: "center",
    margin: 10,
    overflow: "hidden"
  },
  videoCameraContainer: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "black"
  },
  othertextbox: {
    paddingLeft: 20,
    paddingBottom: 5,
    paddingRight: 5
  },
  othertextinput: {
    borderWidth: 1,
    borderColor: 'lightgrey',
    color: Color.colorBlack,
    backgroundColor: Color.colorWhite,
  },
  dropdownWrap: {
    height: height - 250,
    maxHeight: height - 250,
    marginHorizontal: 20
  },
  baseStyleQuestionText: {
    paddingHorizontal: 10,
    width: '100%',
    color: Color.colorDarkBlue,
    fontSize: Dimension.extraLargeText,
    fontWeight: "bold"
  },
  baseStyleSubText: {
    paddingHorizontal: 10,
    width: '100%',
    color: Color.colorDarkBlue,
    fontSize: Dimension.normalText,
  },
  baseStyleSubTitle: {
    paddingHorizontal: 20,
    paddingBottom: 0,
    width: '100%',
    fontSize: Dimension.normalText,
    color: "#D6D6D6",
    fontStyle: "italic",
  },
  basestyleSublable: {
    marginHorizontal: 20,
    padding: 0,
    fontSize: Dimension.normalText,
    color: "#D6D6D6",
    fontStyle: "italic",
  },
  baseStyleSectionTitle: {
    paddingLeft: 8,
    width: '100%',
    color: Color.colorDarkBlue,
    fontSize: Dimension.normalText,
  }
});