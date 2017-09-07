var Sheet =  {
  //sId: '1mo_Oj3XoaY5-3pH5TP-9KJrWomthcJ7G_ymOp3eqyR4',
  sId: '1Lanj90Z1fWTXKF7CBnCF6SyrHSNOZRoEEkiN9blg4dA',
  apiKey: 'AIzaSyDtuOsC56z_7VODWG1-Q4OVH2dls3z6C9A',
  cliendSecret: 'AQVeRvDict5TYYhNXPL324lA',
  clientId: '580409468161-q3obqkdkn61uf28sfe9u43djejtv84o8.apps.googleusercontent.com',
  scope: 'https://www.googleapis.com/auth/spreadsheets', //'https://www.googleapis.com/auth/spreadsheets',

  header: [],

  noLines: 999999,
  noColumns: 'ZZ',

  auth: false,

  init (next) {
    this._authentificate( () => this._preRead(next));

  },

  _authentificate (next) {
    gapi.load('client:auth2', () => {
      console.log('client loaded')
      gapi.client.setApiKey(this.apiKey);

      gapi.auth2.init({
        'clientId': this.clientId,
        'scope': this.scope,
      }).then( result => {
        this.auth = gapi.auth2.getAuthInstance();


        if (this.auth.isSignedIn.get()) {
          next()
        } else {
            alert('Application needs to be signed in - please enable pop-ups and log in')
            
            const signedStateChanged = (value) => {
              console.log('should be signed in now');
              next()
            }
            
            this.auth.isSignedIn.listen(signedStateChanged);
            this.auth.signIn();

        }
      })
    });
  },

  _ensureAuthentificated (next) {
    if (this.auth) {
      this.auth.isSignedIn.get() ? next() : this._authentificate(next);
    } else {
      this._authentificate(next);
    }
  },

  _preRead(next) {
    this._checkColumns( () => {
      this._checkRows( () => {
        this._loadHeader(next);
      })
    })
  },

  _checkColumns(next) {
    this.readLine(1, true, (headerData) => {
      if (headerData) {
        try {
          this.noColumns = headerData.result.range
            .split('!')[1]
            .split(':')[1]
            .split('1')[0];
        } catch (e) {
          console.log('error reading columns', e);
        }
      }
      next();
    })
  },

  _checkRows(next) {
    this.readAllLines( (rowsData) => {
      if (rowsData) {
        try {
          this.noLines = Math.max(...Object.keys(rowsData));
        } catch (e) {
          console.log('error reading rows', e);
        }
      }
      next();
    })
  },

  _loadHeader(next) {
    this.readLine(1, true, (headerData) => {
      if (headerData) {
        this.header = headerData.result.values[0];
      }

      next();
      //console.log(this.header);
    });
  },

  _parseRow (row, withoutParsing) {
    if (withoutParsing){ 
      return row
    } else {
      if (row && row.result && row.result.values) {
        const data = {};
        row.result.values[0].map((value, vi) => data[this.header[vi]] = value);
        return data;
      } else {
        return row;
      }
    }
  },

  _parseRecords (response) {
    const records = {};
    response.result.values.map( (row, i) => {
      const rowColumns = {};
      row.map((value, vi) => rowColumns[this.header[vi]] = value);
      records[i + 2] = rowColumns;
    });
    
    return records;
  },

  _readLineUrl (lineNo) {
    const range = 'A' + lineNo + ':' + this.noColumns + lineNo;
    return 'https://sheets.googleapis.com/v4/spreadsheets/' + this.sId + '/values/' + range + '?key=' + this.apiKey;
  },

  _updateLineUrl (lineNo) {
    const range = 'A' + lineNo + ':' + this.noColumns + lineNo;
    return 'https://sheets.googleapis.com/v4/spreadsheets/' + this.sId + '/values/' + range + '?key=' + this.apiKey + '&valueInputOption=RAW';
  },

  _readAll () {
    const range = 'A2:' + this.noColumns + this.noLines;
    return 'https://sheets.googleapis.com/v4/spreadsheets/' + this.sId + '/values/' + range + '?key=' + this.apiKey;
  },

  _updateBody (data) {
    return {
      values: [data]
    }
  },

  readLine (lineNo, withoutParsing, next) {
    this._ensureAuthentificated( (res) => {
      gapi.client.request({
        'path': this._readLineUrl(lineNo),
        'method': 'GET',
      }).then(
        (response) => next(this._parseRow(response, withoutParsing)),
        (response) => {
          this._reportError(response)
          next(false)
        }
      )
    })
  },

  readAllLines (next) {
    this._ensureAuthentificated( (res) => {
      gapi.client.request({
        'path': this._readAll(),
        'method': 'GET',
      }).then(
        (response) => {
          next(this._parseRecords(response))
        },
        (response) => {
          this._reportError(response)
          next(false)
        }
      )
    })

  },

  updateLine (lineNo, data, next) {
    this._ensureAuthentificated( (res) => {
      gapi.client.request({
        'path': this._updateLineUrl(lineNo),
        'method': 'PUT',
        'body': this._updateBody(data)
      }).then(
        (response) => next(response.result.values),
        (response) => {
          this._reportError(response)
          next(false)
        }
      )
    })
  },


  _reportError (errResponse) {
    console.log('ERR');
    console.log(errResponse);
    console.log('ERR');
  }
};




module.exports = Sheet;
