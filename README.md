1. Download the files from repository to a folder
2. Navigate to the downloaded folder and run "npm install"
3. Open file "node_modules\react-native-gps-state\android\src\main\AndroidManifest.xml" and change allowBackup to false

<application android:allowBackup="false"
            android:label="@string/app_name"
            android:supportsRtl="true"
>

4. Replace the file VideoPlayer.txt from docs folder to "nodemodules/react-native-video-controls/VideoPlayer.js"

5. In the downloaded folder, run "react-native run-android" to run the app in debug mode

6. Go to ./android and run "gradlew.bat assembleRelease" to build apk.

7. Go to ./android and run "gradlew.bat bundleRelease" to upload bundle file to playstore.

Note: This repository has undergone clean up to remove .hprof files in commit history using https://rtyley.github.io/bfg-repo-cleaner/
The back up copy is available in, git clone https://umaitero@bitbucket.org/umaitero/eolas_mobile_app_5.0_backup.git