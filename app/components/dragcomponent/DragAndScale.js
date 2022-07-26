//https://github.com/keske/react-native-easy-gestures
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { PanResponder, View, Dimensions } from 'react-native';
import R from 'ramda';
// Utils
import { angle, distance } from './math';
import {
    getAngle,
    getScale,
    getTouches,
    isMultiTouch,
} from './events.js';
const { width } = Dimensions.get('window');
const { height } = Dimensions.get('window');


/** Drag and scale component used for drag and scaling marker 
 *  for the image tag element
 */
export default class DragAndScale extends Component {

    static propTypes = {
        children: PropTypes.element,
        // Behavior
        draggable: PropTypes.oneOfType([
            PropTypes.bool,
            PropTypes.shape({
                x: PropTypes.bool,
                y: PropTypes.bool,
            }),
        ]),
        rotatable: PropTypes.bool,
        scalable: PropTypes.oneOfType([
            PropTypes.bool,
            PropTypes.shape({
                min: PropTypes.number,
                max: PropTypes.number,
            }),
        ]),
        // Styles
        style: PropTypes.object,
        // Callbacks
        onStart: PropTypes.func,
        onChange: PropTypes.func,
        onEnd: PropTypes.func,
        onMultyTouchStart: PropTypes.func,
        onMultyTouchChange: PropTypes.func,
        onMultyTouchEnd: PropTypes.func,
        onRelease: PropTypes.func,
        onPanRelease: PropTypes.func,
        onRotateStart: PropTypes.func,
        onRotateChange: PropTypes.func,
        onRotateEnd: PropTypes.func,
        onScaleStart: PropTypes.func,
        onScaleChange: PropTypes.func,
        onScaleEnd: PropTypes.func,

    };

    static defaultProps = {
        children: {},
        draggable: true || {
            x: true,
            y: false,
        },
        rotatable: true,
        scalable: true || {
            min: 0.33,
            max: 2,
        },
        // Styles
        style: {
            left: 0,
            top: 0,
            transform: [
                { rotate: '0deg' },
                { scale: 1 },
            ],
        },
        // Callbacks
        onStart: () => { },
        onChange: () => { },
        onEnd: () => { },
        onRelease: () => { },
        onPanRelease: () => { },

        // New callbacks
        onMultyTouchStart: () => { },
        onMultyTouchChange: () => { },
        onMultyTouchEnd: () => { },
        onRotateStart: () => { },
        onRotateChange: () => { },
        onRotateEnd: () => { },
        onScaleStart: () => { },
        onScaleChange: () => { },
        onScaleEnd: () => { },
    }

    constructor(props) {
        super(props);

        this.state = {
            isSet: false,
            isMultyTouchingNow: false,
            isRotatingNow: false,
            isScalingNow: false,
            locationX: 0,
            locationY: 0,
            style: {
                ...DragAndScale.defaultProps.style,
                ...this.props.style,
            },
        };
    }

    /** component life cycle methods */
    UNSAFE_componentWillMount() {
        this.pan = PanResponder.create({
            onPanResponderGrant: this.onMoveStart,
            onPanResponderMove: this.onMove,
            onPanResponderEnd: this.onMoveEnd,

            onPanResponderTerminate: () => true,
            onShouldBlockNativeResponder: () => true,
            onStartShouldSetPanResponder: (evt, gestureState) => {
                const isFarLeft = evt.nativeEvent.pageX < Math.floor(width * 0.15);

                if (isFarLeft) {
                    return true;
                }
                return false;
            },
            onPanResponderTerminationRequest: () => true,
            onMoveShouldSetPanResponderCapture: (event, { dx, dy }) => (
                dx !== 0 && dy !== 0
            ),
            onPanResponderRelease: (event, gestureState) => {
                const { style } = this.state;
                let valueX = event.nativeEvent.pageX;
                let valueY = event.nativeEvent.pageY;
                this.props.onPanRelease(event, valueX, valueY, style, this.state.isSet);
            }

        });
    }

    componentDidMount() {
        const { style } = this.state;

        this.prevStyles = style;
    }

    /** on drag method called when drag object */
    onDrag(event, gestureState) {
        const { initialStyles } = this;
        const { draggable } = this.props;
        this.setState({
            isSet: false
        })

        const isObject = R.is(Object, draggable);

        const left = (isObject ? draggable.x : draggable) ? initialStyles.left + gestureState.dx : initialStyles.left;

        const top = (isObject ? draggable.y : draggable) ? initialStyles.top + gestureState.dy : initialStyles.top;

        const isFarLeft = event.nativeEvent.pageX < Math.floor(width * 0.10);
        const isFarTop = event.nativeEvent.pageY < Math.floor(height * 0.10);

        const isFarRight = event.nativeEvent.pageX > Math.floor(width * 0.85);
        const isFarBottom = event.nativeEvent.pageY > Math.floor(height * 0.70);

        if (!isFarLeft && !isFarRight && !isFarTop && !isFarBottom) {
            this.dragStyles = { left, top };
        }

    }

