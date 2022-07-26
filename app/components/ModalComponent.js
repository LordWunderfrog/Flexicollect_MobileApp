import React, { PureComponent } from 'react';
import {
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Keyboard
} from 'react-native';
import * as Color from '../style/Colors';

/** Model box component with chiled option */
class ModalComponent extends PureComponent {
    constructor(props) {
        super(props);
    }

    /** All button action methods */
    handleOnRequestClose = () => {
        this.props.closeDialog();
    };

    handleOnCloseDialog = () => {
        this.props.closeDialog();
    };

    /** Component Render method */
    render() {
        const modalStyleProps = this.props.modalStyle || {};
        const dialogStyleProps = this.props.dialogStyle || {};
        const animationType = this.props.animationType || 'fade';
        return (
            <Modal
                animationType={animationType}
                transparent={true}
                visible={this.props.isDialogVisible}
                avoidKeyboard={true}
                onRequestClose={this.handleOnRequestClose}>
                <View style={[styles.container, { ...modalStyleProps }]}>

                    <TouchableOpacity style={styles.container} activeOpacity={1} onPress={this.handleOnCloseDialog}>
                        <View style={[styles.modal_container, { ...dialogStyleProps }]}>
                            {this.props.children}
                        </View>
                    </TouchableOpacity>

                </View>
            </Modal >
        );
    }
}

/** UI styles used for this component */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            android: {
                backgroundColor: 'rgba(0,0,0,0.62)'
            }
        }),
    },
    modal_container: {
        marginHorizontal: 30,
        ...Platform.select({
            ios: {
                backgroundColor: Color.colorliteWhite,
                borderRadius: 10,
                minWidth: 300,
            },
            android: {
                backgroundColor: Color.colorliteWhite,
                elevation: 24,
                minWidth: 280,
                borderRadius: 5,
            },
        }),
    }
});
export default ModalComponent;
