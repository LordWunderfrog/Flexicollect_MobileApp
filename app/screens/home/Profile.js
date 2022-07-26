import React, { Component } from 'react';
import { Text, View } from 'react-native';
import * as Color from '../../style/Colors';

/** Profile component */
class Profile extends Component {
    render() {
        return (
            <View style={{ flex: 1, width: '100%', justifyContent: 'center', backgroundColor: Color.colorWhite, alignSelf: 'center' }}>
                <Text style={{ color: Color.colorBlack, fontSize: 20, alignSelf: 'center' }}>Profile</Text>
            </View>
        )
    }
}
export default Profile