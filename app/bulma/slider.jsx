import React from 'react';

export default class Slider extends React.Component {
  constructor(props) {
    super(props);
  }

  style() {
    return {
      fontSize: 11
    };
  }

  render() {
    return (
      <input
        type="range"
        style={this.style()}
        className={'slider ' + this.props.classes}
        step={this.props.step}
        min={this.props.min}
        max={this.props.max}
        value={this.props.value}
        onChange={this.props.onChange}
      />
    );
  }
}
