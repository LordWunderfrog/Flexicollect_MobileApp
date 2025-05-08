import React, { Component } from 'react';
import {
    View,
    Text,
    Platform,
    StatusBar,
    ImageBackground,
    TextInput,
    TouchableOpacity,
    Linking,
    Image,
    ScrollView, Dimensions, ActivityIndicator, KeyboardAvoidingView
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
import RNPickerSelect from "react-native-picker-select";
import { Picker } from '@react-native-community/picker';

let status;
let email = '';
const eolasLogo = require('../../images/login/eolas_logo_new_1.png');
const Downarrow = require('../../images/login/down-arrow.png');
let activeOpacityForIOSPicker = 0.8

/** Reset password classs */
class ResetPassword extends Component {

    constructor(props) {
        super(props);
        //const { params } = this.props.navigation.state;
        const { params } = this.props.route;
        email = params ? params.email : '';
        if (Platform.OS == "ios") {
            this.Refs = {
                languageIOSPicker: null
            };
        }

        this.state = {
            password: '',
            confirmPassword: '',
            isLoading: false,
            currentTextSecure: true,
            Language: global.language,
            // languagelist: Platform.OS == 'ios' ? Constants.languages : [],
            // translation: Platform.OS == 'ios' ? Constants.signin : [],
            languagelist: Constants.languages,
            translation: Constants.signin,
            translation_signup: Constants.signup,
            translation_common: Constants.common_text,
            confirmpasswordTextSecure: true
        }
    }

    /** component life cycle methods */
    UNSAFE_componentWillMount() {
        if (Platform.OS == 'android') {
            //this.getpagetranslation()
            this.getlanguagelist()
        }
    }

    componentDidMount() {
        const { navigation } = this.props;
        this.focusListener = navigation.addListener("focus", () => {
            StatusBar.setHidden(true);
        });
    }

    componentWillUnmount() {
        this.focusListener();
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
                    this.setState({ languagelist: response.data.data });
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
     * validation 
     * check whether valid mobile number or emailId is entered
     * */
    validation() {
        const { confirmPassword, password } = this.state;
        try {
            NetInfo.fetch().then(state => {
                status = state.isConnected ? 'online' : 'offline'
                if (password !== '' && confirmPassword !== '') {
                    if (password.length >= 6) {
                        if (password === confirmPassword) {
                            if (status === 'online') {
                                this.setState({ isLoading: true })
                                this.changePasswordAPICall(password)
                            } else {
                                Constants.showSnack(this.state.translation_common[this.state.Language].No_Internet)
                            }
                        }
                        else {
                            Constants.showSnack(this.state.translation_common[this.state.Language].Password_Validation)
                        }

                    } else {
                        Constants.showSnack(this.state.translation_common[this.state.Language].Password_Character)
                    }
                } else {
                    Constants.showSnack(this.state.translation_common[this.state.Language].Enter_Password)
                }
            })
        } catch (e) {
            //console.log(e);
        }
    }

    /**
     * change password api call
     * */
    async changePasswordAPICall(password) {

        NetInfo.fetch().then(state => {
            status = state.isConnected ? 'online' : 'offline';
            if (status == 'online') {
                let url = Constants.BASE_URL_V2 + Service.CHANGEPASSWORD;

                let data = {
                    'email': email,
                    'new_password': password
                };

                axios.patch(url, data, { headers: { 'Content-Type': 'application/json' }, timeout: Constants.TIMEOUT }
                ).then(response => {
                    if (response.data.status === 200) {
                        this.setState({ isLoading: false })
                        Constants.showSnack(this.state.translation[this.state.Language].Password_Changed_MSg)
                        this.props.navigation.goBack()
                        //this.resetStack()
                    }

                }).catch((error) => {
                    this.setState({ isLoading: false })
                    Constants.showSnack(error.response.data.message)

                });
            } else {
                this.setState({ isLoading: false })
                Constants.showSnack(this.state.translation_common[this.state.Language].No_Internet)
            }
        });
    }


    /**
     * reset navigation stack
     * */
    resetStack() {
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

        this.props.navigation.navigate('TermsAndPolicy', { title: title, SelectedLan: this.state.Language })
    }

    /**
     * navigate to Signup page
     */
    goToSignUp = () => {
        this.props.navigation.navigate('SignUp');
    }

    /**
     * navigate to SignIn page
     */
    goToSignIn = () => {
        this.props.navigation.navigate('SignIn');
    }

    /** Class rendring method */
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

                    <ScrollView>
                        <KeyboardAvoidingView style={{ flex: 1 }} {...(Platform.OS === 'ios' && { behavior: 'padding' })}>
                            <View style={styles.topOverLay}>
                                {/*logo*/}
                                <Image
                                    style={styles.logo}
                                    source={eolasLogo}
                                    resizeMode='contain'
                                />

                                {/*Title*/}
                                <Text style={styles.titleText}>{this.state.translation[this.state.Language].welcome}</Text>


                                {/* Password*/}
                                <View style={[
                                    styles.inputView,
                                    {
                                        flexDirection: 'row',
                                        justifyContent: 'space-between'
                                    }]}>
                                    <View flex={1} >
                                        <TextInput
                                            style={styles.InputText}
                                            value={this.state.password}
                                            secureTextEntry={this.state.currentTextSecure}
                                            numberOfLines={1}
                                            autoCapitalize='none'
                                            underlineColorAndroid={Color.colorWhite}
                                            returnKeyType="go"
                                            placeholder={this.state.translation[this.state.Language].Password}
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

                                {/* Confirm Password*/}
                                <View style={[
                                    styles.inputView,
                                    {
                                        flexDirection: 'row',
                                        justifyContent: 'space-between'
                                    }]}>
                                    <View flex={1} >
                                        <TextInput
                                            style={styles.InputText}
                                            value={this.state.confirmPassword}
                                            secureTextEntry={this.state.confirmpasswordTextSecure}
                                            numberOfLines={1}
                                            autoCapitalize='none'
                                            underlineColorAndroid={Color.colorWhite}
                                            returnKeyType="go"
                                            placeholder={this.state.translation_signup[this.state.Language].Confirm_Password}
                                            placeholderColor={Color.colorLitGrey}
                                            placeholderTextColor={Color.colorLitGrey}
                                            selectionColor={'black'}
                                            keyboardType={"default"}
                                            ref={(input) => this.confirmPassword = input}
                                            onChangeText={confirmPassword => this.setState({ confirmPassword })} />
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

                                {/*Reset Password*/}
                                <TouchableOpacity style={styles.loginButtonColor}
                                    onPress={() => this.validation()}>
                                    {this.state.isLoading ? <ActivityIndicator
                                        style={styles.progress}
                                        color='#ffffff' size={'small'} /> :
                                        <Text style={styles.loginText}>{this.state.translation[this.state.Language].Reset_Password}</Text>}
                                </TouchableOpacity>
                                {/*SignIn*/}
                                <TouchableOpacity onPress={() => this.goToSignIn()}>
                                    <Text style={[styles.forgotText]}>{this.state.translation[this.state.Language].Signin}</Text>
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
                                        /> : <Picker
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
                                    :
                                    <View style={{ width: '30%', flexDirection: 'row' }}>
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
                        </KeyboardAvoidingView>
                    </ScrollView>
                </ImageBackground>
            </SafeAreaView>
        )
    }

}

export default ResetPassword


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
        marginTop: 60
    },
    termsOfServiceText: {
        color: Color.colorWhite,
        fontSize: Dimension.normalText,
        //alignSelf: 'center',
    },
    language: {
        width: 150, // '100%',
        //marginLeft: '25%',
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