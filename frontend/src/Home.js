import React from 'react';
import { connect } from 'react-redux';

import Chart from './Chart';

const Home = (props) => {
    return(
      <div> 
        <Chart data={props.data} /> 
      </div>
      );
}

const mapStateToProps = (state) => {
    return {};
};

const mapDispatchToProps = (dispatch) => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);