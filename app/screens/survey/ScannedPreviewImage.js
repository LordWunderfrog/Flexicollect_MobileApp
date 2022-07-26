import React, { Component } from 'react';
import {
    Image, StatusBar,
    Text,
    TouchableOpacity,
    View, CameraRoll
} from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import * as Color from '../../style/Colors';
//import { NavigationActions, StackActions } from "react-navigation";
import * as Strings from "../../style/Strings";
import * as Dimension from "../../style/Dimensions";
import Barcode from 'react-native-barcode-builder';
import ViewShot from "react-native-view-shot";
import * as Constants from '../../utils/Constants'
import * as UtilConstant from '../../utils/Constants';
import * as Service from '../../utils/Api';
import axios from 'axios';
//import Orientation from "react-native-orientation";
import Orientation from "react-native-orientation-locker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

let imagePath;
let localImage;
let imageProperty;
let validBarCode;
let barCode;
let barCodeFormat;

/** Scaled image preview class componenet */
class ScannedPreviewImage extends Component {

    constructor(props) {
        super(props)
        //const { params } = this.props.navigation.state;
        const { params } = this.props.route;
        imagePath = params ? params.imageData : '';
        imageProperty = params ? params.imageProperty : '';
        validBarCode = params ? params.validBarCode : '';
        barCode = params ? params.barCode : '';
        barCodeFormat = params ? params.barCodeFormat : '';

        if (imagePath !== '') {
            localImage = { uri: imagePath }
        } else {
            localImage = require('../../images/home/mission/product_bg.png')
        }

        this.state = {
            image: localImage,
            product: '',
            description: '',
            validBarCode: validBarCode,
            productImage: '',
            isDisabled: false,  //prevent double click 
            translation_common: Constants.common_text
        }

    }

    /** Component life cycle methods */
    UNSAFE_componentWillMount() {
        StatusBar.setHidden(true);
        this.doBarcodeLookUp();
    }
    componentDidUpdate() {
        StatusBar.setHidden(true);
    }
    componentDidMount() {
        //Orientation.unlockAllOrientations();
        Orientation.lockToPortrait();
    }
    componentWillUnmount() {
        Orientation.lockToPortrait();

    }

