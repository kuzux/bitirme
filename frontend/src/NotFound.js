import React from 'react';
import { connect } from 'react-redux';

const NotFound = (props) => {
    return (<div>Not Found</div>);
};

const mapStateToProps = (state) => {
    return {};
};

const mapDispatchToProps = (dispatch) => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(NotFound);
