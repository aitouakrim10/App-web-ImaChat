const swaggerAutogen = require('swagger-autogen')()

const outputFile = 'swagger_output.json'
const endpointsFiles = ['src/routes/user.js', 'src/routes/router.js']

swaggerAutogen(outputFile, endpointsFiles, {
  securityDefinitions: {
    apiKeyAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'x-access-token',
      description: 'Token jwt de l utlisateur'
    }
  }
})
