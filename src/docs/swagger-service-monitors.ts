/**
 * @swagger
 * tags:
 *   name: Service Monitors
 *   description: >
 *     Gestão de serviços TCP monitorizados por dispositivo.
 *     Um service monitor define um serviço específico (HTTP, SSH, DNS, etc.) numa porta
 *     de um dispositivo que o scheduler verifica periodicamente via TCP handshake.
 *     Um mesmo dispositivo pode ter múltiplos serviços monitorizados em portas diferentes,
 *     mas não pode ter dois monitores do mesmo tipo na mesma porta.
 */

/**
 * @swagger
 * /api/service-monitors:
 *   post:
 *     tags: [Service Monitors]
 *     summary: Criar monitor de serviço
 *     description: >
 *       Associa um serviço TCP a um dispositivo para ser monitorizado.
 *       O scheduler verificará periodicamente se a porta responde ao handshake TCP.
 *
 *       **Portas padrão por tipo de serviço:**
 *       | Tipo | Porta padrão |
 *       |------|-------------|
 *       | HTTP | 80 |
 *       | HTTPS | 443 |
 *       | SSH | 22 |
 *       | DNS | 53 |
 *       | MYSQL | 3306 |
 *       | POSTGRESQL | 5432 |
 *       | SMTP | 25 |
 *       | FTP | 21 |
 *
 *       Podes usar uma porta não padrão (ex: HTTP na porta 8080) — o campo `port` é livre.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateServiceMonitorRequest'
 *           examples:
 *             http:
 *               summary: Monitor HTTP padrão
 *               value:
 *                 deviceId: "c3d4e5f6-a7b8-9012-cdef-123456789012"
 *                 name: HTTP Monitor
 *                 type: HTTP
 *                 port: 80
 *                 enabled: true
 *                 timeoutSeconds: 5
 *             ssh_personalizado:
 *               summary: SSH em porta não padrão
 *               value:
 *                 deviceId: "c3d4e5f6-a7b8-9012-cdef-123456789012"
 *                 name: SSH Seguro
 *                 type: SSH
 *                 port: 2222
 *                 timeoutSeconds: 10
 *     responses:
 *       201:
 *         description: Monitor de serviço criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ServiceMonitorOutput'
 *       404:
 *         description: Dispositivo não encontrado
 *       409:
 *         description: Este dispositivo já tem um monitor deste tipo nesta porta
 *
 *   get:
 *     tags: [Service Monitors]
 *     summary: Listar monitores de serviço
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
 *           enum: [name, type, port, createdAt, updatedAt]
 *       - in: query
 *         name: direction
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: deviceId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por dispositivo
 *       - in: query
 *         name: type
 *         schema:
 *           $ref: '#/components/schemas/ServiceType'
 *       - in: query
 *         name: enabled
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo/inactivo
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista paginada de monitores de serviço
 */

/**
 * @swagger
 * /api/service-monitors/device/{deviceId}:
 *   get:
 *     tags: [Service Monitors]
 *     summary: Listar serviços activos de um dispositivo
 *     description: >
 *       Devolve todos os monitores de serviço **habilitados** de um dispositivo específico.
 *       Útil para renderizar o painel de detalhes de um dispositivo no frontend.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de serviços activos do dispositivo
 *       404:
 *         description: Dispositivo não encontrado
 */

/**
 * @swagger
 * /api/service-monitors/{id}:
 *   get:
 *     tags: [Service Monitors]
 *     summary: Buscar monitor por ID
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
 *         description: Monitor encontrado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ServiceMonitorOutput'
 *       404:
 *         description: Monitor não encontrado
 *
 *   patch:
 *     tags: [Service Monitors]
 *     summary: Editar monitor de serviço
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
 *             $ref: '#/components/schemas/UpdateServiceMonitorRequest'
 *     responses:
 *       200:
 *         description: Monitor actualizado
 *       409:
 *         description: Conflito de tipo/porta no mesmo dispositivo
 *
 *   delete:
 *     tags: [Service Monitors]
 *     summary: Remover monitor de serviço
 *     description: >
 *       Remove o monitor permanentemente (hard delete).
 *       Os logs históricos associados a este serviço são preservados em `MonitoringLog`.
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
 *         description: Monitor removido com sucesso
 */

/**
 * @swagger
 * /api/service-monitors/{id}/toggle:
 *   patch:
 *     tags: [Service Monitors]
 *     summary: Activar / desactivar monitor
 *     description: >
 *       Alterna o estado `enabled` do monitor sem precisar editar o registo completo.
 *       Quando desactivado, o scheduler ignora este serviço no próximo ciclo.
 *       Útil para suspender temporariamente a verificação de um serviço em manutenção.
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
 *         description: Estado do monitor alternado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ServiceMonitorOutput'
 */

export {};