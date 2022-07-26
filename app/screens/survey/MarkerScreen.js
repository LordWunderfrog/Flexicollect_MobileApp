import React, { Component } from 'react';
import {
    Image,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
    Dimensions,
    ImageBackground
} from "react-native";
import { ScaledSheet } from 'react-native-size-matters';
import * as Color from '../../style/Colors';
import * as String from '../../style/Strings';
import * as Dimen from '../../style/Dimensions';
import DragAndScale from '../../components/dragcomponent/DragAndScale'
import * as Constants from '../../utils/Constants';
import ViewShot from "react-native-view-shot";
//import { NavigationActions, StackActions } from "react-navigation";
//import Orientation from 'react-native-orientation';
import Orientation from "react-native-orientation-locker";
import AsyncStorage from '@react-native-async-storage/async-storage';

let imagePath;
let imageProperty;
const { height } = Dimensions.get('window');
const { width } = Dimensions.get('window');
let releaseStyle;
let selectedMarkerId = 0;
let mStyle
let LoginComponent = 1;
// Photo
const arrow = require('../../images/marker/arrow.png');
const circle = require('../../images/marker/circle.png');
const locationIcon = require('../../images/marker/location.png');

/** Marker screen class component */
class MarkerScreen extends Component {

    constructor(props) {
        super(props)
        // const { params } = this.props.navigation.state;
        const { params } = this.props.route;
        imagePath = params ? params.imageData : '';
        imageProperty = params ? params.imageProperty : '';

        this.state = {
            image: imagePath,
            arrow: '',
            circle: '',
            location: '',
            hidMaker: false,
            whichMaker: 4,
            isSelected: false,
            selectedMaker: arrow,
            tapToPlace: imageProperty.marker_instruction_text !== '' ? imageProperty.marker_instruction_text : String.tapToPlace,
            locationX: width / 2,
            locationY: height / 2,
            markerStyle: '',
            hideIcon: false,
            bottomViewHeight: 200
        }
    }

    /** compoenent life cycle methods */
    UNSAFE_componentWillMount() {
        StatusBar.setHidden(true);
        /**
         * get marker images
         * */
        this.getMarkerImage(imageProperty);
    }
    componentDidMount() {
        //Orientation.unlockAllOrientations();
        Orientation.lockToPortrait();
    }
    componentDidUpdate() {
        StatusBar.setHidden(true);
    }
    componentWillUnmount() {
        Orientation.lockToPortrait();
    }

    /**
     * getting marker image 
     * @param {object} imageProperty - Get user captured image
     */
    getMarkerImage(imageProperty) {
        if (imageProperty !== '') {
            imageProperty.marker_images.map((item) => {
                if (item.hasOwnProperty('identifier')) {
                    if (item.identifier === 'location') {
                        this.setState({ location: { uri: item.marker_image } })
                    } else if (item.identifier === 'circle') {
                        this.setState({ circle: { uri: item.marker_image } })
                        // this.setState({circle: {uri: 'http://52.32.187.205/images/circle.png'}});
                    } else if (item.identifier === 'arrow') {
                        this.setState({ arrow: { uri: item.marker_image } })
                        // this.setState({arrow: {uri: 'http://52.32.187.205/images/arrow.png'}});
                    }
                }
            })
        }
    }


    /**
     * Marker click action
     * @param {type} whichMarker - To set marker type
     */
    markerClick(whichMarker) {
        this.setState({ hidMaker: true })
        if (whichMarker === 'location') {
            this.setState({ selectedMaker: locationIcon, whichMaker: 1, isScalable: false, isSelected: false, })
        } else if (whichMarker === 'circle') {
            this.setState({ selectedMaker: circle, whichMaker: 2, isScalable: true, isSelected: true })
        } else if (whichMarker === 'arrow') {
            this.setState({ selectedMaker: arrow, whichMaker: 3, isScalable: true, isSelected: true })
        }
        this.getSelectedMarkerId(whichMarker)
    }

    /** get selected marker 
     *  @param selectedMarker - selected marker id
    */
    getSelectedMarkerId(selectedMarker) {
        if (imageProperty !== '') {
            imageProperty.marker_images.map((item) => {
                if (item.hasOwnProperty('identifier')) {
                    if (item.identifier === selectedMarker) {
                        selectedMarkerId = item.id
                    }
                }
            })
        }
    }

