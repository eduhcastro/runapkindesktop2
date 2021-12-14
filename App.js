/**
 * ⣿⣿⣿⣿⣿⣿⣧⠻⣿⣿⠿⠿⠿⢿⣿⠟⣼⣿⣿⣿⣿⣿⣿
 *  ⣿⣿⣿⣿⣿⣿⠟⠃⠁⠀⠀⠀⠀⠀⠀⠘⠻⣿⣿⣿⣿⣿⣿
 *  ⣿⣿⣿⣿⡿⠃⠀⣴⡄⠀⠀⠀⠀⠀⣴⡆⠀⠘⢿⣿⣿⣿⣿
 *  ⣿⣿⣿⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣿⣿⣿⣿
 *  ⣿⠿⢿⣿⠶⠶⠶⠶⠶⠶⠶⠶⠶⠶⠶⠶⠶⣿⡿⠿⣿
 *  ⡇⠀⠀⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⠀⠀⢸
 *  ⡇⠀⠀⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⠀⠀⢸
 *  ⡇⠀⠀⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⠀⠀⢸
 *  ⡇⠀⠀⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⠀⠀⢸
 *  ⣧⣤⣤⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣤⣤⣼
 *  ⣿⣿⣿⣿⣶⣤⡄⠀⠀⠀⣤⣤⣤⠀⠀⠀⢠⣤⣴⣿⣿⣿⣿
 *  ⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⣿⣿⣿⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿
 *  ⣿⣿⣿⣿⣿⣿⣿⣤⣤⣴⣿⣿⣿⣦⣤⣤⣾⣿⣿⣿⣿
 *
 * @name MobileEmulator
 * @author CastroMS#8830<Skillerm>
 * @version 1.0.0
 * @license MIT
 * @description Android Apks Emulator for Windows Desktop
**/

/**
 * Execute a command in the terminal
 * @const exec
 * @param {string} command - The command to execute
 * @param {function} callback - The callback function
 * @returns {void}
 */
const { exec } = require("child_process");

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
const ps = require('ps-node');


/**
 * Controller folders and files
 */
const fs = require('fs');

process.stdin.resume();



require('./Updater')(async function (status) {
  if (status) {
    try {

      /**
       * @const {array} clientList - The list of processes
       */

      const clientList = await processlist.getProcessesByName('client.exe')

      if (clientList.length > 0) {

        clientList.forEach(function (element, index) {

          /**
           * Kill process by pid
           * @param {number} pid - The process id
           */

          ps.kill(element.pid)

        });

      }

      /**
       * Cleaning Cache Client
       * @description Cleaning the cache of the client using fs
       */

      function callBackDelete(err) {

        /**
         * @description Ignoring the non-existent file/folder error
         * @param {error} err - The error
         */

        if (err) {

          if (err.code === 'ENOENT') {

          } else if (err.code === 'EBUSY') {

          } else {

            throw err;

          }

        }

      }

      /**
       * @description Deleting the cache of the client folder
       */

      fs.rmdir('client/Data/profile/Default/Cache', callBackDelete);
      fs.rmdir('client/Data/profile/Default/Cache2/entries', callBackDelete);
      fs.rmdir('client/Data/profile/Default/Cookies', callBackDelete);
      fs.rmdir('client/Data/profile/Default/Media Cache', callBackDelete);
      fs.unlink('client/Data/profile/Default/Cookies-Journal', callBackDelete);
      fs.unlink('client/Data/profile/Default/Media History', callBackDelete);
      //-- fs.rmdirSync('client/Data/profile/Default', callBackDelete);     ---- @Warning : Extensions are also deleted.


      /**
       * @description Deleting the cache of the temp folder
       */

      exec("rmdir /s /q %TEMP%\\GoogleChromePortable", (err, stdout, stderr) => {

        /**
         * @description Ignoring the non-existent folder error
         */

        if (err && err.code !== 2) throw err;

      })

      /**
       * Executing the client.exe
       * @description Execute the client.exe and open App
       * @const {exec}
       */
      // APP ID
      exec(__dirname + "\\client\\client.exe" + "  --profile-directory=Default --app-id=egbnjpmjcfjmgnfoolhkpiejgbnjokeo", (error, stdout, stderr) => {
    
        if (error) throw error;
    
        if (stderr) throw stderr;
    
        /**
         * Return the stdout
         * @const {void} stdout
         */
    
        if (stdout) {
    
          console.log(stdout);
    
        }
        return true
      });

      setTimeout(() => {

        process.exit()

      }, 5000);

    } catch (error) {

      console.log(error)

      process.exit(0);

    }

  }
});




