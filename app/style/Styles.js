import * as Color from './Colors';
import * as Dimension from './Dimensions';
import * as Font from "./Fonts";
import { ScaledSheet } from 'react-native-size-matters';

/** some comman styles  */
export const styles = ScaledSheet.create({
    safeAreaWhite: {
        backgroundColor: Color.colorWhite,
        flex: 1
    },
    loaderStyle: {
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#ffffff"
    },
    indicatorStyle: {
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        alignItems: 'center',
        alignSelf: 'stretch'
    },
    backArrow: {
        width: 18,
        height: 16,
        marginLeft: '10@ms',
        alignSelf: 'center',
    },
})