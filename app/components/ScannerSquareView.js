import React, { Component } from 'react';
import {
    ActivityIndicator,
    View,
    Animated,
    Easing,
    Text,
    Image, StyleSheet
} from 'react-native';

/** scanner square view component */
export default class ScannerSquareView extends Component {
    static defaultProps = {
        maskColor: '#0000004D',
        cornerColor: '#fff',
        borderColor: '#000000',
        rectHeight: 200,
        rectWidth: 300,
        borderWidth: 0,
        cornerBorderWidth: 4,
        cornerBorderLength: 20,
        isLoading: false,
        cornerOffsetSize: 0,
        isCornerOffset: false,
        bottomMenuHeight: 0,
        scanBarAnimateTime: 5000,
        scanBarColor: '#f72f2f',
        scanBarImage: null,
        scanBarHeight: 1.5,
        scanBarWidth: 0,
        scanBarMargin: 6,
        hintText: 'bar code into the box',
        hintTextStyle: { color: '#fff', fontSize: 14, backgroundColor: 'transparent', alignItems: 'center' },
        hintTextPosition: 100,
        isShowScanBar: true,
        isLandscape: false
    };

    constructor(props) {
        super(props);

        this.getBackgroundColor = this.getBackgroundColor.bind(this);
        this.getRectSize = this.getRectSize.bind(this);
        this.getCornerSize = this.getCornerSize.bind(this);
        this.renderLoadingIndicator = this.renderLoadingIndicator.bind(this);

        this.state = {
            topWidth: 0,
            topHeight: 0,
            leftWidth: 0,
            animatedValue: new Animated.Value(0),
        }
    }

    /* Handle to set color*/
    getBackgroundColor() {
        return ({
            backgroundColor: this.props.maskColor,
        });
    }

    /* Handle to set height and width from props value */
    getRectSize() {
        return ({
            height: this.props.rectHeight,
            width: this.props.rectWidth,
        });
    }

    /* Handle  to set height and width from props value*/
    getBorderSize() {
        if (this.props.isCornerOffset) {
            return ({
                height: this.props.rectHeight - this.props.cornerOffsetSize * 2,
                width: this.props.rectWidth - this.props.cornerOffsetSize * 2,
            });
        } else {
            return ({
                height: this.props.rectHeight,
                width: this.props.rectWidth,
            });
        }
    }

    /* Handle to set color*/
    getCornerColor() {
        return ({
            borderColor: this.props.cornerColor,
        });
    }

    /* Handle  to set height and width from props value*/
    getCornerSize() {
        return ({
            height: this.props.cornerBorderLength,
            width: this.props.cornerBorderLength,
        });
    }

    /* Handle  to set width from props value*/
    getBorderWidth() {
        return ({
            borderWidth: this.props.borderWidth,
        });
    }

    /* Handle to set color*/
    getBorderColor() {
        return ({
            borderColor: this.props.borderColor,
        });
    }

    /* Render loading indicator */
    renderLoadingIndicator() {
        if (!this.props.isLoading) {
            return null;
        }

        return (
            <ActivityIndicator
                animating={this.props.isLoading}
                color={this.props.color}
                size='large'
            />
        );
    }

    /* Handle set value from props */
    measureTotalSize(e) {
        let totalSize = e.layout;
        this.setState({
            topWidth: totalSize.width,
        })
    }

    /* Handle set value from props */
    measureRectPosition(e) {
        let rectSize = e.layout;
        this.setState({
            topHeight: rectSize.y,
            leftWidth: rectSize.x,
        })
    }

    /* Handle set value from props */
    getTopMaskHeight() {
        if (this.props.isCornerOffset) {
            return this.state.topHeight + this.props.rectHeight - this.props.cornerOffsetSize;
        } else {
            return this.state.topHeight + this.props.rectHeight;
        }
    }

    /* Handle set value from props */
    getBottomMaskHeight() {
        if (this.props.isCornerOffset) {
            return this.props.rectHeight + this.state.topHeight - this.props.cornerOffsetSize;
        } else {
            return this.state.topHeight + this.props.rectHeight;
        }
    }

    /* Handle set value from props */
    getSideMaskHeight() {
        if (this.props.isCornerOffset) {
            return this.props.rectHeight - this.props.cornerOffsetSize * 2;
        } else {
            return this.props.rectHeight;
        }
    }

    /* Handle set value from props */
    getSideMaskWidth() {
        if (this.props.isCornerOffset) {
            return this.state.leftWidth + this.props.cornerOffsetSize;
        } else {
            return this.state.leftWidth;
        }
    }
    /* Handle set value from props */
    getBottomMenuHeight() {
        return ({
            bottom: this.props.bottomMenuHeight,
        });
    }
    /* Handle set value from props */
    getScanBarMargin() {
        return ({
            marginRight: this.props.scanBarMargin,
            marginLeft: this.props.scanBarMargin,
            marginTop: this.props.scanBarMargin,
            marginBottom: this.props.scanBarMargin,
        })
    }
    /* Handle set value from props */
    getScanImageWidth() {
        return this.props.rectWidth - this.props.scanBarMargin * 2
    }

