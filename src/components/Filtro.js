import React, { Component } from "react";
import Loading from "../utils/loading";

class Filtro extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			departamentos: {
				registros: [{id: 0, nombre: "Todos"}],
				selected: 0
			},
			ciudades: {
				registros: [{id: 0, nombre: "Todas"}],
				selected: 0
			},
			tipos: {
				registros: [{id: 0, descripcion: "Todos"}],
				selected: 0
			},
			tvalorizacion: {
				registros: [{id: 0, descripcion: "Todos"}],
				selected: 0
			},
			valorizacion: {
				registros: [{id: 0, descripcion: "Todas"}],
				selected: 0
			},
			habitaciones: 0,
			camas: 0,
			plazas: 0,
			servicios: [],
			idsChecked: ""
		};
		this.findCiudades = this.findCiudades.bind(this);
		this.handleCiudadChange = this.handleCiudadChange.bind(this);
		this.handleDepartamentoChange = this.handleDepartamentoChange.bind(this);
		this.handleTipoChange = this.handleTipoChange.bind(this);
		this.handleTValorizacionChange = this.handleTValorizacionChange.bind(this);
		this.findValorizacion = this.findValorizacion.bind(this);
		this.handleValorizacionChange = this.handleValorizacionChange.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleCantidad = this.handleCantidad.bind(this);
		this.handleActivo = this.handleActivo.bind(this);
		//this.handleOk = this.handleOk.bind(this);
	}


	/*
	handleOk = () => {
		const datos = {
			idDepartamento: this.state.departamentos.selected,
			idCiudad: this.state.ciudades.selected,
			idTipo: this.state.tipos.selected,
			idTipoValorizacion: "",
			idValorizacion: "",
			habitaciones: this.state.habitaciones,
			camas: this.state.camas,
			plazas: this.state.plazas,
			servicios: this.state.servicios.filter((valor) => {
				return valor.activo;
			})
		};
		console.log(datos);
		//
		var x = document.createElement("form");
		x.acceptCharset = "UTF-8"; //ISO-8859-1 - Character encoding for the Latin alphabet
		x.action = "localhost/papa.php";
		x.enctype = "multipart/form-data";
		x.method = "post";
		x.name = "hans";
		x.target = "_blank";

		my_tb=document.createElement('INPUT');
		my_tb.type='HIDDEN';
		my_tb.name='hidden1';
		my_tb.value='Values of my hidden1';
		my_form.appendChild(my_tb);
		document.body.appendChild(my_form);
		my_form.submit();
		x.submit();
		//
	}
	*/

	handleActivo = (id, event) => {
		const copy_servicios = Object.assign([], this.state.servicios).map((currentValue) => {
			if(currentValue.id === id) {
				let cantidad = 0;
				if(event.target.checked) {
					cantidad = currentValue.cantidad;
				}
				return {
					...currentValue,
					cantidad: cantidad,
					activo: event.target.checked
				};
			} else {
				return currentValue;
			}
		});
		this.setState({servicios: copy_servicios}, () => {
			let n = this.state.servicios.map((element) => {
				if(element.activo) {
					return element.id;
				} else {
					return 0;
				}
			});
			this.setState({idsChecked: n.toString()});
		});
	}

	handleCantidad = (id, event) => {
		const copy_servicios = Object.assign([], this.state.servicios).map((currentValue) => {
			if(currentValue.id === id) {
				return {
					...currentValue,
					cantidad: event.target.value,
					activo: true
				};
			} else {
				return currentValue;
			}
		});
		this.setState({servicios: copy_servicios});
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
		this.setState({[name]: value});
	}

	handleValorizacionChange = (event) => {
		this.setState({
			valorizacion: {
				...this.state.valorizacion,
				selected: event.target.value
			}
		});
	}

	handleTValorizacionChange = (event) => {
		const valor = event.target.value;
		this.setState({
			tvalorizacion: {
				...this.state.tvalorizacion,
				selected: valor
			}
		}, () => {
			this.findValorizacion(valor);
		});
	}

	findValorizacion = (idTipoValorizacion) => {
		if(idTipoValorizacion === 0) {
            this.setState({
                valorizacion: {
					registros: [{id: 0, descripcion: "Todas"}],
					selected: 0
                }
            });
        } else {
            fetch(`${process.env.REACT_APP_URL_API_SERVER_2}/valorizaciones/tipo/${idTipoValorizacion}`, {
                headers: new Headers({
                    "Authorization": localStorage.getItem("WebTurToken")
                })
            })
            .then(res => {
                if(res.ok && res.status === 200) {
                    res.json().then((data) => {
						data.data.registros.unshift({id: 0, descripcion: "Todas"});
                        this.setState({
							loading: false,
                            valorizacion: {
								registros: data.data.registros,
								selected: 0
							}
                        });
                    });
                } else {
                    this.setState({
                        loading: false,
                        valorizacion: {
							registros:[{id: 0, descripcion: "Error al obtener los datos!"}],
                        	selected: 0
                        }
                    });
                }
            });
        }
	}

	handleTipoChange = (event) => {
		this.setState({
			tipos: {
				...this.state.tipos,
				selected: event.target.value
			}
		});
	}

	handleCiudadChange = (event) => {
		this.setState({
			ciudades: {
				...this.state.ciudades,
				selected: event.target.value
			}
		});
	}

	handleDepartamentoChange = (event) => {
		const valor = event.target.value;
		this.setState({
			departamentos: {
				...this.state.departamentos,
				selected: valor
			}
		}, () => {
			this.findCiudades(valor);
		});
	}

	findCiudades = (idDepartamento) => {
		if(idDepartamento === 0) {
            this.setState({
                ciudades: {
					registros: [{id: 0, nombre: "Todas"}],
					selected: 0
                }
            });
        } else {
            fetch(`${process.env.REACT_APP_URL_API_SERVER_2}/ciudades/departamento/${idDepartamento}`, {
                headers: new Headers({
                    "Authorization": localStorage.getItem("WebTurToken")
                })
            })
            .then(res => {
                if(res.ok && res.status === 200) {
                    res.json().then((data) => {
						data.data.registros.unshift({id: 0, nombre: "Todas"});
						console.log(data.data.registros);
                        this.setState({
							loading: false,
                            ciudades: {
								registros: data.data.registros,
								selected: 0
							}
                        });
                    });
                } else {
                    this.setState({
                        loading: false,
                        ciudades: {
							registros:[{id: 0, nombre: "Error al obtener los datos!"}],
                        	selected: 0
                        }
                    });
                }
            });
        }
	}

	componentDidMount() {
		//Obtener todos los Departamentos
        let departamentos = new Promise((acept, reject) => {
			fetch(`${process.env.REACT_APP_URL_API_SERVER_2}/departamentos/provincia/1`, {
				method: "GET",
				headers: new Headers({
					"Authorization": localStorage.getItem("WebTurToken")
				})
			})
			.then(res => {
				if(res.ok && res.status === 200) {
					res.json().then((data) => {
						data.data.registros.unshift({id: 0, nombre: "Todos"});
						this.setState({
							departamentos: {
								registros: data.data.registros,
								selected: 0
							}
						}, () => {
							acept(true);
						});
					});
				} else {
					reject("Error");
				}
			});
		});
		//Tipos
		let tipos = new Promise((acept, reject) => {
			fetch(`${process.env.REACT_APP_URL_API_SERVER_2}/tipos`, {
				method: "GET",
				headers: new Headers({
					"Authorization": localStorage.getItem("WebTurToken")
				})
			})
			.then(res => {
				if(res.ok && res.status === 200) {
					res.json().then((data) => {
						data.data.registros.unshift({id: 0, descripcion: "Todos"});
						this.setState({
							tipos: {
								registros: data.data.registros,
								selected: 0
							}
						}, () => {
							acept(true);
						});
					});
				} else {
					reject("Error");
				}
			});
		});
		//Tipos de Valorizaciones
		let tiposdevalorizacion = new Promise((acept, reject) => {
			fetch(`${process.env.REACT_APP_URL_API_SERVER_2}/valorizaciones/tipos`, {
				method: "GET",
				headers: new Headers({
					"Authorization": localStorage.getItem("WebTurToken")
				})
			})
			.then(res => {
				if(res.ok && res.status === 200) {
					res.json().then((data) => {
						data.data.registros.unshift({id: 0, descripcion: "Todos"});
						this.setState({
							tvalorizacion: {
								registros: data.data.registros,
								selected: 0
							}
						}, () => {
							acept(true);
						});
					});
				} else {
					reject("Error");
				}
			});
		});
		//Servicios
		let servicios = new Promise((acept, reject) => {
			fetch(`${process.env.REACT_APP_URL_API_SERVER_2}/servicios`, {
				method: "GET",
				headers: new Headers({
					"Authorization": localStorage.getItem("WebTurToken")
				})
			})
			.then(res => {
				if(res.ok && res.status === 200) {
					res.json().then((data) => {
						let serv = data.data.registros.map((s) => {
							return({
								...s,
								activo: false,
								cantidad: 0
							});
						});
						this.setState({servicios: serv}, () => {
							acept(true);
						});
					});
				} else {
					reject("Error");
				}
			});
		});
		Promise.all([departamentos, tipos, tiposdevalorizacion, servicios]).then(values => {
			this.setState({
				loading: false
			});
		});
	}

	render() {
		const loading = this.state.loading;
		const departamentos = this.state.departamentos.registros.map((depto) => {
			return(
				<option key={`Dep-${depto.id}`} value={depto.id}>{depto.nombre}</option>
			);
		});
		const ciudades = this.state.ciudades.registros.map((ciudad) => {
			return(
				<option key={`City-${ciudad.id}`} value={ciudad.id}>{ciudad.nombre}</option>
			);
		});
		const tipos = this.state.tipos.registros.map((tipo) => {
			return(
				<option key={`Tipo-${tipo.id}`} value={tipo.id}>{tipo.descripcion}</option>
			);
		});
		const tvalorizacion =  this.state.tvalorizacion.registros.map((tval) => {
			return(
				<option key={`TipoV-${tval.id}`} value={tval.id}>{tval.descripcion}</option>
			);
		});
		const valorizacion =  this.state.valorizacion.registros.map((val) => {
			return(
				<option key={`Val-${val.id}`} value={val.id}>{val.descripcion}</option>
			);
		});
		const servicios =  this.state.servicios.map((ser) => {
			return(
				<div className="col-xs-12 col-md-4" key={`Serv-${ser.id}`}>
					<div className="input-group mb-2">
						<div className="input-group-prepend">
							<div className="input-group-text">
								<input type="checkbox" name={`ServCheck-${ser.id}`} id={`ServCheck-${ser.id}`} checked={ser.activo} onChange={(e) => this.handleActivo(ser.id, e)} />
							</div>
						</div>
						<div className="form-control" style={{height: "auto"}}>{ser.descripcion}</div>
						<div className="input-group-append">
							<div className="input-group-text">
								<input type="number" style={{maxWidth: "75px", textAlign: "right"}} name={`ServCant-${ser.id}`} id={`ServCant-${ser.id}`} value={ser.cantidad} onChange={(e) => this.handleCantidad(ser.id, e)} />
							</div>
						</div>
					</div>
				</div>
			);
			/*
			return(
				<div key={`Serv-${ser.id}`}>
					<input type="checkbox" name={`ServCheck-${ser.id}`} id={`ServCheck-${ser.id}`} checked={ser.activo} onChange={(e) => this.handleActivo(ser.id, e)} />
					<span>{ser.descripcion}</span>
					<input type="number" name={`ServCant-${ser.id}`} id={`ServCant-${ser.id}`} value={ser.cantidad} onChange={(e) => this.handleCantidad(ser.id, e)} />
				</div>
			);
			*/
		});
		return (
			<div className="Filtro">
				{
					loading ?
					<Loading />
					:
					<div className="container">
						<div className="row">
							<div className="col bg-white text-dark p-4 rounded">
								<div class="mb-4 bg-dark p-4 text-white"><i class="fas fa-arrow-right"></i> Consultas</div>
								<form action={`${process.env.REACT_APP_URL_API_SERVER_2}/filtro`} method="post" encType="application/x-www-form-urlencoded" target="_blank">
									<div className="row">
										<div className="col-xs-12 col-md-3">
											<div className="form-group">
												<label htmlFor="idDepartamento">Departamento</label>
												<select className="form-control" name="idDepartamento" id="idDepartamento" value={this.state.departamentos.selected} onChange={this.handleDepartamentoChange}>
													{departamentos}
												</select>
											</div>
										</div>
										<div className="col-xs-12 col-md-3">
											<div className="form-group">
												<label htmlFor="idCiudad">Ciudad</label>
												<select className="form-control" name="idCiudad" id="idCiudad" value={this.state.ciudades.selected} onChange={this.handleCiudadChange}>
													{ciudades}
												</select>
											</div>
										</div>
										<div className="col-xs-12 col-md-3">
											<div className="form-group">
												<label htmlFor="idCiudad">Tipo</label>
												<select className="form-control" name="idTipo" id="idTipo" value={this.state.tipos.selected} onChange={this.handleTipoChange}>
													{tipos}
												</select>
											</div>
										</div>
										<div className="col-xs-12 col-md-3">
											<div className="form-group">
												<label htmlFor="idTipoValorizacion">Tipo de Categoría</label>
												<select className="form-control" name="idTipoValorizacion" id="idTipoValorizacion" value={this.state.tvalorizacion.selected} onChange={this.handleTValorizacionChange}>
													{tvalorizacion}
												</select>
											</div>
										</div>
										<div className="col-xs-12 col-md-3">
											<div className="form-group">
												<label htmlFor="idValorizacion">Categoría</label>
												<select className="form-control" name="idValorizacion" id="idValorizacion" value={this.state.valorizacion.selected} onChange={this.handleValorizacionChange}>
													{valorizacion}
												</select>
											</div>
										</div>
										<div className="col-xs-12 col-md-3">
											<div className="form-group">
												<label htmlFor="habitaciones">Habitaciones</label>
												<input className="form-control" type="number" name="habitaciones" id="habitaciones" value={this.state.habitaciones} onChange={this.handleChange} />
											</div>
										</div>
										<div className="col-xs-12 col-md-3">
											<div className="form-group">
												<label htmlFor="camas">Camas</label>
												<input className="form-control" type="number" name="camas" id="camas" value={this.state.camas} onChange={this.handleChange} />
											</div>
										</div>
										<div className="col-xs-12 col-md-3">
											<div className="form-group">
												<label htmlFor="plazas">Plazas</label>
												<input className="form-control" type="number" name="plazas" id="plazas" value={this.state.plazas} onChange={this.handleChange} />
											</div>
										</div>
									</div>
									<div className="row">
										<div className="col mb-2">Servicios:</div>
									</div>
									<div className="row">
										{servicios}
									</div>
									<div className="row">
										<div className="col">
											<div className="d-flex justify-content-end">
												<input type="hidden" name="idsChecked" id="idsChecked" value={this.state.idsChecked} onChange={this.handleChange} />
												<button type="submit" className="btn btn-info">Consultar los Registros</button>
											</div>
										</div>
									</div>
								</form>
							</div>
						</div>
					</div>
				}
			</div>
		);
	}
}

export default Filtro;
