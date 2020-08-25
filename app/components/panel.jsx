import React from "react";
import { observer } from "mobx-react";

import Menu from "./../bulma/menu";
import Button from "./../bulma/button";
import Checkbox from "./../bulma/checkbox";
import Input from "./../bulma/input";

import Sheet from "./../sheet.js";
const logoPath = require("./../assets/logo.png");

class Panel extends React.Component {
  constructor(props) {
    super(props);
  }

  handleChangeInput(column, e) {
    const value = e.target.value;
    store.updateRecordValue(column, value);
  }
  handleSelectRecord(e) {
    store.gotoRecord(e.target.value);
  }
  handleChangeCertainty(e) {
    store.changeCertainty(e.target.value);
  }

  /* External links */
  handleOpenGMaps() {
    Base.openTab("google.cz/maps/search/" + store.recordName);
  }
  handleOpenGSearch() {
    Base.openTab("google.com/search?q=" + store.recordName);
  }
  handleOpenPeripleo() {
    Base.openTab("peripleo.pelagios.org/ui#q=" + store.recordName);
  }

  /* suggestions actions */
  handleFocusAndHighlightSuggestionClick(suggestion) {
    store.mapFocus(suggestion.ll);
  }
  handleHighlightSuggestionClick(suggestion) {
    store.hlLocality(suggestion.ll);
  }
  handleStoreSuggestionClick(suggestion) {
    store.useSuggestion(suggestion);
  }
  handleOpenUrl(url) {
    Base.openTab(url);
  }

  /* Coordinates actions */
  handleCoordinatesFocus() {
    store.mapFocus(store.recordGeo);
  }
  handleCoordinatesRevert() {
    store.revertChangesCoordinates();
  }
  handleCoordinatesRemove() {
    store.removeChangesCoordinates();
  }
  handleRecordRevert() {
    store.revertChangesRecord();
  }

  handleGlobalSettingOpen(mode) {
    store.openSettings(mode);
  }

  /* Table actions */
  handleLoadNewTable() {
    store.changeLoadingStatus("prompting table");
    location.hash = "";
  }
  handleOpenTableUrl() {
    Base.openTab(
      "docs.google.com/spreadsheets/d/" +
        Sheet.spreadsheetId +
        "/edit#gid=" +
        Sheet.sheetId
    );
  }

