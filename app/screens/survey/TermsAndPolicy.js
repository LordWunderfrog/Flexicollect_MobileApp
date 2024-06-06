import React, { Component } from 'react';
import {
    Dimensions,
    Image, ImageBackground,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { WebView } from "react-native-webview";
import * as Styles from "../../style/Styles";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Color from "../../style/Colors";
import { AndroidBackHandler } from "react-navigation-backhandler";
import { ScaledSheet } from "react-native-size-matters";
import * as Dimension from "../../style/Dimensions";

/** status bar settings */
// const MyStatusBar = ({ backgroundColor, ...props }) => (
//     <View style={[styles.statusBar, { backgroundColor }]}>
//         <StatusBar translucent backgroundColor={backgroundColor} {...props} />
//     </View>
// );
const { height } = Dimensions.get('window');
let backArrow = require('../../images/survey/arrow_back.png')
// let termsAndConditionUrl = 'http://www.eolasinternationalportal.com/EolasAppTandCs.htm'; //old link
let termsAndConditionUrl = "http://eolasinternationalportal.com/TermsConditions.php"
let title = 'Terms of Service';

/** tearms and policy page class */
class TermsAndPolicy extends Component {

    constructor(props) {
        super(props)
        //const { params } = this.props.navigation.state;
        const { params } = this.props.route;
        title = params ? params.title : 0;
        termsAndConditionUrl = params && params.SelectedLan ?
            `http://eolasinternationalportal.com/TermsConditions.php?lan=${params.SelectedLan}` : termsAndConditionUrl;
    }

    /** component life cycle */
    componentDidMount() {
        StatusBar.setHidden(false);
    }

    /**
     * render header view layout
     */
    headerView = () => {
        return (
            <View style={[styles.topHeaderView]}>

                <View style={styles.titleView}>
                    <Text style={styles.headerText}
                        numberOfLines={1}>{title}</Text>
                </View>

                <TouchableOpacity style={styles.backView} onPress={() => this.props.navigation.goBack(null)}>

                    <Image source={backArrow}
                        style={styles.backArrow} />

                </TouchableOpacity>


            </View>
        )
    }

    /**
     * Render Terms And Condition url in webview component
     */
    webviewComponent = () => {
        return (
            <WebView
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                source={{ uri: termsAndConditionUrl }}
                style={styles.webViewStyle}
                scalesPageToFit={false}
            />
        )
    }

    /** class render method */
    render() {
        return (
            <SafeAreaView style={{ backgroundColor: Color.colorDarkBlue, flex: 1 }}
                edges={['right', 'top', 'left']}
                forceInset={{
                    bottom: 'never',
                    //top: Platform.OS === 'ios' ? height === 812 ? 10 : 0 : 0
                }}>
                <StatusBar barStyle="light-content" backgroundColor={Color.colorBlack} />
                <View style={{ flex: 1 }}>
                    {this.headerView()}
                    {this.webviewComponent()}
                </View>
            </SafeAreaView>

        );
    }
}

export default TermsAndPolicy;

/** UI styles used for this class */
const styles = ScaledSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        flexDirection: 'column',
        backgroundColor: Color.colorWhite
    },
    backArrow: {
        width: 18,
        height: 16,
        marginLeft: '10@ms',
        alignSelf: 'center',
    },
    webViewStyle: {
        width: '100%',
        height: 200,
        justifyContent: 'flex-start',
    },
    topHeaderView: {
        width: '100%',
        flexDirection: 'row',
        backgroundColor: Color.colorDarkBlue,
        alignItems: Platform.OS === 'ios' ? 'flex-end' : 'center',
        justifyContent: 'flex-start',
        height: Platform.OS === 'ios' ? 56 : 70 - 14,
        // marginTop: Platform.OS === 'ios' ? 10 : 0,
    },
    backView: {
        height: '100%',
        flexDirection: 'row',
        flex: 0.5,
    },
    titleView: {
        top: Platform.OS === 'ios' ? 0 : 0,
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute'
    },
    headerText: {
        width: '100%',
        color: Color.colorWhite,
        fontSize: Dimension.extraLargeText + '@ms0.3',
        fontWeight: '500',
        textAlign: 'center',
        alignSelf: 'center',
        paddingLeft: '80@ms',
        paddingRight: '80@ms',
    },
    rightView: {
        height: '100%',
        flexDirection: 'row',
        flex: 0.2
    },
});