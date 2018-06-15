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
        fs.createReadStream("results - users.csv")
          .pipe(csv())
          .on("data", data => {
            users.push(data);
          })
          .on("end", () => {
            // own code

            coded.filter(c => c).map(code => {
              const record = records.find(r => r.Id === code.Id);

              console.log(code.Id);

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

              if (ok) {
                if (HGA) {
                  record.Precision_HGA += precisionPoints;
                } else {
                  record.Precision_Manual += precisionPoints;
                }
              } else {
                console.log(distance, code.Id, code);
              }

              // add time
              if (ok) {
                const time = parseInt(code["Time [s]"], 10);
                record.Time_All += time;
                record.Correct_All += 1;
                if (HGA) {
                  record.Time_HGA += time;
                  record.Correct_HGA += 1;
                } else {
                  record.Time_Manual += time;
                  record.Correct_Manual += 1;
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

            const timeThresholds = [150];
            records.map(r => {
              let timeCategory = 2;
              if (r.Time_All < timeThresholds[0]) {
                timeCategory = 1;
              }
              r.Time_Category = timeCategory;
            });

            const json2csvParser = new Json2csvParser(Object.keys(records));
            const out = json2csvParser.parse(records);
            fs.writeFile("difficulty.csv", out, () => {
              console.log("diffuculty output saved");
            });
          });
      });
  });
