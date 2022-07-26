import React, { Component } from 'react';
import {
    View,
    Text,
    Image, FlatList
} from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import * as Color from '../../style/Colors';
import * as Dimension from '../../style/Dimensions';
import * as Font from '../../style/Fonts';

import lockedImage from '../../images/awards/locked.png';
import streakFlame from '../../images/awards/streakFlame.png';

class Awards extends Component {

    constructor(props) {
        super(props);
        this.state = {
            awardData: []
        }
    }

    /** components life cycle methods */
    componentDidMount() {
        /** setup badge data achive badge and badge status and award data */
        this.setupBadgesAchivedData()
    }
    componentDidUpdate(prevProps, prevState) {
        /** state change from previous state then reload badge setup */
        if (prevProps.currentStreak != this.props.currentStreak) {
            this.setupBadgesAchivedData()
        }
        if ((prevProps.availableBadgesData && prevProps.availableBadgesData.length) != (this.props.availableBadgesData && this.props.availableBadgesData.length)) {
            this.setupBadgesAchivedData()
        }
        if (prevProps.xpPoints != this.props.xpPoints) {
            this.setupBadgesAchivedData()
        }
    }

    /** setup badges logic */
    setupBadgesAchivedData() {

        let arrayTempdata = []
        let xpPoints = this.props.xpPoints
        let xpValue = 0
        if (xpPoints !== null) {
            let value = xpPoints.split('/');
            xpValue = value[0];
        }

        arrayTempdata = this.props.availableBadgesData && this.props.availableBadgesData.map(obj => {
            const index = this.props.badgesData && this.props.badgesData.findIndex(el => el["badge_id"] == obj["badge_id"]);
            const badgesData = index !== -1 ? this.props.badgesData[index] : {};
            let isBadgeAchived = false
            let statusOfSubmission = ''

            /** check Badge is achived or not */
            if (obj.req_badges == '0' && obj.req_submissions == 0 && xpValue >= obj.req_points) {
                /** point based mission */
                isBadgeAchived = true
                /** completed submisssion / required submition - to achive badges [if completed submittion is more then required then only display required] */
                statusOfSubmission = (xpValue ? xpValue > obj.req_points ? obj.req_points : xpValue : 0) + ' / ' + obj.req_points + '  ' + 'Points'
            }
            else if (obj.req_badges == '0' && badgesData && badgesData.current_submissions >= obj.req_submissions) {
                /** case while submission base mission */
                isBadgeAchived = true
                /** completed submisssion / required submition - to achive badges [if completed submittion is more then required then only display required] */
                statusOfSubmission = (badgesData.current_submissions ? badgesData.current_submissions > obj.req_submissions ? obj.req_submissions : badgesData.current_submissions : 0) + ' / ' + obj.req_submissions + '  ' + 'Submitted'
            }
            else if (obj.req_badges != "0") {
                /** case for the master badge */
                let masterBadgeIDArray = []
                let achiveBadgeCount = 0
                masterBadgeIDArray = obj.req_badges.split(',')
                masterBadgeIDArray && masterBadgeIDArray.map((mObj) => {
                    /** get available badge object */
                    const index = this.props.availableBadgesData.findIndex(el => el["badge_id"] == mObj);
                    const objOfvailableBadge = index !== -1 ? this.props.availableBadgesData[index] : {};

                    /** get badges object */
                    const index1 = this.props.badgesData && this.props.badgesData.findIndex(el => el["badge_id"] == objOfvailableBadge["badge_id"]);
                    const objOfBadgeData = index1 !== -1 ? this.props.badgesData[index1] : {};

                    /** check both type submission badge complete then increse master badge achive count */
                    if (objOfvailableBadge.req_badges == '0' && objOfvailableBadge.req_submissions == 0 && xpValue >= objOfvailableBadge.req_points) {
                        achiveBadgeCount = achiveBadgeCount + 1
                    }
                    else if (objOfvailableBadge.req_badges == '0' && objOfBadgeData.current_submissions >= objOfvailableBadge.req_submissions) {
                        achiveBadgeCount = achiveBadgeCount + 1
                    }
                    else {

                    }
                })

                if (achiveBadgeCount == masterBadgeIDArray.length) {
                    isBadgeAchived = true
                }
                /** completed submisssion / required submition - to achive badges [if completed submittion is more then required then only display required] */
                statusOfSubmission = achiveBadgeCount > masterBadgeIDArray.length ? masterBadgeIDArray.length : achiveBadgeCount + ' / ' + masterBadgeIDArray.length + ' ' + 'Badges completed'

            }
            else {
                if (obj.req_submissions == 0) {
                    /** completed submisssion / required submition - to achive badges [if completed submittion is more then required then only display required] */
                    statusOfSubmission = (xpValue ? xpValue > obj.req_points ? obj.req_points : xpValue : 0) + ' / ' + obj.req_points + '  ' + 'Points'
                }
                else {
                    /** completed submisssion / required submition - to achive badges [if completed submittion is more then required then only display required] */
                    statusOfSubmission = (badgesData && badgesData.current_submissions ? badgesData.current_submissions > obj.req_submissions ? obj.req_submissions : badgesData.current_submissions : 0) + ' / ' + obj.req_submissions + '  ' + 'Submitted'
                }
            }

            /** Add keys in object */
            return {
                ...obj,
                badgesData,
                isBadgeAchived,
                statusOfSubmission
            };
        });
        this.setState({ awardData: arrayTempdata.length > 0 ? arrayTempdata : [] })
    }

