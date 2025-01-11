const express = require('express');
const https = require('https');
const fs = require('fs'); // Pour lire les fichiers de certificat
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
// const userRoutes = require('./routes/user.routes');
const livestreamRoutes = require('./routes/livestream.routes');
const vodRoutes = require('./routes/vod.routes');
const { errorHandler } = require('./middleware/error.middleware');
const { verifyCloudinaryConfig } = require('./config/cloudinary');

const app = express();

// Middleware de base
app.use(cors());

// Configuration personnalisée de Helmet pour Swagger UI
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"]
      }
    }
  })
);

app.use(express.json());

// Configuration Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API B-Live',
      version: '1.0.0',
      description: 'Documentation de l\'API de streaming B-Live',
      contact: {
        name: 'Support API'
      }
    },
    servers: [
      {
        // url: 'http://146.190.175.116',
        url: 'http://localhost',
        description: 'Serveur API'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'viewer'] }
          }
        },
        Livestream: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            contentId: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['scheduled', 'live', 'ended'] },
            startTime: { type: 'string', format: 'date-time' },
            endTime: { type: 'string', format: 'date-time' }
          }
        },
        VOD: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            contentId: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            url: { type: 'string' },
            duration: { type: 'number' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Configuration de Swagger UI avec options personnalisées
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerDocs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "API Documentation - B-Live",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showCommonExtensions: true
  }
}));

// Routes de l'API
app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
app.use('/api/livestreams', livestreamRoutes);
app.use('/api/vods', vodRoutes);

// Middleware de gestion d'erreurs
app.use(errorHandler);

// Configuration HTTPS
const options = {
  key: fs.readFileSync('ssl-key.pem'),   // Clé privée
  cert: fs.readFileSync('ssl-cert.pem')  // Certificat SSL
};

const server = https.createServer(options, app);

// Utilisez une variable d'environnement pour l'adresse IP
const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 3000;

// Vérifier la configuration Cloudinary avant de démarrer le serveur
verifyCloudinaryConfig().then(() => {
  server.listen(PORT, HOST, () => {
    console.log(`Le serveur HTTPS a démarré sur https://${HOST}:${PORT}`);
    console.log(`Documentation de l'API disponible sur https://${HOST}:${PORT}/api-docs`);
  });
}).catch(error => {
  console.error('Erreur lors du démarrage du serveur:', error);
  process.exit(1);
});

// const port = 80;

// app.listen(port, () => {
//   console.log('Express server démarré sur le port '  + port);
// });