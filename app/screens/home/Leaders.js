import React, { Component } from 'react';
import {
    View,
    Text,
    Dimensions,
    Image,
    ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoSubscription, NetInfoState } from '@react-native-community/netinfo';
import { ScaledSheet } from 'react-native-size-matters';
import * as Color from '../../style/Colors';
import * as Dimension from '../../style/Dimensions';
import * as Font from '../../style/Fonts';
import * as Constants from '../../utils/Constants';
import axios from 'axios';
import * as Service from "../../utils/Api";
import * as String from '../../style/Strings';
import DropDownPicker from '../../components/DropDownPicker'
import { Table, Row, Rows, Col, Cols } from 'react-native-table-component';

import rankImage from '../../images/leaders/rankImage.png';
const { width, height } = Dimensions.get("window");
let status;
class Leaders extends Component {
    state = {
        leadersHeader: [
            this.props.translation[this.props.Language].Position,
            this.props.translation[this.props.Language].User,
            this.props.translation[this.props.Language].Total_Points
        ],
        flexArray: [2, 5, 3],
        leaderBoardListingData: [],
        leadersData: [],
        currentUserIndex: 0,
        isOfflineData: false
    }

    /** components life cycle methods */
    componentDidMount() {
        this.getLeaderboardListing()
    }
    componentWillUnmount() {

    }

    /**
    * api call for getting leader board available associated with the domain 
    **/
    async getLeaderboardListing() {
        let api_key = await AsyncStorage.getItem('api_key');
        let url2 = Constants.BASE_URL + Service.GET_LEADERBOARD_DATA;
        NetInfo.fetch().then(state => {
            status = state.isConnected ? 'online' : 'offline';
            if (status == 'online') {
                axios.get(url2, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Auth': api_key
                    },
                    timeout: Constants.TIMEOUT,
                }).then(response => {
                    if (response.data.status === 200) {
                        let avail = response.data.availableLeaderBoards;
                        let tempLeaderData = []
                        avail && avail.map((obj, index) => {
                            tempLeaderData.push({
                                id: index,
                                label: obj.leaderboardName,
                                value: obj.leaderboardName,
                                mission_id: obj.mission_id,
                                selected: index == 0 ? true : false //default first item selected
                            })
                        })
                        Constants.saveKey('LeaderBoradListing', JSON.stringify(tempLeaderData))
                        this.setState({ leaderBoardListingData: tempLeaderData }, () => {
                            this.getLeaderPointTableData(tempLeaderData[0])  //default first item selected
                        })
                    }
                }).catch(error => {
                    console.log('error', error)
                })
            }
            else {
                this.setState({ isOfflineData: true }, () => {
                    this.getLocalLeaderBoardListingData()
                })
            }
        });
    }
    /** get leader data locally for offline */
    async getLocalLeaderBoardListingData() {
        let dataArray = await AsyncStorage.getItem('LeaderBoradListing');
        if (dataArray != null && dataArray != undefined && dataArray.length > 0) {
            this.setState({ leaderBoardListingData: JSON.parse(dataArray) })
        }
    }


    /**
    * Dropdown item selection set answer
    * @param selectedItem - selected item
    * */
    dropDownSelection(selectedItem) {
        this.state.leaderBoardListingData && this.state.leaderBoardListingData.map((obj, index) => {
            if (obj.id == selectedItem.id) {
                obj['selected'] = true
            }
            else {
                obj['selected'] = false
            }
        })
        if (selectedItem) {
            this.getLeaderPointTableData(selectedItem)
        }
    }


    /**
    * api call for getting leader board points table data 
    * @param item, selected leader mission type 
    **/
    async getLeaderPointTableData(item) {
        let api_key = await AsyncStorage.getItem('api_key');
        let userInfoData = await AsyncStorage.getItem('UserInfo');
        let userFirstName = await AsyncStorage.getItem('firstName');
        let userLastName = await AsyncStorage.getItem('lastName');
        let url2 = Constants.BASE_URL + Service.GET_LEADER_TABLE_DATA + item.mission_id;
        NetInfo.fetch().then(state => {
            status = state.isConnected ? 'online' : 'offline';
            if (status == 'online') {
                axios.get(url2, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Auth': api_key
                    },
                    timeout: Constants.TIMEOUT,
                }).then(response => {
                    if (response.data.status === 200) {
                        let leaderboard = response.data.leaderBoards;
                        let tempLeaderData = []
                        let elementData = []
                        let userindex = -1
                        let userinfo = JSON.parse(userInfoData)

                        /** short array based on points and if all points 0 then sort by
                         * alphabatic order 
                         */
                        let pointIsZero = leaderboard.filter(function (item) {
                            return item.points != 0;
                        })
                        if (pointIsZero.length > 0) {
                            leaderboard = leaderboard.sort((a, b) => (a.points < b.points ? 1 : -1));
                        }
                        else {
                            leaderboard = leaderboard.sort((a, b) => a.firstname.localeCompare(b.firstname))
                        }

                        /** leaderboard data managing with current user index */
                        leaderboard && leaderboard.map((leaderObj, index) => {
                            if (leaderObj.id == userinfo.id) {
                                userindex = index
                            }
                            elementData = [index + 1, leaderObj.firstname + ' ' + (leaderObj.lastname && leaderObj.lastname.charAt(0)), leaderObj.points]
                            tempLeaderData.push(elementData)
                        })

                        this.setState({ leadersData: tempLeaderData, currentUserIndex: userindex })
                    }
                }).catch(error => {
                    console.log('error', error)
                })
            }
        });
    }

    /** Class render method*/
    render() {
        return (
            <View style={styles.viewContainer}>
                <View
                    key={Date.now()}
                    style={styles.dropdownWrap}>
                    <DropDownPicker
                        items={this.state.leaderBoardListingData}
                        multiple={false}
                        defaultIndex={1}
                        searchable={false}
                        containerStyle={{ height: 40 }}
                        itemStyle={{ height: 40, justifyContent: 'flex-start' }}
                        labelStyle={styles.dropDownLable}
                        dropDownStyle={{ height: 200 }}
                        onChangeItem={item => {
                            this.dropDownSelection(item)
                        }}
                    />
                </View>
                <View style={styles.leaderListView}>
                    {
                        this.state.leadersData && this.state.leadersData.length > 0 ?
                            <View style={styles.leaderArcView}>
                                <Text style={styles.textHeader}>{this.props.translation[this.props.Language].Total_Points}</Text>

                                <View style={{ justifyContent: 'center' }}>
                                    <View style={styles.currentRankView}>
                                        <Text style={styles.textCurrentRank}>{this.props.translation[this.props.Language].Current_Rank}</Text>
                                    </View>
                                    <Text style={styles.textRank}>{this.state.currentUserIndex + 1}</Text>
                                    <Image source={rankImage} resizeMode={'contain'} style={styles.imageTextRank} />
                                </View>

                                <View style={styles.tableWrap}>
                                    <Table>
                                        <Row
                                            data={this.state.leadersHeader}
                                            flexArr={this.state.flexArray}
                                            textStyle={styles.tableHeader}
                                        />

                                    </Table>
                                    <View style={styles.tableRowView}>
                                        <ScrollView showsVerticalScrollIndicator={false}>
                                            <Table>
                                                {
                                                    this.state.leadersData.map((rowData, index) => (
                                                        <Row
                                                            key={index}
                                                            data={rowData}
                                                            style={[styles.tableRow, { backgroundColor: index == this.state.currentUserIndex ? Color.colorOrange : null }]}
                                                            textStyle={[styles.tableRowText, { color: ((index == 0 || index == 1 || index == 2) && index != this.state.currentUserIndex) ? Color.colorOrange : Color.colorBlack }]}
                                                            flexArr={this.state.flexArray}
                                                        />
                                                    ))
                                                }
                                            </Table>
                                        </ScrollView>
                                    </View>
                                </View>
                            </View> :
                            <View style={[styles.leaderArcView, { alignItems: 'center', justifyContent: 'center' }]}>
                                <Text style={styles.emptyMsgText}>{this.state.isOfflineData ? this.props.translation[this.props.Language].Offlinemode_MSG : this.props.translation[this.props.Language].emptyLeader}</Text>
                            </View>
                    }
                </View>
            </View >
        )
    }
}

