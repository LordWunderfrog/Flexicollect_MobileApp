
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View, Image, Text, TouchableOpacity } from 'react-native'
import IndicatorViewPager from './IndicatorViewPager'
import * as Dimension from "../../style/Dimensions";
import * as color from "../../style/Colors";
import * as Font from "../../style/Fonts";
import { ScaledSheet } from 'react-native-size-matters';
import { ViewPropTypes } from 'deprecated-react-native-prop-types';

/** Pager tab indicator for managing tab  */
export default class PagerTabIndicator extends Component {
    /** default propes */
    static propTypes = {
        ...ViewPropTypes,
        initialPage: PropTypes.number,
        tabStyle: ViewPropTypes.style,
        pager: PropTypes.instanceOf(IndicatorViewPager),
        tabs: PropTypes.arrayOf(PropTypes.shape({
            text: PropTypes.string,
            iconSource: Image.propTypes.source,
            selectedIconSource: Image.propTypes.source,
            textStyle: PropTypes.style,
            iconStyle: PropTypes.style,
            selectedBorder: PropTypes.style,
            count: PropTypes.string
        })).isRequired,
        itemStyle: ViewPropTypes.style,
        selectedItemStyle: ViewPropTypes.style,
        iconStyle: Image.propTypes.style,
        selectedIconStyle: Image.propTypes.style,
        textStyle: Text.propTypes.style,
        selectedTextStyle: Text.propTypes.style,
        changePageWithAnimation: PropTypes.bool,
        selectedBorderStyle: ViewPropTypes.style,
    }

    static defaultProps = {
        tabs: [],
        changePageWithAnimation: true,
        initialPage: 0

    };

    state = {
        selectedIndex: this.props.initialPage
    };


    /** compoenent rendring */
    render() {
        let {
            tabs, pager, style, itemStyle, selectedItemStyle, iconStyle,
            selectedIconStyle, textStyle, selectedTextStyle, selectedBorderStyle, containerstyle
        } = this.props
        if (!tabs || tabs.length === 0) return null

        let tabsView = tabs.map((tab, index) => {
            let isSelected = this.state.selectedIndex === index
            return (
                <TouchableOpacity
                    style={[styles.itemContainer, containerstyle, isSelected ? selectedItemStyle : itemStyle, { backgroundColor: isSelected ? tab.count === '2' ? color.colorTim : color.colorYellow : color.colorDarkBlue }]}
                    activeOpacity={0.6}
                    key={index}
                    onPress={() => {
                        if (!isSelected) {
                            if (this.props.changePageWithAnimation)
                                pager.setPage(index);
                            else pager.setPageWithoutAnimation(index);
                        }
                    }}>
                    <View style={styles.tabItem}>
                        {
                            tab.count === '1' && (
                                <Image
                                    style={[styles.image, isSelected ? tab.iconStyle : tab.iconStyle, isSelected ? selectedIconStyle : iconStyle]}
                                    source={isSelected ? tab.selectedIconSource : tab.iconSource}
                                />
                            )
                        }

                        <Text
                            numberOfLines={1}
                            adjustsFontSizeToFit={true}
                            style={[styles.tabText, isSelected ? tab.textStyle : tab.textStyle, isSelected ? selectedTextStyle : textStyle]}>
                            {tab.text}
                        </Text>
                    </View>
                    {isSelected ? <View style={[tab.selectedBorder, selectedBorderStyle]} /> : null}
                </TouchableOpacity>
            )
        });
        return (
            <View>
                <View style={{ width: '100%', height: 0.5, backgroundColor: '#fff' }} />
                <View style={[this.props.tabStyle, style]} >
                    {tabsView}
                </View>
            </View>
        )
    }

    /** Called when page select 
     *  @param e - passed event
     */
    onPageSelected(e) {
        this.setState({ selectedIndex: e.position })
    }
}

/** UI styles used for this component */
const styles = ScaledSheet.create({
    container: {
        flexDirection: 'row',
        height: '45@vs',
        justifyContent: 'center',
        borderTopWidth: 0.5,
        borderTopColor: color.colorBlack,
        backgroundColor: color.colorDarkBlue
    },
    itemContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    tabItem: {
        justifyContent: 'space-between',
        alignSelf: 'center'
    },
    tabText: {
        fontSize: Dimension.largeText + '@ms0.3',
        alignSelf: 'center',
        justifyContent: 'center',
        textAlign: 'center'
    },
    image: {
        width: '20@ms',
        height: '20@vs',
        alignSelf: 'center',
        justifyContent: 'center'
    },
});