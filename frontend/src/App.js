import React from 'react';
import './App.css';

import { connect } from 'react-redux';

import { Grid } from 'react-bootstrap';

import Header from './Header';

const App = (props) => {
  return (
    <Grid>
      <div className="App">
        <Header />
        {props.children}
      </div>
    </Grid>
  );
};

const mapStateToProps = (state: Map<any, any>): {} => {
    return {};
};

const mapDispatchToProps = (dispatch: any): {} => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