export default Leaders;

const styles = ScaledSheet.create({
    viewContainer: {
        flex: 1,
        backgroundColor: Color.colorWhiteBg
    },
    dropdownWrap: {
        marginTop: 10,
        marginHorizontal: 20
    },
    dropDownLable: {
        color: Color.colorDarkBlue,
        fontSize: Dimension.normalText,
        marginLeft: 10
    },
    leaderListView: {
        flex: 1,
        marginTop: 10,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: -1
    },
    leaderArcView: {
        flex: 1,
        width: '88%',
        backgroundColor: Color.colorWhite,
        borderTopLeftRadius: Dimension.marginTwenty,
        borderTopRightRadius: Dimension.marginTwenty,
        shadowColor: Color.colorGrey,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 2,
    },
    textHeader: {
        marginTop: Dimension.marginTen,
        alignSelf: 'center',
        color: Color.colorDarkBlue,
        fontSize: Dimension.largeText,
        fontFamily: Font.fontRobotoBold
    },
    currentRankView: {
        backgroundColor: Color.colorOrange,
        height: 30,
        borderRadius: 20,
        margin: 10,
        justifyContent: 'center'
    },
    textCurrentRank: {
        marginLeft: Dimension.marginTen,
        color: Color.colorWhite,
        fontSize: Dimension.normalText,
        fontFamily: Font.fontRobotoBold
    },
    textRank: {
        color: Color.colorWhite,
        fontSize: Dimension.largeText,
        position: 'absolute',
        right: 45,
        zIndex: 1
    },
    imageTextRank: {
        position: 'absolute',
        height: 80,
        width: 80,
        right: 10
    },
    tableWrap: {
        flex: 1,
        marginHorizontal: Dimension.marginTen
    },
    tableHeader: {
        textAlign: 'left',
        marginLeft: 5,
        color: Color.colorDarkBlue,
        fontSize: Dimension.smallText,
        fontFamily: Font.fontSansSemiBold
    },
    tableRowView: {
        flex: 1,
        marginTop: 10
    },
    tableRow: {
        height: 30,
        borderBottomColor: Color.colorGrey,
        borderBottomWidth: 1,
    },
    tableRowText: {
        textAlign: 'left',
        marginLeft: 5,
        fontSize: Dimension.smallText,
        fontFamily: Font.fontSansSemiBold
    },
    emptyMsgText: {
        textAlign: 'center',
        color: Color.colorDarkBlue,
        fontSize: Dimension.mediumText,
        fontFamily: Font.fontRobotoBold
    }

})