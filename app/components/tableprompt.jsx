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
      sheetUrl: ""
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
                    <a href="https://github.com/adammertel/historical-geocoder-assistant">
                      <i className="fa fa-github" /> Code | Manual
                    </a>
                  </li>
                  <li>
                    <a href="https://github.com/adammertel/historical-geocoder-assistant/tree/master/manual">
                      Documentation
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        }
        footerStyle={{ textAlign: "right", display: "block" }}
        footer={
          <Button
            medium
            disabled={!validSheet}
            onClick={this.acceptSheetUrl.bind(this)}
            label="continue and accept cookies"
          />
        }
      />
    );
  }
}

export default observer(TablePrompt);
