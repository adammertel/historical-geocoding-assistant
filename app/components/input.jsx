import React from 'react';

export default class Input extends React.Component {
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
        <div className="control">
          <input 
            style={this.style()}
            className="input is-primary" 
            type="text" 
            value={this.props.value} 
            onChange={this.props.onChange}
          />
        </div>
      </div>
    )
  }
}