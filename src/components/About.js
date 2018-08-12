import React from "react";
import { Container, Row, Col } from "reactstrap";

const About = () => {
	return(
		<Container>
			<Row className="justify-content-center mb-4 rounded shadow">
				<Col>
					<h1 className="text-info">Turismo S.L. - Sistema de Fiscalización.</h1>
					<p>Preview de presentación del software.</p>
					<p>Araujo Lucero Hans Jorge</p>
					<p>hansjal@gmail.com</p>
					<p>2657 335514</p>
				</Col>
			</Row>
		</Container>
	);
}

export default About;