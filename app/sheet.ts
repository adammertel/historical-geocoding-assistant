import Base from "./base";
import { RecordData } from "./types";

// Define types for sheet responses and use proper type guards
interface SheetResponse {
  result: {
    range: string;
    values?: string[][];
  };
}

interface SheetInfo {
  properties: {
    title: string;
    index: number;
  };
}

// Type guard to check if an object is a SheetResponse
function isSheetResponse(obj: any): obj is SheetResponse {
  return (
    obj &&
    typeof obj === "object" &&
    "result" in obj &&
    typeof obj.result === "object" &&
    "range" in obj.result
  );
}

// Store reference for global access
declare global {
  interface Window {
    config: {
      clientId: string;
      apiKey: string;
      loadingMessages: Record<string, string>;
    };
    gapi: {
      load: (api: string, options: any) => void;
      client: {
        init: (options: any) => Promise<any>;
        request: (options: any) => Promise<any>;
      };
      auth2: {
        getAuthInstance: () => any;
        init: (options: any) => Promise<any>;
      };
    };
    store: {
      userEmail: string;
      setAuth: (status: string) => void;
      loadApplication: () => void;
    };
  }
}

interface Sheet {
  scope: string;
  header: string[];
  noLines: number;
  noColumns: string;
  auth: any;
  spreadsheetId: string | false;
  spreadsheetName: string | false;
  sheetId: string | false;
  sheetName: string;
  clientId?: string;
  apiKey?: string;

  init(next: () => void): void;
  readLine(
    lineNo: number,
    withoutParsing: boolean,
    next: (data: SheetResponse | RecordData | null) => void
  ): void;
  readAllLines(next: (data: Record<string, RecordData>) => void): void;
  updateLine(lineNo: number, data: any[], next: () => void): void;
  storeSheetInfo(next: () => void): void;
  getSheetInfo(next: (info: SheetInfo[] | null) => void): void;

  _sheetInfoUrl(): string;
  _loadGapi(next: () => void): void;
  _authentificate(next: () => void): void;
  _updateSigninStatus(signedIn: boolean): void;
  _ensureAuthentificated(next: () => void): void;
  _preRead(next: () => void): void;
  _pingTable(next: (success: boolean) => void): void;
  _checkColumns(next: () => void): void;
  _checkRows(next: () => void): void;
  _loadHeader(next: () => void): void;
  _parseRow(row: SheetResponse): RecordData | null;
  _parseRecords(response: SheetResponse): Record<string, RecordData>;
  _url(range: string): string;
  _readLineUrl(lineNo: number): string;
  _readAll(): string;
  _updateLineUrl(lineNo: number): string;
  _updateBody(data: any[]): { values: any[][] };
  _reportError(errResponse: any): void;
}

