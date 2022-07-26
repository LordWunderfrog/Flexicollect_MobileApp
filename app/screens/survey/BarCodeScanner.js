import React, { Component } from 'react';
import {
    Image, StatusBar,
    Text,
    TouchableOpacity,
    View, Alert, CameraRoll, Platform, Dimensions, DeviceEventEmitter
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import { ScaledSheet } from 'react-native-size-matters';
import * as Color from '../../style/Colors';
import * as Constants from '../../utils/Constants';
import * as Strings from '../../style/Strings';
import ScannerSquareView from '../../components/ScannerSquareView';
import * as Dimension from "../../style/Dimensions";
import ViewShot from "react-native-view-shot";

let imageProperty;
let matched = false
let barCode = ''
let showBarcodeError = false
const { width, height } = Dimensions.get('window');

/** barcde scanner class */
class BarCodeScanner extends Component {

    constructor(props) {
        super(props)
        //const { params } = this.props.navigation.state;
        const { params } = this.props.route
        imageProperty = params ? params.imageProperty : '';
        this.state = {
            captureButtonClicked: false,
            isValidBarcode: false,
            barCodeDetected: false,
            barcodeFinderVisible: true,
            rectHeight: Math.floor(height * 0.80) - 120,  //120 is height of bottom tab
            rectWidth: 300,
            isLandscape: false,
            bottomTabHeight: 120,
            translation_common: Constants.common_text
        }
        // global.screenKey = this.props.navigation.state.key
        global.screenKey = this.props.route.key
    }

    /** component life cycle methods */
    UNSAFE_componentWillMount() {
        StatusBar.setHidden(true);
        this.setState({ rectWidth: width - 30 })
        DeviceEventEmitter.addListener('namedOrientationDidChange', data => this.changeScanBarRect(data));
    }

    /** setting the scanning area */
    changeScanBarRect(data) {
        if (data.isLandscape) {
            this.setState({ rectWidth: height - 50, isLandscape: true })
            this.setState({ rectHeight: Math.floor(width * 0.80) - this.state.bottomTabHeight })
        } else {
            this.setState({ rectWidth: width - 30, isLandscape: false })
            this.setState({ rectHeight: Math.floor(height * 0.80) - this.state.bottomTabHeight })
        }
    }

    /**
     * takes to next screen
     * */
    async goNextScreen(data, format) {
        let barCodeIds = [];
        barCode = data;
        matched = false;
        if (imageProperty.hasOwnProperty('validate') && imageProperty.validate === 'validate' && imageProperty.hasOwnProperty('barcode_ids')) {
            barCodeIds = imageProperty.barcode_ids
            if (barCodeIds.length > 0) {
                for (let i = 0; i < barCodeIds.length; i++) {
                    if (data === barCodeIds[i]) {
                        matched = true
                        break
                    }
                }
            } else {
                /**
                 * make it as valid barcode
                 * */
                matched = true
            }
        }
        else if (imageProperty.hasOwnProperty('validate') && imageProperty.validate === 'both' && imageProperty.hasOwnProperty('barcode_ids')) {
            barCodeIds = imageProperty.barcode_ids
            if (barCodeIds.length > 0) {
                for (let i = 0; i < barCodeIds.length; i++) {
                    if (data === barCodeIds[i]) {
                        matched = true
                        break
                    }
                }
            } else {
                /**
                 * make it as valid barcode
                 * */
                matched = false
            }

        }
        else if (imageProperty.hasOwnProperty('validate') && imageProperty.validate === 'identity') {
            matched = true;
        }
        else {
            matched = true;
        }
        this.props.navigation.navigate('ScannedPreviewImage', {
            imageData: null,
            imageProperty: imageProperty,
            validBarCode: matched,
            barCode: barCode,
            barCodeFormat: format
        })

    }

    /* Handle user click capture button */
    takePicture = async function () {
        if (!this.state.captureButtonClicked) {
            if (this.camera) {
                this.setState({ captureButtonClicked: true })
                const options = { quality: 0.5, fixOrientation: true, forceUpOrientation: true };
                const data = await this.camera.takePictureAsync(options)
                this.setState({ capturedImage: { uri: data.uri } })
                this.props.navigation.navigate('ScannedPreviewImage', {
                    imageData: data.uri,
                    imageProperty: imageProperty,
                    validBarCode: matched,
                    barCode: 'null', //5000186481001 5010034001534
                    barCodeFormat: 'null',
                    screenKey: this.props.route.key
                    // screenKey: this.props.navigation.state.key
                })
                this.setState({ captureButtonClicked: false })

            }
        } else {
            Constants.showSnack(this.state.translation_common[global.language].Processing_Image)
        }
    };

    /**
     * read scanned barcode details
     * format barcode details
     */
    onBarCodeRead = (e) => {
        let barCodeFormat = e.type;
        if (barCodeFormat !== 'null' && barCodeFormat.includes('.')) {
            let barcodeSplit = barCodeFormat.split('.');
            let splitCode = barcodeSplit[barcodeSplit.length - 1].toUpperCase();
            barCodeFormat = splitCode;
            if (splitCode.includes('_')) {
                barCodeFormat = splitCode.replace('_', '');
            } else if (splitCode.includes('-')) {
                barCodeFormat = splitCode.replace('-', '');
            }
        } else if (barCodeFormat !== 'null' && barCodeFormat.includes('_')) {
            barCodeFormat = barCodeFormat.replace('_', '').toUpperCase();
        } else if (barCodeFormat !== 'null' && barCodeFormat.includes('-')) {
            barCodeFormat = barCodeFormat.replace('-', '').toUpperCase();
        }
        if (barCodeFormat !== 'QRCODE') {
            this.goNextScreen(e.data, barCodeFormat)
        } else {
            if (!showBarcodeError) {
                showBarcodeError = true
                Constants.showSnack(this.state.translation_common[global.language].QrCode_Not_Supported)
            }
        }
        setTimeout(() => {
            showBarcodeError = false
        }, 5000)
    }

    /* Handle user click capture button */
    captureImage() {
        barCode = 'null'
        matched = false
        this.takePicture()
    }

    /** class rendring method */
    render() {
        const { goBack } = this.props.navigation;
        const { container, preview, bottomContainer, back, capture, scanBox, barCodeError, scanHint, scanHintView } = styles;
        const { isLandscape } = this.state;
        return (
            <View style={container}>
                <RNCamera
                    style={preview}
                    onBarCodeRead={this.onBarCodeRead}
                    type={RNCamera.Constants.Type.back}
                    ref={cam => this.camera = cam}
                    barcodeFinderVisible={this.state.barcodeFinderVisible}
                    barcodeFinderWidth={200}
                    barcodeFinderHeight={200}
                    barcodeFinderBorderColor="white"
                    barcodeFinderBorderWidth={2}
                    defaultTouchToFocus
                    mirrorImage={false}
                    onFocusChanged={() => {
                    }}
                    onZoomChanged={() => {
                    }}
                    // permissionDialogTitle={'Permission to use camera'}
                    // permissionDialogMessage={'We need your permission to use your camera phone'}
                    androidCameraPermissionOptions={{
                        title: "Permission to use camera",
                        message: "We need your permission to use your camera phone",
                        buttonPositive: "Ok",
                        buttonNegative: "Cancel"
                    }}>
                    <View style={[scanBox, { marginTop: isLandscape ? 30 : 90 }]}>
                        <ScannerSquareView
                            maskColor={this.props.maskColor}
                            cornerColor={this.props.cornerColor}
                            borderColor={this.props.borderColor}
                            rectHeight={this.state.rectHeight}
                            rectWidth={this.state.rectWidth}
                            borderWidth={this.props.borderWidth}
                            cornerBorderWidth={this.props.cornerBorderWidth}
                            cornerBorderLength={this.props.cornerBorderLength}
                            isLoading={this.props.isLoading}
                            cornerOffsetSize={this.props.cornerOffsetSize}
                            isCornerOffset={this.props.isCornerOffset}
                            bottomMenuHeight={this.props.bottomMenuHeight}
                            scanBarAnimateTime={this.props.scanBarAnimateTime}
                            scanBarColor={this.props.scanBarColor}
                            scanBarHeight={this.state.scanBarHeight}
                            scanBarMargin={this.props.scanBarMargin}
                            hintText={this.props.hintText}
                            hintTextStyle={this.props.hintTextStyle}
                            scanBarImage={this.props.scanBarImage}
                            hintTextPosition={this.props.hintTextPosition}
                            isShowScanBar={this.props.isShowScanBar}
                            isLandscape={this.state.isLandscape}
                        /></View>
                </RNCamera>

                <View style={scanHintView}>
                    <Text style={scanHint}>{this.state.translation_common[global.language].Scan_Hint}</Text>
                </View>

                <View style={bottomContainer}>
                    <TouchableOpacity style={back}
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                        onPress={() => { StatusBar.setHidden(false); goBack() }}>
                        <Image style={{ width: 30, height: 30 }}
                            source={require('../../images/survey/camera_back.png')} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{ alignSelf: 'center', justifyContent: 'center' }}
                        onPress={() => this.captureImage()}>
                        <Image style={capture}
                            source={require('../../images/survey/capture_button.png')} />
                    </TouchableOpacity>

                </View>
            </View>
        );
    }
}

export default BarCodeScanner;

/** UI styles used for this class */
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
        height: 120
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
        padding: 5,
        alignSelf: 'center'
    },
    switchCamera: {
        position: 'absolute',
        right: 0,
        marginRight: 50,
        alignSelf: 'center'
    },
    scanBox:
    {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    barCodeError: {
        height: '40@vs',
        backgroundColor: Color.colorRed,
        left: 0,
        right: 0,
        top: 0,
        bottom: 150,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scanHintView: {
        flexDirection: 'row',
        flex: 1,
        position: 'absolute',
        right: 10,
        left: 10,
        top: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scanHint: {
        color: Color.colorWhite,
        fontSize: Dimension.mediumText,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
});