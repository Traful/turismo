import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Breadcrumb, BreadcrumbItem } from "reactstrap";
import Loading from "../utils/loading";
import Depatamentos from "./subcomponentes/Departamentos";
import Ciudades from "./subcomponentes/Ciudades";
import Guias from "./subcomponentes/Guias";


class Home extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			idDepartamento: 0,
			idCiudad: 0,
			nombreDepartamento: "",
			nombreCiudad: ""
		};
		this.handleDepartamentosClick = this.handleDepartamentosClick.bind(this);
		this.handleCiudadesClick = this.handleCiudadesClick.bind(this);
	}

	handleDepartamentosClick = (id, nombre) => {
		this.setState({
			nombreDepartamento: nombre,
			idDepartamento: id,
			idCiudad: 0,
			nombreCiudad: ""
		});
	}

	handleCiudadesClick = (id, nombre) => {
		this.setState({
			nombreCiudad: nombre,
			idCiudad: id
		});
	}

	componentDidMount() {
		if("idDepartamento" in localStorage) {
			if(localStorage.getItem("idDepartamento").length > 0) {
				this.setState(
					{idDepartamento: parseInt(localStorage.getItem("idDepartamento"), 10)}
				, () => {
					localStorage.removeItem("idDepartamento");
					if("nombreDepartamento" in localStorage) {
						this.setState({nombreDepartamento: localStorage.getItem("nombreDepartamento")});
						localStorage.removeItem("nombreDepartamento");
					}
				});
			}
		}
		if("idCiudad" in localStorage) {
			if(localStorage.getItem("idCiudad").length > 0) {
				this.setState(
					{idCiudad: parseInt(localStorage.getItem("idCiudad"), 10)}
				, () => {
					localStorage.removeItem("idCiudad");
					if("nombreCiudad" in localStorage) {
						this.setState({nombreCiudad: localStorage.getItem("nombreCiudad")});
						localStorage.removeItem("nombreCiudad");
					}
				});
			}
		}
		this.setState({
			loading: false
		});
	}

	render() {
		const loading = this.state.loading;
		const idDepartamento = this.state.idDepartamento;
		const idCiudad = this.state.idCiudad;
		const nombreDepartamento = this.state.nombreDepartamento;
		const nombreCiudad = this.state.nombreCiudad;
		return (
			<div className="Home">
				{
					loading ?
					<Loading />
					:
					<Container>
						<Row>
							<Col xs="12" md="3">
								<Breadcrumb>
									<BreadcrumbItem active>Home</BreadcrumbItem>
								</Breadcrumb>
							</Col>
						</Row>
						<Row>
							<Col xs="12" md="3">
								<Depatamentos notificar={true} handleEventClick={this.handleDepartamentosClick} />
								<br />
								<Ciudades idDepartamento={idDepartamento} notificar={true} handleEventClick={this.handleCiudadesClick} />
							</Col>
							<Col xs="12" md="9">
								<Row>
									<Col xs="9">
										<Breadcrumb>
											<BreadcrumbItem>{nombreDepartamento}</BreadcrumbItem>
											<BreadcrumbItem>{nombreCiudad}</BreadcrumbItem>
										</Breadcrumb>
									</Col>
									<Col xs="3" style={{textAlign: "right"}}>
										<Link to="/nuevo" className="btn btn-warning btn-lg">
											<i className="far fa-newspaper"></i>
										</Link>
									</Col>
								</Row>
								<Row>
									<Col>
										<Guias idCiudad={idCiudad} />
									</Col>
								</Row>
							</Col>
						</Row>
					</Container>
				}
			</div>
		);
	}
}

export default Home;
