import React from 'react';

export default class Message extends React.Component {
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
      <article className="message">
        <div className={'message-header' + this.props.classes}>
          <p>{this.props.header}</p>
          <button className="delete" ariaLabel="delete"></button>
        </div>
        <div className="message-body">
          {
            this.props.children
          }
        </div>
      </article>
    )
  }
}