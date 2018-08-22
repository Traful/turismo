import React, { Component } from "react";
import "./Menu.css";
/*
const app = (() => {
	let body;
	let menu;
	let menuItems;
	
	const init = () => {
		body = document.querySelector('body');
		menu = document.querySelector('.menu-icon');
		menuItems = document.querySelectorAll('.nav__list-item');

		applyListeners();
	}
	
	const applyListeners = () => {
		menu.addEventListener('click', () => toggleClass(body, 'nav-active'));
	}
	
	const toggleClass = (element, stringClass) => {
		if(element.classList.contains(stringClass))
			element.classList.remove(stringClass);
		else
			element.classList.add(stringClass);
	}
	
	init();
})();
*/


class Menu extends Component {
	constructor(props) {
        super(props);
        this.state = {
            body: document.querySelector("body"),
            menuItems: document.querySelectorAll('.nav__list-item')
        };
        this.handleMenuClick = this.handleMenuClick.bind(this);
    }

    handleMenuClick = () => {
        if(this.state.body.classList.contains("nav-active")) {
            this.state.body.classList.remove("nav-active");
        } else {
            this.state.body.classList.add("nav-active");
        }
    }

    componentDidMount() {
        this.setState({
            open: this.props.open,
            msg: this.props.msg,
            onlyOk: this.props.onlyOk
        });
    }

    render() {
        return(
            <div className="Menu">
                <div className="menu-icon" onClick={this.handleMenuClick}>
                    <span className="menu-icon__line menu-icon__line-left"></span>
                    <span className="menu-icon__line"></span>
                    <span className="menu-icon__line menu-icon__line-right"></span>
                </div>

                <div className="nav-menu">
                    <div className="nav-menu__content">
                        {this.props.children}
                    </div>
                </div>
                <div className="container-flud">
                    <div className="row mr-0">
                        <div className="col">
                            <div className="pt-2 pl-2">
                            <   img src={`${process.env.REACT_APP_URL_API_SERVER_2}/imgs/LogoSisTur2.svg`} alt="Logo" width="172px" height="47px" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Menu;