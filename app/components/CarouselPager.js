//react-native-carousel-pager
import React, { Component } from 'react';
import {
    View,
    PanResponder,
    Animated, Dimensions,
    StyleSheet
} from 'react-native';
import PropTypes from 'prop-types';

const { width } = Dimensions.get('window');
let stopPanResponder = false

/**Courosel pager component to display paging and manage page
 * inside survey courosel view
*/
export default class CarouselPager extends Component {
    static propTypes = {
        initialPage: PropTypes.number,
        currentPage: PropTypes.number,
        vertical: PropTypes.bool,
        blurredZoom: PropTypes.number,
        blurredOpacity: PropTypes.number,
        animationDuration: PropTypes.number,
        containerPadding: PropTypes.number,
        pageSpacing: PropTypes.number,
        pageStyle: PropTypes.object,
        onPageChange: PropTypes.func,
        deltaDelay: PropTypes.number,
        children: PropTypes.array.isRequired,
        lastPage: PropTypes.number,
    }

    static defaultProps = {
        initialPage: 0,
        blurredZoom: 0.8,
        blurredOpacity: 0.8,
        animationDuration: 200,
        containerPadding: 30,
        pageSpacing: 10,
        vertical: false,
        deltaDelay: 0,
        onPageChange: () => {
        },
    }

    state = {
        width: 0,
        height: 0,
        setSwipe: true
    }

    _getPosForPage(pageNb) {
        return -pageNb * this._boxSizeInterval;
    }

    /** Getting page method */
    _getPageForOffset(offset, diff) {
        let boxPos = Math.abs(offset / this._boxSizeInterval);
        let index;

        // if (diff < 0) {
        //     this.props.onRightSwipe();
        //     // Scrolling forwards
        //     index = Math.ceil(boxPos);
        //     console.log("indexValue",index)
        // }

        if (diff > 0) {
            // Scrolling backwards
            index = Math.floor(boxPos);
        }


        // Make sure index is within bounds
        if (index < 0) {
            index = 0;
        } else if (index > this.props.children.length - 1) {
            index = this.props.children.length - 1;
        }

        if (diff > 0) {
            this.animateToPage(index);
        }
    }

    /**
     * 
     * @param {number} calculate device width 
     * @param {number} calculate device height 
     * To set page blurredOpacity and blurredZoom and animated value
     */
    _runAfterMeasurements(width, height) {
        // Set box and box interval size
        let length = this.props.vertical ? height : width;
        this._boxSize = length - (2 * this.props.containerPadding);
        this._boxSizeInterval = this._boxSize + this.props.pageSpacing;

        // Get initial page
        let initialPage = this.props.initialPage || 0;
        if (initialPage < 0) {
            initialPage = 0;
        } else if (initialPage >= this.props.children.length) {
            initialPage = this.props.children.length - 1;
        }

        this._currentPage = initialPage;
        this._lastPos = this._getPosForPage(this._currentPage);

        let viewsScale = [];
        let viewsOpacity = [];
        for (let i = 0; i < this.props.children.length; ++i) {
            viewsScale.push(new Animated.Value(i === this._currentPage ? 1 : this.props.blurredZoom));
            viewsOpacity.push(new Animated.Value(i === this._currentPage ? 1 : this.props.blurredOpacity));
        }

        this.setState({
            width,
            height,
            pos: new Animated.Value(this._getPosForPage(this._currentPage)),
            viewsScale,
            viewsOpacity
        });
    }

    /**
     * moving page with sliding animation 
     * @param page - passing page
     */
    animateToPage(page) {
        let animations = [];
        if (this._currentPage !== page) {
            // New page needs to be shown (adjust opacity and scale)
            animations.push(
                Animated.timing(this.state.viewsScale[page], {
                    toValue: 1,
                    duration: this.props.animationDuration,
                    useNativeDriver: false
                })
            );

            animations.push(
                Animated.timing(this.state.viewsOpacity[page], {
                    toValue: 1,
                    duration: this.props.animationDuration,
                    useNativeDriver: false
                })
            );

            animations.push(
                Animated.timing(this.state.viewsScale[this._currentPage], {
                    toValue: this.props.blurredZoom,
                    duration: this.props.animationDuration,
                    useNativeDriver: false
                })
            );

            animations.push(
                Animated.timing(this.state.viewsOpacity[this._currentPage], {
                    toValue: this.props.blurredOpacity,
                    duration: this.props.animationDuration,
                    useNativeDriver: false
                })
            );
        } /*else{
            
            animations.push(
                Animated.timing(this.state.viewsScale[page], {
                    toValue: 1,
                    duration: this.props.animationDuration
                })
            );

            animations.push(
                Animated.timing(this.state.viewsOpacity[page], {
                    toValue: 1,
                    duration: this.props.animationDuration
                })
            );

            animations.push(
                Animated.timing(this.state.viewsScale[this._currentPage], {
                    toValue: 1,
                    duration: this.props.animationDuration
                })
            );

            animations.push(
                Animated.timing(this.state.viewsOpacity[this._currentPage], {
                    toValue: 1,
                    duration: this.props.animationDuration
                })
            );
            
        }*/

        // Move to proper position for selected page
        let toValue = this._getPosForPage(page);

        animations.push(
            Animated.timing(this.state.pos, {
                toValue: toValue,
                duration: this.props.animationDuration,
                useNativeDriver: false
            })
        );

        Animated.parallel(animations).start();

        this._lastPos = toValue;
        this._currentPage = page;
        this.props.onPageChange(page);
    }

    /**
     * Handle moving page
     * @param Index - index to mode page
     */
    goToPage(index) {
        if (index < 0 || index > this.props.children.length - 1) {
            // Out of bounds, don't go anywhere
            return;
        }

        this.animateToPage(index);
    }

