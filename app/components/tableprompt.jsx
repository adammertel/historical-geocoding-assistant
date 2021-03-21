import React from "react";
import { observer } from "mobx-react";
import Modal from "./../bulma/modal";
import Input from "./../bulma/input";
import Button from "./../bulma/button";

const logoPath = require("./../assets/logo.png");

@observer
class TablePrompt extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sheetUrl: "",
    };
    this.exampleSheetUrl =
      "https://docs.google.com/spreadsheets/d/1FaW23x-ZT3pmdmv77eKPJxsfGhoB1urwfvPffN_4keU";
  }

  changeSheetUrl(e) {
    this.setState({ sheetUrl: e.target.value });
  }

  acceptSheetUrl() {
    const sheetUrl = this.state.sheetUrl;
    const parsedSheetIds = Base.parseSheetUrl(sheetUrl);
    location.hash =
      "did=" +
      parsedSheetIds["spreadsheetId"] +
      "&sid=" +
      parsedSheetIds["sheetid"];
    initSheet();
  }

  pasteExampleSheetUrl() {
    this.setState({ sheetUrl: this.exampleSheetUrl });
  }

  render() {
    const validSheet = Base.checkValidSpreadsheetUrl(this.state.sheetUrl);
    return (
      <Modal
        active
        classes="prompt is-primary"
        style={{ zIndex: 1500 }}
        body={
          <div className="prompt-wrapper">
            <img src={logoPath} alt="logo" className="logo" />
            <div id="version">{"version " + window["version"]}</div>
            <div className="prompt-content">
              <div className="section inputurl-section">
                Copy-paste the URL of your Google Sheets table::
                <Input
                  value={this.state.sheetUrl}
                  onChange={this.changeSheetUrl.bind(this)}
                />
                Or use our example spreadsheet {""}
                <Button
                  inverted
                  icon="paste"
                  label="paste the URL"
                  onClick={this.pasteExampleSheetUrl.bind(this)}
                />
                <br />
                <a
                  target="_blank"
                  href="https://docs.google.com/spreadsheets/d/1FaW23x-ZT3pmdmv77eKPJxsfGhoB1urwfvPffN_4keU"
                >
                  <i className="example-sheet-url">
                    https://docs.google.com/spreadsheets/d/1FaW23x-ZT3pmdmv77eKPJxsfGhoB1urwfvPffN_4keU
                  </i>
                </a>
                <br />
              </div>
              <div className="section notes-section">
                <b>Notes:</b>
                <ul>
                  <li>
                    The application needs to be signed in a Google Account. You
                    may need to allow pop-ups and cookies in your browser.
                  </li>
                </ul>
              </div>
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
            <Button
              medium
              disabled={!validSheet}
              onClick={this.acceptSheetUrl.bind(this)}
              label="continue and accept cookies"
            />
          </div>
        }
        footerStyle={{
          textAlign: "right",
          display: "block",
          backgroundColor: "lightgrey",
        }}
        footer={
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
              ‘Historical Geocoding Assistant’, SoftwareX 14 (2021): 100682,
              <a href="https://doi.org/10.1016/j.softx.2021.100682.">
                https://doi.org/10.1016/j.softx.2021.100682.
              </a>
            </div>
          </div>
        }
      />
    );
  }
}

export default observer(TablePrompt);
