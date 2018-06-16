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
      .on("data", data => {
        data.Precision_HGA = 0;
        data.Precision_Manual = 0;

        data.Time_HGA = 0;
        data.Time_Manual = 0;
        data.Time_All = 0;
        data.Correct_Manual = 0;
        data.Correct_HGA = 0;
        data.Correct_All = 0;

        data.geo = turf.point([
          parseFloat(data.x_coordinates),
          parseFloat(data.y_coordinates)
        ]);

        records.push(data);
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

              // wrong geolocalisation
              const maxDistance = code.Certainty === "1" ? 15 : 50;
              const precisionPoints = code.Certainty === "1" ? 1 : 0.5;

              const ok = distance < maxDistance;
              code.Distance = distance;

              if (ok) {
                code.Accurate = precisionPoints;
                if (HGA) {
                  record.Precision_HGA += precisionPoints;
                  user.Precision_HGA += precisionPoints;
                } else {
                  record.Precision_Manual += precisionPoints;
                  user.Precision_Manual += precisionPoints;
                }
              } else {
                code.Accurate = 0;
                console.log(distance, code.Id, code);
              }

              // add time
              if (ok) {
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

            const timeThresholds = [150];
            records.map(r => {
              let timeCategory = 2;
              if (r.Time_All < timeThresholds[0]) {
                timeCategory = 1;
              }
              r.Time_Category = timeCategory;
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
