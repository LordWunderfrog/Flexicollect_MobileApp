import React, { Component } from 'react';
import {
    View,
    Text,
    ScrollView, SectionList, Dimensions, StatusBar, Platform,
} from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Color from '../../style/Colors';
import * as Dimension from '../../style/Dimensions';
import * as Constants from '../../utils/Constants';
import * as Font from '../../style/Fonts';
// import { LineChart } from "react-native-chart-kit";
import axios from 'axios';
import * as Service from "../../utils/Api";
// import { NavigationActions, SafeAreaView, StackActions } from "react-navigation";
import { CommonActions } from '@react-navigation/native';
import XP from './XP';
import Payments from './Payments'
import Leaders from './Leaders'
import Awards from './Awards'
import IndicatorViewPager from '../tabscontainer/IndicatorViewPager';
import PagerTabIndicator from '../tabscontainer/PagerTabIndicator';
import { Grid, LineChart, AreaChart, XAxis, YAxis, Path } from 'react-native-svg-charts';
import { G, Line, Circle } from 'react-native-svg';
import * as shape from 'd3-shape';

let dataSize = 0;

/** History class */
class History extends Component {

    state = {
        historyData: [],
        paymenthistoryData: [],
        xpPoint: this.props.xpPoint,
        position: 0,
        paymentCurrency: '',
        translation_common: Constants.common_text
    }

    /** component life cycle method */
    UNSAFE_componentWillMount() {
        this.getHistoryData();
        this.getPaymentHistory();
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        this.getHistoryData();
        this.getPaymentHistory();
        // if (nextProps.position === 0 && Platform.OS == 'ios') {
        //     this.setState({
        //         position: 0,
        //     })
        // }
    }

