import React from 'react';

export default class Checkbox extends React.Component {
  constructor(props) {
    super(props);
  }

  style () {
    return {
      fontSize: 11
    }
  }

  render() {
    return (
      <div className="field">
        <input 
          className="is-checkbox" 
          id={this.props.id} 
          type="checkbox" 
          name={this.props.id} 
          checked={this.props.checked} 
          onChange={this.props.onChange} 
        />
        <label htmlFor={this.props.id}>{this.props.label}</label>
      </div>
    )
  }
}