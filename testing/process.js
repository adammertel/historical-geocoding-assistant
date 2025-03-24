var csv = require("csv-parser");
var fs = require("fs");
var turf = require("turf");
const Json2csvParser = require("json2csv").Parser;

var coded = [];
var records = [];
var users = [];

fs.createReadStream("results - coded.csv")
  .pipe(csv())
  .on("data", data => {
    coded.push(data);
  })
  .on("end", () => {
    fs.createReadStream("results - records.csv")
      .pipe(csv())
      .on("data", record => {
        record.Precision_HGA = 0;
        record.Precision_Manual = 0;

        record.Time_HGA = 0;
        record.Time_Manual = 0;
        record.Time_All = 0;
        record.Correct_Manual = 0;
        record.Correct_HGA = 0;
        record.Correct_All = 0;
        record.Distances_HGA = [];
        record.Distances_Manual = [];
        record.Distances_All = [];

        record.geo = turf.point([
          parseFloat(record.x_coordinates),
          parseFloat(record.y_coordinates)
        ]);

        records.push(record);
      })

      .on("end", () => {
        // loading users.csv
        fs.createReadStream("results - users.csv")
          .pipe(csv())
          .on("data", uData => {
            uData.Precision_Manual = 0;
            uData.Precision_HGA = 0;
            uData.Time_HGA = 0;
            uData.Time_Manual = 0;
            uData.Time_All = 0;
            uData.Correct_Manual = 0;
            uData.Correct_HGA = 0;
            uData.Correct_All = 0;
            users.push(uData);
          })
          .on("end", () => {
            // own code

            coded.filter(c => c).map(code => {
              const record = records.find(r => r.Id === code.Id);

              // user that coded this record
              const user = users.find(u => u.ID === code.User);
              code.User_Geo = user.Geocoding;
              code.User_Topic = user.Topic;
              code.Time = parseInt(code["Time [s]"], 10);

              const codedPoint = turf.point([
                parseFloat(code.x_coordinates),
                parseFloat(code.y_coordinates)
              ]);

              const HGA = code.HGA === "TRUE";
              const distance = parseInt(
                turf.distance(record.geo, codedPoint),
                10
              );
              record.Distances_All.push(distance);

              // wrong geolocalisation
              const distanceThresholds = [5, 15, 30, 60];

              let precisionPoints = 0;
              if (code.Certainty === "1") {
                if (distance < distanceThresholds[0]) {
                  precisionPoints = 1;
                } else if (distance < distanceThresholds[1]) {
                  precisionPoints = 0.75;
                }
              } else {
                if (distance < distanceThresholds[2]) {
                  precisionPoints = 0.5;
                } else if (distance < distanceThresholds[3]) {
                  precisionPoints = 0.25;
                }
              }

              code.Distance = distance;

              if (precisionPoints) {
                code.Accurate = precisionPoints;
                if (HGA) {
                  record.Precision_HGA += precisionPoints;
                  user.Precision_HGA += precisionPoints;
                  record.Distances_HGA.push(distance);
                } else {
                  record.Precision_Manual += precisionPoints;
                  user.Precision_Manual += precisionPoints;
                  record.Distances_Manual.push(distance);
                }
              } else {
                code.Accurate = 0;
                console.log(distance, code.Id, code);
              }

              // add time
              if (precisionPoints) {
                const time = code.Time;
                record.Time_All += time;
                record.Correct_All += 1;
                user.Time_All += time;
                user.Correct_All += 1;

                if (HGA) {
                  record.Time_HGA += time;
                  record.Correct_HGA += 1;
                  user.Time_HGA += time;
                  user.Correct_HGA += 1;
                } else {
                  record.Time_Manual += time;
                  record.Correct_Manual += 1;
                  user.Time_Manual += time;
                  user.Correct_Manual += 1;
                }
              }
            });

            records.map(r => {
              r.Time_HGA = r.Time_HGA / r.Correct_HGA;
              r.Time_Manual = r.Time_Manual / r.Correct_Manual;
              r.Time_All = r.Time_All / r.Correct_All;
            });

            records.map(r => {
              r.Precision_HGA = r.Precision_HGA / 6;
              r.Precision_Manual = r.Precision_Manual / 6;
            });

            users.map(r => {
              r.Precision_HGA = r.Precision_HGA / 10;
              r.Precision_Manual = r.Precision_Manual / 10;
            });

            users.map(r => {
              r.Time_HGA = r.Time_HGA / r.Correct_HGA;
              r.Time_Manual = r.Time_Manual / r.Correct_Manual;
              r.Time_All = r.Time_All / r.Correct_All;
            });

            coded.map(c => {
              const record = records.find(r => r.Id === c.Id);
              c.Record_Avg = record.Time_All;
              c.Record_Difficulty = record.Time_All > 150 ? 1 : 0;
            });

            const timeThresholds = 180;
            const precisionThresholds = 0.6;
            records.map(r => {
              let simple = "FALSE";
              if (
                r.Time_HGA < timeThresholds &&
                r.Time_Manual < timeThresholds &&
                r.Precision_HGA > precisionThresholds &&
                r.Precision_Manual > precisionThresholds
              ) {
                simple = "TRUE";
              }
              r.Simple = simple;
            });

            const parserRecords = new Json2csvParser(Object.keys(records));
            const diffOut = parserRecords.parse(records);

            fs.writeFile("out_difficulty.csv", diffOut, () => {
              console.log("diffuculty output saved");
            });

            const parserUsers = new Json2csvParser(Object.keys(users));
            const usersOut = parserUsers.parse(users);

            fs.writeFile("out_users.csv", usersOut, () => {
              console.log("users output saved");
            });

            const parserCoded = new Json2csvParser(Object.keys(coded));
            const codedOut = parserCoded.parse(coded);

            fs.writeFile("out_coded.csv", codedOut, () => {
              console.log("coded output saved");
            });

            ["Time [s]"];

            // do json from coded
            fs.writeFile(
              "coded.js",
              "var data = " + JSON.stringify({ values: coded }),
              () => {
                console.log("coded.js output saved");
              }
            );

            // do json from records
            fs.writeFile(
              "records.js",
              "var data = " + JSON.stringify({ values: records }),
              () => {
                console.log("records.js output saved");
              }
            );
          });
      });
  });
