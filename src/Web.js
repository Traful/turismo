import React, { Component } from "react";
//import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { HashRouter as Router, Route, Link } from "react-router-dom";
import Menu from "./utils/Menu";
import Home from "./components/Home";
import About from "./components/About";
import Perfil from "./components/Perfil";
import GuiaUpdate from "./components/GuiaUpdate";
import Nuevo from "./components/Nuevo";
import Filtro from "./components/Filtro"

class Web extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isOpen: false,
			body: document.querySelector("body"),
            menuItems: document.querySelectorAll('.nav__list-item')
		};
		this.toggle = this.toggle.bind(this);
		this.handleLogOut = this.handleLogOut.bind(this);
		this.handleMenuClick = this.handleMenuClick.bind(this);
	}

	handleMenuClick = () => {
        if(this.state.body.classList.contains("nav-active")) {
            this.state.body.classList.remove("nav-active");
        } else {
            this.state.body.classList.add("nav-active");
        }
    }

	toggle = () => {
        this.setState({
          isOpen: !this.state.isOpen
        });
    }

    handleLogOut = () => {
		localStorage.clear();
		window.location.replace(`${process.env.REACT_APP_URL_HOST}/${process.env.REACT_APP_BASENAME}`);
	}
	
	/*
	<Link to="/about" className="nav-link" onClick={this.handleMenuClick}>Acerca de...</Link>
	<Link to="/perfil" className="nav-link" onClick={this.handleMenuClick}>Perfil</Link>
	*/

	render() {
		return (
			<div className="Web">
				<Router basename={`/${process.env.REACT_APP_BASENAME}`} history={Router.hashHistory}>
					<div>
						<Menu>
							<Link to="/" className="nav-link" onClick={this.handleMenuClick}>Home</Link>
							<Link to="/filtro" className="nav-link" onClick={this.handleMenuClick}>Consultas</Link>
							
							<a onClick={this.handleLogOut}>Logout</a>
						</Menu>
						<Route exact path="/" component={Home} />
						<Route exact path="/filtro" component={Filtro} />
						<Route exact path="/about" component={About} />
						<Route exact path="/perfil" component={Perfil} />
						<Route exact path="/guia/:id" component={GuiaUpdate} />
						<Route exact path="/nuevo" component={Nuevo} />
					</div>
				</Router>
			</div>
		);
	}
}

//<Route path="/mycomponent" render={(props) => <MyComponent {...props} myProp="myVal" />} />
export default Web;
