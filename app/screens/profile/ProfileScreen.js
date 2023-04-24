import React, { Component } from 'react';
import {
    View,
    Text,
    Platform,
    StatusBar,
    Image,
    TouchableOpacity,
    ScrollView, TextInput, Dimensions, ImageBackground, ActivityIndicator,
    Modal, TouchableHighlight, FlatList, Alert, Switch
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { ScaledSheet } from 'react-native-size-matters';
import * as Color from '../../style/Colors';
import * as String from '../../style/Strings';
import * as Style from '../../style/Styles';
// import { SafeAreaView, NavigationActions, StackActions } from "react-navigation";
import { CommonActions } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Font from '../../style/Fonts';
import * as Constants from '../../utils/Constants';
import RNPickerSelect from "react-native-picker-select";
import * as Dimension from '../../style/Dimensions';
import ImagePicker from 'react-native-customized-image-picker'
import { PermissionsAndroid } from 'react-native';
import axios from 'axios';
import * as Service from "../../utils/Api";
import { TextInputMask } from 'react-native-masked-text'
import DeviceInfo from "react-native-device-info";
import * as RNLocalize from "react-native-localize";
import CountryPicker, { getAllCountries } from 'react-native-country-picker-modal';
import { Picker } from '@react-native-community/picker';
import RNFS from "react-native-fs";
import DialogInput from "../../components/DialogInput"
import * as CAMERASTYLE from "../../style/Camera";
import ExpandableView from "../../components/ExpandableView";

const { height, width } = Dimensions.get('window');
const dropDownIcon = require('../../images/profile/down_arrow.png');

/** Status bar settings */
// const MyStatusBar = ({ backgroundColor, ...props }) => (
//     <View style={[styles.statusBar, { backgroundColor }]}>
//         <StatusBar translucent backgroundColor={backgroundColor} {...props} />
//     </View>
// );

let source;
let mFirstName;
let mLastName;
let mEmail;
let mMobile;
let mPassword;
let mCountryCode;
let mDOB;
let mBirthDate
let mDomain
let mContry
let mCity
let mState
let mGender
let mProfileName;
let mFromSignUp;
let status;
let activeOpacityForIOSPicker = 0.8

/** Profile class */
class ProfileScreen extends Component {
    constructor(props) {
        super(props)
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
            houseHoldSizeIOSPicker: null,
            childrenIOSPicker: null,
            languageIOSPicker: null
        };
        // const { params } = this.props.navigation.state;
        if (this.props.route) {
            const { params } = this.props.route
            mProfileName = params ? params.profileName : null;
            mFromSignUp = params ? params.fromSignUp : false;
        }

        this.state = {
            dateOfBirth: '',
            firstName: '',
            lastName: '',
            email: '',
            mobile: '',
            countryCode: callingCode,
            password: '',
            gender: Platform.OS == 'ios' ? 'Gender' : '',
            countries: [],
            country: '',
            states: [],
            state: '',
            cities: [],
            city: '',
            job: Platform.OS == 'ios' ? 'Employment status' : '',
            houseHoldSize: 'Size of Household',
            presenceOfKids: 'Children',
            onlinePurchase: false,
            convenience: false,
            allTheAbove: false,
            markets: false,
            backPress: false,
            imagePath: require('../../images/profile/user.png'),
            isDateTimePickerVisible: false,
            isLoading: true,
            image64: 'image',
            isBtnLoading: false,
            isLogoutLoading: false,
            textVisible: true,
            isLogoutText: true,
            apiDate: '',
            changeImage: false,
            value: '',
            ddResult: '',
            cca2,
            paypalEmail: '',
            Language: global.language,
            // translation: Platform.OS == 'ios' ? Constants.profile : [],
            // languagelist: Platform.OS == 'ios' ? Constants.profile : [],
            translation: Constants.profile,     //TODO open above link
            languagelist: Constants.languages,     //TODO open above link and check to pass language list
            translation_common: Constants.common_text,
            showCountryCode: false,
            modelVisible: false,
            offlineMissionList: [],
            isSurveySyncLoading: false,
            //enableOfflineBackup: false,
            //enableSetOffline: false,
            deleteProfileDialog: false,
            isPepsicodomain: 0,
            accessCode: '',    //pepsico user access code
        }

        this.getLocalData();

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
        setTimeout(() => {
            this.getUserData();
        }, 100);
    }

    componentDidMount() {
        // this.getpagetranslation()  //TODO uncomment translation
        this.getlanguagelist()
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
     * All text translation used for this screen
     */
    getpagetranslation() {
        NetInfo.fetch().then(state => {
            let status = state.isConnected ? "online" : "offline";
            if (status === "online") {
                let url = Constants.BASE_URL + Service.TRANSLATION_PAGE + 'profile';
                axios.get(url).then(response => {
                    this.setState({ translation: response.data.data });
                })
                    .catch((error) => {
                        this.setState({ translation: Constants.profile, languagelist: Constants.languages });
                    });
            }
            else {
                this.setState({ translation: Constants.profile, languagelist: Constants.languages });
            }
        })
    }

    /**
    *  Handling language change from picker
    * @param {array} lan - Handle Language cahnge 
    */
    selectlanguage(lan) {
        if (lan) {
            this.setState({ Language: lan }, () => {
                this.getCountries();
                // this.getStates(this.state.state);

                /** for update tabbar text change while change language
                 *  Call update component method and change language
                 */
                // this.props.navigation.setParams({ language: lan });
                this.props.navigation.dispatch(CommonActions.setParams({ language: lan }));
            })
        }
    }

    /**
     * Change handler for picker value change handler
     * @param evt - pass event value 
     * @param name - name for state value to change
     */
    changeHandler = (evt, name) => {
        this.setState({
            [name]: evt
        }, () => {
            if (evt === '' && evt !== null) {
                return false;
            }
            if (name === 'country') {
                // this.getStates(evt);
                // this.setState({
                //     state: '',
                //     city: ''
                // }, () => {
                //     this.getStates(evt);
                // })
            } else if (name === 'state') {
                // this.getCities(evt);
                // this.setState({
                //     city: ''
                // }, ()=> {
                //     this.getCities(evt);
                // });
            }
        })
    }

    /**
     * @param radioCount==1--> online purchase
     *         radioCount==2--> convenience
     *         radioCount==3--> markets
     *         radioCount==4--> All the above
     *
     * */
    checkRadio(radioCount) {
        if (radioCount === 1) {
            if (!this.state.onlinePurchase) {
                this.setState({ onlinePurchase: true })
                this.checkAllTheAbove();
            } else {
                this.setState({ onlinePurchase: false })
            }
        } else if (radioCount === 2) {
            if (!this.state.convenience) {
                this.setState({ convenience: true })
                this.checkAllTheAbove();
            } else {
                this.setState({ convenience: false })
            }
        } else if (radioCount === 3) {
            if (!this.state.markets) {
                this.setState({ markets: true })
                this.checkAllTheAbove();
            } else {
                this.setState({ markets: false })
            }
        } else {
            if (!this.state.allTheAbove) {
                this.setState({ allTheAbove: true, markets: false, convenience: false, onlinePurchase: false })
            } else {
                this.setState({ allTheAbove: false })
            }
        }
    }

    checkAllTheAbove() {
        if (this.state.allTheAbove) {
            this.setState({ allTheAbove: false })
        }
    }


    /**
     * get user data
     * @param mFromSignUp===true if profile screen from sign up otherwise false.(based on that we need to call imageProfile props initialized in tabContainer class)
     * */
    async getUserData() {
        this.setState({ isLoading: true })
        let api_key = await AsyncStorage.getItem('api_key');

        let profileImage = await AsyncStorage.getItem("profileImage");
        if (profileImage !== null && profileImage !== undefined) {
            let source = { uri: profileImage };
            this.setState({ imagePath: source });
        }

        let url = Constants.BASE_URL + Service.CUSTOMER;

        NetInfo.fetch().then(async (state) => {
            status = state.isConnected ? 'online' : 'offline';

            if (status === 'online' && global.isSlowNetwork != true) {
                axios.get(url, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Auth': api_key
                    },
                    timeout: Constants.TIMEOUT,
                }).then(response => {
                    this.setState({ isLoading: false });
                    if (response.data.status === 200) {
                        // Get Countries list
                        this.getCountries();
                        /** get and set badges that is  */
                        if (response.data.hasOwnProperty('badges')) {
                            let dataBadges = response.data.badges;
                            if (dataBadges.length > 0) {
                                Constants.saveKey('Badges', JSON.stringify(dataBadges))
                            }
                        }
                        else {
                            console.log("no domains");
                        }

                        if (response.data.hasOwnProperty('available_badges')) {
                            let dataBadges = response.data.available_badges;
                            if (dataBadges.length > 0) {
                                Constants.saveKey('AvailableBadges', JSON.stringify(dataBadges))
                            }
                        }
                        else {
                            console.log("no available_badges");
                        }

                        if (response.data.hasOwnProperty('current_streak')) {
                            let streak = response.data.current_streak;
                            Constants.saveKey('CurrentStreak', JSON.stringify(streak))
                        }
                        else {
                            console.log("no current_streak");
                        }


                        if (response.data.hasOwnProperty('user_info')) {
                            let result = response.data.user_info;
                            let dateOfBirth = result.DateOfBirth;
                            let city = result.cityName ? result.cityName : result.city ? result.city : '';
                            let country = result.country;
                            let state = result.state;
                            let education = result.education;
                            let email = result.email;
                            let countryCode = result.countryCode;
                            let firstname = result.firstname;
                            let lastname = result.lastname;
                            let gender = result.gender;
                            let job = result.job;
                            let mobile = result.mobile;
                            let personalPurchaseOption = result.personalPurchaseOption;
                            let photo = result.photo;
                            let presenceOfKids = result.presenceOfKids;
                            let sizeOfHouseHold = result.sizeOfHouseHold;
                            let source = { uri: photo };
                            let paypalEmail = result.paypalEmail;
                            let language = result.language;
                            let accessCode = result.access_code == 'skip' ? '' : result.access_code

                            if (country && country !== '') {
                                // this.getStates(country);
                            }
                            if (state && state !== '') {
                                // this.getCities(state);
                            }

                            if (photo != null && photo !== '') {
                                this.setState({ imagePath: source })
                                this.saveImageToRNFSLocal(photo)
                                if (this.props.imageProfile) {
                                    this.props.imageProfile();
                                }

                            } else {
                                this.setState({ imagePath: require('../../images/profile/user.png') })
                            }

                            /** checking is pepsico User */
                            let access_code = response.data.user_info.access_code
                            if (!access_code) {
                                /** user domain 1 and if access code note available then shows popup for code on home screen*/
                                this.setState({ isPepsicodomain: response.data.domains }, () => {
                                    Constants.saveKey('Domains', JSON.stringify(response.data.domains))
                                })
                            }
                            if (response.data.hasOwnProperty('domains') && response.data.domains == 1 && access_code) {
                                /** user domain 1 and if access code available then user is pepsico user */
                                this.setState({ isPepsicodomain: response.data.domains }, () => {
                                    Constants.saveKey('Domains', JSON.stringify(response.data.domains))
                                    if (access_code != 'skip') {
                                        Constants.saveKey('isPepsicoUser', '1')
                                    }
                                    if (this.props.handlePepsiCoUserData) {
                                        this.props.handlePepsiCoUserData()
                                    }
                                })
                            }
                            Constants.saveKey('UserInfo', JSON.stringify(result))
                            AsyncStorage.setItem('firstName', firstname);
                            AsyncStorage.setItem('lastName', lastname);
                            Constants.saveKey('emailId', email);
                            let profileName = firstname + ' ' + lastname;
                            AsyncStorage.setItem("profileName", profileName);

                            AsyncStorage.setItem('Language', language);
                            global.language = language;

                            if (this.props.profileNameUpdate) {
                                this.props.profileNameUpdate();
                            }


                            this.setState({
                                firstName: firstname,
                                lastName: lastname,
                                email: email,
                                paypalEmail: paypalEmail,
                                mobile: mobile.toString(),
                                countryCode: countryCode.toString(),
                                apiDate: dateOfBirth != null ? dateOfBirth : '',
                                gender: gender != null ? gender : Platform.OS == 'ios' ? 'Gender' : '',
                                country: country != null ? country : '',
                                state: state != null ? state : '',
                                city: city != null ? city : '',
                                job: job != null ? job : Platform.OS == 'ios' ? 'Employment status' : '',
                                houseHoldSize: sizeOfHouseHold != null ? sizeOfHouseHold : 'Size of Household',
                                presenceOfKids: presenceOfKids != null ? presenceOfKids : 'Children',
                                Language: language != null ? language : '',
                                accessCode: accessCode
                            }, () => {

                                // if (this.state.country !== '') {
                                //     this.getStates(this.state.country);
                                // }
                                // if (this.state.state !== '') {
                                //     this.getCities(this.state.state);
                                // }
                            })


                            /**
                             * change api date to display date format
                             * */
                            if (this.state.apiDate !== '') {
                                let date = this.state.apiDate.split('-');
                                let newDate = date[2] + "/" + date[1] + "/" + date[0];
                                this.setState({ dateOfBirth: newDate })
                            }

                            /**
                             * mode of purchase radio button selection handling
                             * */
                            if (personalPurchaseOption !== '' && personalPurchaseOption != null) {
                                if (personalPurchaseOption.indexOf(',') > -1) {
                                    let options = personalPurchaseOption.split(',');
                                    options.map((item) => {
                                        if (item === String.hyperMarket) {
                                            this.setState({ onlinePurchase: true })
                                        } else if (item === String.markets) {
                                            this.setState({ markets: true })
                                        } else if (item === String.convenience) {
                                            this.setState({ convenience: true })
                                        } else if (item === String.allTheAbove) {
                                            this.setState({
                                                allTheAbove: true,
                                                markets: false,
                                                convenience: false,
                                                onlinePurchase: false
                                            })
                                        }
                                    })
                                } else {
                                    if (personalPurchaseOption === String.hyperMarket) {
                                        this.setState({ onlinePurchase: true })
                                    } else if (personalPurchaseOption === String.markets) {
                                        this.setState({ markets: true })
                                    } else if (personalPurchaseOption === String.convenience) {
                                        this.setState({ convenience: true })
                                    } else if (personalPurchaseOption === String.allTheAbove) {
                                        this.setState({
                                            allTheAbove: true,
                                            markets: false,
                                            convenience: false,
                                            onlinePurchase: false
                                        })
                                    }
                                }
                            }


                        }
                    } else if (response.data.status === 401) {
                        Constants.showSnack(this.state.translation_common[this.state.Language].Session_Expired);
                        this.moveToSignInScreen()
                    }


                }).catch(error => {
                    this.setState({ isLoading: false })
                    this.getCountries();
                    if (error.response.status === 401) {
                        Constants.showSnack(this.state.translation_common[this.state.Language].Session_Expired);
                        this.moveToSignInScreen()
                    }
                })
            }
            else {
                this.getCountries();
                this.setState({ isLoading: false })
            }
        })
    }

    /**
     * Api call for gettting countries list
     */
    getCountries() {
        NetInfo.fetch().then(async (state) => {
            status = state.isConnected ? 'online' : 'offline';
            if (status === 'online' && global.isSlowNetwork != true) {
                let api_key = AsyncStorage.getItem('api_key');
                let url = Constants.BASE_URL + Service.COUNTRIES + '?language=' + this.state.Language;
                // let url = Constants.BASE_URL + Service.COUNTRIES;
                axios.get(url, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Auth': api_key
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
                        this.setState({ countries: tempCountries }, () => {
                            AsyncStorage.setItem('CountryList', JSON.stringify(tempCountries))
                        })
                    }
                }).catch(error => {
                    // console.log('error', error)
                })
            }
            else {
                let countryListOffline = await AsyncStorage.getItem("CountryList");
                if (countryListOffline) {
                    let listContry = countryListOffline && JSON.parse(countryListOffline)
                    this.setState({ countries: listContry.length > 0 ? listContry : [] })
                }
            }
        })
    }

    /**
     * Get States based on selected Country
     * @param {Number} id Country ID
     */
    getStates(id) {
        let api_key = AsyncStorage.getItem('api_key');
        let url = Constants.BASE_URL + Service.STATES + id;
        axios.get(url, {
            headers: {
                'Content-Type': 'application/json',
                'Auth': api_key
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
    }

    /**
     * Get Cities based on selected State
     * @param {Number} id State ID
     */
    getCities(id) {
        let api_key = AsyncStorage.getItem('api_key');

        let url = Constants.BASE_URL + Service.CITIES + id;

        axios.get(url, {
            headers: {
                'Content-Type': 'application/json',
                'Auth': api_key
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
    }

    /**
     * unused function
     */
    radioOptionPostFormat() {
        let mode = '';
        if (this.state.onlinePurchase) {
            mode = 'Online-Super/HyperMarket';
        }
        if (this.state.markets) {
            if (mode !== '') {
                mode = mode + "," + 'Markets';
            } else {
                mode = 'Markets';
            }
        }
        if (this.state.convenience) {
            if (mode !== '') {
                mode = mode + "," + 'Convenience';
            } else {
                mode = 'Convenience';
            }
        }
        if (this.state.allTheAbove) {
            mode = 'All of the above';
        }
        return mode;
    }

    /**
     * validate mandatory fields
     */
    validation() {
        let mode = this.radioOptionPostFormat();
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        const { firstName, lastName, email, dateOfBirth } = this.state;
        if (firstName) {
            if (lastName) {
                if (email) {
                    if (reg.test(email) === true) {
                        if (dateOfBirth) {
                            /*api date*/

                            let date = this.state.dateOfBirth.split('/');
                            let newDate = date[2] + "-" + date[1] + "-" + date[0];//(yy/mm/dd)
                            this.setState({ apiDate: newDate })

                            let date1 = this.myDateBirth.isValid();
                            if (date1) {
                                this.profileUpdateApi(mode);
                            } else {
                                Constants.showSnack(this.state.translation_common[this.state.Language].Enter_ValidDate)
                            }

                        } else {
                            this.profileUpdateApi(mode);
                        }


                    } else {
                        Constants.showSnack(this.state.translation_common[this.state.Language].Valid_Email)
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
    }

    /**
     * Profile update Api call
     * @param 'from' its either 'signUp' or 'Home' (to find if profile screen from sign up or home)
    * */
    async profileUpdateApi(mode) {
        let api_key = await AsyncStorage.getItem('api_key');
        let url = Constants.BASE_URL + Service.CUSTOMER;
        NetInfo.fetch().then(state => {
            status = state.isConnected ? 'online' : 'offline';
            if (status === 'online') {
                this.setState({ isBtnLoading: true, textVisible: false })

                let data = {
                    firstname: this.state.firstName,
                    lastname: this.state.lastName,
                    email: this.state.email,
                    paypalEmail: this.state.paypalEmail,
                    mobile: this.state.mobile,
                    countryCode: this.state.countryCode,
                    gender: this.state.gender,
                    country: this.state.country,
                    zipcode: '',
                    education: "EDU",
                    address: "address",
                    city: this.state.city,
                    state: this.state.state,
                    DateOfBirth: this.state.apiDate,
                    job: this.state.job,
                    sizeOfHouseHold: this.state.houseHoldSize,
                    presenceOfKids: this.state.presenceOfKids,
                    // personalPurchaseOption: mode,
                    imageType: "jpg",
                    image: this.state.image64 !== 'image' ? this.state.image64 : "",
                    language: this.state.Language
                };

                let data1 = {
                    firstname: this.state.firstName,
                    lastname: this.state.lastName,
                    email: this.state.email,
                    paypalEmail: this.state.paypalEmail,
                    mobile: this.state.mobile,
                    countryCode: this.state.countryCode,
                    gender: this.state.gender,
                    country: this.state.country,
                    state: this.state.state,
                    zipcode: '',
                    education: "EDU",
                    address: "address",
                    city: this.state.city,
                    DateOfBirth: this.state.apiDate,
                    job: this.state.job,
                    sizeOfHouseHold: this.state.houseHoldSize,
                    presenceOfKids: this.state.presenceOfKids,
                    language: this.state.Language
                    // personalPurchaseOption: mode,
                };

                axios.patch(url, this.state.changeImage ? data : data1, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Auth': api_key
                    },
                    timeout: Constants.TIMEOUT
                }).then(response => {

                    if (this.state.changeImage) {
                        this.saveImageToLocal(this.state.imagePath.uri);
                        if (this.props && this.props.imageProfile) {
                            this.props.imageProfile();
                        }
                    }

                    AsyncStorage.setItem('firstName', this.state.firstName);
                    AsyncStorage.setItem('lastName', this.state.lastName);
                    AsyncStorage.setItem('Language', this.state.Language);
                    AsyncStorage.setItem('mobile', this.state.mobile);
                    AsyncStorage.setItem('countryCode', this.state.countryCode);

                    let profileName = this.state.firstName + ' ' + this.state.lastName;
                    global.language = this.state.Language;
                    AsyncStorage.setItem("profileName", profileName);
                    if (this.props && this.props.profileNameUpdate) {
                        this.props.profileNameUpdate();
                    }

                    this.setState({ isBtnLoading: false, textVisible: true })
                    if (response.data.status === 200) {

                        Constants.showSnack('Profile updated')

                        this.setState({ changeImage: false })

                        setTimeout(() => {
                            this.resetStack()
                        }, 1000)

                    }

                }).catch((error) => {
                    this.setState({ isBtnLoading: false, textVisible: true })
                    if (error.response.data.hasOwnProperty("message")) {
                        Constants.showSnack(error.response.data.message)
                    }
                })


            } else {
                Constants.showSnack(this.state.translation_common[this.state.Language].No_Internet)
            }
        });

    }

    /**
     * Save image locally
     * @param {url} image - save profile image to local storage
     */
    saveImageToRNFSLocal(image) {
        let name = image;
        let filename = name.substring(name.lastIndexOf("/") + 1, name.length);
        let path_name = RNFS.DocumentDirectoryPath + "/" + filename;

        RNFS.downloadFile({
            fromUrl: image,
            toFile: path_name
        })
            .promise.then(res => {
                Constants.saveKey('profileImage', "file://" + path_name)
            })
            .catch(err => {
                //console.log("err downloadFile", err);
            });
    }

    /**
     * Save image in local storage
     * */
    saveImageToLocal(image) {
        Constants.saveKey('profileImage', image)
    }

    /** reset navigation stack */
    resetStack() {
        Constants.saveKey("from", 'Home');
        const resetAction = CommonActions.reset({
            index: 0,
            routes: [{ name: 'TabContainerBase' }],
        });
        this.props.navigation.dispatch(resetAction);

        // const resetAction = StackActions.reset({
        //     index: 0,
        //     actions: [NavigationActions.navigate({ routeName: 'TabContainerBase' })],
        // });
        // this.props.navigation.dispatch(resetAction);

    }

    /**
     * APi call for User Logout
     * Navigate to signup screen 
     */
    async logout() {
        const { translation, Language } = this.state;
        let expData = await AsyncStorage.getItem('offlineExport');
        let expSurveyData = JSON.parse(expData)
        expSurveyData = expSurveyData && expSurveyData.filter(function (obj) {
            return obj.isSynced == false;
        });
        if (expSurveyData && expSurveyData.length > 0) {
            /** warning for data lose if offline survey is available and try to logout */
            Alert.alert(
                translation[Language].LOGOUT,
                translation[Language].Logout_Message,
                [
                    { text: translation[Language].NO, onPress: () => { }, style: "cancel" },
                    { text: translation[Language].Yes, onPress: () => this.callLogoutApi() }
                ],
                { cancelable: false },
            );
        }
        else {
            this.callLogoutApi()
        }
    }

    callLogoutApi = async () => {
        let api_key = await AsyncStorage.getItem('api_key');
        let url = Constants.BASE_URL + Service.LOGOUT;

        NetInfo.fetch().then(state => {
            status = state.isConnected ? 'online' : 'offline';
            if (status === 'online') {
                this.setState({ isLogoutLoading: true, isLogoutText: false })
                axios.post(url, {}, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Auth': api_key
                    },
                    timeout: Constants.TIMEOUT
                }).then(response => {
                    this.setState({ isLogoutLoading: false, isLogoutText: true })

                    if (response.data.status === 200) {
                        Constants.showSnack(response.data.message);
                        this.moveToSignInScreen()
                    } else if (response.data.status === 401) {
                        Constants.showSnack(this.state.translation_common[this.state.Language].Session_Expired);
                        this.moveToSignInScreen()
                    }
                }).catch((error) => {
                    this.setState({ isLogoutLoading: false, isLogoutText: true })
                    if (error.response.data.hasOwnProperty("message")) {
                        Constants.showSnack(error.response.data.message)
                    }
                    if (error.response.data.hasOwnProperty("status") && error.response.data.status === 401) {
                        Constants.showSnack(this.state.translation_common[this.state.Language].Session_Expired);
                        this.moveToSignInScreen();
                    }
                })
            } else {
                Constants.showSnack(this.state.translation_common[this.state.Language].No_Internet)
                this.moveToSignInScreen();
            }
        });
    }

    moveToSignInScreen() {
        this.clear_appdata();
    }

    /**
     * clear local storage when user clicks logout or session expired
     */
    async clear_appdata() {
        global.mission_mount = false;
        global.isDownloadProgress = '';
        const path = await AsyncStorage.getItem("rnfspath");
        AsyncStorage.clear()
            .then(() => {
                RNFS.unlink(path)
                    .then(() => {
                        // const resetAction = StackActions.reset({
                        //     index: 0,
                        //     actions: [NavigationActions.navigate({ routeName: 'SignIn' })],
                        // });
                        // this.props.navigation.dispatch(resetAction);
                        const resetAction = CommonActions.reset({
                            index: 0,
                            routes: [{ name: 'SignIn' }],
                        });
                        this.props.navigation.dispatch(resetAction);
                    })
                    .catch((err) => {
                        // const resetAction = StackActions.reset({
                        //     index: 0,
                        //     actions: [NavigationActions.navigate({ routeName: 'SignIn' })],
                        // });
                        // this.props.navigation.dispatch(resetAction);
                        const resetAction = CommonActions.reset({
                            index: 0,
                            routes: [{ name: 'SignIn' }],
                        });
                        this.props.navigation.dispatch(resetAction);
                    });
            })
            .catch((err) => {
                RNFS.unlink(path)
                    .then(() => {
                        // const resetAction = StackActions.reset({
                        //     index: 0,
                        //     actions: [NavigationActions.navigate({ routeName: 'SignIn' })],
                        // });
                        // this.props.navigation.dispatch(resetAction);
                        const resetAction = CommonActions.reset({
                            index: 0,
                            routes: [{ name: 'SignIn' }],
                        });
                        this.props.navigation.dispatch(resetAction);
                    })
                    .catch((err) => {
                        // const resetAction = StackActions.reset({
                        //     index: 0,
                        //     actions: [NavigationActions.navigate({ routeName: 'SignIn' })],
                        // });
                        // this.props.navigation.dispatch(resetAction);
                        const resetAction = CommonActions.reset({
                            index: 0,
                            routes: [{ name: 'SignIn' }],
                        });
                        this.props.navigation.dispatch(resetAction);
                    });
            })
    }

    /** Delete user profile  */
    deleteProfile = () => {
        const { translation, Language, languagelist } = this.state;
        Alert.alert(
            translation[Language].Delete_Profile,
            translation[Language].Delete_Account,
            [
                { text: translation[Language].NO, onPress: () => { }, style: "cancel" },
                { text: translation[Language].Yes, onPress: () => this.deleteProfileYesAction() }
            ],
            { cancelable: false },
        );
    }
    /** delete user profile alert button action */
    deleteProfileYesAction() {
        this.setState({ deleteProfileDialog: true })
    }
    /** send input in alert of delete profile 
     *  send input for the DELETE confirmation
     */
    sendInput(inputText) {
        if (inputText && inputText.toLowerCase() == 'delete') {
            NetInfo.fetch().then(async (state) => {
                let status = state.isConnected ? "online" : "offline";
                if (status === "online") {
                    this.setState({ deleteProfileDialog: false })
                    let api_key = await AsyncStorage.getItem('api_key');
                    let url = Constants.BASE_URL + Service.CUSTOMER;

                    /** passed delete=1 in update profile api for delete profile */
                    let data = {
                        delete: 1,
                        email: this.state.email,
                    };

                    axios.patch(url, data, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Auth': api_key
                        },
                        timeout: Constants.TIMEOUT
                    }).then(response => {
                        if (response.data.status === 200) {
                            Constants.showSnack(response.data.message);
                            this.moveToSignInScreen()
                        } else if (response.data.status === 401) {
                            Constants.showSnack(this.state.translation_common[this.state.Language].Session_Expired);
                            this.moveToSignInScreen()
                        }
                    }).catch((error) => {
                        if (error.response.data.hasOwnProperty("message")) {
                            Constants.showSnack(error.response.data.message)
                        }
                    })
                }
                else {
                    Constants.showSnack(this.state.translation_common[this.state.Language].No_Internet)
                }
            })
        }
        else {
            Constants.showSnack(this.state.translation[this.state.Language].Delete_Profile_confirmation)
        }
    }

    /**
     * take photo with permission check
     * */
    async TakePhoto() {
        if (Platform.OS === 'android') {
            if (Platform.Version >= 33) {
                try {
                    const grantedCamera = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA,
                        {
                            'title': 'Camera Permission',
                            'message': 'Eolas needs to access your camera photos' +
                                'for your profile'
                        },
                    )
                    if (grantedCamera === PermissionsAndroid.RESULTS.GRANTED) {
                        this.cameraCall()
                    } else {
                        // console.log("permission denied")
                    }
                } catch (err) {
                    console.log(err)
                }
            }
            else if (Platform.Version >= 23 && Platform.Version < 33) {
                try {
                    const grantedCamera = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA,
                        {
                            'title': 'Camera Permission',
                            'message': 'Eolas needs to access your camera photos' +
                                'for your profile'
                        },
                    )
                    if (grantedCamera === PermissionsAndroid.RESULTS.GRANTED) {

                        const grantFile = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                            {
                                'title': 'Write File',
                                'message': 'Eolas needs to access your camera photos' +
                                    'for your profile'
                            },
                        )
                        if (grantFile === PermissionsAndroid.RESULTS.GRANTED) {

                            this.cameraCall()


                        } else {
                            // console.log("permission denied")
                        }

                    } else {
                        // console.log("permission denied")
                    }
                } catch (err) {
                    console.log(err)
                }
            } else {
                this.cameraCall()
            }
        } else {
            setTimeout(() => {
                this.cameraCall()
            }, Constants.GALLERY_DELAY)

        }
    }


    /**
     *Camera res handling
     * */
    cameraCall() {
        ImagePicker.openCamera({
            width: CAMERASTYLE.WIDTH,
            height: CAMERASTYLE.HEIGHT,
            includeBase64: true,
            compressQuality: CAMERASTYLE.COMPRESS_QUALITY,
            cropping: false,
        }).then(image => {
            this.setState({ changeImage: true })
            if (Platform.OS === 'android') {
                image.map(res => {
                    source = { uri: res.path };
                    this.setState({ imagePath: source, image64: res.data })
                })
            } else {
                // source = { uri: image.path }
                // this.setState({ imagePath: source, image64: image.data })
                source = { uri: image[0].path }
                this.setState({ imagePath: source, image64: image[0].data })
            }

        })
            .catch(error => {
                if (error === "E_PERMISSION_MISSING") {
                    // Do stuff...`
                }
            });
    }

    /**
     * pick from gallery
     * */
    async pickFromGallery() {
        if (Platform.OS === 'android') {
            if (Platform.Version >= 33) {
                const grantedCamera = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        'title': 'Camera Permission',
                        'message': 'Eolas needs to access your camera photos' +
                            'for your profile'
                    },
                )
                if (grantedCamera === PermissionsAndroid.RESULTS.GRANTED) {
                    this.gallerySelection()
                }
            }
            else if (Platform.Version >= 23 && Platform.Version < 33) {
                const grantedCamera = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        'title': 'Camera Permission',
                        'message': 'Eolas needs to access your camera photos' +
                            'for your profile'
                    },
                )
                if (grantedCamera === PermissionsAndroid.RESULTS.GRANTED) {
                    const grantFile = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                        {
                            'title': 'Write File',
                            'message': 'Eolas needs to access your camera photos' +
                                'for your profile'
                        },
                    )
                    if (grantFile === PermissionsAndroid.RESULTS.GRANTED) {

                        this.gallerySelection()
                    }
                }
            } else {
                this.gallerySelection()
            }
        } else {
            setTimeout(() => {
                this.gallerySelection()
            }, Constants.GALLERY_DELAY)
        }
    }

    /**
     * gallery res handling
     * */
    gallerySelection() {
        ImagePicker.openPicker({
            compressQuality: 80,
            includeBase64: true,
            title: this.state.translation[this.state.Language].Photos
        }).then(image => {
            this.setState({ changeImage: true })
            if (Platform.OS === 'android') {
                image.map(res => {
                    source = { uri: res.path }
                    this.setState({ imagePath: source, image64: res.data })
                })
            } else {
                // source = { uri: image.path }
                // this.setState({ imagePath: source, image64: image.data })
                source = { uri: image[0].path }
                this.setState({ imagePath: source, image64: image[0].data })
            }

        })
            .catch(error => {
                if (error === "E_PERMISSION_MISSING") {
                    // Do stuff...`
                }
            });
    }


    /**
     * local data
     * */
    async getLocalData() {
        let userdetail = await AsyncStorage.getItem("UserInfo");
        mFirstName = await AsyncStorage.getItem("firstName");
        mLastName = await AsyncStorage.getItem("lastName");
        mEmail = await AsyncStorage.getItem("emailId");
        mMobile = await AsyncStorage.getItem("mobile");
        mCountryCode = await AsyncStorage.getItem("countryCode");
        mBirthDate = userdetail && JSON.parse(userdetail).DateOfBirth
        //mDOB = await AsyncStorage.getItem("dob");
        mDomain = await AsyncStorage.getItem("Domains");
        mContry = userdetail && JSON.parse(userdetail).country
        mCity = userdetail && JSON.parse(userdetail).city
        mState = userdetail && JSON.parse(userdetail).state
        mGender = userdetail && JSON.parse(userdetail).gender
        //let setOffline = await AsyncStorage.getItem('setOffline');
        //  let enableOfflineBackup = await AsyncStorage.getItem('enableOfflineBackup');

        mPassword = '12345678';
        let updateState = {};
        updateState.password = mPassword;
        if (mFirstName) {
            updateState.firstName = mFirstName;
        }
        if (mLastName) {
            updateState.lastName = mLastName;
        }
        if (mEmail) {
            updateState.email = mEmail;
        }
        if (mMobile) {
            updateState.mobile = mMobile;
        }
        // if (mDOB) {
        //     updateState.dateOfBirth = mDOB;
        // }
        if (mCountryCode) {
            updateState.countryCode = mCountryCode;
        }
        if (mDomain) {
            updateState.isPepsicodomain = mDomain
        }
        if (mContry) {
            updateState.country = mContry
        }
        if (mState) {
            updateState.state = mState
        }
        if (mCity) {
            updateState.city = mCity
        }
        if (mGender) {
            updateState.gender = mGender != null ? mGender : Platform.OS == 'ios' ? 'Gender' : ''
        }
        if (mBirthDate) {
            let date = mBirthDate.split('-');
            let newDate = date[2] + "/" + date[1] + "/" + date[0];
            updateState.dateOfBirth = newDate
        }
        // if (setOffline !== null && setOffline !== undefined && setOffline.length > 0) {
        //     setOffline = JSON.parse(setOffline)
        //     updateState.enableSetOffline = setOffline
        // }
        // if (enableOfflineBackup !== null && enableOfflineBackup !== undefined && enableOfflineBackup.length > 0) {
        //     enableOfflineBackup = JSON.parse(enableOfflineBackup)
        //     updateState.enableOfflineBackup = enableOfflineBackup
        // }
        this.setState(updateState);
    }

    /** Sync Offline survey */
    async syncOfflineSurvey() {
        let missionAnsList = await AsyncStorage.getItem('ans_keys_list');
        let missionObject = await AsyncStorage.getItem('missionData');
        let missiondata = JSON.parse(missionObject)
        if (missionAnsList !== null && missionAnsList !== undefined && missionAnsList.length > 0) {
            let missionList = JSON.parse(missionAnsList);
            this.state.offlineMissionList = []
            for (var i = 0; i < missionList.length; i++) {
                let sub_ans = await AsyncStorage.getItem(missionList[i]);
                if (sub_ans !== null && sub_ans !== undefined && sub_ans.length > 0) {
                    let missionId = missionList[i].split("_")[0].trim()
                    let missionObj = missiondata && missiondata.filter(obj => { return obj.id == missionId })
                    if (missionObj.length > 0) {
                        this.state.offlineMissionList.push(missionObj[0].mission_name)
                    }
                }
            }

        }
        if (this.state.offlineMissionList.length > 0) {
            this.setModalVisible(true)
        }
        else {
            Constants.showSnack(this.state.translation[this.state.Language].No_Offline_Mission)
        }
    }

    /**
    * get offline survey details from local storage
    * submit a survey when device is connected to internet
    */
    async submitOfflineAnswers() {
        NetInfo.fetch().then(async (state) => {
            let status = state.isConnected ? "online" : "offline";
            let setOffline = await AsyncStorage.getItem('setOffline') || false; // not in use
            if (status === "online" && global.isSlowNetwork != true) {
                if (global.isSubmitProgress != 'InProgress') {
                    let missionObject = await AsyncStorage.getItem('ans_keys_list');
                    let apiKey = await AsyncStorage.getItem("api_key");
                    let offlineExpMission = await AsyncStorage.getItem('offlineExport');
                    let offlineExpData = JSON.parse(offlineExpMission)

                    if (missionObject !== null && missionObject !== undefined && missionObject.length > 0) {
                        let missionData = JSON.parse(missionObject);
                        this.setState({ isSurveySyncLoading: true, modelVisible: false })
                        for (var i = 0; i < missionData.length; i++) {
                            try {
                                let sub_ans = await AsyncStorage.getItem(missionData[i]);
                                let answer = [];
                                let data = {};
                                let delList = [];
                                if (sub_ans !== null && sub_ans !== undefined && sub_ans.length > 0) {
                                    answer = JSON.parse(sub_ans);

                                    data['mission_id'] = answer[0].mission_id;
                                    data['survey_id'] = answer[0].survey_id;
                                    data['index'] = missionData[i];
                                    data['survey_answer_tag'] = answer[0].survey_answer_tag_id;
                                    data['sub_key'] = '';
                                    for (var j = 0; j < answer.length; j++) {
                                        if (answer[j].survey_answer_tag_id && answer[j].survey_answer_tag_id != -1) {
                                            data['survey_answer_tag'] = answer[j].survey_answer_tag_id;
                                        }
                                    }

                                    for (var j = 0; j < answer.length; j++) {
                                        if (answer[j].sub_key) {
                                            data['sub_key'] = answer[j].sub_key;
                                        }
                                        if (answer[j].activeTime) {
                                            data['activeTime'] = answer[j].activeTime;
                                        }
                                    }

                                    for (var j = 0; j < answer.length; j++) {
                                        let questionObj = answer[j];
                                        if (questionObj.question_type === "upload") {
                                            try {

                                                answer[j].answer['media'] = await RNFS.readFile(questionObj.answer['media'], "base64");
                                                delList.push(questionObj.answer['media']);

                                            } catch (err) {
                                                //console.log(err);
                                            }
                                        } else if (questionObj.question_type === "capture") {
                                            try {

                                                answer[j].answer['image'] = await RNFS.readFile(questionObj.answer['image'], "base64");
                                                delList.push(questionObj.answer['image']);

                                            } catch (err) {
                                                //console.log(err);
                                            }
                                        }
                                        else if (questionObj.question_type === "barcode") {
                                            try {

                                                answer[j].answer['image'] = await RNFS.readFile(questionObj.answer['image'], "base64");
                                                delList.push(questionObj.answer['image']);

                                            } catch (err) {
                                                //console.log(err);
                                            }
                                        }
                                    }
                                    data['answers'] = answer;
                                    let url = Constants.BASE_URL + Service.OFFLINE_SUBMIT_SERVICE;
                                    await axios.post(url, data, {
                                        headers: {
                                            "Content-Type": "application/json",
                                            Auth: apiKey
                                        },
                                        timeout: Constants.TIMEOUT
                                    })
                                        .then(response => {
                                            const elementsIndex = offlineExpData && offlineExpData.findIndex(element => element.sub_key == data['index'])
                                            offlineExpData[elementsIndex].isSynced = true
                                            Constants.saveKey('offlineExport', JSON.stringify(offlineExpData))
                                            this.deleteItem(data['index'], delList);
                                            if (i == missionData.length - 1) {
                                                this.setState({ offlineMissionList: [], isSurveySyncLoading: false })
                                                /** message while all mission synced */
                                                Constants.showSnack(this.state.translation[this.state.Language].Offline_Sync_Success)
                                                this.resetStack()
                                            }
                                        })
                                        .catch(error => {
                                            if (i == missionData.length - 1) {
                                                this.setState({ isSurveySyncLoading: false })
                                            }
                                            Constants.showSnack((error && error.response.data.error) ? error.response.data.error : "Something went wrong")
                                        });
                                }
                                else {
                                    if (i == missionData.length - 1) {
                                        this.setState({ isSurveySyncLoading: false })
                                    }
                                }
                            } catch (err) {
                                if (i == missionData.length - 1) {
                                    this.setState({ isSurveySyncLoading: false })
                                }
                                console.log(err);
                            }
                        }
                    }
                }
                else {
                    Constants.showSnack(this.state.translation[this.state.Language].Sync_Inprogress)
                }
            }
            else {
                if (global.isSlowNetwork == true) {
                    Constants.showSnack(this.state.translation[this.state.Language].Sync_Error_Offlinemode)
                }
                else {
                    Constants.showSnack(this.state.translation_common[this.state.Language].No_Internet)
                }

            }
        })
    }

    /**
     * Clear data after survey posted to server 
     * @param {object} fileList - clear offline answer when offline answer is successfully posted to server 
     */
    async deleteItem(key, fileList) {
        try {
            await AsyncStorage.removeItem(key);
            for (let i = 0; i < fileList.length; i++) {
                RNFS.unlink(fileList[i])
                    .then(() => {
                        // console.log('File deleted ' + fileList[i]);   
                    })
                    .catch((err) => {
                        //console.log('Error in File delete ' + fileList[i]);   
                        // console.log(err)
                    });
            }
            // console.log('delete item done...');
        } catch (error) {
            // console.log(error.message);
        }
    }

    /** model visible setting */
    setModalVisible = (visible) => {
        this.setState({ modelVisible: visible });
    }

    /** Switch Action */
    toggleOfflineSwitch = (value) => {
        // this.setState({ enableOfflineBackup: value })
        // AsyncStorage.setItem('enableOfflineBackup', JSON.stringify(value));
    }
    exportOfflineSurvey = async () => {
        // this.props.navigation.navigate('offlineSurveyList', { enableOfflineBackup: this.state.enableOfflineBackup })
        this.props.navigation.navigate('OfflineSurveyList')
    }
    toggleSetOfflineSwitch = (value) => {
        /** set user as a offline and survey submission should offline */
        // this.setState({ enableSetOffline: value })
        // AsyncStorage.setItem('setOffline', JSON.stringify(value));
    }

    /** api call for send access code */
    async sendAccessCode() {
        if (this.state.accessCode.trim()) {
            let api_key = await AsyncStorage.getItem('api_key');
            let url = Constants.BASE_URL + Service.SEND_PEPSICO_CODE + this.state.accessCode.trim();
            NetInfo.fetch().then(state => {
                status = state.isConnected ? 'online' : 'offline';
                if (status == 'online') {
                    axios.get(url, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Auth': api_key
                        },
                        timeout: Constants.TIMEOUT,
                    }).then(response => {
                        if (response.data.status === 200) {
                            if (this.state.accessCode != 'skip') {
                                Constants.saveKey('isPepsicoUser', '1')
                            }
                            this.resetStack()
                            Constants.showSnack(response.data.message)
                        }
                        else if (response.data.status === 201) {
                            Constants.showSnack(response.data.message)
                        }
                        else if (response.data.status === 202) {
                            Constants.showSnack(response.data.message)
                        }
                    }).catch(error => {
                        console.log('error', error)
                    })
                }
                else {
                    Constants.showSnack(this.state.translation_common[this.state.Language].No_Internet)
                }
            });
        }
        else {
            Constants.showSnack(this.state.translation[this.state.Language].enterPepsicoCode)
        }
    }

    /** class render method */
    render() {
        if (this.state.translation.length < 1) {
            return (
                <ActivityIndicator
                    style={styles.indicatorStyle}
                    color='#ffffff' size={'small'} />
            )
        }
        const { countries, country, states, cities, city, translation, Language, languagelist } = this.state;
        return (
            <SafeAreaView style={{ backgroundColor: Color.colorDarkBlue, flex: 1 }}
                edges={['right', 'left']}
                forceInset={{
                    bottom: 'never', top: 'never'
                    //top: Platform.OS === 'ios' ? height === 812 ? 10 : 0 : 0
                }}>
                {Platform.OS == 'android' ? <StatusBar backgroundColor={Color.colorBlack} barStyle="light-content" /> : null}


                <ImageBackground source={require('../../images/login/signup_bg.jpg')}
                    style={styles.viewContainer}>

                    {/*Loader*/}

                    {this.state.isLoading && (
                        <View style={[Style.styles.loaderStyle]}>
                            <View style={Style.styles.indicatorStyle}>
                                <ActivityIndicator size="large" color={Color.colorDarkBlue} />
                            </View>
                        </View>
                    )}
                    <ScrollView contentContainerStyle={styles.contentContainer}
                        overScrollMode={'always'} keyboardShouldPersistTaps={'always'}>


                        {/*titleView*/}
                        <View style={styles.titleView}>
                            <View style={styles.textContainer}>
                                <Text style={styles.titleText}>{translation[Language].Profile_Setup}</Text>
                            </View>
                        </View>

                        {/*profileImage*/}
                        {/** temporary hided because of apple reject due to chines language permission popup comes if 
                         *  user don't allow permission
                         */}
                        {/* <View style={styles.profileView}>
                            <ImageBackground
                                style={styles.userImageBg}
                                source={require('../../images/profile/user.png')}>
                                <Image
                                    style={styles.profileImage}
                                    source={this.state.imagePath}
                                />
                            </ImageBackground>


                            <TouchableOpacity style={styles.bg}
                                onPress={() => this.pickFromGallery()}>
                                <Image
                                    style={styles.gallery}
                                    source={require('../../images/profile/gallery.png')} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.bg1}
                                onPress={() => this.TakePhoto()}>
                                <Image
                                    style={styles.camera}
                                    source={require('../../images/profile/camera.png')} />
                            </TouchableOpacity>
                        </View> */}


                        {/* firstName*/}

                        <View style={[styles.rowInputView, { marginTop: Dimension.marginTwenty }]}>
                            <View flex={0.5} style={{ marginRight: 3 }}>
                                <Text style={styles.textInputTitle}>{translation[Language].First_Name}</Text>
                                <TextInput
                                    style={styles.InputText}
                                    value={this.state.firstName}
                                    numberOfLines={1}
                                    underlineColorAndroid='transparent'
                                    returnKeyType="next"
                                    placeholder={translation[Language].First_Name}
                                    placeholderColor={Color.colorServiceText}
                                    placeholderTextColor={Color.colorLitGrey}
                                    selectionColor={Color.colorPlaceHolder}
                                    keyboardType={"default"}
                                    onSubmitEditing={() => this.lastName.focus()}
                                    onChangeText={firstName => this.setState({ firstName })} />

                            </View>
                            <View flex={0.5} style={{ marginLeft: 3 }}>
                                <Text style={styles.textInputTitle}>{translation[Language].Last_Name}</Text>
                                {/*lastName*/}
                                <TextInput
                                    style={styles.InputText}
                                    value={this.state.lastName}
                                    numberOfLines={1}
                                    underlineColorAndroid={Color.colorWhite}
                                    placeholderColor={Color.colorServiceText}
                                    returnKeyType="next"
                                    placeholder={translation[Language].Last_Name}
                                    placeholderTextColor={Color.colorLitGrey}
                                    selectionColor={Color.colorPlaceHolder}
                                    keyboardType={"default"}
                                    ref={(input) => this.lastName = input}
                                    onSubmitEditing={() => this.email.focus()}
                                    onChangeText={lastName => this.setState({ lastName })} />
                            </View>

                        </View>

                        {/*email*/}
                        <View style={styles.inputView}>
                            <Text style={styles.textInputTitle}>{translation[Language].Email}</Text>
                            <TextInput
                                style={styles.InputText}
                                value={this.state.email}
                                numberOfLines={1}
                                autoCapitalize='none'
                                placeholderColor={Color.colorServiceText}
                                underlineColorAndroid='transparent'
                                returnKeyType="next"
                                placeholder={translation[Language].Email}
                                placeholderTextColor={Color.colorLitGrey}
                                selectionColor={Color.colorPlaceHolder}
                                keyboardType={"email-address"}
                                ref={(input) => this.email = input}
                                onChangeText={email => this.setState({ email })} />

                        </View>
                        {/*paypal email*/}
                        <View style={styles.inputView}>
                            <Text style={styles.textInputTitle}>{translation[Language].Payal_Email}</Text>
                            <TextInput
                                style={styles.InputText}
                                value={this.state.paypalEmail}
                                numberOfLines={1}
                                autoCapitalize='none'
                                placeholderColor={Color.colorServiceText}
                                placeholderTextColor={Color.colorLitGrey}
                                underlineColorAndroid='transparent'
                                returnKeyType="next"
                                placeholder={translation[Language].Payal_Email}
                                selectionColor={Color.colorPlaceHolder}
                                keyboardType={"email-address"}
                                ref={(input) => this.paypalEmail = input}
                                onChangeText={paypalEmail => this.setState({ paypalEmail })}

                            />

                        </View>

                        {/** Pepsico user access code */}
                        {this.state.isPepsicodomain == 1 ? <View style={styles.inputView}>
                            <Text style={styles.textInputTitle}>{"Code"}</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <TextInput
                                    style={[styles.InputText, { flex: 1 }]}
                                    value={this.state.accessCode}
                                    numberOfLines={1}
                                    autoCapitalize='none'
                                    placeholderColor={Color.colorServiceText}
                                    placeholderTextColor={Color.colorLitGrey}
                                    underlineColorAndroid='transparent'
                                    returnKeyType="next"
                                    placeholder={"Pepsico Access Code"}
                                    selectionColor={Color.colorPlaceHolder}
                                    // keyboardType={"email-address"}
                                    ref={(input) => this.accessCode = input}
                                    onChangeText={accessCode => this.setState({ accessCode })}
                                />
                                <TouchableOpacity
                                    style={styles.sendButton}
                                    onPress={() => this.sendAccessCode()}>
                                    <Text style={styles.skipText}>{'Send'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View> : null}

                        {/*country code*/}
                        <View style={styles.inputView}>
                            <Text style={styles.textInputTitle}>{translation[Language].Country_Code}</Text>
                            <View style={[styles.countryListView, {
                                justifyContent: 'flex-start',
                                alignItems: 'center',
                            }]}>


                                <CountryPicker
                                    styles={styles.countryListStyle}
                                    countryList={Constants.countryList}
                                    filterable={true}
                                    closeable={true}
                                    transparent={true}
                                    showCallingCode={true}
                                    filterPlaceholder={'Search'}
                                    withFilter={true}
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
                            </View>

                            {/*<TextInput*/}
                            {/*style={styles.InputText}*/}
                            {/*value={this.state.countryCode}*/}
                            {/*numberOfLines={1}*/}
                            {/*placeholderColor={Color.colorServiceText}*/}
                            {/*underlineColorAndroid='transparent'*/}
                            {/*returnKeyType="next"*/}
                            {/*placeholderTextColor={Color.colorLitGrey*/}
                            {/*placeholder={String.countryCode}*/}
                            {/*selectionColor={Color.colorPlaceHolder}*/}
                            {/*keyboardType={"phone-pad"}*/}
                            {/*ref={(input) => this.countryCode = input}*/}
                            {/*onChangeText={countryCode => this.setState({countryCode})}/>*/}

                        </View>

                        {/*mobile*/}
                        <View style={styles.inputView}>
                            <Text style={styles.textInputTitle}>{translation[Language].Mobile_Number}</Text>
                            <TextInput
                                style={styles.InputText}
                                value={this.state.mobile}
                                numberOfLines={1}
                                placeholderColor={Color.colorServiceText}
                                underlineColorAndroid='transparent'
                                returnKeyType="next"
                                placeholder={translation[Language].Mobile_Number}
                                placeholderTextColor={Color.colorLitGrey}
                                selectionColor={Color.colorPlaceHolder}
                                keyboardType={"numeric"}
                                ref={(input) => this.mobile = input}
                                onChangeText={mobile => this.setState({ mobile: mobile })} />
                            {/* onChangeText={mobile => this.setState({ mobile: mobile.replace(/^0+/, '') })} /> */}

                        </View>



                        {/*password*/}
                        <View style={[styles.rowInputView, { marginTop: 5 }]}>
                            <View flex={0.6}>
                                <Text style={styles.textInputTitle}>{translation[Language].Password}</Text>
                                <TextInput
                                    style={[styles.InputText]}
                                    value={this.state.password}
                                    secureTextEntry
                                    editable={false}
                                    numberOfLines={1}
                                    placeholderColor={Color.colorServiceText}
                                    underlineColorAndroid={Color.colorWhite}
                                    placeholderTextColor={Color.colorLitGrey}
                                    returnKeyType="next"
                                    placeholder={translation[Language].Password}
                                    selectionColor={Color.colorPlaceHolder}
                                    keyboardType={"default"}
                                    ref={(input) => this.password = input}
                                    onSubmitEditing={() => this.dob.focus()}
                                    onChangeText={password => this.setState({ password })} />
                            </View>

                            <TouchableOpacity
                                style={{ justifyContent: 'center' }}
                                onPress={() => this.props.navigation.navigate('ChangePassword', { languagelist: this.state.translation, Language: this.state.Language })}>
                                <View flex={0.4} style={{ justifyContent: 'center' }}>
                                    <Text style={styles.changeText}>{translation[Language].Change_Password}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>


                        {/*DateOfBirth and Gender DD*/}
                        <View style={[styles.rowInputView, { marginTop: 16 }]}>
                            {Platform.OS === 'android' ?
                                <View flex={1}>
                                    <TextInputMask
                                        ref={ref => this.myDateBirth = ref}
                                        style={styles.InputText}
                                        value={this.state.dateOfBirth}
                                        placeholder={String.dateofBirth}
                                        placeholderTextColor={Color.colorLitGrey}
                                        {...baseStyle}
                                        selectionColor={Color.colorPlaceHolder}
                                        onChangeText={(dateOfBirth) => this.setState({ dateOfBirth })}
                                        type={'datetime'}
                                        options={{
                                            format: 'DD/MM/YYYY'
                                        }}
                                    />
                                </View> :
                                <View flex={0.5}>
                                    <TextInputMask
                                        ref={ref => this.myDateBirth = ref}
                                        style={styles.InputText}
                                        value={this.state.dateOfBirth}
                                        placeholder={String.dateofBirth}
                                        placeholderTextColor={Color.colorLitGrey}
                                        {...baseStyle}
                                        selectionColor={Color.colorPlaceHolder}
                                        onChangeText={(dateOfBirth) => this.setState({ dateOfBirth })}
                                        type={'datetime'}
                                        options={{
                                            format: 'DD/MM/YYYY'
                                        }}
                                    />
                                </View>}

                            {/*Gender dropDown*/}
                            {Platform.OS == 'ios' ?
                                <View flex={0.5}>
                                    <TouchableOpacity style={styles.pickerIosView} onPress={() => this.Refs.genderIOSPicker.togglePicker()} activeOpacity={activeOpacityForIOSPicker}>
                                        <View style={{ flex: 1 }}>
                                            <RNPickerSelect
                                                items={translation[Language].Gender_List}
                                                onValueChange={(value) => {
                                                    this.setState({
                                                        gender: value,
                                                    });
                                                }}
                                                placeholder={{
                                                    label: translation[Language].Gender,
                                                    value: '',
                                                }}
                                                hideIcon={true}
                                                style={{ ...pickerSelectStylesConditions }}
                                                value={this.state.gender}
                                                ref={el => {
                                                    this.Refs.genderIOSPicker = el;
                                                }}

                                            />
                                        </View>
                                        <Image
                                            source={require('../../images/profile/down_arrow.png')}
                                            style={styles.dayDownArrow} />
                                    </TouchableOpacity>
                                </View>
                                :
                                <View style={styles.pickerFlexGrowView}>
                                    <Picker
                                        style={{ color: this.state.gender === '' ? Color.colorServiceText : Color.colorPlaceHolder }}
                                        selectedValue={this.state.gender}
                                        onValueChange={gender => this.setState({ gender: gender })}
                                        mode="dropdown">
                                        <Picker.Item value='' color={Color.colorOrange} label={translation[Language].Gender} />
                                        {translation[Language].Gender_List.map((item, key) => (<Picker.Item
                                            label={item.label}
                                            value={item.value}
                                            color={Color.colorBlack}
                                            key={key} />)
                                        )}
                                    </Picker>
                                </View>}
                        </View>
                        {/* End DateOfBirth and Gender DD*/}

                        {/* Country and State DD */}
                        <View style={styles.twoPickerRow}>
                            {/*country dropDown*/}
                            {Platform.OS === 'android' ?
                                <View style={styles.pickerFlexGrowView}>
                                    <Picker
                                        style={{ color: country === '' ? Color.colorServiceText : Color.colorPlaceHolder }}
                                        selectedValue={parseInt(country)}
                                        onValueChange={(country) => { this.changeHandler(country, 'country') }}
                                        mode="dropdown">
                                        <Picker.Item value='' color={Color.colorOrange} label={translation[Language].Country} />
                                        {countries.map((item, key) => (<Picker.Item
                                            label={item.label}
                                            value={item.value}
                                            color={Color.colorBlack}
                                            key={key} />)
                                        )}
                                    </Picker>

                                </View> :
                                // <View flex={0.5}>
                                <TouchableOpacity style={styles.pickerIosView} onPress={() => this.Refs.countryIOSPicker.togglePicker()} activeOpacity={activeOpacityForIOSPicker}>
                                    <View style={{ flex: 1 }}>
                                        <RNPickerSelect
                                            items={countries}
                                            onValueChange={(country) => { this.changeHandler(country, 'country') }}
                                            placeholder={{
                                                label: translation[Language].Country,
                                                value: '',
                                            }}
                                            hideIcon={true}
                                            style={{ ...pickerSelectStylesConditions }}
                                            value={parseInt(country)}
                                            ref={el => {
                                                this.Refs.countryIOSPicker = el;
                                            }}

                                        />
                                    </View>
                                    <Image
                                        source={require('../../images/profile/down_arrow.png')}
                                        style={styles.dayDownArrow} />

                                </TouchableOpacity>
                                // </View>
                            }
                            {/*state dropDown*/}

                            <View style={[styles.pickerFlexGrowView, { flex: 0.5 }]}>

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
                                    onChangeText={(state) => this.setState({ state: state })}
                                />

                            </View>

                        </View>
                        {/* <View style={styles.pickerFlexGrowView}>
                                    <Picker
                                        style={{ color: state === '' ? Color.colorServiceText : Color.colorPlaceHolder }}
                                        selectedValue={parseInt(state)}
                                        onValueChange={(state) => { this.changeHandler(state, 'state') }}
                                        mode="dropdown"
                                        key={states.length}
                                        >
                                        <Picker.Item value='' label={translation[Language].State} />
                                        {states.map((item, key) => (<Picker.Item
                                            label={item.label}
                                            value={item.value}
                                            key={key} />)
                                        )}
                                    </Picker>
                                </View>
                                 */}
                        {/* End Conutry and state DD */}

                        {/*city DD*/}
                        {/* {Platform.OS === 'android' ? */}

                        <View style={styles.cityinputView}>
                            <TextInput
                                style={styles.InputText}
                                value={this.state.city}
                                numberOfLines={1}
                                autoCapitalize='none'
                                placeholderColor={Color.colorServiceText}
                                underlineColorAndroid='transparent'
                                returnKeyType="next"
                                placeholder={translation[Language].City}
                                placeholderTextColor={Color.colorLitGrey}
                                selectionColor={Color.colorPlaceHolder}
                                keyboardType={"email-address"}
                                ref={(input) => this.city = input}
                                onChangeText={city => this.setState({ city })}

                            />

                        </View>
                        {/* :
                            <TouchableOpacity style={styles.pickerFullViewIos} onPress={()=> this.Refs.cityIOSPicker.togglePicker()} activeOpacity={activeOpacityForIOSPicker}>
                                <View flex={1}>
                                    <RNPickerSelect
                                        items={cities}
                                        onValueChange={(city) => { this.changeHandler(city, 'city') }}
                                        placeholder={{
                                            label: 'City',
                                            value: '',
                                        }}
                                        hideIcon={true}
                                        style={{ ...pickerSelectStylesConditions }}
                                        value={parseInt(city)}

                                        ref={el => {
                                            this.Refs.cityIOSPicker = el;
                                        }}

                                    />
                                </View>
                                <Image
                                    source={require('../../images/profile/down_arrow.png')}
                                    style={styles.dayDownArrow} />
                            </TouchableOpacity>} */}
                        {/* End City DD */}


                        {/* Language select */}
                        {Platform.OS == 'ios' ?
                            <TouchableOpacity style={styles.pickerFullViewIos} onPress={() => this.Refs.languageIOSPicker.togglePicker()} activeOpacity={activeOpacityForIOSPicker}>
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
                                    source={require('../../images/profile/down_arrow.png')}
                                    style={styles.dayDownArrow} />
                            </TouchableOpacity>

                            : <View style={styles.pickerAndroidView}>
                                <View style={styles.pickerFlexGrowView}>
                                    <Picker
                                        style={{ color: Language === '' ? Color.colorServiceText : Color.colorPlaceHolder }}
                                        selectedValue={Language}
                                        // style={{ height: 50, width: 120 }}
                                        onValueChange={(lan, itemIndex) => this.selectlanguage(lan)}>
                                        {this.state.languagelist.map(l => (
                                            <Picker.Item label={l} value={l} />
                                        ))
                                        }
                                    </Picker>
                                </View>
                            </View>}

                        <ExpandableView
                            TitleViewStyle={styles.advanceSettinView}
                            TitleTextStyle={{ color: Color.colorWhite, fontFamily: Font.fontRobotoMedium }}
                            TitleText={translation[Language].Advanced_Settings}
                        >
                            <View>
                                {/** Sync offline survey */}
                                <TouchableOpacity
                                    style={[styles.fullWithButton, { backgroundColor: Color.colorDarkBlue }]}
                                    onPress={() => this.syncOfflineSurvey()}>
                                    {this.state.isSurveySyncLoading ?
                                        <ActivityIndicator
                                            style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
                                            size="small" color={Color.colorWhiteBg} /> : <Text style={styles.skipText}>{translation[Language].Sync_Offline}</Text>
                                    }
                                </TouchableOpacity>

                                {/** offline survey backup */}
                                {/*<View style={styles.offlineBackupView}>
                                     <Text style={styles.skipText}>{translation[Language].Mission_Backup}</Text>
                                    <View style={{ marginHorizontal: 10 }}>
                                        <Switch
                                            style={Platform.OS == 'android' ? { transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }] } : null}
                                            trackColor={{ false: Color.colorWhite, true: Color.colorDarkBlue }}
                                            thumbColor={Color.colorWhite}
                                            ios_backgroundColor={Color.colorLitGrey}
                                            onValueChange={this.toggleOfflineSwitch}
                                            value={this.state.enableOfflineBackup}
                                        />

                                        {/* <Switch
                                    value={this.state.enableOfflineBackup}
                                    onValueChange={this.toggleOfflineSwitch}
                                    circleSize={26}
                                    barHeight={30}
                                    circleBorderWidth={0}
                                    backgroundActive={Color.colorDarkBlue}
                                    backgroundInactive={'gray'}
                                    circleActiveColor={Color.colorWhite}
                                    circleInActiveColor={Color.colorWhite}
                                    changeValueImmediately={true}
                                    /> 
                                    </View> */}
                                <TouchableOpacity
                                    style={[styles.fullWithButton, { backgroundColor: Color.colorDarkBlue }]}
                                    onPress={() => this.exportOfflineSurvey()}>
                                    <Text style={styles.skipText}>{translation[Language].Export_Mission}</Text>
                                </TouchableOpacity>

                                {/* </View> */}

                                {/** make forcefully app offline */}
                                {/* <View style={styles.offlineBackupView}>
                                    <Text style={styles.skipText}>{translation[Language].Set_Offline}</Text>
                                    <Switch
                                        style={Platform.OS == 'android' ? { transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }] } : null}
                                        trackColor={{ false: Color.colorWhite, true: Color.colorDarkBlue }}
                                        thumbColor={Color.colorWhite}
                                        ios_backgroundColor={Color.colorLitGrey}
                                        onValueChange={this.toggleSetOfflineSwitch}
                                        value={this.state.enableSetOffline}
                                    />
                                    {/* <Switch
                                        value={this.state.enableSetOffline}
                                        onValueChange={this.toggleSetOfflineSwitch}
                                        circleBorderWidth={0}
                                        circleSize={26}
                                        barHeight={30}
                                        backgroundActive={Color.colorDarkBlue}
                                        backgroundInactive={'gray'}
                                        circleActiveColor={Color.colorWhite}
                                        circleInActiveColor={Color.colorWhite}
                                        changeValueImmediately={true}
                                    /> 
                                </View> */}

                                {/* Delete Profile */}
                                <View style={styles.offlineBackupView}>
                                    <Text style={styles.skipText}>{translation[Language].Delete_Profile}</Text>
                                    <TouchableOpacity
                                        style={[styles.exportSurveyButton, { backgroundColor: Color.colorDarkBlue, marginLeft: Dimension.margin, marginTop: 5 }]}
                                        onPress={() => this.deleteProfile()}>
                                        {
                                            <Text style={styles.skipText}>{translation[Language].Delete_Profile}</Text>
                                        }
                                    </TouchableOpacity>

                                    <DialogInput
                                        modalStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
                                        isDialogVisible={this.state.deleteProfileDialog}
                                        title={translation[Language].Delete_Profile}
                                        message={translation[Language].Delete_Profile_confirmation}
                                        hintInput={translation[Language].Enter_Delete}
                                        cancelText={translation[Language].Cancel}
                                        submitText={translation[Language].Confirm}
                                        submitInput={(inputText) => { this.sendInput(inputText) }}
                                        closeDialog={() => { this.setState({ deleteProfileDialog: false }) }}>
                                    </DialogInput>
                                </View>
                            </View>
                        </ExpandableView>
                        {/*skip text*/}
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignSelf: 'center',
                            marginTop: 16,
                            marginBottom: 16
                        }}>
                            <TouchableOpacity
                                style={[styles.saveContainer, { backgroundColor: Color.colorDarkBlue, marginRight: 5 }]}
                                onPress={() => this.validation()}>
                                {this.state.textVisible && (
                                    <Text style={styles.skipText}>{translation[Language].Save}</Text>
                                )}

                                {this.state.isBtnLoading && (
                                    <ActivityIndicator
                                        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
                                        size="small" color={Color.colorWhiteBg} />
                                )}

                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.saveContainer, { backgroundColor: Color.colorLitGrey, marginLeft: 5 }]}
                                onPress={() => this.resetStack()}>
                                <Text
                                    style={styles.skipText}>{mFromSignUp === false ? translation[Language].Cancel : translation[Language].Skip}</Text>
                            </TouchableOpacity>

                        </View>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignSelf: 'center',
                            alignItems: 'center',
                            minWidth: 100,
                            maxWidth: 'auto'
                        }}>
                            <TouchableOpacity
                                style={[styles.logoutContainer, { backgroundColor: Color.colorDarkRed, marginLeft: 5, minWidth: 100, width: 'auto' }]}
                                onPress={() => this.logout()}>
                                {this.state.isLogoutText && (
                                    <Text style={styles.logoutText}>{translation[Language].LOGOUT}</Text>
                                )}
                                {this.state.isLogoutLoading && (
                                    <ActivityIndicator
                                        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
                                        size="small" color={Color.colorWhiteBg} />
                                )}
                            </TouchableOpacity>
                        </View>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignSelf: 'center'
                        }}>
                            <Text style={styles.versionText}>{translation[Language].App_Version + ' ' + DeviceInfo.getVersion()}</Text>
                        </View>

                        <Modal
                            animationType="slide"
                            transparent={true}
                            visible={this.state.modelVisible}
                            onRequestClose={() => {
                                console.log('Modal has been closed.')
                            }}
                        >
                            <View style={styles.centeredView}>
                                <View style={[styles.modalView, { height: (this.state.offlineMissionList.length * 40) + 150 }]}>
                                    <Text style={styles.modalTitle}>{translation[Language].Offline_Mission}</Text>

                                    <FlatList
                                        //contentContainerStyle={{ flex: 1 }}
                                        bounces={false}
                                        style={{ backgroundColor: Color.colorWhite }}
                                        showsVerticalScrollIndicator={false}
                                        keyExtractor={(item, index) => index.toString()}
                                        vertical
                                        data={this.state.offlineMissionList}
                                        renderItem={
                                            ({ item, index }) => {
                                                return (
                                                    <View style={styles.modelListitemView}>
                                                        <Text style={styles.modalText}>{item}</Text>
                                                    </View>
                                                )
                                            }
                                        }
                                    />

                                    <View style={styles.modelButtonView}>
                                        <TouchableHighlight
                                            style={[styles.saveContainer, { backgroundColor: Color.colorLitGrey, right: 10 }]}
                                            onPress={() => {
                                                this.setModalVisible(false);
                                            }}
                                        >
                                            <Text style={styles.skipText}>{translation[Language].Cancel}</Text>
                                        </TouchableHighlight>

                                        <TouchableHighlight
                                            style={[styles.saveContainer, { backgroundColor: Color.colorDarkBlue, left: 10 }]}
                                            onPress={() => {
                                                this.submitOfflineAnswers()
                                            }}
                                        >
                                            <Text style={styles.skipText}>{translation[Language].Sync_Now}</Text>
                                        </TouchableHighlight>
                                    </View>

                                </View>
                            </View>
                        </Modal>
                    </ScrollView>

                </ImageBackground>

            </SafeAreaView >
        )
    }
}

