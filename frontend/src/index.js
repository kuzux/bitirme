import React from 'react';
import ReactDOM from 'react-dom';

import { createStore } from 'redux';
import { Provider } from 'react-redux';

import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import App from './App';
import './index.css';

const store = createStore(function(p, e){return p;}, {});

ReactDOM.render(
  <Provider store={store}>
    <Router history={browserHistory}>
        <Route path="/" component={App} />
    </Router>
  </Provider>,
  document.getElementById('root')
);