    /**
     * Get Details of Scanned barcode from Api
     */
    async doBarcodeLookUp() {
        if (barCode !== 'null' && imageProperty.hasOwnProperty('validate') && (imageProperty.validate === 'identity' || imageProperty.validate === 'both') && validBarCode == true) {
            // let setOffline = await AsyncStorage.getItem('setOffline') || false;
            let api_key = await AsyncStorage.getItem('api_key');
            NetInfo.fetch().then(state => {
                let status = state.isConnected ? "online" : "offline";
                if (status === "online" && global.isSlowNetwork != true) {
                    this.setState({
                        product: this.state.translation_common[global.language].Loading_Detail
                    })
                    let url = UtilConstant.BASE_URL + Service.BARCODE_LOOKUP + barCode;
                    axios.get(url, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Auth': api_key
                        },
                        timeout: UtilConstant.TIMEOUT,
                    }).then(response => {
                        if (response.status === 200) {
                            let product = response.data.products && response.data.products.length > 0 ? response.data.products[0].product_name : '';
                            let description = response.data.products && response.data.products.length > 0 ? response.data.products[0].description : '';
                            let productImage = response.data.products && response.data.products.length > 0 && response.data.products[0].images &&
                                response.data.products[0].images.length > 0
                                ? response.data.products[0].images[0] : '';
                            this.setState({
                                product: product,
                                description: description,
                                validBarCode: true,
                                productImage: productImage
                            })
                        }
                        else {
                            this.setState({
                                //validBarCode: false,
                                product: ''
                            })
                        }
                    }).catch((error) => {
                        this.setState({
                            //validBarCode: false,
                            product: ''
                        })
                    })
                }
            });
        }

    }

    /* Handle Navigation */
    goToNextScreen() {
        this.setState({ isDisabled: true });
        setTimeout(() => {
            this.setState({
                isDisabled: false,
            });
        }, 1000)  //preven double click qucikly

        if (barCode === 'null') {
            this.refs.viewShotParent.capture().then(uri => {
                // CameraRoll.saveToCameraRoll(uri,'photo')
                this.navigateToSurveyBox(uri)
            })
        } else {
            this.refs.viewShotParent.capture().then(uri => {
                // CameraRoll.saveToCameraRoll(uri,'photo')
                this.navigateToSurveyBox(uri)
            })
        }

    }

    /**
     * Navigate to page after configuring global values
     */
    async navigateToSurveyBox(uri) {
        // let missionId = await AsyncStorage.getItem('missionId');
        // let pageIndex = await AsyncStorage.getItem('pageIndex');

        // const resetAction = StackActions.reset({
        //     index: 0,
        //     actions: [NavigationActions.navigate({
        //         routeName: 'SurveyBox', params: {
        //             imageData: '',
        //             previewUri: uri,
        //             markerId: 0,
        //             scaleId: 0,
        //             captionText: '',
        //             missionId: missionId,
        //             pageIndex: pageIndex,
        //             barCode: barCode,
        //             from: 'scan'
        //         }
        //     })],
        // });
        // this.props.navigation.dispatch(resetAction);

        global.previewUri = uri
        global.barCode = barCode
        global.type = 'scan'
        global.productName = this.state.product
        global.productDescription = this.state.description

        // const backAction = NavigationActions.back({
        //     key: global.screenKey,
        // });
        // this.props.navigation.dispatch(backAction);
        this.props.navigation.navigate({ name: 'SurveyBox' })
    }

    /* Handle error string layout */
    getErrorString() {

        if (barCode === 'null') {
            return this.state.translation_common[global.language].BarCode_NotReadable
        } else {
            return this.state.translation_common[global.language].Not_Valid_BarCode
        }
    }

    /** Component rendring */
    render() {
        const { goBack } = this.props.navigation;
        const { container, back, tick, bottomContainer, barCodeError, errorText, barCodeText, barCodeView, productText, descriptionText, productImage } = styles;
        return (
            <View
                style={container}>

                <ViewShot style={container} ref="viewShotParent" options={{ format: "jpg", quality: 0.9 }}>
                    {this.state.productImage !== '' &&
                        <Image style={productImage} resizeMode="contain"
                            source={{ uri: this.state.productImage }} />
                    }

                    {barCode !== 'null' && (<View style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignSelf: 'center',
                        alignItems: 'center'
                    }}>
                        <Text style={productText}>{this.state.product}</Text>
                        <Text style={descriptionText}>{this.state.description}</Text>
                        <Barcode value={barCode} format={barCodeFormat} flat />
                        <Text style={barCodeText}>{barCode}</Text>
                    </View>)}

                    {barCode === 'null' &&
                        <Image style={{ flex: 1, overflow: "visible", height: '100%', width: '99%', alignSelf: 'center' }} resizeMode="contain"
                            source={this.state.image} />
                    }

                    {!this.state.validBarCode && (<View style={barCodeError}>
                        <Text style={errorText}>{this.getErrorString()}</Text>
                    </View>)}

                </ViewShot>

                <View style={bottomContainer}>

                    <TouchableOpacity style={back}
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                        onPress={() => goBack()}>
                        <Image style={{ width: 30, height: 30 }}
                            source={require('../../images/survey/camera_back.png')} />
                    </TouchableOpacity>

                    <TouchableOpacity style={tick}
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                        onPress={() => this.goToNextScreen()}
                        disabled={this.state.isDisabled}>
                        <Image style={{ width: 30, height: 30 }}
                            source={require('../../images/survey/tick.png')} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }


}

export default ScannedPreviewImage;

/** UI styles used for this component */
const styles = ScaledSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: Color.colorWhite
    },
    tick: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        margin: 10,
        alignSelf: 'center',
        padding: 5
    },
    back: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        margin: 10,
        alignSelf: 'center',
        padding: 5
    },
    bottomContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: Color.colorBlack,
        height: 50
    },
    barCodeError: {
        height: '40@vs',
        backgroundColor: Color.colorRed,
        left: 0,
        right: 0,
        top: 5,
        bottom: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },

    errorText: {
        color: Color.colorWhite,
        fontSize: Dimension.mediumText,
        alignSelf: 'center',
    },
    barCodeText: {
        color: Color.colorBlack,
        fontSize: Dimension.mediumText,
        alignSelf: 'center',
    },
    productText: {
        color: Color.colorBlack,
        fontSize: Dimension.mediumText,
        textAlign: 'center'
    },
    descriptionText: {
        color: Color.colorBlack,
        fontSize: Dimension.smallText,
        textAlign: 'center'
    },
    productImage: {
        flex: 1,
        alignSelf: 'center',
        top: 15,
        margin: 5,
        height: '50%',
        width: '100%'
    },
    barCodeView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
});