/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: >
 *     Autenticação e gestão de sessões.
 *     O sistema usa dois tokens JWT: um **access token** de curta duração (15 min)
 *     enviado em cada pedido, e um **refresh token** de longa duração (7 dias)
 *     usado exclusivamente para renovar o access token sem re-login.
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Registar novo utilizador
 *     description: >
 *       Cria uma nova conta no sistema. Após o registo, um email de verificação
 *       é enviado para o endereço fornecido. O utilizador não consegue fazer login
 *       enquanto o email não for verificado.
 *       **Nota:** o primeiro utilizador do sistema é criado automaticamente via bootstrap
 *       com o role ADMIN — não é necessário registar o admin manualmente.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           example:
 *             name: João Silva
 *             email: joao@empresa.ao
 *             password: "Senha@123"
 *     responses:
 *       201:
 *         description: Utilizador criado com sucesso. Email de verificação enviado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Dados inválidos (password fraca, email mal formatado)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       409:
 *         description: Email já registado no sistema
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Autenticar utilizador
 *     description: >
 *       Autentica o utilizador com email e password.
 *       Devolve um **access token** (válido 15 minutos) e um **refresh token** (válido 7 dias).
 *
 *       **Como usar os tokens:**
 *       1. Guardar ambos os tokens após o login.
 *       2. Enviar o access token em cada pedido protegido no header:
 *          `Authorization: Bearer {accessToken}`
 *       3. Quando o access token expirar (erro 401), chamar `POST /api/auth/refresh`
 *          com o refresh token para obter um novo par de tokens.
 *       4. Se o refresh token também expirar, o utilizador tem de fazer login novamente.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: admin@sistema.ao
 *             password: "Admin@123"
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Campos obrigatórios em falta
 *       401:
 *         description: Credenciais inválidas ou email não verificado
 */

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Renovar access token
 *     description: >
 *       Usa o **refresh token** para emitir um novo par de tokens (access + refresh).
 *       O refresh token anterior é invalidado após este pedido — o novo deve ser guardado.
 *       Chamar este endpoint quando receber um erro 401 nas rotas protegidas.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: Novo par de tokens emitido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Refresh token inválido ou expirado. O utilizador deve fazer login novamente.
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Terminar sessão
 *     description: >
 *       Invalida o refresh token actual, impedindo que seja usado para emitir novos access tokens.
 *       O access token em curso continua válido até à sua expiração natural (máx. 15 min).
 *       O cliente deve descartar ambos os tokens localmente após este pedido.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: Sessão terminada com sucesso
 *       401:
 *         description: Token inválido ou não autenticado
 */

/**
 * @swagger
 * /api/auth/verify-email:
 *   get:
 *     tags: [Auth]
 *     summary: Verificar email
 *     description: >
 *       Confirma o endereço de email do utilizador através do token enviado por email.
 *       Após verificação, o utilizador pode fazer login normalmente.
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de verificação recebido por email
 *     responses:
 *       200:
 *         description: Email verificado com sucesso
 *       400:
 *         description: Token inválido ou expirado
 */

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Solicitar reset de password
 *     description: >
 *       Envia um email com link para redefinir a password.
 *       Por segurança, a resposta é sempre 200 independentemente de o email existir ou não.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: joao@empresa.ao
 *     responses:
 *       200:
 *         description: Se o email existir, receberá instruções para redefinir a password
 */

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Redefinir password
 *     description: >
 *       Define uma nova password usando o token recebido por email.
 *       O token expira em 1 hora. Após a redefinição, todos os refresh tokens
 *       activos do utilizador são invalidados e é necessário fazer login novamente.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password redefinida com sucesso
 *       400:
 *         description: Token inválido, expirado ou password fraca
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Dados do utilizador autenticado
 *     description: Devolve o perfil completo do utilizador dono do access token actual.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil do utilizador
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserOutput'
 *       401:
 *         description: Não autenticado
 */

export {};