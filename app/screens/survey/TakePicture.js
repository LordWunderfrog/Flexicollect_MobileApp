import React, { Component } from 'react';
import {
    Image, StatusBar,
    Text,
    TouchableOpacity,
    View,
    ScrollView,
    Platform,
    Dimensions
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import { ScaledSheet } from 'react-native-size-matters';
import * as Color from '../../style/Colors';
import * as Constants from '../../utils/Constants';
import * as Strings from '../../style/Strings';
import * as CAMERASTYLE from "../../style/Camera";
import { launchCamera } from 'react-native-image-picker';
//import { NavigationActions, StackActions } from "react-navigation";
import { CommonActions } from '@react-navigation/native';
import ImageResizer from 'react-native-image-resizer';
let imageProperty;
let localImage;

const { height } = Dimensions.get('window');
const { width } = Dimensions.get('window');

/** Take a picture class component */
class TakePicture extends Component {

    constructor(props) {
        super(props)
        // const { params } = this.props.navigation.state;
        const { params } = this.props.route;
        imageProperty = params ? params.imageProperty : '';
        this.state = {
            switchCamera: true,
            captureButtonClicked: false,
            translation_common: Constants.common_text
        }
        // global.screenKey = this.props.navigation.state.key
        global.screenKey = this.props.route.key
    }

    /** component life cycle method */
    UNSAFE_componentWillMount() {
        StatusBar.setHidden(true);
    }
    componentDidMount() {
        this.focusListner = this.props.navigation.addListener('focus', () => {
            this.openCameraForImage()
        });
        // this.willFocus = this.props.navigation.addListener("willFocus", payload => {
        //     //console.log('willFocus:', global.type)
        //     if (payload && payload.action.type == 'Navigation/BACK') {
        //         this.openCameraForImage()
        //     }
        // });
    }
    componentWillUnmount() {
        this.focusListner();
    }

    /**
     * switch camera
     * */
    setCameraSwitch() {
        this.setState({ switchCamera: !this.state.switchCamera })
    }

    /** component rendering */
    render() {
        return (
            <View style={styles.container}></View>
        )
    }
    // render() {
    //     const { goBack } = this.props.navigation;
    //     const { container, preview, switchCamera, bottomContainer, back, capture } = styles;
    //     return (
    //         <View style={container}>
    //             <StatusBar hidden={true} />
    //             <View style={preview}>
    //                 {
    //                     this.openCameraForImage()
    //                 }
    //             </View>

    //             {/* <RNCamera
    //                 ref={ref => {
    //                     this.camera = ref;
    //                 }}
    //                 style={preview}
    //                 type={this.state.switchCamera ? RNCamera.Constants.Type.back : RNCamera.Constants.Type.front}
    //                 flashMode={RNCamera.Constants.FlashMode.off}
    //                 captureAudio={false}
    //                 androidCameraPermissionOptions={{
    //                     title: "Permission to use camera",
    //                     message: "We need your permission to use your camera phone",
    //                     buttonPositive: "Ok",
    //                     buttonNegative: "Cancel"
    //                 }}
    //                 pauseAfterCapture={true}
    //             // permissionDialogTitle={'Permission to use camera'}
    //             // permissionDialogMessage={'We need your permission to use your camera phone'}
    //             /> */}

    //             {/* <View style={bottomContainer}>
    //                 <TouchableOpacity style={back}
    //                     hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
    //                     onPress={() => { StatusBar.setHidden(false); goBack() }}>
    //                     <Image style={{ width: 30, height: 30 }}
    //                         source={require('../../images/survey/camera_back.png')} />
    //                 </TouchableOpacity>
    //                 <TouchableOpacity
    //                     style={{ alignSelf: 'center', justifyContent: 'center' }}
    //                     onPress={this.takePicture.bind(this)}>
    //                     <Image style={capture}
    //                         source={require('../../images/survey/capture_button.png')} />
    //                 </TouchableOpacity>

    //                 <TouchableOpacity style={switchCamera}
    //                     onPress={() => this.setCameraSwitch()}>
    //                     <Image style={{ width: 50, height: 50, paddingLeft: 10 }}
    //                         source={require('../../images/survey/rotate_button.png')} />
    //                 </TouchableOpacity>

    //             </View> */}
    //         </View>
    //     );
    // }

    openCameraForImage = () => {
        setTimeout(() => {
            var options = {
                mediaType: 'photo',
                maxHeight: Platform.OS == 'ios' ? 3840 : 2592,
                maxWidth: Platform.OS == 'ios' ? 2160 : 1944,
                quality: CAMERASTYLE.COMPRESS_QUALITY_IMAGE,
                includeExtra: false,
                presentationStyle: 'fullScreen',
            }
            launchCamera(options, async (res) => {
                if (!res.hasOwnProperty('didCancel') && res.didCancel !== true) {
                    let imageData = res && res.assets[0]
                    // this.props.navigation.navigate('PreviewImage', { imageData: imageData && imageData.uri, imageProperty: imageProperty })

                    /** for rotating image in some android device is rotate landscape image */
                    let rotateDgree = 0
                    if (res && (res.assets[0].width > res.assets[0].height) && Platform.OS == 'android') {
                        /** Rotate image while image is landscape then its rotate potrait by image picker */
                        rotateDgree = 90
                    }
                    else {
                        rotateDgree = 0
                    }

                    /** directly pass next screen not in our preview page */
                    if (imageData.uri !== '') {
                        /** condition for andorid and landscap images then only rotate it */
                        if (res && (res.assets[0].width > res.assets[0].height) && Platform.OS == 'android') {
                            /** Rotate image while image is landscape then its rotate potrait by image picker */
                            await ImageResizer.createResizedImage(imageData.uri, width, height, 'JPEG', 100, rotateDgree)
                                .then(response => {
                                    localImage = { uri: response.uri }
                                })
                                .catch(err => {
                                    // console.log(err)
                                    localImage = { uri: imageData.uri }
                                });
                        }
                        else {
                            localImage = { uri: imageData.uri }
                        }
                    } else {
                        localImage = require('../../images/home/mission/product_bg.png')
                    }

                    if (imageProperty.hasOwnProperty('marker_enabled') && imageProperty.marker_enabled === 1) {
                        this.props.navigation.navigate('MarkerScreen', { imageData: localImage, imageProperty: imageProperty })
                    } else if (imageProperty.hasOwnProperty('marker_enabled') && imageProperty.marker_enabled === 0) {
                        if (imageProperty.hasOwnProperty('scale_enabled') && imageProperty.scale_enabled === 1) {
                            this.props.navigation.navigate('ScaledImage', {
                                previewUri: localImage,
                                imageProperty: imageProperty
                            })
                        } else {
                            global.previewUri = localImage.uri
                            global.imageData = ''
                            global.markerId = 0
                            global.scaleId = 0
                            global.captionText = ''
                            global.type = 'capture'

                            // const backAction = NavigationActions.back({
                            //     key: global.screenKey,
                            // });
                            // this.props.navigation.dispatch(backAction);
                            this.props.navigation.navigate({ name: 'SurveyBox' })
                        }
                    } else {
                        global.previewUri = localImage.uri
                        global.type = 'imageupload'

                        // const backAction = NavigationActions.back({
                        //     key: global.screenKey,
                        // });
                        // this.props.navigation.dispatch(backAction);
                        this.props.navigation.navigate({ name: 'SurveyBox' })
                    }
                }
                else {
                    StatusBar.setHidden(false);
                    this.props.navigation.goBack()
                }
            });
        }, 900);
    }

    /**
     * Handle user click capture button
     * Navigate to previewimage page with params
     */
    takePicture = async function () {
        if (!this.state.captureButtonClicked) {
            if (this.camera) {
                this.setState({ captureButtonClicked: true })
                const options = { quality: CAMERASTYLE.COMPRESS_QUALITY_IMAGE, height: Platform.OS == 'ios' ? 3840 : 2592, width: Platform.OS == 'ios' ? 2160 : 1944, fixOrientation: true, forceUpOrientation: true, skipProcessing: false };
                const data = await this.camera.takePictureAsync(options)
                this.props.navigation.navigate('PreviewImage', { imageData: data.uri, imageProperty: imageProperty })
                this.setState({ captureButtonClicked: false })

                // const sizes = await this.camera.getAvailablePictureSizes();
            }
        } else {
            Constants.showSnack(this.state.translation_common[global.language].Processing_Image)
        }
    };
}

export default TakePicture;

/** UI styles used for this component */
const styles = ScaledSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'black'
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    bottomContainer: {
        flexDirection: 'row',
        backgroundColor: Color.colorBlack,
        justifyContent: 'center',
        height: 140
    },
    capture: {
        width: 80,
        height: 80,
    },
    back: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        margin: 10,
        alignSelf: 'center',
        padding: 5
    },
    switchCamera: {
        position: 'absolute',
        right: 0,
        marginRight: 50,
        alignSelf: 'center'
    }
});