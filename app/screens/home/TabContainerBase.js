import React, { Component } from 'react';
import {
    View, Platform, Linking, ActivityIndicator
} from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import * as Color from '../../style/Colors';
import * as Dimension from '../../style/Dimensions';
import PagerTabIndicator from '../tabscontainer/PagerTabIndicator';
import IndicatorViewPager from '../tabscontainer/IndicatorViewPager';
import Home from "./Home";
import Notification from "./Notification";
import Profile from "./Profile";
import ProfileScreen from "../profile/ProfileScreen";
// import Orientation from "react-native-orientation";
import Orientation from "react-native-orientation-locker";
import { CommonActions } from '@react-navigation/native';
import * as Constants from '../../utils/Constants';
import axios from 'axios';
import * as Service from "../../utils/Api";
import NetInfo, { NetInfoSubscription, NetInfoState } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

let connected = true;
class TabContainerBase extends Component {
    constructor(props) {
        super(props)
        this.state = {
            imageProfile: require('../../images/profile/user.png'),
            profileName: 'User Name',
            page: 0,
            xpPoint: '0/0',
            Language: global.language,
            // translation: Platform.OS == 'ios' ? Constants.home_mission : [], //TODO uncomment while new key added in language api
            translation: Constants.home_mission,
            currentStreak: 0,
            isPepsicoUser: '0',
            availableBadgesData: [],
            badgesData: []
        }
        this.handleImage();
        this.handleName();
        this.handleXP();
        this.handlePepsiCoUserData();
        this.handleNavigation = this.handleNavigation.bind(this);
    }

    /** Component life cycle methods */
    UNSAFE_componentWillMount() {
        //TODO remove comment once new key added in language translation page
        //this.getpagetranslation()
    }
    componentDidMount() {
        Orientation.lockToPortrait();
        this.linkTabbar = Linking.addEventListener('url', this.handleNavigation);
        this._subscription = NetInfo.addEventListener(
            this._handleConnectivityChangeTabbar,
        );

    }
    componentWillUnmount() {
        // Remove the event listener
        // Linking.removeEventListener('url', this.handleNavigation);
        this.linkTabbar && this.linkTabbar.remove()
        this._subscription && this._subscription();
    }
    componentDidUpdate(prevProps, prevState) {
        /** detect language change from profile screen and reload bottom tabbar text
         *  value as per the language change
         */
        // let paramLanguage = this.props.navigation.state.params
        let paramLanguage = this.props.route.params
        if (paramLanguage && paramLanguage.language != prevState.language) {
            this.setState({ Language: paramLanguage.language })
            // this.props.navigation.setParams({ language: prevState.language });
            this.props.navigation.dispatch(CommonActions.setParams({ language: prevState.language }));
        }
    }
    /**
     * Check device internet connectivity and notify device online or offline
     */
    _handleConnectivityChangeTabbar = (state) => {
        if (state.isConnected) {
            if (!connected) {
                connected = state.isConnected;
                this.handlePepsiCoUserData()
            }
        } else {
            connected = state.isConnected;
        }
    };

    /**
     * Filter mission details from url
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
     * Get selected language page translation data from api
     */
    getpagetranslation() {
        NetInfo.fetch().then(state => {
            let status = state.isConnected ? "online" : "offline";
            if (status === "online") {
                let url = Constants.BASE_URL + Service.TRANSLATION_PAGE + 'home_mission';
                axios.get(url).then(response => {
                    this.setState({ translation: response.data.data });
                })
                    .catch((error) => {
                        this.setState({ translation: Constants.home_mission });
                    });
            }
            else {
                this.setState({ translation: Constants.home_mission });
            }
        })
    }

    /**
     * Handle navigation
     * @param {boject} event - take to linked survey in url 
     */
    handleNavigation(event) {
        try {
            if (event.url && event.url != "") {
                let newUrl = event.url;
                if (Platform.OS == 'ios') {
                    if (newUrl.indexOf("deep_link_id=")) {
                        newUrl = (newUrl.replace(new RegExp('.*' + "deep_link_id="), ''));
                    }
                }
                newUrl = decodeURIComponent(newUrl);
                const id = this.getParameterByName("mission", newUrl)
                const name = this.getParameterByName("name", newUrl)
                if (Platform.OS == 'ios') {
                    if (parseInt(id) > 0) {
                        this.props.navigation.navigate('SurveyBox', { missionId: id, missionName: name, from: 'home' })
                    }
                }
                else {
                    this.props.navigation.navigate('SurveyBox', { missionId: id, missionName: name, from: 'home' })
                }
            }
        } catch (err) {
            Constants.showSnack(err.message);
        }
    }

