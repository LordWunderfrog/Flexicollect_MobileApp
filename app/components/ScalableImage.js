import React from 'react';
import PropTypes from 'prop-types';
import { Image, TouchableOpacity, ImageBackground } from 'react-native';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';

/** Image scalling component */
export default class ScalableImage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            size: {
                width: null,
                height: null,
            }
        };

        this.mounted = false;
    }

    /** Component life cycle methods */
    componentDidMount() {
        this.mounted = true;
        this.onProps(this.props);
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        this.onProps(nextProps);
    }

    /**
     * 
     * check if source uri available from props
     */
    onProps(props) {
        if (props.source.uri) {
            const source = props.source.uri ? props.source.uri : props.source;
            Image.getSize(source, (width, height) => this.adjustSize(width, height, props));
        }
        else {
            const source = resolveAssetSource(props.source);
            this.adjustSize(source.width, source.height, props);
        }
    }

    /**
     * Calculate image height and width
     */
    adjustSize(sourceWidth, sourceHeight, props) {
        const { width, height, maxWidth, maxHeight } = props;

        let ratio = 1;

        if (width && height) {
            ratio = Math.min(width / sourceWidth, height / sourceHeight);
        }
        else if (width) {
            ratio = width / sourceWidth;
        }
        else if (height) {
            ratio = height / sourceHeight;
        }

        // Deprecated stuff. Added the PR by mistake. You should use only width and height props
        if (maxWidth && sourceWidth * ratio > maxWidth) {
            ratio = maxWidth / sourceWidth;
        }

        if (maxHeight && sourceHeight * ratio > maxHeight) {
            ratio = maxHeight / sourceHeight;
        }

        if (this.mounted) {
            this.setState({
                size: {
                    width: sourceWidth * ratio ? sourceWidth * ratio : 200,
                    height: sourceHeight * ratio ? sourceHeight * ratio : 100 //default height if not found ratio
                }
            }, () => this.props.onSize(this.state.size));
        }
    }

    /** Render component */
    render() {
        const ImageComponent = this.props.background
            ? ImageBackground
            : Image;

        const image = <ImageComponent {...this.props} style={[this.props.style, this.state.size]} />;

        if (!this.props.onPress) {
            return image;
        }

        return (
            <TouchableOpacity onPress={this.props.onPress}>
                {image}
            </TouchableOpacity>
        );
    }
}

/** propes that possible to pass for this component
 *  to scalling image. 
 */
ScalableImage.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    onPress: PropTypes.func,
    onSize: PropTypes.func,
    background: PropTypes.bool,
    from: PropTypes.string
};

ScalableImage.defaultProps = {
    background: false,
    onSize: size => { }
};