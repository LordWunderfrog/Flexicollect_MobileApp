import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Platform,
  SectionList, ActivityIndicator, TouchableOpacity, Dimensions, StatusBar
} from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Color from '../../style/Colors';
import * as Dimension from '../../style/Dimensions';
import * as Constants from '../../utils/Constants';
import * as Font from '../../style/Fonts';
import axios from 'axios';
import * as Service from "../../utils/Api";
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Progress from 'react-native-progress';
// import { NavigationActions, StackActions } from "react-navigation";
import { CommonActions } from '@react-navigation/native';
import Mailer from 'react-native-mail';
import RNFS from "react-native-fs";

let dataSize = 0;
const { safe_height } = Dimensions.get('window');

/** Status bar settings */
// const MyStatusBar = ({ backgroundColor, ...props }) => (
//   <View style={[styles.statusBar, { backgroundColor }]}>
//     <StatusBar translucent backgroundColor={backgroundColor} {...props} />
//   </View>
// );

let finalValue = 0.0;

/** Notification class to handling list of notification */
class Notification extends Component {

  constructor(props) {
    super(props)
    this.state = {
      notificationData: [],
      isLoading: true,
      xpPoint: this.props.xpPoint,
      finalValue: 0,
      attachment: []
    }
  }

  /** component life cycle methods */
  componentDidMount() {
    this.getMissionSurvey()
  }

  UNSAFE_componentWillMount() {
    this.handler();
    this.getNotificationData();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.handler();
    this.getNotificationData();
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
      this.setState({
        xpPoint: xp
      });
    }
  }

  /**
   * api call to get notification data
   * */
  async getNotificationData() {
    let api_key = await AsyncStorage.getItem('api_key');
    let url = Constants.BASE_URL + Service.NOTIFICATION;

    if (api_key && url && api_key.length > 0 && url.length > 0) {
      axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          'Auth': api_key
        },
        timeout: Constants.TIMEOUT,
      }).then(response => {

        if (response.data.status === 1 && response.data.result && response.data.result.length > 0) {
          let notificationData = []
          response.data.result.forEach(x => {
            let notification = {};
            let data = [];
            data.push(x);
            notification['title'] = x.title;
            notification['created_on'] = new Date(x.created_on).toLocaleString();
            notification['data'] = data;
            notificationData.push(notification);
          });
          this.setState({
            notificationData: notificationData,
            isLoading: false
          })
        } else {
          this.setState({ isLoading: false, notificationData: [] });
        }
      }).catch((error) => {
        this.setState({ isLoading: false });
      }
      )
    } else {
      this.setState({ isLoading: false })
    }
  }

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

  /** Class render method */
  render() {
    const { isLoading, notificationData } = this.state;
    return (
      <SafeAreaView
        style={{ backgroundColor: Color.colorDarkBlue, flex: 1 }}
        edges={['right', 'top', 'left']}
        forceInset={{
          bottom: 'never',
          // top: Platform.OS === 'ios' ? (safe_height === 812 ? 10 : 0) : 0
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

                {this.props.isPepsicoUser == 1 ?
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
                  </View>
                  :
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

          {!isLoading && notificationData.length > 0 && (
            // <ScrollView>
            <SectionList
              style={styles.sectionListContainer}
              sections={notificationData}
              stickySectionHeadersEnabled={false}
              renderSectionHeader={({ section }) => {
                dataSize = section.data.length
                return (
                  <View style={styles.headerItem}>
                    <Text style={styles.headerLeftTitle}>{section.title}</Text>
                    <Text style={styles.headerRightTitle}>{section.created_on} </Text>
                  </View>
                )
              }}
              renderItem={({ item, index }) => {
                return (
                  <View style={index === dataSize - 1 ? styles.itemBg1 : styles.itemBg}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 12 }}>
                      <Text style={styles.itemLeftText} > {item.message} </Text>
                    </View>
                    {
                      index !== dataSize - 1 && (
                        <View style={{ backgroundColor: Color.colorGreyViewBg, alignSelf: 'stretch', height: 1, marginLeft: 12, marginRight: 12 }} />
                      )
                    }
                  </View>
                )
              }}
              keyExtractor={(item, index) => index}
            />
            // </ScrollView>
          )}
          {
            isLoading && (
              <ActivityIndicator style={{ alignSelf: 'center', flex: 1, justifyContent: 'center' }}
                size="large"
                color={Color.colorDarkBlue} />
            )
          }
          {!isLoading && notificationData.length === 0 && (
            <View style={{ alignSelf: 'center', flex: 1, flexDirection: "column", justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: Color.colorBlack, fontSize: 20 }}>{this.props.translation[this.props.Language].No_Notification}</Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    )
  }
}
export default Notification

/** status bar height setup */
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBar.currentHeight;

/** UI styles used for this class */
const width = '100%',
  height = 55,
  borders = {
    tl: 5,
    tr: 5,
    bl: 0,
    br: 0,
  },
  borders2 = {
    tl: 0,
    tr: 0,
    bl: 5,
    br: 5,
  };

const baseStyle = {
  width: width,
  height: height,
  borderTopLeftRadius: borders.tl,
  borderTopRightRadius: borders.tr,
  borderBottomLeftRadius: borders.bl,
  borderBottomRightRadius: borders.br,
};

const itemContainer = {
  width: width,
  borderTopLeftRadius: borders2.tl,
  borderTopRightRadius: borders2.tr,
  borderBottomLeftRadius: borders2.bl,
  borderBottomRightRadius: borders2.br,
};

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
  statusBar: {
    height: STATUSBAR_HEIGHT
  },
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: Color.colorWhite
  },
  sectionListContainer: {
    marginTop: 2,
    marginLeft: Dimension.marginEight,
    marginRight: Dimension.marginEight,
    marginBottom: 10
  },
  headerItem: {
    // flexDirection:'row',
    overflow: 'hidden',
    justifyContent: 'center',
    backgroundColor: Color.colorLiteBlue,
    marginTop: Dimension.marginEight,
    ...baseStyle,
  },
  headerLeftTitle: {
    color: Color.colorWhite,
    fontSize: Dimension.mediumText,
    fontFamily: Font.fontRobotoBold,
    fontWeight: 'bold',
    // alignSelf:'center',
    paddingLeft: 12,
    // marginTop:2,
  },
  headerRightTitle: {
    color: Color.colorWhite,
    opacity: 0.5,
    fontSize: Dimension.normalText,
    // alignSelf:'center',
    // paddingRight: 8
    paddingLeft: 12,
    // marginBottom:2,
    marginTop: 2
  },
  itemBg1: {
    backgroundColor: Color.colorWhite,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderBottomWidth: 1,
    borderLeftColor: Color.colorGridGrey,
    borderRightColor: Color.colorGridGrey,
    borderBottomColor: Color.colorGridGrey,
    shadowColor: Color.colorGrey,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
    ...itemContainer
  },
  itemBg: {
    backgroundColor: Color.colorWhite,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderLeftColor: Color.colorGridGrey,
    borderRightColor: Color.colorGridGrey,
  },
  itemLeftText: {
    color: Color.colorDescription,
    fontSize: Dimension.normalText
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
  }
})