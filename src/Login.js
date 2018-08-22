import React, { Component } from "react";

class Login extends Component {
	constructor(props) {
		super(props);
		this.state = {
			error: false,
			dataForm: {
				email: "hansjal@gmail.com",
				password: "quilmes"
			}
		};
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	handleSubmit = (event) => {
		event.preventDefault();
		fetch(`${process.env.REACT_APP_URL_API_SERVER_2}/user/login`, {
			headers: new Headers({
				"Content-Type": "application/json"
			}),
			method: "POST",
			body: JSON.stringify(this.state.dataForm)
		})
		.then(res => {
			if(res.ok && res.status === 200) {
				res.json().then((data) => {
					if(data.err) {
						this.setState({
							error: true
						});
					} else {
						localStorage.setItem("WebTurId", data.data.id);
						localStorage.setItem("WebTurIdTipo", data.data.idtipo);
						localStorage.setItem("WebTurNombre", data.data.nombre);
						localStorage.setItem("WebTurToken", data.data.token);
						this.props.ok();
					}
				});
			} else {
				this.setState({
					error: true
				});
			}
		});
	}

	handleChange = (event) => {
		if(this.state.error) {
			this.setState({error: false});
		}
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
				<div className="container" style={{height: "100vh"}}>
					<div className="row pt-5 align-items-center">
						<div className="col">
							<div className="d-flex justify-content-center mb-4">
								<img src={`${process.env.REACT_APP_URL_API_SERVER_2}/imgs/LogoSisTur2.svg`} alt="SisTur" />
							</div>
							<div className="text-white p-4 rounded mx-auto" style={{width: "350px"}}>
								<div className="mx-auto bg-white text-dark cincuenta mb-4">
									<i className="fas fa-question text-info"></i>
								</div>
								<div>
									<form onSubmit={this.handleSubmit} autocomplete="off">
										<div className="form-group">
											<label for="email">Email</label>
											<input type="email" name="email" id="email" className="form-control" placeholder="nombre@ejemplo.com" value={this.state.dataForm.email} onChange={this.handleChange} />
										</div>
										<div className="form-group">
											<label for="password">Contraseña</label>
											<input type="password" name="password" id="password" className="form-control" value={this.state.dataForm.password} onChange={this.handleChange} />
										</div>
										<div className="d-flex justify-content-end">
											<button type="submit" className="btn btn-info mb-2">Confirmar</button>
										</div>
									</form>
								</div>
							</div>
							{
								err ?
								<div>
									<div className="bg-danger pt-4 pb-4 mb-2 mx-auto rounded" style={{width: "350px"}}>
										<div className="text-center text-white">Español: He vo vieja! pone bien lo dedo!</div>
										<div className="text-center text-white">Brasileiro: Voce so un scroto digitando!</div>
										<div className="text-center text-white">Inglish (Indian): Can yu use good teclado?</div>
										<div className="text-center text-white">Russin: Mielden lapen puten madren!</div>
										<div className="text-center text-white">Chino (-.-): <span lang="zh-Hans">你會死的</span></div>
									</div>
									<div className="bg-warning p-4 mx-auto rounded" style={{width: "350px"}}>
										<p className="mb-0 text-center">Si usted no entiende Chino tradicional puede consultar en el supermercado chino de su barrio.</p>
									</div>
								</div>
								:
								""
							}
							
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default Login;
