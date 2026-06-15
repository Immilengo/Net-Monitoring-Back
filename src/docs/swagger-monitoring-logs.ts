/**
 * @swagger
 * tags:
 *   name: Monitoring Logs
 *   description: >
 *     Histórico de verificações realizadas pelo scheduler.
 *     Cada registo representa uma verificação pontual de um dispositivo ou serviço:
 *     o resultado (ONLINE/OFFLINE/WARNING), o tempo de resposta em ms, a perda de pacotes
 *     e a timestamp da verificação.
 *     Os logs são gerados automaticamente — nunca são criados ou editados manualmente.
 */

/**
 * @swagger
 * /api/monitoring-logs:
 *   get:
 *     tags: [Monitoring Logs]
 *     summary: Listar histórico de verificações
 *     description: >
 *       Devolve histórico paginado de verificações com filtros avançados.
 *       Para analisar um período específico, usar os parâmetros `from` e `to` em formato ISO 8601.
 *
 *       **Exemplos de uso:**
 *       - Verificações falhadas de hoje: `status=OFFLINE&from=2026-06-15T00:00:00Z`
 *       - Histórico de um device num período: `deviceId={uuid}&from=2026-06-01Z&to=2026-06-15Z`
 *       - Logs de um site específico: `siteId={uuid}&direction=desc`
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
 *           maximum: 200
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [checkedAt, status, responseTime]
 *           default: checkedAt
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
 *         description: Filtrar por dispositivo específico
 *       - in: query
 *         name: siteId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por todos os dispositivos de um site
 *       - in: query
 *         name: status
 *         schema:
 *           $ref: '#/components/schemas/MonitoringStatus'
 *         description: Filtrar por resultado da verificação
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *         description: "Data/hora inicial do período (ex: 2026-06-01T00:00:00Z)"
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *         description: "Data/hora final do período (ex: 2026-06-15T23:59:59Z)"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Pesquisa por nome do device, IP ou mensagem do log
 *     responses:
 *       200:
 *         description: Histórico paginado de verificações
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
 *                             $ref: '#/components/schemas/MonitoringLogOutput'
 *                         meta:
 *                           $ref: '#/components/schemas/PageMeta'
 *       400:
 *         description: Datas inválidas (from posterior a to)
 */

/**
 * @swagger
 * /api/monitoring-logs/stats:
 *   get:
 *     tags: [Monitoring Logs]
 *     summary: Estatísticas de uptime de um dispositivo
 *     description: >
 *       Calcula estatísticas agregadas de disponibilidade de um dispositivo num período.
 *       Se `from` e `to` não forem fornecidos, o período padrão são as **últimas 24 horas**.
 *
 *       **Dados calculados:**
 *       - Total de verificações no período
 *       - Contagem por status (online/offline/warning)
 *       - **Percentagem de uptime** = (verificações online / total) × 100
 *       - Tempo médio de resposta em ms
 *       - Perda média de pacotes em %
 *
 *       **Exemplo para relatório semanal de um device:**
 *       `GET /api/monitoring-logs/stats?deviceId={uuid}&from=2026-06-08Z&to=2026-06-15Z`
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do dispositivo a analisar
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Início do período (default = últimas 24h)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fim do período (default = agora)
 *     responses:
 *       200:
 *         description: Estatísticas de uptime calculadas
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/MonitoringLogStatsOutput'
 *       400:
 *         description: deviceId em falta ou datas inválidas
 */

/**
 * @swagger
 * /api/monitoring-logs/device/{deviceId}/latest:
 *   get:
 *     tags: [Monitoring Logs]
 *     summary: Últimas N verificações de um dispositivo
 *     description: >
 *       Devolve as verificações mais recentes de um dispositivo específico, sem paginação.
 *       Útil para renderizar um mini-gráfico de histórico no card de detalhe do dispositivo.
 *       Por defeito devolve as últimas 50 verificações.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           minimum: 1
 *           maximum: 200
 *         description: Número máximo de verificações a devolver
 *     responses:
 *       200:
 *         description: Últimas verificações do dispositivo
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MonitoringLogOutput'
 */

/**
 * @swagger
 * /api/monitoring-logs/{id}:
 *   get:
 *     tags: [Monitoring Logs]
 *     summary: Buscar verificação por ID
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
 *         description: Registo de verificação encontrado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/MonitoringLogOutput'
 *       404:
 *         description: Registo não encontrado
 */

/**
 * @swagger
 * /api/monitoring-logs/purge:
 *   delete:
 *     tags: [Monitoring Logs]
 *     summary: Apagar logs antigos
 *     description: >
 *       Remove permanentemente logs de monitoramento anteriores a N dias.
 *       **Operação irreversível** — usar com cuidado.
 *       Por defeito remove logs com mais de 90 dias. O máximo configurável é 365 dias.
 *       Recomendado executar periodicamente para evitar crescimento excessivo da base de dados.
 *       Apenas administradores têm acesso a este endpoint.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               days:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 365
 *                 default: 90
 *                 description: Apagar logs mais antigos que este número de dias
 *           example:
 *             days: 90
 *     responses:
 *       200:
 *         description: Logs apagados com sucesso
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
 *                         deleted:
 *                           type: integer
 *                           example: 14520
 *                           description: Número de registos removidos
 *                         cutoffDate:
 *                           type: string
 *                           format: date-time
 *                           description: Data limite usada para o purge
 *       400:
 *         description: Valor de days fora do intervalo permitido
 *       403:
 *         description: Apenas ADMIN pode executar purge
 */

export {};