    /**
     * api call to payment history 
     */
    async getPaymentHistory() {
        try {

            let api_key = await AsyncStorage.getItem('api_key');
            // let url = Constants.BASE_URL + Service.MISSION + 'true';
            let url = Constants.BASE_URL + 'payment_dashboard';


            axios.get(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Auth': api_key
                },
                timeout: Constants.TIMEOUT,
            }).then(response => {
                if (response.data.status === 200) {
                    xpPoints = response.data.current_customer_payment;
                    totMissions = response.data.total_data;
                    xData = []
                    yData = []
                    historyData = []
                    paymentCurrency = ''
                    response.data.mission_data.forEach(x => {
                        xData.push(x.month);
                        yData.push(x.month_payment)
                        let hist = {};
                        let data = [];
                        // hist['mission'] = "XP:" + x.month_points + " / " +  x.missions.length + " Mission(s) Completed";
                        x.missions.forEach(item => {
                            data.push(item);
                            hist['title'] = item.fullDate;
                        });
                        hist['data'] = data;
                        paymentCurrency = x.month_currency;
                        historyData.push(hist);
                    });

                    this.setState({
                        paymenthistoryData: historyData,
                        paymentxData: xData.reverse(),
                        paymentyData: yData.reverse(),
                        paymentxpPoints: xpPoints,
                        paymenttotMissions: totMissions,
                        paymentCurrency: paymentCurrency
                    })

                }
            }).catch((error) => {
                if (error.hasOwnProperty('response')) {
                    let errorResponse = error.response;
                    if (errorResponse && errorResponse.hasOwnProperty('data')) {
                        if (errorResponse.data.status === 401) {
                            Constants.showSnack(this.state.translation_common[this.props.Language].Session_Expired);
                            this.moveToSignInScreen()
                            // setTimeout(() => {
                            //     this.moveToSignInScreen()
                            // }, 1000)

                        }
                    }
                }
            })

        } catch (e) {
            //ignore error
        }
    }

    /**
     * api call to get mission data
     * */
    async getHistoryData() {
        try {

            let api_key = await AsyncStorage.getItem('api_key');
            let url = Constants.BASE_URL + Service.MISSION + 'true';

            axios.get(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Auth': api_key
                },
                timeout: Constants.TIMEOUT,
            }).then(response => {
                if (response.data.status === 200) {
                    xpPoints = response.data.current_customer_xp;
                    totMissions = response.data.total_data;
                    xData = []
                    yData = []

                    historyData = []
                    // xData.push(" ");
                    response.data.mission_data.forEach(x => {
                        xData.push(x.month);
                        yData.push(x.month_points)
                        let hist = {};
                        let data = [];
                        hist['mission'] = (this.props.isPepsicoUser == '1' ? this.props.translation[this.props.Language].Points : this.props.translation[this.props.Language].XP_Experience) + ':' + x.month_points + " / " + x.missions.length + " " + this.props.translation[this.props.Language].Mission_Completed;
                        x.missions.forEach(item => {
                            data.push(item);
                            hist['title'] = item.fullDate;
                        });
                        hist['data'] = data;
                        historyData.push(hist);
                    });
                    this.setState({
                        historyData: historyData,
                        xData: xData.reverse(),
                        yData: yData.reverse(),
                        xpPoints: xpPoints,
                        totMissions: totMissions
                    })

                }
            }).catch((error) => {
                if (error.hasOwnProperty('response')) {
                    let errorResponse = error.response;
                    if (errorResponse && errorResponse.hasOwnProperty('data')) {
                        if (errorResponse.data.status === 401) {
                            Constants.showSnack(this.state.translation_common[this.props.Language].Session_Expired);
                            this.moveToSignInScreen()
                            // setTimeout(() => {
                            //     this.moveToSignInScreen()
                            // }, 1000)

                        }
                    }
                }
            })

        } catch (e) {
            //ignore error
        }
    }

    /**
     * move to signin screen when session expired
     */
    moveToSignInScreen() {
        AsyncStorage.clear();
        // navigate to signIn page
        setTimeout(() => {
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
        }, 500)

    }

    /** Class render method */
    render() {
        const { xData, yData, historyData, totMissions, xpPoints, paymenttotMissions, paymentxpPoints,
            paymenthistoryData, position, paymentxData, paymentyData, paymentCurrency } = this.state;
        const CustomGrid = ({ x, y, data, ticks }) => (
            <G>
                {
                    // Horizontal grid
                    ticks.map((tick) => (
                        <Line
                            key={tick}
                            x1={'0%'}
                            x2={'100%'}
                            y1={y(tick)}
                            y2={y(tick)}
                            // stroke={ 'rgba(0,0,0,0.2)' }
                            d={tick}
                            stroke={'white'}
                            strokeWidth={1.5}
                            fill={'none'}
                            strokeDasharray={[10, 10]}
                            strokeOpacity={0.2}
                        />
                    ))
                }
                {
                    // Vertical grid
                    data.map((_, index) => (
                        <Line
                            key={index}
                            y1={'0%'}
                            y2={'100%'}
                            x1={x(index)}
                            x2={x(index)}
                            // stroke={ 'rgba(0,0,0,0.2)' }
                            d={index}
                            stroke={'white'}
                            strokeWidth={1.5}
                            fill={'none'}
                            strokeDasharray={[10, 10]}
                            strokeOpacity={0.2}
                        />
                    ))
                }
            </G>
        )

        const Decorator = ({ x, y, data }) => {
            return data.map((value, index) => (
                <Circle
                    key={index}
                    cx={x(index)}
                    cy={y(value)}
                    r={5}
                    // stroke={ 'rgb(134, 65, 244)' }
                    fill={'white'}
                    strokeOpacity={0.2}
                // onPress={() => { console.log(value) }}
                />
            ))
        }

        const Shadow = ({ line }) => (
            <Path
                key={'shadow'}
                y={2}
                d={line}
                fill={'none'}
                strokeWidth={3}
                stroke={'white'}
                strokeOpacity={0.5}
            />
        )

        const axesSvg = { fontSize: 12, fill: 'white', opacity: "0.5" };
        const verticalContentInset = { top: 10, bottom: 10 };
        const DecoratorContentInset = { top: 10, bottom: 10, left: 5, right: 6 }
        const xAxisHeight = 10
        const { Language, translation } = this.props;
        return (
            <View style={styles.container}>
                {position === 0 && historyData.length > 0 &&
                    <View>

                        <View style={{ height: 200, borderRadius: 5, padding: 5 }}>

                            <View style={{ height: '100%', flexDirection: "row", backgroundColor: '#756083', borderRadius: 5, padding: 5 }}>

                                <YAxis
                                    data={yData}
                                    style={{ marginBottom: xAxisHeight }}
                                    contentInset={verticalContentInset}
                                    svg={axesSvg}
                                // numberOfTicks={4}
                                />
                                <ScrollView showsHorizontalScrollIndicator={false} horizontal={true}
                                    ref={ref => { this.scrollView = ref }}
                                    onContentSizeChange={() => this.scrollView.scrollToEnd({ animated: true })}>
                                    <View style={{ marginLeft: 10, marginRight: 10, width: ((xData.length * 50) <= (Dimensions.get('window').width - 60) ? (Dimensions.get('window').width - 60) : (xData.length * 50)) }}>

                                        <AreaChart
                                            style={{ flex: 1 }}
                                            data={yData}
                                            contentInset={DecoratorContentInset}
                                            svg={{ fill: 'rgba(225, 225, 225, 0.1)' }}
                                            curve={shape.curveMonotoneX}
                                            numberOfTicks={3}

                                        >
                                            <CustomGrid belowChart={true} />
                                            <Shadow />
                                            <Decorator />
                                        </AreaChart>

                                        <XAxis
                                            style={{ marginHorizontal: -10, height: xAxisHeight }}
                                            data={xData}
                                            formatLabel={(value, index) => xData[index]}
                                            contentInset={{ left: 20, right: 20 }}
                                            svg={axesSvg}
                                        />


                                    </View>
                                </ScrollView>
                            </View>

                        </View>


                        <View style={styles.graphView}>
                            <View style={{ flexDirection: 'row', flex: 0.5, justifyContent: 'flex-end' }}>
                                {this.props.isPepsicoUser == '1' ? <Text style={styles.xpText}>{this.props.translation[this.props.Language].Points + ':'}</Text> :
                                    <Text style={styles.xpText}>{this.props.translation[this.props.Language].XP_Experience + ':'}</Text>}

                                <Text style={styles.countText}>{xpPoints}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', flex: 0.5, marginLeft: 23 }}>
                                <Text style={styles.xpText}>{this.props.translation[this.props.Language].Missions + ':'}</Text>
                                <Text style={styles.countText}>{totMissions}</Text>
                            </View>
                        </View>
                    </View>
                }

                {position === 1 && paymenthistoryData.length > 0 &&

                    <View>
                        <View style={{ height: 200, borderRadius: 5, padding: 5 }}>

                            <View style={{ height: '100%', flexDirection: "row", backgroundColor: '#756083', borderRadius: 5, padding: 5 }}>


                                <YAxis
                                    data={paymentyData}
                                    style={{ marginBottom: xAxisHeight }}
                                    contentInset={verticalContentInset}
                                    svg={axesSvg}
                                // numberOfTicks={6.5}
                                />
                                <ScrollView showsHorizontalScrollIndicator={false} horizontal={true}
                                    ref={ref => { this.scrollView = ref }}
                                    onContentSizeChange={() => this.scrollView.scrollToEnd({ animated: true })}>
                                    <View style={{ marginLeft: 10, marginRight: 10, width: ((paymentxData.length * 50) <= (Dimensions.get('window').width - 60) ? (Dimensions.get('window').width - 60) : (paymentxData.length * 50)) }}>

                                        <AreaChart
                                            style={{ flex: 1 }}
                                            data={paymentyData}
                                            contentInset={DecoratorContentInset}
                                            svg={{ fill: 'rgba(225, 225, 225, 0.1)' }}
                                            curve={shape.curveCatmullRom}
                                            numberOfTicks={3}

                                        >
                                            <CustomGrid belowChart={true} />
                                            <Shadow />
                                            <Decorator />
                                        </AreaChart>

                                        <XAxis
                                            style={{ marginHorizontal: -10, height: xAxisHeight }}
                                            data={paymentxData}
                                            formatLabel={(value, index) => paymentxData[index]}
                                            contentInset={{ left: 20, right: 20 }}
                                            svg={axesSvg}
                                        />


                                    </View>
                                </ScrollView>
                            </View>

                        </View>

                        <View style={styles.graphView}>
                            <View style={{ flexDirection: 'row', flex: 0.5, justifyContent: 'flex-end' }}>
                                <Text style={styles.xpText}>{translation[Language].Payment}:</Text>

                                <Text style={styles.countText}>{paymentxpPoints}{" "}{paymentCurrency}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', flex: 0.5, marginLeft: 23 }}>
                                <Text style={styles.xpText}>{translation[Language].Missions}(s):</Text>
                                <Text style={styles.countText}>{paymenttotMissions}</Text>
                            </View>
                        </View>
                    </View>

                }

                {
                    this.props.isPepsicoUser == '1' ?
                        <IndicatorViewPager
                            style={{
                                flex: 1,
                                height: 45,
                                // marginTop : 10,
                                flexDirection: 'column-reverse',
                                backgroundColor: Color.colorWhiteBg
                            }}
                            indicator={this._renderTabIndicator()}
                            initialPage={0}
                            onPageSelected={(p) => this.onPageSelected(p)}
                        >
                            <View>
                                <XP
                                    navigation={this.props.navigation}
                                    historyData={historyData}
                                    xData={xData}
                                    yData={yData}
                                    xpPoints={xpPoints}
                                    totMissions={totMissions}
                                    translation={this.props.translation}
                                    Language={this.props.Language}
                                    isPepsicoUser={this.props.isPepsicoUser}
                                />
                            </View>
                            <View>
                                <Leaders
                                    navigation={this.props.navigation}
                                    xpPoints={this.props.xpPoint}
                                    translation={this.props.translation}
                                    Language={this.props.Language}
                                />
                            </View>
                            <View>
                                <Awards
                                    navigation={this.props.navigation}
                                    availableBadgesData={this.props.availableBadgesData}
                                    badgesData={this.props.badgesData}
                                    currentStreak={this.props.currentStreak}
                                    xpPoints={this.props.xpPoint}
                                    translation={this.props.translation}
                                    Language={this.props.Language}
                                />
                            </View>
                        </IndicatorViewPager>
                        :
                        <IndicatorViewPager
                            style={{
                                flex: 1,
                                height: 45,
                                // marginTop : 10,
                                flexDirection: 'column-reverse',
                                backgroundColor: Color.colorWhiteBg
                            }}
                            indicator={this._renderTabIndicator()}
                            initialPage={0}
                            onPageSelected={(p) => this.onPageSelected(p)}
                        >
                            <View>
                                <XP
                                    navigation={this.props.navigation}
                                    historyData={historyData}
                                    xData={xData}
                                    yData={yData}
                                    xpPoints={xpPoints}
                                    totMissions={totMissions}
                                    translation={this.props.translation}
                                    Language={this.props.Language}
                                    isPepsicoUser={this.props.isPepsicoUser}
                                />
                            </View>
                            <View>
                                <Payments
                                    navigation={this.props.navigation}
                                    historyData={paymenthistoryData}
                                    xData={paymentxData}
                                    yData={paymentyData}
                                    totMissions={paymenttotMissions}
                                    xpPoints={paymentxpPoints}
                                    translation={this.props.translation}
                                    Language={this.props.Language}
                                />
                            </View>
                        </IndicatorViewPager>
                }
                {position === 0 && historyData.length <= 0 &&
                    <View style={{ alignSelf: 'center', flex: 1, justifyContent: 'center' }}>
                        <Text style={{ color: Color.colorBlack, fontSize: 20 }}>{translation[Language].No_XP}</Text>
                    </View>
                }
                {position === 1 && paymenthistoryData.length <= 0 && this.props.isPepsicoUser != '1' &&
                    <View style={{ alignSelf: 'center', flex: 1, justifyContent: 'center' }}>
                        <Text style={{ color: Color.colorBlack, fontSize: 20 }}>{translation[Language].No_Payment}</Text>
                    </View>
                }
            </View>
        )
    }

    /** on page selected */
    onPageSelected(p) {
        this.setState({ position: p.position })
    }

    /** render tab indicator */
    _renderTabIndicator() {
        let tabs = this.props.isPepsicoUser == '1' ? [
            {
                text: this.props.translation[this.props.Language].Points,
                textStyle: styles.tabText,
                selectedBorder: styles.borderLine,
                itemStyle: styles.selectedTab,
                count: '2'
            },
            {
                text: this.props.translation[this.props.Language].Leaders,
                textStyle: styles.tabText,
                selectedBorder: styles.borderLine,
                itemStyle: styles.selectedTab,
                count: '2'
            },
            {
                text: this.props.translation[this.props.Language].Awards,
                textStyle: styles.tabText,
                selectedBorder: styles.borderLine,
                itemStyle: styles.selectedTab,
                count: '2'
            }
        ] : [
            {
                text: this.props.translation[this.props.Language].XP_Experience,
                textStyle: styles.tabText,
                selectedBorder: styles.borderLine,
                itemStyle: styles.selectedTab,
                count: '2'
            },
            {
                text: this.props.translation[this.props.Language].Payments,
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
                containerstyle={styles.itemStyle}
            />
        );
    }
}
export default History

