import React from 'react';
import { Container, Button, Alert } from 'react-bootstrap';
import Header from '../components/layout/Header'; // Suponiendo que tienes un Header

const HomePage = () => {
  return (
    <>
      <Header />
      <Container className="mt-4">
        <Alert variant="success">
          ¡Bienvenido a Car Store!
        </Alert>
        <h1>Elige el auto de tus sueños</h1>
        <p>
          Explora nuestro catálogo para encontrar las mejores marcas y modelos.
        </p>
        <Button variant="primary">Ver catálogo</Button>
      </Container>
    </>
  );
};

export default HomePage;