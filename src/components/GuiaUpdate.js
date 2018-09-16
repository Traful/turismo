import React, { Component } from "react";
import Loading from "../utils/loading";
import { Container, Row, Col, Alert, Button, Form, FormGroup, Label, Input, Breadcrumb, BreadcrumbItem, TabContent, TabPane, Nav, NavItem, NavLink } from "reactstrap";
import classnames from "classnames";

import GoogleMapReact from "google-map-react";
import Servicios from "./subcomponentes/Servicios";
import Galeria from "./subcomponentes/Galeria";
import Redes from "./subcomponentes/Redes";
import Tarifas from "./subcomponentes/Tarifas";
import ModalMsg from "../utils/ModalMsg";


const Alerta = (props) => {
	return (
		<Alert color="danger">
        	No se encontro el registro!
      	</Alert>
	);
}

const Marca = (props) => {
	return(
		<img src={`${process.env.REACT_APP_URL_API_SERVER_2}/imgs/googlemark.png`} style={{width: "32px", height: "32px"}} alt="I" />
	);
}

const format_date = (fecha) => {
	if(fecha) {
		// YYYY-mm-dd
		let farray = fecha.split("-");
		// dd/mm/YYYY
		return `${farray[2]}/${farray[1]}/${farray[0]}`;
	} else {
		return null;
	}
}

