import React, { Component } from "react";
import Loading from "../utils/loading";
import { Container, Row, Col, Alert, Button, Form, FormGroup, Label, Input, Breadcrumb, BreadcrumbItem } from "reactstrap";
import GoogleMapReact from "google-map-react";
import Servicios from "./subcomponentes/Servicios";
import Galeria from "./subcomponentes/Galeria";
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
		<img src={process.env.REACT_APP_URL_API_SERVER + "/imgs/googlemark.png"} style={{width: "32px", height: "32px"}} alt="I" />
	);
}

class GuiaUpdate extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			error: false,
			modal: {
                msg: "",
                open: false,
                onlyOk: true
            },
			id: 0,
			tipos: [{id: 0, descripcion: "Loading..."}],
			guia: {
				galeria: []
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
	}

	/*
	this.handleKeyUp = this.handleKeyUp.bind(this);
	<form onKeyUp={this.handleKeyUp}>
	handleKeyUp(event) {
		if (event.keyCode == 13) return this.sendData()
	}
	*/

	handleMsgOk = () => {
		this.setState({
			modal: {
				...this.state.modal,
				open: false
			}
		});
	}

	findValorizacion = (idTipoCategoriasSelect, idValorTipCatGuia) => {
		fetch(process.env.REACT_APP_URL_API_SERVER + "/valorizaciones.php?idCategoria=" + idTipoCategoriasSelect)
		.then(res => {
			if(res.ok && res.status === 200) {
				res.json().then((data) => {
					this.setState({
						valorestipocat: data
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
		this.setState({valorestipocatselect: event.target.value});
	}

	handleTipoCategorias = (event) => {
		this.setState({tiposcategoriasselect: event.target.value});
		this.findValorizacion(event.target.value, 0);
	}

	getCiudades = (idDepartamento) => {
		return fetch(process.env.REACT_APP_URL_API_SERVER + "/ciudades.php?idDep=" + idDepartamento)
		.then(res => {
			if(res.ok && res.status === 200) {
				res.json().then((data) => {
					this.setState({
						ciudades: data
					});
				});
			}
		});
	}

	readURLLogo = (event) => {
		/*
		this.setState({
			guia: {
				...this.state.guia,
				logo: URL.createObjectURL(event.target.files[0])
			}
		});
		*/
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

	handleSubmit = (event) => {
		event.preventDefault();
		const data = new FormData(event.target);
		fetch(process.env.REACT_APP_URL_API_SERVER + "/guiaupdate.php", {
			method: "POST",
			headers: {
				"Authorization": localStorage.getItem("WebTurToken")
			},
			body: data
		})
		.then(res => {
			if(res.ok && res.status === 200) {
				res.json().then((data) => {
					if(data.err === true) {
						let errores = "";
						data.errMsg.forEach(element => {
							errores += `${element} - `;
						});
						this.setState({
							modal: {
								...this.state.modal,
								msg: `Ocurrió un error al actualizar los datos: ${errores}`,
								open: true
							}
						});
					} else {
						this.setState({
							modal: {
								...this.state.modal,
								msg: "Los datos se actualizaron correctamente!",
								open: true
							}
						});
					}
				});
			}
		});
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
		if(isFinite(this.props.match.params.id)) {
			this.setState({
				id: this.props.match.params.id
			});
			//Tipos de categorias
			fetch(process.env.REACT_APP_URL_API_SERVER + "/tiposcategorias.php ")
			.then(res => {
				if(res.ok && res.status === 200) {
					res.json().then((data) => {
						this.setState({
							tiposcategorias: data
						});
					});
				}
			});
			//Tipos
			fetch(process.env.REACT_APP_URL_API_SERVER + "/tipos.php")
			.then(res => {
				if(res.ok && res.status === 200) {
					res.json().then((data) => {
						this.setState({
							tipos: data
						});
					});
				}
			});
			//Datos de la Guia
			fetch(process.env.REACT_APP_URL_API_SERVER + "/one_guia.php?idGuia=" + this.props.match.params.id)
			.then(res => {
				if(res.ok && res.status === 200) {
					res.json().then((data) => {
						this.setState({
							guia: data
						}, () => {
							//Back //Esto Sirve para volver al Home en el lugar que se inició
							localStorage.setItem("idDepartamento", this.state.guia.iddepartamento);
							localStorage.setItem("nombreDepartamento", this.state.guia.nombredepartamento);
							localStorage.setItem("idCiudad", this.state.guia.idciudad);
							localStorage.setItem("nombreCiudad", this.state.guia.nombreciudad);
							//Tipos de Valorización
							this.setState({
								tiposcategoriasselect: this.state.guia.idtipocaterias
							});
							//
							//Buscar la Valorización
							this.findValorizacion(this.state.guia.idtipocaterias, this.state.guia.idvalortipcat);
							//Carga de departamentos
							fetch(process.env.REACT_APP_URL_API_SERVER + "/departamentos.php")
							.then(res => {
								if(res.ok && res.status === 200) {
									res.json().then((data) => {
										this.setState({
											departamentos: data
										}, () => {
											this.getCiudades(this.state.guia.iddepartamento);
											this.setState({loading: false});
										});
									});
								}
							});
						});
					});
				}
			});
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
		return(
			<Container>
				<Row>
					<Col xs="12" md="6">
						<div className="d-flex align-items-baseline">
							<Button color="primary" className="mr-2 btn-lg" onClick={(e) => this.props.history.push("/")}><i className="fas fa-arrow-circle-left"></i></Button>
							<Breadcrumb>
								<BreadcrumbItem active>Última actualización: {this.state.guia.lupdate}</BreadcrumbItem>
							</Breadcrumb>
						</div>
					</Col>
				</Row>
				<Row className="justify-content-center mb-4 rounded shadow bg-white pt-4">
					<Col>
						{
							loading ?
								<Loading />
							:
								error ?
									<Alerta />
								:
									<div>
										<Form onSubmit={this.handleSubmit} className="pb-5" autoComplete="off">
											<Row>
												<Col xs="12" md="4" style={{textAlign: "center", marginBottom: "16px"}}>
													<img
														id = "logopreview"
														src={`${process.env.REACT_APP_URL_API_SERVER}/imgs/logos/${this.state.guia.logo}`}
														className="img-fluid img-thumbnail"
														style={{maxHeight: "230px"}}
														alt="img"
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
																<Label htmlFor="tipocategorias">Tipo Valorización</Label>
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
																<Label htmlFor="idvalortipcat">Valorización</Label>
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
												<Col xs="12" md="6">
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
														/>
													</FormGroup>
												</Col>
												<Col xs="12" md="6">
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
														/>
													</FormGroup>
												</Col>
											</Row>
											<Row>
												<Col xs="12" md="4">
													<FormGroup>
														<Label htmlFor="telefono">Telefono</Label>
														<Input
															type="text"
															className="form-control"
															id="telefono"
															name="telefono"
															placeholder=""
															value={this.state.guia.telefono}
															onChange={this.handleChange}
														/>
													</FormGroup>
												</Col>
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
														/>
													</FormGroup>
												</Col>
												<Col xs="12" md="6">
													<FormGroup>
														<Label htmlFor="web">Página Web</Label>
														<Input
															type="text"
															className="form-control"
															id="web"
															name="web"
															placeholder=""
															value={this.state.guia.web}
															onChange={this.handleChange}
														/>
													</FormGroup>
												</Col>
											</Row>
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
											</Row>
											<Row>
												<Col xs="12" md="6">
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
														<Col xs="12" md="12">
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
												</Col>
												<Col xs="12" md="6">
													<Servicios idGuia={this.state.id} menu={true} advertencia={true} />
												</Col>
											</Row>
											<Button color="primary" type="submit" className="float-right">Guardar Cambios</Button>
										</Form>
										<hr/>
										<Galeria idGoG="1" idGaleria={this.state.id} />
									</div>
						}
					</Col>
				</Row>
				<ModalMsg open={this.state.modal.open} titulo="Update" msg={this.state.modal.msg} onlyOk={this.state.modal.onlyOk} handleAceptar={this.handleMsgOk} />
			</Container>
		);
	}
}

export default GuiaUpdate;