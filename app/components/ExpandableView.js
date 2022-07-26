import React, { Component } from 'react';
import {
    Text,
    View,
    StyleSheet,
    LayoutAnimation,
    Platform,
    UIManager,
    Image,
    TouchableOpacity
} from 'react-native';
import * as Dimension from '../style/Dimensions';
import * as Color from '../style/Colors';
import * as Font from '../style/Fonts';

export default class ExpandableView extends Component {
    constructor() {
        super();
        this.state = {
            expanded: false
        }
        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }
    changeLayout = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        this.setState({ expanded: !this.state.expanded });
    }
    render() {
        return (
            <View style={styles.container}>
                <View style={styles.btnTextHolder}>
                    <TouchableOpacity activeOpacity={0.8}
                        onPress={this.changeLayout} style={[styles.Btn, this.props.TitleViewStyle]}>
                        <Text style={[styles.btnText, this.props.TitleTextStyle]}>{this.props.TitleText}</Text>

                        <Image
                            source={require('../images/profile/down_arrow.png')}
                            style={{ tintColor: Color.colorWhite }}
                        />
                    </TouchableOpacity>
                    <View style={{ height: this.state.expanded ? null : 0, overflow: 'hidden' }}>
                        {this.props.children}
                    </View>
                </View>
            </View >);
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center'
    },
    btnText: {
        textAlign: 'left',
        fontSize: Dimension.normalText,
    },
    btnTextHolder: {
        // borderWidth: 1,
        // borderColor: 'rgba(0,0,0,0.5)'
    },
    Btn: {
        flex: 1,
        marginTop: 16,
        height: 42,
        backgroundColor: Color.colorWhite,
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginLeft: Dimension.margin + 4 + '@s',
        marginRight: Dimension.margin + '@s',
        borderRadius: 5,
    }
});