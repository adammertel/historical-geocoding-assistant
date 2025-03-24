import React, { useState, useEffect } from "react";
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
import { GoogleLogin, useGoogleLogin } from "@react-oauth/google";
// Get the path for the img src attribute
const logoPath = logo;

const TablePrompt: React.FC = observer(() => {
  const [sheetUrl, setSheetUrl] = useState("");
  const [isReady, setIsReady] = useState(false);

  const scope =
    "https://www.googleapis.com/auth/spreadsheets email profile openid";
  const exampleSheetUrl =
    "https://docs.google.com/spreadsheets/d/1FaW23x-ZT3pmdmv77eKPJxsfGhoB1urwfvPffN_4keU";

  const Base = (window as any).Base;
  const store = (window as any).store;
  const config = (window as any).config;

  // Check for authentication and initialization status on component mount
  useEffect(() => {
    // Ensure the component is fully mounted and ready
    setIsReady(true);

    // Check if user was previously authenticated to show a more helpful message
    const wasPreviouslyAuthenticated =
      localStorage.getItem("previously_authenticated") === "true";

    if (wasPreviouslyAuthenticated && !store.userEmail) {
      console.log(
        "User was previously authenticated but needs to sign in again"
      );
    }
  }, []);

  const changeSheetUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSheetUrl(e.target.value);
  };

  const acceptSheetUrl = () => {
    if (!validSheet || !store.userEmail) {
      return; // Safety check
    }

    // Parse the sheet URL to get necessary IDs
    const parsedSheetIds = Base.parseSheetUrl(sheetUrl);

    // Update the URL hash with document ID and sheet ID
    location.hash =
      "did=" +
      parsedSheetIds["spreadsheetId"] +
      "&sid=" +
      parsedSheetIds["sheetid"];

    // Set shouldRenderApp to true to trigger app rendering
    store.shouldRenderApp = true;

    // Save authentication state for future visits
    localStorage.setItem("previously_authenticated", "true");

    // Initialize the sheet and load data
    (window as any).initSheet();
  };

  const pasteExampleSheetUrl = () => {
    setSheetUrl(exampleSheetUrl);
  };

  // Use the useGoogleLogin hook for more control over the login flow
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // Update auth status with the access token
      store.setAuth("yes");

      // Fetch user profile information using the token
      const userInfo = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        }
      );

      const userData = await userInfo.json();

      // Update the store with user email
      store.saveEmail(userData.email);
      console.log("User logged in:", userData);

      // Save authentication state for future visits
      localStorage.setItem("previously_authenticated", "true");
    },
    onError: (errorResponse) => {
      console.error("Login Failed:", errorResponse);
      store.setAuth("no");
    },
    scope: scope,
    flow: "implicit",
  });

  const validSheet = Base.checkValidSpreadsheetUrl(sheetUrl);

  // Determine if the continue button should be enabled
  const canContinue = validSheet && !!store.userEmail;

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
                <div className="mt-4 p-2 bg-gray-100 rounded-md">
                  <p className="font-medium">Logged in as: {store.userEmail}</p>
                </div>
              ) : (
                <div className="mt-4">
                  <Button
                    onClick={() => login()}
                    className="flex items-center gap-2"
                    variant="outline">
                    <svg
                      width="18"
                      height="18"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48">
                      <path
                        fill="#FFC107"
                        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                      <path
                        fill="#FF3D00"
                        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                      <path
                        fill="#4CAF50"
                        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                      <path
                        fill="#1976D2"
                        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                    </svg>
                    Sign in with Google
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <Button disabled={!canContinue} onClick={acceptSheetUrl} size="lg">
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
