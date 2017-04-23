import React from 'react';

import { connect } from 'react-redux';
import { Navbar, Nav, NavItem } from 'react-bootstrap';

const Header = (props) => {
    return (
        <Navbar>
            <Navbar.Header>
                <Navbar.Brand>
                   <a href="#">A Multivariate Time Data Visualization Tool</a>
                </Navbar.Brand>
            </Navbar.Header>
            <Nav>
                <NavItem eventKey={1} href="/">Home</NavItem>
            </Nav>
        </Navbar>
    );
};

const mapStateToProps = (state: Map<any, any>): {} => {
    return {};
};

const mapDispatchToProps = (dispatch: any): {} => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);

