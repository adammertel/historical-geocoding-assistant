var Sheet = {
  scope: "https://www.googleapis.com/auth/spreadsheets",
  header: [],

  noLines: 999999,
  noColumns: "ZZ",

  auth: false,

  spreadsheetId: false,
  spreadsheetName: false,
  sheetId: false,
  sheetName: "",

  init(next) {
    this.clientId = config.clientId;
    this.apiKey = config.apiKey;

    const parsedIds = Base.parseSheetFromHash();
    console.log("initializing sheet", parsedIds);
    this.spreadsheetId = parsedIds.did;
    this.sheetId = parsedIds.sid;
    this._loadGapi(() => {
      this._authentificate(() => {
        this._pingTable((pinged) => {
          if (pinged) {
            this.storeSheetInfo(() => {
              console.log("sheetName", this.sheetName);
              console.log("spreadsheetName", this.spreadsheetName);

              window["username"] = gapi.auth2
                .getAuthInstance()
                .currentUser.get()
                .getBasicProfile()
                .getName();

              console.log("username", username);

              this._preRead(next);
            });
          } else {
            alert("table was not ititialized, wrong id");
            location.hash = "";
            location.reload();
          }
        });
      });
    });

    // this._authentificate(() => {
    //   this._pingTable((pinged) => {
    //     if (pinged) {
    //       this.storeSheetInfo(() => {
    //         console.log("sheetName", this.sheetName);
    //         console.log("spreadsheetName", this.spreadsheetName);

    //         // window["username"] = gapi.auth2
    //         //   .getAuthInstance()
    //         //   .currentUser.get()
    //         //   .getBasicProfile()
    //         //   .getName();
    //         window["username"] = "test";

    //         console.log("username", username);

    //         this._preRead(next);
    //       });
    //     } else {
    //       alert("table was not ititialized, wrong id");
    //       location.hash = "";
    //       location.reload();
    //     }
    //   });
    // });
  },

  readLine(lineNo, withoutParsing, next) {
    this._ensureAuthentificated(() => {
      gapi.client
        .request({
          path: this._readLineUrl(lineNo),
          method: "GET",
        })
        .then(
          (response) => next(this._parseRow(response, withoutParsing)),
          (response) => {
            this._reportError(response);
            next(false);
          }
        );
    });
  },

  readAllLines(next) {
    this._ensureAuthentificated(() => {
      gapi.client
        .request({
          path: this._readAll(),
          method: "GET",
        })
        .then(
          (response) => {
            next(this._parseRecords(response));
          },
          (response) => {
            this._reportError(response);
            next(false);
          }
        );
    });
  },

  updateLine(lineNo, data, next) {
    this._ensureAuthentificated(() => {
      // console.log("updating", data);
      gapi.client
        .request({
          path: this._updateLineUrl(lineNo),
          method: "PUT",
          body: this._updateBody(data),
        })
        .then(
          (response) => next(response.result.values),
          (response) => {
            this._reportError(response);
            next(false);
          }
        );
    });
  },

  storeSheetInfo(next) {
    this.getSheetInfo((sheetInfo) => {
      // getting sheet name
      const sheets = sheetInfo.sheets.map((s) => s.properties);
      this.spreadsheetName = sheetInfo.properties.title;
      console.log("sheet info", sheetInfo);

      if (sheets.length) {
        const foundSheet = sheets.find(
          (sheet) => sheet.sheetId == this.sheetId
        );
        this.sheetName = foundSheet ? foundSheet.title : sheets[0].title;
      }
      next();
    });
  },

  getSheetInfo(next) {
    this._ensureAuthentificated(() => {
      gapi.client
        .request({
          path: this._sheetInfoUrl(),
          method: "GET",
        })
        .then(
          (response) => next(response.result),
          (response) => {
            this._reportError(response);
            next(false);
          }
        );
    });
  },

  _sheetInfoUrl() {
    return (
      "https://sheets.googleapis.com/v4/spreadsheets/" +
      this.spreadsheetId +
      "?key=" +
      this.apiKey
    );
  },

  _loadGapi(next) {
    gapi.load("client", () => {
      gapi.client
        .init({
          clientId: this.clientId,
          scope: this.scope,
        })
        .then(() => {
          this.gapiInited = true;
          next();
        });
    });
  },

  _authentificate(next) {
    google.accounts.id.initialize({
      client_id: this.clientId,
      scope: this.scope,
      callback: (sth) => {
        console.log(sth);
      },
    });
    google.accounts.id.prompt();
    next();
  },

  // _authentificate(next) {
  //   gapi.load("client:auth2", () => {
  //     store.changeLoadingStatus("table");
  //     // gapi.client.setApiKey(this.apiKey);

  //     gapi.auth2
  //       .init({
  //         clientId: this.clientId,
  //         scope: this.scope,
  //       })
  //       .then(() => {
  //         //this.auth = gapi.auth2.getAuthInstance();
  //         console.log(this.auth);
  //         next();

  //         // if (this.auth.isSignedIn.get()) {
  //         //   next();
  //         // } else {
  //         //   alert(
  //         //     "Application needs to be signed in - please enable pop-ups and reload the page to log in"
  //         //   );

  //         //   const signedStateChanged = () => {
  //         //     console.log("should be signed in now");
  //         //     next();
  //         //   };
  //         //   this.auth.isSignedIn.listen(signedStateChanged);
  //         //   this.auth.signIn();
  //         // }
  //       });
  //   });
  // },

  _ensureAuthentificated(next) {
    if (this.auth) {
      this.auth.isSignedIn.get() ? next() : this._authentificate(next);
    } else {
      this._authentificate(next);
    }
  },

  _preRead(next) {
    this._checkColumns(() => {
      this._checkRows(() => {
        this._loadHeader(next);
      });
    });
  },

  _pingTable(next) {
    this.readLine(1, true, (pingedData) => {
      if (pingedData) {
        next(true);
      } else {
        next(false);
      }
    });
  },

  _checkColumns(next) {
    this.readLine(1, true, (headerData) => {
      if (headerData) {
        try {
          this.noColumns = headerData.result.range
            .split("!")[1]
            .split(":")[1]
            .split("1")[0];
        } catch (e) {
          console.log("error reading columns", e);
        }
      }
      next();
    });
  },

  _checkRows(next) {
    this.readAllLines((rowsData) => {
      if (rowsData) {
        try {
          this.noLines = Math.max(...Object.keys(rowsData));
        } catch (e) {
          console.log("error reading rows", e);
        }
      }
      next();
    });
  },

  _loadHeader(next) {
    this.readLine(1, true, (headerData) => {
      if (headerData) {
        this.header = headerData.result.values[0];
      }

      next();
      // console.log(this.header);
    });
  },

  _parseRow(row, withoutParsing) {
    if (withoutParsing) {
      return row;
    } else {
      if (row && row.result && row.result.values) {
        const data = {};
        row.result.values[0].map(
          (value, vi) => (data[this.header[vi]] = value)
        );
        return data;
      } else {
        return row;
      }
    }
  },

  _parseRecords(response) {
    const records = {};
    response.result.values.map((row, i) => {
      const rowColumns = {};
      this.header.forEach(
        (columnName, ci) => (rowColumns[columnName] = row[ci])
      );
      records[i + 2] = rowColumns;
    });

    return records;
  },

  _url(range) {
    return (
      "https://sheets.googleapis.com/v4/spreadsheets/" +
      this.spreadsheetId +
      "/values/" +
      (this.sheetName ? this.sheetName + "!" : "") +
      range +
      "?key=" +
      this.apiKey
    );
  },

  _readLineUrl(lineNo) {
    const range = "A" + lineNo + ":" + this.noColumns + lineNo;
    return this._url(range);
  },
  _readAll() {
    const range = "A2:" + this.noColumns + this.noLines;
    return this._url(range) + "&valueRenderOption=FORMULA";
  },

  _updateLineUrl(lineNo) {
    const range = "A" + lineNo + ":" + this.noColumns + lineNo;
    return this._url(range) + "&valueInputOption=USER_ENTERED";
  },

  _updateBody(data) {
    return {
      values: [data],
    };
  },

  _reportError(errResponse) {
    console.log("ERR");
    console.log(errResponse);
    console.log("ERR");
  },
};

module.exports = Sheet;
