import React from "react";
import { observer } from "mobx-react";

import Menu from "./../bulma/menu";
import Button from "./../bulma/button";
import Checkbox from "./../bulma/checkbox";
import Input from "./../bulma/input";

const logoPath = require("./../assets/logo.png");

class Panel extends React.Component {
  constructor(props) {
    super(props);
  }

  styleTag() {
    return {
      margin: "0px 5px",
      fontSize: 8.5,
      verticalAlign: "top",
      padding: "4px",
      border: "1px solid black",
      marginRight: 0,
      cursor: "default"
    };
  }

  styleLabel() {
    return {
      marginLeft: "5px",
      width: "220px",
      display: "inline-block",
      whiteSpace: "nowrap"
    };
  }

  styleSmallButton() {
    return {
      marginTop: -3
    };
  }

  handleChangeInput(column, e) {
    const value = e.target.value;
    store.updateRecordValue(column, value);
  }

  handleOpenUrl(url) {
    Base.openTab(url);
  }

  handleOpenGMaps() {
    Base.openTab("google.cz/maps/search/" + store.recordName);
  }

  handleOpenGSearch() {
    Base.openTab("google.com/search?q=" + store.recordName);
  }
  handleOpenPeripleo() {
    Base.openTab("peripleo.pelagios.org/ui#q=" + store.recordName);
  }

  handleSelectRecord(e) {
    store.gotoRecord(e.target.value);
  }

  /* suggestions actions */
  handleHighlightSuggestionClick(suggestion) {
    store.hlLocality(suggestion.ll);
  }
  handleLocateSuggestionClick(suggestion) {
    store.mapFocus(suggestion.ll);
  }
  handleStoreSuggestionClick(suggestion) {
    store.useSuggestion(suggestion);
  }

  /* Coordinates actions */
  handleCoordinatesHighlight() {
    store.hlLocality(store.recordGeo);
  }
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
  handleChangeCertainty(e) {
    store.changeCertainty(e.target.value);
  }