  render() {
    const recordGeo = [store.recordY, store.recordX];
    return (
      <div className="panel">
        <div>
          <img src={logoPath} alt="logo" style={{ padding: 20 }} />
        </div>
        <div id="version">{"version " + window["version"]}</div>

        <div style={{ marginRight: 30, textAlign: "right" }}>
          record {store.row - 1} / {store.noRecords - 1}
        </div>
        <div className="is-inline">
          <Button
            size="normal"
            inverted
            icon="caret-left"
            tooltip="save and go to the previous record"
            tooltipPosition="top-right"
            onClick={store.previousRecord}
          />

          <div className="select" style={{ width: 300, marginRight: "5px" }}>
            <select
              style={{ width: "100%" }}
              value={store.row}
              onChange={this.handleSelectRecord.bind(this)}
            >
              {store.geoRecords.map((record) => {
                if (Base.validGeo([record["x"], record["y"]])) {
                  return (
                    <option key={record.row} value={record.row}>
                      {record.name}
                    </option>
                  );
                } else {
                  return (
                    <option key={record.row} value={record.row}>
                      {record.name + " (no coordinates)"}
                    </option>
                  );
                }
              })}
            </select>
          </div>

          <Button
            inverted
            size="normal"
            tooltip="save and go to the next record"
            icon="caret-right"
            tooltipPosition="top-left"
            onClick={store.nextRecord}
          />
        </div>

        <div className="button-row right">
          <Button
            label="discard changes"
            icon="refresh"
            onClick={this.handleRecordRevert.bind(this)}
          />
          <Button label="save" icon="save" onClick={store.saveRecord} />
        </div>

        <Menu label="dataset" key="table" icon="table">
          <div className="table-identification">
            <table className="table centered">
              <tbody>
                <tr key="0">
                  <td>document name</td>
                  <td>{Sheet.spreadsheetName}</td>
                </tr>
                <tr>
                  <td>sheet name</td>
                  <td>{Sheet.sheetName}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="button-row right">
            <Button
              label="open table"
              icon="link"
              inverted
              onClick={this.handleOpenTableUrl.bind(this)}
            />
            <Button
              label="choose another table"
              icon="repeat"
              inverted
              onClick={this.handleLoadNewTable.bind(this)}
            />
          </div>
        </Menu>

        <Menu
          label="localisation"
          key="localisation"
          defaultOpen
          icon="map-marker"
        >
          <div>
            <table className="table centered" style={{ marginBottom: 0 }}>
              <tbody>
                <tr key="0">
                  <td>x coordinate</td>
                  <td>
                    <Input
                      onChange={this.handleChangeInput.bind(
                        this,
                        store.opts.columns.x
                      )}
                      type="number"
                      value={store.recordX}
                    />
                  </td>
                </tr>

                <tr key="1">
                  <td>y coordinate</td>
                  <td>
                    <Input
                      onChange={this.handleChangeInput.bind(
                        this,
                        store.opts.columns.y
                      )}
                      type="number"
                      value={store.recordY}
                    />
                  </td>
                </tr>

                <tr key="2">
                  <td>place name</td>
                  <td>
                    <Input
                      onChange={this.handleChangeInput.bind(
                        this,
                        store.opts.columns.name
                      )}
                      value={store.recordName}
                    />
                  </td>
                </tr>

                <tr key="4">
                  <td>certainty</td>
                  <td>
                    <div className="select" style={{ width: "100%" }}>
                      <select
                        style={{ fontSize: "11px", width: "100%" }}
                        value={store.recordCertainty}
                        onChange={this.handleChangeCertainty.bind(this)}
                      >
                        {Object.keys(config.certaintyOptions).map((cKey) => {
                          const value = config.certaintyOptions[cKey];
                          return (
                            <option key={cKey} value={cKey}>
                              {value}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </td>
                </tr>

                <tr key="3">
                  <td>localisation notes</td>
                  <td>
                    <Input
                      onChange={this.handleChangeInput.bind(
                        this,
                        store.opts.columns.note
                      )}
                      value={store.recordNote}
                    />
                  </td>
                </tr>
                <tr key="5">
                  <td>editor</td>
                  <td>
                    <Input
                      onChange={this.handleChangeInput.bind(
                        this,
                        store.opts.columns.editor
                      )}
                      value={store.editor}
                    />
                  </td>
                </tr>
              </tbody>
            </table>

            <div>
              {Base.validGeo([store.recordX, store.recordY]) ? (
                <div className="button-row right">
                  <Button
                    inverted
                    onClick={this.handleCoordinatesFocus.bind(this)}
                    tooltip="focus location on map"
                    icon="lightbulb-o"
                    label="focus"
                  />
                  <Button
                    inverted
                    onClick={this.handleCoordinatesRevert.bind(this)}
                    tooltip="revert changes to coordinates"
                    icon="refresh"
                    label="revert"
                  />
                  <Button
                    inverted
                    onClick={this.handleCoordinatesRemove.bind(this)}
                    tooltip="clear coordinate values"
                    icon="trash"
                    label="clear coordinates"
                  />
                </div>
              ) : null}
            </div>

            {!Base.inExtent(recordGeo, store.opts.maxGeoExtent) ? (
              <div className="is-warning notification">
                <i className="icon fa fa-info" />
                The coordinates are outside of the chosen spatial extent
              </div>
            ) : null}
          </div>
        </Menu>

        <Menu
          label="record data"
          key="record-data"
          defaultOpen={false}
          icon="database"
        >
          <div>
            <table className="table centered">
              <tbody>
                {Object.keys(store.recordData)
                  .filter((c) => !store.recordMandatoryColumns.includes(c))
                  .map((column, ci) => {
                    const value = store.recordData[column];

                    const shortenColumn =
                      column.length > 13
                        ? column.substr(0, 12) + "..."
                        : column;

                    return (
                      <tr key={ci}>
                        <td title={column}> {shortenColumn} </td>
                        <td>
                          <Input
                            value={value}
                            onChange={this.handleChangeInput.bind(this, column)}
                          />
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </Menu>

        {/*suggestions */}
        <Menu label="suggestions" defaultOpen key="suggestions" icon="globe">
          {SuggestionSources.map((source) => {
            const suggestionList = store.suggestions[source.id].filter(
              (g) => g
            );
            let status = "ok";
            if (!store.displaySuggestions[source.id]) {
              status = "unchecked";
            } else if (store.problemSuggestions[source.id]) {
              status = "problem";
            } else if (store.loadingSuggestions[source.id]) {
              status = "loading";
            }

            return (
              <div
                className="suggestion-section"
                key={"suggestion-section-" + source.id}
              >
                <div className="suggestion-name-line">
                  <Checkbox
                    id={"switch-" + source.id}
                    label={source.label}
                    classes="is-small"
                    checked={store.displaySuggestions[source.id]}
                    onChange={store.toggleDisplaySuggestion.bind(
                      store,
                      source.id
                    )}
                  />
                  <div className="suggestion-name-line-status">
                    {status === "ok" && (
                      <div>
                        {`[${suggestionList.length} results]`}
                        <Button
                          inverted
                          icon="circle"
                          classes={["black-halo"]}
                          style={{
                            color: config.colors[source.id],
                            verticalAlign: "baseline",
                            fontSize: "100%",
                          }}
                        />
                      </div>
                    )}
                    {status === "loading" && (
                      <Button
                        inverted
                        icon="cog"
                        classes={["fa-spin", "is-black"]}
                        style={{
                          background: "transparent",
                          verticalAlign: "middle",
                          fontSize: "120%",
                        }}
                      />
                    )}
                    {status === "problem" && (
                      <Button
                        inverted
                        icon="exclamation-triangle"
                        style={{
                          background: "transparent",
                          verticalAlign: "middle",
                          fontSize: "120%",
                        }}
                      />
                    )}
                  </div>
                </div>
                {!store.loadingSuggestions[source.id] && (
                  <div className="list">
                    {suggestionList.map((suggestion, gi) => {
                      const displayName =
                        Base.shortenText(suggestion.name, 20) || "";

                      const inExtent = suggestion.inExtent;
                      const color = inExtent ? "primary" : "danger";
                      return (
                        <div
                          key={gi}
                          className="suggestion"
                          onMouseOver={this.handleHighlightSuggestionClick.bind(
                            this,
                            suggestion
                          )}
                        >
                          <Button
                            tooltip="focus"
                            icon="lightbulb-o"
                            color={color}
                            inverted
                            onClick={this.handleFocusAndHighlightSuggestionClick.bind(
                              this,
                              suggestion
                            )}
                          />
                          <Button
                            tooltip="use coordinates"
                            icon="floppy-o"
                            color={color}
                            inverted
                            onClick={this.handleStoreSuggestionClick.bind(
                              this,
                              suggestion
                            )}
                          />
                          {suggestion.url && (
                            <Button
                              tooltip="external link"
                              icon="external-link"
                              inverted
                              color={color}
                              onClick={this.handleOpenUrl.bind(
                                this,
                                suggestion.url
                              )}
                            />
                          )}
                          <div className="suggestion-label">
                            {displayName.length === suggestion.name ? (
                              <span
                                className={
                                  "suggestion-name " +
                                  (inExtent ? "" : "is-dimmed")
                                }
                              >
                                {displayName}
                              </span>
                            ) : (
                              <span
                                className={
                                  "suggestion-name hint--top hint--medium " +
                                  (inExtent ? "" : "is-dimmed")
                                }
                                aria-label={
                                  suggestion.name +
                                  (suggestion.info
                                    ? " - " + suggestion.info
                                    : "")
                                }
                              >
                                {displayName}
                              </span>
                            )}
                            {suggestion.country && (
                              <span
                                className={
                                  "suggestion-country tag is-white " +
                                  (inExtent ? "" : "is-dimmed")
                                }
                              >
                                {suggestion.country.toUpperCase()}
                              </span>
                            )}
                            {!inExtent && (
                              <span
                                className="tag post-icon is-white hint hint--top"
                                aria-label="outside of the chosen spatial extent"
                              >
                                <i className="icon fa fa-globe is-dimmed" />
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </Menu>

        {/* External search */}
        <Menu
          label="external search"
          key="external-search"
          defaultOpen
          icon="external-link"
        >
          <div>
            <Button
              inverted
              label="Open Google search"
              icon="google"
              onClick={this.handleOpenGSearch.bind(this)}
            />
          </div>
          <div>
            <Button
              inverted
              label="Open Google Maps"
              icon="map"
              onClick={this.handleOpenGMaps.bind(this)}
            />
          </div>
          <div>
            <Button
              inverted
              label="Open Peripleo"
              icon="map-signs"
              onClick={this.handleOpenPeripleo.bind(this)}
            />
          </div>
        </Menu>

        <Menu label="settings" key="settings" defaultOpen icon="wrench">
          <div>
            <div className="checkboxes-line">
              <Checkbox
                id="switch-otherrecords"
                label="Display all records on map"
                classes="is-small"
                checked={store.opts.displayOtherRecords}
                onChange={store.toggleDisplayOtherRecords.bind(store)}
              />
              <span
                className="icon is-small"
                style={{ color: config.colors.otherRecords, paddingBottom: 8 }}
              >
                <i className={"fa fa-map-marker"} />
              </span>{" "}
              ({" "}
              <Checkbox
                id="switch-clusters"
                label="Clusters )"
                classes="is-small"
                checked={store.opts.mapClusters}
                onChange={store.toggleMapClusters.bind(store)}
              />
            </div>
            <div className="checkboxes-line">
              <Checkbox
                id="switch-focus-onchange"
                label="Focus map on record change"
                classes="is-small"
                checked={store.opts.focusOnRecordChange}
                onChange={store.toggleFocusChange.bind(store)}
              />
            </div>
            <div className="checkboxes-line">
              <div style={{}} className="field">
                <div
                  style={{ display: "inline-block", fontSize: 9 }}
                  className="select"
                >
                  <select
                    value={store.opts.focusZoom}
                    style={{ borderWidth: 2 }}
                    onChange={store.handleChangeSelect.bind(store)}
                  >
                    {[8, 9, 10, 11, 12, 13, 14, 15].map((option, oi) => {
                      return (
                        <option key={oi} value={option}>
                          {option}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <label style={{ marginLeft: "5px" }}>Focus zoom level</label>
              </div>
            </div>
            <div className="button-row">
              <Button
                label="columns"
                icon="columns"
                onClick={this.handleGlobalSettingOpen.bind(this, "columns")}
              />
              <Button
                label="spatial extent"
                icon="globe"
                onClick={this.handleGlobalSettingOpen.bind(this, "extent")}
              />
            </div>
          </div>
        </Menu>
      </div>
    );
  }
}

export default observer(Panel);
