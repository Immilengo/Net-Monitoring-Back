/**
 * @swagger
 * tags:
 *   name: Devices
 *   description: >
 *     Gestão de dispositivos de rede monitorizados.
 *     Cada dispositivo tem um endereço IP único, um tipo (ROUTER, SWITCH, SERVER, etc.)
 *     e um status de monitoramento actualizado automaticamente pelo scheduler a cada ciclo.
 *     Também suporta modo manual para apresentações e testes: quando activo, o scheduler
 *     continua a registar logs mas não sobrescreve o status actual do device.
 */

/**
 * @swagger
 * /api/devices:
 *   post:
 *     tags: [Devices]
 *     summary: Registar dispositivo
 *     description: >
 *       Regista um novo dispositivo para ser monitorizado.
 *       O endereço IP deve ser único no sistema.
 *       O dispositivo é criado com status `OFFLINE` em modo automático — o scheduler actualizará o status
 *       na próxima verificação (por defeito a cada 2 minutos).
 *       Se `siteId` for fornecido, o site deve existir e estar activo.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDeviceRequest'
 *           examples:
 *             switch:
 *               summary: Switch de rede
 *               value:
 *                 name: Core Switch 01
 *                 hostname: core-sw-01.local
 *                 ipAddress: 192.168.1.1
 *                 macAddress: "AA:BB:CC:DD:EE:FF"
 *                 type: SWITCH
 *                 description: Switch principal do piso 1
 *                 siteId: "b2c3d4e5-f6a7-8901-bcde-f12345678901"
 *             server:
 *               summary: Servidor sem site
 *               value:
 *                 name: Web Server 01
 *                 ipAddress: 10.0.0.5
 *                 type: SERVER
 *     responses:
 *       201:
 *         description: Dispositivo registado com sucesso. Status inicial é OFFLINE.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/DeviceOutput'
 *       400:
 *         description: IP inválido ou campos obrigatórios em falta
 *       404:
 *         description: Site não encontrado
 *       409:
 *         description: Já existe um dispositivo com este endereço IP
 *
 *   get:
 *     tags: [Devices]
 *     summary: Listar dispositivos
 *     description: >
 *       Devolve lista paginada de dispositivos com filtros avançados.
 *       Combinando `siteId` + `currentStatus` + `type` consegues segmentar
 *       facilmente a vista — ex: todos os servidores offline na sede principal.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, ipAddress, type, currentStatus, createdAt, updatedAt]
 *           default: createdAt
 *       - in: query
 *         name: direction
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: recordStatus
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, ALL]
 *           default: ACTIVE
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Pesquisa por nome, hostname, IP ou descrição
 *       - in: query
 *         name: siteId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por site
 *       - in: query
 *         name: type
 *         schema:
 *           $ref: '#/components/schemas/DeviceType'
 *         description: Filtrar por tipo de dispositivo
 *       - in: query
 *         name: currentStatus
 *         schema:
 *           $ref: '#/components/schemas/MonitoringStatus'
 *         description: Filtrar por status actual (ONLINE/OFFLINE/WARNING)
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo/inactivo
 *     responses:
 *       200:
 *         description: Lista paginada de dispositivos
 */

/**
 * @swagger
 * /api/devices/{id}:
 *   get:
 *     tags: [Devices]
 *     summary: Buscar dispositivo por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Dispositivo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/DeviceOutput'
 *       404:
 *         description: Dispositivo não encontrado
 *
 *   patch:
 *     tags: [Devices]
 *     summary: Editar dispositivo
 *     description: >
 *       Actualiza parcialmente um dispositivo. Para desassociar um device de um site,
 *       enviar `"siteId": null` explicitamente.
 *       Para forçar um status manual, enviar `currentStatus` e `statusSource: MANUAL`.
 *       Para voltar ao modo automático, enviar `statusSource: AUTO`.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateDeviceRequest'
 *           examples:
 *             mover_site:
 *               summary: Mover device para outro site
 *               value:
 *                 siteId: "novo-site-uuid"
 *             desassociar_site:
 *               summary: Remover associação a site
 *               value:
 *                 siteId: null
 *             desactivar:
 *               summary: Desactivar monitoramento temporário
 *               value:
 *                 active: false
 *     responses:
 *       200:
 *         description: Dispositivo actualizado
 *       409:
 *         description: IP já em uso por outro dispositivo
 *
 *   delete:
 *     tags: [Devices]
 *     summary: Desactivar dispositivo (soft delete)
 *     description: >
 *       Remove o dispositivo do monitoramento activo. O scheduler ignorará
 *       dispositivos com `deleted: true`. Os logs e alertas históricos são preservados.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Dispositivo removido do monitoramento
 */

/**
 * @swagger
 * /api/devices/{id}/restore:
 *   patch:
 *     tags: [Devices]
 *     summary: Restaurar dispositivo
 *     description: >
 *       Reactiva um dispositivo previamente desactivado.
 *       O dispositivo volta a ser incluído no ciclo de monitoramento automaticamente.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Dispositivo reactivado com sucesso
 *       400:
 *         description: Dispositivo já está activo
 */

export {};
