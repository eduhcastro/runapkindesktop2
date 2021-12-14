const fs = require('fs');

const extract = require('extract-zip')

let Downloader = require("nodejs-file-downloader");


module.exports = async function (callback) {

  try {

    /**
     * Links to the update files
     * @const linksUpdates {Array}
     */

    const linksUpdates = {
     
      updater_one_link: "https://onedrive.live.com/download?cid=1DDE94B1CBE8F3AF&resid=1DDE94B1CBE8F3AF%21163&authkey=AA-O72O-1OusqSM&em=2p",
   
      /**
       * @description Alternative links separated files
       * @tutorial After downloading the files, extract them at the root of the project. 2nd edit the file "version.txt" delete the value 0 and put 1
       */
      //updater_client: "https://onedrive.live.com/download?cid=1DDE94B1CBE8F3AF&resid=1DDE94B1CBE8F3AF%21158&authkey=APlu2DXHOrBVgcI&em=2p",
      //updater_extension1: "https://onedrive.live.com/download?cid=1DDE94B1CBE8F3AF&resid=1DDE94B1CBE8F3AF%21159&authkey=AP59svnT05q0hJk&em=2",
      //updater_extension2: "https://unattractive-clock.000webhostapp.com/update/extensions_2.zip"
    }

    /**
     * @description Check if the version file exists
     */

    fs.access('./version.txt', fs.F_OK, (err) => {

      if (err) {

        /**
         * @description If the version file doesn't exist, create it
         */

        fs.writeFile('./version.txt', '0', (err) => {

          if (err) throw err;

        });

      }
    })


    function updateVersion() {

      fs.writeFile('./version.txt', '1', (err) => {

        if (err) throw err;

        console.log("[UPDATE] Version updated");

        console.log("[EXIT] 10 seconds to exit (DO NOT STOP THE PROCESS)");

        setTimeout(() => {
          console.log('\x1b[32m%s\x1b[0m', "READY TO BE USED")
         process.exit();
        }, 10000);
      })
     
    }


    /**
     * @description extract the update files
     */
    function unzip(zip) {

      extract('./updates/' + zip, { dir: __dirname }, (err) => {

        if (err) throw err

        fs.unlink('./updates/' + zip, (err) => {

          if (err) throw err

        })
        console.log("[UPDATE] Update files extracted");
      })

    }

    /**
     * @description If the version file exists, read it and get version
     */

     const version = fs.readFileSync("./version.txt")

     if(version.toString() == "0") {

      if (version.toString().length > 1 || isNaN(version.toString())) throw new Error("Invalid version file, use 0 as version")

      /**
      * @description If the mode is 1, does the update using one file
      */
        const Update_1 = new Downloader({
          url: linksUpdates.updater_one_link,
          directory: "./updates",
          onProgress: function (percentage, chunk, remainingSize) {
            if (percentage == 100) {
              console.log("[UPDATE DOWNLOAD] 100%")
              console.log("[UPDATE DOWNLOAD] FINISH")

              setTimeout(function(){
                unzip('Update2.zip')
                return updateVersion()
              }, 5000)
             
            }
            console.log("[UPDATE2 DOWNLOAD] %", percentage);
          },
        });

        console.log('\x1b[32m%s\x1b[0m', "================================================");
        console.log('\x1b[32m%s\x1b[0m', " [UPDATER] UPDATES AVAILABLE 5 SECONDS TO START ");
        console.log('\x1b[32m%s\x1b[0m', "===============  SIZE = 290MB  =================");
        console.log('\x1b[32m%s\x1b[0m', "================================================");

        Update_1.download()

        return callback(false);

     } else { 

      callback(true);

     }



  } catch (e) {

    console.log("UPDATE ERROR: " + e)
    process.exit(1)

  }
}