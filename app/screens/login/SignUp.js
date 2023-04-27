import React, { Component } from 'react';
import {
    View,
    Text,
    ImageBackground,
    StatusBar,
    Platform,
    TextInput,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions, ActivityIndicator,
    KeyboardAvoidingView,
    Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { ScaledSheet } from 'react-native-size-matters';
import RNPickerSelect from "react-native-picker-select";
import { Picker } from '@react-native-community/picker';
import * as Style from '../../style/Styles';
import * as Color from '../../style/Colors';
import * as Dimension from '../../style/Dimensions';
import * as String from '../../style/Strings';
//import { NavigationActions, SafeAreaView, StackActions } from "react-navigation";
import { CommonActions } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Switch } from 'react-native-switch';
import * as Font from '../../style/Fonts';
import * as Constants from '../../utils/Constants';
import axios from 'axios';
import { TextInputMask } from 'react-native-masked-text';
import * as Service from "../../utils/Api";
import DeviceInfo from 'react-native-device-info'
import * as RNLocalize from "react-native-localize";
import CountryPicker, {
    getAllCountries
} from 'react-native-country-picker-modal'
import RNFS from "react-native-fs";

let thumbValue = false;
let status;
let profileName;
const eolasLogo = require('../../images/login/eolas_logo_new_1.png');
const Downarrow = require('../../images/login/down-arrow.png');
let activeOpacityForIOSPicker = 0.8

/** signup class */
class SignUp extends Component {
    constructor(props) {
        super(props);

        //let userLocaleCountryCode = DeviceInfo.getDeviceCountry()
        // const userCountryData = getAllCountries()
        //     .filter(country => Constants.countryList.includes(country.cca2))
        //     .filter(country => country.cca2 === userLocaleCountryCode)
        //     .pop() 
        let userLocaleCountryCode = RNLocalize.getCountry()
        const userCountryData = this.getUserCountry()

        let callingCode = null
        let cca2 = userLocaleCountryCode
        if (!cca2 || !userCountryData) {
            cca2 = 'US'
            callingCode = '+1'
        } else {
            callingCode = `+${userCountryData.callingCode}`
        }
        this.Refs = {
            genderIOSPicker: null,
            countryIOSPicker: null,
            stateIOSPicker: null,
            cityIOSPicker: null,
            employeeIOSPicker: null,
            languageIOSPicker: null
        };
        this.state = {
            firstName: '',
            lastName: '',
            emailId: '',
            mobileNo: '',
            countryCode: callingCode,
            dob: "",
            password: '',
            thumb: false,
            opacityText: 0.4,
            isSet: true,
            signInBtn: false,
            switchDisable: false,
            isLoading: false,
            isModalShowing: false,
            cca2,
            gender: '',
            countries: [],
            country: '',
            states: [],
            state: '',
            cities: [],
            city: '',
            job: '',
            currentTextSecure: true,
            confirmpasswordTextSecure: true,
            confirmpassword: '',
            Language: global.language,
            languagelist: Platform.OS == 'ios' ? Constants.languages : [],
            translation: Platform.OS == 'ios' ? Constants.signin : [],
            translation_common: Constants.common_text,
            showCountryCode: false
        }

    }

    /** getting user country from device settings*/
    getUserCountry = () => {
        //let userLocaleCountryCode = DeviceInfo.getDeviceCountry()
        let userLocaleCountryCode = RNLocalize.getCountry()
        getAllCountries().then(countryData => {
            return countryData && countryData
                .filter(country => Constants.countryList.includes(country.cca2))
                .filter(country => country.cca2 === userLocaleCountryCode)
                .pop()
        })
    }

    /** component life cycle methods */
    UNSAFE_componentWillMount() {
        this.getpagetranslation()
        this.getlanguagelist()
    }
    componentDidUpdate() {
        StatusBar.setHidden(true);
    }
    componentDidMount() {
        const { navigation } = this.props;
        this.focusListener = navigation.addListener("focus", () => {
            StatusBar.setHidden(true);
        });
        this.getCountries();
    }
    componentWillUnmount() {
        this.focusListener();
    }

    /**
     * Get selected language page translation data from api
     */
    getpagetranslation() {
        NetInfo.fetch().then(state => {
            let status = state.isConnected ? "online" : "offline";
            if (status === "online") {
                let url = Constants.BASE_URL + Service.TRANSLATION_PAGE + 'signup';
                axios.get(url).then(response => {
                    this.setState({ translation: response.data.data });
                })
                    .catch((error) => {
                        this.setState({ translation: Constants.signup });
                    });
            }
            else {
                this.setState({ translation: Constants.signup });
            }
        })
    }

