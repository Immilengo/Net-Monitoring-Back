/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestão de utilizadores do sistema. Requer role ADMIN.
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Listar utilizadores
 *     description: >
 *       Devolve lista paginada de utilizadores com suporte a filtros e ordenação.
 *       Útil para o painel de administração de contas.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Número da página (começa em 0)
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, email, createdAt, updatedAt]
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
 *         description: ACTIVE = não apagados, INACTIVE = soft deleted, ALL = todos
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Pesquisa por nome ou email
 *     responses:
 *       200:
 *         description: Lista paginada de utilizadores
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (requer ADMIN)
 *
 *   post:
 *     tags: [Users]
 *     summary: Criar utilizador
 *     description: Cria um novo utilizador com roles definidos. Apenas ADMIN pode criar utilizadores directamente sem verificação de email.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: Utilizador criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Email já em uso
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Buscar utilizador por ID
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
 *         description: Utilizador encontrado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserOutput'
 *       404:
 *         description: Utilizador não encontrado
 *
 *   patch:
 *     tags: [Users]
 *     summary: Editar utilizador
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
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: Utilizador actualizado
 *       404:
 *         description: Utilizador não encontrado
 *
 *   delete:
 *     tags: [Users]
 *     summary: Desactivar utilizador (soft delete)
 *     description: >
 *       Marca o utilizador como inactivo sem o remover permanentemente.
 *       O utilizador perde acesso imediatamente mas os seus dados são preservados
 *       para auditoria. Pode ser restaurado com PATCH /{id}/restore.
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
 *         description: Utilizador desactivado com sucesso
 *       404:
 *         description: Utilizador não encontrado
 */

/**
 * @swagger
 * /api/users/{id}/restore:
 *   patch:
 *     tags: [Users]
 *     summary: Restaurar utilizador desactivado
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
 *         description: Utilizador restaurado com sucesso
 *       400:
 *         description: Utilizador já está activo
 *       404:
 *         description: Utilizador não encontrado
 */

export {};