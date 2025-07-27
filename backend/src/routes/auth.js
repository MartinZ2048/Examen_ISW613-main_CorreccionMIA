// backend/src/routes/auth.js
const express = require('express');
const router = express.Router(); // Usamos express.Router para definir sub-rutas
const axios = require('axios');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client'); // Necesario para interactuar con la DB
const prisma = new PrismaClient(); // Instancia de Prisma aquí

// Variables de entorno de Keycloak
const KEYCLOAK_AUTH_SERVER_URL = process.env.KEYCLOAK_AUTH_SERVER_URL;
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM;
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID;
const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET;

router.post('/login', async (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).json({ message: 'Se requiere nombre de usuario y contraseña.' });
  }

  try {
    const tokenResponse = await axios.post(
      `${KEYCLOAK_AUTH_SERVER_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`,
      new URLSearchParams({
        grant_type: 'password',
        client_id: KEYCLOAK_CLIENT_ID,
        client_secret: KEYCLOAK_CLIENT_SECRET,
        username: login,
        password: password,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, refresh_token } = tokenResponse.data;

    const userProfile = await prisma.usuario.findUnique({
      where: { login: login },
      select: {
        id: true,
        login: true,
        nombre: true,
        apellido1: true,
        email: true,
        tipo: true,
        estado: true,
      }
    });

    if (!userProfile) {
      return res.status(404).json({ message: 'Perfil de usuario no encontrado en la base de datos. Por favor, regístrese primero.' });
    }

    res.json({
      access_token,
      refresh_token,
      user: userProfile,
      message: 'Inicio de sesión exitoso.'
    });

  } catch (error) {
    console.error('Error durante el login:', error.response ? error.response.data : error.message);
    if (error.response && error.response.data && error.response.data.error_description) {
      return res.status(401).json({ message: error.response.data.error_description });
    }
    res.status(500).json({ message: 'Error en el servidor durante el inicio de sesión.' });
  }
});

router.post('/register', async (req, res) => {
  const {
    login,
    password,
    nombre,
    apellido1,
    apellido2,
    email,
    calle,
    numero,
    piso,
    ciudad,
    codigoPostal,
    tipo, // ALUMNO o PROFESOR
    telefonoPadres, // Solo para ALUMNO
    departamento // Solo para PROFESOR
  } = req.body;

  if (!login || !password || !nombre || !apellido1 || !email || !calle || !numero || !ciudad || !codigoPostal || !tipo) {
    return res.status(400).json({ message: 'Faltan campos obligatorios para el registro.' });
  }
  if (tipo === 'ALUMNO' && !telefonoPadres) {
    return res.status(400).json({ message: 'Para ALUMNO, se requiere telefonoPadres.' });
  }
  if (tipo === 'PROFESOR' && !departamento) {
    return res.status(400).json({ message: 'Para PROFESOR, se requiere departamento.' });
  }

  try {
    const adminTokenResponse = await axios.post(
      `${KEYCLOAK_AUTH_SERVER_URL}/realms/master/protocol/openid-connect/token`,
      new URLSearchParams({
        grant_type: 'password',
        client_id: 'admin-cli',
        username: 'admin',
        password: 'admin',
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    const adminAccessToken = adminTokenResponse.data.access_token;

    const createUserResponse = await axios.post(
      `${KEYCLOAK_AUTH_SERVER_URL}/admin/realms/${KEYCLOAK_REALM}/users`,
      {
        username: login,
        email: email,
        firstName: nombre,
        lastName: `${apellido1} ${apellido2 || ''}`,
        enabled: true,
        emailVerified: true,
        credentials: [{
          type: 'password',
          value: password,
          temporary: false,
        }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminAccessToken}`,
        },
      }
    );

    const locationHeader = createUserResponse.headers.location;
    if (!locationHeader) {
      throw new Error('No se encontró el header Location con el ID del usuario en la respuesta de Keycloak.');
    }
    const newKeycloakUserId = locationHeader.substring(locationHeader.lastIndexOf('/') + 1);

    const clientRolesRes = await axios.get(
        `${KEYCLOAK_AUTH_SERVER_URL}/admin/realms/${KEYCLOAK_REALM}/clients`,
        { headers: { Authorization: `Bearer ${adminAccessToken}` } }
    );
    const bibliotecaAppClient = clientRolesRes.data.find(c => c.clientId === KEYCLOAK_CLIENT_ID);

    if (!bibliotecaAppClient) {
        throw new Error(`Cliente Keycloak con ID ${KEYCLOAK_CLIENT_ID} no encontrado.`);
    }

    const clientRolesDef = await axios.get(
        `${KEYCLOAK_AUTH_SERVER_URL}/admin/realms/${KEYCLOAK_REALM}/clients/${bibliotecaAppClient.id}/roles`,
        { headers: { Authorization: `Bearer ${adminAccessToken}` } }
    );

    let roleToAssign = null;
    if (tipo === 'ALUMNO') {
      roleToAssign = clientRolesDef.data.find(role => role.name === 'USER');
    } else if (tipo === 'PROFESOR') {
      roleToAssign = clientRolesDef.data.find(role => role.name === 'ADMIN');
    }

    if (roleToAssign) {
      await axios.post(
        `${KEYCLOAK_AUTH_SERVER_URL}/admin/realms/${KEYCLOAK_REALM}/users/${newKeycloakUserId}/role-mappings/clients/${bibliotecaAppClient.id}`,
        [roleToAssign],
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminAccessToken}`,
          },
        }
      );
      console.log(`Rol ${roleToAssign.name} asignado al nuevo usuario Keycloak: ${newKeycloakUserId}`);
    } else {
      console.warn(`No se encontró un rol adecuado para el tipo de usuario ${tipo}.`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.usuario.create({
      data: {
        login,
        password: hashedPassword,
        nombre,
        apellido1,
        apellido2: apellido2 || '',
        email,
        calle,
        numero,
        piso: piso || null,
        ciudad,
        codigoPostal,
        estado: 'ACTIVO',
        tipo: tipo,
        telefonoPadres: tipo === 'ALUMNO' ? telefonoPadres : null,
        departamento: tipo === 'PROFESOR' ? departamento : null,
      },
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente en Keycloak y en la base de datos.',
      user: {
        id: newUser.id,
        login: newUser.login,
        email: newUser.email,
        tipo: newUser.tipo,
      },
    });

  } catch (error) {
    console.error('Error durante el registro:', error.response ? error.response.data : error.message);
    if (error.response && error.response.status === 409) {
      return res.status(409).json({ message: 'El usuario ya existe en Keycloak.' });
    }
    if (error.response && error.response.status) {
        console.error('Respuesta de error de Keycloak:', error.response.status, error.response.statusText, error.response.data);
    }
    res.status(500).json({ message: 'Error en el servidor durante el registro.' });
  }
});

module.exports = router;