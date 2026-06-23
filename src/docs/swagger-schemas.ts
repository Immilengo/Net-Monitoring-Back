/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: >
 *         Token JWT obtido no endpoint POST /api/auth/login.
 *         Enviar no header como: Authorization: Bearer {token}
 *
 *   schemas:
 *
 *     # -----------------------------------------------------------------------
 *     # PAGINAÇÃO
 *     # -----------------------------------------------------------------------
 *     PageMeta:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           example: 0
 *         size:
 *           type: integer
 *           example: 10
 *         total:
 *           type: integer
 *           example: 42
 *         totalPages:
 *           type: integer
 *           example: 5
 *
 *     # -----------------------------------------------------------------------
 *     # RESPOSTAS GENÉRICAS
 *     # -----------------------------------------------------------------------
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Operation completed successfully
 *         data:
 *           type: object
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: Resource not found
 *         statusCode:
 *           type: integer
 *           example: 404
 *
 *     ValidationErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "name: Name must have at least 2 characters"
 *         statusCode:
 *           type: integer
 *           example: 400
 *
 *     # -----------------------------------------------------------------------
 *     # ENUMS
 *     # -----------------------------------------------------------------------
 *     DeviceType:
 *       type: string
 *       enum: [ROUTER, SWITCH, SERVER, FIREWALL, ACCESS_POINT, CAMERA, PRINTER, WORKSTATION, NAS, OTHER]
 *
 *     MonitoringStatus:
 *       type: string
 *       enum: [ONLINE, OFFLINE, WARNING]
 *
 *     StatusSource:
 *       type: string
 *       enum: [AUTO, MANUAL]
 *
 *     AlertLevel:
 *       type: string
 *       enum: [INFO, WARNING, CRITICAL]
 *
 *     ServiceType:
 *       type: string
 *       enum: [HTTP, HTTPS, SSH, DNS, MYSQL, POSTGRESQL, SMTP, SMIME, FTP, TCP]
 *
 *     # -----------------------------------------------------------------------
 *     # AUTH
 *     # -----------------------------------------------------------------------
 *     LoginRequest:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: admin@sistema.ao
 *         password:
 *           type: string
 *           format: password
 *           example: "Admin@123"
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         refreshToken:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         user:
 *           $ref: '#/components/schemas/UserOutput'
 *
 *     RegisterRequest:
 *       type: object
 *       required: [name, email, password]
 *       properties:
 *         name:
 *           type: string
 *           example: João Silva
 *         email:
 *           type: string
 *           format: email
 *           example: joao@empresa.ao
 *         password:
 *           type: string
 *           format: password
 *           example: "Senha@123"
 *           description: Mínimo 8 caracteres, deve conter maiúscula, minúscula, número e símbolo
 *
 *     RefreshTokenRequest:
 *       type: object
 *       required: [refreshToken]
 *       properties:
 *         refreshToken:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 *     ResetPasswordRequest:
 *       type: object
 *       required: [token, password]
 *       properties:
 *         token:
 *           type: string
 *           example: "abc123reset"
 *         password:
 *           type: string
 *           format: password
 *           example: "NovaSenha@456"
 *
 *     # -----------------------------------------------------------------------
 *     # USER
 *     # -----------------------------------------------------------------------
 *     UserOutput:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *         name:
 *           type: string
 *           example: João Silva
 *         email:
 *           type: string
 *           format: email
 *           example: joao@empresa.ao
 *         emailVerified:
 *           type: boolean
 *           example: true
 *         active:
 *           type: boolean
 *           example: true
 *         roles:
 *           type: array
 *           items:
 *             type: string
 *           example: ["ADMIN"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateUserRequest:
 *       type: object
 *       required: [name, email, password]
 *       properties:
 *         name:
 *           type: string
 *           example: Maria Santos
 *         email:
 *           type: string
 *           format: email
 *           example: maria@empresa.ao
 *         password:
 *           type: string
 *           format: password
 *           example: "Senha@123"
 *         roles:
 *           type: array
 *           items:
 *             type: string
 *           example: ["MANAGER"]
 *
 *     UpdateUserRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: Maria Santos
 *         email:
 *           type: string
 *           format: email
 *         active:
 *           type: boolean
 *
 *     # -----------------------------------------------------------------------
 *     # SITE
 *     # -----------------------------------------------------------------------
 *     SiteOutput:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "b2c3d4e5-f6a7-8901-bcde-f12345678901"
 *         name:
 *           type: string
 *           example: Sede Luanda
 *         address:
 *           type: string
 *           nullable: true
 *           example: Rua da Missão, nº 10
 *         city:
 *           type: string
 *           nullable: true
 *           example: Luanda
 *         country:
 *           type: string
 *           nullable: true
 *           example: Angola
 *         description:
 *           type: string
 *           nullable: true
 *           example: Escritório principal da empresa
 *         deleted:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateSiteRequest:
 *       type: object
 *       required: [name]
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           example: Sede Luanda
 *         address:
 *           type: string
 *           example: Rua da Missão, nº 10
 *         city:
 *           type: string
 *           example: Luanda
 *         country:
 *           type: string
 *           example: Angola
 *         description:
 *           type: string
 *           example: Escritório principal
 *
 *     UpdateSiteRequest:
 *       type: object
 *       description: Pelo menos um campo deve ser enviado
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *         address:
 *           type: string
 *         city:
 *           type: string
 *         country:
 *           type: string
 *         description:
 *           type: string
 *
 *     # -----------------------------------------------------------------------
 *     # DEVICE
 *     # -----------------------------------------------------------------------
 *     DeviceSiteOutput:
 *       type: object
 *       nullable: true
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: Sede Luanda
 *         city:
 *           type: string
 *           nullable: true
 *         country:
 *           type: string
 *           nullable: true
 *
 *     DeviceOutput:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "c3d4e5f6-a7b8-9012-cdef-123456789012"
 *         name:
 *           type: string
 *           example: Core Switch 01
 *         hostname:
 *           type: string
 *           nullable: true
 *           example: core-sw-01.local
 *         ipAddress:
 *           type: string
 *           example: 192.168.1.1
 *         macAddress:
 *           type: string
 *           nullable: true
 *           example: "AA:BB:CC:DD:EE:FF"
 *         type:
 *           $ref: '#/components/schemas/DeviceType'
 *         description:
 *           type: string
 *           nullable: true
 *         currentStatus:
 *           $ref: '#/components/schemas/MonitoringStatus'
 *         statusSource:
 *           $ref: '#/components/schemas/StatusSource'
 *         active:
 *           type: boolean
 *           example: true
 *         deleted:
 *           type: boolean
 *           example: false
 *         site:
 *           $ref: '#/components/schemas/DeviceSiteOutput'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateDeviceRequest:
 *       type: object
 *       required: [name, ipAddress, type]
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           example: Core Switch 01
 *         hostname:
 *           type: string
 *           example: core-sw-01.local
 *         ipAddress:
 *           type: string
 *           example: 192.168.1.1
 *           description: Endereço IPv4 válido. Deve ser único no sistema.
 *         macAddress:
 *           type: string
 *           example: "AA:BB:CC:DD:EE:FF"
 *         type:
 *           $ref: '#/components/schemas/DeviceType'
 *         description:
 *           type: string
 *         siteId:
 *           type: string
 *           format: uuid
 *           description: ID do site onde o dispositivo está localizado (opcional)
 *
 *     UpdateDeviceRequest:
 *       type: object
 *       description: Pelo menos um campo deve ser enviado
 *       properties:
 *         name:
 *           type: string
 *         hostname:
 *           type: string
 *         ipAddress:
 *           type: string
 *         macAddress:
 *           type: string
 *         type:
 *           $ref: '#/components/schemas/DeviceType'
 *         description:
 *           type: string
 *         siteId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: Enviar null para desassociar o device do site actual
 *         active:
 *           type: boolean
 *         statusSource:
 *           $ref: '#/components/schemas/StatusSource'
 *
 *     # -----------------------------------------------------------------------
 *     # SERVICE MONITOR
 *     # -----------------------------------------------------------------------
 *     ServiceMonitorDeviceOutput:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: Web Server 01
 *         ipAddress:
 *           type: string
 *           example: 192.168.1.10
 *
 *     ServiceMonitorOutput:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: HTTP Monitor
 *         type:
 *           $ref: '#/components/schemas/ServiceType'
 *         port:
 *           type: integer
 *           example: 80
 *         enabled:
 *           type: boolean
 *           example: true
 *         timeoutSeconds:
 *           type: integer
 *           example: 5
 *         device:
 *           $ref: '#/components/schemas/ServiceMonitorDeviceOutput'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateServiceMonitorRequest:
 *       type: object
 *       required: [deviceId, name, type, port]
 *       properties:
 *         deviceId:
 *           type: string
 *           format: uuid
 *           description: ID do dispositivo ao qual este serviço pertence
 *           example: "c3d4e5f6-a7b8-9012-cdef-123456789012"
 *         name:
 *           type: string
 *           minLength: 2
 *           example: HTTP Monitor
 *         type:
 *           $ref: '#/components/schemas/ServiceType'
 *         port:
 *           type: integer
 *           minimum: 1
 *           maximum: 65535
 *           example: 80
 *         enabled:
 *           type: boolean
 *           default: true
 *         timeoutSeconds:
 *           type: integer
 *           minimum: 1
 *           maximum: 60
 *           default: 5
 *           description: Segundos até considerar o serviço como não respondente
 *
 *     UpdateServiceMonitorRequest:
 *       type: object
 *       description: Pelo menos um campo deve ser enviado
 *       properties:
 *         name:
 *           type: string
 *         type:
 *           $ref: '#/components/schemas/ServiceType'
 *         port:
 *           type: integer
 *           minimum: 1
 *           maximum: 65535
 *         enabled:
 *           type: boolean
 *         timeoutSeconds:
 *           type: integer
 *           minimum: 1
 *           maximum: 60
 *
 *     # -----------------------------------------------------------------------
 *     # ALERT
 *     # -----------------------------------------------------------------------
 *     AlertDeviceOutput:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: Core Switch 01
 *         ipAddress:
 *           type: string
 *           example: 192.168.1.1
 *
 *     AlertOutput:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *           example: "Device offline: Core Switch 01"
 *         message:
 *           type: string
 *           example: "Device Core Switch 01 (192.168.1.1) stopped responding to ping."
 *         level:
 *           $ref: '#/components/schemas/AlertLevel'
 *         acknowledged:
 *           type: boolean
 *           example: false
 *         acknowledgedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         acknowledgedBy:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID do utilizador que fez o acknowledge
 *         resolved:
 *           type: boolean
 *           example: false
 *         resolvedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         device:
 *           $ref: '#/components/schemas/AlertDeviceOutput'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     AlertSummaryOutput:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 7
 *           description: Total de alertas não resolvidos
 *         critical:
 *           type: integer
 *           example: 3
 *         warning:
 *           type: integer
 *           example: 4
 *         info:
 *           type: integer
 *           example: 0
 *
 *     # -----------------------------------------------------------------------
 *     # MONITORING LOG
 *     # -----------------------------------------------------------------------
 *     MonitoringLogDeviceOutput:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: Core Switch 01
 *         ipAddress:
 *           type: string
 *           example: 192.168.1.1
 *         siteId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         siteName:
 *           type: string
 *           nullable: true
 *           example: Sede Luanda
 *
 *     MonitoringLogOutput:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         status:
 *           $ref: '#/components/schemas/MonitoringStatus'
 *         responseTime:
 *           type: integer
 *           nullable: true
 *           example: 12
 *           description: Tempo de resposta em milissegundos
 *         packetLoss:
 *           type: number
 *           nullable: true
 *           example: 0
 *           description: Percentagem de pacotes perdidos (0-100)
 *         message:
 *           type: string
 *           nullable: true
 *           example: null
 *         checkedAt:
 *           type: string
 *           format: date-time
 *         device:
 *           $ref: '#/components/schemas/MonitoringLogDeviceOutput'
 *
 *     MonitoringLogStatsOutput:
 *       type: object
 *       properties:
 *         deviceId:
 *           type: string
 *           format: uuid
 *         deviceName:
 *           type: string
 *           example: Core Switch 01
 *         deviceIp:
 *           type: string
 *           example: 192.168.1.1
 *         totalChecks:
 *           type: integer
 *           example: 720
 *         onlineCount:
 *           type: integer
 *           example: 695
 *         offlineCount:
 *           type: integer
 *           example: 22
 *         warningCount:
 *           type: integer
 *           example: 3
 *         uptimePercent:
 *           type: number
 *           example: 96.53
 *           description: Percentagem de uptime no período analisado
 *         avgResponseTime:
 *           type: integer
 *           nullable: true
 *           example: 12
 *           description: Tempo médio de resposta em ms
 *         avgPacketLoss:
 *           type: number
 *           nullable: true
 *           example: 0.8
 *         period:
 *           type: object
 *           properties:
 *             from:
 *               type: string
 *               format: date-time
 *             to:
 *               type: string
 *               format: date-time
 *
 *     # -----------------------------------------------------------------------
 *     # DASHBOARD
 *     # -----------------------------------------------------------------------
 *     DashboardDeviceSummary:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 24
 *         online:
 *           type: integer
 *           example: 18
 *         offline:
 *           type: integer
 *           example: 4
 *         warning:
 *           type: integer
 *           example: 2
 *
 *     DashboardTopUnreachable:
 *       type: object
 *       properties:
 *         deviceId:
 *           type: string
 *           format: uuid
 *         deviceName:
 *           type: string
 *           example: Core Switch 01
 *         deviceIp:
 *           type: string
 *           example: 192.168.1.1
 *         failureCount:
 *           type: integer
 *           example: 14
 *           description: Número de falhas nas últimas 24 horas
 *
 *     DashboardSummaryOutput:
 *       type: object
 *       properties:
 *         devices:
 *           $ref: '#/components/schemas/DashboardDeviceSummary'
 *         alerts:
 *           $ref: '#/components/schemas/AlertSummaryOutput'
 *         devicesByType:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 $ref: '#/components/schemas/DeviceType'
 *               total:
 *                 type: integer
 *         recentAlerts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AlertOutput'
 *         recentLogs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MonitoringLogOutput'
 *         topUnreachable:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DashboardTopUnreachable'
 *         generatedAt:
 *           type: string
 *           format: date-time
 */

export {};