    /** Class render method*/
    render() {
        return (
            <View style={styles.viewContainer}>
                <View style={styles.viewSubContainer}>
                    <View style={styles.awardArcView}>
                        <View style={styles.streakViewWrap}>
                            <View style={styles.streakImageWrap}>
                                <Image source={streakFlame} style={styles.streakImage} resizeMode={'contain'} />
                                {/* <View style={{ flex: 0.4 }}></View>
                                <View style={{ flex: 0.5, flexDirection: 'row' }}>
                                    <Image source={streakFlame} style={styles.streakImage} resizeMode={'contain'} />
                                    <Text style={styles.streakNumberText}>{this.props.translation[this.props.Language].Highest + ' ' + '13'}</Text>
                                </View> */}
                            </View>
                            <View style={styles.streakView}>
                                <Text style={styles.weekText}>{this.props.currentStreak + ' ' + this.props.translation[this.props.Language].Streak}</Text>
                            </View>
                        </View>
                        <View style={styles.deviderView}></View>
                        <View style={{ flex: 1, marginHorizontal: 20 }}>
                            <FlatList
                                style={{ flex: 1 }}
                                showsVerticalScrollIndicator={false}
                                vertical
                                data={this.state.awardData}
                                extraData={this.state}
                                renderItem={
                                    ({ item, index }) => {
                                        return (
                                            <View style={styles.listItemViewWrap}>
                                                <View style={{ flexDirection: 'column' }}>
                                                    <Text style={item.isBadgeAchived == true ? styles.badgeAchvItemtext : styles.noBadgeAchvItemtext}>{item.badge_name}</Text>
                                                    <Text style={item.isBadgeAchived == true ? styles.badgeAchvDescriptionText : styles.noBadgeAchvDescriptionText}>{item.statusOfSubmission}</Text>
                                                </View>
                                                <Image source={item.isBadgeAchived == true ? { uri: item.image } : lockedImage} resizeMode={'contain'} style={styles.listItemImage} />
                                            </View>
                                        )
                                    }}
                                keyExtractor={(item, index) => index.toString()}
                            />
                        </View>
                    </View>
                </View>
            </View >
        )
    }
}

export default Awards;

/** UI styles used for this component */
const styles = ScaledSheet.create({
    viewContainer: {
        flex: 1,
        backgroundColor: Color.colorWhiteBg
    },
    viewSubContainer: {
        flex: 1,
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    awardArcView: {
        flex: 1,
        width: '90%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: Color.colorGrey,
        backgroundColor: Color.colorWhite,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 2
    },
    streakViewWrap: {
        marginTop: 10,
        justifyContent: 'center',
    },
    streakImageWrap: {
        marginHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    streakImage: {
        height: 40,
        width: 40
    },
    streakNumberText: {
        alignSelf: 'flex-end',
        marginBottom: 5,
        color: Color.colorOrange,
        fontSize: Dimension.smallText,
        fontFamily: Font.fontRobotoBold
    },
    streakView: {
        marginHorizontal: 20,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Color.colorOrange
    },
    weekText: {
        color: Color.colorWhite,
        fontSize: Dimension.mediumText,
        fontFamily: Font.fontRobotoBold
    },
    deviderView: {
        marginTop: 10,
        height: 1,
        marginHorizontal: 20,
        backgroundColor: Color.colorGrey,
    },
    listItemViewWrap: {
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomColor: Color.colorGrey,
        borderBottomWidth: 1
    },
    noBadgeAchvItemtext: {
        color: Color.colorGrey,
        fontSize: Dimension.mediumText,
        fontFamily: Font.fontSansLight
    },
    badgeAchvItemtext: {
        color: Color.colorBlack,
        fontSize: Dimension.mediumText,
        fontFamily: Font.fontRobotoMedium
    },
    noBadgeAchvDescriptionText: {
        color: Color.colorGrey,
        fontSize: Dimension.smallText,
        fontFamily: Font.fontRobotoLight
    },
    badgeAchvDescriptionText: {
        color: Color.colorBlack,
        fontSize: Dimension.smallText,
        fontFamily: Font.fontRobotoMedium
    },
    listItemImage: {
        height: 40,
        width: 40
    }
})