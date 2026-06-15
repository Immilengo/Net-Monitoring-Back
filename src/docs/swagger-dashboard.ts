/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: >
 *     Endpoints de agregação para alimentar o painel principal do sistema.
 *     Não há escrita aqui — apenas leitura consolidada de dados de múltiplas tabelas.
 *     Recomendação de uso no frontend:
 *     - Ao carregar a página: chamar `/summary` para preencher o dashboard completo.
 *     - A cada 30 segundos: chamar `/counters` para actualizar badges e indicadores sem re-renderizar listas.
 */

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     tags: [Dashboard]
 *     summary: Sumário completo do sistema
 *     description: >
 *       Devolve numa única resposta todos os dados necessários para renderizar o dashboard principal:
 *       - Contagem de dispositivos por status (online/offline/warning)
 *       - Contagem de alertas activos por nível (critical/warning/info)
 *       - Distribuição de dispositivos por tipo (quantos routers, servidores, switches, etc.)
 *       - Últimos 10 alertas não resolvidos (mais recentes primeiro)
 *       - Últimas 20 verificações de monitoramento (log mais recente)
 *       - Top 5 dispositivos com mais falhas nas últimas 24 horas
 *
 *       Todas as queries são executadas **em paralelo** — a latência é a da query mais lenta, não a soma de todas.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sumário completo do sistema
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/DashboardSummaryOutput'
 *             example:
 *               success: true
 *               message: Dashboard summary retrieved successfully
 *               data:
 *                 devices:
 *                   total: 24
 *                   online: 18
 *                   offline: 4
 *                   warning: 2
 *                 alerts:
 *                   total: 7
 *                   critical: 3
 *                   warning: 4
 *                   info: 0
 *                 devicesByType:
 *                   - type: SERVER
 *                     total: 8
 *                   - type: SWITCH
 *                     total: 6
 *                   - type: ROUTER
 *                     total: 4
 *                 recentAlerts:
 *                   - id: "uuid"
 *                     title: "Device offline: Core Switch 01"
 *                     level: CRITICAL
 *                     acknowledged: false
 *                     resolved: false
 *                     deviceName: Core Switch 01
 *                     deviceIp: 192.168.1.1
 *                     createdAt: "2026-06-15T10:30:00.000Z"
 *                 topUnreachable:
 *                   - deviceId: "uuid"
 *                     deviceName: Core Switch 01
 *                     deviceIp: 192.168.1.1
 *                     failureCount: 14
 *                 generatedAt: "2026-06-15T10:30:00.000Z"
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */

/**
 * @swagger
 * /api/dashboard/counters:
 *   get:
 *     tags: [Dashboard]
 *     summary: Contadores leves para polling
 *     description: >
 *       Versão leve do summary — devolve apenas os contadores de devices e alertas,
 *       sem listas de logs nem alertas detalhados.
 *       Desenhado para polling frequente do frontend (a cada 30 segundos por exemplo)
 *       para manter os indicadores de status actualizados com baixo custo de rede e base de dados.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contadores actualizados
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
 *                         devices:
 *                           $ref: '#/components/schemas/DashboardDeviceSummary'
 *                         alerts:
 *                           $ref: '#/components/schemas/AlertSummaryOutput'
 *                         generatedAt:
 *                           type: string
 *                           format: date-time
 */

export {};