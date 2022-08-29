import React, { Component } from 'react';
import {
  View,
  Text,
  Platform,
  StatusBar,
  Image,
  TouchableOpacity,
  Dimensions,
  TextInput
} from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import * as Color from '../../style/Colors';
import * as Dimension from '../../style/Dimensions';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Font from '../../style/Fonts';
import * as Progress from 'react-native-progress';
import PagerTabIndicator from '../tabscontainer/PagerTabIndicator';
import IndicatorViewPager from '../tabscontainer/IndicatorViewPager';
import Mission from './Mission';
import History from './History';
//import { NavigationActions, StackActions } from "react-navigation";
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Mailer from 'react-native-mail';
import RNFS from "react-native-fs";
import ModalComponent from "../../components/ModalComponent"
import * as Constants from '../../utils/Constants';
import * as Service from "../../utils/Api";
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import { measureConnectionSpeed } from '../../components/GetNetworkSpeed';
const { height } = Dimensions.get('window');

/** Status bar settings */
// const MyStatusBar = ({ backgroundColor, ...props }) => (
//   <View style={[styles.statusBar, { backgroundColor }]}>
//     <StatusBar translucent backgroundColor={backgroundColor} {...props} />
//   </View>
// );


let finalValue = 0.0;
let status;
class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      xpPoint: '0/0',
      totalPoint: 1,
      currentPoint: 1,
      finalValue: 0,
      position: 0,
      attachment: [],
      pepsiCoCode: '',
      pepsiCodeModal: false,
      translation_common: Constants.common_text,
    };

    this.handler();
    //this.checkNetworkSpeed()
  }

  componentDidMount() {
    StatusBar.setHidden(false);
    this.getMissionSurvey()

    setTimeout(() => {
      this.checkPepsicoUser()
    }, Platform.OS == 'ios' ? 1500 : 2000);
  }

  /** check network speed if slow network then set offline mode */
  // checkNetworkSpeed = async () => {
  //   try {
  //     const networkSpeed = await measureConnectionSpeed();
  //     console.log('Network speed is globle in home', networkSpeed)
  //     if (networkSpeed.finalspeed < 2.1) {
  //       global.isSlowNetwork = true
  //     }
  //     else {
  //       global.isSlowNetwork = false
  //     }
  //   } catch (err) {
  //     console.log('error', err);
  //     global.isSlowNetwork = true
  //   }
  // }

  /** check user is pepsico and manage */
  async checkPepsicoUser() {
    let userInfo = await AsyncStorage.getItem('UserInfo')
    let domains = await AsyncStorage.getItem('Domains')

    let accessCode = JSON.parse(userInfo).access_code
    if (domains && JSON.parse(domains) == 1) {
      this.setState({ pepsiCodeModal: !accessCode ? true : false })
    }
  }

  /**
   * get profile image uri and xpPoints from local storage
   */
  async handler() {

    let profileImage = await AsyncStorage.getItem("profileImage");
    if (profileImage !== null && profileImage !== undefined) {
      this.props.storedValue = { uri: profileImage };
    }

    let xp = await AsyncStorage.getItem('xpPoint');

    if (xp !== null) {
      let value = xp.split('/');
      finalValue = value[0] / value[1];
      finalValue = isNaN(finalValue) ? 0 : finalValue;
      // this.setState({finalValue: finalValue})
      this.setState({
        xpPoint: xp
      });
      this.props.handleXP();
    }
  }

  /**
   * 
   * @param {number} p - Handle the selected tab 
   */
  onPageSelected(p) {
    //set position
    this.setState({ position: p.position })
  }

  /** Class render method */
  render() {
    return (
      <SafeAreaView
        style={{ backgroundColor: Color.colorDarkBlue, flex: 1 }}
        edges={['right', 'top', 'left']}
        forceInset={{
          bottom: 'never',
          // top: Platform.OS === 'ios' ? (height === 812 ? 10 : 0) : 0
        }}
      >
        {/* {Platform.OS == 'android' ? <MyStatusBar
          backgroundColor={Color.colorBlack}
          barStyle="light-content"
        /> : null} */}
        {Platform.OS == 'android' ? <StatusBar translucent barStyle="light-content" backgroundColor={Color.colorBlack}></StatusBar> : null}
        <View style={styles.viewContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => this.imagePressed()}>
              <View style={{ marginLeft: 20, marginRight: 10 }}>
                <Text style={styles.nameText}>{this.props.profileName}</Text>

                {this.props.isPepsicoUser == '1' ?
                  <View style={styles.streakView}>
                    <View style={styles.streakTextWrap}>
                      <Text style={styles.straekValue}>{this.props.currentStreak}</Text>
                      <Text style={styles.strakText}>{this.props.translation[this.props.Language].Streak}</Text>
                    </View>
                    <Image
                      style={styles.streakImage}
                      resizeMode={'contain'}
                      source={require('../../images/awards/streakFlame.png')}
                    />
                    <View style={{ marginLeft: 3 }}>
                      <Text style={styles.countText}>{this.state.xpPoint}</Text>
                      <Progress.Bar
                        progress={finalValue}
                        width={148}
                        color={Color.colorGreen}
                        borderColor={Color.colorDarkBlue}
                        unfilledColor={Color.colorWhite}
                        animated={true}
                      />
                    </View>
                  </View> :
                  <View style={{ flexDirection: 'row' }}>
                    <Image
                      style={styles.goldBadge}
                      source={require('../../images/home/goldbadge.png')}
                    />
                    <View style={{ marginLeft: 8 }}>
                      <Text style={styles.countText}>{this.state.xpPoint}</Text>
                      <Progress.Bar
                        progress={finalValue}
                        width={148}
                        color={Color.colorGreen}
                        borderColor={Color.colorDarkBlue}
                        unfilledColor={Color.colorWhite}
                        animated={true}
                      />
                    </View>
                  </View>}
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={this.supportAction}>
              <Image
                style={{ padding: 20, margin: 30, borderRadius: 5, backgroundColor: Color.colorOrange }}
                resizeMode='cover'
                source={require('../../images/home/support_icon.png')}
              />
            </TouchableOpacity>
          </View>

          {/*tab*/}
          <IndicatorViewPager
            style={{
              flex: 1,
              height: 45,
              flexDirection: 'column-reverse',
              backgroundColor: Color.colorDarkBlue
            }}
            indicator={this._renderTabIndicator()}
            initialPage={0}
            onPageSelected={p => { Platform.OS == 'ios' ? this.onPageSelected(p) : {} }}
          >
            <View>
              <Mission
                navigation={this.props.navigation}
                xpPoint={this.handler.bind(this)}
                translation={this.props.translation}
                Language={this.props.Language}
                isPepsicoUser={this.props.isPepsicoUser}
              />
            </View>
            <View>
              <History navigation={this.props.navigation}
                xpPoint={this.state.xpPoint}
                translation={this.props.translation}
                position={this.state.position}
                Language={this.props.Language}
                isPepsicoUser={this.props.isPepsicoUser}
                availableBadgesData={this.props.availableBadgesData}
                badgesData={this.props.badgesData}
                currentStreak={this.props.currentStreak}
              />
            </View>
          </IndicatorViewPager>

          <ModalComponent
            modalStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
            isDialogVisible={this.state.pepsiCodeModal}
            children={
              <View style={styles.modelMainView}>
                <View style={styles.modelHeader}>
                  <Image
                    style={styles.welcomeImage}
                    source={require('../../images/home/logoIcon.png')}
                  />
                  <Text style={styles.welcomeText}>{this.props.translation[this.props.Language].Welcome}</Text>
                </View>

                <View style={styles.modelBody}>
                  <Text style={styles.modelBodyText}>{this.props.translation[this.props.Language].Hi + ' ' + this.props.profileName}</Text>
                  <Text style={styles.modelBodyText}>{this.props.translation[this.props.Language].enter_participantCode}</Text>
                  <Text style={{ marginTop: Dimension.marginFifteen, fontSize: Dimension.normalText, fontStyle: 'italic', color: Color.colorBlack }}>{this.props.translation[this.props.Language].code_info}</Text>
                </View>

                <View style={styles.modelInputViewWrap}>
                  <TextInput
                    value={this.state.pepsiCoCode}
                    placeholderTextColor={Color.colorLitGrey}
                    placeholderColor={Color.colorLitGrey}
                    selectionColor={Color.colorBlack}
                    underlineColorAndroid={Color.colorWhiteBg}
                    onChangeText={(text) => { this.setState({ pepsiCoCode: text }) }}
                    style={{
                      flex: 1, marginHorizontal: 10,
                      color: Color.colorBlack
                    }}
                  >
                  </TextInput>
                </View>

                <View style={{ width: '100%', alignItems: 'center' }}>
                  <TouchableOpacity
                    style={styles.modelButton}
                    onPress={() => { this.sendAccesCode() }}>
                    <Text style={styles.buttonText}>{this.props.translation[this.props.Language].Continue}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.skipbutton}
                    onPress={() => { this.skipAccessCodeAction() }}>
                    <Text style={[styles.buttonText, { fontSize: Dimension.normalText }]}>{this.props.translation[this.props.Language].Skip}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            }
            closeDialog={() => { }}>
          </ModalComponent>

        </View >
      </SafeAreaView >
    );
  }

  /**
   * move to profile screen when user taps profile menu
   */
  imagePressed() {

    // const resetAction = StackActions.reset({
    //   index: 0,
    //   actions: [NavigationActions.navigate({ routeName: 'ProfileScreen' })],
    // });
    // this.props.navigation.dispatch(resetAction);
    const resetAction = CommonActions.reset({
      index: 0,
      routes: [{ name: 'ProfileScreen' }],
    });
    this.props.navigation.dispatch(resetAction);
  }

  /** Mailing Support Service */
  getMissionSurvey = async () => {
    /** getting survey for attach in mail */
    let missionObject = await AsyncStorage.getItem('missionData');
    if (missionObject !== null && missionObject !== undefined && missionObject.length > 0) {
      let missionData = JSON.parse(missionObject);
      missionData && missionData.map(async (missionobj) => {
        let questionArr_temp = await AsyncStorage.getItem(missionobj.id.toString() + '_LastAccess');
        if (questionArr_temp !== null && questionArr_temp !== undefined && questionArr_temp !== '') {
          let LastAccess_questionArr = JSON.parse(questionArr_temp);
          let surveyObj = {
            mission_id: missionobj.id,
            mission_name: missionobj.mission_name,
            surveyData: JSON.parse(LastAccess_questionArr.questionArr)
          }
          this.setState({ attachment: [...this.state.attachment, surveyObj] })
        }
      })
    }
  }
  /** Support action for sending mail with last survey attachment */
  supportAction = async () => {
    let allMission = this.state.attachment
    let path_name = RNFS.DocumentDirectoryPath + "/" + "missions.txt";
    await RNFS.writeFile(path_name, JSON.stringify(allMission), 'utf8')
      .then(async (success) => {
        let attachmentsObj = {
          path: path_name,  // The absolute path of the file from which to read data.
          type: 'text',   // Mime Type: jpg, png, doc, ppt, html, pdf, csv
          // mimeType - use only if you want to use custom type
          //name: missionobj.mission_name,   // Optional: Custom filename for attachment
        }

        Mailer.mail({
          subject: 'Flexicollect Support Request',
          recipients: ['flexicollect-support@eolasinternational.com'],
          ccRecipients: [''],
          bccRecipients: [''],
          body: '',
          //customChooserTitle: "This is my new title", // Android only (defaults to "Send Mail")
          isHTML: true,
          attachments: [attachmentsObj]
        }, (error, event) => {
          console.log('error is', error)
        });
      })
      .catch((err) => {
        console.log('Error in write file', err.message);
      });

  }

  /**
   * render menu details
   */
  _renderTabIndicator() {
    let tabs = [
      {
        text: this.props.translation[this.props.Language].Mission,
        textStyle: styles.tabText,
        selectedBorder: styles.borderLine,
        itemStyle: styles.selectedTab,
        count: '2'
      },
      {
        text: this.props.isPepsicoUser == '1' ? this.props.translation[this.props.Language].Achievements : this.props.translation[this.props.Language].History,
        textStyle: styles.tabText,
        selectedBorder: styles.borderLine,
        itemStyle: styles.selectedTab,
        count: '2'
      }
    ];
    return (
      <PagerTabIndicator
        tabs={tabs}
        initialPage={0}
        tabStyle={styles.tabContainer}
      />
    );
  }

  /** Api call for sendig the acess_code to server for pepsico user  */
  async sendAccesCode() {
    if (this.state.pepsiCoCode.trim()) {
      this.setState({ pepsiCodeModal: false })
      let api_key = await AsyncStorage.getItem('api_key');
      let url = Constants.BASE_URL + Service.SEND_PEPSICO_CODE + this.state.pepsiCoCode.trim();
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
              if (this.state.pepsiCoCode != 'skip') {
                Constants.saveKey('isPepsicoUser', '1')
              }
              // const resetAction = StackActions.reset({
              //   index: 0,
              //   actions: [NavigationActions.navigate({ routeName: 'TabContainerBase' })],
              // });
              //this.props.navigation.dispatch(resetAction);
              const resetAction = CommonActions.reset({
                index: 0,
                routes: [{ name: 'TabContainerBase' }],
              });
              this.props.navigation.dispatch(resetAction);
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
          Constants.showSnack(this.state.translation_common[this.props.Language].No_Internet)
        }
      });
    }
    else {
      Constants.showSnack(this.props.translation[this.props.Language].enterPepsicoCode)
    }
  }
  skipAccessCodeAction() {
    /**While user click skip then send code skip */
    this.setState({ pepsiCoCode: 'skip' }, () => {
      this.sendAccesCode()
    })
  }
}