export default ProfileScreen

/** status bar height setup */
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBar.currentHeight;

/** UI styles used for this class */
const baseStyle = {
    placeholderTextColor: Color.colorServiceText
};

const styles = ScaledSheet.create({
    contentContainer: {
        paddingVertical: 20,
        backgroundColor: 'transparent'
    },
    container: {
        flexDirection: 'row'
    },
    viewContainer: {
        flex: 1,
        width: '100%',
        backgroundColor: Color.colorliteWhite
    },
    titleView: {
        width: '100%',
        flexDirection: 'row',
        alignItems: Platform.OS === 'ios' ? 'flex-end' : 'center',
        justifyContent: 'flex-start',
        height: Platform.OS === 'ios' ? 56 : 70 - 14,
        marginTop: Platform.OS === 'ios' ? height === 812 ? 25 : 0 : 0
    },
    textContainer: {
        top: Platform.OS === 'ios' ? 0 : 0,
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
    },
    titleText: {
        fontFamily: Font.fontRobotoMedium,
        fontSize: 20,
        fontWeight: 'bold',
        color: Color.colorWhite
    },
    versionText: {
        fontFamily: Font.fontRobotoMedium,
        fontSize: 14,
        fontWeight: 'bold',
        color: Color.colorWhite,
        paddingTop: 10
    },
    //view for Image
    profileView: {
        alignSelf: 'center',
        width: 168,
    },
    //Image
    profileImage: {
        borderRadius: Platform.OS === 'ios' ? 62 : 100,
        alignSelf: 'center',
        justifyContent: 'center',
        width: Platform.OS ? 117 : 115,
        height: Platform.OS ? 117 : 115
    },
    userImageBg: {
        borderRadius: Platform.OS === 'ios' ? 62 : 100,
        alignSelf: 'center',
        justifyContent: 'center',
        width: 118,
        height: 118
    },
    //camera and gallery
    bg: {
        borderRadius: 60,
        width: 42,
        height: 42,
        bottom: 0,
        borderColor: Color.colorTextBoxText,
        borderWidth: 1,
        position: 'absolute',
        justifyContent: 'center',
        marginLeft: 13,
        marginBottom: -10,
        backgroundColor: Color.colorWhite
    },
    bg1: {
        borderRadius: 60,
        width: 42,
        height: 42,
        bottom: 0,
        right: 0,
        borderColor: Color.colorTextBoxText,
        borderWidth: 1,
        marginRight: 13,
        marginBottom: -10,
        position: 'absolute',
        justifyContent: 'center',
        backgroundColor: Color.colorWhite
    },
    gallery: {
        width: 24,
        height: 19,
        alignSelf: 'center'
    },
    camera: {
        width: 24,
        height: 19.5,
        alignSelf: 'center'
    },
    //profileName
    profileName: {
        color: Color.colorWhite,
        fontSize: Dimension.largeText,
        fontFamily: Font.fontSansSemiBold,
        marginTop: Dimension.marginTen,
        textAlign: 'center',
        alignSelf: 'center'
    },
    //edit image
    editImage: {
        width: 21,
        height: 21,
        marginLeft: 20
    },
    //textInput fields
    rowInputView: {
        flexDirection: 'row',
        marginLeft: Dimension.margin + '@s',
        marginRight: Dimension.margin + '@s',
    },
    textInputTitle: {
        fontSize: Dimension.smallText,
        color: Color.colorYellow,
        textAlign: 'left',
        paddingLeft: 5
    },
    changeText: {
        color: '#F2F2F2',
        fontSize: 14,
        textAlign: 'left',
        marginTop: 15,
        marginLeft: 8
    },
    InputText: {
        fontSize: Dimension.mediumText,
        alignSelf: 'stretch',
        height: 40,
        textAlign: 'auto',
        fontWeight: 'normal',
        color: Color.colorBlack,
        marginLeft: 4,
        borderRadius: 3,
        paddingLeft: 7,
        paddingRight: 7,
        backgroundColor: Color.colorWhite,
    },
    inputView: {
        alignSelf: 'stretch',
        borderRadius: Dimension.radius,
        marginLeft: Dimension.margin + '@s',
        marginRight: Dimension.margin + '@s',
        marginTop: 5
    },
    cityinputView: {
        alignSelf: 'stretch',
        borderRadius: Dimension.radius,
        marginLeft: Dimension.margin + '@s',
        marginRight: Dimension.margin + '@s',
        marginTop: 10
    },
    //  picker styles
    twoPickerRow: {
        marginTop: 16,
        flexDirection: 'row',
        marginLeft: 13 + '@s',
        marginRight: 19 + '@s',
    },
    pickerHalfView: {
        flexDirection: 'row',
        alignItems: 'stretch',
        flex: 1,
        borderRadius: 2,
        marginLeft: 10,
        backgroundColor: Color.colorWhite,
    },
    pickerFlexGrowView: {
        flexGrow: 1,
        borderRadius: 2,
        marginLeft: 10,
        backgroundColor: Color.colorWhite,
        height: 40,
        justifyContent: 'center'
    },
    pickerAndroidView: {
        flexDirection: 'row',
        alignItems: 'stretch',
        flex: 1,
        marginLeft: '23@s',
        backgroundColor: Color.colorWhite,
        marginRight: '18@s',
        borderRadius: 2,
        marginTop: 16,
    },
    pickerIosView: {
        flexDirection: 'row',
        alignItems: 'stretch',
        flex: 1,
        borderRadius: 5,
        marginLeft: 10,
        paddingLeft: 10,
        justifyContent: 'space-between',
        backgroundColor: Color.colorWhite
    },
    pickerFullViewIos: {
        marginTop: 16,
        height: 42,
        backgroundColor: Color.colorWhite,
        paddingLeft: 10,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: Dimension.margin + 4 + '@s',
        marginRight: Dimension.margin + '@s',
        borderRadius: Dimension.radius,
        flex: 1,
    },
    countryDropDownView: {
        flex: 1,
        height: 40,
        marginLeft: 1,
        justifyContent: 'center',
        backgroundColor: Color.colorWhite,
    },

    dayDownArrow: {
        width: 13,
        height: 9,
        marginRight: 8,
        alignSelf: 'center',
        marginTop: 5
    },
    dayDownArrow2: {
        width: 13,
        height: 9,
        marginRight: 20,
        alignSelf: 'center',
        marginTop: 5
    },
    /*button*/
    saveContainer: {
        borderRadius: 20,
        borderColor: Color.colorWhiteBg,
        borderWidth: 1,
        width: 100,
        height: 40
    },
    logoutContainer: {
        borderRadius: 20,
        borderColor: Color.colorWhiteBg,
        borderWidth: 1,
        width: 80,
        height: 35
    },
    logoutText: {
        fontSize: Dimension.fontSmall,
        fontFamily: Font.fontRobotoMedium,
        fontWeight: 'bold',
        color: Color.colorWhite,
        alignSelf: 'center',
        paddingTop: 10,
        paddingBottom: 8,
        paddingLeft: 5,
        paddingRight: 5
    },
    skipText: {
        flex: 1,
        fontSize: Dimension.normalText,
        fontFamily: Font.fontRobotoMedium,
        fontWeight: 'bold',
        color: Color.colorWhite,
        alignSelf: 'center',
        paddingTop: 10,
        paddingBottom: 10
    },
    purchaseText: {
        marginTop: 10,
        alignSelf: 'center',
        color: Color.colorWhite,
        marginLeft: 25,
        marginRight: 25
    },
    //radio view
    radioView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginLeft: 20 + '@s',
        marginRight: 20 + '@s'
    },
    radioWhiteLeft: {
        borderRadius: 10,
        backgroundColor: Color.colorWhite,
        alignSelf: 'center',
        width: 20,
        height: 20,
        justifyContent: 'center',
    },
    blackDot: {
        width: 12,
        height: 12,
        alignSelf: 'center',
    },
    text: {
        textAlign: 'left',
        alignSelf: 'center',
        fontSize: Dimension.mediumText + '@ms0.3',
        fontFamily: Font.fontSansLight,
        color: Color.colorWhiteBg,
        paddingLeft: 10
    },
    statusBar: {
        height: STATUSBAR_HEIGHT,
    },
    countryListStyle: {
        flex: 1,
        alignSelf: 'stretch',
        textAlign: 'left',
        fontWeight: 'normal',
    },
    //textInput fields
    countryCodeStyle: {
        width: 250,
        fontSize: Dimension.normalText,
        alignSelf: 'stretch',
        textAlign: 'left',
        fontWeight: 'normal',
        paddingTop: 10,
        paddingBottom: 10,
        color: 'black',
    },
    countryListView: {
        flexDirection: 'row',
        flex: 1,
        height: 40,
        backgroundColor: Color.colorWhite,
        alignSelf: 'stretch',
        borderRadius: 3,
        paddingLeft: 7,
        paddingRight: 7,
        marginTop: 2,
        marginLeft: 5

    },
    /** model offline survey */
    fullWithButton: {
        flex: 1,
        borderRadius: 20,
        borderColor: Color.colorWhiteBg,
        borderWidth: 1,
        height: 40,
        marginLeft: Dimension.margin + 4 + '@s',
        marginRight: Dimension.margin + '@s',
        marginTop: 15
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    modalView: {
        padding: 25,
        maxHeight: height - 80,
        minHeight: 150,
        backgroundColor: "white",
        borderRadius: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    modelListitemView: {
        height: 40,
        width: '100%',
        marginHorizontal: 20,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    modelButtonView: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    modalTitle: {
        fontSize: Dimension.mediumText,
        fontFamily: Font.fontRobotoBold,
        color: Color.colorBlack,
        marginBottom: 20,
    },
    modalText: {
        fontSize: Dimension.normalText,
        fontFamily: Font.fontRobotoMedium,
        color: Color.colorBlack,
    },
    exportSurveyButton: {
        width: 120,
        borderRadius: 20,
        borderColor: Color.colorWhiteBg,
        borderWidth: 1,
        height: 40,
        marginLeft: 5,
        backgroundColor: Color.colorDarkBlue
    },
    offlineBackupView: {
        marginTop: 16,
        marginLeft: Dimension.margin + 4 + '@s',
        marginRight: Dimension.margin + '@s',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sendButton: {
        borderRadius: 20,
        borderColor: Color.colorWhiteBg,
        borderWidth: 1,
        width: 100,
        height: 40,
        marginLeft: 10
    },
    advanceSettinView: {
        flex: 1,
        marginTop: 16,
        height: 42,
        backgroundColor: Color.colorDarkBlue,
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginLeft: Dimension.margin + 4 + '@s',
        marginRight: Dimension.margin + '@s',
        borderRadius: 5,
        borderColor: Color.colorWhite,
        borderWidth: 1
    },

});

/** picker styles */
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