    /**
     * 'handleImage' this method update imageProfile state , when we called this in profile screen(on api call [this.props.imageProfile()] )
     * */
    async handleImage() {
        try {
            if (global.profileImage !== null && global.profileImage !== "" && global.profileImage !== undefined) {
                this.setState({
                    imageProfile: { uri: global.profileImage }
                });
            }
            let profileImage = await AsyncStorage.getItem("profileImage");
            if (profileImage !== null && profileImage !== undefined) {
                this.setState({
                    imageProfile: { uri: profileImage }
                });
            }
        } catch (e) {
            // console.log('Exception::', e)
        }


    }

    /**
     * 'handleName' this method update profileName state , when we called this in profile screen(on api call [this.props.profileName()] )
     * */
    async handleName() {
        try {
            let profileName = await AsyncStorage.getItem("profileName");
            if (profileName !== null && profileName !== undefined) {
                this.setState({
                    profileName: profileName
                });
            }
        } catch (e) {
            // console.log('Exception::', e)
        }
    }

    /**
     * 'handleXP' this method update xp state when there is change in mission page
     * */
    async handleXP() {
        try {
            let xpPoint = await AsyncStorage.getItem("xpPoint");
            if (xpPoint !== null) {
                this.setState({
                    xpPoint: xpPoint
                });
            }
        } catch (e) {
            //ignore error
        }
    }

    /**
     * Handle straek data - this method called when streak update in profile screen. 
     */
    async handlePepsiCoUserData() {
        try {
            let currentStreak = await AsyncStorage.getItem('CurrentStreak');
            let userStatus = await AsyncStorage.getItem('isPepsicoUser')
            let availableBadges = await AsyncStorage.getItem('AvailableBadges')
            let badges = await AsyncStorage.getItem('Badges')
            this.setState({
                currentStreak: (currentStreak != null && currentStreak != undefined) ? currentStreak : 0,
                isPepsicoUser: (currentStreak != null && currentStreak != undefined) ? userStatus : '0',
                availableBadgesData: (availableBadges != null && availableBadges != undefined && availableBadges.length > 0) ? JSON.parse(availableBadges) : [],
                badgesData: (badges != null && badges != undefined && badges.length > 0) ? JSON.parse(badges) : []
            });
        } catch (e) {
            //ignore error
        }
    }


    /**
     * Render Bottom Tap Menu
     */
    IndicatorViewPgerMethod() {
        const { page } = this.state;
        if (Platform.OS === 'ios') {
            return (
                <IndicatorViewPager
                    navigation={this.props.navigation}
                    horizontalScroll={true}
                    onPageScroll={(params) => params.position === 2 ? this.setState({ page: params.position }) : ''}
                    onPageSelected={(params) => params.position === 2 ? this.setState({ page: params.position }) : ''}
                    style={{ flex: 1, height: 60, flexDirection: 'column', backgroundColor: Color.colorWhite }}
                    indicator={this._renderTabIndicator()}
                    initialPage={0}>
                    {/* *'this.state.imageProfile' we passing this state from here to home to set profile image*/}
                    <View>
                        <Home navigation={this.props.navigation} storedValue={this.state.imageProfile} profileName={this.state.profileName} handleXP={this.handleXP.bind(this)}
                            translation={this.state.translation} Language={this.state.Language} currentStreak={this.state.currentStreak} isPepsicoUser={this.state.isPepsicoUser}
                            availableBadgesData={this.state.availableBadgesData} badgesData={this.state.badgesData} />

                    </View>
                    <View>
                        <Notification navigation={this.props.navigation} storedValue={this.state.imageProfile} profileName={this.state.profileName} xpPoint={this.state.xpPoint}
                            translation={this.state.translation} Language={this.state.Language} currentStreak={this.state.currentStreak} isPepsicoUser={this.state.isPepsicoUser} />

                    </View>
                    {/**'handleImage' this method update imageProfile state , when we called this in profile screen(on api call [this.props.imageProfile()] )*/}
                    <View>
                        <ProfileScreen navigation={this.props.navigation}
                            imageProfile={this.handleImage.bind(this)} profileNameUpdate={this.handleName.bind(this)} handlePepsiCoUserData={this.handlePepsiCoUserData.bind(this)} />
                    </View>

                </IndicatorViewPager>
            )
        } else {
            return (
                <IndicatorViewPager
                    navigation={this.props.navigation}
                    horizontalScroll={true}
                    style={{ flex: 1, height: 60, flexDirection: 'column', backgroundColor: Color.colorWhite }}
                    indicator={this._renderTabIndicator()}
                    initialPage={0}>
                    {/* *'this.state.imageProfile' we passing this state from here to home to set profile image*/}
                    <View>
                        <Home navigation={this.props.navigation} storedValue={this.state.imageProfile} profileName={this.state.profileName} handleXP={this.handleXP.bind(this)}
                            translation={this.state.translation} Language={this.state.Language} currentStreak={this.state.currentStreak} isPepsicoUser={this.state.isPepsicoUser}
                            availableBadgesData={this.state.availableBadgesData} badgesData={this.state.badgesData} />
                    </View>
                    <View>
                        <Notification navigation={this.props.navigation} storedValue={this.state.imageProfile} profileName={this.state.profileName} xpPoint={this.state.xpPoint}
                            translation={this.state.translation} Language={this.state.Language} currentStreak={this.state.currentStreak} isPepsicoUser={this.state.isPepsicoUser} />
                    </View>
                    {/**'handleImage' this method update imageProfile state , when we called this in profile screen(on api call [this.props.imageProfile()] )*/}
                    <View>
                        {/* <ProfileScreen navigation={this.props.navigation} imageProfile={this.handleImage.bind(this)} profileNameUpdate={this.handleName.bind(this)} handlePepsicoUserData={this.handlePepsiCoUserData.bind(this)} /> */}
                        <ProfileScreen navigation={this.props.navigation}
                            imageProfile={this.handleImage.bind(this)} profileNameUpdate={this.handleName.bind(this)} handlePepsiCoUserData={this.handlePepsiCoUserData.bind(this)} />
                    </View>

                </IndicatorViewPager>
            )
        }
    }