    /**
     * Get translation language list from api
     */
    getlanguagelist() {
        NetInfo.fetch().then(state => {
            let status = state.isConnected ? "online" : "offline";
            if (status === "online") {
                let url = Constants.BASE_URL + Service.LANGUAGES
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
     * Select language
     * @param {array} lan - Handle Language cahnge 
     */
    selectlanguage(lan) {
        if (lan) {
            this.setState({ Language: lan }, () => {
                this.getCountries();
            })
            // global.language=lan;
            Constants.saveKey('Language', lan)
        }
    }

    /**
     * check all the fields are not empty and enable button
     * */
    checkRegister(editValue, hintValue) {
        if (hintValue === 4) {
            // this.setState({ mobileNo: editValue.replace(/^0+/, '') });
            this.setState({ mobileNo: editValue });
        } else if (hintValue === 3) {
            this.setState({ emailId: editValue.trim() });
        } else if (hintValue === 7) {
            this.setState({ dob: editValue });
        } else if (hintValue === 2) {
            this.setState({ lastName: editValue });
        } else if (hintValue === 1) {
            this.setState({ firstName: editValue });
        } else if (hintValue === 10) {
            this.setState({ gender: editValue })
        } else if (hintValue === 11) {
            this.setState({ country: editValue })
            //this.getStates(editValue);
        } else if (hintValue === 12) {
            this.setState({ state: editValue })
            //this.getCities(editValue);
        } else if (hintValue === 13) {
            this.setState({ city: editValue })
        } else if (hintValue === 14) {
            this.setState({ job: editValue })
        } else if (hintValue === 5) {
            if (editValue === true) {
                thumbValue = true;
            } else {
                thumbValue = false;
            }
            this.setState({ thumb: editValue });
        } else if (hintValue === 6) {
            this.setState({ password: editValue });
        } else if (hintValue === 8) {
            this.setState({ countryCode: editValue });
        } else if (hintValue === 9) {
            this.setState({ confirmpassword: editValue });
        }

        if (Platform.OS == 'ios') {
            if (this.state.firstName !== '' && this.state.lastName !== '' && this.state.emailId !== '' && thumbValue === true && this.state.password !== ''
                && this.state.confirmpassword !== '') {
                if (this.state.firstName.length !== 1 && this.state.emailId.length !== 1 && this.state.password.length !== 1
                ) {
                    this.setState({ opacityText: 1, isSet: false })
                } else {
                    this.setState({ opacityText: 0.4, isSet: true })
                }
            } else {
                this.setState({ opacityText: 0.4, isSet: true })
            }
        }
        else {
            if (this.state.firstName !== '' && this.state.lastName !== '' && this.state.emailId !== '' && this.state.mobileNo !== '' && this.state.countryCode !== '' && this.state.dob !== '' && thumbValue === true
                && this.state.password !== '' && this.state.confirmpassword !== '') {
                if (this.state.firstName.length !== 1 && this.state.emailId.length !== 1 && this.state.mobileNo.length !== 1 && this.state.dob.length !== 1 && this.state.password.length !== 1
                    && this.state.countryCode.length !== 1) {
                    this.setState({ opacityText: 1, isSet: false })
                } else {
                    this.setState({ opacityText: 0.4, isSet: true })
                }
            } else {
                this.setState({ opacityText: 0.4, isSet: true })
            }
        }
    }


    /**
     * validation for all signup fields
     * */
    validation() {
        if (Platform.OS == 'ios') {
            try {
                let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                NetInfo.fetch().then(nstate => {
                    status = nstate.isConnected ? 'online' : 'offline';
                    const { firstName, lastName, emailId, mobileNo, countryCode, dob, password, gender, country, state, city, job, confirmpassword } = this.state;
                    if (firstName !== '') {
                        if (lastName !== '') {
                            if (emailId !== '') {
                                if (reg.test(emailId) === true) {
                                    if (password !== '') {
                                        if (confirmpassword !== '') {
                                            if (password.length >= 6) {
                                                if (password === confirmpassword) {
                                                    if (country !== '') {
                                                        if (state !== '') {
                                                            //if(city !== '') {
                                                            try {
                                                                if (status === 'online') {
                                                                    this.setState({ isLoading: true })
                                                                    this.makeDisable();
                                                                    this.signUpRegister(firstName, lastName, emailId, mobileNo, countryCode, dob, password, gender, country, state, city, job)
                                                                } else {
                                                                    Constants.showSnack(this.state.translation_common[this.state.Language].No_Internet)
                                                                }
                                                            } catch (error) {
                                                            }

                                                            //} else {
                                                            //	Constants.showSnack(this.state.translation[this.state.Language].Select_City)
                                                            //}
                                                        } else {
                                                            Constants.showSnack(this.state.translation[this.state.Language].Select_State)
                                                        }
                                                    }
                                                    else {
                                                        Constants.showSnack(this.state.translation[this.state.Language].Select_Country)
                                                    }
                                                } else {
                                                    Constants.showSnack(this.state.translation_common[this.state.Language].Password_Validation)
                                                }

                                            } else {
                                                Constants.showSnack(this.state.translation_common[this.state.Language].Password_Character)
                                            }
                                        } else {
                                            Constants.showSnack(this.state.translation_common[this.state.Language].Enter_Confirmpassword)
                                        }

                                    } else {
                                        Constants.showSnack(this.state.translation_common[this.state.Language].Enter_Password)
                                    }


                                } else {
                                    Constants.showSnack(this.state.translation[this.state.Language].Valid_Email)
                                }

                            } else {
                                Constants.showSnack(this.state.translation_common[this.state.Language].Enter_Email)
                            }

                        } else {
                            Constants.showSnack(this.state.translation_common[this.state.Language].Enter_LastName)
                        }
                    } else {
                        Constants.showSnack(this.state.translation_common[this.state.Language].Enter_FirstName)
                    }
                })
            } catch (e) {

            }

        }
        else {
            try {
                let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                NetInfo.fetch().then(nstate => {
                    status = nstate.isConnected ? 'online' : 'offline';
                    const { firstName, lastName, emailId, mobileNo, countryCode, dob, password, gender, country, state, city, job, confirmpassword } = this.state;
                    if (firstName !== '') {
                        if (lastName !== '') {
                            if (emailId !== '') {
                                if (reg.test(emailId) === true) {
                                    if (countryCode !== '') {
                                        if (mobileNo.length > 0) {
                                            if (dob !== '') {
                                                if (this.dob.isValid()) {
                                                    if (password !== '') {
                                                        if (confirmpassword !== '') {
                                                            if (password.length >= 6) {
                                                                if (password === confirmpassword) {
                                                                    if (gender !== '') {
                                                                        if (country !== '') {
                                                                            if (state !== '') {
                                                                                //if(city !== '') {
                                                                                //if(job !== '') {
                                                                                try {
                                                                                    if (status === 'online') {
                                                                                        this.setState({ isLoading: true })
                                                                                        this.makeDisable();
                                                                                        this.signUpRegister(firstName, lastName, emailId, mobileNo, countryCode, dob, password, gender, country, state, city, job)
                                                                                    } else {
                                                                                        Constants.showSnack(this.state.translation_common[this.state.Language].No_Internet)
                                                                                    }
                                                                                } catch (error) {
                                                                                }
                                                                                //}

                                                                                //else{
                                                                                //	Constants.showSnack(this.state.translation[this.state.Language].Select_Job_Status)
                                                                                //}
                                                                                //}
                                                                                //else{
                                                                                //	Constants.showSnack(this.state.translation[this.state.Language].Select_City)
                                                                                //}
                                                                            }
                                                                            else {
                                                                                Constants.showSnack(this.state.translation[this.state.Language].Select_State)
                                                                            }
                                                                        }
                                                                        else {
                                                                            Constants.showSnack(this.state.translation[this.state.Language].Select_Country)
                                                                        }
                                                                    } else {
                                                                        Constants.showSnack(this.state.translation[this.state.Language].Select_Gender)
                                                                    }
                                                                } else {
                                                                    Constants.showSnack(this.state.translation_common[this.state.Language].Password_Validation)
                                                                }

                                                            } else {
                                                                Constants.showSnack(this.state.translation_common[this.state.Language].Password_Character)
                                                            }
                                                        } else {
                                                            Constants.showSnack(this.state.translation_common[this.state.Language].Enter_Confirmpassword)
                                                        }

                                                    } else {
                                                        Constants.showSnack(this.state.translation_common[this.state.Language].Enter_Password)
                                                    }
                                                } else {
                                                    Constants.showSnack(this.state.translation_common[this.state.Language].Enter_ValidDate)
                                                }

                                            } else {
                                                Constants.showSnack(this.state.translation_common[this.state.Language].Enter_Dob)
                                            }
                                        } else {
                                            Constants.showSnack(this.state.translation_common[this.state.Language].Enter_MobNo)
                                        }

                                    } else {
                                        Constants.showSnack(this.state.translation_common[this.state.Language].Enter_Country_Code)
                                    }
                                } else {
                                    Constants.showSnack(this.state.translation[this.state.Language].Valid_Email)
                                }

                            } else {
                                Constants.showSnack(this.state.translation_common[this.state.Language].Enter_Email)
                            }

                        } else {
                            Constants.showSnack(this.state.translation_common[this.state.Language].Enter_LastName)
                        }
                    } else {
                        Constants.showSnack(this.state.translation_common[this.state.Language].Enter_FirstName)
                    }
                })
            } catch (e) {

            }

        }
    }



    /**
     * signUpRegister api call
     * */
    async signUpRegister(firstName, lastName, emailId, mobNo, countryCode, dob, password, gender, country, state, city, job) {
        try {
            let url = Constants.BASE_URL_V2 + Service.REGISTER;

            let inputData = {}
            if (Platform.OS == 'ios') {
                inputData = {
                    'firstname': firstName,
                    'lastname': lastName,
                    'email': emailId,
                    'password': password,
                    'country': country.toString(),
                    'state': state.toString(),
                    'city': city ? city : '',
                    'language': this.state.Language
                }
            }
            else {
                // Date of birth 
                let date = this.state.dob.split('/');
                let newDate = date[2] + "-" + date[1] + "-" + date[0];//(yy/mm/dd)

                inputData = {
                    'firstname': firstName,
                    'lastname': lastName,
                    'email': emailId,
                    'mobile': mobNo,
                    'countryCode': countryCode,
                    'DateOfBirth': newDate,
                    'password': password,
                    'gender': gender,
                    'country': country,
                    'state': state,
                    'city': city ? city : '',
                    'job': job,
                    'language': this.state.Language
                }
            }

            axios.post(url, inputData, {
                timeout: Constants.TIMEOUT,
            }).then(response => {
                this.setState({ isLoading: false })
                this.makeDisable();
                if (response.data.status === 201) {
                    Constants.showIndefiniteSnack('Email Verification link has been sent to your registered address.');
                    this.props.navigation.navigate('SignIn');
                } else {

                    Constants.showSnack(response.data.message)
                }

            }).catch((error) => {
                this.setState({ isLoading: false })
                this.makeDisable();
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
     * disable switch and signIn
     * */
    makeDisable() {
        if (this.state.isLoading) {
            this.setState({ switchDisable: true, signInBtn: true })
        } else {
            this.setState({ switchDisable: false, signInBtn: false })
        }

    }

    /**
     * reset stack
     * */
    resetStack() {
        // create a RNFS path
        var path = RNFS.DocumentDirectoryPath
        var android_path = path.substring(0, path.lastIndexOf("/") + 1);
        if (Platform.OS === 'android') {
            Constants.saveKey('rnfspath', android_path);
        } else if (Platform.OS === 'ios') {
            Constants.saveKey('rnfspath', path);
        }

        if (Platform.OS == 'ios') {
            // const resetAction = StackActions.reset({
            //     index: 0,
            //     actions: [NavigationActions.navigate({
            //         routeName: 'SignIn',
            //         params: { toProfile: true, email: this.state.emailId, password: this.state.password }
            //     })],
            // });
            // this.props.navigation.dispatch(resetAction);
            const resetAction = CommonActions.reset({
                index: 0,
                routes: [{
                    name: 'SignIn',
                    params: { toProfile: true, email: this.state.emailId, password: this.state.password }
                }],
            });
            this.props.navigation.dispatch(resetAction);
        }
        else {
            // const resetAction = StackActions.reset({
            //     index: 0,
            //     actions: [NavigationActions.navigate({
            //         routeName: 'ProfileScreen',
            //         params: { profileName: profileName, fromSignUp: true }
            //     })],
            // });
            // this.props.navigation.dispatch(resetAction);
            const resetAction = CommonActions.reset({
                index: 0,
                routes: [{
                    name: 'ProfileScreen',
                    params: { profileName: profileName, fromSignUp: true }
                }],
            });
            this.props.navigation.dispatch(resetAction);
        }

    }

    /**
     * navigate to TermsAndPolicy page
     */
    goToTermsAndPolicyScreen = () => {
        this.props.navigation.navigate('TermsAndPolicy', { title: this.state.translation[this.state.Language].Terms_Service })
    }

    /**
    * Get countries list
    */
    getCountries() {
        try {
            let url = Constants.BASE_URL + Service.COUNTRIES + '?language=' + this.state.Language;
            // let url = Constants.BASE_URL + Service.COUNTRIES;
            axios.get(url, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: Constants.TIMEOUT,
            }).then(response => {
                if (response.data.status === 200) {
                    let tempCountries = [];
                    let dataCountries = response.data.list;
                    for (let i = 0; i < dataCountries.length; i++) {
                        let tempObj = {
                            label: '',
                            value: ''
                        }
                        tempObj.label = dataCountries[i].name;
                        tempObj.value = dataCountries[i].id;
                        tempCountries.push(tempObj);
                    }
                    this.setState({
                        countries: tempCountries
                    })
                }
            }).catch(error => {
                // console.log('error', error)
            })
        } catch (err) {
        }
    }

    /**
   * Get States based on selected Country
   * @param {Number} id Country ID
   */
    getStates(id) {
        try {
            let url = Constants.BASE_URL + Service.STATES + id;
            axios.get(url, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: Constants.TIMEOUT,
            }).then(response => {
                if (response.data.status === 200) {
                    let tempStates = [];
                    let dataStates = response.data.list;
                    for (let i = 0; i < dataStates.length; i++) {
                        let tempObj = {
                            label: '',
                            value: ''
                        }
                        tempObj.label = dataStates[i].name;
                        tempObj.value = dataStates[i].id;
                        tempStates.push(tempObj);
                    }
                    this.setState({
                        states: tempStates
                    })
                }

            }).catch(error => {
                // console.log('error', error)
            })
        } catch (err) {
        }
    }

    /**
    * Get Cities based on selected State
    * @param {Number} id State ID
    */
    getCities(id) {
        try {
            let url = Constants.BASE_URL + Service.CITIES + id;

            axios.get(url, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: Constants.TIMEOUT,
            }).then(response => {
                if (response.data.status === 200) {
                    let tempCities = [];
                    let dataCities = response.data.list;
                    for (let i = 0; i < dataCities.length; i++) {
                        let tempObj = {
                            label: '',
                            value: ''
                        }
                        tempObj.label = dataCities[i].name;
                        tempObj.value = dataCities[i].id;
                        tempCities.push(tempObj);
                    }
                    this.setState({
                        cities: tempCities
                    })
                }
            }).catch(error => {
                // console.log('error', error)
            })
        } catch (err) {

        }
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
        const { countries, country, states, state, cities, city, job, translation, Language, languagelist } = this.state;

        return (
            <SafeAreaView style={Style.styles.safeAreaWhite}
                edges={['right', 'left']}
                forceInset={{ bottom: 'never', top: Platform.OS === 'ios' ? height === 812 ? 0 : 0 : 0 }}>
                <StatusBar
                    barStyle={Platform.OS === 'android' ? 'light-content' : 'dark-content'}
                    hidden={true}
                    backgroundColor={Platform.OS === 'android' ? 'rgba(52, 52, 52, 0.8)' : Color.colorWhite}
                    translucent={false}
                    networkActivityIndicatorVisible={false} />
                <ImageBackground source={require('../../images/login/signup_bg.jpg')}
                    style={styles.viewContainer}>

                    <KeyboardAvoidingView style={{ flex: 1 }}
                        {...(Platform.OS === 'ios' && { behavior: 'padding' })} >
                        <ScrollView>
                            {/*logo*/}
                            <Image
                                style={styles.logo}
                                source={eolasLogo}
                            />

                            <View style={styles.topOverLay}>

                                {/*title*/}
                                <View style={styles.titleContainer}>
                                    <Text style={styles.newUserText} numberOfLines={1} adjustsFontSizeToFit={true}>{translation[Language].New_User_Sign_up}</Text>
                                </View>

                                {/*subText*/}
                                <TouchableOpacity style={styles.signInContainer}
                                    disabled={this.state.signInBtn}
                                    onPress={() => this.props.navigation.navigate('SignIn')}>
                                    <Text style={styles.signInText}>{translation[Language].Sign_In}</Text>
                                </TouchableOpacity>


                                {/*  firstName*/}
                                <View style={styles.inputView}>
                                    <TextInput
                                        style={styles.InputText}
                                        value={this.state.firstName}
                                        numberOfLines={1}
                                        underlineColorAndroid={Color.colorWhite}
                                        returnKeyType="next"
                                        placeholder={translation[Language].First_Name}
                                        placeholderColor={Color.colorLitGrey}
                                        placeholderTextColor={Color.colorLitGrey}
                                        selectionColor={'black'}
                                        keyboardType={"default"}
                                        onSubmitEditing={() => this.lastName.focus()}
                                        onKeyPress={() => this.checkRegister(this.state.firstName, 1)}
                                        onChangeText={firstName => this.checkRegister(firstName, 1)} />

                                </View>

                                {/*lastName*/}
                                <View style={styles.inputView}>
                                    <TextInput
                                        style={styles.InputText}
                                        value={this.state.lastName}
                                        numberOfLines={1}
                                        underlineColorAndroid={Color.colorWhite}
                                        returnKeyType="next"
                                        placeholder={translation[Language].Last_Name}
                                        placeholderColor={Color.colorLitGrey}
                                        placeholderTextColor={Color.colorLitGrey}
                                        selectionColor={'black'}
                                        keyboardType={"default"}
                                        ref={(input) => this.lastName = input}
                                        onSubmitEditing={() => this.emailId.focus()}
                                        onKeyPress={() => this.checkRegister(this.state.lastName, 2)}
                                        onChangeText={lastName => this.checkRegister(lastName, 2)} />

                                </View>

                                {/*emailId*/}
                                <View style={styles.inputView}>
                                    <TextInput
                                        style={styles.InputText}
                                        value={this.state.emailId}
                                        numberOfLines={1}
                                        autoCapitalize='none'
                                        underlineColorAndroid={Color.colorWhite}
                                        returnKeyType="next"
                                        placeholder={translation[Language].Email_ID}
                                        placeholderColor={Color.colorLitGrey}
                                        placeholderTextColor={Color.colorLitGrey}
                                        selectionColor={'black'}
                                        keyboardType={"email-address"}
                                        ref={(input) => this.emailId = input}
                                        //onSubmitEditing={() => this.countryCode.focus()}
                                        onKeyPress={() => this.checkRegister(this.state.emailId, 3)}
                                        onChangeText={emailId => this.checkRegister(emailId, 3)} />

                                </View>

                                {/*countryCode*/}
                                {Platform.OS == 'android' ? <View style={[styles.countryListView, {
                                    justifyContent: 'flex-start',
                                    alignItems: 'center',
                                    paddingLeft: 10,
                                    paddingRight: 10,
                                }]}>

                                    <CountryPicker
                                        styles={styles.countryListStyle}
                                        countryList={Constants.countryList}
                                        filterable={true}
                                        closeable={true}
                                        transparent={true}
                                        showCallingCode={true}
                                        filterPlaceholder={'Search'}
                                        onSelect={value => {
                                            this.setState({ cca2: value.cca2, countryCode: `+${value.callingCode[0]}` })
                                        }}
                                        cca2={this.state.cca2}
                                        translation="eng"
                                        onClose={() => { this.setState({ showCountryCode: false }) }}
                                        renderFlagButton={() => (
                                            <TouchableOpacity
                                                onPress={() => { this.setState({ showCountryCode: true }) }}
                                            >
                                                <Text style={[styles.countryCodeStyle]}>
                                                    {this.state.countryCode}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                        visible={this.state.showCountryCode}
                                    >
                                        {/* <Text style={[styles.countryCodeStyle]}>
                                            {this.state.countryCode}
                                        </Text> */}
                                    </CountryPicker>

                                    <TextInput
                                        style={[styles.InputText, { flex: 1 }]}
                                        value={this.state.mobileNo}
                                        numberOfLines={1}
                                        underlineColorAndroid={Color.colorWhite}
                                        returnKeyType="next"
                                        placeholder={translation[Language].Mobile}
                                        placeholderColor={Color.colorLitGrey}
                                        placeholderTextColor={Color.colorLitGrey}
                                        selectionColor={'black'}
                                        keyboardType={'phone-pad'}
                                        //onSubmitEditing={() => this.dob.focus()}
                                        onKeyPress={() => this.checkRegister(this.state.mobileNo, 4)}
                                        ref={(input) => this.mobileNo = input}
                                        onChangeText={mobileNo => this.checkRegister(mobileNo, 4)} />

                                </View> : null}

                                {/* dob */}
                                {Platform.OS == 'android' ? <View style={[styles.inputView]}>
                                    <TextInputMask
                                        style={[styles.InputText]}
                                        value={this.state.dob}
                                        numberOfLines={1}
                                        underlineColorAndroid={Color.colorWhite}
                                        returnKeyType="next"
                                        ref={(input) => this.dob = input}
                                        selectionColor={'black'}
                                        keyboardType={'phone-pad'}
                                        placeholder={translation[Language].DOB}
                                        placeholderColor={Color.colorLitGrey}
                                        placeholderTextColor={Color.colorLitGrey}
                                        onSubmitEditing={() => this.password.focus()}
                                        onKeyPress={() => this.checkRegister(this.state.dob, 7)}
                                        onChangeText={dob => this.checkRegister(dob, 7)}
                                        type={'datetime'}
                                        options={{
                                            format: 'DD/MM/YYYY'
                                        }}
                                    />
                                </View> : null}


                                {/*password*/}
                                <View style={styles.inputpassword}>
                                    <View flex={1} >
                                        <TextInput
                                            style={styles.InputText}
                                            value={this.state.password}
                                            onKeyPress={() => this.checkRegister(this.state.password, 6)}
                                            secureTextEntry={this.state.currentTextSecure}
                                            numberOfLines={1}
                                            autoCapitalize='none'
                                            underlineColorAndroid={Color.colorWhite}
                                            returnKeyType="go"
                                            placeholder={translation[Language].Password}
                                            placeholderColor={Color.colorLitGrey}
                                            placeholderTextColor={Color.colorLitGrey}
                                            selectionColor={'black'}
                                            keyboardType={"default"}
                                            ref={(input) => this.password = input}
                                            onChangeText={password => this.setState({ password })} />
                                    </View>
                                    <TouchableOpacity style={{ justifyContent: 'center' }}
                                        onPress={() => this.state.currentTextSecure ? this.setState({ currentTextSecure: false }) : this.setState({ currentTextSecure: true })}>
                                        <View flex={0.1} style={{ justifyContent: 'center' }}>

                                            <Image
                                                style={styles.eyeImage}
                                                source={this.state.currentTextSecure ? require('../../images/profile/eye_invisible.png') : require('../../images/profile/eye_visible.png')}
                                            />

                                        </View>
                                    </TouchableOpacity>

                                </View>

                                <View style={styles.inputpassword}>
                                    <View flex={1} >
                                        <TextInput
                                            style={styles.InputText}
                                            value={this.state.confirmpassword}
                                            onKeyPress={() => this.checkRegister(this.state.confirmpassword, 9)}
                                            secureTextEntry={this.state.confirmpasswordTextSecure}
                                            numberOfLines={1}
                                            autoCapitalize='none'
                                            underlineColorAndroid={Color.colorWhite}
                                            returnKeyType="go"
                                            placeholder={translation[Language].Confirm_Password}
                                            placeholderColor={Color.colorLitGrey}
                                            placeholderTextColor={Color.colorLitGrey}
                                            selectionColor={'black'}
                                            keyboardType={"default"}
                                            ref={(input) => this.confirmpassword = input}
                                            onChangeText={confirmpassword => this.setState({ confirmpassword })}

                                        />
                                    </View>
                                    <TouchableOpacity style={{ justifyContent: 'center' }}
                                        onPress={() => this.state.confirmpasswordTextSecure ? this.setState({ confirmpasswordTextSecure: false }) : this.setState({ confirmpasswordTextSecure: true })}>
                                        <View flex={0.1} style={{ justifyContent: 'center' }}>

                                            <Image
                                                style={styles.eyeImage}
                                                source={this.state.confirmpasswordTextSecure ? require('../../images/profile/eye_invisible.png') : require('../../images/profile/eye_visible.png')}
                                            />

                                        </View>
                                    </TouchableOpacity>

                                </View>



                                {/* start of android specific fields due to code split*/}
                                {/* Gender dropDown */}

                                {Platform.OS == 'android' ? <View style={styles.inputView}>
                                    <Picker
                                        style={{ color: this.state.gender === '' ? Color.colorServiceText : Color.colorPlaceHolder }}
                                        selectedValue={this.state.gender}
                                        onValueChange={(gender) => this.checkRegister(gender, 10)}
                                        mode="dropdown">
                                        {/* <Picker.Item value='' label={translation[Language].Gender} /> */}
                                        <Picker.Item value='' color={Color.colorOrange} label={translation[Language].Select_Gender} />
                                        {translation[Language].Gender_List && translation[Language].Gender_List.map((item, key) => (<Picker.Item
                                            label={item.label}
                                            value={item.value}
                                            color={Color.colorBlack}
                                            key={key} />)
                                        )}
                                    </Picker>
                                </View> : null}


                                {Platform.OS == 'ios' ?
                                    <TouchableOpacity style={[styles.pickerFullViewIos, styles.inputView]} onPress={() => this.Refs.countryIOSPicker.togglePicker()} activeOpacity={activeOpacityForIOSPicker}>
                                        <View flex={1}>
                                            <RNPickerSelect
                                                items={countries}
                                                onValueChange={(country) => this.checkRegister(country, 11)}
                                                placeholder={{
                                                    label: translation[Language].Country,
                                                    value: '',
                                                }}
                                                hideIcon={true}
                                                style={{ ...pickerSelectStylesConditions }}
                                                value={(country)}
                                                ref={el => {
                                                    this.Refs.countryIOSPicker = el;
                                                }}

                                            />
                                        </View>

                                        <Image
                                            source={require('../../images/profile/down_arrow.png')}
                                            style={styles.dayDownArrow} />

                                    </TouchableOpacity>

                                    : <View style={styles.inputView}>
                                        <Picker
                                            style={{ color: country === '' ? Color.colorServiceText : Color.colorPlaceHolder }}
                                            selectedValue={parseInt(country)}
                                            onValueChange={(country) => { this.checkRegister(country, 11) }}
                                            mode="dropdown">
                                            {/* <Picker.Item value='' label={translation[Language].Country} /> */}
                                            <Picker.Item value='' color={Color.colorOrange} label={translation[Language].Select_Country} />
                                            {countries.map((item, key) => (<Picker.Item
                                                label={item.label}
                                                value={item.value}
                                                color={Color.colorBlack}
                                                key={key} />)
                                            )}
                                        </Picker>
                                    </View>}

                                <View style={styles.inputView}>
                                    <TextInput
                                        style={styles.InputText}
                                        value={this.state.state}
                                        numberOfLines={1}
                                        autoCapitalize='none'
                                        underlineColorAndroid={Color.colorWhite}
                                        returnKeyType="next"
                                        placeholder={translation[Language].State}
                                        placeholderColor={Color.colorLitGrey}
                                        placeholderTextColor={Color.colorLitGrey}
                                        selectionColor={'black'}
                                        keyboardType={"default"}
                                        ref={(input) => this.states = input}
                                        onKeyPress={() => this.checkRegister(this.state.state, 12)}
                                        onChangeText={state => this.checkRegister(state, 12)} />

                                </View>

                                {/* <View style={styles.inputView}>
                                    <Picker
                                        style={{ color: state === '' ? Color.colorServiceText : Color.colorPlaceHolder }}
                                        selectedValue={parseInt(state)}
                                        onValueChange={(state) => { this.checkRegister(state, 12) }}
                                        mode="dropdown"
										key={states.length}>
                                        <Picker.Item value='' label={translation[Language].State} />
                                        {states.map((item, key) => (<Picker.Item
                                            label={item.label}
                                            value={item.value}
                                            key={key} />)
                                        )}
                                    </Picker>
                                </View> */}

                                {/*
                                <View style={styles.inputView}>
                                    <Picker
                                        style={{ color: city === '' ? Color.colorServiceText : Color.colorPlaceHolder }}
                                        selectedValue={parseInt(city)}
                                        onValueChange={(city) => { this.checkRegister(city, 13) }}
                                        mode="dropdown"
										key={cities.length}>
                                        <Picker.Item value='' label={translation[Language].City} />
                                        {cities.map((item, key) => (<Picker.Item
                                            label={item.label}
                                            value={item.value}
                                            key={key} />)
                                        )}
                                    </Picker>
                                </View> */

                                }

                                <View style={styles.inputView}>
                                    <TextInput
                                        style={styles.InputText}
                                        value={this.state.city}
                                        numberOfLines={1}
                                        autoCapitalize='none'
                                        underlineColorAndroid={Color.colorWhite}
                                        returnKeyType="next"
                                        placeholder={translation[Language].City}
                                        placeholderColor={Color.colorLitGrey}
                                        placeholderTextColor={Color.colorLitGrey}
                                        selectionColor={'black'}
                                        keyboardType={"default"}
                                        ref={(input) => this.city = input}
                                        onKeyPress={() => this.checkRegister(this.state.city, 13)}
                                        onChangeText={city => this.checkRegister(city, 13)} />

                                </View>


                                { /*<View style={styles.inputView}>
                                    <Picker
                                        style={{ color: this.state.job === 'Employment status' ? Color.colorServiceText : Color.colorPlaceHolder }}
                                        selectedValue={job}
                                        onValueChange={job => this.checkRegister(job, 14)}
                                        mode="dropdown">
										<Picker.Item value='' label={translation[Language].Employment_Status} />
                                        {translation[Language].Employment_List.map((item, key) => (<Picker.Item
                                            label={item.label}
                                            value={item.value}
                                            key={key} />)
                                        )}
                                    </Picker>

                                </View> */ }


                                {/* End of android specific fields */}

                                {/*terms and condition*/}
                                <View style={styles.termsContainer}>
                                    <Switch
                                        value={this.state.thumb}
                                        onValueChange={(val) => this.checkRegister(val, 5)}
                                        disabled={this.state.switchDisable}
                                        circleSize={18}
                                        barHeight={22}
                                        circleBorderWidth={0}
                                        backgroundActive={Color.colorDarkBlue}
                                        backgroundInactive={'gray'}
                                        circleActiveColor={Color.colorWhite}
                                        circleInActiveColor={Color.colorWhite}
                                        changeValueImmediately={true}
                                        innerCircleStyle={{
                                            alignItems: "center",
                                            justifyContent: "center",
                                            borderColor: Color.colorWhite,
                                            borderWidth: 2
                                        }} // style for inner animated circle for what you (may) be rendering inside the circle
                                        outerCircleStyle={{
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }} // style for outer animated circle
                                        renderActiveText={false}
                                        renderInActiveText={false}
                                        switchLeftPx={2} // denominator for logic when sliding to TRUE position. Higher number = more space from RIGHT of the circle to END of the slider
                                        switchRightPx={2} // denominator for logic when sliding to FALSE position. Higher number = more space from LEFT of the circle to BEGINNING of the slider
                                        switchWidthMultiplier={2.4} // multipled by the `circleSize` prop to calculate total width of the Switch
                                    />

                                    <TouchableOpacity onPress={() => this.goToTermsAndPolicyScreen()}><Text style={styles.agreeText}>{translation[Language].Agree_Terms_Conditions}</Text></TouchableOpacity>
                                </View>


                                {/*register*/}
                                <TouchableOpacity style={[styles.regButtonColor, { opacity: this.state.opacityText }]}
                                    disabled={this.state.isSet}
                                    onPress={() => this.validation()}>
                                    {this.state.isLoading ? <ActivityIndicator
                                        style={styles.progress}
                                        color='#ffffff' size={'small'} /> :
                                        <Text style={styles.registerText}>{translation[Language].Register}</Text>}
                                </TouchableOpacity>

                                {/* Language select */}
                                {Platform.OS == 'ios' ? <TouchableOpacity style={[styles.pickerFullViewIoslanguage]} onPress={() => this.Refs.languageIOSPicker.togglePicker()} activeOpacity={activeOpacityForIOSPicker}>
                                    <View flex={1}>
                                        <RNPickerSelect
                                            items={languagelist}
                                            onValueChange={(Language) => this.selectlanguage(Language)}
                                            placeholder={{
                                                label: 'Language',
                                                value: '',
                                            }}
                                            hideIcon={true}
                                            style={{ ...pickerSelectLanguage }}
                                            value={(Language)}
                                            ref={el => {
                                                this.Refs.languageIOSPicker = el;
                                            }}

                                        />
                                    </View>

                                    <Image
                                        source={Downarrow}
                                        style={styles.DownArrowlanguage} />
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
                                                style={{ position: 'absolute', margin: 22, right: -18, height: 10, width: 10 }}
                                                source={Downarrow}

                                            />
                                        </TouchableOpacity>


                                    </View>}

                                {/*bottomView*/}
                                <View style={styles.border} />
                                <View style={styles.overlay}>
                                    <Text
                                        style={[styles.termsOfServiceText, { marginTop: Dimension.marginTen }]}>{translation[Language].Eolas_International}</Text>
                                    <Text
                                        style={[styles.termsOfServiceText, { marginBottom: Dimension.marginTen }]}>{translation[Language].Terms_Service}</Text>
                                </View>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </ImageBackground>
            </SafeAreaView>
        )
    }

}

export default SignUp

/** UI styles used for this class */
const styles = ScaledSheet.create(
    {
        //mainView
        viewContainer: {
            flex: 1,
            width: '100%'
        },
        //topOverLay
        topOverLay: {
            flex: 1,
            width: '100%',
            alignItems: 'center',
            justifyContent: "flex-end",
        },
        //logo
        logo: {
            alignSelf: 'center',
            width: 152.8,
            height: 74.5,
            marginTop: 60,
            marginBottom: 10
        },
        //titleContainer
        titleContainer: {
            // backgroundColor: Color.colorDarkBlue,
            // borderColor: Color.colorWhite,
            height: '44@vs',
            paddingLeft: Dimension.marginTen,
            paddingRight: Dimension.marginTen,
            //borderRadius: Dimension.radiusLarge,
            // borderWidth: 2,
            justifyContent: 'center',
            marginTop: Dimension.marginTwenty
        },
        //title
        newUserText: {
            color: Color.colorWhite,
            fontSize: Dimension.bigeText,
            fontWeight: 'bold',
            alignSelf: 'center'
        },
        //SignInContainer
        signInContainer: {
            backgroundColor: Color.colorLitGrey,
            borderColor: Color.colorWhite,
            paddingLeft: Dimension.marginFourty,
            paddingRight: Dimension.marginFourty,
            borderRadius: Dimension.radiusLarge,
            paddingBottom: 3,
            paddingTop: 2,
            borderWidth: 2,
            justifyContent: 'center',
            marginTop: Dimension.marginTwenty,
            marginBottom: Dimension.marginTwenty
        },
        signInText: {
            color: Color.colorWhite,
            fontSize: Dimension.smallText
        },
        countryListStyle: {
            flex: 1,
            paddingLeft: 10,
            paddingRight: 10,
            alignSelf: 'stretch',
            textAlign: 'left',
            fontWeight: 'normal',
        },
        //textInput fields
        countryCodeStyle: {
            width: 50,
            fontSize: Dimension.normalText,
            alignSelf: 'stretch',
            textAlign: 'left',
            fontWeight: 'normal',
            paddingTop: Platform.OS === 'ios' ? 10 : 15,
            paddingBottom: Platform.OS === 'ios' ? 10 : 15,
            color: 'black',
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
            marginTop: 15
        },
        inputpassword: {
            backgroundColor: Color.colorWhite,
            alignSelf: 'stretch',
            borderRadius: Dimension.radius,
            marginLeft: '30@s',
            marginRight: '30@s',
            marginTop: 15,
            flexDirection: 'row',
            justifyContent: 'space-between'
        },
        eyeImage: {
            width: 21,
            height: 15,
            alignSelf: 'center',
            marginRight: 15
        },
        countryListView: {
            flexDirection: 'row',
            backgroundColor: Color.colorWhite,
            alignSelf: 'stretch',
            borderRadius: Dimension.radius,
            marginLeft: '30@s',
            marginRight: '30@s',
            marginTop: 15
        },
        //terms and condition
        termsContainer: {
            flexDirection: 'row',
            marginTop: 25,
            paddingLeft: '10%',
            paddingRight: '10%',
            width: '100%'
        },
        agreeText: {
            color: Color.colorWhite,
            fontSize: Dimension.mediumText,
            alignSelf: 'center',
            marginLeft: Dimension.marginTen,
            textDecorationLine: 'underline'
        },
        //register
        regButtonColor: {
            backgroundColor: Color.colorDarkBlue,
            borderColor: Color.colorWhite,
            height: '43@vs',
            paddingLeft: Dimension.marginTwenty,
            paddingRight: Dimension.marginTwenty,
            borderRadius: Dimension.radiusLarge,
            borderWidth: 2,
            justifyContent: 'center',
            marginTop: Dimension.marginFourty
        },
        registerText: {
            color: Color.colorWhite,
            fontSize: Dimension.largeText,
            alignSelf: 'center',
            paddingLeft: Dimension.marginTwenty,
            paddingRight: Dimension.marginTwenty,
            fontFamily: Font.fontSansSemiBold
        },
        //borderLine
        border: {
            alignSelf: 'stretch',
            backgroundColor: Color.colorGrey,
            height: 4,
            marginTop: 70
        },
        //bottomView
        overlay: {
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'stretch',
            backgroundColor: Color.colorWhite,
        },
        termsOfServiceText: {
            color: Color.colorLitGrey,
            fontSize: Dimension.normalText,
            alignSelf: 'center'
        },
        //ActivityIndicator
        progress: {
            paddingLeft: 42,
            paddingRight: 42
        },
        textInputTitle: {
            fontSize: Dimension.smallText,
            color: Color.colorRed,
            textAlign: 'left',
            paddingLeft: 5,
        },
        language: {
            width: '100%',
            marginLeft: '5%',
            color: Color.colorWhite,
            fontSize: Dimension.smallText,
            backgroundColor: 'transparent'
        },
        pickerFullViewIos: {
            marginTop: 16,
            height: 42,
            backgroundColor: Color.colorWhite,
            paddingLeft: 10,
            flexDirection: 'row',
            alignItems: 'center',
            marginLeft: 22 + '@s',
            marginRight: 22 + '@s',
            flex: 1,
            borderRadius: 5,
        },
        dayDownArrow: {
            width: 13,
            height: 9,
            marginRight: 8,
            alignSelf: 'center',
            marginTop: 5
        },
        pickerFullViewIoslanguage: {
            marginTop: 16,
            width: '30%',
            marginLeft: '20%',
            flex: 1,
        },
        DownArrowlanguage: {
            position: 'absolute',
            width: 10,
            height: 10,
            marginRight: 8,
            alignSelf: 'flex-end',
            marginTop: 5,
            right: 35,
        }
    }
);
const pickerSelectStylesConditions = ScaledSheet.create({
    inputIOS: {
        fontSize: 16,
        height: 40,
        alignSelf: 'stretch',
        paddingTop: 0,
        marginRight: 10,
        borderRadius: Dimension.radius,
        color: Color.colorPlaceHolder
    },
});
const pickerSelectLanguage = ScaledSheet.create({
    inputIOS: {
        width: '100%',
        color: 'white',
    },
});