import React, { Component } from "react";
import { Container, Row, Col, Button, Form, FormGroup, Label, Input, Breadcrumb, BreadcrumbItem } from "reactstrap";
import Loading from "../utils/loading";
import ModalMsg from "../utils/ModalMsg";

class Nuevo extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			modal: {
				msg: "",
				redirect: false,
                open: false,
                onlyOk: true
			},
			departamentos: [{id: 0, nombre: "Cargando..."}],
			ciudades: [{id: 0, nombre: "Cargando..."}],
			tipos: [{id: 0, nombre: "Cargando..."}],
			guia: {
				iddepartamento: 0,
				idciudad: 0,
				idtipo: 0,
				legajo: "",
				nombre: ""
			},
			idNew: 0
		};
		this.handleDepartamentoChange = this.handleDepartamentoChange.bind(this);
		this.handleMsgOk = this.handleMsgOk.bind(this);
	}

	handleDepartamentoChange = (event) => {
		const value = event.target.value;
		this.setState(prevState => ({
			guia: {
				...prevState.guia,
				iddepartamento: value
			}
		}), () => {
			this.getCiudades(value)
			.then(() => {
				const idCity = this.state.ciudades[0].id;
				this.setState(prevState => ({
					guia: {
						...prevState.guia,
						idciudad: idCity
					}
				}));
			})
		});
	}

	handleChange = (event) => {
		const target = event.target;
		const name = target.name;
		const value = target.type === "checkbox" ? target.checked : target.value;
		this.setState({
			guia: {
				...this.state.guia,
				[name]: value
			}
		});
	}

	handleMsgOk = () => {
		if(this.state.modal.redirect) {
			this.props.history.push(`/guia/${this.state.idNew}`);
		} else {
			this.setState({
				modal: {
					...this.state.modal,
					open: false
				}
			});
		}
	}

	handleSubmit = (event) => {
		event.preventDefault();
		console.log(`${process.env.REACT_APP_URL_API_SERVER_2}/guia`);
		fetch(`${process.env.REACT_APP_URL_API_SERVER_2}/guia`, {
			method: "POST",
			headers: {
				"Authorization": localStorage.getItem("WebTurToken"),
				"Content-Type": "application/json"
			},
			body: JSON.stringify({...this.state.guia})
		})
		.then(res => {
			if(res.ok && res.status === 201) {
				res.json().then((data) => {
					this.setState({
						idNew: data.insertId,
						modal: {
							...this.state.modal,
							redirect: true,
							msg: "Los datos se ingresaron correctamente!",
							open: true
						}
					});

					if(data.err === true) {
						let errores = "";
						data.errMsg.forEach(element => {
							errores += `${element} - `;
						});
						this.setState({
							modal: {
								...this.state.modal,
								msg: `Ocurrió un error al ingresar los datos: ${errores}`,
								open: true
							}
						});
					}
				});
			} else { //409 Conflicto
				res.json().then((data) => {
					if(data.err === true) {
						if(data.errMsgs) { //Errores de verificación de datos
							let errores = data.errMsgs.map((v, index) => {
								return(<p key={`Err-${index}`}>{v}</p>);
							});
							this.setState({
								modal: {
									...this.state.modal,
									msg: errores,
									open: true
								}
							});
						} else {
							this.setState({ //Error de legajo u otros
								modal: {
									...this.state.modal,
									msg: data.errMsg,
									open: true
								}
							});
						}
					}
				});
			}
		}).catch(error => {
			console.error(error);
		});
	}

	getCiudades = (idDepartamento) => {
		return fetch(`${process.env.REACT_APP_URL_API_SERVER_2}/ciudades/departamento/${idDepartamento}`)
		.then(res => {
			if(res.ok && res.status === 200) {
				res.json().then((data) => {
					this.setState({
						ciudades: data.data.registros
					}, () => {
						this.setState({
							guia: {
								...this.state.guia,
								idciudad: this.state.ciudades[0].id
							}
						});
					});
				});
			}
		});
	}

	componentDidMount() {
		//Carga de Tipos
		const Tipos = new Promise((resolve, reject) => {
			fetch(`${process.env.REACT_APP_URL_API_SERVER_2}/tipos`, {
                method: "GET",
                headers: {
                    "Authorization": localStorage.getItem("WebTurToken")
                }
            })
			.then(res => {
				if(res.ok && res.status === 200) {
					res.json().then((data) => {
						this.setState({
							tipos: data.data.registros
						}, () => {
							this.setState({
								guia: {
									...this.state.guia,
									idtipo: this.state.tipos[0].id
								}
							}, () => {
								resolve(true);
							});
						});
					});
				}
			});
		});
		//Carga de Departamentos
		const Departamentos = new Promise((resolve, reject) => {
			fetch(`${process.env.REACT_APP_URL_API_SERVER_2}/departamentos`, {
                method: "GET",
                headers: {
                    "Authorization": localStorage.getItem("WebTurToken")
                }
            })
			.then(res => {
				if(res.ok && res.status === 200) {
					res.json().then((data) => {
						this.setState({
							departamentos: data.data.registros
						}, () => {
							this.getCiudades(this.state.departamentos[0].id);
							this.setState({
								guia: {
									...this.state.guia,
									iddepartamento: this.state.departamentos[0].id
								}
							}, () => {
								resolve(true);
							});
						});
					});
				}
			});
		});
		Promise.all([Tipos, Departamentos]).then(values => { 
			this.setState({
				loading: false
			});
		});
	}

	render() {
		const loading = this.state.loading;
		const departamentos = this.state.departamentos.map((d) => {
			return (
				<option key={"d-" + d.id} value={d.id}>{d.nombre}</option>
			);
		});
		const ciudades = this.state.ciudades.map((c) => {
			return (
				<option key={"c-" + c.id} value={c.id}>{c.nombre}</option>
			);
		});
		const tipos = this.state.tipos.map((t) => {
			return (
				<option key={"t-" + t.id} value={t.id}>{t.descripcion}</option>
			);
		});
		return (
			<div className="Nuevo">
				{
					loading ?
					<Loading />
					:
					<Container>
						<Row className="justify-content-center">
							<Col style={{paddingLeft: "0"}} className="col-xs-12 col-md-1">
								<Button style={{marginLeft: "0"}} color="primary" className="mr-2 btn-lg" onClick={(e) => this.props.history.push("/")}><i className="fas fa-arrow-circle-left"></i></Button>
								
							</Col>
							<Col className="col-xs-12 col-md-3">
								<Breadcrumb>
									<BreadcrumbItem active>Formulario - Nuevo Registro</BreadcrumbItem>
								</Breadcrumb>
							</Col>
						</Row>
						<Row className="justify-content-center">
							<Col className="col col-xs-12 col-md-4 mb-4 rounded shadow bg-white pt-4">
								<Form onSubmit={this.handleSubmit} className="pb-5" autoComplete="off">
									<FormGroup>
										<Label htmlFor="departamento">Departamento</Label>
										<Input
											type="select"
											className="form-control"
											id="departamento"
											name="departamento"
											value={this.state.guia.iddepartamento}
											onChange={this.handleDepartamentoChange}
										>
											{departamentos}
										</Input>
									</FormGroup>
									<FormGroup>
										<Label htmlFor="idciudad">Ciudad</Label>
										<Input
											type="select"
											className="form-control"
											id="idciudad"
											name="idciudad"
											value={this.state.guia.idciudad}
											onChange={this.handleChange}
										>
											{ciudades}
										</Input>
									</FormGroup>
									<FormGroup>
										<Label htmlFor="idtipo">Tipo</Label>
										<Input
											type="select"
											className="form-control"
											id="idtipo"
											name="idtipo"
											value={this.state.guia.idtipo}
											onChange={this.handleChange}
										>
											{tipos}
										</Input>
									</FormGroup>
									<FormGroup>
										<Label htmlFor="legajo">Legajo</Label>
										<Input
											type="text"
											className="form-control"
											id="legajo"
											name="legajo"
											placeholder=""
											value={this.state.guia.legajo}
											onChange={this.handleChange}
											maxLength="5"
										/>
									</FormGroup>
									<FormGroup>
										<Label htmlFor="nombre">Nombre</Label>
										<Input
											type="text"
											className="form-control"
											id="nombre"
											name="nombre"
											placeholder=""
											value={this.state.guia.nombre}
											onChange={this.handleChange}
											maxLength="100"
										/>
									</FormGroup>
									<Button color="primary" type="submit" className="float-right">Guardar y Continuar</Button>
								</Form>
							</Col>
						</Row>
						<ModalMsg open={this.state.modal.open} titulo="Nueva Guía" msg={this.state.modal.msg} onlyOk={this.state.modal.onlyOk} handleAceptar={this.handleMsgOk} />
					</Container>
				}
			</div>
		);
	}
}

export default Nuevo;