class GuiaUpdate extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			error: false,
			modal: {
				msg: "",
				extras: "",
                open: false,
                onlyOk: true
            },
			id: 0,
			tipos: [{id: 0, descripcion: "Loading..."}],
			guia: {
				galeria: [] //wtf??
			},
			departamentos: [],
			ciudades: [],
			tiposcategorias: [{id: 0, descripcion: "Loading..."}],
			tiposcategoriasselect: 0,
			valorestipocat: [{valor: 0, descripcion: "Loading..."}],
			valorestipocatselect: 0
		};
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleDepartamentoChange = this.handleDepartamentoChange.bind(this);
		this.handleTipoCategorias = this.handleTipoCategorias.bind(this);
		this.handleValorTipoCatSelect = this.handleValorTipoCatSelect.bind(this);
		this.findValorizacion = this.findValorizacion.bind(this);
		this.getCiudades = this.getCiudades.bind(this);
		this.readURLLogo = this.readURLLogo.bind(this);
		this.handleMsgOk = this.handleMsgOk.bind(this);
		this.toggleTabs = this.toggleTabs.bind(this);
		this.subirFormulario = this.subirFormulario.bind(this);
	}

	/*
	this.handleKeyUp = this.handleKeyUp.bind(this);
	<form onKeyUp={this.handleKeyUp}>
	handleKeyUp(event) {
		if (event.keyCode == 13) return this.sendData()
	}
	*/

	toggleTabs(tab) {
		if (this.state.activeTab !== tab) {
			this.setState({
				activeTab: tab
			});
		}
	}

	handleMsgOk = () => {
		this.setState({
			modal: {
				...this.state.modal,
				open: false
			}
		});
	}

	findValorizacion = (idTipoCategoriasSelect, idValorTipCatGuia) => {
		fetch(process.env.REACT_APP_URL_API_SERVER_2 + "/valorizaciones/tipo/" + idTipoCategoriasSelect)
		.then(res => {
			if(res.ok && res.status === 200) {
				res.json().then((data) => {
					this.setState({
						valorestipocat: data.data.registros
					}, () => {
						if(idValorTipCatGuia === 0) {
							this.setState({valorestipocatselect: this.state.valorestipocat[0].id});
						} else {
							this.setState({valorestipocatselect: idValorTipCatGuia});
						}
					});
				});
			}
		});
	}

	handleValorTipoCatSelect = (event) => {
		this.setState({
			guia: {
				...this.state.guia,
				idvalortipcat: event.target.value
			},
			valorestipocatselect: event.target.value
		});
	}

	handleTipoCategorias = (event) => {
		this.setState({
			guia: {
				...this.state.guia,
				idtipocategorias: event.target.value
			},
			tiposcategoriasselect: event.target.value
		});
		this.findValorizacion(event.target.value, 0);
	}

	getCiudades = (idDepartamento) => {
		return fetch(process.env.REACT_APP_URL_API_SERVER_2 + "/ciudades/departamento/" + idDepartamento)
		.then(res => {
			if(res.ok && res.status === 200) {
				res.json().then((data) => {
					this.setState({
						ciudades: data.data.registros
					});
				});
			}
		});
	}

	readURLLogo = (event) => {
		if(event.target.files && event.target.files[0]) {
			var reader = new FileReader();
			reader.onload = function(e) {
				document.getElementById("logopreview").setAttribute("src", e.target.result);
			}
			reader.readAsDataURL(event.target.files[0]);
		}
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

	subirFormulario = (event) => {
		this.setState({loading: true});
		const data = new FormData(event.target);
		for(var [key, value] of Object.entries(this.state.guia)) {
			data.append(key, value);
		}
		//Se pasa el ID del Usuario actual
		if("WebTurId" in localStorage) { //Siempre debería existir!
			if(localStorage.getItem("WebTurId").length > 0) {
				data.set("iduser", localStorage.getItem("WebTurId"));
			}
		}
		var logo = document.getElementById('uploadLogo').files[0];
		if(logo) {
			data.append("logo", logo, logo.name);
		}
		fetch(`${process.env.REACT_APP_URL_API_SERVER_2}/guia/${this.state.id}`, {
			method: "POST",
			headers: {
				"Authorization": localStorage.getItem("WebTurToken")
				//"Content-Type": "multipart/form-data"
			},
			body: data
		})
		.then(res => {
			this.setState({loading: false});
			if(res.ok && res.status === 200) {
				res.json().then((data) => {
					if(data.logo !== this.state.guia.logo) {
						this.setState({
							guia: {
								...this.state.guia,
								logo: data.logo
							}
						});
					}
				});
				//this.state.guia.logo
				this.setState({
					modal: {
						...this.state.modal,
						msg: "Los datos se actualizaron correctamente!",
						open: true
					}
				});
			} else {
				//409 Conflicto
				res.json().then((data) => {
					if(data.err === true) {
						let errores ="";
						if(data.errMsgs && Array.isArray(data.errMsgs)) {
							data.errMsgs.forEach(element => {
								errores += `<p>${element}</p>`;
							});
						}
						this.setState({
							modal: {
								...this.state.modal,
								msg: data.errMsg,
								extras: errores,
								open: true
							}
						});
					} else { //Error desconocido OJO!
						this.setState({
							modal: {
								...this.state.modal,
								msg: "Error desconocido, comunicar al Administrador del sistema esta situación!",
								open: true
							}
						});
					}
				});
			}
		});
	}

	handleSubmit = (event) => {
		event.preventDefault();
	}

	handleChange = (event) => {
		const target = event.target;
		const name = target.name;
		//const value = target.type === "checkbox" ? target.checked : target.value;
		var value = target.type === "checkbox" ? target.checked : target.value;
		if(target.type === "number") {
			if(value === "") {
				value = 0;
			} else {
				if(isFinite(value)) {
					let x = parseInt(value, 10);
					if(x < 0 || x > 999) {
						x = 0;
					}
					value = x; //Por algun motivo queda un 0 ver!
				} else {
					value = 0;
				}
			}
		}
		this.setState({
			guia: {
				...this.state.guia,
				[name]: value
			}
		});
	}

	componentDidMount() {
		if(isFinite(this.props.match.params.id) && this.props.match.params.id !== "0") {
			this.setState({
				id: this.props.match.params.id
			});
			//Tipos de Categorias
			fetch(process.env.REACT_APP_URL_API_SERVER_2 + "/valorizaciones/tipos")
			.then(res => {
				if(res.ok && res.status === 200) {
					res.json().then((data) => {
						this.setState({
							tiposcategorias: data.data.registros
						});
					});
				}
			});
			//Tipos de Alojamiento
			fetch(process.env.REACT_APP_URL_API_SERVER_2 + "/tipos")
			.then(res => {
				if(res.ok && res.status === 200) {
					res.json().then((data) => {
						this.setState({
							tipos: data.data.registros
						});
					});
				}
			});
			//Datos de la Guia
			fetch(process.env.REACT_APP_URL_API_SERVER_2 + "/guia/" + this.props.match.params.id)
			.then(res => {
				if(res.ok && res.status === 200) {
					res.json().then((data) => {
						if(data) {
							if(parseInt(data.data.count, 10) > 0) {
								if(data.data.registros[0].r_vencimiento === null) {
									data.data.registros[0].r_vencimiento = "";
								}
								this.setState({
									guia: data.data.registros[0]
								}, () => {
									//Back //Esto Sirve para volver al Home en el lugar que se inició
									/*
									localStorage.setItem("idDepartamento", this.state.guia.iddepartamento);
									localStorage.setItem("nombreDepartamento", this.state.guia.nombredepartamento);
									localStorage.setItem("idCiudad", this.state.guia.idciudad);
									localStorage.setItem("nombreCiudad", this.state.guia.nombreciudad);
									*/
									//Tipos de Valorización
									this.setState({
										tiposcategoriasselect: this.state.guia.idtipocategorias
									});
									//Buscar la Valorización
									this.findValorizacion(this.state.guia.idtipocategorias, this.state.guia.idvalortipcat);
									//Carga de departamentos
									fetch(process.env.REACT_APP_URL_API_SERVER_2 + "/departamentos")
									.then(res => {
										if(res.ok && res.status === 200) {
											res.json().then((data) => {
												this.setState({
													departamentos: data.data.registros
												}, () => {
													this.getCiudades(this.state.guia.iddepartamento);
													this.setState({loading: false});
												});
											});
										}
									});
								});
							} else {
								this.setState({
									loading: false,
									error: true
								});
							}
						} else {
							this.setState({
								loading: false,
								error: true
							});
						}
					});
				}
			});
			this.toggleTabs('1');
		} else {
			this.setState({
				loading: false,
				error: true
			});
		}
	}

	render() {
		const loading = this.state.loading;
		const error = this.state.error;
		const tipos = this.state.tipos.map((t) => {
			return (
				<option key={"t-" + t.id} value={t.id}>{t.descripcion}</option>
			);
		});
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
		const center = {
			lat: parseFloat(this.state.guia.latitud),
			lng: parseFloat(this.state.guia.longitud)
		}
		const titulo = this.state.guia.nombre;
		const categorias = this.state.tiposcategorias.map((tc) => {
			return(
				<option key={"tc-" + tc.id} value={tc.id}>{tc.descripcion}</option>
			);
		});
		const valorestipocat = this.state.valorestipocat.map((vtc) => {
			return(
				<option key={"vtc-" + vtc.id} value={vtc.id}>{vtc.descripcion}</option>
			);
		});
		let dataTabs = [
			//Fiscalización
			{nombre: "Establecimiento", id: "1"},
			{nombre: "Propietario", id: "8"},
			{nombre: "Responsable", id: "9"},
			{nombre: "Notas", id: "10"},
			{nombre: "Servicios", id: "4"},
			{nombre: "Redes", id: "5"},
			{nombre: "Tarifas", id: "7"},
			{nombre: "Descripción", id: "2"},
			{nombre: "Geo", id: "3"},
			{nombre: "Imágenes", id: "6"}
		];
		/*
		let dataTabs = [
			//Fiscalización
			{nombre: "Establecimiento", id: "1"},
			{nombre: "Propietario", id: "8"},
			{nombre: "Responsable", id: "9"},
			{nombre: "Notas", id: "10"},
			{nombre: "Servicios", id: "4"},
			{nombre: "Redes", id: "5"},
			{nombre: "Tarifas", id: "7"}
		];
		if("WebTurIdTipo" in localStorage) {
			if(localStorage.getItem("WebTurIdTipo") === "2") { //Si es una admin Web
				//Web
				dataTabs.push({nombre: "Descripción", id: "2"});
				dataTabs.push({nombre: "Geo", id: "3"});
				dataTabs.push({nombre: "Imágenes", id: "6"});
			}
		}
		*/
		const Tabs = dataTabs.map((dT) => {
			return(
				<NavItem key={`dT-${dT.id}`}>
					<NavLink className={classnames({ active: this.state.activeTab === dT.id })} onClick={() => { this.toggleTabs(dT.id); }}>{dT.nombre}</NavLink>
				</NavItem>
			);
		});
		return(
			<Container>
				<Row>
					<Col xs="12" md="6">
						<div className="d-flex align-items-baseline">
							<Button color="primary" className="mr-2 btn-lg" onClick={(e) => this.props.history.push("/")}><i className="fas fa-arrow-circle-left"></i></Button>
							<Breadcrumb>
								<BreadcrumbItem active>Última actualización: {format_date(this.state.guia.lupdate)} ({this.state.guia.nombreusuario})</BreadcrumbItem>
							</Breadcrumb>
						</div>
					</Col>
				</Row>
				<Row >
					<Col>
						{
							loading ?
								<Loading />
							:
								error ?
									<Alerta />
								:
									<div className="col justify-content-center mb-4 rounded shadow bg-white pt-4">
										<div className="mb-4 bg-dark p-4 text-white">
											<a href={`${process.env.REACT_APP_URL_API_SERVER_2}/detalle/${this.state.guia.id}`} target="_blank">{this.state.guia.legajo}</a> <i className="fas fa-arrow-right"></i> {this.state.guia.nombre}
										</div>
										<Form onSubmit={this.handleSubmit} className="pb-5" autoComplete="off">
											<Nav tabs className="mb-4">
												{Tabs}
											</Nav>
											<TabContent activeTab={this.state.activeTab}>
												<TabPane tabId="1">
													<Row>
														<Col xs="12" md="4" style={{textAlign: "center", marginBottom: "16px"}}>
															<img
																id = "logopreview"
																src={`${process.env.REACT_APP_URL_API_SERVER_2}/logos/${this.state.guia.logo}`}
																className="img-fluid img-thumbnail"
																style={{maxHeight: "230px"}}
																alt="Logo"
																onClick={() => {document.getElementById("uploadLogo").click();}}
															/>
															<Input id="uploadLogo" name="uploadLogo" type="file" className="d-none" accept="image/*" onChange={this.readURLLogo} />
															<Input id="id" name="id" type="text" className="d-none" value={this.state.guia.id} readOnly={true} />
															<Input id="logo" name="logo" type="text" className="d-none" value={this.state.guia.logo} readOnly={true} />
														</Col>
														<Col xs="12" md="8">
															<Row>
																<Col xs="12" md="6">
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
																</Col>
																<Col xs="12" md="6">
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
																</Col>
															</Row>
															<Row>
																<Col xs="12" md="6">
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
																</Col>
																<Col xs="12" md="6">
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
																</Col>
															</Row>
															<Row>
																<Col xs="12" md="6">
																	<FormGroup>
																		<Label htmlFor="tipocategorias">Tipo Categoría</Label>
																		<Input
																			type="select"
																			className="form-control"
																			id="tipocategorias"
																			name="tipocategorias"
																			value={this.state.tiposcategoriasselect}
																			onChange={this.handleTipoCategorias}
																		>
																			{categorias}
																		</Input>
																	</FormGroup>
																</Col>
																<Col xs="12" md="6">
																	<FormGroup>
																		<Label htmlFor="idvalortipcat">Categoría</Label>
																		<Input
																			type="select"
																			className="form-control"
																			id="idvalortipcat"
																			name="idvalortipcat"
																			value={this.state.valorestipocatselect}
																			onChange={this.handleValorTipoCatSelect}
																		>
																			{valorestipocat}
																		</Input>
																	</FormGroup>
																</Col>
																
															</Row>
														</Col>
													</Row>
													<Row>
														<Col xs="12" md="4">
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
														</Col>
														<Col xs="12" md="4">
															<FormGroup>
																<Label htmlFor="domicilio">Domicilio</Label>
																<Input
																	type="text"
																	className="form-control"
																	id="domicilio"
																	name="domicilio"
																	placeholder=""
																	value={this.state.guia.domicilio}
																	onChange={this.handleChange}
																	maxLength="100"
																/>
															</FormGroup>
														</Col>
														<Col xs="12" md="4">
															<FormGroup>
																<Label htmlFor="telefono">Teléfono</Label>
																<Input
																	type="text"
																	className="form-control"
																	id="telefono"
																	name="telefono"
																	placeholder=""
																	value={this.state.guia.telefono}
																	onChange={this.handleChange}
																	maxLength="20"
																/>
															</FormGroup>
														</Col>
													</Row>
													<Row>
														<Col xs="12" md="4">
															<FormGroup>
																<Label htmlFor="habitaciones">Habitaciones</Label>
																<Input
																	type="number"
																	className="form-control"
																	id="habitaciones"
																	name="habitaciones"
																	placeholder=""
																	value={this.state.guia.habitaciones}
																	onChange={this.handleChange}
																	min="0"
																	max="999"
																	style={{textAlign: "right"}}
																/>
															</FormGroup>
														</Col>
														<Col xs="12" md="4">
															<FormGroup>
																<Label htmlFor="plazas">Plazas</Label>
																<Input
																	type="number"
																	className="form-control"
																	id="plazas"
																	name="plazas"
																	placeholder=""
																	value={this.state.guia.plazas}
																	onChange={this.handleChange}
																	min="0"
																	max="999"
																	style={{textAlign: "right"}}
																/>
															</FormGroup>
														</Col>
														<Col xs="12" md="4">
															<FormGroup>
																<Label htmlFor="camas">Camas</Label>
																<Input
																	type="number"
																	className="form-control"
																	id="camas"
																	name="camas"
																	placeholder=""
																	value={this.state.guia.camas}
																	onChange={this.handleChange}
																	min="0"
																	max="999"
																	style={{textAlign: "right"}}
																/>
															</FormGroup>
														</Col>
													</Row>
													<Row>
														<Col xs="12" md="6">
															<FormGroup>
																<Label htmlFor="mail">EMail</Label>
																<Input
																	type="email"
																	className="form-control"
																	id="mail"
																	name="mail"
																	placeholder=""
																	value={this.state.guia.mail}
																	onChange={this.handleChange}
																	maxLength="150"
																/>
															</FormGroup>
														</Col>
														<Col xs="12" md="6">
															<FormGroup>
																<Label htmlFor="web">Página Web</Label>
																<div className="input-group">
																	<Input
																		type="text"
																		className="form-control"
																		id="web"
																		name="web"
																		placeholder=""
																		value={this.state.guia.web}
																		onChange={this.handleChange}
																		maxLength="150"
																	/>
																	<div className="input-group-append">
																		<span className="input-group-text" id="inputGroupPrepend">
																			<a href={`http://${this.state.guia.web}`} target="_blank"><i className="fas fa-link"></i></a>
																		</span>
																	</div>
																</div>
															</FormGroup>
														</Col>
														<Col xs="12" md="12">
															<FormGroup>
																<Label htmlFor="epoca">Época de Prestación de Servicios</Label>
																<div className="input-group">
																	<Input
																		type="text"
																		className="form-control"
																		id="epoca"
																		name="epoca"
																		placeholder=""
																		value={this.state.guia.epoca}
																		onChange={this.handleChange}
																		maxLength="200"
																	/>
																</div>
															</FormGroup>
														</Col>
														<Col xs="12" md="12" className="d-flex justify-content-end">
															<Button color="primary" type="button" onClick={this.subirFormulario}>Guardar Cambios</Button>
														</Col>
													</Row>
												</TabPane>
												<TabPane tabId="2">
													<Row>
														<Col>
															<FormGroup>
																<Label for="descripcion">Descripción</Label>
																<Input
																	type="textarea"
																	id="descripcion"
																	name="descripcion"
																	placeholder="Breve descripción del alojamiento."
																	value={this.state.guia.descripcion}
																	onChange={this.handleChange}
																	rows="8"
																/>
															</FormGroup>
														</Col>
														<Col xs="12" md="12" className="d-flex justify-content-end">
															<Button color="primary" type="button" onClick={this.subirFormulario}>Guardar Cambios</Button>
														</Col>
													</Row>
												</TabPane>
												<TabPane tabId="3">
													<Row>
														<Col>
															<Row>
																<Col xs="12" md="6">
																	<FormGroup>
																		<Label for="latitud">(GPS) Latitud</Label>
																		<Input
																			type="text"
																			id="latitud"
																			name="latitud"
																			placeholder=""
																			value={this.state.guia.latitud}
																			onChange={this.handleChange}
																			style={{textAlign: "right"}}
																		/>
																	</FormGroup>
																</Col>
																<Col xs="12" md="6">
																	<FormGroup>
																		<Label for="longitud">(GPS) Longitud</Label>
																		<Input
																			type="text"
																			id="longitud"
																			name="longitud"
																			placeholder=""
																			value={this.state.guia.longitud}
																			onChange={this.handleChange}
																			style={{textAlign: "right"}}
																		/>
																	</FormGroup>
																</Col>
															</Row>
															<Row>
																<Col>
																	<div style={{width: "100%", height: "400px", marginBottom: "16px"}}>
																		<GoogleMapReact
																			bootstrapURLKeys={{ key: "AIzaSyBz_U9Hg3ZbPW4o0JJ_I__ooGT7RcI0FBU" }}
																			defaultCenter={center}
																			defaultZoom={17}
																		>
																			<Marca lat={this.state.guia.latitud} lng={this.state.guia.longitud} text={titulo} />
																		</GoogleMapReact>
																	</div>
																</Col>
															</Row>
															<Row>
																<Col xs="12" md="12" className="d-flex justify-content-end">
																	<Button color="primary" type="button" onClick={this.subirFormulario}>Guardar Cambios</Button>
																</Col>
															</Row>
														</Col>
													</Row>
												</TabPane>
												<TabPane tabId="4">
													<Row>
														<Col>
															<Servicios idGuia={this.state.id} menu={true} advertencia={true} />
														</Col>
													</Row>
												</TabPane>
												<TabPane tabId="5">
													<Row>
														<Col>
															<Redes idGuia={this.state.id} menu={true} advertencia={true} />
														</Col>
													</Row>
												</TabPane>
												<TabPane tabId="6">
													<Row>
														<Col>
															<Galeria idGoG="1" idGaleria={this.state.id} />
														</Col>
													</Row>
												</TabPane>
												<TabPane tabId="7">
													<Row>
														<Col>
															<Tarifas idGuia={this.state.id} menu={true} advertencia={true} />
														</Col>
													</Row>
												</TabPane>
												<TabPane tabId="8">
													<Row>
														<Col xs="12" md="4">
															<FormGroup>
																<Label htmlFor="p_nombre">Apellido y Nombre</Label>
																<Input
																	type="text"
																	className="form-control"
																	id="p_nombre"
																	name="p_nombre"
																	placeholder=""
																	value={this.state.guia.p_nombre}
																	onChange={this.handleChange}
																	maxLength="50"
																/>
															</FormGroup>
														</Col>
														<Col xs="12" md="4">
															<FormGroup>
																<Label htmlFor="p_domicilio">Domicilio</Label>
																<Input
																	type="text"
																	className="form-control"
																	id="p_domicilio"
																	name="p_domicilio"
																	placeholder=""
																	value={this.state.guia.p_domicilio}
																	onChange={this.handleChange}
																	maxLength="50"
																/>
															</FormGroup>
														</Col>
														<Col xs="12" md="4">
															<FormGroup>
																<Label htmlFor="p_dni">DNI</Label>
																<Input
																	type="text"
																	className="form-control"
																	id="p_dni"
																	name="p_dni"
																	placeholder=""
																	value={this.state.guia.p_dni}
																	onChange={this.handleChange}
																	maxLength="8"
																/>
															</FormGroup>
														</Col>
													</Row>
													<Row>
														<Col xs="12" md="4">
															<FormGroup>
																<Label htmlFor="p_telefono">Teléfono</Label>
																<Input
																	type="text"
																	className="form-control"
																	id="p_telefono"
																	name="p_telefono"
																	placeholder=""
																	value={this.state.guia.p_telefono}
																	onChange={this.handleChange}
																	maxLength="20"
																/>
															</FormGroup>
														</Col>
														<Col xs="12" md="8">
															<FormGroup>
																<Label htmlFor="p_mail">EMail</Label>
																<Input
																	type="text"
																	className="form-control"
																	id="p_mail"
																	name="p_mail"
																	placeholder=""
																	value={this.state.guia.p_mail}
																	onChange={this.handleChange}
																	maxLength="150"
																/>
															</FormGroup>
														</Col>
													</Row>
													<Row>
														<Col xs="12" md="12" className="d-flex justify-content-end">
															<Button color="primary" type="button" onClick={this.subirFormulario}>Guardar Cambios</Button>
														</Col>
													</Row>
												</TabPane>
												<TabPane tabId="9">
													<Row>
														<Col xs="12" md="4">
															<FormGroup>
																<Label htmlFor="r_nombre">Apellido y Nombre</Label>
																<Input
																	type="text"
																	className="form-control"
																	id="r_nombre"
																	name="r_nombre"
																	placeholder=""
																	value={this.state.guia.r_nombre}
																	onChange={this.handleChange}
																	maxLength="50"
																/>
															</FormGroup>
														</Col>
														<Col xs="12" md="4">
															<FormGroup>
																<Label htmlFor="r_domicilio">Domicilio</Label>
																<Input
																	type="text"
																	className="form-control"
																	id="r_domicilio"
																	name="r_domicilio"
																	placeholder=""
																	value={this.state.guia.r_domicilio}
																	onChange={this.handleChange}
																	maxLength="50"
																/>
															</FormGroup>
														</Col>
														<Col xs="12" md="4">
															<FormGroup>
																<Label htmlFor="r_dni">DNI</Label>
																<Input
																	type="text"
																	className="form-control"
																	id="r_dni"
																	name="r_dni"
																	placeholder=""
																	value={this.state.guia.r_dni}
																	onChange={this.handleChange}
																	maxLength="8"
																/>
															</FormGroup>
														</Col>
													</Row>
													<Row>
														<Col xs="12" md="4">
															<FormGroup>
																<Label htmlFor="r_telefono">Teléfono</Label>
																<Input
																	type="text"
																	className="form-control"
																	id="r_telefono"
																	name="r_telefono"
																	placeholder=""
																	value={this.state.guia.r_telefono}
																	onChange={this.handleChange}
																	maxLength="20"
																/>
															</FormGroup>
														</Col>
														<Col xs="12" md="8">
															<FormGroup>
																<Label htmlFor="r_mail">EMail</Label>
																<Input
																	type="text"
																	className="form-control"
																	id="r_mail"
																	name="r_mail"
																	placeholder=""
																	value={this.state.guia.r_mail}
																	onChange={this.handleChange}
																	maxLength="150"
																/>
															</FormGroup>
														</Col>
													</Row>
													<Row>
														<Col xs="12" md="4">
															<FormGroup>
																<Label htmlFor="r_cargo">Cargo</Label>
																<Input
																	type="text"
																	className="form-control"
																	id="r_cargo"
																	name="r_cargo"
																	placeholder=""
																	value={this.state.guia.r_cargo}
																	onChange={this.handleChange}
																	maxLength="50"
																/>
															</FormGroup>
														</Col>
														<Col xs="12" md="4">
															<FormGroup>
																<Label htmlFor="r_vencimiento">Caducidad del Contrato</Label>
																<Input
																	type="date"
																	className="form-control"
																	id="r_vencimiento"
																	name="r_vencimiento"
																	placeholder=""
																	value={this.state.guia.r_vencimiento}
																	onChange={this.handleChange}
																/>
															</FormGroup>
														</Col>
													</Row>
													<Row>
														<Col xs="12" md="12" className="d-flex justify-content-end">
															<Button color="primary" type="button" onClick={this.subirFormulario}>Guardar Cambios</Button>
														</Col>
													</Row>
												</TabPane>
												<TabPane tabId="10">
													<Row>
														<Col>
															<FormGroup>
																<Label for="notas">Notas</Label>
																<Input
																	type="textarea"
																	id="notas"
																	name="notas"
																	placeholder="Notas internas, observaciones, datos de utilidad, etc."
																	value={this.state.guia.notas}
																	onChange={this.handleChange}
																	rows="8"
																/>
															</FormGroup>
														</Col>
													</Row>
													<Row>
														<Col xs="12" md="12" className="d-flex justify-content-end">
															<Button color="primary" type="button" onClick={this.subirFormulario}>Guardar Cambios</Button>
														</Col>
													</Row>
												</TabPane>
											</TabContent>
										</Form>
										<style jsx="true">{`
											.nav-link {
												cursor: pointer;
											}
										`}</style>
									</div>
						}
					</Col>
				</Row>
				<ModalMsg open={this.state.modal.open} titulo="Update" msg={this.state.modal.msg} onlyOk={this.state.modal.onlyOk} handleAceptar={this.handleMsgOk}>
						{this.state.modal.extras}
				</ModalMsg>
			</Container>
		);
	}
}

export default GuiaUpdate;