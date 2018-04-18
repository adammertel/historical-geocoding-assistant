# Historical Geocoding Assistant

Try it [here](http://hde.geogr.muni.cz/hga/)

Tool for assisted geocoding of historical datasets (something between a manual table editing and automated geocoding script)

![alt text](https://github.com/adammertel/historical-geocoder-assistant/blob/master/app/assets/icon.png 'Historical Geocoding Assistant Logo')

## Description

At this moment, there are several other tools and methods that could help to geocode a historical dataset. But none of them was sufficient for our projects so we came with the idea of creating an own one. Advantages of our concept are:

* integration with a live google drive spreadsheet table
* possibility to switch between coded locations within map or within a select box
* integration of search systems - geonames, wikipedia, google maps...
* implementation of spatial uncertainty levels
* a possibility to set a spatial extent relevant for a project
* overlay layers support (modern countries, regions...)
* multiple base layers support (satellite, osm, historical base layers...)
* ...

![alt text](https://github.com/adammertel/historical-geocoder-assistant/blob/master/screen.png 'Historical Geocoding Assistant Screen')

## Technologies

A client side web application, built with javascript (webpack, leaflet...) that could access and edit a google drive spreadsheet table.

## Dataset table

It is needed to be signed into google drive and type the id of the table at the begginning. The table should consist of a column for name, place name, x and y coordinates and a column that specifies the uncertainty level. Please, see the [manual](https://github.com/adammertel/historical-geocoder-assistant/tree/master/manual)

## Manual

[manual](https://github.com/adammertel/historical-geocoder-assistant/tree/master/manual)
