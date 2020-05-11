import React, { Component } from 'react';
//import logo from './logo.png';
import './App.css';
import ClCamera from './components/ClCamera';
import Notifier from './components/Notifier';
import { Helmet } from 'react-helmet';

class App extends Component {
  constructor() {
    super();
    this.state = {
      offline: false
    }
  }
  componentDidMount() {
    window.addEventListener('online', () => {
      this.setState({ offline: false });
    });

    window.addEventListener('offline', () => {
      this.setState({ offline: true });
    });
  }

  componentDidUpdate() {
    let offlineStatus = !navigator.onLine;
    if (this.state.offline !== offlineStatus) {
      this.setState({ offline: offlineStatus });
    }
  }

  render() {
    return (
      <div className="App">
        <Helmet>
          <meta charSet="utf-8"/>
          <title>CAM Screenshot App</title>
          <meta property="og:title" content="CAM Screenshot App" />
          <meta property="og:description" content="Take a picture and it will be uploaded to your library" />
        </Helmet>
        <Notifier offline={this.state.offline} />
        <header className="App-header">
        </header>
        <ClCamera offline={this.state.offline}></ClCamera>
      </div>
    );
  }
}

export default App;
