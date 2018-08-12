import React, { Component } from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import {
	Collapse,
	Navbar,
	NavbarToggler,
	NavbarBrand,
	Nav,
	NavItem,
	UncontrolledDropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem } from "reactstrap";
import Home from "./components/Home";
import About from "./components/About";
import Perfil from "./components/Perfil";
import GuiaUpdate from "./components/GuiaUpdate";

class Web extends Component {
	constructor(props) {
		super(props);
		this.state = {
            isOpen: false
		};
		this.toggle = this.toggle.bind(this);
        this.handleLogOut = this.handleLogOut.bind(this);
	}

	toggle = () => {
        this.setState({
          isOpen: !this.state.isOpen
        });
    }

    handleLogOut = () => {
		localStorage.clear();
		window.location.replace(process.env.REACT_APP_URL_HOST);
    }

	render() {
		return (
			<div className="Web">
				<Router>
					<div>
						<Navbar color="" light expand="md" className="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
							<NavbarBrand href="/">Turismo</NavbarBrand>
							<NavbarToggler onClick={this.toggle} />
							<Collapse isOpen={this.state.isOpen} navbar>
								<Nav className="ml-auto" navbar>
									<NavItem>
										<Link to="/" className="nav-link">Home</Link>
									</NavItem>
									<NavItem>
										<Link to="/about" className="nav-link">Acerca de...</Link>
									</NavItem>
									<UncontrolledDropdown nav inNavbar>
										<DropdownToggle nav caret>
												Usuario
										</DropdownToggle>
										<DropdownMenu right>
											<DropdownItem>
											<Link to="/perfil" className="nav-link">Perfil</Link>
											</DropdownItem>
											<DropdownItem divider />
											<DropdownItem>
												<a onClick={this.handleLogOut}>Logout</a>
											</DropdownItem>
										</DropdownMenu>
									</UncontrolledDropdown>
								</Nav>
							</Collapse>
						</Navbar>
						<Route exact path="/" component={Home} />
						<Route exact path="/about" component={About} />
						<Route exact path="/perfil" component={Perfil} />
						<Route exact path="/guia/:id" component={GuiaUpdate} />
					</div>
				</Router>
			</div>
		);
	}
}

//<Route path="/mycomponent" render={(props) => <MyComponent {...props} myProp="myVal" />} />
export default Web;
