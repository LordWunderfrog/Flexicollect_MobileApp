import React from 'react';
import {
    View,
    Text,
    SectionList,
} from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import * as Color from '../../style/Colors';
import * as Dimension from '../../style/Dimensions';
import * as Font from '../../style/Fonts';
let dataSize = 0;

/** payment class with listing */
const Payments = props => {
    return (
        <View>
            <SectionList
                style={styles.sectionListContainer}
                sections={
                    props.historyData
                }
                renderSectionHeader={({ section }) => {
                    dataSize = section.data.length
                    return (
                        <View style={styles.headerItem}>
                            <Text style={styles.headerLeftTitle}>{section.title}</Text>
                        </View>
                    )
                }}
                renderItem={({ item, index }) => {
                    return (
                        <View style={index === dataSize - 1 ? styles.itemBg1 : styles.itemBg}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 12 }}>
                                <Text style={styles.itemLeftText} > {item.mission_name} </Text>

                                {item.paymentStatus === "SUCCESS" &&
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={styles.countText} > {item.paymentAmount} </Text>
                                        <Text style={styles.itemLeftText} >{item.paymentCurrency}</Text>
                                    </View>
                                }
                                {item.paymentStatus != "SUCCESS" && item.paymentStatus != "success" &&
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={styles.countText} >{item.paymentStatus}</Text>
                                    </View>
                                }

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
        </View>
    )
}
export default Payments

/** UI styles used for this class */
const width = '100%',
    height = 35,
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
    sectionListContainer: {
        // marginTop: 20,
        marginLeft: Dimension.marginEight,
        marginRight: Dimension.marginEight,
        marginBottom: 10
    },
    headerItem: {
        flexDirection: 'row',
        overflow: 'hidden',
        justifyContent: 'space-between',
        backgroundColor: Color.colorLiteBlue,
        marginTop: 5,
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

})