import React, { Component } from 'react';
import {
    View,
    Text,
    Platform,
    StatusBar,
    Image,
    TouchableOpacity,
    TextInput, Dimensions, ImageBackground, ActivityIndicator, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { ScaledSheet } from 'react-native-size-matters';
import * as Color from '../style/Colors';
import * as String from '../style/Strings';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Font from '../style/Fonts';
import * as Constants from '../utils/Constants';
import * as Dimension from '../style/Dimensions';
import axios from 'axios';
import * as Service from "../utils/Api";
const { height } = Dimensions.get('window');

/** Status bar settings */
// const MyStatusBar = ({ backgroundColor, ...props }) => (
//     <View style={[styles.statusBar, { backgroundColor }]}>
//         <StatusBar translucent backgroundColor={backgroundColor} {...props} />
//     </View>
// );

let status;
class ChangePassword extends Component {
    state = {
        confirmPassword: '',
        newPassword: '',
        textVisible: true,
        confirmTextSecure: true,
        newTextSecure: true,
        isLoading: false,
        translation_signup: Constants.signup,
        translation_common: Constants.common_text,
        Language: this.props.route.params.Language
    }

    /** reseting navigation state */
    async resetStack() {
        let checkFrom = await AsyncStorage.getItem('from');
        if (checkFrom === 'signUp') {
            this.props.navigation.navigate('ProfileScreen')
        } else {
            this.props.navigation.navigate('TabContainerBase')
        }
    }

    /**
     * validation method
     * check password length and confirm password
     */
    validation() {
        const { confirmPassword, newPassword } = this.state;
        if (confirmPassword !== '' && newPassword !== '') {
            if (newPassword.length >= 6) {
                if (newPassword === confirmPassword) {
                    this.changePasswordUpdate();
                } else {
                    Constants.showSnack(this.state.translation_common[this.state.Language].Password_Validation)
                }

            } else {
                Constants.showSnack(this.state.translation_common[this.state.Language].Password_Character)
            }
        } else {
            Constants.showSnack(this.state.translation_common[this.state.Language].Enter_Password)
        }
    }

    /**
     * api calling to change password
     * */
    async changePasswordUpdate() {
        let api_key = await AsyncStorage.getItem('api_key');
        NetInfo.fetch().then(state => {
            status = state.isConnected ? 'online' : 'offline';
            if (status == 'online') {
                this.setState({ isLoading: true, textVisible: false })
                let url = Constants.BASE_URL + Service.CHANGEPASSWORD;

                let data = {
                    'new_password': this.state.newPassword
                };

                axios.patch(url, data, { headers: { 'Content-Type': 'application/json', 'Auth': api_key }, timeout: Constants.TIMEOUT }
                ).then(response => {
                    if (response.data.status === 200) {
                        this.setState({ isLoading: false, textVisible: true })
                        this.resetStack()
                    }

                }).catch((error) => {
                    this.setState({ isLoading: false, textVisible: true })
                    Constants.showSnack(error.response.data.message)

                });
            } else {
                Constants.showSnack(this.state.translation_common[this.state.Language].No_Internet)
            }
        });
    }

    /** component rendering */
    render() {
        // const languagelist = this.props.navigation.state.params.languagelist;
        // const Language = this.props.navigation.state.params.Language;
        const languagelist = this.props.route.params.languagelist;
        const Language = this.props.route.params.Language;
        return (
            <SafeAreaView style={{ backgroundColor: Color.colorDarkBlue, flex: 1 }}
                edges={['right', 'left']}
                forceInset={{
                    bottom: 'never',
                    top: 'never'
                    //   top: Platform.OS === 'ios' ? height === 812 ? 10 : 0 : 0
                }}>
                {Platform.OS == 'android' ? <StatusBar translucent backgroundColor={Color.colorBlack} barStyle="light-content" /> : null}

                <ImageBackground source={require('../images/login/signup_bg.jpg')}
                    style={styles.viewContainer}>
                    <ScrollView>
                        <View>

                            {/*titleView*/}
                            <View style={styles.titleView}>
                                <Text style={styles.titleText}>{languagelist[Language].Change_Password}</Text>
                            </View>

                            <View style={{ flex: 1, marginTop: 30 }}>
                                {/* new password*/}
                                <View style={styles.inputView}>
                                    <View flex={0.9} >
                                        <TextInput
                                            style={styles.InputText}
                                            value={this.state.newPassword}
                                            numberOfLines={1}
                                            autoCapitalize='none'
                                            secureTextEntry={this.state.newTextSecure}
                                            underlineColorAndroid={Color.colorWhite}
                                            returnKeyType="next"
                                            placeholder={languagelist[Language].New_Password}
                                            placeholderColor={Color.colorLitGrey}
                                            placeholderTextColor={Color.colorLitGrey}
                                            selectionColor={'black'}
                                            keyboardType={"default"}
                                            ref={(input) => this.newPassword = input}
                                            onChangeText={newPassword => this.setState({ newPassword })} />
                                    </View>

                                    <TouchableOpacity style={{ justifyContent: 'center' }}
                                        onPress={() => this.state.newTextSecure ? this.setState({ newTextSecure: false }) : this.setState({ newTextSecure: true })}>
                                        <View flex={0.1} style={{ justifyContent: 'center' }}>

                                            <Image
                                                style={styles.eyeImage}
                                                source={this.state.newTextSecure ? require('../images/profile/eye_invisible.png') : require('../images/profile/eye_visible.png')}
                                            />

                                        </View>
                                    </TouchableOpacity>

                                </View>

                                {/* confirm new Password*/}
                                <View style={styles.inputView}>
                                    <View flex={0.9}>
                                        <TextInput
                                            style={styles.InputText}
                                            value={this.state.confirmPassword}
                                            secureTextEntry={this.state.confirmTextSecure}
                                            numberOfLines={1}
                                            autoCapitalize='none'
                                            underlineColorAndroid={Color.colorWhite}
                                            returnKeyType="go"
                                            placeholder={this.state.translation_signup[Language].Confirm_Password}
                                            placeholderColor={Color.colorLitGrey}
                                            placeholderTextColor={Color.colorLitGrey}
                                            selectionColor={'black'}
                                            keyboardType={"default"}
                                            ref={(input) => this.confirmPassword = input}
                                            onChangeText={confirmPassword => this.setState({ confirmPassword })} />
                                    </View>

                                    <TouchableOpacity style={{ justifyContent: 'center' }}
                                        onPress={() => this.state.confirmTextSecure ? this.setState({ confirmTextSecure: false }) : this.setState({ confirmTextSecure: true })}>
                                        <View flex={0.1} style={{ justifyContent: 'center' }}>

                                            <Image
                                                style={styles.eyeImage}
                                                source={this.state.confirmTextSecure ? require('../images/profile/eye_invisible.png') : require('../images/profile/eye_visible.png')}
                                            />
                                        </View>
                                    </TouchableOpacity>

                                </View>

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
                                            <Text style={styles.skipText}>{languagelist[Language].Save}</Text>
                                        )}

                                        {this.state.isLoading && (
                                            <ActivityIndicator style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} size="small" color={Color.colorWhiteBg} />
                                        )}

                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.saveContainer, { backgroundColor: Color.colorLitGrey, marginLeft: 5 }]}
                                        onPress={() => this.resetStack()}>
                                        <Text style={styles.skipText}>{languagelist[Language].Cancel}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </ImageBackground>
            </SafeAreaView>

        )
    }

}

