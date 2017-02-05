import React, { Element } from 'react';
import { connect } from 'react-redux';

const Home = (props) => {
    return <div>Home</div>;
}

const mapStateToProps = (state) => {
    return {};
};

const mapDispatchToProps = (dispatch) => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);