import React, { Component } from "react";
import { Container, Row, Col, Button, Form, FormGroup, Label, Input, Alert } from "reactstrap";

class Login extends Component {
	constructor(props) {
		super(props);
		this.state = {
			error: false,
			dataForm: {
				email: "",
				password: ""
			}
		};
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	handleSubmit = (event) => {
		event.preventDefault();
		const data = new FormData(event.target);
		fetch(process.env.REACT_APP_URL_API_SERVER + "/login.php", {
			method: "POST",
			body: data
		})
		.then(res => {
			if(res.ok && res.status === 200) {
				res.json().then((data) => {
					if(data.err) {
						this.setState({
							error: true
						});
					} else {
						localStorage.setItem("WebTurId", data.id);
						localStorage.setItem("WebTurNombre", data.nombre);
						localStorage.setItem("WebTurToken", data.token);
						this.props.ok();
					}
				});
			}
		});
	}

	handleChange = (event) => {
		const target = event.target;
		const value = target.type === "checkbox" ? target.checked : target.value;
		const name = target.name;
		this.setState({
			dataForm: {
				...this.state.dataForm,
				[name]: value
			}
		});
	}

	render() {
		const err = this.state.error;
		return (
			<div className="Login">
				<Container>
					<Row className="justify-content-center mb-4 bg-info rounded">
						<Col xs="12" md="4">
							<h1 className="display-5 text-center text-white">Turismo SL</h1>
						</Col>
					</Row>
					<Row className="justify-content-center mb-4">
						<Col xs="12" md="4">
							<Form onSubmit={this.handleSubmit} className="shadow p-3 pb-5 mb-5 bg-white rounded" autoComplete="off">
								<FormGroup>
									<Label htmlFor="email">Email</Label>
									<Input
										type="email"
										className="form-control"
										id="email"
										name="email"
										placeholder="Dirección de correo electrónico"
										value={this.state.dataForm.email}
										onChange={this.handleChange}
									/>
								</FormGroup>
								<FormGroup>
									<Label htmlFor="password">Contraseña</Label>
									<Input
										type="password"
										className="form-control"
										id="password"
										name="password"
										placeholder="Contraseña"
										value={this.state.dataForm.password}
										onChange={this.handleChange}
									/>
								</FormGroup>
								<Button color="primary" type="submit" className="float-right">Enviar</Button>
							</Form>
						</Col>
					</Row>
					{
						err ?
						<Row className="justify-content-center">
							<Col xs="12" md="4">
								<Alert color="warning">
									Dirección de correo electrónico o contraseña no válido/s.
								</Alert>
							</Col>
						</Row>
						:
						""
					}
				</Container>
			</div>
		);
	}
}

export default Login;
