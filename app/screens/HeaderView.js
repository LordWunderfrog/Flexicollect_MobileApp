import React, { Component } from 'react';
import { View, Image, Text, TouchableOpacity, Platform } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import * as Color from '../style/Colors';
import * as Font from '../style/Fonts';
import * as String from '../style/Strings';
import * as Dimension from "../style/Dimensions";
import * as Styles from "../style/Styles";
import * as Constants from "../utils/Constants";
// import { NavigationActions, StackActions } from "react-navigation";
import { CommonActions } from '@react-navigation/native';

/** Comman header componenet used to set custome header 
 *  inside all required screen with back action and title 
 */
export default class HeaderView extends Component {

    /**
     * If user clicks back arrow from survey screen, take to mission list sreen
     */
    async goBack() {
        let { queue } = this.props;
        let queueCompleted = true;
        this.props.updateToSurveyParent(true);
        if (queue.length > 0) {
            queue.map(result => {
                if (result === false) {
                    queueCompleted = false;
                }
            })
        }
        if (this.props.type === 1 && queueCompleted === true) {
            this.props.updateToSurveyParent(false);

            // const resetAction = StackActions.reset({
            //     index: 0,
            //     actions: [NavigationActions.navigate({ routeName: 'TabContainerBase' })],
            // });
            // this.props.navigation.dispatch(resetAction);
            const resetAction = CommonActions.reset({
                index: 0,
                routes: [{ name: 'TabContainerBase' }],
            });
            this.props.navigation.dispatch(resetAction);
        }

    }

    /** component rendering */
    render() {
        return (
            <View style={[styles.topHeaderView]}>

                <TouchableOpacity style={styles.backView}
                    onPress={() => this.goBack()}>

                    <Image source={require('../images/survey/arrow_back.png')}
                        style={Styles.styles.backArrow} />

                </TouchableOpacity>

                <View style={styles.titleView}>
                    <Text style={styles.headerText}
                        numberOfLines={1}>{this.props.title}</Text>
                </View>

                <TouchableOpacity
                    style={styles.rightIconView}
                    onPress={() => this.props.supportAction()}>

                    <Image source={require('../images/home/support_icon.png')}
                    />

                </TouchableOpacity>
            </View>
        );
    }
}

/** UI styles used for this component */
const styles = ScaledSheet.create({
    /*Header style*/
    topHeaderView: {
        width: '100%',
        flexDirection: 'row',
        backgroundColor: Color.colorDarkBlue,
        alignItems: Platform.OS === 'ios' ? 'flex-end' : 'center',
        justifyContent: 'flex-start',
        height: Platform.OS === 'ios' ? 56 : 70 - 14,
        // marginTop: 20
    },
    backView: {
        height: '100%',
        flexDirection: 'row',
        flex: 0.1
    },
    titleView: {
        // top: Platform.OS === 'ios' ? 0 : 0,
        // bottom: 0,
        // left: 0,
        // right: 0,
        // position: 'absolute',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 0.8
    },
    rightIconView: {
        height: '100%',
        flex: 0.1,
        justifyContent: 'center'
    },
    headerText: {
        width: '100%',
        color: Color.colorWhite,
        fontSize: Dimension.extraLargeText + '@ms0.3',
        fontWeight: '500',
        textAlign: 'center',
        alignSelf: 'center',
        paddingLeft: '10@ms',
        paddingRight: '10@ms',
    },
    rightView: {
        height: '100%',
        flexDirection: 'row',
        flex: 0.2
    },
})