/** UI styles used for this class */
const width = '100%',
    height = 41,
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


const styles = ScaledSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: Color.colorWhiteBg
    },
    emptyContainer: {
        flex: 1,
        backgroundColor: Color.colorWhiteBg
    },
    graphContainer: {
        alignSelf: 'stretch',
        height: 195,
        backgroundColor: Color.colorYellow,
        borderRadius: 5,
        margin: 8
    },
    sectionListContainer: {
        marginTop: 20,
        marginLeft: Dimension.marginEight,
        marginRight: Dimension.marginEight,
        marginBottom: 10
    },
    headerItem: {
        flexDirection: 'row',
        overflow: 'hidden',
        justifyContent: 'space-between',
        backgroundColor: Color.colorLiteBlue,
        marginTop: Dimension.marginEight,
        ...baseStyle,
    },
    headerLeftTitle: {
        color: Color.colorWhite,
        fontSize: Dimension.mediumText,
        fontFamily: Font.fontRobotoBold,
        fontWeight: 'bold',
        alignSelf: 'center',
        paddingLeft: 12
    },
    headerRightTitle: {
        color: Color.colorWhite,
        fontSize: Dimension.normalText,
        alignSelf: 'center',
        paddingRight: 8
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
    countText: {
        color: Color.colorYellow,
        fontSize: Dimension.normalText,
        fontWeight: 'bold',
        paddingLeft: 1
    },
    graphView: {
        flexDirection: 'row',
        position: 'absolute',
        width: '100%',
        height: 20,
        alignSelf: 'center',
        justifyContent: 'center',
        marginTop: 20
    },
    xpText: {
        color: Color.colorWhite,
        fontSize: Dimension.normalText
    },
    //tab
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
        height: '40@vs',
        justifyContent: 'center',
        borderTopWidth: 0.5,
        borderTopColor: Color.colorBlack,
        backgroundColor: Color.colorDarkBlue,
        marginTop: 5,
        marginLeft: 8,
        marginRight: 8,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,

    },
    itemStyle: {
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,

    },
    statusBar: {
        // height: STATUSBAR_HEIGHT
    }
})