export default Home;

/** status bar height setup */
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBar.currentHeight;

/** UI styles used for this class */
const styles = ScaledSheet.create({
  viewContainer: {
    flex: 1,
    backgroundColor: Color.colorWhiteBg
  },
  header: {
    height: 120,
    backgroundColor: Color.colorDarkBlue,
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  profileImage: {
    borderRadius: Platform.OS === 'ios' ? 50 : 100,
    alignSelf: 'center',
    marginTop: 9,
    width: 100,
    height: 100,
    borderColor: Color.colorWhite,
    borderWidth: 1,
    marginLeft: Dimension.marginTwenty
  },
  nameText: {
    color: Color.colorWhiteBg,
    fontSize: Dimension.bigeText,
    fontFamily: Font.fontRobotoBold,
    paddingLeft: 5,
    marginTop: 20,
    fontWeight: 'bold'
  },
  goldBadge: {
    width: 25,
    height: 30,
    marginLeft: 3,
    marginTop: 3
  },
  countText: {
    color: Color.colorWhiteBg,
    fontSize: Dimension.normalText
  },
  edit: {
    width: 25,
    height: 25,
    marginRight: 14
  },
  tabText: {
    color: Color.colorWhite,
    fontSize: Dimension.largeText,
    alignSelf: 'center'
  },
  borderLine: {
    backgroundColor: Color.colorYellow,
    height: 4,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0
  },
  selectedTab: {
    backgroundColor: Color.colorGreen
  },
  tabContainer: {
    flexDirection: 'row',
    height: '45@vs',
    justifyContent: 'center',
    borderTopWidth: 0.5,
    borderTopColor: Color.colorBlack,
    backgroundColor: Color.colorDarkBlue
  },
  statusBar: {
    height: STATUSBAR_HEIGHT
  },
  streakView: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  streakTextWrap: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  straekValue: {
    color: Color.colorWhite,
    fontSize: Dimension.extraLargeText,
    fontFamily: Font.fontRobotoBold
  },
  strakText: {
    color: Color.colorWhite,
    fontSize: Dimension.fontSmall,
    fontFamily: Font.fontRobotoMedium
  },
  streakImage: {
    width: 30,
    height: 30,
    marginLeft: 2,
    marginTop: 3
  },
  /** model for the pepsico user */
  modelMainView: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Color.colorWhiteBg
  },
  modelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  welcomeImage: {
    height: 30,
    width: 30,
    borderRadius: 15
  },
  welcomeText: {
    marginLeft: 10,
    fontSize: Dimension.extraLargeText,
    fontFamily: Font.fontRobotoBold,
    color: Color.colorBlack
  },
  modelBody: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modelBodyText: {
    marginTop: Dimension.marginFifteen,
    fontSize: Dimension.normalText,
    fontFamily: Font.fontSansSemiBold,
    textAlign: 'center',
    color: Color.colorBlack
  },
  modelInputViewWrap: {
    height: 40,
    borderColor: Color.colorbggrey,
    borderWidth: 1,
    margin: 15,
    width: '90%'
  },
  modelButton: {
    backgroundColor: Color.colorDarkBlue,
    borderRadius: 20,
    borderColor: Color.colorWhite,
    borderWidth: 1,
    width: '70%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  skipbutton: {
    backgroundColor: Color.colorDarkBlue,
    borderRadius: 20,
    borderColor: Color.colorWhite,
    borderWidth: 1,
    width: '50%',
    height: 35,
    marginTop: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: Dimension.mediumText,
    fontFamily: Font.fontSansSemiBold,
    textAlign: 'center',
    color: Color.colorWhite,
    alignItems: 'center',
    justifyContent: 'center'
  }
});