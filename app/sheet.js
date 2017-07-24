var Sheet =  {
  sId: '1mo_Oj3XoaY5-3pH5TP-9KJrWomthcJ7G_ymOp3eqyR4',
  apiKey: 'AIzaSyDtuOsC56z_7VODWG1-Q4OVH2dls3z6C9A',
  cliendSecret: 'AQVeRvDict5TYYhNXPL324lA',
  clientId: '580409468161-q3obqkdkn61uf28sfe9u43djejtv84o8.apps.googleusercontent.com',
  scope: 'https://www.googleapis.com/auth/spreadsheets',

  header: [],

  auth: false,

  init (next) {
    this._authentificate( () => this._loadHeader(next));
  },


  _authentificate (next) {
    gapi.load('client:auth2', () => {
      gapi.client.setApiKey(this.apiKey);
      gapi.auth2.init({
        'clientId': this.clientId,
        'scope': this.scopes,
      }).then( result => {
        this.auth = gapi.auth2.getAuthInstance();
        this.auth.isSignedIn.get() ? 
          next() : () => {
            this.auth.isSignedIn.listen(next);
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

  _loadHeader(next) {
    this.readLine(1, true, (headerData) => {
      this.header = headerData.result.values[0];
      console.log(this.header);
      next()
    });
  },

  _parseRow(row, ommitParse) {
    if (ommitParse) return row;
    if (row && row.result && row.result.values) {
      const data = {};
      row.result.values[0].map((value, vi) => data[this.header[vi]] = value);
      console.log(row);
      return data;
    } else {
      return row;
    }
  },

  _readLineUrl (lineNo) {
    const range = 'A' + lineNo + ':H' + lineNo;
    return 'https://sheets.googleapis.com/v4/spreadsheets/' + this.sId + '/values/' + range + '?key=' + this.apiKey;
  },

  _updateLineUrl (lineNo) {
    const range = 'A' + lineNo + ':H' + lineNo;
    return 'https://sheets.googleapis.com/v4/spreadsheets/' + this.sId + '/values/' + range + '?key=' + this.apiKey + '&valueInputOption=RAW';
  },

  _updateBody (data) {
    return {
      values: [data]
    }
  },

  readLine (lineNo, ommitParse, after) {
    this._ensureAuthentificated( (res) => {
      gapi.client.request({
        'path': this._readLineUrl(lineNo),
        'method': 'GET',
      }).then(
        (response) => after(this._parseRow(response, ommitParse)),
        (response) => {
          this._reportError(response)
          after(false)
        }
      )
    })
  },

  updateLine (lineNo, data, after) {
    this._ensureAuthentificated( (res) => {
      gapi.client.request({
        'path': this._updateLineUrl(lineNo),
        'method': 'PUT',
        'body': this._updateBody(data)
      }).then(
        (response) => after(response.result.values),
        (response) => {
          this._reportError(response)
          after(false)
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
