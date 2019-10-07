# HISTORICAL GEOCODING ASSISTANT 1.4.0 – MANUAL

## 1 Description

Historical Geocoding Assistant (HGA) is a tool to assist the geocoding of historical datasets.

## 2 Table input

The HGA application works with tables stored in Google Drive in spreadsheet form. A working example of such a table is located [here](https://docs.google.com/spreadsheets/d/1FaW23x-ZT3pmdmv77eKPJxsfGhoB1urwfvPffN_4keU).

### 2.1 Localisation columns

The table should contain four reserved columns (location name, x-coordinate, y-coordinate, and certainty level; column names are suggested and not mandatory, see **6.5**), two optional reserved columns (localisation note and editor), and any number of further columns as required by the relevant project. Out of the six reserved columns, typically only the **Location name** column is filled before the beginning of the geocoding process.

#### 2.1.1 Place name

Location name of the record - this value is used for all search engines (see **6.3** and **6.4**).

#### 2.1.3 X coordinate

Longitude coordinate.

#### 2.1.4 Y coordinate

Latitude coordinate.

#### 2.1.5 Certainty

Level of certainty assigned by the editor. By default, the level of certainty is classified as follows:

- 1 - coordinates are precise (at the level of granularity chosen for the given dataset);
- 2 - coordinates are approximate (e.g., the centroid of a region was used, the coordinates of a known settlement nearby were used instead of those of a place which could not be localized, etc.);
- 3 - coordinates are uncertain or ambiguous (mostly in cases where there are more candidate places and the editor chooses the most probable one);
- 4 - localisation was not successful.

#### 2.1.6 Localisation note

Optional note by the editor concerning the localisation process (justification of a decision, reference to sources used, discussion of any uncertainties, etc.).

#### 2.1.6 Editor

If a column named “Editor” is defined, the email address of the Google account of the last editor will be stored here. This serves to identify the last editors of all records.

## 3 Table Prompt

When the application is loaded, a table prompt window is displayed asking for the table URL, see **2**

<img src="./imgs/welcome.png" alt="prompt image" height="300" />

## 4 Application layout

<img src="./imgs/layout.png" alt="app layout image" height="400" />

The application layout consists of:

- map
- right panel
- map control panel

## 5 Map

Most of the screen space is occupied by the map. Small map buttons are located in the top-left corner:

- zoom buttons;
- a measurement tool, which allows the measuring of distances.

It is possible to interact with the map (zooming, panning) and indirectly manipulate with the layers (see [7](#7-map-control)). The map shows four types of colored pins - current location, all other locations, GeoNames suggestions, and Wikipedia suggestions (see **6.5**).
When the user clicks on the map, the coordinates are saved to this record.

## 6 Panel

The panel covers the right part of the screen and is used to select and edit record data and assign global settings. The panel consists of various sections as follows.

### 6.1 Selection

The record selection menu is located under the application logo and has the following subsections:

- the number of all records and the position of the selected one;
- buttons to select the record to edit or to move to the next (or previous) record;
- restore (cancels the edits of the particular record) and save (stores edits to the table) buttons.

<img src="./imgs/records.png" alt="records image" height="200" />

## 6.2 Data

A section to handle and edit values of the record. There are two subsections:
The localisation section, which allows the handling of the "localisation columns" described in **2.1**; beneath are 4 buttons:

- highlight - highlight the current record’s position on the map (without panning);
- focus - pan and zoom to the position of the record;
- revert - use original values as stored in the table;
- remove - remove the current coordinates.

<img src="./imgs/localisation.png" alt="localisation image" height="200" />

The subsection “Record data”, which allows values in all columns of the input table to be viewed and edited.

<img src="./imgs/data.png" alt="data image" height="250" />

## 6.3 Geocoding suggestions

Suggestions are made based on the value of the **place name** column (see **2.1.1**). At this moment, four geocoding services are implemented:

- [GeoNames](http://www.geonames.org/);
- [Wikipedia](wikipedia.org).
- [Pleiades](pleiades.stoa.org);
- [Getty Thesaurus of Geographic Names](https://www.getty.edu/research/tools/vocabularies/tgn/index.html/);
- [The China Historical Geographic Information System](http://chgis.fas.harvard.edu/);

Each suggestion has a set of buttons to interact with:

- highlight suggested location on map
- pan the map to the suggested location
- save coordinates of the suggested location
- open external link relevant to the suggested location (just in some cases)

<img src="./imgs/geocoding.png" alt="geocoding image" height="400" />

## 6.4 Auxiliary search engines

In cases when the suggestions do not provide a relevant answer, the user can try an auxiliary search engine:

- Google search
- Google maps search
- [Peripleo](http://peripleo.pelagios.org/) search engine

Clicking on the auxiliary search icon will open a new browser tab with the url of the value of the **place name** column.

<img src="./imgs/search.png" alt="search image" height="100" />

## 6.5 Settings

The setting section is used to set additional options and rules:

- display all records on map - will show all previously geocoded places on the map (as black pins);
- clusters - will aggregate pins in clusters for clearer arrangement in cases where there are many pins close to each other;
- focus map on record change - sets whether the map should be refocused when a new record is selected;
- zoom level - sets the zoom upon refocusing;
- columns - opens a menu with the possibility to reassign column names for reserved **place name** columns (see **2.1**);
- geo extent - opens up a menu to set a geographical bounding box that limits the area taken into account for geocoding suggestions: a warning is displayed if the assigned coordinates fall outside this box.

<img src="./imgs/settings.png" alt="settings image" height="100" />

<img src="./imgs/columns.png" alt="columns image" height="150" />

## 7 Map control

The map control menu is located in the bottom-left part of the map and has two subsections:

- base layers - presents two overlayed base maps and the opacity of the top one
- overlay layers - presents auxiliary overlay layers (in various formats - GeoJSON, WMS...), their order and opacity

<img src="./imgs/mapcontrol.png" alt="mapcontrol image" height="400" />

## 8 config files

When deploying your own version of HGA, you can use the included config files (json formatted) to customise the content and rules of the application. There are 4 config files:

- config.json - various areas of customisation such as colors, default options...
- config_api.json - Google api ID and key (note that this file has to be created; it is not in the repository!)
  `{ "apiKey": YOUR GOOGLE API KEY, "clientId": YOUR CLIENT ID }`
- basemaps.json - a list of base layers (wms or tile service)
- mapoverlays.json - other auxiliary layers in geojson or wms format (modern countries, etc.).
