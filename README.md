<p align="center">
<img src="https://cdn-icons.flaticon.com/png/512/278/premium/278157.png?token=exp=1639526847~hmac=f35d8df8e1ef9e50efb7304c940a3944" width="150px" />

## Run Apk In Desktop 2
</p>

Use mobile apps on your Windows system using Chrome, Chromeos-Apk and Archon!</br>
Warning: Applications may or may not work, the project this is based on is out of date.

## Components
- <a href="https://github.com/vladikoff/chromeos-apk"/>chromeos-apk</a>
- <a href="https://github.com/googlechrome"/>chrome</a>
- <a href="https://archon-runtime.github.io/"/>archon-runtime</a>

## Installation
Requires Node.js v10+ to run.

Install the dependencies and devDependencies and start the server.

```sh
cd runapkindesktop2
npm i
```

Install the dependencies to the chromeos
```sh
cd runapkindesktop2/packages/chromeosapk
npm i
```

## Tutorial

If this is your first startup, use the following command to update the project.

```sh
npm run start
```
after the download is complete, the files will be extracted in their proper places.
</br>

Download some apk, and place it in the project root, then run the following command.
```sh
npm run chromeos-apk <apkname.apk>
```
this command will make the apk be turned into an extension for Chrome.
After that, the console shows this: 
```sh
[CHROMEOS-APK] APP MODIFIED: extensions\com.apkname....android
```

### Installing Extensions
- 1° Open client in `runapkindesktop2/client/client.exe`
- 2° Follow to `chrome://extensions/`
- 3° Enable developer mode
- 4° Click on the `Load Unpacked` button
- 5° Go to `runapkindesktop2/extensions/vladikoff-archon-e3c9b322402a` and ok
- 6° Repeat the same process, but this time import your app, which is located in: `runapkindesktop2/extensions/.com.apkname....android`
- 7° Copy the code of your app.

### Now...
- Create file .env and add the code of APP_ID variable
- Run the command `npm run start` to start the application

## License

MIT
