import React, { Component } from "react";
//import logo from './logo.svg';
//import './App.css';
import Login from "./Login";
import Web from "./Web";


class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			auth: false
		};
		this.handleOkauth = this.handleOkauth.bind(this);
	}

	componentDidMount() {
		if("WebTurToken" in localStorage) {
			if(localStorage.getItem("WebTurToken").length > 0) {
				this.setState({auth: true});
			}
		}
	}
  
	componentWillUnmount() {
		//localStorage.clear();
  	}

	handleOkauth = () => {
		//localStorage.setItem("WebTurToken", "Asdad");
		this.setState({auth: true});
	}

	render() {
		const auth = this.state.auth;
		return (
			<div className="App">
				{
					auth ?
					<Web />
					:
					<Login ok={this.handleOkauth} />
				}
			</div>
		);
	}
}

export default App;