    /** onRotate method called when rotate object */
    onRotate = (event) => {
        const { onRotateStart, onRotateChange, rotatable } = this.props;
        const { isRotatingNow, style } = this.state;

        const { initialTouches } = this;

        if (rotatable) {
            const currentAngle = angle(getTouches(event));
            const initialAngle = initialTouches.length > 1
                ? angle(initialTouches)
                : currentAngle;
            const newAngle = currentAngle - initialAngle;
            const diffAngle = this.prevAngle - newAngle;

            this.pinchStyles.transform.push({
                rotate: getAngle(event, style, diffAngle),
            });

            this.prevAngle = newAngle;

            if (!isRotatingNow) {
                onRotateStart(event, style);

                this.setState({ isRotatingNow: true });
            } else {
                onRotateChange(event, style);
            }
        }
    }

    /** onScale method used to scalling object */
    onScale = (event) => {

        const { onScaleStart, onScaleChange, scalable } = this.props;
        const { isScalingNow, style } = this.state;
        const { initialTouches } = this;

        const isObject = R.is(Object, scalable);

        if (isObject || scalable) {
            const currentDistance = distance(getTouches(event));
            const initialDistance = distance(initialTouches);
            const increasedDistance = currentDistance - initialDistance;
            const diffDistance = this.prevDistance - increasedDistance;

            const min = isObject ? scalable.min : 0.33;
            const max = isObject ? scalable.max : 2;
            const scale = Math.min(Math.max(getScale(event, style, diffDistance), min), max);

            this.pinchStyles.transform.push({ scale });
            this.prevDistance = increasedDistance;

            if (!isScalingNow) {
                onScaleStart(event, style);

                this.setState({ isScalingNow: true });
            } else {
                onScaleChange(event, style);

            }
        }
    }

    /** onMoveStart method called when start object moving*/
    onMoveStart = (event) => {
        const { style } = this.state;
        const { onMultyTouchStart, onStart } = this.props;

        const touches = getTouches(event);

        this.prevAngle = 0;
        this.prevDistance = 0;
        this.initialTouchesAngle = 0;
        this.pinchStyles = {};
        this.dragStyles = {};
        this.prevStyles = style;

        this.initialTouches = getTouches(event);
        this.initialStyles = style;

        onStart(event, style);

        if (touches.length > 1) {
            onMultyTouchStart(event, style);

            this.setState({ isMultyTouchingNow: true });
        }
    }

    /** onMove method called when move object */
    onMove = (event, gestureState) => {
        const { isMultyTouchingNow, style } = this.state;
        const { onChange, onMultyTouchChange } = this.props;

        const { initialTouches } = this;

        const touches = getTouches(event);

        if (touches.length !== initialTouches.length) {
            this.initialTouches = touches;
        } else {
            this.onDrag(event, gestureState);
            this.onPinch(event);
        }

        if (isMultyTouchingNow) {
            onMultyTouchChange(event, style);
        }

        this.updateStyles();

        onChange(event, style);
    }

    /** onMoveEnd method called when object end move*/
    onMoveEnd = (event) => {
        const {
            isMultyTouchingNow,
            isRotatingNow,
            isScalingNow,
            style,
        } = this.state;
        const {
            onEnd,
            onMultyTouchEnd,
            onRelease, // Legacy
            onRotateEnd,
            onScaleEnd,
        } = this.props;


        onEnd(event, style);
        onRelease(event, style); // Legacy



        if (isRotatingNow) {
            onRotateEnd(event, style);
        }

        if (isScalingNow) {
            let valueX = event.nativeEvent.pageX;
            let valueY = event.nativeEvent.pageY;
            onScaleEnd(event, valueX, valueY, style);
        }

        if (isMultyTouchingNow) {
            onMultyTouchEnd(event, style);
        }

        this.setState({
            isRotatingNow: false,
            isScalingNow: false,
            isSet: true
        });
    }

    /** pinch method */
    onPinch = (event) => {
        if (isMultiTouch(event)) {
            this.pinchStyles = { transform: [] };

            this.onScale(event);
            this.onRotate(event);
        }
    }

    /** updating styles methods 
     * @param style - pass style to update
     * @returns {callback} - callback for style update 
    */
    updateStyles = () => {
        const style = {
            ...this.state.style,
            ...this.dragStyles,
            ...this.pinchStyles,
        };

        this.updateNativeStyles(style);
        this.setState({ style });
    }

    updateNativeStyles = (style) => {
        this.view.setNativeProps({ style });
    }

    reset = (callback) => {
        const { left, top, transform } = this.prevStyles;

        this.dragStyles = { left, top };
        this.pinchStyles = { transform };

        this.updateStyles();

        callback(this.prevStyles);
    }

    /** component rendring */
    render() {
        const { style } = this.state;
        const { children } = this.props;
        return (
            <View
                ref={(c) => { this.view = c; }}
                style={style}
                {...this.pan.panHandlers}>
                {
                    children
                }
            </View>
        );
    }
}