    /**
     * To set marker style
     */
    get changeStyleMarker() {
        if (this.state.whichMaker === 1) {
            /*marginTop: height / 2 - 60,
                marginLeft: width / 2 - 15*/
            return {
                width: 35,
                height: 50,
            }
        } else if (this.state.whichMaker === 2) {
            /*marginTop: height / 2 - 50,
                marginLeft: width / 2 - 30*/
            return {
                width: 80,
                height: 80,

            }
        } else {
            /*   marginTop: height / 2 - 40,
                   marginLeft: width / 2 - 30*/
            return {
                width: 80,
                height: 80
            }
        }
    }

    /**
     * Navigate Page Based On Configuration Params
     */
    async _captureScreen() {

        let missionId = await AsyncStorage.getItem('missionId');
        let pageIndex = await AsyncStorage.getItem('pageIndex');
        // this.setState({ hideIcon: true })

        setTimeout(() => {

            this.refs.viewShot.capture().then(uri => {
                if (imageProperty.hasOwnProperty('instruction_enabled') && imageProperty.instruction_enabled === 1) {
                    this.props.navigation.navigate('TextBoxScreen', {
                        previewUri: this.state.image,
                        markerId: selectedMarkerId,
                        imageData: uri,
                        locationX: this.state.locationX,
                        locationY: this.state.locationY,
                        marker: this.state.whichMaker,
                        markerStyle: this.state.markerStyle,
                        imageProperty: imageProperty,
                    })

                } else {

                    if (imageProperty.hasOwnProperty('scale_enabled') && imageProperty.scale_enabled === 1) {
                        this.props.navigation.navigate('ScaledImage', {
                            imageData: uri,
                            previewUri: this.state.image,
                            markerId: this.state.whichMaker,
                            captionText: '',
                            imageProperty: imageProperty,
                        })
                    } else {

                        global.previewUri = this.state.image.uri
                        global.imageData = uri
                        global.markerId = this.state.whichMaker
                        global.scaleId = 0
                        global.captionText = ''
                        global.type = 'capture'

                        // const backAction = NavigationActions.back({
                        //     key: global.screenKey,
                        // });
                        // this.props.navigation.dispatch(backAction);
                        this.props.navigation.navigate({ name: 'SurveyBox' })
                    }
                }
                // this.setState({ hideIcon: false })
            }, 300)

        });
    }

    /**
     * marker opacity
     */
    markerOpacity(val) {

        if (this.state.whichMaker === val) {
            return { opacity: 0.2 }
        } else {
            return { opacity: 1 }
        }
    }
    bottomViewLayout = (e) => {
        const { height } = e.nativeEvent.layout
        this.setState({ bottomViewHeight: height })
    }