    /**
     * Update Sliding animation length
     */
    updateViews(len) {
        let viewsScale = [];
        let viewsOpacity = [];
        for (let i = 0; i < len; ++i) {
            viewsScale.push(new Animated.Value(i === this._currentPage ? 1 : this.props.blurredZoom));
            viewsOpacity.push(new Animated.Value(i === this._currentPage ? 1 : this.props.blurredOpacity));
        }

        this.setState({
            viewsScale,
            viewsOpacity
        });
    }

    /** component life cycle methods */
    UNSAFE_componentWillMount() {
        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: (evt, gestureState) => {
                const dx = Math.abs(gestureState.dx);
                const dy = Math.abs(gestureState.dy);
                return this.props.vertical ? (dy > this.props.deltaDelay && dy > dx) : (dx > this.props.deltaDelay && dx > dy);
            },
            onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                // Set PanResponder only if it is a gesture in the right direction
                // const setGestureEnable = (evt.nativeEvent.pageX > Math.floor(width * 0.85)) || evt.nativeEvent.pageX < Math.floor(width * 0.20);
                // return setGestureEnable

                const dx = Math.abs(gestureState.dx);
                const dy = Math.abs(gestureState.dy);

                return dx > this.props.deltaDelay && dx > dy;
            },
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => false,

            onPanResponderGrant: (evt, gestureState) => {
                this.props.onMove(false)
            },
            onPanResponderMove: (evt, gestureState) => {
                // let suffix = this.props.vertical ? 'y' : 'x';
                // let diff = gestureState['d' + suffix];
                // diff=Math.ceil(diff)
                // if (diff<0) {
                //     console.log('diff', Math.ceil(diff))
                //     // this.props.onRightSwipe();
                //     // this._lastPos += gestureState['d' + suffix];
                //     // let boxPos = Math.abs(this._lastPos / this._boxSizeInterval);
                //     // let index;
                //     // index = Math.ceil(boxPos);
                //     // if (index > this.props.children.length - 1) {
                //     //     index = this.props.children.length - 1;
                //     // }
                //     // if (index !== this.props.lastPage) {
                //     //     this.state.pos.setValue(this._lastPos + -20);
                //     // }
                // } else {
                //     this.props.onLeftSwipe()
                //     // this.state.pos.setValue(this._lastPos + 20);
                // }
                return false
            },
            onPanResponderTerminationRequest: (evt, gestureState) => true,
            onPanResponderRelease: (evt, gestureState) => {
                this.props.onMove(true)
                // if(this.state.setSwipe){}
                let suffix = this.props.vertical ? 'y' : 'x';
                let diff = gestureState['d' + suffix];
                if (diff > 0) {
                    let suffix = this.props.vertical ? 'y' : 'x';
                    this._lastPos += gestureState['d' + suffix];
                    let page = this._getPageForOffset(this._lastPos, gestureState['d' + suffix]);
                    this.props.onLeftSwipe()
                } else {
                    this.props.onRightSwipe();
                }
            },
            onPanResponderTerminate: (evt, gestureState) => {
                this.props.onMove(true)
                // if(this.state.setSwipe){}
                let suffix = this.props.vertical ? 'y' : 'x';
                let diff = gestureState['d' + suffix];
                if (diff > 0) {
                    let suffix = this.props.vertical ? 'y' : 'x';
                    this._lastPos += gestureState['d' + suffix];
                    let page = this._getPageForOffset(this._lastPos, gestureState['d' + suffix]);
                    this.props.onLeftSwipe()
                } else {
                    this.props.onRightSwipe();
                }

            },
            onShouldBlockNativeResponder: (evt, gestureState) => false
        });
    }

    /** component render */
    render() {
        if (!this.state.width && !this.state.height) {
            // Use a transparent screen to render so we can calculate width & height
            return (
                <View style={{ flex: 1 }}>
                    <View
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'transparent'
                        }}
                        onLayout={evt => {
                            let width = evt.nativeEvent.layout.width;
                            let height = evt.nativeEvent.layout.height;
                            this._runAfterMeasurements(width, height);
                        }}
                    />
                </View>
            );
        }

        let containerStyle = {};
        let boxStyle = {};
        if (this.props.vertical) {
            containerStyle = {
                top: this.state.pos,
                paddingTop: this.props.containerPadding,
                paddingBottom: this.props.containerPadding,
                flexDirection: 'column'
            }
            boxStyle = {
                height: this._boxSize,
                marginBottom: this.props.pageSpacing
            }
        } else {
            containerStyle = {
                left: this.state.pos,
                paddingLeft: this.props.containerPadding,
                paddingRight: this.props.containerPadding,
                flexDirection: 'row'
            }
            boxStyle = {
                width: this._boxSize,
                marginRight: this.props.pageSpacing
            };
        }


        return (
            <View style={{ flex: 1, flexDirection: this.props.vertical ? 'column' : 'row', overflow: 'hidden' }}>
                <Animated.View
                    style={[{ flex: 1 }, containerStyle]}
                    {...this._panResponder.panHandlers}>
                    {this.props.children.map((page, index) => {
                        return (
                            <Animated.View
                                key={index}
                                style={[{
                                    opacity: this.state.viewsOpacity[index],
                                    transform: [
                                        this.props.vertical ? {
                                            scaleX: this.state.viewsScale[index]
                                        } : {
                                            scaleY: this.state.viewsScale[index]
                                        }
                                    ]
                                }, boxStyle, this.props.pageStyle]}>
                                {page}
                            </Animated.View>
                        );
                    })}
                </Animated.View>
            </View>
        );
    }
}