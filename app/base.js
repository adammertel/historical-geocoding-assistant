var Base =  {
  doRequestSync (url) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);  // `false` makes the request synchronous
    xhr.send(null);

    if (xhr.status === 200) {
      return xhr.responseText;
    } else {
      return {};
    }
  },

  requestConfigFile (configName, sync, next = false) {
    const configPath = './' + configName;
    if (sync) {
      return JSON.parse(this.doRequestSync(configPath));
    } else {
      this.doRequest (configPath, (response) => {next(JSON.parse(response));});
    }
  },

};

module.exports = Base;