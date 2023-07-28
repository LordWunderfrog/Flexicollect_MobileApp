import React, { Component } from 'react';
import {
    View,
    Text,
    Platform,
    StatusBar,
    ImageBackground,
    TextInput,
    TouchableOpacity, Linking,
    Image,
    ScrollView, Dimensions, ActivityIndicator, KeyboardAvoidingView, Alert,
    LogBox
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from "@react-native-community/netinfo/lib/commonjs";
import { ScaledSheet } from 'react-native-size-matters';
import * as Style from '../../style/Styles';
import * as Color from '../../style/Colors';
import * as Dimension from '../../style/Dimensions';
import * as String from '../../style/Strings';
//import { NavigationActions, SafeAreaView, StackActions } from "react-navigation";
import { CommonActions } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Font from '../../style/Fonts';
import * as Constants from '../../utils/Constants';
import axios from 'axios';
import * as Service from "../../utils/Api";
//import Orientation from "react-native-orientation";
import Orientation from "react-native-orientation-locker";
import RNFS from "react-native-fs";
import DeviceInfo from "react-native-device-info";
import RNPickerSelect from "react-native-picker-select";
import { Picker } from '@react-native-community/picker';
import { measureConnectionSpeed } from '../../components/GetNetworkSpeed';
import dynamicLinks from '@react-native-firebase/dynamic-links';

let status;
const eolasLogo = require('../../images/login/eolas_logo_new_1.png');
const Downarrow = require('../../images/login/down-arrow.png');
let activeOpacityForIOSPicker = 0.8

/** Sign in class */
class SignIn extends Component {

    constructor(props) {
        super(props);
        this.Refs = {
            languageIOSPicker: null
        };
        this.state = {
            mobOrEmail: '',
            password: '',
            isLoading: false,
            isForgotPasswordClicked: false,
            webSurvey: false,
            url: '',
            showLoader: false,
            currentTextSecure: true,
            Language: 'English',
            // languagelist: Platform.OS == 'ios' ? Constants.languages : [],
            // translation: Platform.OS == 'ios' ? Constants.signin : [],
            languagelist: Constants.languages,
            translation: Constants.signin,
            translation_common: Constants.common_text,
            appVersion: ''
        }

        this.handleNavigation = this.handleNavigation.bind(this);
        this.checkAppUpdate = this.checkAppUpdate.bind(this);
        this.checkAppVersionAndContinue = this.checkAppVersionAndContinue.bind(this);
    }

    /** component life cycle method */
    UNSAFE_componentWillMount() {
        this.checkVersion()
        Orientation.lockToPortrait();
        //console.disableYellowBox = true
        LogBox.ignoreAllLogs()
        // this.getpagetranslation() //TODO remove comment 
        this.getlanguagelist()
    }
    componentDidMount() {
        Orientation.lockToPortrait();
        const { navigation } = this.props;
        this.focusListener = navigation.addListener("focus", () => {
            StatusBar.setHidden(true);
        });

        /** dynamic link redirection manage for first time for ios */
        dynamicLinks()
            .getInitialLink()
            .then(event => {
                if (Platform.OS == 'ios') {
                    if (event && event.url != "") {
                        setTimeout(() => {
                            this.openSurvey(event.url);
                        }, 100);
                    } else {
                        this.getData()
                    }
                }
            });

        Linking.getInitialURL().then(url => {
            if (url && url != "") {
                this.openSurvey(url);
            } else {
                if (Platform.OS == 'android') {
                    this.getData()
                }
            }
        });

        this.linkSingnin = Linking.addEventListener('url', this.handleNavigation);
    }
    componentWillUnmount() {
        this.focusListener();
        // Linking.removeEventListener('url', this.handleNavigation);
        this.linkSingnin && this.linkSingnin.remove()
    }

    /**
     * Get translation language list from api
     */
    getlanguagelist() {
        NetInfo.fetch().then(state => {
            let status = state.isConnected ? "online" : "offline";
            if (status === "online") {
                let url = Constants.BASE_URL + Service.LANGUAGES;
                axios.get(url).then(response => {
                    if (Platform.OS == 'ios') {
                        let lans = response.data.data;
                        let lanList = [];
                        for (var i = 0; i < lans.length; i++) {
                            let obj = {};
                            obj.value = lans[i];
                            obj.label = lans[i];
                            lanList.push(obj);
                        }
                        this.setState({ languagelist: lanList });
                    }
                    else {
                        this.setState({ languagelist: response.data.data });
                    }
                })
                    .catch((error) => {
                        this.setState({ languagelist: Constants.languages });
                    });
            }
            else {
                this.setState({ languagelist: Constants.languages });
            }
        })
    }

    /**
     * Get selected language page translation data from api
     */
    getpagetranslation() {
        NetInfo.fetch().then(state => {
            let status = state.isConnected ? "online" : "offline";
            if (status === "online") {
                let url = Constants.BASE_URL + Service.TRANSLATION_PAGE + 'signin';
                axios.get(url).then(response => {
                    this.setState({ translation: response.data.data });
                })
                    .catch((error) => {
                        this.setState({ translation: Constants.signin, languagelist: Constants.languages });
                    });
            }
            else {
                this.setState({ translation: Constants.signin, languagelist: Constants.languages });
            }
        })
    }

    /**
     * Update new version of app from playstore
     */
    checkAppUpdate() {
        Alert.alert(
            this.state.translation[this.state.Language].Version_Check,
            this.state.translation[this.state.Language].Upgraded_App_Msg,
            [
                { text: 'OK', onPress: () => this.checkAppVersionAndContinue() }
            ],
            { cancelable: false },
        );
        Linking.openURL(Constants.PLAY_STORE_URL);

    }

    /**
     * Check App new version
     */
    checkAppVersionAndContinue() {

        if (DeviceInfo.getVersion() != this.state.appVersion) {
            Alert.alert(
                this.state.translation[this.state.Language].Version_Check,
                this.state.translation[this.state.Language].New_Version_Msg,
                [
                    { text: 'OK', onPress: () => { this.checkAppUpdate() } }
                ],
                { cancelable: false },
            );
        }

    }

    /**
     * Check App new version
     * Logic change is call api and check server version is greter then device version then only comes popup of update
     * Ex - New user -> 5.12 > 5.13 - false no popup
     *      old user -> 5.12  !=  5.12(As per old code) - false no popup
     * Now when force update then server version need to change to 5.13
     * New user -> 5.13 > 5.13 - false no popup
     * old user -> 5.13 != 5.12 - true - got update popup
     */
    checkVersion() {
        NetInfo.fetch().then(state => {
            let status = state.isConnected ? "online" : "offline";
            if (status === "online") {
                let url = Constants.BASE_URL + Service.VERSION_CHECK;
                axios.get(url).then(response => {
                    if (response.data && response.data.version && response.data.version != "") {
                        if (parseFloat(response.data.version) > parseFloat(DeviceInfo.getVersion())) {
                            this.setState({ appVersion: response.data.version });
                            Alert.alert(
                                this.state.translation[this.state.Language].Version_Check,
                                this.state.translation[this.state.Language].New_Version_Msg,
                                [
                                    { text: 'OK', onPress: () => { this.checkAppUpdate() } }
                                ],
                                { cancelable: false },
                            );
                        }
                    }
                })
                    .catch((error) => {
                        this.setState({ translation: Constants.signin, languagelist: Constants.languages });
                    });
            }
        })

        /** old version checking working code */
        // NetInfo.fetch().then(state => {
        //     let status = state.isConnected ? "online" : "offline";
        //     if (status === "online") {
        //         let url = Constants.BASE_URL + Service.VERSION_CHECK;
        //         axios.get(url).then(response => {
        //             if (response.data && response.data.version && response.data.version != "") {
        //                 if (DeviceInfo.getVersion() != response.data.version) {
        //                     this.setState({ appVersion: response.data.version });
        //                     Alert.alert(
        //                         'Version Update',
        //                         'New Version of App is available in PlayStore. Click OK to upgrade and continue.',
        //                         [
        //                             { text: 'OK', onPress: () => { this.checkAppUpdate() } }
        //                         ],
        //                         { cancelable: false },
        //                     );
        //                 }
        //             }
        //         })
        //             .catch((error) => {
        //                 this.setState({ translation: Constants.signin, languagelist: Constants.languages });
        //             });
        //     }
        // })
    }

    /**
     * Select language
     * @param {array} lan - Handle Language change 
     */
    selectlanguage(lan) {
        if (lan) {
            this.setState({ Language: lan })
            global.language = lan;
            Constants.saveKey('Language', lan)
        }
    }


    /**
     * check logged user or not
     * */
    async getData() {
        // if(Platform.OS == 'ios')
        // {
        //     let mSignIn = await AsyncStorage.getItem("api_key");
        //     let language = await AsyncStorage.getItem("Language");
        //     const {params} = this.props.navigation.state;
        //     let toProfile = params ? params.toProfile : false;
        //     let email = params ? params.email : false;
        //     let password = params ? params.password : false;
        //     if (mSignIn != null && mSignIn != '' && !toProfile) {
        //         if(language != null && language != ''){
        //             global.language = language
        //         }
        //         else{
        //             global.language='English'
        //         }
        //         this.resetStack()
        //     } else if(toProfile && email && password) {
        //         this.setState({
        //             showLoader: true
        //         })
        //         this.loginNetworkCall(email, password);
        //     }
        // }
        // else 
        // {
        let mSignIn = await AsyncStorage.getItem("api_key");
        let language = await AsyncStorage.getItem("Language");
        if (mSignIn != null && mSignIn != '') {
            if (language != null && language != '') {
                global.language = language
            }
            else {
                global.language = 'English'
            }
            this.resetStack()
        }
        // }
    }

    /**
     * Filter param from url
     */
    getParameterByName = (name, url) => {
        if (url && name) {
            name = name.replace(/[\[\]]/g, '\\$&');
            var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, ' '));
        }
        return null;
    }

    /**
     * Filter param from url without space
     */
    getParameterByNameWithoutSpace = (name, url) => {
        if (url && name) {
            name = name.replace(/[\[\]]/g, '\\$&');
            var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2]);
        }
        return null;
    }

    /**
     * Check app link includes verifyemail or resetpassword or survey link. Process it accordingly.
     */
    async openSurvey(url) {
        if (Platform.OS == 'ios') {
            try {
                let language = await AsyncStorage.getItem("Language");
                if (language != null && language != '') {
                    global.language = language
                }
                else {
                    global.language = 'English'
                }

                let newUrl = url;
                if (newUrl.indexOf("deep_link_id=")) {
                    newUrl = (newUrl.replace(new RegExp('.*' + "deep_link_id="), ''));
                }
                if (newUrl.includes('verifyemail')) {

                    newUrl = decodeURIComponent(newUrl);
                    const email = this.getParameterByNameWithoutSpace("email", newUrl)
                    const accessToken = this.getParameterByNameWithoutSpace("accessToken", newUrl)
                    const accessSignature = this.getParameterByNameWithoutSpace("accessSignature", newUrl)
                    if (email && accessToken && accessSignature && email != '' && accessToken != '' && accessSignature != '') {
                        this.verifyEmail(email, accessToken, accessSignature);
                    }
                }
                else if (newUrl.includes('resetpassword')) {

                    newUrl = decodeURIComponent(newUrl);
                    const email = this.getParameterByNameWithoutSpace("email", newUrl)
                    const accessToken = this.getParameterByNameWithoutSpace("accessToken", newUrl)
                    const accessSignature = this.getParameterByNameWithoutSpace("accessSignature", newUrl)
                    this.resetPassword(email, accessToken, accessSignature);
                }
                else {
                    newUrl = decodeURIComponent(newUrl);
                    const id = this.getParameterByName("mission", newUrl)
                    const name = this.getParameterByName("name", newUrl)
                    if (parseInt(id) > 0) {
                        let mSignIn = await AsyncStorage.getItem("api_key");
                        if (mSignIn != null && mSignIn != '') {
                            // const resetAction = StackActions.reset({
                            //     index: 0,
                            //     actions: [NavigationActions.navigate({ routeName: 'SurveyBox', params: { missionId: id, missionName: name, from: 'home' } })],
                            // });
                            // this.props.navigation.dispatch(resetAction);
                            const resetAction = CommonActions.reset({
                                index: 0,
                                routes: [{ name: 'SurveyBox', params: { missionId: id, missionName: name, from: 'home' } }],
                            });
                            this.props.navigation.dispatch(resetAction);
                        }
                        else {
                            this.setState({ webSurvey: true, url: url });
                            Constants.saveKey('webUrl', url);
                        }
                    } else {
                        //console.log('no url')
                        this.getData()
                    }
                }
            } catch (err) {
                // Constants.showSnack(err.message);
            }
        }
        else {
            try {

                let language = await AsyncStorage.getItem("Language");
                if (language != null && language != '') {
                    global.language = language
                }
                else {
                    global.language = 'English'
                }
                if (url.includes('verifyemail')) {

                    let newUrl = decodeURIComponent(url);
                    const email = this.getParameterByNameWithoutSpace("email", newUrl)
                    const accessToken = this.getParameterByNameWithoutSpace("accessToken", newUrl)
                    const accessSignature = this.getParameterByNameWithoutSpace("accessSignature", newUrl)
                    this.verifyEmail(email, accessToken, accessSignature);
                }
                else if (url.includes('resetpassword')) {

                    let newUrl = decodeURIComponent(url);
                    const email = this.getParameterByNameWithoutSpace("email", newUrl)
                    const accessToken = this.getParameterByNameWithoutSpace("accessToken", newUrl)
                    const accessSignature = this.getParameterByNameWithoutSpace("accessSignature", newUrl)
                    this.resetPassword(email, accessToken, accessSignature);
                }
                else {
                    let mSignIn = await AsyncStorage.getItem("api_key");
                    if (mSignIn != null && mSignIn != '') {
                        let newUrl = decodeURIComponent(url);
                        const id = this.getParameterByName("mission", newUrl)
                        const name = this.getParameterByName("name", newUrl)

                        // const resetAction = StackActions.reset({
                        //     index: 0,
                        //     actions: [NavigationActions.navigate({ routeName: 'SurveyBox', params: { missionId: id, missionName: name, from: 'home' } })],
                        // });
                        // this.props.navigation.dispatch(resetAction);
                        const resetAction = CommonActions.reset({
                            index: 0,
                            routes: [{ name: 'SurveyBox', params: { missionId: id, missionName: name, from: 'home' } }],
                        });
                        this.props.navigation.dispatch(resetAction);
                    }
                    else {
                        this.setState({ webSurvey: true, url: url });
                        Constants.saveKey('webUrl', url);
                    }
                }
            } catch (err) {
                Constants.showSnack(err.message);
            }
        }
    }

    /**
     * Check app url includes verifyemail or resetpassword or survey link. Process it accordingly.
     */
    async handleNavigation(event) {
        if (Platform.OS == 'ios') {
            try {
                // Constants.showSnack(event.url);
                if (event.url && event.url != "") {
                    let newUrl = event.url;
                    if (newUrl.indexOf("deep_link_id=")) {
                        newUrl = (newUrl.replace(new RegExp('.*' + "deep_link_id="), ''));
                    }
                    if (newUrl.includes('verifyemail')) {

                        newUrl = decodeURIComponent(newUrl);
                        const email = this.getParameterByNameWithoutSpace("email", newUrl)
                        const accessToken = this.getParameterByNameWithoutSpace("accessToken", newUrl)
                        const accessSignature = this.getParameterByNameWithoutSpace("accessSignature", newUrl)
                        if (email && accessToken && accessSignature && email != '' && accessToken != '' && accessSignature != '') {
                            this.verifyEmail(email, accessToken, accessSignature);
                        }
                    }
                    else if (newUrl.includes('resetpassword')) {
                        newUrl = decodeURIComponent(newUrl);
                        const email = this.getParameterByNameWithoutSpace("email", newUrl)
                        const accessToken = this.getParameterByNameWithoutSpace("accessToken", newUrl)
                        const accessSignature = this.getParameterByNameWithoutSpace("accessSignature", newUrl)
                        this.resetPassword(email, accessToken, accessSignature);
                    }
                    else {
                        newUrl = decodeURIComponent(newUrl);
                        const id = this.getParameterByName("mission", newUrl)
                        const name = this.getParameterByName("name", newUrl)

                        if (parseInt(id) > 0) {
                            let mSignIn = await AsyncStorage.getItem("api_key");
                            if (mSignIn != null && mSignIn != '') {

                                // this.props.navigation.navigate('SurveyBox', {missionId: id, missionName: name, from: 'home'})
                                // const resetAction = StackActions.reset({
                                //     index: 0,
                                //     actions: [NavigationActions.navigate({ routeName: 'SurveyBox', params: { missionId: id, missionName: name, from: 'home' } })],
                                // });
                                // this.props.navigation.dispatch(resetAction);
                                const resetAction = CommonActions.reset({
                                    index: 0,
                                    routes: [{ name: 'SurveyBox', params: { missionId: id, missionName: name, from: 'home' } }],
                                });
                                this.props.navigation.dispatch(resetAction);
                            }
                            else {
                                this.setState({ webSurvey: true, url: event.url });
                                Constants.saveKey('webUrl', event.url);
                            }
                        }
                    }
                }
            } catch (err) {
                // Constants.showSnack(err.message);
            }
        }
        else {
            try {
                if (event.url && event.url != "") {
                    if (event.url.includes('verifyemail')) {

                        let newUrl = decodeURIComponent(event.url);
                        const email = this.getParameterByNameWithoutSpace("email", newUrl)
                        const accessToken = this.getParameterByNameWithoutSpace("accessToken", newUrl)
                        const accessSignature = this.getParameterByNameWithoutSpace("accessSignature", newUrl)
                        this.verifyEmail(email, accessToken, accessSignature);
                    }
                    else if (event.url.includes('resetpassword')) {

                        let newUrl = decodeURIComponent(event.url);
                        const email = this.getParameterByNameWithoutSpace("email", newUrl)
                        const accessToken = this.getParameterByNameWithoutSpace("accessToken", newUrl)
                        const accessSignature = this.getParameterByNameWithoutSpace("accessSignature", newUrl)
                        this.resetPassword(email, accessToken, accessSignature);
                    }
                    else {
                        let mSignIn = await AsyncStorage.getItem("api_key");
                        if (mSignIn != null && mSignIn != '') {

                            let newUrl = decodeURIComponent(event.url);
                            const id = this.getParameterByName("mission", newUrl)
                            const name = this.getParameterByName("name", newUrl)
                            // this.props.navigation.navigate('SurveyBox', {missionId: id, missionName: name, from: 'home'})
                            // const resetAction = StackActions.reset({
                            //     index: 0,
                            //     actions: [NavigationActions.navigate({ routeName: 'SurveyBox', params: { missionId: id, missionName: name, from: 'home' } })],
                            // });
                            // this.props.navigation.dispatch(resetAction);
                            const resetAction = CommonActions.reset({
                                index: 0,
                                routes: [{ name: 'SurveyBox', params: { missionId: id, missionName: name, from: 'home' } }],
                            });
                            this.props.navigation.dispatch(resetAction);
                        }
                        else {
                            this.setState({ webSurvey: true, url: event.url });
                            Constants.saveKey('webUrl', event.url);
                        }
                    }
                }
            } catch (err) {
                Constants.showSnack(err.message);
            }
        }
    }

    /**
     * Verify email API
     * @param {string} email - Call verify Email Api to verify the registered email address.
     */
    async verifyEmail(email, token, signature) {
        try {

            let url = Constants.BASE_URL_V2 + Service.VERIFY_EMAIL + 'email=' + email + "&accessToken=" + encodeURIComponent(token) + '&accessSignature=' + signature;
            axios.get(url).then(response => {
                if (response.data.status === 200) {
                    Constants.showSnack(this.state.translation[this.state.Language].Email_Verified);

                } else {

                    Constants.showSnack(response.data.message)
                }

            }).catch((error) => {
                if (error.response && error.response.data && error.response.data.message) {
                    Constants.showSnack(error.response.data.message)
                }
                else {
                    Constants.showSnack(`Unexpected error has happened: ${url}`)
                }

            });
        } catch (err) {
            Constants.showSnack(err.message);
        }

    }

    /**
     *call reset password api
     *if success navigate to reset password page
     */
    async resetPassword(email, token, signature) {
        try {

            let url = Constants.BASE_URL_V2 + Service.VERIFY_EMAIL + 'email=' + email + "&accessToken=" + encodeURIComponent(token) + '&accessSignature=' + signature + '&vtype=reset';
            axios.get(url).then(response => {
                if (response.data.status === 200) {
                    Constants.showSnack('Email is verified successfully. Please change your password.');
                    // const resetAction = StackActions.reset({
                    //     index: 0,
                    //     actions: [NavigationActions.navigate({ routeName: 'ResetPassword', params: { email: email } })],
                    // });
                    // this.props.navigation.dispatch(resetAction);
                    const resetAction = CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'ResetPassword', params: { email: email } }],
                    });
                    this.props.navigation.dispatch(resetAction);
                } else {
                    Constants.showSnack(response.data.message)
                }

            }).catch((error) => {
                if (error.response && error.response.data && error.response.data.message) {
                    Constants.showSnack(error.response.data.message)
                }
                else {
                    Constants.showSnack(`Unexpected error has happened: ${url}`)
                }

            });
        } catch (err) {
            Constants.showSnack(err.message);
        }

    }



    /**
     * validation
     * check whether valid mobile number or emailId is entered
     * */
    validation() {
        const { mobOrEmail, password, isForgotPasswordClicked } = this.state;
        try {
            let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            NetInfo.fetch().then(state => {
                // NetInfo.isConnected.fetch().then(isChromeConnected => { // This usage is depcreated in the new version
                status = state.isConnected ? 'online' : 'offline'
                if (mobOrEmail.includes('@')) {
                    if (reg.test(mobOrEmail)) {
                        if (isForgotPasswordClicked) {
                            if (status === 'online') {
                                this.setState({ isLoading: true })
                                this.forgotPasswordAPICall(mobOrEmail)
                            } else {
                                Constants.showSnack(this.state.translation_common[this.state.Language].No_Internet)
                            }

                        } else {
                            if (password !== '') {
                                if (password.length >= 6) {
                                    if (status === 'online') {
                                        this.setState({ isLoading: true })
                                        this.loginNetworkCall(mobOrEmail, password)
                                    } else {
                                        Constants.showSnack(this.state.translation_common[this.state.Language].No_Internet)
                                    }

                                } else {
                                    Constants.showSnack(this.state.translation_common[this.state.Language].Password_Character)
                                }
                            } else {
                                Constants.showSnack(this.state.translation_common[this.state.Language].Enter_Password)
                            }
                        }

                    } else {
                        Constants.showSnack(this.state.translation_common[this.state.Language].ValidMobOr_Email)
                    }
                } else {
                    let isnum = /^\d+$/.test(mobOrEmail);
                    if (isnum) {
                        if (mobOrEmail.length >= 10) {
                            if (isForgotPasswordClicked) {
                                if (status === 'online') {
                                    this.setState({ isLoading: true })
                                    this.forgotPasswordAPICall(mobOrEmail)
                                } else {
                                    Constants.showSnack(this.state.translation_common[this.state.Language].No_Internet)
                                }
                            } else {
                                if (password !== '') {
                                    if (password.length >= 6) {
                                        this.setState({ isLoading: true })
                                        let result = this.loginNetworkCall(mobOrEmail, password)
                                    } else {
                                        Constants.showSnack(this.state.translation_common[this.state.Language].Password_Character)
                                    }
                                } else {
                                    Constants.showSnack(this.state.translation_common[this.state.Language].Enter_Password)
                                }
                            }
                        } else {
                            Constants.showSnack(this.state.translation_common[this.state.Language].ValidMobOr_Email)
                        }
                    } else {
                        Constants.showSnack(this.state.translation_common[this.state.Language].ValidMobOr_Email)
                    }
                }
            })
        } catch (e) {
            //console.log(e);
        }
    }

    /**
     * signIn api call
     * */
    loginNetworkCall(mobOrEmail, password) {
        let url = Constants.BASE_URL_V2 + Service.LOGIN;
        let inputData = {
            username: mobOrEmail,
            password: password,
            language: this.state.Language
        }
        axios.post(url, inputData, {
            timeout: Constants.TIMEOUT,
        }).then(response => {
            this.setState({ isLoading: false })
            if (response.data.status === 200) {
                if (response.data.hasOwnProperty('api_key')) {
                    Constants.saveKey("api_key", response.data.api_key)
                }
                let language = response.data.user_info.language;
                let firstName = response.data.user_info.firstname;
                let lastName = response.data.user_info.lastname;
                let email = response.data.user_info.email;
                let profileImage = response.data.user_info.photo;
                let mobile = response.data.user_info.mobile;
                let countryCode = response.data.user_info.countryCode
                Constants.saveKey('Language', language);
                global.language = language;
                global.profileImage = profileImage;
                Constants.saveKey('firstName', firstName);
                Constants.saveKey('lastName', lastName);
                Constants.saveKey('emailId', email);
                let profileName = firstName + ' ' + lastName;
                Constants.saveKey("profileName", profileName);
                Constants.saveKey('mobile', mobile);
                Constants.saveKey('countryCode', countryCode);


                /** setting pepsico User  and set streak data */
                let access_code = response.data.user_info.access_code
                if (!access_code) {
                    /** user domain 1 and if access code note available then shows popup for code on home screen*/
                    Constants.saveKey('Domains', JSON.stringify(response.data.domains))
                }
                else if (response.data.hasOwnProperty('domains') && response.data.domains == 1 && access_code) {
                    /** user domain 1 and if access code available then user is pepsico user */
                    Constants.saveKey('Domains', JSON.stringify(response.data.domains))
                    if (access_code != 'skip') {
                        Constants.saveKey('isPepsicoUser', '1')
                    }
                }
                if (response.data.hasOwnProperty('current_streak')) {
                    let streak = response.data.current_streak;
                    Constants.saveKey('CurrentStreak', JSON.stringify(streak))
                }
                Constants.saveKey('UserInfo', JSON.stringify(response.data.user_info))

                if (this.state.webSurvey == false) {
                    this.resetStack();
                }
                else {

                    let newUrl = this.state.url;
                    if (Platform.OS == 'ios') {
                        if (newUrl.indexOf("deep_link_id=")) {
                            newUrl = (newUrl.replace(new RegExp('.*' + "deep_link_id="), ''));
                        }
                    }
                    newUrl = decodeURIComponent(newUrl);
                    const id = this.getParameterByName("mission", newUrl)
                    const name = this.getParameterByName("name", newUrl)
                    this.setState({ url: '', webSurvey: false });
                    Constants.saveKey('webUrl', "");
                    //this.props.navigation.navigate('SurveyBox', {missionId: id, missionName: name, from: 'home'})
                    // const resetAction = StackActions.reset({
                    //     index: 0,
                    //     actions: [NavigationActions.navigate({ routeName: 'SurveyBox', params: { missionId: id, missionName: name, from: 'home' } })],
                    // });
                    // this.props.navigation.dispatch(resetAction);
                    const resetAction = CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'SurveyBox', params: { missionId: id, missionName: name, from: 'home' } }],
                    });
                    this.props.navigation.dispatch(resetAction);

                }
            } else {
                Constants.showSnack(response.data.message)
            }

        }).catch((error) => {
            this.setState({ isLoading: false })
            Constants.showSnack(error.response.data.message)

        });
    }

    /**
     * Handle forgotPassword click
     */
    forgotPassword() {
        const { isForgotPasswordClicked } = this.state;
        if (isForgotPasswordClicked) {
            this.setState({ isForgotPasswordClicked: false })
        } else {
            this.setState({ isForgotPasswordClicked: true })
        }
    }

    /**
     * set login button name based on user action
     * @param if user clicked "Forgot Password" then update button name to "Reset Password" , if they dont keep it as "Login"
     * */
    setLoginButtonName() {
        if (this.state.isForgotPasswordClicked) {
            return this.state.translation[this.state.Language].Reset_Password
        } else {
            return this.state.translation[this.state.Language].Login
        }

    }

    /**
     * set forgot password text name based on user action
     * @param if user clicked "Forgot Password" then update text name to "Sign in" , if they dont keep it as "Forgot Password"
     * */
    setForgotTextName() {
        if (this.state.isForgotPasswordClicked) {
            return this.state.translation[this.state.Language].Signin
        } else {
            return this.state.translation[this.state.Language].Forgot_Password
        }

    }

    /**
     * Post user mail to server to get response from forgot API
     * @param mobOrEmail - pass user entered mobile number to email address
     * */
    forgotPasswordAPICall(mobOrEmail) {
        let url = Constants.BASE_URL_V2 + Service.FORGOTPASSWORD;
        let inputData = {
            username: mobOrEmail,
        }
        axios.post(url, inputData, {
            timeout: Constants.TIMEOUT,
        }).then(response => {
            this.setState({ isLoading: false })
            if (response.data.status === 200) {
                // this.setState({ isForgotPasswordClicked: false, password: '' })
                // Constants.showIndefiniteSnack(this.state.translation[this.state.Language].Forgot_Password_Msg)
                Constants.showIndefiniteSnack(this.state.translation[this.state.Language].ResetPassword_Sucess_Msg)

            } else {
                Constants.showIndefiniteSnack(response.data.message);
            }
        }).catch((error) => {
            this.setState({ isLoading: false })
            // Constants.showSnack(error.response.data.message);
            Constants.showIndefiniteSnack(this.state.translation_common[this.state.Language].InValid_User)

        });
    }

    /**
     * reset navigation stack
     * */
    resetStack() {
        this.checkNetworkSpeed()
        if (Platform.OS == 'ios') {
            // create a RNFS path
            var path = RNFS.DocumentDirectoryPath
            Constants.saveKey('rnfspath', path);

            //const { params } = this.props.navigation.state;
            const { params } = this.props.route;
            let toProfile = params ? params.toProfile : false;
            if (toProfile) {
                RNFS.mkdir(path)
                    .then((result) => {
                        // const resetAction = StackActions.reset({
                        //     index: 0,
                        //     actions: [NavigationActions.navigate({ routeName: 'ProfileScreen' })],
                        // });
                        // this.props.navigation.dispatch(resetAction);
                        const resetAction = CommonActions.reset({
                            index: 0,
                            routes: [{ name: 'ProfileScreen' }],
                        });
                        this.props.navigation.dispatch(resetAction);
                    })
                    .catch((err) => {
                        // Constants.showSnack('Unable to create storage dir. Functions may not work as expected.')
                        // const resetAction = StackActions.reset({
                        //     index: 0,
                        //     actions: [NavigationActions.navigate({ routeName: 'ProfileScreen' })],
                        // });
                        // this.props.navigation.dispatch(resetAction);
                        const resetAction = CommonActions.reset({
                            index: 0,
                            routes: [{ name: 'ProfileScreen' }],
                        });
                        this.props.navigation.dispatch(resetAction);
                    })

            } else {
                RNFS.mkdir(path)
                    .then((result) => {
                        // const resetAction = StackActions.reset({
                        //     index: 0,
                        //     actions: [NavigationActions.navigate({ routeName: 'TabContainerBase' })],
                        // });
                        // this.props.navigation.dispatch(resetAction);
                        const resetAction = CommonActions.reset({
                            index: 0,
                            routes: [{ name: 'TabContainerBase' }],
                        });
                        this.props.navigation.dispatch(resetAction);
                    })
                    .catch((err) => {
                        // console.warn('err', err)
                        //Constants.showSnack('Unable to create storage dir. Functions may not work as expected.')
                        // const resetAction = StackActions.reset({
                        //     index: 0,
                        //     actions: [NavigationActions.navigate({ routeName: 'TabContainerBase' })],
                        // });
                        // this.props.navigation.dispatch(resetAction);
                        const resetAction = CommonActions.reset({
                            index: 0,
                            routes: [{ name: 'TabContainerBase' }],
                        });
                        this.props.navigation.dispatch(resetAction);
                    })

            }
        }
        else {
            // create a RNFS path
            var path = RNFS.DocumentDirectoryPath;
            Constants.saveKey('rnfspath', path);
            RNFS.mkdir(path)
                .then((result) => {

                    // const resetAction = StackActions.reset({
                    //     index: 0,
                    //     actions: [NavigationActions.navigate({ routeName: 'TabContainerBase' })],
                    // });
                    // this.props.navigation.dispatch(resetAction);
                    const resetAction = CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'TabContainerBase' }],
                    });
                    this.props.navigation.dispatch(resetAction);
                })
                .catch((err) => {

                    //Constants.showSnack('Unable to create storage dir. Functions may not work as expected.')
                    // const resetAction = StackActions.reset({
                    //     index: 0,
                    //     actions: [NavigationActions.navigate({ routeName: 'TabContainerBase' })],
                    // });
                    // this.props.navigation.dispatch(resetAction);
                    const resetAction = CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'TabContainerBase' }],
                    });
                    this.props.navigation.dispatch(resetAction);
                })
        }

    }

    checkNetworkSpeed = async () => {
        try {
            const networkSpeed = await measureConnectionSpeed();
            if (networkSpeed.finalspeed < 2.1) {
                global.isSlowNetwork = true
            }
            else {
                global.isSlowNetwork = false
            }
        } catch (err) {
            global.isSlowNetwork = false
        }
    }

    /**
     * navigate to TermsAndPolicy page
     */
    goToTermsAndPolicyScreen = (type) => {
        let title = ''
        if (type === 'terms') {
            title = this.state.translation[this.state.Language].Terms_of_service
        } else {
            title = this.state.translation[this.state.Language].Privacy_Policy
        }

        this.props.navigation.navigate('TermsAndPolicy', { title: title })
    }

    /**
     * navigate to Signup page
     */
    goToSignUp = () => {
        this.props.navigation.navigate('SignUp');
    }

    /** Class render method */
    render() {
        if (this.state.translation.length < 1) {
            return (
                <ActivityIndicator style={{ alignSelf: 'center', flex: 1, justifyContent: 'center' }}
                    size="large"
                    color={Color.colorDarkBlue} />
            )
        }
        const { height } = Dimensions.get('window');
        const { languagelist, Language } = this.state;

        return (
            <SafeAreaView style={Style.styles.safeAreaWhite}
                edges={['right', 'left']}
                forceInset={{ bottom: 'never', top: Platform.OS === 'ios' ? height === 812 ? 0 : 0 : 0 }}>
                <StatusBar
                    barStyle={Platform.OS === 'android' ? 'light-content' : 'dark-content'}
                    hidden={true}
                    backgroundColor={Platform.OS === 'android' ? 'rgba(52, 52, 52, 0.8)' : Color.colorWhite}
                    translucent={false} />

                <ImageBackground source={require('../../images/login/signup_bg.jpg')}
                    style={styles.viewContainer}>

                    <KeyboardAvoidingView style={{ flex: 1 }} {...(Platform.OS === 'ios' && { behavior: 'padding' })}>
                        <ScrollView>
                            <View style={styles.topOverLay}>
                                {/*logo*/}
                                <Image
                                    style={styles.logo}
                                    source={eolasLogo}
                                    resizeMode='contain'
                                />

                                {/*Title*/}
                                <Text style={styles.titleText}>{this.state.translation[this.state.Language].welcome}</Text>


                                {/* mob/email*/}
                                <View style={styles.inputView}>
                                    <TextInput
                                        style={styles.InputText}
                                        value={this.state.mobOrEmail}
                                        numberOfLines={1}
                                        autoCapitalize='none'
                                        underlineColorAndroid={Color.colorWhite}
                                        placeholderTextColor={Color.colorLitGrey}
                                        returnKeyType="next"
                                        placeholder={this.state.translation[this.state.Language].Mobile_Email}
                                        placeholderColor={Color.colorLitGrey}
                                        selectionColor={'black'}
                                        keyboardType={"default"}
                                        onSubmitEditing={() => !this.state.isForgotPasswordClicked ? this.password.focus() : null}
                                        onChangeText={mobOrEmail => this.setState({ mobOrEmail: mobOrEmail.trim() })} />

                                </View>

                                {/* Password*/}
                                {!this.state.isForgotPasswordClicked ?
                                    <View style={[
                                        styles.inputView,
                                        {
                                            flexDirection: 'row',
                                            justifyContent: 'space-between'
                                        }]}>
                                        <View style={{ flex: 1 }}>
                                            <TextInput
                                                style={styles.InputText}
                                                value={this.state.password}
                                                secureTextEntry={this.state.currentTextSecure}
                                                numberOfLines={1}
                                                autoCapitalize='none'
                                                underlineColorAndroid={Color.colorWhite}
                                                returnKeyType="go"
                                                placeholder={this.state.translation[this.state.Language].Password}
                                                placeholderTextColor={Color.colorLitGrey}
                                                placeholderColor={Color.colorLitGrey}
                                                selectionColor={'black'}
                                                keyboardType={"default"}
                                                ref={(input) => this.password = input}
                                                onChangeText={password => this.setState({ password })} />
                                        </View>
                                        <TouchableOpacity style={{ justifyContent: 'center' }}
                                            onPress={() => this.state.currentTextSecure ? this.setState({ currentTextSecure: false }) : this.setState({ currentTextSecure: true })}>
                                            <View style={{ flex: 0.1, justifyContent: 'center' }}>

                                                <Image
                                                    style={styles.eyeImage}
                                                    source={this.state.currentTextSecure ? require('../../images/profile/eye_invisible.png') : require('../../images/profile/eye_visible.png')}
                                                />

                                            </View>
                                        </TouchableOpacity>
                                    </View> : null}

                                {/*SignIn*/}
                                <TouchableOpacity style={styles.loginButtonColor}
                                    onPress={() => this.validation()}>
                                    {this.state.isLoading ? <ActivityIndicator
                                        style={styles.progress}
                                        color='#ffffff' size={'small'} /> :
                                        <Text style={styles.loginText}>{this.setLoginButtonName()}</Text>}
                                </TouchableOpacity>
                                {/*Forgot password*/}
                                <TouchableOpacity onPress={() => this.forgotPassword()}>
                                    <Text style={[styles.forgotText]}>{this.setForgotTextName()}</Text>
                                </TouchableOpacity>

                                {/*register*/}
                                <TouchableOpacity
                                    onPress={() => this.goToSignUp()}>
                                    <Text style={[styles.forgotText]}>{this.state.translation[this.state.Language].Register_new_account}</Text>
                                </TouchableOpacity>

                                {/* Language select */}
                                <View style={{ marginTop: 16 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        {Platform.OS == 'ios' ? <RNPickerSelect
                                            items={languagelist}
                                            onValueChange={(Language) => this.selectlanguage(Language)}
                                            placeholder={{
                                                label: 'Language',
                                                value: '',
                                            }}
                                            hideIcon={true}
                                            style={{ ...pickerSelectStylesConditions }}
                                            value={(Language)}
                                            ref={el => {
                                                this.Refs.languageIOSPicker = el;
                                            }}
                                        /> :
                                            <Picker
                                                ref={e => this.picker = e}
                                                mode={'dialog'}
                                                selectedValue={this.state.Language}
                                                style={styles.language}
                                                onValueChange={(lan, itemIndex) => this.selectlanguage(lan)}>
                                                {this.state.languagelist.map(l => (
                                                    <Picker.Item label={l} value={l} />
                                                ))}
                                            </Picker>}

                                        <TouchableOpacity
                                            onPress={() => Platform.OS == 'ios' && this.Refs.languageIOSPicker.togglePicker()}
                                            activeOpacity={activeOpacityForIOSPicker}>
                                            <Image
                                                source={Downarrow}
                                                style={styles.dayDownArrow} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* {Platform.OS == 'ios' ?
                                    <TouchableOpacity style={[styles.pickerFullViewIos]} onPress={() => this.Refs.languageIOSPicker.togglePicker()} activeOpacity={activeOpacityForIOSPicker}>
                                        <View flex={1}>
                                            <RNPickerSelect
                                                items={languagelist}
                                                onValueChange={(Language) => this.selectlanguage(Language)}
                                                placeholder={{
                                                    label: 'Language',
                                                    value: '',
                                                }}
                                                hideIcon={true}
                                                style={{ ...pickerSelectStylesConditions }}
                                                value={(Language)}
                                                ref={el => {
                                                    this.Refs.languageIOSPicker = el;
                                                }}

                                            />
                                        </View>

                                        <Image
                                            source={Downarrow}
                                            style={styles.dayDownArrow} />

                                    </TouchableOpacity>
                                    : <View style={{ width: '40%', flexDirection: 'row' }}>
                                        <Picker
                                            ref={e => this.picker = e}
                                            mode={'dialog'}
                                            selectedValue={this.state.Language}
                                            style={[styles.language, { flex: 1 }]}
                                            onValueChange={(lan, itemIndex) => this.selectlanguage(lan)}>
                                            {this.state.languagelist.map(l => (
                                                <Picker.Item label={l} value={l} />
                                            ))
                                            }
                                        </Picker>
                                        <TouchableOpacity
                                            onPress={() => this.picker.togglePicker()}
                                        >
                                            <Image
                                                style={{ position: 'absolute', margin: 22, right: -25, height: 10, width: 10 }}
                                                source={Downarrow}

                                            />
                                        </TouchableOpacity>


                                    </View>} */}


                                {/*bottomView*/}
                                <View style={styles.overlay}>
                                    <Text style={styles.termsOfServiceText}>{this.state.translation[this.state.Language].Eolas_International}</Text>
                                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                        <TouchableOpacity style={{ flex: 1, alignItems: 'flex-end' }} onPress={() => this.goToTermsAndPolicyScreen('terms')}><Text
                                            style={styles.termsOfServiceText}>{this.state.translation[this.state.Language].Terms_of_service}</Text></TouchableOpacity>
                                        <Text
                                            style={[styles.termsOfServiceText, { alignSelf: 'center' }]}>{String.termsOfServiceVertitcal}</Text>
                                        <TouchableOpacity style={{ flex: 1, alignItems: 'flex-start' }} onPress={() => this.goToTermsAndPolicyScreen('policy')}><Text
                                            style={styles.termsOfServiceText}>{this.state.translation[this.state.Language].Privacy_Policy}</Text></TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </ImageBackground>
            </SafeAreaView >
        )
    }

}

