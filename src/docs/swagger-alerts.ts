/**
 * @swagger
 * tags:
 *   name: Alerts
 *   description: >
 *     Gestão de alertas gerados automaticamente pelo motor de monitoramento.
 *     Os alertas **nunca são criados manualmente** — são gerados pelo scheduler quando:
 *     - Um dispositivo passa de ONLINE para OFFLINE → alerta CRITICAL
 *     - Um serviço TCP não responde → alerta WARNING
 *     - Um dispositivo volta ONLINE → alertas CRITICAL abertos são resolvidos automaticamente
 *
 *     **Ciclo de vida de um alerta:**
 *     `ABERTO` → `ACKNOWLEDGED` (reconhecido por um operador) → `RESOLVED` (problema resolvido)
 *
 *     O acknowledge serve para indicar que alguém tomou conhecimento do problema.
 *     O resolve indica que o problema foi efectivamente corrigido.
 */

/**
 * @swagger
 * /api/alerts:
 *   get:
 *     tags: [Alerts]
 *     summary: Listar alertas
 *     description: >
 *       Devolve lista paginada de alertas com filtros avançados.
 *       Para ver apenas alertas activos pendentes: `resolved=false`.
 *       Para ver alertas críticos não reconhecidos: `level=CRITICAL&acknowledged=false`.
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
 *           enum: [level, createdAt, updatedAt]
 *           default: createdAt
 *       - in: query
 *         name: direction
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: deviceId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar alertas de um dispositivo específico
 *       - in: query
 *         name: level
 *         schema:
 *           $ref: '#/components/schemas/AlertLevel'
 *         description: Filtrar por nível de gravidade
 *       - in: query
 *         name: acknowledged
 *         schema:
 *           type: boolean
 *         description: "false = por reconhecer | true = já reconhecidos"
 *       - in: query
 *         name: resolved
 *         schema:
 *           type: boolean
 *         description: "false = activos | true = resolvidos"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Pesquisa no título, mensagem ou nome do dispositivo
 *     responses:
 *       200:
 *         description: Lista paginada de alertas
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         items:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/AlertOutput'
 *                         meta:
 *                           $ref: '#/components/schemas/PageMeta'
 */

/**
 * @swagger
 * /api/alerts/summary:
 *   get:
 *     tags: [Alerts]
 *     summary: Sumário de alertas activos
 *     description: >
 *       Devolve contagem de alertas não resolvidos agrupados por nível.
 *       Endpoint leve para alimentar badges e indicadores no header do dashboard.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contagem de alertas por nível
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AlertSummaryOutput'
 */

/**
 * @swagger
 * /api/alerts/{id}:
 *   get:
 *     tags: [Alerts]
 *     summary: Buscar alerta por ID
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
 *         description: Alerta encontrado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AlertOutput'
 *       404:
 *         description: Alerta não encontrado
 */

/**
 * @swagger
 * /api/alerts/{id}/acknowledge:
 *   patch:
 *     tags: [Alerts]
 *     summary: Reconhecer alerta (acknowledge)
 *     description: >
 *       Marca o alerta como reconhecido, indicando que um operador tomou conhecimento do problema.
 *       Regista o ID do utilizador que fez o acknowledge e o timestamp.
 *       O alerta continua activo (não resolvido) — apenas muda o estado de `acknowledged`.
 *       Um alerta já reconhecido não pode ser re-reconhecido (retorna erro 400).
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
 *         description: Alerta reconhecido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AlertOutput'
 *       400:
 *         description: Alerta já foi reconhecido anteriormente
 *       404:
 *         description: Alerta não encontrado
 */

/**
 * @swagger
 * /api/alerts/{id}/resolve:
 *   patch:
 *     tags: [Alerts]
 *     summary: Resolver alerta manualmente
 *     description: >
 *       Marca o alerta como resolvido manualmente por um administrador.
 *       Se o alerta ainda não foi reconhecido, é automaticamente reconhecido ao ser resolvido.
 *       **Nota:** alertas CRITICAL são resolvidos **automaticamente** pelo scheduler quando
 *       o dispositivo volta ONLINE — este endpoint é para resolução manual de casos excepcionais.
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
 *         description: Alerta resolvido com sucesso
 *       400:
 *         description: Alerta já está resolvido
 *       404:
 *         description: Alerta não encontrado
 */

/**
 * @swagger
 * /api/alerts/device/{deviceId}/resolve-all:
 *   patch:
 *     tags: [Alerts]
 *     summary: Resolver todos os alertas de um dispositivo
 *     description: >
 *       Resolve todos os alertas não resolvidos de um dispositivo específico de uma só vez.
 *       Útil após uma manutenção programada onde o dispositivo esteve offline intencionalmente.
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
 *         description: Todos os alertas do dispositivo foram resolvidos
 */

export {};