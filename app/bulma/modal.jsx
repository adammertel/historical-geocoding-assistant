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
    const classes = this.props.active ?
      ('modal is-active ' + this.props.classes) : 
      ('modal ' + this.props.classes);

    return (
      <div 
        className={classes} 
        style={Object.assign(
          this.style(), this.props.style)
        }
      >
        <div className="modal-background" />
        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title">{this.props.header}</p>
            {
              this.props.closeIcon ? (
                <button className="delete" ariaLabel="close"></button>
              ) : null
            }
          </header>
          <section className="modal-card-body">
          {
            this.props.body
          }
          </section>
          <footer className="modal-card-foot">
          {
            this.props.footer
          }
          </footer>
        </div>
      </div>
    )
  }
}