    /** Class render method */
    render() {
        const { selectedMaker, tapToPlace, location, circle, arrow } = this.state
        const { goBack } = this.props.navigation;
        const { container, rootView, back, tick, bottomContainer, locationStyle, arrowStyle, circleStyle, gesture, text, markerView } = styles;
        return (
            <View style={container}>
                <ViewShot style={[rootView, { marginBottom: this.state.bottomViewHeight }]} ref="viewShot" options={{ format: "jpg", quality: 0.9 }}>
                    <View style={styles.ImageContainerView}>
                        <Image style={styles.imageStyle}
                            resizeMode="stretch" source={this.state.image} />
                    </View>
                    {
                        this.state.hidMaker && (<DragAndScale
                            style={gesture}
                            scalable={!this.state.isSelected ? false : { min: 1, max: 5 }}
                            rotatable={false}
                            onScaleEnd={(event, locationX, locationY, style) => {
                                this.setState({
                                    markerStyle: style
                                })
                            }}

                            onScaleChange={(event, style) => {
                                this.setState({
                                    markerStyle: style
                                })
                            }}
                            onPanRelease={(event, locationX, locationY, style, setValue) => {
                                //Constants.saveKey('styleMarker',style)                        
                                let localStyle = {
                                    position: 'absolute',
                                    alignSelf: 'center',
                                    padding: 20,
                                    marginTop: style.marginTop - 60,
                                    marginLeft: style.marginLeft - 30,
                                    left: style.left,
                                    top: style.top
                                }

                                /**
                                 * setValue=== true (scale) and setValue===false(drag)
                                 * */
                                this.setState({
                                    locationX: locationX,
                                    locationY: locationY,
                                    markerStyle: localStyle
                                })
                            }}
                        >
                            <View style={[this.changeStyleMarker]}>
                                <Image
                                    ref={(c) => {
                                        this.view = c;
                                    }}
                                    source={selectedMaker}
                                    style={[this.changeStyleMarker]}
                                />
                            </View>
                        </DragAndScale>)
                    }
                </ViewShot>

                <View style={bottomContainer} onLayout={(event) => { this.bottomViewLayout(event) }}>
                    <View style={{ flex: 1 }}>
                        <Text numberOfLines={10} style={text}>{tapToPlace}</Text>
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                            {
                                location !== '' && (
                                    <TouchableOpacity
                                        style={[{ marginLeft: 10 }, styles.markerBg]}
                                        onPress={() => this.markerClick('location')}>

                                        <ImageBackground style={styles.markerBg}
                                            source={require('../../images/marker/marker_bg.png')}>
                                            <Image
                                                style={[locationStyle, this.markerOpacity(1)]}
                                                source={require('../../images/marker/location.png')} />
                                        </ImageBackground>
                                    </TouchableOpacity>
                                )
                            }
                            {
                                circle !== '' && (
                                    <TouchableOpacity
                                        style={styles.markerBg}
                                        onPress={() => this.markerClick('circle')}>
                                        <ImageBackground style={styles.markerBg}
                                            source={require('../../images/marker/marker_bg.png')}>
                                            <Image
                                                style={[circleStyle, this.markerOpacity(2)]}
                                                source={require('../../images/marker/circle.png')} />
                                        </ImageBackground>
                                    </TouchableOpacity>
                                )
                            }
                            {
                                arrow !== '' && (
                                    <TouchableOpacity
                                        style={[{ marginRight: 10 }, styles.markerBg]}
                                        onPress={() => this.markerClick('arrow')}>
                                        <ImageBackground style={styles.markerBg}
                                            source={require('../../images/marker/marker_bg.png')}>
                                            <Image
                                                style={[circleStyle, this.markerOpacity(3)]}
                                                source={require('../../images/marker/arrow.png')} />
                                        </ImageBackground>
                                    </TouchableOpacity>
                                )
                            }
                        </View>
                    </View>

                    <View style={styles.tickMarkContainer}>
                        {!this.state.hideIcon && (<TouchableOpacity style={back}
                            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                            onPress={() => goBack()}>
                            <Image style={{ width: 30, height: 30 }}
                                source={require('../../images/survey/camera_back.png')} />
                        </TouchableOpacity>)}

                        {!this.state.hideIcon && (<TouchableOpacity style={tick}
                            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                            onPress={() => this._captureScreen()}>
                            <Image style={{ width: 30, height: 30 }}
                                source={require('../../images/survey/tick.png')} />
                        </TouchableOpacity>)}
                    </View>
                </View>
            </View>
        );
    }

    /* Handle user click, when user accepts preview */
    onTickClick() {
        this._captureScreen()
        let fx1;
        let fy1;
        this.view.measure((fx, fy, width, height, px, py) => {
            fx1 = fx;
            fy1 = fy;
        })
    }
}

export default MarkerScreen;

/** UI styles used for this class */
const styles = ScaledSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column'
    },
    rootView: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'black',
        justifyContent: 'center'
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
        marginHorizontal: 10,
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
        backgroundColor: Color.colorImageCaptureBg,
        bottom: 0,
    },
    circleStyle: {
        width: 50,
        height: 50,
    },
    locationStyle: {
        width: 35,
        height: 50,
        alignSelf: 'center',
        justifyContent: 'center'
    },
    arrowStyle: {
        width: 50,
        height: 50,
        alignSelf: 'center'
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
    gesture: {
        position: 'absolute',
        alignSelf: 'center',
        justifyContent: 'center',
        left: width / 2,
        top: height / 2,
        transform: [
            {
                translateX: -50
            },
            {
                translateY: -50
            }
        ]
    },
    markerBg: {
        width: 90,
        height: 90,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center'
    },
    markerView: {
        backgroundColor: 'transparent'
    }
});