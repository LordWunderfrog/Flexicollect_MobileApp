//https://stackoverflow.com/questions/65736393/download-speed-doesnt-work-in-react-native
import RNFetchBlob from 'rn-fetch-blob';
import * as Constants from '../utils/Constants';

//const downloadSizeInBits = 12000000;   //Use this when first image url is open is 1.5 MB image
const downloadSizeInBits = 8000000;  //1 MB - use when second image is used is 1 mb. 
const metric = 'MBps';
export const measureConnectionSpeed = (imageURIParam) => {

    //const imageURI = imageURIParam ? imageURIParam : 'https://drive.google.com/open?id=1MBHJXeRxMLLwHFpqbgTdEPsFArMM0cz7';

    /** NETWORK_SPEED_CHECK_URL link is contain one 1 mb image stored on eolas google drive */
    const imageURI = imageURIParam ? imageURIParam : Constants.NETWORK_SPEED_CHECK_URL;  //our
    console.log('Network api call start', new Date().toLocaleString())
    return new Promise((resolve, reject) => {
        const startTime = (new Date()).getTime();
        RNFetchBlob
            .config({
                fileCache: false,
            })
            .fetch('GET', imageURI, {})
            .then((res) => {
                console.log('Network api call end', new Date().toLocaleString())
                const endTime = (new Date()).getTime();
                const duration = (endTime - startTime) / 1000;
                const speed = (downloadSizeInBits / (1024 * 1024 * duration));
                let finalspeed = Math.round(speed * 10) / 10
                console.log('Final speed is', finalspeed)
                resolve({ metric, finalspeed });
            })
            .catch(reject);
    });
};