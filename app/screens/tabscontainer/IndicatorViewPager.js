import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, } from 'react-native'
import ViewPager from './ViewPager';
import { ViewPropTypes } from 'deprecated-react-native-prop-types';

const VIEWPAGER_REF = 'viewPager'
const INDICATOR_REF = 'indicator'
let mProps;

/** tabbar view pager */
export default class IndicatorViewPager extends Component {

    static propTypes = {
        ...ViewPager.propTypes,
        indicator: PropTypes.node,
        pagerStyle: ViewPropTypes.style,
        autoPlayEnable: PropTypes.bool,
        autoPlayInterval: PropTypes.number,
        horizontalScroll: PropTypes.bool,
        initialPage: PropTypes.number
    };

    static defaultProps = {
        indicator: null,
        autoPlayInterval: 3000,
        autoPlayEnable: false,
        horizontalScroll: true
    };

    constructor(props) {
        super(props)
        this._onPageScroll = this._onPageScroll.bind(this)
        this._onPageSelected = this._onPageSelected.bind(this)
        this._goToNextPage = this._goToNextPage.bind(this)
        this._renderIndicator = this._renderIndicator.bind(this)
        this.setPage = this.setPage.bind(this)
        this.setPageWithoutAnimation = this.setPageWithoutAnimation.bind(this)
        this._startAutoPlay = this._startAutoPlay.bind(this)
        this._stopAutoPlay = this._stopAutoPlay.bind(this)
        this._currentIndex = props.initialPage
        this._childrenCount = React.Children.count(props.children)
    }

    /** component life cycle methods */
    componentDidMount() {
        if (this.props.autoPlayEnable) this._startAutoPlay()
        else this._stopAutoPlay()
    }

    UNSAFE_componentWillUpdate(nextProps, nextState) {
        this._childrenCount = React.Children.count(nextProps.children)
        if (this.props.autoPlayEnable !== nextProps.autoPlayEnable) {
            nextProps.autoPlayEnable ? this._startAutoPlay() : this._stopAutoPlay()
        }
    }

    componentWillUnmount() {
        this._stopAutoPlay()
    }

    /** compoenent rendring */
    render() {
        return (
            <View style={[styles.container, this.props.style]} >
                <ViewPager
                    {...this.props}
                    horizontalScroll={this.props.horizontalScroll}
                    ref={VIEWPAGER_REF}
                    style={[styles.pager, this.props.pagerStyle]}
                    onPageScroll={this._onPageScroll}
                    onPageSelected={this._onPageSelected}
                />
                {this._renderIndicator()}
            </View>
        )
    }

    /** view pager action methods 
     *@param params - passing event
     */
    _onPageScroll(params) {
        let indicator = this.refs[INDICATOR_REF];
        indicator && indicator.onPageScroll && indicator.onPageScroll(params);
        this.props.onPageScroll && this.props.onPageScroll(params)
    }

    /** Called when page selected to manage current index 
     *  @param params - pass event on selected 
    */
    _onPageSelected(params) {
        let indicator = this.refs[INDICATOR_REF]
        indicator && indicator.onPageSelected && indicator.onPageSelected(params)
        this.props.onPageSelected && this.props.onPageSelected(params)
        this._currentIndex = params.position

    }

    /** rendering indicator view */
    _renderIndicator() {
        let { indicator, initialPage } = this.props
        if (!indicator) return null
        return React.cloneElement(indicator, {
            ref: INDICATOR_REF,
            pager: this,
            initialPage: initialPage
        })
    }

    /** Go to the next page  */
    _goToNextPage() {
        let nextIndex = (this._currentIndex + 1) % this._childrenCount
        this.setPage(nextIndex)
    }

    /** start and stop auto play */
    _startAutoPlay() {
        if (this._timerId) clearInterval(this._timerId)
        this._timerId = setInterval(this._goToNextPage, this.props.autoPlayInterval)
    }

    _stopAutoPlay() {
        if (this._timerId) {
            clearInterval(this._timerId)
            this._timerId = null
        }
    }
    /** set page methods
     *  @param selectedPage - selected page
     */
    setPage(selectedPage) {
        this.refs[VIEWPAGER_REF].setPage(selectedPage)
    }

    setPageWithoutAnimation(selectedPage) {
        this.refs[VIEWPAGER_REF].setPageWithoutAnimation(selectedPage)
    }
}

const styles = StyleSheet.create({
    container: {},
    pager: { flex: 1 }
})
