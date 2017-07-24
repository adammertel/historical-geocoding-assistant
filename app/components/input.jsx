import React from 'react';

export default class Input extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    
    return (
      <div className="field">
        <div className="control">
          <input 
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