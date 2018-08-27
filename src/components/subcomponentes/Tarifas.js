import React, { Component } from "react";
import Loading from "../../utils/loading";
import { Row, Col } from "reactstrap";

class Tarifas extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            menu: this.props.menu,
            menu_opt_sistema: true,
            advertencia: this.props.advertencia,
            idGuia: this.props.idGuia,
            allTarifas: [{id: 0, descripcion: "S/Datos", visible: false}],
            allTarifasSelected: 0,
            guiaTarifas: [],
            importe: 0,
            desayuno: false
        };
        this.findTarifas = this.findTarifas.bind(this);
        this.handleAllTarifasChange = this.handleAllTarifasChange.bind(this);
        this.handleAddTarifa = this.handleAddTarifa.bind(this);
        this.handleDeleteTarifa = this.handleDeleteTarifa.bind(this);
        this.procesar = this.procesar.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange = (event) => {
        const target = event.target;
		const name = target.name;
		var value = target.type === "checkbox" ? target.checked : target.value;
		if(target.type === "number") {
			if(value === "") {
				value = 0;
			} else {
				if(isFinite(value)) {
					let x = parseFloat(value, 10);
					if(x < 0) {
						x = 0;
					}
					value = x; //Por algun motivo queda un 0 ver!
				} else {
					value = 0;
				}
			}
		}
		this.setState({
				[name]: value
		});
    }

    handleAddTarifa = (event) => {
        this.setState({
            loading: true
        }, () => {
            fetch(`${process.env.REACT_APP_URL_API_SERVER_2}/guia/${this.state.idGuia}/tarifa/add/${this.state.allTarifasSelected}`, {
                method: "POST",
                headers: {
                    "Authorization": localStorage.getItem("WebTurToken"),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({importe: this.state.importe, desayuno: this.state.desayuno})
            })
            .then(res => {
                if(res.ok && res.status === 201) {
                    this.findTarifas();
                    this.setState({
                        importe: 0,
                        desayuno: false
                    });
                } else {
                    /*
                        Error (Posible 409 - Conflicto la tarifa ya existe en la guia)
                        No debería ocurrir dada la lógica del componente el cual oculta
                        las Tarifas que ya posee la guia de la seleccion para agregar.
                    */
                }
            });
        });
    }

    handleDeleteTarifa = (id) => {
        this.setState({
            loading: true
        }, () => {
            fetch(`${process.env.REACT_APP_URL_API_SERVER_2}/guia/tarifa/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": localStorage.getItem("WebTurToken")
                }
            })
            .then(res => {
                this.findTarifas();
            });
        });
    }

    handleAllTarifasChange = (event) => {
        this.setState({allTarifasSelected: event.target.value});
    }
    
    procesar = () => {
        //var updatedTicket = Object.assign({}, this.state.ticket, {flightNo:'1010'});
        let alse = Object.assign([], this.state.allTarifas);
        let firstOK = 0;
        alse = alse.map((valor) => {
            let x = this.state.guiaTarifas.findIndex((e) => {
                if(valor.id === e.idtarifa) {
                    return true;
                } else {
                    return false;
                }
            });
            if(x > -1) {
                return {...valor, visible: false}
            } else {
                if(firstOK === 0) {
                    firstOK = valor.id;
                }
                return valor;
            }
        });
        if(firstOK === 0) {
            this.setState({
                menu_opt_sistema: false,
                allTarifas: [{id: 0, descripcion: "S/Datos", visible: false}],
                allTarifasSelected: 0,
                loading: false
            });
        } else {
            this.setState({
                menu_opt_sistema: true,
                allTarifas: alse,
                allTarifasSelected: firstOK,
                loading: false
            });
        }
    }

    findTarifas = () => {
        //Obtener todas las Tarifas
        let TodosLosTarifas = new Promise((resolve, reject) => {
            fetch(`${process.env.REACT_APP_URL_API_SERVER_2}/tarifas`, {
                method: "GET",
                headers: {
                    "Authorization": localStorage.getItem("WebTurToken")
                }
            })
            .then(res => {
                if(res.ok && res.status === 200) {
                    res.json().then((data) => {
                        let res = data.data.registros.map((s) => {
                            return({
                                id: s.id,
                                descripcion: s.descripcion,
                                visible: true
                            });
                        });
                        this.setState({
                            allTarifas: res
                        }, () => {
                            resolve("Ok");
                        });
                    });
                } else {
                    reject("Error al obtener todas las Tarifas");
                }
            });
        });
        //Obtener todos los Tarifas de la guia
        let ServicosDeLaGuia = new Promise((resolve, reject) => {
            fetch(`${process.env.REACT_APP_URL_API_SERVER_2}/guia/${this.state.idGuia}/tarifas`, {
                method: "GET",
                headers: {
                    "Authorization": localStorage.getItem("WebTurToken")
                }
            })
            .then(res => {
                if(res.ok && res.status === 200) {
                    res.json().then((data) => {
                        this.setState({
                            guiaTarifas: data.data.registros
                        }, () => {
                            resolve("Ok");
                        });
                    });
                } else {
                    reject("Error al obtener todas las Tarifas de la guia");
                }
            });
        });
        Promise.all([TodosLosTarifas, ServicosDeLaGuia]).then(values => { 
            this.setState({
                allTarifasSelected: this.state.allTarifas[0].id
            });
            this.procesar();
        });
    }

    componentDidMount() {
        //Obtener los Tarifas
        this.findTarifas();
    }

    render() {
        const loading = this.state.loading;
        const menu = this.state.menu;
        const menu_opt_sistema = this.state.menu_opt_sistema;
        const opciones = this.state.allTarifas.map((alse) => {
            return(
                alse.visible
                ?
                <option key={`o-${alse.id}`} value={alse.id}>{alse.descripcion}</option>
                :
                ""
            );
        });
        const Tarifas = this.state.guiaTarifas.map((gserv) => {
            return(
                <li key={`Serv-${gserv.id}`} className="list-group-item">
                    <div className="row">
                        <div className="col">{gserv.descripcion}</div>
                        <div className="col">$ {gserv.importe}</div>
                        <div className="col">{gserv.desayuno === "1" ? "Con Desayuno" : "Sin Desayuno"}</div>
                        {
                            menu
                            ?
                            <div className="col d-flex justify-content-end">
                                <i className="fas fa-trash text-danger btnDeleteTarifa" onClick={this.handleDeleteTarifa.bind(this, gserv.id)}></i>
                            </div>
                            :
                            <div className="col"></div>
                        }
                    </div>
                </li>
            );
        });
        return(
            <div className="Tarifas">
                {
                    loading ?
                    <Loading />
                    :
                    <div className="mb-4">
                        <Row>
                            <Col xs="12" md="12">
                                <div className="d-flex flex-column justify-content-start mb-3">
                                    <label>Tarifas</label>
                                    {
                                        menu && menu_opt_sistema
                                        ?
                                        <div className="row">
                                            <div className="col-xs-6 col-md-3">
                                                <div className="form-group">
                                                    <label htmlFor="idtarifa">Tipo</label>
                                                    <select className="form-control" name="idtarifa" id="idtarifa" value={this.state.allTarifasSelected} onChange={this.handleAllTarifasChange}>
                                                        {opciones}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-xs-6 col-md-3">
                                                <div className="form-group">
                                                    <label htmlFor="importe">Importe</label>
                                                    <input type="number" className="form-control" name="importe" id="importe" value={this.state.importe} onChange={this.handleChange} style={{textAlign: "right"}}/>
                                                </div>
                                            </div>
                                            <div className="col-xs-6 col-md-3">
                                                <label htmlFor="idtarifa">Desayuno</label>
                                                <div className="form-check mb-2 pt-2">
                                                    <input type="checkbox" className="form-check-input" name="desayuno" id="desayuno" value={this.state.desayuno} onChange={this.handleChange} />
                                                    <label className="form-check-label" htmlFor="desayuno">{this.state.desayuno ? "Con Desayuno" : "Sin Desayuno"}</label>
                                                </div>
                                            </div>
                                            <div className="col-xs-6 col-md-1 d-flex justify-content-end align-items-center">
                                                <button type="button" className="btn btn-primary ml-2 mt-2" onClick={this.handleAddTarifa}><i className="fas fa-arrow-circle-down"></i></button>
                                            </div>
                                        </div>
                                        :
                                        ""
                                    }
                                    <hr />
                                    <ul className="list-group">
                                        {Tarifas}
                                    </ul>
                                    {
                                        this.state.advertencia
                                        ?
                                        <div className="alert alert-warning mt-4" role="alert">
                                            Advertencia!: Los cambios realizados a las Tarifas se guardan automáticamente!.
                                        </div>
                                        :
                                        ""
                                    }
                                </div>
                            </Col>
                        </Row>
                    </div>
                }
                <style jsx="true">{`
                    .btnDeleteTarifa {
                        margin-top: 4px;
                        cursor: pointer;
                    }
                `}</style>
            </div>
        );
    }
}

export default Tarifas;

/*
<div class="form-check mb-2">
    <input class="form-check-input" type="checkbox" id="autoSizingCheck" />
    <label class="form-check-label" for="autoSizingCheck">Remember me</label>
</div>
*/