export default ChangePassword;

/** UI styles used for this component */
const styles = ScaledSheet.create({
    viewContainer: {
        flex: 1,
        width: '100%',
        backgroundColor: Color.colorliteWhite
    },
    titleView: {
        width: '100%',
        justifyContent: 'center',
        alignSelf: 'center',
        alignItems: 'center',
        height: Platform.OS === 'ios' ? 56 : 70 - 14,
        marginTop: 150
    },
    titleText: {
        color: Color.colorWhite,
        fontWeight: 'bold',
        justifyContent: 'center',
        fontSize: 20,
        alignSelf: 'center',
        textAlign: 'center',
        fontFamily: Font.fontRobotoBold,
        marginBottom: Dimension.marginTen,
    },
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
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    saveContainer: {
        borderRadius: 20,
        borderColor: Color.colorWhiteBg,
        borderWidth: 1,
        width: 100,
        height: 40
    },
    skipText: {
        fontSize: Dimension.normalText,
        fontFamily: Font.fontRobotoMedium,
        fontWeight: 'bold',
        color: Color.colorWhite,
        alignSelf: 'center',
        paddingTop: 10,
        paddingBottom: 10
    },
    eyeImage: {
        width: 21,
        height: 15,
        alignSelf: 'center',
        marginRight: 20
    }
})