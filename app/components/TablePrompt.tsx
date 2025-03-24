import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import {
  Button,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "./ui";

// Import logo directly
import logo from "../assets/logo.png";
// Get the path for the img src attribute
const logoPath = logo;

const TablePrompt: React.FC = observer(() => {
  const [sheetUrl, setSheetUrl] = useState("");
  const [gapiInited, setGapiInited] = useState(false);

  const scope = "https://www.googleapis.com/auth/spreadsheets";
  const exampleSheetUrl =
    "https://docs.google.com/spreadsheets/d/1FaW23x-ZT3pmdmv77eKPJxsfGhoB1urwfvPffN_4keU";

  const Base = (window as any).Base;
  const store = (window as any).store;
  const config = (window as any).config;

  const changeSheetUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSheetUrl(e.target.value);
  };

  const acceptSheetUrl = () => {
    const parsedSheetIds = Base.parseSheetUrl(sheetUrl);
    location.hash =
      "did=" +
      parsedSheetIds["spreadsheetId"] +
      "&sid=" +
      parsedSheetIds["sheetid"];
    (window as any).initSheet();
  };

  const pasteExampleSheetUrl = () => {
    setSheetUrl(exampleSheetUrl);
  };

  const login = async () => {
    const google = (window as any).google;
    const gapi = (window as any).gapi;

    const tokenClient = await google.accounts.oauth2.initTokenClient({
      client_id: config.clientId,
      scope: config.scope,
      callback: async () => {
        console.log("CALLBACK");

        gapi.client
          .request({
            path: "https://people.googleapis.com/v1/people/me?personFields=emailAddresses",
            method: "GET",
          })
          .then((resp: any) => {
            const email = resp.result.emailAddresses[0].value;
            console.log(`user email: ${email}`);
            store.saveEmail(email);
          });
      },
    });

    gapi.load("client", () => {
      gapi.client
        .init({
          clientId: config.clientId,
          scope: config.scope,
        })
        .then(() => {
          setGapiInited(true);

          const authInstance = gapi.auth2.getAuthInstance();
          console.log("authInstance", authInstance);
          store.setAuth(authInstance);

          if (gapi.client.getToken() === null) {
            // Prompt the user to select a Google Account and ask for consent to share their data
            // when establishing a new session.
            tokenClient.requestAccessToken({ prompt: "consent" });
          } else {
            // Skip display of account chooser and consent dialog for an existing session.
            tokenClient.requestAccessToken({ prompt: "" });
          }
        });
    });
  };

  const validSheet = Base.checkValidSpreadsheetUrl(sheetUrl);

  return (
    <Dialog open={true}>
      <DialogContent className="prompt-wrapper" style={{ zIndex: 1500 }}>
        <DialogHeader>
          <DialogTitle>
            <img src={logoPath} alt="logo" className="logo" />
            <div id="version">{"version " + (window as any).version}</div>
          </DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground">
          <div className="prompt-content">
            <div className="section inputurl-section">
              <p>Copy-paste the URL of your Google Sheets table:</p>
              <Input value={sheetUrl} onChange={changeSheetUrl} />
              <p>
                Or use our{" "}
                <a href={exampleSheetUrl} target="_blank" rel="noreferrer">
                  example spreadsheet
                </a>
              </p>
              <Button variant="outline" onClick={pasteExampleSheetUrl}>
                <i className="fa fa-paste mr-1"></i>
                paste the URL
              </Button>
              <div className="section links-section">
                <b>Links:</b>
                <ul>
                  <li>
                    <a href="https://github.com/adammertel/historical-geocoder-assistant/tree/master/manual">
                      <i className="fa fa-github" /> Manual
                    </a>
                  </li>
                  <li>
                    <a href="https://github.com/adammertel/historical-geocoder-assistant">
                      <i className="fa fa-github" /> Code
                    </a>
                  </li>
                  <li>
                    <a href="dissinet.cz">
                      <i className="fa fa-link" /> DISSINET Project
                    </a>
                  </li>
                  <li>
                    <a href="gehir.phil.muni.cz">
                      <i className="fa fa-link" /> GEHIR Project
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="section notes-section">
              <b>Google Account:</b>
              <ul>
                <li>
                  The application needs to be signed in a Google Account. You
                  may need to allow pop-ups and cookies in your browser.
                </li>
              </ul>
              {store.userEmail ? (
                <div>{`logged in as ${store.userEmail}`}</div>
              ) : (
                <div className="login-button">
                  <button onClick={() => login()}>Sign in with Google</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <Button
          disabled={!validSheet || !store.userEmail}
          onClick={acceptSheetUrl}
          size="lg">
          continue and accept cookies
        </Button>

        <DialogFooter
          style={{
            textAlign: "right",
            display: "block",
            backgroundColor: "lightgrey",
          }}>
          <div>
            <div>
              Designed and coded by{" "}
              <a href="https://github.com/adammertel">
                <i className="fa fa-user" /> Adam Mertel
              </a>{" "}
              and{" "}
              <a href="http://www.david-zbiral.cz/">
                <i className="fa fa-user" /> David Zbiral
              </a>
            </div>
            <br />
            <div>
              <b>To cite the software: </b>
            </div>
            <div>
              Adam Mertel, David Zbíral, Zdeněk Stachoň, and Hana Hořínková,
              'Historical Geocoding Assistant', SoftwareX 14 (2021): 100682,
              <a href="https://doi.org/10.1016/j.softx.2021.100682">
                https://doi.org/10.1016/j.softx.2021.100682.
              </a>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export default TablePrompt;