  render() {
    const recordGeo = [store.recordY, store.recordX];
    return (
      <div className="panel">
        <div id="version">{"version " + window["version"]}</div>
        <div>
          <img src={logoPath} alt="logo" style={{ padding: 20 }} />
        </div>

        <div style={{ marginRight: 30, textAlign: "right" }}>
          record {store.row - 1} / {store.noRecords - 1}
        </div>
        <div className="is-inline">
          <Button
            size="normal"
            inverted
            icon="caret-left"
            onClick={store.previousRecord}
          />

          <div className="select" style={{ width: 300, marginRight: "5px" }}>
            <select
              style={{ width: "100%" }}
              value={store.row}
              onChange={this.handleSelectRecord.bind(this)}
            >
              {store.geoRecords.map(record => {
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
            icon="caret-right"
            onClick={store.nextRecord}
          />
        </div>

        <div
          style={{
            width: "100%",
            paddingRight: 10,
            textAlign: "right",
            marginTop: 10,
            marginBottom: 10
          }}
          className="button-row"
        >
          <Button
            label="discard changes"
            icon="refresh"
            onClick={this.handleRecordRevert.bind(this)}
          />
          <Button label="save" icon="save" onClick={store.saveRecord} />
        </div>

        <Menu
          label="localisation"
          key="localisation"
          defaultOpen
          icon="map-marker"
        >
          <div>
            <table className="table centered">
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
                        {Object.keys(config.certaintyOptions).map(cKey => {
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
              </tbody>
            </table>

            <div>
              {Base.validGeo([store.recordX, store.recordY]) ? (
                <div className="button-row">
                  <Button
                    inverted
                    onClick={this.handleCoordinatesHighlight.bind(this)}
                    tooltip="highlight location on map"
                    icon="lightbulb-o"
                    label="highlight"
                    style={this.styleSmallButton()}
                  />
                  <Button
                    inverted
                    onClick={this.handleCoordinatesFocus.bind(this)}
                    tooltip="pan map to the location"
                    icon="compass"
                    label="focus"
                    style={this.styleSmallButton()}
                  />
                  <Button
                    inverted
                    onClick={this.handleCoordinatesRevert.bind(this)}
                    tooltip="revert changes to coordinates"
                    icon="recycle"
                    label="revert"
                    style={this.styleSmallButton()}
                  />
                  <Button
                    inverted
                    onClick={this.handleCoordinatesRemove.bind(this)}
                    tooltip="clear coordinate values"
                    icon="trash"
                    label="clear coordinates"
                    style={this.styleSmallButton()}
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
          defaultOpen={window["TESTING"]}
          icon="table"
        >
          <div>
            <table className="table centered">
              <tbody>
                {Object.keys(store.recordData)
                  .filter(c => !store.recordMandatoryColumns.includes(c))
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
          {SuggestionSources.map(source => {
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
                  <div>
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
                  </div>
                  <div>
                    {status === "ok" && (
                      <Button
                        inverted
                        icon="circle"
                        classes={["black-halo"]}
                        style={{
                          color: config.colors[source.id],
                          verticalAlign: "middle",
                          fontSize: "80%"
                        }}
                      />
                    )}
                    {status === "loading" && (
                      <Button
                        inverted
                        icon="cog"
                        classes={["fa-spin", "is-black"]}
                        style={{
                          background: "transparent",
                          verticalAlign: "middle",
                          fontSize: "120%"
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
                          fontSize: "120%"
                        }}
                      />
                    )}
                  </div>
                </div>
                {!store.loadingSuggestions[source.id] && (
                  <div className="list">
                    {store.suggestions[source.id]
                      .filter(g => g)
                      .map((suggestion, gi) => {
                        const displayName =
                          Base.shortenText(suggestion.name, 20) || "";

                        const inExtent = suggestion.inExtent;
                        const color = inExtent ? "primary" : "danger";
                        return (
                          <div key={gi} className="suggestion">
                            <Button
                              tooltip="highlight"
                              icon="lightbulb-o"
                              color={color}
                              inverted
                              onClick={this.handleHighlightSuggestionClick.bind(
                                this,
                                suggestion
                              )}
                              style={this.styleSmallButton()}
                            />
                            <Button
                              tooltip="focus"
                              icon="compass"
                              color={color}
                              inverted
                              onClick={this.handleLocateSuggestionClick.bind(
                                this,
                                suggestion
                              )}
                              style={this.styleSmallButton()}
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
                              style={this.styleSmallButton()}
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
                                style={this.styleSmallButton()}
                              />
                            )}
                            <div style={this.styleLabel()}>
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
                                    "suggestion-name hint--top hint--medium" +
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
                                    "suggestion-country tag is-white hint hint--top " +
                                    (inExtent ? "" : "is-dimmed")
                                  }
                                  aria-label={suggestion.country}
                                  style={this.styleTag()}
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
              label="open google search"
              icon="google"
              onClick={this.handleOpenGSearch.bind(this)}
            />
          </div>
          <div>
            <Button
              inverted
              label="open google maps"
              icon="map"
              onClick={this.handleOpenGMaps.bind(this)}
            />
          </div>
          <div>
            <Button
              inverted
              label="open peripleo"
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
                label="display all records on map"
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
                label="clusters )"
                classes="is-small"
                checked={store.opts.mapClusters}
                onChange={store.toggleMapClusters.bind(store)}
              />
            </div>
            <div className="checkboxes-line">
              <Checkbox
                id="switch-focus-onchange"
                label="focus map on record change ("
                classes="is-small"
                checked={store.opts.focusOnRecordChange}
                onChange={store.toggleFocusChange.bind(store)}
              />
              <div style={{}} className="field">
                <div
                  style={{ display: "inline-block", fontSize: 9 }}
                  className="select"
                >
                  <select
                    value={store.opts.focusZoom}
                    style={{ borderWidth: 2, margin: "0px 3px" }}
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
                <label> zoom level )</label>
              </div>
            </div>
            <div className="button-row">
              <Button
                inverted
                label="columns"
                icon="columns"
                onClick={this.handleGlobalSettingOpen.bind(this, "columns")}
              />
              <Button
                inverted
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
