import Base from "./base";
import { RecordData } from "./types/index";
import { gapi } from "gapi-script";

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

type SheetCallback<T> = (data: T) => void;

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
    store: {
      userEmail: string;
      setAuth: (status: string) => void;
      loadApplication: () => void;
      changeLoadingStatus: (status: string) => void;
    };
  }
}

interface Sheet {
  scope: string;
  header: string[];
  noLines: number;
  noColumns: string;
  auth: gapi.auth2.GoogleAuth | null;
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
    next: SheetCallback<SheetResponse | RecordData | null>
  ): void;
  readAllLines(next: SheetCallback<Record<string, RecordData>>): void;
  updateLine(lineNo: number, data: any[], next: () => void): void;
  storeSheetInfo(next: () => void): void;
  getSheetInfo(next: SheetCallback<SheetInfo[] | null>): void;

  _sheetInfoUrl(): string;
  _loadGapi(next: () => void): void;
  _authenticate(next: () => void): void;
  _updateSigninStatus(signedIn: boolean): void;
  _ensureAuthenticated(next: () => void): void;
  _preRead(next: () => void): void;
  _pingTable(next: SheetCallback<boolean>): void;
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
  scope: "https://www.googleapis.com/auth/spreadsheets email profile openid",
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

    this._loadGapi(() => {
      this._authenticate(() => {
        // Check if we have a valid spreadsheet ID
        if (!this.spreadsheetId) {
          console.error("No spreadsheet ID provided");
          next();
          return;
        }

        // Ping the table to verify access
        this._pingTable((pinged) => {
          if (pinged) {
            this.storeSheetInfo(() => {
              console.log("Sheet name:", this.sheetName);
              this._preRead(() => {
                console.log("Sheet initialized successfully");
                next();
              });
            });
          } else {
            console.error(
              "Error pinging table - no access or invalid spreadsheet ID"
            );
            // Still call next to avoid blocking the application
            // but the app will show the table prompt again
            next();
          }
        });
      });
    });
  },

  readLine(lineNo, withoutParsing, next) {
    this._ensureAuthenticated(() => {
      if (this.spreadsheetId) {
        gapi.client
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
    this._ensureAuthenticated(() => {
      if (!this.spreadsheetId) {
        console.error("No spreadsheet ID available for reading lines");
        next({});
        return;
      }

      console.log("Reading all lines from sheet:", this.sheetName);
      gapi.client
        .request({
          path: this._readAll(),
          method: "GET",
        })
        .then(
          (response: SheetResponse) => {
            this.header = response.result.values?.[0] || [];
            const records = this._parseRecords(response);
            console.log(
              `Read ${Object.keys(records).length} records from sheet`
            );
            next(records);
          },
          (response: any) => {
            this._reportError(response);
            console.error("Failed to read data from sheet");
            next({});
          }
        );
    });
  },

  updateLine(lineNo, data, next) {
    this._ensureAuthenticated(() => {
      if (!this.spreadsheetId) {
        next();
        return;
      }

      gapi.client
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
    this._ensureAuthenticated(() => {
      if (!this.spreadsheetId) {
        next(null);
        return;
      }

      gapi.client
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
    // Check if gapi is already loaded
    if (typeof gapi !== "undefined" && gapi.client) {
      next();
      return;
    }

    // Load gapi client library
    gapi.load("client", () => {
      // Initialize the client with API key and client ID
      gapi.client
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
            console.log("GAPI client initialized successfully");
            next();
          },
          (error: any) => {
            console.error("Error initializing GAPI client:", error);
            // Still call next to avoid blocking the application
            next();
          }
        );
    });
  },

  _authenticate(next) {
    // With @react-oauth/google, authentication is handled through the GoogleLogin component
    // This function is kept for backwards compatibility, but largely bypassed
    // Check if the user is already authenticated by checking userEmail in the store
    if (window.store.userEmail) {
      console.log("User already authenticated:", window.store.userEmail);
      this._updateSigninStatus(true);
      next();
      return;
    }

    // If not authenticated, let the user know they need to authenticate
    console.log(
      "User not authenticated. Authentication is handled through the TablePrompt component."
    );
    this._updateSigninStatus(false);
    next();
  },

  _updateSigninStatus(signedIn) {
    console.log("Sign-in status changed:", signedIn);
    if (signedIn) {
      window.store.setAuth("yes");
      window.store.loadApplication();
    } else {
      window.store.setAuth("no");
    }
  },

  _ensureAuthenticated(next) {
    // Check if user email exists in the store
    if (window.store.userEmail) {
      next();
      return;
    }

    // If not authenticated, handle it gracefully
    console.log("User not authenticated. Redirecting to authentication flow.");
    window.store.changeLoadingStatus("prompting table");
    // Don't call next() here, as we're redirecting to authentication flow
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
      next(!!pingedData);
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
          console.error("Error reading columns:", e);
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
          console.error("Error reading rows:", e);
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
        console.log("No header found, assuming A, B, C, ...");
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
    console.error("Sheet API error:", errResponse);
  },
};

export default Sheet;
