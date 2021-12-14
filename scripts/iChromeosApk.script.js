/**
 * Execute a command in the terminal
 * @const exec
 * @param {string} command - The command to execute
 * @param {function} callback - The callback function
 * @returns {void}
 */

/**
 * Get all processes running in the system
 * @const processlist
 * @returns {array}
 */
const processlist = require('node-processlist');

/**
 * Processes actions
 * @const ps
 * @returns {void}
 */
//const ps = require('ps-node');

//const { exec } = require("child_process");

const chromeos = require('../packages/chromeosapk/chromeos-apk.js')

/**
 * Controller folders and files
 */
const fs = require('fs');

const path = require("path");


try {

  if (process.argv[process.argv.length - 1].substring(process.argv[process.argv.length - 1].length - 3) !== "apk") throw new Error("Invalid argument, use apk as argument; Example: node chromeos-apk facebook.apk")

  if (!fs.existsSync(path.join(__dirname, '../') + process.argv[process.argv.length - 1])) throw new Error("Invalid argument, apk (" + process.argv[process.argv.length - 1] + ") does not exist in the current directory " + path.join(__dirname, '../') + process.argv[process.argv.length - 1])

  chromeos(process.argv[process.argv.length - 1], function (data, err) {

    if (err) throw (err)

    console.log('\x1b[32m%s\x1b[0m', "[CHROMEOS-APK] APP MODIFIED: " + data)

    setTimeout(function () {

      process.exit(0)
      
    }, 3000)

    /**
     * @see Disabled due to difficulty installing extensions externally.
     * @see What needs to be done:
     * After the application is modified, install the extension via command or script, then get the APP id and change the value in the .ENV file
     */
    //##  
    //##    console.log('\x1b[32m%s\x1b[0m', "[CHROMEOS-APK] INSTALLING APK IN CLIENT")
    //##    
    //##    exec((path.join(__dirname, '../')) + "/client/client.exe --load-extension=" + (path.join(__dirname, '../')) + "/extensions/com.octgame.arashi.android  // //--no-first-run", async function (err, stdout, stderr) {
    //##    
    //##      if (err) throw err;
    //##    
    //##      setTimeout(async function () {
    //##    
    //##        /**
    //##         * @const {array} clientList - The list of processes
    //##         */
    //##    
    //##        const clientList = await processlist.getProcessesByName('client.exe')
    //##    
    //##        if (clientList.length > 0) {
    //##    
    //##          clientList.forEach(function (element, index) {
    //##    
    //##            /**
    //##             * Kill process by pid
    //##             * @param {number} pid - The process id
    //##             */
    //##    
    //##            ps.kill(element.pid)
    //##    
    //##          });
    //##    
    //##        }
    //##    
    //##        let detailsApp = fs.readFileSync((path.join(__dirname, '../')) + '/extensions/' + data + '/manifest.json');
    //##        let { import: appId } = JSON.parse(detailsApp);
    //##    
    //##        /**
    //##         * @description - Update APP ID
    //##         */
    //##    
    //##        fs.readFile((path.join(__dirname, '../')) + '/.env', 'utf8', function (err, data) {
    //##    
    //##          if (err) throw err;
    //##    
    //##          let re = new RegExp('^.*APP_ID=.*$', 'gm');
    //##    
    //##          let formatted = data.replace(re, 'APP_ID=' + appId);
    //##    
    //##          fs.writeFile((path.join(__dirname, '../')) + '/.env', formatted, 'utf8', function (err) {
    //##    
    //##            if (err) throw err;
    //##    
    //##            setTimeout(function () {
    //##    
    //##              console.log('\x1b[32m%s\x1b[0m', "[CHROMEOS-APK] READY")
    //##    
    //##              process.exit()
    //##    
    //##            }, 3000)()
    //##          });
    //##    
    //##        });
    //##    
    //##        console.log('\x1b[33m%s\x1b[0m', "[CHROMEOS-APK] CLOSING CLIENT")
    //##    
    //##      }, 10000)()
    //console.log(stdout);
  })

} catch (error) {

  console.log(error)
  process.exit(0)

}
