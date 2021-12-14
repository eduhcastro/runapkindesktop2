const fs = require('fs');

const readline = require('readline');

const extract = require('extract-zip')

const Downloader = require("nodejs-file-downloader");

let startPoint = 0

module.exports = async function (callback) {

  try {

    const linksUpdates = {
      updater_client: "http://localhost/update/client.zip",
      updater_extension1: "http://localhost/update/extensions_1.zip",
      updater_extension2: "http://localhost/update/extensions_2.zip"
    }

    const fileStream = fs.createReadStream('version.txt');

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    function extractUpdater(point) {
  
      if (point >= 6 || point >= 3) {

        setTimeout(() => {
        fs.writeFile('version.txt', '1', function (err) {

          if (err) {

            console.log("[UPDATER] ERROR version.txt");

          } else {

            console.log("[UPDATER] UPDATED version.txt");

          }
        })

        console.log("[UPDATER] EXTRACTING");

        extract('./updates/client.zip', { dir: __dirname }, function (err) {

          if (err) {

            console.log("[EXTRACT UPDATE] ERROR client.zip");

          } else {

            console.log("[UPDATER] EXTRACTED client.zip");

          }

        });


        extract('./updates/extensions_1.zip', { dir: __dirname }, function (err) {

          if (err) {

            console.log("[EXTRACT UPDATE] ERROR extensions_1.zip");

          } else {

            console.log("[UPDATER] EXTRACTED extensions_1.zip");

          }

        });

        extract('./updates/extensions_2.zip', { dir: __dirname }, function (err) {

          if (err) {

            console.log("[EXTRACT UPDATE] ERROR extensions_2.zip");

          } else {

            console.log("[UPDATER] EXTRACTED extensions_2.zip");

          }

        });
      }, 4000)
       
      setTimeout(() => {
          console.log("[UPDATER] FINISHED");
          process.exit()
        }, 10000);

      }

    }

    for await (const version of rl) {

      if (version == "0") {
        callback(false);

        console.log('\x1b[32m%s\x1b[0m', "================================================");
        console.log('\x1b[32m%s\x1b[0m', " [UPDATER] UPDATES AVAILABLE 5 SECONDS TO START ");
        console.log('\x1b[32m%s\x1b[0m', "===============  SIZE = 290MB  =================");
        console.log('\x1b[32m%s\x1b[0m', "================================================");

        const client = new Downloader({
          url: linksUpdates.updater_client, //If the file name already exists, a new file with the name 200MB1.zip is created.
          directory: "./updates", //This folder will be created, if it doesn't exist.
          onProgress: function (percentage, chunk, remainingSize) {
            //Gets called with each chunk.
            console.log("[CLIENT] %", percentage);
            if (percentage == 100) {

              startPoint++
              console.log("[CLIENT] DOWNLOADED");
              return extractUpdater(startPoint)
             
            }
            //console.log("Current chunk of data: ", chunk);
            //console.log("Remaining bytes: ", remainingSize);
          },
        });

        const extension1 = new Downloader({
          url: linksUpdates.updater_extension1, //If the file name already exists, a new file with the name 200MB1.zip is created.
          directory: "./updates", //This folder will be created, if it doesn't exist.
          onProgress: function (percentage, chunk, remainingSize) {
            //Gets called with each chunk.
            console.log("[EXTENSION_1] %", percentage);
            if (percentage == 100) {

              startPoint++
              extractUpdater(startPoint)
              console.log("[EXTENSION_1] DOWNLOADED");
            }
            //console.log("Current chunk of data: ", chunk);
            //console.log("Remaining bytes: ", remainingSize);
          },
        });

        const extension2 = new Downloader({
          url: linksUpdates.updater_extension2, //If the file name already exists, a new file with the name 200MB1.zip is created.
          directory: "./updates", //This folder will be created, if it doesn't exist.
          onProgress: function (percentage, chunk, remainingSize) {
            //Gets called with each chunk.
            console.log("[EXTENSION_2] %", percentage);
            if (percentage == 100) {

              startPoint++
              extractUpdater(startPoint)
              console.log("[EXTENSION_2] DOWNLOADED");
            }
            //console.log("Current chunk of data: ", chunk);
            //console.log("Remaining bytes: ", remainingSize);
          },
        });

        setTimeout(async () => {

          await client.download()
          await extension1.download()
          await extension2.download()

        }, 5000);

        break;
      } else {
        callback(true);
        break;
      }
    
    }

  } catch (e) {

    console.log("UPDATE ERROR: " + e)
    process.exit(1)

  }
}