const Sheet: Sheet = {
  scope: "https://www.googleapis.com/auth/spreadsheets",
  header: [],

  noLines: 999999,
  noColumns: "ZZ",

  auth: null,

  spreadsheetId: false,
  spreadsheetName: false,
  sheetId: false,
  sheetName: "",

  init(next) {
    this.clientId = window.config.clientId;
    this.apiKey = window.config.apiKey;

    const parsedIds = Base.parseSheetFromHash();
    console.log("initializing sheet", parsedIds);
    if (parsedIds) {
      this.spreadsheetId = parsedIds.did;
      this.sheetId = parsedIds.sid;
    }

    this.auth = window.gapi.auth2.getAuthInstance();

    console.log("auth", this.auth);
    this._pingTable((pinged) => {
      if (pinged) {
        this.storeSheetInfo(() => {
          console.log("sheetName", this.sheetName);
          this._preRead(() => {
            console.log("sheet inited");
            next();
          });
        });
      } else {
        console.log("error pinging table");
      }
    });
  },

  readLine(lineNo, withoutParsing, next) {
    this._ensureAuthentificated(() => {
      if (this.spreadsheetId) {
        window.gapi.client
          .request({
            path: this._readLineUrl(lineNo),
            method: "GET",
          })
          .then(
            (response: SheetResponse) => {
              if (withoutParsing) {
                next(response);
              } else {
                const parsed = this._parseRow(response);
                next(parsed);
              }
            },
            (response: any) => {
              this._reportError(response);
              next(null);
            }
          );
      } else {
        next(null);
      }
    });
  },

  readAllLines(next) {
    this._ensureAuthentificated(() => {
      window.gapi.client
        .request({
          path: this._readAll(),
          method: "GET",
        })
        .then(
          (response: SheetResponse) => {
            this.header = response.result.values?.[0] || [];
            next(this._parseRecords(response));
          },
          (response: any) => {
            this._reportError(response);
            next({});
          }
        );
    });
  },

  updateLine(lineNo, data, next) {
    this._ensureAuthentificated(() => {
      window.gapi.client
        .request({
          path: this._updateLineUrl(lineNo),
          method: "PUT",
          body: this._updateBody(data),
        })
        .then(
          () => {
            next();
          },
          (response: any) => {
            this._reportError(response);
            next();
          }
        );
    });
  },

  storeSheetInfo(next) {
    this.getSheetInfo((info: SheetInfo[] | null) => {
      if (info && info.length) {
        if (this.sheetId) {
          const foundSheetInfo = info.find(
            (sheetInfo) =>
              sheetInfo.properties.index ===
              parseInt(this.sheetId as string, 10)
          );
          if (foundSheetInfo) {
            this.sheetName = foundSheetInfo.properties.title;
            next();
          } else {
            next();
          }
        } else {
          this.sheetName = info[0].properties.title;
          next();
        }
      } else {
        next();
      }
    });
  },

  getSheetInfo(next) {
    this._ensureAuthentificated(() => {
      window.gapi.client
        .request({
          path: this._sheetInfoUrl(),
          method: "GET",
        })
        .then(
          (response: { result: { sheets: SheetInfo[] } }) => {
            next(response.result.sheets);
          },
          (response: any) => {
            this._reportError(response);
            next(null);
          }
        );
    });
  },

  _sheetInfoUrl() {
    return (
      "https://sheets.googleapis.com/v4/spreadsheets/" +
      this.spreadsheetId +
      "?fields=sheets.properties"
    );
  },

  _loadGapi(next) {
    window.gapi.load("client:auth2", () => {
      window.gapi.client
        .init({
          apiKey: this.apiKey,
          clientId: this.clientId,
          discoveryDocs: [
            "https://sheets.googleapis.com/$discovery/rest?version=v4",
          ],
          scope: this.scope,
        })
        .then(
          () => {
            this.auth = window.gapi.auth2.getAuthInstance();
            next();
          },
          (error: any) => {
            console.error(error);
          }
        );
    });
  },

  _authentificate(next) {
    window.gapi.auth2
      .init({
        client_id: this.clientId,
        scope: this.scope,
      })
      .then(
        () => {
          this.auth = window.gapi.auth2.getAuthInstance();
          this.auth.isSignedIn.listen((signedIn: boolean) => {
            this._updateSigninStatus(signedIn);
          });
          this._updateSigninStatus(this.auth.isSignedIn.get());
          next();
        },
        (error: any) => {
          console.log("error init", error);
        }
      );
  },

  _updateSigninStatus(signedIn) {
    console.log("signin status", signedIn);
    if (signedIn) {
      window.store.userEmail = this.auth.currentUser
        .get()
        .getBasicProfile()
        .getEmail();
      window.store.setAuth("yes");
      window.store.loadApplication();
    } else {
      window.store.setAuth("no");
    }
  },

  _ensureAuthentificated(next) {
    next();
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
      if (isSheetResponse(headerData)) {
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
    this.readLine(1, true, (headerData) => {
      if (isSheetResponse(headerData)) {
        try {
          this.noLines = parseInt(
            headerData.result.range.split("!")[1].split(":")[1].split(/\D+/)[1],
            10
          );
        } catch (e) {
          console.log("error reading rows", e);
        }
      }
      next();
    });
  },

  _loadHeader(next) {
    this.readLine(1, true, (headerResponse) => {
      if (isSheetResponse(headerResponse) && headerResponse.result.values) {
        this.header = headerResponse.result.values[0];
      } else {
        console.log("no header found, assuming A, B, C, ...");
        this.header = Array.from(Array(26)).map((e, i) =>
          String.fromCharCode(65 + i)
        );
      }
      next();
    });
  },

  _parseRow(row) {
    if (row.result.values) {
      const values = row.result.values[0];
      const lineData: RecordData = {};
      for (let c = 0; c < this.header.length; c++) {
        const headerValue = this.header[c];
        if (headerValue && headerValue.length) {
          lineData[headerValue] = values[c] === undefined ? "" : values[c];
        }
      }
      return lineData;
    } else {
      return null;
    }
  },

  _parseRecords(response) {
    const results: Record<string, RecordData> = {};
    if (response.result.values) {
      const responseValues = response.result.values;
      for (let i = 1; i < responseValues.length; i++) {
        const line: RecordData = {};
        for (let c = 0; c < this.header.length; c++) {
          if (this.header[c] && this.header[c].length) {
            line[this.header[c]] =
              responseValues[i][c] === undefined ? "" : responseValues[i][c];
          }
        }
        results[i + 1] = line;
      }
    }
    return results;
  },

  _url(range) {
    let sheetNamePart = this.sheetName ? this.sheetName + "!" : "";
    range = range ? range : "A1:" + this.noColumns + this.noLines;
    return (
      "https://sheets.googleapis.com/v4/spreadsheets/" +
      this.spreadsheetId +
      "/values/" +
      sheetNamePart +
      range
    );
  },

  _readLineUrl(lineNo) {
    return this._url("A" + lineNo + ":" + this.noColumns + lineNo);
  },

  _readAll() {
    return this._url("");
  },

  _updateLineUrl(lineNo) {
    return this._url("A" + lineNo + ":" + this.noColumns + lineNo);
  },

  _updateBody(data) {
    return {
      values: [data],
    };
  },

  _reportError(errResponse) {
    console.log("Sheet API error", errResponse);
  },
};

export default Sheet;