export default SignIn

/** UI styles used for this class */
const styles = ScaledSheet.create({
    //mainView
    viewContainer: {
        flex: 1,
        width: '100%'
    },
    //topOverLay
    topOverLay: {
        flex: 1,
        width: '100%',
        alignItems: 'center'
    },
    //logo
    logo: {
        alignSelf: 'center',
        // width: 152.8,
        // height: 74.5,
        width: '60%',
        height: 100,
        marginTop: 50,
        marginBottom: 50
    },

    //Title
    titleText: {
        color: Color.colorWhite,
        fontWeight: 'bold',
        fontSize: Dimension.bigeText,
        alignSelf: 'center',
        textAlign: 'center',
        fontFamily: Font.fontRobotoBold,
        marginBottom: Dimension.marginTen,
    },


    //textInput fields
    InputText: {
        fontSize: Dimension.normalText,
        alignSelf: 'stretch',
        textAlign: 'left',
        fontWeight: 'normal',
        margin: 0,
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 10,
        paddingRight: 10,
        color: Color.colorBlack,
        backgroundColor: Color.colorWhite,
    },
    inputView: {
        backgroundColor: Color.colorWhite,
        alignSelf: 'stretch',
        borderRadius: Dimension.radius,
        marginLeft: '30@s',
        marginRight: '30@s',
        marginTop: Dimension.marginTwenty,
        //flexDirection: 'row',
        //justifyContent: 'space-between'
    },
    eyeImage: {
        width: 21,
        height: 15,
        alignSelf: 'center',
        marginRight: 15
    },
    //Login
    loginButtonColor: {
        backgroundColor: Color.colorDarkBlue,
        borderColor: Color.colorWhite,
        height: '45@vs',
        paddingLeft: Dimension.marginTwenty,
        paddingRight: Dimension.marginTwenty,
        borderRadius: 22,
        borderWidth: 2,
        justifyContent: 'center',
        marginTop: Dimension.marginThirty,
        marginBottom: Dimension.marginTen
    },
    loginText: {
        fontSize: Dimension.mediumText,
        color: Color.colorWhite,
        paddingLeft: Dimension.marginThirty,
        paddingRight: Dimension.marginThirty,
        fontFamily: Font.fontSansSemiBold
    },
    //Forgot password
    forgotText: {
        color: Color.colorWhite,
        textAlign: 'center',
        alignSelf: 'center',
        fontSize: Dimension.mediumText,
        marginTop: Dimension.marginTwenty,

    },
    //bottomView
    overlay: {
        width: '98%',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Dimension.marginTwenty,
        marginTop: 60,
    },
    termsOfServiceText: {
        color: Color.colorWhite,
        fontSize: Dimension.normalText,
        //alignSelf: 'center',
    },
    language: {
        width: 150,
        //marginLeft: '5%',
        color: Color.colorWhite,
        fontSize: Dimension.smallText,
        backgroundColor: 'transparent'
    },

    //ActivityIndicator
    progress: {
        paddingLeft: 42,
        paddingRight: 42,
    },
    renderprogress: {
        paddingLeft: 42,
        paddingRight: 42,
        position: 'absolute',
    },
    pickerFullViewIos: {
        // marginTop: 16,
        // width: '30%',
        // marginLeft: '20%',
        // flex: 1,
    },
    dayDownArrow: {
        //position: 'absolute',
        width: 10,
        height: 10,
        marginLeft: 5,
        marginTop: 2
        // marginRight: 8,
        // alignSelf: 'flex-end',
        // marginTop: 5,
        // right: 35,
    }

})
const pickerSelectStylesConditions = ScaledSheet.create({
    inputIOS: {
        // fontSize: 16,
        // height: 40,
        // alignSelf: 'stretch',
        // paddingTop: 0,
        // marginRight: 10,
        // borderRadius: Dimension.radius,
        width: '100%',
        // marginRight:'30%',
        color: 'white',
        //marginTop:5,
        // backgroundColor:'transparent'
    }
});