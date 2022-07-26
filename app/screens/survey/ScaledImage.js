import React, { Component } from 'react';
import {
    Image, StatusBar,
    Text, TextInput,
    TouchableOpacity,
    View, Dimensions, Platform
} from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import * as Color from '../../style/Colors';
import * as String from '../../style/Strings';
import * as Dimen from '../../style/Dimensions';
import * as Constants from '../../utils/Constants';
import ViewShot from "react-native-view-shot";
//import { NavigationActions } from 'react-navigation';
//import Orientation from 'react-native-orientation';
import Orientation from "react-native-orientation-locker";
import AsyncStorage from '@react-native-async-storage/async-storage';

let imagePath = '';
let previewUri = '';
let markerId = 0;
let scaleId = 0;
let captionText = '';
let imageProperty;
let halfOpacity = 0.3
let fullOpacity = 1
const scale1 = require('../../images/scale1.png');
const scale2 = require('../../images/scale2.png');

let netState = AsyncStorage.getItem("NetworkState");

/** Scaled image class component */
class ScaledImage extends Component {

    constructor(props) {
        super(props)
        //const { params } = this.props.navigation.state;
        const { params } = this.props.route;
        imagePath = params ? params.imageData : '';
        previewUri = params ? params.previewUri : '';
        markerId = params ? params.markerId : 0;
        captionText = params ? params.captionText : '';
        imageProperty = params ? params.imageProperty : '';
        this.state = {
            image: imagePath == undefined ? previewUri.uri : imagePath,
            imageOneOpacity: fullOpacity,
            imageTwoOpacity: fullOpacity,
            imageThreeOpacity: fullOpacity,
            imageFourOpacity: fullOpacity,
            imageFiveOpacity: fullOpacity,
            isScalable: false,
            selectedRating: 0,
            hideIcon: false,
            emotionOne: '',
            emotionTwo: '',
            emotionThree: '',
            emotionFour: '',
            emotionFive: '',
            scaleArray: imageProperty,
            bottomViewHeight: 200,
            isDoubleClick: false,
            translation_common: Constants.common_text
        }

    }

    /** Component life cycle methods */
    UNSAFE_componentWillMount() {
        StatusBar.setHidden(true);
    }
    componentDidMount() {
        //Orientation.unlockAllOrientations();
        this.state.scaleArray && this.state.scaleArray.scale_images.map((item, index) => {
            if (item.isSelected) {
                this.setState({ selectedRating: index + 1 })
            }
        });
        Orientation.lockToPortrait();
    }
    componentDidUpdate() {
        StatusBar.setHidden(true);
    }
    componentWillUnmount() {
        Orientation.lockToPortrait();
    }

    /**
     * Configure global values and Navigate to question page
     */
    async goToQuestionScreen() {
        if (this.state.selectedRating != 0) {
            // this.setState({ hideIcon: true })
            if (!this.state.isDoubleClick) {
                this.setState({ isDoubleClick: true })
                setTimeout(() => {
                    this.refs.viewShot.capture().then(uri => {

                        global.previewUri = previewUri.uri
                        global.imageData = uri
                        global.markerId = markerId
                        global.scaleId = scaleId
                        global.captionText = captionText
                        global.type = 'capture'

                        // const backAction = NavigationActions.back({
                        //     key: global.screenKey,
                        // });
                        // this.props.navigation.dispatch(backAction);
                        this.props.navigation.navigate({ name: 'SurveyBox' })
                    });
                    setTimeout(() => {
                        this.setState({ isDoubleClick: false })
                    }, 5000);
                }, 300)
            }
        } else {
            Constants.showSnack(this.state.translation_common[global.language].Select_Rate)
        }
    }

    /** Rendering scale image 
     *  @param imageProperty - image scale data  
     * */
    renderScaleImage(imageProperty) {
        if (imageProperty !== '') {
            if (imageProperty.hasOwnProperty('scale_images') && imageProperty.scale_images.length > 0) {
                return (
                    <View style={[styles.scaleContainer]}>
                        {

                            imageProperty.scale_images.map((item, index) => {

                                return (
                                    <View key={index}>
                                        {item.hasOwnProperty('image') && (item.image !== '' && item.image !== null && item.image !== '0') ?
                                            <TouchableOpacity style={styles.scaleImage} onPress={() => this.onSelectedScale(index)} ><Image
                                                style={[styles.scaleImage, { opacity: item.isSelected == true ? fullOpacity : halfOpacity }]}
                                                source={{ uri: item.image }} /></TouchableOpacity> :

                                            this.returnTextView(item, index)

                                        }
                                    </View>
                                )
                            })
                        }
                    </View>
                )
            }
        }
    }

    /**
     * There is issue to render round TextView in ios version, so decided to wrap TextView with view for IOS
     * and TextView alone for android
     * */
    returnTextView(item, index) {
        if (Platform.OS === 'ios') {
            return (
                <TouchableOpacity style={[styles.numberRoundView]} onPress={() => this.onSelectedScale(index)}>

                    <Text style={[styles.numberRoundText, { opacity: this.setOpacity(item) }]}>{index + 1}</Text>

                </TouchableOpacity>
            )
        } else {
            return (
                <TouchableOpacity onPress={() => this.onSelectedScale(index)}>
                    <Text style={[styles.numberRoundText, { opacity: this.setOpacity(item) }]}>{index + 1}</Text>
                </TouchableOpacity>
            )
        }
    }