    /**
     * render image layout using props image uri
     */
    _renderScanBar() {
        if (!this.props.isShowScanBar) return;
        if (this.props.scanBarImage) {
            return <Image style={{ resizeMode: 'contain', width: this.getScanImageWidth() }}
                source={this.props.scanBarImage} />
        } else {
            return <View style={[this.getScanBarMargin(), {
                backgroundColor: this.props.scanBarColor,
                height: this.props.scanBarHeight,
                // height: this.props.isLandscape?this.props.scanBarWidth:this.props.scanBarHeight,
                // width: this.props.isLandscape?this.props.rectWidth-13:this.props.scanBarWidth,
                // flexDirection: 'column'
            }]} />
        }
    }

    /** render component */
    render() {
        const animatedStyleForVertical = {
            transform: [
                { translateY: this.state.animatedValue }
            ]
        };

        const animatedStyleForHorizontal = {
            transform: [
                { translateX: this.state.animatedValue }
            ]
        };

        return (
            <View
                onLayout={({ nativeEvent: e }) => this.measureTotalSize(e)}>

                <View
                    onLayout={({ nativeEvent: e }) => this.measureRectPosition(e)}>


                    <View style={[
                        this.getBorderSize(),
                        this.getBorderColor(),
                        this.getBorderWidth(),
                    ]}>

                        <Animated.View
                            style={[
                                this.props.isLandscape ? animatedStyleForVertical : animatedStyleForVertical]}>
                            {this._renderScanBar()}
                        </Animated.View>

                    </View>


                    <View style={[
                        this.getCornerColor(),
                        this.getCornerSize(),
                        styles.topLeftCorner,
                        {
                            borderLeftWidth: this.props.cornerBorderWidth,
                            borderTopWidth: this.props.cornerBorderWidth,
                        }
                    ]} />


                    <View style={[
                        this.getCornerColor(),
                        this.getCornerSize(),
                        styles.topRightCorner,
                        {
                            borderRightWidth: this.props.cornerBorderWidth,
                            borderTopWidth: this.props.cornerBorderWidth,
                        }
                    ]} />


                    {this.renderLoadingIndicator()}


                    <View style={[
                        this.getCornerColor(),
                        this.getCornerSize(),
                        styles.bottomLeftCorner,
                        {
                            borderLeftWidth: this.props.cornerBorderWidth,
                            borderBottomWidth: this.props.cornerBorderWidth,
                        }
                    ]} />


                    <View style={[
                        this.getCornerColor(),
                        this.getCornerSize(),
                        styles.bottomRightCorner,
                        {
                            borderRightWidth: this.props.cornerBorderWidth,
                            borderBottomWidth: this.props.cornerBorderWidth,
                        }
                    ]} />
                </View>

                <View style={[
                    this.getBackgroundColor(),
                    styles.topMask,
                    {
                        bottom: this.getTopMaskHeight(),
                        width: this.state.topWidth,
                    }
                ]} />

                <View style={[
                    this.getBackgroundColor(),
                    styles.leftMask,
                    {
                        height: this.getSideMaskHeight(),
                        width: this.getSideMaskWidth(),
                    }
                ]} />

                <View style={[
                    this.getBackgroundColor(),
                    styles.rightMask,
                    {
                        height: this.getSideMaskHeight(),
                        width: this.getSideMaskWidth(),
                    }]} />

                <View style={[
                    this.getBackgroundColor(),
                    styles.bottomMask,
                    {
                        top: this.getBottomMaskHeight(),
                        width: this.state.topWidth,
                    }]} />

                {/*<View style={{position: 'absolute', bottom: 0,top:0,left:0,right:0,justifyContent:'center',alignItems:'center',flex:1}}>*/}
                {/*<Text style={this.props.hintTextStyle}>{this.props.hintText}</Text>*/}
                {/*</View>*/}

            </View>
        );
    }

    /** Component lifecycle method */
    componentDidMount() {
        this.scannerLineMove();
    }

    /** scaner line */
    scannerLineMove() {
        this.state.animatedValue.setValue(0);
        Animated.timing(this.state.animatedValue, {
            toValue: this.props.isLandscape ? this.props.rectHeight : this.props.rectHeight,
            duration: this.props.scanBarAnimateTime,
            easing: Easing.linear(),
            useNativeDriver: false
        }).start(() => this.scannerLineMove());
    }
}

/** UI styles used for this component */
const styles = StyleSheet.create({
    buttonsContainer: {
        position: 'absolute',
        height: 100,
        bottom: 0,
        left: 0,
        right: 0,
    },
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
    },
    viewfinder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    topLeftCorner: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    topRightCorner: {
        position: 'absolute',
        top: 0,
        right: 0,
    },
    bottomLeftCorner: {
        position: 'absolute',
        bottom: 0,
        left: 0,
    },
    bottomRightCorner: {
        position: 'absolute',
        bottom: 0,
        right: 0,
    },
    topMask: {
        position: 'absolute',
        top: 0,
    },
    leftMask: {
        position: 'absolute',
        left: 0,
    },
    rightMask: {
        position: 'absolute',
        right: 0,
    },
    bottomMask: {
        position: 'absolute',
        bottom: 0,
    }
});