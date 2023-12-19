/**
 * Created by tangzhibin on 16/3/28.
 */

'use strict'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View } from 'react-native'
import IndicatorViewPager from './IndicatorViewPager'
import { ViewPropTypes } from 'deprecated-react-native-prop-types';

const DEFAULT_DOT_RADIUS = 6

/** page indicator using the page dot */
export default class PagerDotIndicator extends Component {
    /** default propes */
    static propTypes = {
        ...ViewPropTypes,
        pageCount: PropTypes.number.isRequired,
        initialPage: PropTypes.number,
        pager: PropTypes.instanceOf(IndicatorViewPager),
        dotStyle: ViewPropTypes.style,
        selectedDotStyle: ViewPropTypes.style,
        hideSingle: PropTypes.bool
    }

    static defaultProps = {
        pageCount: 0,
        initialPage: 0,
        hideSingle: false
    }

    state = {
        selectedIndex: this.props.initialPage
    }

    /** compoenent update propes life cycle method */
    shouldComponentUpdate(nextProps, nextState) {
        return this.state.selectedIndex !== nextState.selectedIndex ||
            this.props.pageCount !== nextProps.pageCount ||
            this.props.dotStyle !== nextProps.dotStyle ||
            this.props.selectedDotStyle !== nextProps.selectedDotStyle ||
            this.props.style !== nextProps.style
    }

    /** Component rendring */
    render() {
        let { pageCount, dotStyle, selectedDotStyle } = this.props;
        if (pageCount <= 0) return null;
        if (this.props.hideSingle && pageCount === 1) return null;
        let dotsView = [];
        for (let i = 0; i < pageCount; i++) {
            let isSelect = i === this.state.selectedIndex
            dotsView.push(
                <View
                    style={[styles.dot, isSelect ? styles.selectDot : null, isSelect ? selectedDotStyle : dotStyle]}
                    key={i}
                />
            )
        }
        return (
            <View {...this.props} style={[styles.container, this.props.style]} >
                {dotsView}
            </View>
        )
    }

    /** on page selection 
     *  @param e - passed Event
    */
    onPageSelected(e) {
        this.setState({ selectedIndex: e.position })
    }
}

/** UI styles used for this component */
const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    dot: {
        width: DEFAULT_DOT_RADIUS,
        height: DEFAULT_DOT_RADIUS,
        borderRadius: DEFAULT_DOT_RADIUS >> 1,
        backgroundColor: '#BBBBBB',
        margin: DEFAULT_DOT_RADIUS >> 1
    },
    selectDot: {
        backgroundColor: 'white'
    }
})