    /** set opacity of the selected item */
    setOpacity(item) {
        if (item.hasOwnProperty('isSelected')) {
            return item.isSelected ? fullOpacity : halfOpacity
        }
        else {
            return fullOpacity
        }

    }

    /** method called when select scale value */
    onSelectedScale = (scaleValue) => {
        let isSelected = false
        this.setState({ selectedRating: scaleValue + 1 })
        let tempScaleArray = this.state.scaleArray
        tempScaleArray.scale_images.map((item, index) => {

            if (scaleValue == index) {
                isSelected = true
                scaleId = index + 1
            }
            else {
                isSelected = false
            }
            item.isSelected = isSelected
        })

        this.setState({ scaleArray: tempScaleArray })
    }
    bottomViewLayout = (e) => {
        const { height } = e.nativeEvent.layout
        this.setState({ bottomViewHeight: height })
    }
    /** compoenent rendering */
    render() {
        const { goBack } = this.props.navigation;
        const { scaleArray, image } = this.state
        const { innerView, back, tick, bottomContainer, text, bottomCon } = styles;

        return (
            <ViewShot style={innerView} ref="viewShot" options={{ format: "jpg", quality: 0.9 }}>

                <View style={[styles.ImageContainerView, { marginBottom: this.state.bottomViewHeight }]}>
                    <Image style={[styles.imageStyle]}
                        resizeMode='stretch' source={{ uri: image }} />
                </View>

                <View style={bottomContainer} onLayout={(event) => { this.bottomViewLayout(event) }}>
                    <Text numberOfLines={10} style={text}>{imageProperty.scale_text !== '' ? imageProperty.scale_text : ''}</Text>

                    {this.renderScaleImage(scaleArray)}

                    <View style={styles.tickMarkContainer}>
                        {!this.state.hideIcon && (<TouchableOpacity style={back}
                            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                            onPress={() => goBack()}>
                            <Image style={{ width: 30, height: 30 }}
                                source={require('../../images/survey/camera_back.png')} />
                        </TouchableOpacity>)}

                        {!this.state.hideIcon && (
                            <TouchableOpacity style={tick}
                                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                                onPress={() => this.goToQuestionScreen()}>
                                <Image style={{ width: 30, height: 30 }}
                                    source={require('../../images/survey/tick.png')} />
                            </TouchableOpacity>)}
                    </View>
                </View>
            </ViewShot >
        );
    }
}

export default ScaledImage;

/** UI styles used for this component */
const styles = ScaledSheet.create({
    numberRoundText: {
        width: 40,
        height: 40,
        lineHeight: 40,
        color: Color.colorBlack,
        fontSize: Dimen.normalText,
        borderRadius: 30,
        textAlign: 'center',
        alignItems: 'center',
        backgroundColor: Color.colorWhite,
        fontWeight: 'bold',
    },
    numberRoundView: {
        width: 40,
        height: 40,
        lineHeight: 40,
        borderRadius: 30,
        overflow: 'hidden',
        alignItems: 'center',
    },
    innerView: {
        flex: 1,
        flexDirection: 'column',
        overflow: 'hidden'
    },
    ImageContainerView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    imageStyle: {
        height: '100%',
        width: '100%'
    },
    tickMarkContainer: {
        marginHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    tick: {
        margin: 10,
        alignSelf: 'center'
    },
    back: {
        margin: 10,
        alignSelf: 'center'
    },
    bottomContainer: {
        position: 'absolute',
        width: '100%',
        paddingTop: 10,
        paddingBottom: 10,
        bottom: 0,
        backgroundColor: Color.colorImageCaptureBg,
    },
    text: {
        color: Color.colorWhite,
        fontSize: Dimen.normalText,
        fontWeight: 'bold',
        alignSelf: 'center',
        marginBottom: 20,
        paddingLeft: 10,
        paddingRight: 10,
        opacity: 1
    },
    overlayView: {
        width: 200,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: Dimen.radius
    },
    textBoxView: {
        position: 'absolute'
    },
    bottomCon: {
        width: '100%',
        position: 'absolute',
        backgroundColor: Color.colorImageCaptureBg,
        flex: 1,
        bottom: 0,
        flexDirection: 'row',
        alignSelf: 'stretch',
        left: 0,
    },
    scaleContainer: {
        height: 50,
        flexDirection: 'row',
        alignSelf: 'stretch',
        justifyContent: 'space-around',
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 10
    },
    scaleImage: {
        width: 40,
        height: 40,
        resizeMode: 'contain'
    },
    //Image
    numberView: {
        width: 50,
        height: 50,
    },
    numberText: {
        width: 50,
        height: 50,
        lineHeight: 50,
        color: Color.colorBlack,
        fontSize: Dimen.extraLargeText,
        borderRadius: 30,
        textAlign: 'center',
        alignItems: 'center',
        backgroundColor: Color.colorWhite,
        fontWeight: 'bold',
    }
});