    /** component rendering */
    render() {
        if (this.state.translation.length < 1) {
            return (
                <ActivityIndicator style={{ alignSelf: 'center', flex: 1, justifyContent: 'center' }}
                    size="large"
                    color={Color.colorDarkBlue} />
            )
        }
        return (this.IndicatorViewPgerMethod())
    }

    /**
     * render Bottom Menu Details
     */
    _renderTabIndicator() {
        let tabs = [{
            text: this.state.translation[this.state.Language].Home,
            iconSource: require('../../images/home/bottomtab/home.png'),
            selectedIconSource: require('../../images/home/bottomtab/home.png'),
            textStyle: styles.tabText,
            selectedIconStyle: styles.homeIcon,
            iconStyle: styles.homeIcon,
            count: '1'
        }, {
            text: this.state.translation[this.state.Language].Notifications,
            iconSource: require('../../images/home/bottomtab/bell.png'),
            selectedIconSource: require('../../images/home/bottomtab/bell.png'),
            textStyle: styles.tabText,
            iconStyle: styles.notificationIcon,
            selectedIconStyle: styles.notificationIcon,
            count: '1'
        },
        {
            text: this.state.translation[this.state.Language].Profile,
            iconSource: require('../../images/home/bottomtab/profile.png'),
            selectedIconSource: require('../../images/home/bottomtab/profile.png'),
            textStyle: styles.tabText,
            iconStyle: styles.profileIcon,
            selectedIconStyle: styles.profileIcon,
            count: '1'
        }
        ];
        return <PagerTabIndicator tabs={tabs}
            initialPage={0}
            tabStyle={styles.tabContainer}
        />;
    }

}

export default TabContainerBase

/** UI styles used for this component */
export const styles = ScaledSheet.create({
    tabText: {
        color: Color.colorWhite,
        fontSize: Dimension.mediumText,
        alignSelf: 'center'
    },
    homeIcon: {
        width: 18,
        height: 17,
        alignSelf: 'center',
        justifyContent: 'center'
    },
    notificationIcon: {
        width: 17,
        height: 20,
        alignSelf: 'center',
        justifyContent: 'center'
    },
    profileIcon: {
        width: 15,
        height: 18.5,
        alignSelf: 'center',
        justifyContent: 'center'
    },
    tabContainer: {
        flexDirection: 'row',
        height: '59@vs',
        justifyContent: 'center',
        backgroundColor: Color.colorDarkBlue
    },
    progress: {
        paddingLeft: 42,
        paddingRight: 42,
        position: 'absolute',
    }

})