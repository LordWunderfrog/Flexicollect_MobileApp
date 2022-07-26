import React, { Component } from 'react';
import {
    Image, StatusBar,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import * as Color from '../../style/Colors';
//import { NavigationActions, StackActions } from "react-navigation";
//import Orientation from 'react-native-orientation';
import Orientation from "react-native-orientation-locker";
import AsyncStorage from '@react-native-async-storage/async-storage';

let imagePath;
let localImage;
let imageProperty;

/** preview image class component */
class PreviewImage extends Component {

    constructor(props) {
        super(props)
        //const { params } = this.props.navigation.state;
        const { params } = this.props.route;
        imagePath = params ? params.imageData : '';
        imageProperty = params ? params.imageProperty : '';

        if (imagePath !== '') {
            localImage = { uri: imagePath }
        } else {
            localImage = require('../../images/home/mission/product_bg.png')
        }

        this.state = {
            image: localImage,
            isDoubleClick: false
        }

        if (params.isFromGallary) {
            /** case when image tag element image take from gallary 
             *  and redirect directly in this screen then set key
             */
            // global.screenKey = this.props.navigation.state.key
            global.screenKey = this.props.route.key
        }
    }

    /** component life cycle methods */
    componentDidMount() {
        // Orientation.unlockAllOrientations();
        Orientation.lockToPortrait();
    }
    UNSAFE_componentWillMount() {
        StatusBar.setHidden(true);
        /**
         * get marker images
         * */

    }
    componentWillUnmount() {
        Orientation.lockToPortrait();
    }

    /**
     * Configure global values and Navigate to page based on question properties
     */
    async goToNextScreen() {
        // let missionId = await AsyncStorage.getItem('missionId');
        // let pageIndex = await AsyncStorage.getItem('pageIndex');
        if (!this.state.isDoubleClick) {
            this.setState({ isDoubleClick: true })
            if (imageProperty.hasOwnProperty('marker_enabled') && imageProperty.marker_enabled === 1) {
                this.props.navigation.navigate('MarkerScreen', { imageData: localImage, imageProperty: imageProperty })
            } else if (imageProperty.hasOwnProperty('marker_enabled') && imageProperty.marker_enabled === 0) {
                if (imageProperty.hasOwnProperty('scale_enabled') && imageProperty.scale_enabled === 1) {
                    this.props.navigation.navigate('ScaledImage', {
                        previewUri: localImage,
                        imageProperty: imageProperty,
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
            setTimeout(() => {
                this.setState({ isDoubleClick: false })
            }, 2000);
        }
    }

    /** component rendering */
    render() {
        const { goBack } = this.props.navigation;
        const { container, back, tick, bottomContainer, Imagecontainer } = styles;
        return (
            <View style={container}>
                <View style={Imagecontainer}>
                    <Image style={{ flex: 1, overflow: "visible", height: '100%', width: '99%', alignSelf: 'center' }}
                        resizeMode='contain' source={this.state.image} />
                </View>

                <View style={bottomContainer}>


                    <TouchableOpacity style={back}
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                        onPress={() => goBack()}>
                        <Image style={{ width: 30, height: 30 }}
                            source={require('../../images/survey/camera_back.png')} />
                    </TouchableOpacity>

                    <TouchableOpacity style={tick}
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                        onPress={() => this.goToNextScreen()}>
                        <Image style={{ width: 30, height: 30 }}
                            source={require('../../images/survey/tick.png')} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

export default PreviewImage;

/** UI styles used for this component */
const styles = ScaledSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: Color.colorImageCaptureBg,
        height: '100%',
        width: '100%'
    },
    tick: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        margin: 10,
        padding: 5,
        alignSelf: 'center'
    },
    back: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        margin: 10,
        padding: 5,
        alignSelf: 'center'
    },
    bottomContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: Color.colorBlack,
        height: '10%'
    },
    Imagecontainer: {
        height: '90%',
        width: '100%'
    }
});