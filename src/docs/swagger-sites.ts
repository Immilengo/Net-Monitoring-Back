/**
 * @swagger
 * tags:
 *   name: Sites
 *   description: >
 *     Gestão de locais/instalações físicas onde os dispositivos estão localizados.
 *     Um site representa uma localização geográfica (sede, filial, datacenter, etc.)
 *     e serve de base para organizar e filtrar dispositivos por localização.
 */

/**
 * @swagger
 * /api/sites:
 *   post:
 *     tags: [Sites]
 *     summary: Criar site
 *     description: >
 *       Cria um novo local/instalação. O nome é obrigatório e deve ser único no sistema.
 *       Após criar um site, os dispositivos podem ser associados a ele no momento
 *       do seu registo ou através de edição posterior.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSiteRequest'
 *           example:
 *             name: Sede Luanda
 *             address: Rua da Missão, nº 10
 *             city: Luanda
 *             country: Angola
 *             description: Escritório principal com datacenter primário
 *     responses:
 *       201:
 *         description: Site criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/SiteOutput'
 *       409:
 *         description: Já existe um site com este nome
 *
 *   get:
 *     tags: [Sites]
 *     summary: Listar sites
 *     description: Devolve lista paginada de sites com suporte a pesquisa e filtros.
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
 *           enum: [name, city, country, createdAt, updatedAt]
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
 *         description: Pesquisa por nome, cidade ou país
 *     responses:
 *       200:
 *         description: Lista paginada de sites
 */

/**
 * @swagger
 * /api/sites/{id}:
 *   get:
 *     tags: [Sites]
 *     summary: Buscar site por ID
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
 *         description: Site encontrado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/SiteOutput'
 *       404:
 *         description: Site não encontrado ou inactivo
 *
 *   patch:
 *     tags: [Sites]
 *     summary: Editar site
 *     description: Actualiza parcialmente um site. Apenas os campos enviados são alterados.
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
 *             $ref: '#/components/schemas/UpdateSiteRequest'
 *     responses:
 *       200:
 *         description: Site actualizado
 *       404:
 *         description: Site não encontrado
 *       409:
 *         description: Já existe outro site com o nome indicado
 *
 *   delete:
 *     tags: [Sites]
 *     summary: Desactivar site (soft delete)
 *     description: >
 *       Marca o site como inactivo. Os dispositivos associados mantêm a referência
 *       ao site mas este deixa de aparecer nas listagens ACTIVE.
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
 *         description: Site desactivado com sucesso
 *       404:
 *         description: Site não encontrado
 */

/**
 * @swagger
 * /api/sites/{id}/restore:
 *   patch:
 *     tags: [Sites]
 *     summary: Restaurar site desactivado
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
 *         description: Site restaurado com sucesso
 *       400:
 *         description: Site já está activo
 */

export {};