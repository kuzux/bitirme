import React, { Element } from 'react';
import { connect } from 'react-redux';

import Chart from './Chart';

const Home = (props) => {
    return 
        <div>
            <p>Home</p>
            <Chart data={props.data} />
        </div>;
}

const mapStateToProps = (state) => {
    return {};
};

const mapDispatchToProps = (dispatch) => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);