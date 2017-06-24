# Beste Lagen map application


### The build

The build consists of 5 files and 1 folder that are necessary to run the application: 
 - **bundle.js** - all the js code
 - **bundle.js.map** - auxiliary file that helps bundle.js to find the right piece of code
 - **index.html** - simple html file
 - **config.json** - json formated file with all the possible value that could be changed outside of the code. At this point, there are some rules to define colors, positioning, path to external images or map-base-layers (see section config.json)
 - **main.css** - all the css rules in one file (some styling (mainly colors and container positioning) is defined within config and then in js code)
 - **assets folder** - all the external images (could be used for other external files in the future)


### Config.json

Config will consist of all relevant data and values that could be assigned from the outside of the code. At this point, config.json contains this types of values:
 - **colors** - hexadecimal codes for chosen colors that are used across the application
 - **containers positioning** - the most important sizes and positions to define containers
 - **icons** - path to *"assets"* folder where the particular icon could be found and their display sizes
 - **base layers** - source url, naming and further values needed to set base map layers 
