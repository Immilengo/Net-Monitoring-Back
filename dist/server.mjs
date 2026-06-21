import {
  env,
  prisma
} from "./chunk-SVULG3ZS.mjs";

// src/infra/http/app.ts
import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";

// src/config/swagger.ts
import swaggerJsdoc from "swagger-jsdoc";
var bearerSecurity = [{ bearerAuth: [] }];
var json = (schema) => ({
  content: {
    "application/json": {
      schema
    }
  }
});
var swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Mayongi Enterprise Backend API",
      version: "1.0.0",
      description: "Enterprise-ready modular monolith backend template"
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          required: ["success", "message", "errors"],
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Validation error" },
            errors: {
              type: "array",
              items: { type: "object", additionalProperties: true },
              example: []
            }
          }
        },
        AuthUser: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            fullName: { type: "string" },
            email: { type: "string", format: "email" },
            phone: { type: "string", nullable: true },
            status: { type: "string", nullable: true, example: "ACTIVE" },
            emailVerified: { type: "boolean" },
            roles: { type: "array", items: { type: "string" }, example: ["USER"] }
          }
        },
        TokenPair: {
          type: "object",
          required: ["accessToken", "refreshToken"],
          properties: {
            accessToken: { type: "string" },
            refreshToken: { type: "string" }
          }
        },
        ImageAsset: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            ownerType: { type: "string", enum: ["USER", "PRODUCT", "GENERIC"] },
            ownerId: { type: "string", format: "uuid" },
            url: { type: "string" },
            fileName: { type: "string" },
            contentType: { type: "string" },
            sizeBytes: { type: "string", example: "1024" },
            primaryImage: { type: "boolean" },
            sortOrder: { type: "integer" },
            deleted: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        UserResponse: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            fullName: { type: "string" },
            email: { type: "string", format: "email" },
            phone: { type: "string", nullable: true },
            status: { type: "string", nullable: true },
            emailVerified: { type: "boolean" },
            roles: { type: "array", items: { type: "string" } },
            profileImage: {
              oneOf: [{ $ref: "#/components/schemas/ImageAsset" }, { type: "null" }]
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        RoleResponse: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            description: { type: "string", nullable: true },
            deleted: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        StatusResponse: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            code: { type: "string" },
            name: { type: "string" },
            description: { type: "string", nullable: true },
            deleted: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        TicketResponse: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            subject: { type: "string" },
            description: { type: "string" },
            status: { type: "string", enum: ["PENDENTE", "PROCESSANDO", "RESOLVIDO", "FECHADO"] },
            requesterId: { type: "string", format: "uuid" },
            requesterEmail: { type: "string", format: "email" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        UserPage: {
          type: "object",
          properties: {
            content: { type: "array", items: { $ref: "#/components/schemas/UserResponse" } },
            pageable: {
              type: "object",
              properties: {
                pageNumber: { type: "integer" },
                pageSize: { type: "integer" }
              }
            },
            totalElements: { type: "integer" },
            totalPages: { type: "integer" },
            first: { type: "boolean" },
            last: { type: "boolean" },
            number: { type: "integer" },
            size: { type: "integer" },
            numberOfElements: { type: "integer" },
            empty: { type: "boolean" }
          }
        },
        TicketPage: {
          type: "object",
          properties: {
            content: { type: "array", items: { $ref: "#/components/schemas/TicketResponse" } },
            pageable: {
              type: "object",
              properties: {
                pageNumber: { type: "integer" },
                pageSize: { type: "integer" }
              }
            },
            totalElements: { type: "integer" },
            totalPages: { type: "integer" },
            first: { type: "boolean" },
            last: { type: "boolean" },
            number: { type: "integer" },
            size: { type: "integer" },
            numberOfElements: { type: "integer" },
            empty: { type: "boolean" }
          }
        }
      }
    },
    tags: [{ name: "System" }, { name: "Auth" }, { name: "Users" }, { name: "Roles" }, { name: "Statuses" }, { name: "Tickets" }, { name: "Images" }],
    paths: {
      "/health": {
        get: {
          tags: ["System"],
          summary: "Health check",
          responses: {
            "200": json({
              type: "object",
              properties: {
                success: { type: "boolean" },
                message: { type: "string" },
                data: { type: "object", properties: { uptime: { type: "number" } } }
              }
            })
          }
        }
      },
      "/actuator/health": {
        get: {
          tags: ["System"],
          summary: "Actuator health",
          responses: { "200": json({ type: "object", properties: { status: { type: "string", example: "UP" } } }) }
        }
      },
      "/public/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Registrar conta",
          requestBody: {
            required: true,
            ...json({
              type: "object",
              required: ["fullName", "email", "password"],
              properties: {
                fullName: { type: "string", example: "John Doe" },
                email: { type: "string", format: "email", example: "john@company.com" },
                password: { type: "string", minLength: 8, example: "StrongPass123@" },
                phone: { type: "string", example: "+244900000000" }
              }
            })
          },
          responses: {
            "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { type: "null" } } }),
            "400": json({ $ref: "#/components/schemas/ErrorResponse" })
          }
        }
      },
      "/public/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login",
          requestBody: {
            required: true,
            ...json({
              type: "object",
              required: ["email", "password"],
              properties: {
                email: { type: "string", format: "email" },
                password: { type: "string", minLength: 8 }
              }
            })
          },
          responses: {
            "200": json({
              type: "object",
              properties: {
                success: { type: "boolean" },
                message: { type: "string" },
                data: { $ref: "#/components/schemas/TokenPair" }
              }
            })
          }
        }
      },
      "/public/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Logout",
          requestBody: {
            required: true,
            ...json({ type: "object", required: ["refreshToken"], properties: { refreshToken: { type: "string" } } })
          },
          responses: { "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { type: "null" } } }) }
        }
      },
      "/public/auth/refresh": {
        post: {
          tags: ["Auth"],
          summary: "Refresh token",
          requestBody: {
            required: true,
            ...json({ type: "object", required: ["refreshToken"], properties: { refreshToken: { type: "string" } } })
          },
          responses: { "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/TokenPair" } } }) }
        }
      },
      "/public/auth/forgot-password": {
        post: {
          tags: ["Auth"],
          summary: "Esqueci senha",
          requestBody: {
            required: true,
            ...json({ type: "object", required: ["email"], properties: { email: { type: "string", format: "email" } } })
          },
          responses: { "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { type: "null" } } }) }
        }
      },
      "/public/auth/reset-password": {
        post: {
          tags: ["Auth"],
          summary: "Resetar senha",
          requestBody: {
            required: true,
            ...json({
              type: "object",
              required: ["token", "newPassword"],
              properties: {
                token: { type: "string" },
                newPassword: { type: "string", minLength: 8 }
              }
            })
          },
          responses: { "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { type: "null" } } }) }
        }
      },
      "/public/auth/verify-email": {
        get: {
          tags: ["Auth"],
          summary: "Verificar email",
          parameters: [{ name: "token", in: "query", required: true, schema: { type: "string" } }],
          responses: { "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { type: "null" } } }) }
        }
      },
      "/public/auth/resend-verification-email": {
        post: {
          tags: ["Auth"],
          summary: "Reenviar verificacao",
          requestBody: {
            required: true,
            ...json({ type: "object", required: ["email"], properties: { email: { type: "string", format: "email" } } })
          },
          responses: { "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { type: "null" } } }) }
        }
      },
      "/api/users": {
        post: {
          tags: ["Users"],
          summary: "Criar usuario",
          security: bearerSecurity,
          requestBody: {
            required: true,
            ...json({
              type: "object",
              required: ["fullName", "email", "password"],
              properties: {
                fullName: { type: "string" },
                email: { type: "string", format: "email" },
                password: { type: "string", minLength: 8 },
                phone: { type: "string" },
                statusId: { type: "string", format: "uuid" }
              }
            })
          },
          responses: { "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/UserResponse" } } }) }
        },
        get: {
          tags: ["Users"],
          summary: "Listar usuarios",
          security: bearerSecurity,
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", minimum: 0, default: 0 } },
            { name: "size", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 10 } },
            { name: "sortBy", in: "query", schema: { type: "string", enum: ["fullName", "email", "createdAt", "updatedAt"], default: "createdAt" } },
            { name: "direction", in: "query", schema: { type: "string", enum: ["asc", "desc"], default: "desc" } },
            { name: "statusId", in: "query", schema: { type: "string", format: "uuid" } },
            { name: "recordStatus", in: "query", schema: { type: "string", enum: ["ACTIVE", "INACTIVE", "ALL"], default: "ACTIVE" } }
          ],
          responses: { "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/UserPage" } } }) }
        }
      },
      "/api/users/me": {
        get: {
          tags: ["Users"],
          summary: "Perfil atual",
          security: bearerSecurity,
          responses: { "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/UserResponse" } } }) }
        }
      },
      "/api/users/{id}": {
        get: {
          tags: ["Users"],
          summary: "Detalhar usuario",
          security: bearerSecurity,
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          responses: { "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/UserResponse" } } }) }
        },
        patch: {
          tags: ["Users"],
          summary: "Atualizar usuario parcialmente",
          security: bearerSecurity,
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          requestBody: {
            required: true,
            ...json({
              type: "object",
              properties: {
                fullName: { type: "string" },
                email: { type: "string", format: "email" },
                phone: { type: "string" },
                statusId: { type: "string", format: "uuid" },
                active: { type: "boolean" }
              }
            })
          },
          responses: { "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/UserResponse" } } }) }
        },
        delete: {
          tags: ["Users"],
          summary: "Desativar usuario",
          security: bearerSecurity,
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          responses: { "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { type: "null" } } }) }
        }
      },
      "/api/users/{id}/roles": {
        patch: {
          tags: ["Users"],
          summary: "Adicionar role ao usuario",
          security: bearerSecurity,
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          requestBody: {
            required: true,
            ...json({ type: "object", required: ["roleName"], properties: { roleName: { type: "string", example: "MANAGER" } } })
          },
          responses: { "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/UserResponse" } } }) }
        }
      },
      "/api/users/{id}/profile-image": {
        post: {
          tags: ["Users"],
          summary: "Atualizar foto de perfil",
          security: bearerSecurity,
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          requestBody: {
            required: true,
            ...json({
              type: "object",
              required: ["url"],
              properties: {
                url: { type: "string", format: "uri" },
                fileName: { type: "string" },
                contentType: { type: "string" },
                sizeBytes: { type: "integer" },
                sortOrder: { type: "integer" }
              }
            })
          },
          responses: { "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/ImageAsset" } } }) }
        },
        get: {
          tags: ["Users"],
          summary: "Obter foto de perfil",
          security: bearerSecurity,
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          responses: {
            "200": json({
              type: "object",
              properties: {
                success: { type: "boolean" },
                message: { type: "string" },
                data: { oneOf: [{ $ref: "#/components/schemas/ImageAsset" }, { type: "null" }] }
              }
            })
          }
        }
      },
      "/api/roles": {
        post: {
          tags: ["Roles"],
          summary: "Criar role",
          security: bearerSecurity,
          requestBody: {
            required: true,
            ...json({ type: "object", required: ["name"], properties: { name: { type: "string" }, description: { type: "string" } } })
          },
          responses: { "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/RoleResponse" } } }) }
        },
        get: {
          tags: ["Roles"],
          summary: "Listar roles",
          security: bearerSecurity,
          parameters: [{ name: "recordStatus", in: "query", schema: { type: "string", enum: ["ACTIVE", "INACTIVE", "ALL"], default: "ACTIVE" } }],
          responses: { "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { type: "array", items: { $ref: "#/components/schemas/RoleResponse" } } } }) }
        }
      },
      "/api/roles/{id}": {
        get: {
          tags: ["Roles"],
          summary: "Detalhar role",
          security: bearerSecurity,
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          responses: { "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/RoleResponse" } } }) }
        },
        put: {
          tags: ["Roles"],
          summary: "Atualizar role",
          security: bearerSecurity,
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          requestBody: {
            required: true,
            ...json({ type: "object", required: ["name"], properties: { name: { type: "string" }, description: { type: "string" } } })
          },
          responses: { "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/RoleResponse" } } }) }
        },
        patch: {
          tags: ["Roles"],
          summary: "Patch role",
          security: bearerSecurity,
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          requestBody: {
            required: true,
            ...json({ type: "object", properties: { name: { type: "string" }, description: { type: "string", nullable: true }, active: { type: "boolean" } } })
          },
          responses: { "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/RoleResponse" } } }) }
        },
        delete: {
          tags: ["Roles"],
          summary: "Desativar role",
          security: bearerSecurity,
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          responses: { "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { type: "null" } } }) }
        }
      },
      "/api/statuses": {
        post: {
          tags: ["Statuses"],
          summary: "Criar status",
          security: bearerSecurity,
          requestBody: {
            required: true,
            ...json({
              type: "object",
              required: ["code", "name"],
              properties: {
                code: { type: "string" },
                name: { type: "string" },
                description: { type: "string" }
              }
            })
          },
          responses: { "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/StatusResponse" } } }) }
        },
        get: {
          tags: ["Statuses"],
          summary: "Listar status",
          security: bearerSecurity,
          parameters: [{ name: "recordStatus", in: "query", schema: { type: "string", enum: ["ACTIVE", "INACTIVE", "ALL"], default: "ACTIVE" } }],
          responses: { "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { type: "array", items: { $ref: "#/components/schemas/StatusResponse" } } } }) }
        }
      },
      "/api/statuses/{id}": {
        get: {
          tags: ["Statuses"],
          summary: "Detalhar status",
          security: bearerSecurity,
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          responses: { "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/StatusResponse" } } }) }
        },
        put: {
          tags: ["Statuses"],
          summary: "Atualizar status",
          security: bearerSecurity,
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          requestBody: {
            required: true,
            ...json({
              type: "object",
              required: ["code", "name"],
              properties: {
                code: { type: "string" },
                name: { type: "string" },
                description: { type: "string" }
              }
            })
          },
          responses: { "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/StatusResponse" } } }) }
        },
        patch: {
          tags: ["Statuses"],
          summary: "Patch status",
          security: bearerSecurity,
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          requestBody: {
            required: true,
            ...json({ type: "object", properties: { code: { type: "string" }, name: { type: "string" }, description: { type: "string", nullable: true }, active: { type: "boolean" } } })
          },
          responses: { "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/StatusResponse" } } }) }
        },
        delete: {
          tags: ["Statuses"],
          summary: "Desativar status",
          security: bearerSecurity,
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          responses: { "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { type: "null" } } }) }
        }
      },
      "/api/tickets": {
        post: {
          tags: ["Tickets"],
          summary: "Criar ticket",
          security: bearerSecurity,
          requestBody: {
            required: true,
            ...json({ type: "object", required: ["subject", "description"], properties: { subject: { type: "string" }, description: { type: "string" } } })
          },
          responses: { "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/TicketResponse" } } }) }
        },
        get: {
          tags: ["Tickets"],
          summary: "Listar tickets",
          security: bearerSecurity,
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", minimum: 0, default: 0 } },
            { name: "size", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 10 } },
            { name: "sortBy", in: "query", schema: { type: "string", enum: ["subject", "status", "createdAt", "updatedAt"], default: "createdAt" } },
            { name: "direction", in: "query", schema: { type: "string", enum: ["asc", "desc"], default: "desc" } },
            { name: "status", in: "query", schema: { type: "string", enum: ["PENDENTE", "PROCESSANDO", "RESOLVIDO", "FECHADO"] } },
            { name: "recordStatus", in: "query", schema: { type: "string", enum: ["ACTIVE", "INACTIVE", "ALL"], default: "ACTIVE" } }
          ],
          responses: { "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/TicketPage" } } }) }
        }
      },
      "/api/tickets/{id}": {
        get: {
          tags: ["Tickets"],
          summary: "Detalhar ticket",
          security: bearerSecurity,
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          responses: { "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/TicketResponse" } } }) }
        },
        patch: {
          tags: ["Tickets"],
          summary: "Patch ticket",
          security: bearerSecurity,
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          requestBody: {
            required: true,
            ...json({ type: "object", properties: { subject: { type: "string" }, description: { type: "string" } } })
          },
          responses: { "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/TicketResponse" } } }) }
        },
        delete: {
          tags: ["Tickets"],
          summary: "Desativar ticket",
          security: bearerSecurity,
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          responses: { "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { type: "null" } } }) }
        }
      },
      "/api/tickets/{id}/status": {
        patch: {
          tags: ["Tickets"],
          summary: "Atualizar status do ticket",
          security: bearerSecurity,
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          requestBody: {
            required: true,
            ...json({
              type: "object",
              required: ["status"],
              properties: { status: { type: "string", enum: ["PENDENTE", "PROCESSANDO", "RESOLVIDO", "FECHADO"] } }
            })
          },
          responses: { "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/TicketResponse" } } }) }
        }
      },
      "/api/images/{ownerType}/{ownerId}": {
        post: {
          tags: ["Images"],
          summary: "Criar imagem para entidade",
          security: bearerSecurity,
          parameters: [
            { name: "ownerType", in: "path", required: true, schema: { type: "string", enum: ["USER", "PRODUCT", "GENERIC"] } },
            { name: "ownerId", in: "path", required: true, schema: { type: "string", format: "uuid" } }
          ],
          requestBody: {
            required: true,
            ...json({
              type: "object",
              required: ["url", "fileName", "contentType", "sizeBytes"],
              properties: {
                url: { type: "string", format: "uri" },
                fileName: { type: "string" },
                contentType: { type: "string" },
                sizeBytes: { type: "integer" },
                primaryImage: { type: "boolean" },
                sortOrder: { type: "integer" }
              }
            })
          },
          responses: { "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/ImageAsset" } } }) }
        },
        get: {
          tags: ["Images"],
          summary: "Listar imagens por entidade",
          security: bearerSecurity,
          parameters: [
            { name: "ownerType", in: "path", required: true, schema: { type: "string", enum: ["USER", "PRODUCT", "GENERIC"] } },
            { name: "ownerId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
            { name: "recordStatus", in: "query", schema: { type: "string", enum: ["ACTIVE", "INACTIVE", "ALL"], default: "ACTIVE" } }
          ],
          responses: { "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { type: "array", items: { $ref: "#/components/schemas/ImageAsset" } } } }) }
        }
      },
      "/api/images/{ownerType}/{ownerId}/{imageId}/primary": {
        patch: {
          tags: ["Images"],
          summary: "Definir imagem principal",
          security: bearerSecurity,
          parameters: [
            { name: "ownerType", in: "path", required: true, schema: { type: "string", enum: ["USER", "PRODUCT", "GENERIC"] } },
            { name: "ownerId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
            { name: "imageId", in: "path", required: true, schema: { type: "string", format: "uuid" } }
          ],
          responses: { "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { type: "null" } } }) }
        }
      },
      "/api/images/{imageId}/status": {
        patch: {
          tags: ["Images"],
          summary: "Atualizar status da imagem",
          security: bearerSecurity,
          parameters: [
            { name: "imageId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
            { name: "active", in: "query", required: true, schema: { type: "boolean" } }
          ],
          responses: { "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/ImageAsset" } } }) }
        }
      },
      "/api/images/{imageId}": {
        delete: {
          tags: ["Images"],
          summary: "Remover imagem",
          security: bearerSecurity,
          parameters: [{ name: "imageId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          responses: { "200": json({ type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { type: "null" } } }) }
        }
      }
    }
  },
  apis: ["./src/docs/*.ts", "./src/modules/**/routes/*.ts"]
});

// src/errors/app-error.ts
var AppError = class extends Error {
  constructor(message, statusCode = 400, errors = []) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = "AppError";
  }
  message;
  statusCode;
  errors;
};

// src/utils/logger.ts
import fs from "fs";
import path from "path";
import { createLogger, format, transports } from "winston";
var logsDir = path.resolve(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
var logger = createLogger({
  level: "info",
  format: format.combine(format.timestamp(), format.errors({ stack: true }), format.json()),
  transports: [
    new transports.Console(),
    new transports.File({ filename: path.join(logsDir, "combined.log") }),
    new transports.File({ filename: path.join(logsDir, "error.log"), level: "error" })
  ]
});

// src/utils/response.ts
var successResponse = (message, data) => ({
  success: true,
  message,
  data: data ?? null
});
var errorResponse = (message, errors = []) => ({
  success: false,
  message,
  errors
});

// src/middlewares/error.middleware.ts
var errorMiddleware = (error, req, res, _next) => {
  if (error instanceof AppError) {
    logger.warn({ requestId: req.requestId, message: error.message, errors: error.errors });
    return res.status(error.statusCode).json(errorResponse(error.message, error.errors));
  }
  logger.error({ requestId: req.requestId, message: error.message, stack: error.stack });
  return res.status(500).json(errorResponse("Internal server error"));
};

// src/middlewares/request-context.middleware.ts
import { randomUUID } from "crypto";
var requestContextMiddleware = (req, _res, next) => {
  req.requestId = randomUUID();
  next();
};

// src/middlewares/request-logger.middleware.ts
var requestLoggerMiddleware = (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    logger.info({
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - start
    });
  });
  next();
};

// src/middlewares/sanitize.middleware.ts
var sanitizeValue = (value) => {
  if (typeof value === "string") {
    return value.replace(/[<>]/g, "");
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === "object") {
    const sanitized = {};
    for (const [key, val] of Object.entries(value)) {
      sanitized[key] = sanitizeValue(val);
    }
    return sanitized;
  }
  return value;
};
var sanitizeMiddleware = (req, _res, next) => {
  req.body = sanitizeValue(req.body);
  const sanitizedQuery = sanitizeValue(req.query);
  if (req.query && typeof req.query === "object") {
    for (const key of Object.keys(req.query)) {
      delete req.query[key];
    }
    Object.assign(req.query, sanitizedQuery);
  }
  next();
};

// src/shared/router.ts
import { Router as Router13 } from "express";

// src/modules/auth/routes/auth.routes.ts
import { Router } from "express";

// src/modules/auth/service/auth.service.ts
import bcrypt from "bcrypt";
import { randomBytes, randomUUID as randomUUID2 } from "crypto";
import ms from "ms";

// src/modules/email/service/email.service.ts
import nodemailer from "nodemailer";
var transporter = nodemailer.createTransport({
  host: env.MAIL_HOST,
  port: env.MAIL_PORT,
  secure: env.MAIL_PORT === 465,
  auth: {
    user: env.MAIL_USERNAME,
    pass: env.MAIL_PASSWORD
  }
});
var EmailService = class {
  async send(data) {
    await transporter.sendMail({
      from: env.MAIL_FROM,
      to: data.to,
      subject: data.subject,
      html: data.html
    });
  }
};

// src/modules/audit/repository/audit.repository.ts
var AuditRepository = class {
  async create(input) {
    return prisma.auditLog.create({ data: input });
  }
};

// src/modules/audit/service/audit.service.ts
var repository = new AuditRepository();
var AuditService = class {
  async log(input) {
    await repository.create(input);
  }
};

// src/modules/auth/repository/auth.repository.ts
var AuthRepository = class {
  async findUserByEmail(email) {
    return prisma.user.findFirst({
      where: { email: email.toLowerCase(), deleted: false },
      include: { status: true, roles: { include: { role: true } } }
    });
  }
  async findUserByVerificationToken(token) {
    return prisma.user.findFirst({
      where: { emailVerificationToken: token, deleted: false },
      include: { status: true, roles: { include: { role: true } } }
    });
  }
  async findUserByResetToken(token) {
    return prisma.user.findFirst({
      where: { passwordResetToken: token, deleted: false },
      include: { status: true, roles: { include: { role: true } } }
    });
  }
  async createUser(data) {
    return prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email.toLowerCase(),
        password: data.password,
        phone: data.phone,
        status: { connect: { id: data.statusId } },
        emailVerificationToken: data.emailVerificationToken,
        emailVerificationExpiresAt: data.emailVerificationExpiresAt,
        roles: { create: [{ role: { connect: { id: data.roleId } } }] }
      },
      include: { status: true, roles: { include: { role: true } } }
    });
  }
  async getRoleByName(name) {
    return prisma.role.findUnique({ where: { name } });
  }
  async getStatusByCode(code) {
    return prisma.status.findFirst({ where: { code: code.toUpperCase(), deleted: false } });
  }
  async upsertStatus(code, name, description) {
    return prisma.status.upsert({
      where: { code: code.toUpperCase() },
      update: {
        deleted: false,
        name: name ?? code.toUpperCase(),
        description: description ?? `Default status ${code.toUpperCase()}`
      },
      create: {
        code: code.toUpperCase(),
        name: name ?? code.toUpperCase(),
        description: description ?? `Default status ${code.toUpperCase()}`
      }
    });
  }
  async revokeAllRefreshTokens(userId) {
    return prisma.refreshToken.updateMany({
      where: { userId, revoked: false, deleted: false },
      data: { revoked: true }
    });
  }
  async createRefreshToken(params) {
    return prisma.refreshToken.create({ data: params });
  }
  async findRefreshToken(token) {
    return prisma.refreshToken.findFirst({
      where: { token, deleted: false },
      include: { user: { include: { status: true, roles: { include: { role: true } } } } }
    });
  }
  async revokeRefreshToken(id, markDeleted = false) {
    return prisma.refreshToken.update({
      where: { id },
      data: { revoked: true, ...markDeleted ? { deleted: true } : {} }
    });
  }
  async updateUser(id, data) {
    return prisma.user.update({
      where: { id },
      data,
      include: { status: true, roles: { include: { role: true } } }
    });
  }
};

// src/modules/auth/service/token.service.ts
import jwt from "jsonwebtoken";
var TokenService = class {
  signAccess(payload) {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRATION });
  }
  signRefresh(payload) {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRATION });
  }
  signEmailVerification(payload) {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EMAIL_VERIFICATION_EXPIRATION });
  }
  signResetPassword(payload) {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_RESET_PASSWORD_EXPIRATION });
  }
  verify(token) {
    return jwt.verify(token, env.JWT_SECRET);
  }
};

// src/modules/auth/mapper/auth.mapper.ts
var toAuthUserOutput = (user) => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  status: user.status?.code ?? null,
  emailVerified: user.emailVerified,
  roles: user.roles.map((x) => x.role.name)
});

// src/modules/auth/service/auth.service.ts
var EMAIL_TOKEN_TTL_MS = 24 * 60 * 60 * 1e3;
var RESET_TOKEN_TTL_MS = 60 * 60 * 1e3;
var AuthService = class {
  constructor(repository2 = new AuthRepository(), tokenService = new TokenService(), emailService = new EmailService(), audit = new AuditService()) {
    this.repository = repository2;
    this.tokenService = tokenService;
    this.emailService = emailService;
    this.audit = audit;
  }
  repository;
  tokenService;
  emailService;
  audit;
  async getOrCreateStatus(code) {
    const existing = await this.repository.getStatusByCode(code);
    if (existing) return existing;
    return this.repository.upsertStatus(code);
  }
  ensureActiveAndVerified(user) {
    if (!user.emailVerified) {
      throw new AppError("Email not verified. Please verify your account before login.", 400);
    }
    if (!user.status || user.status.code.toUpperCase() !== "ACTIVE") {
      throw new AppError("Account is not active. Please contact support.", 400);
    }
  }
  generateOpaqueToken() {
    return randomBytes(48).toString("base64url");
  }
  async issueTokens(user) {
    await this.repository.revokeAllRefreshTokens(user.id);
    const payload = { sub: user.id, email: user.email, roles: user.roles.map((x) => x.role.name) };
    const accessToken = this.tokenService.signAccess(payload);
    const refreshToken = `${randomUUID2()}.${randomUUID2()}`;
    await this.repository.createRefreshToken({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + ms(env.JWT_REFRESH_EXPIRATION))
    });
    return { accessToken, refreshToken };
  }
  async register(input) {
    const existing = await this.repository.findUserByEmail(input.email);
    if (existing) throw new AppError("Email already in use", 400);
    const userRole = await this.repository.getRoleByName("USER");
    if (!userRole) throw new AppError("Default role not configured", 500);
    const pendingStatus = await this.getOrCreateStatus("PENDING");
    const hashed = await bcrypt.hash(input.password, 12);
    const emailVerificationToken = this.generateOpaqueToken();
    const user = await this.repository.createUser({
      ...input,
      password: hashed,
      roleId: userRole.id,
      statusId: pendingStatus.id,
      emailVerificationToken,
      emailVerificationExpiresAt: new Date(Date.now() + EMAIL_TOKEN_TTL_MS)
    });
    const sent = await this.sendVerificationEmail(user.email, emailVerificationToken);
    await this.audit.log({ userId: user.id, action: "REGISTER", resource: "AUTH", resourceId: user.id });
    return {
      user: toAuthUserOutput(user),
      message: sent ? "User registered successfully. Verification email sent." : "User registered successfully, but verification email could not be sent now. Use resend verification endpoint."
    };
  }
  async login(input) {
    const user = await this.repository.findUserByEmail(input.email);
    if (!user) throw new AppError("Invalid credentials", 400);
    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) throw new AppError("Invalid credentials", 400);
    this.ensureActiveAndVerified(user);
    const tokens = await this.issueTokens(user);
    await this.audit.log({ userId: user.id, action: "LOGIN", resource: "AUTH", resourceId: user.id });
    return tokens;
  }
  async logout(refreshToken) {
    const token = await this.repository.findRefreshToken(refreshToken);
    if (!token) throw new AppError("Invalid refresh token", 400);
    await this.repository.revokeRefreshToken(token.id, true);
  }
  async refresh(refreshToken) {
    const token = await this.repository.findRefreshToken(refreshToken);
    if (!token || token.revoked) throw new AppError("Invalid refresh token", 400);
    if (!token.expiresAt || token.expiresAt.getTime() <= Date.now()) {
      await this.repository.revokeRefreshToken(token.id);
      throw new AppError("Refresh token expired. Please login again.", 400);
    }
    this.ensureActiveAndVerified(token.user);
    await this.repository.revokeRefreshToken(token.id);
    return this.issueTokens(token.user);
  }
  async forgotPassword(email) {
    const user = await this.repository.findUserByEmail(email);
    if (!user) {
      return { sent: false };
    }
    const token = this.generateOpaqueToken();
    await this.repository.updateUser(user.id, {
      passwordResetToken: token,
      passwordResetExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS)
    });
    const sent = await this.sendResetPasswordEmail(user.email, token);
    return { sent };
  }
  async resetPassword(token, password) {
    const user = await this.repository.findUserByResetToken(token);
    if (!user) throw new AppError("Invalid reset token", 400);
    if (!user.passwordResetExpiresAt || user.passwordResetExpiresAt.getTime() <= Date.now()) {
      await this.repository.updateUser(user.id, { passwordResetToken: null, passwordResetExpiresAt: null });
      throw new AppError("Reset token expired. Please request a new password reset.", 400);
    }
    const hashed = await bcrypt.hash(password, 12);
    await this.repository.updateUser(user.id, {
      password: hashed,
      passwordResetToken: null,
      passwordResetExpiresAt: null
    });
  }
  async verifyEmail(token) {
    const user = await this.repository.findUserByVerificationToken(token);
    if (!user) throw new AppError("Invalid verification token", 400);
    if (!user.emailVerificationExpiresAt || user.emailVerificationExpiresAt.getTime() <= Date.now()) {
      await this.repository.updateUser(user.id, { emailVerificationToken: null, emailVerificationExpiresAt: null });
      throw new AppError("Verification token expired. Please request a new verification email.", 400);
    }
    const activeStatus = await this.getOrCreateStatus("ACTIVE");
    await this.repository.updateUser(user.id, {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpiresAt: null,
      statusId: activeStatus.id
    });
  }
  async resendVerificationEmail(email) {
    const user = await this.repository.findUserByEmail(email);
    if (!user) throw new AppError("User not found", 400);
    if (user.emailVerified) throw new AppError("Email is already verified", 400);
    const token = this.generateOpaqueToken();
    await this.repository.updateUser(user.id, {
      emailVerificationToken: token,
      emailVerificationExpiresAt: new Date(Date.now() + EMAIL_TOKEN_TTL_MS)
    });
    const sent = await this.sendVerificationEmail(user.email, token);
    return { sent };
  }
  async sendVerificationEmail(email, token) {
    const link = `${env.APP_PUBLIC_BASE_URL}/public/auth/verify-email?token=${token}`;
    try {
      await this.emailService.send({
        to: email,
        subject: "Verificacao de conta",
        html: `Use este link para verificar a sua conta: ${link}`
      });
      return true;
    } catch {
      return false;
    }
  }
  async sendResetPasswordEmail(email, token) {
    const link = `${env.APP_PUBLIC_BASE_URL}/public/auth/reset-password?token=${token}`;
    try {
      await this.emailService.send({
        to: email,
        subject: "Recuperacao de senha",
        html: `Use este link para redefinir a sua senha: ${link}`
      });
      return true;
    } catch {
      return false;
    }
  }
};

// src/modules/auth/controller/auth.controller.ts
var service = new AuthService();
var AuthController = class {
  async register(req, res) {
    const data = await service.register(req.body);
    res.status(200).json(successResponse(data.message, void 0));
  }
  async login(req, res) {
    const data = await service.login(req.body);
    res.json(successResponse("Login successful", data));
  }
  async logout(req, res) {
    await service.logout(req.body.refreshToken);
    res.json(successResponse("Logout successful"));
  }
  async refresh(req, res) {
    const data = await service.refresh(req.body.refreshToken);
    res.json(successResponse("Token refreshed", data));
  }
  async forgotPassword(req, res) {
    const result = await service.forgotPassword(req.body.email);
    const message = result.sent ? "If the email exists, reset instructions were sent" : "If the email exists, reset token was generated but email could not be sent now";
    res.json(successResponse(message));
  }
  async resetPassword(req, res) {
    await service.resetPassword(req.body.token, req.body.newPassword);
    res.json(successResponse("Password reset successfully"));
  }
  async verifyEmail(req, res) {
    await service.verifyEmail(req.query.token);
    res.json(successResponse("Email verified successfully"));
  }
  async resendVerificationEmail(req, res) {
    const result = await service.resendVerificationEmail(req.body.email);
    const message = result.sent ? "Verification email resent" : "Verification token regenerated, but email could not be sent now. Try again shortly.";
    res.json(successResponse(message));
  }
};

// src/middlewares/validation.middleware.ts
var validationMiddleware = (schema, source = "body") => (req, _res, next) => {
  const result = schema.safeParse(source === "query" ? req.query : req.body);
  if (!result.success) {
    const messages = result.error.errors.map((e) => e.message).join(", ");
    throw new AppError(messages, 400);
  }
  next();
};

// src/modules/auth/validator/auth.validator.ts
import { z } from "zod";
var registerSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional()
});
var loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});
var refreshSchema = z.object({
  refreshToken: z.string().min(10)
});
var forgotPasswordSchema = z.object({
  email: z.string().email()
});
var resetPasswordSchema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(8)
});
var resendVerificationEmailSchema = z.object({
  email: z.string().email()
});

// src/utils/async-handler.ts
var asyncHandler = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};

// src/modules/auth/routes/auth.routes.ts
var controller = new AuthController();
var authRoutes = Router();
authRoutes.post("/register", validationMiddleware(registerSchema), asyncHandler(controller.register.bind(controller)));
authRoutes.post("/login", validationMiddleware(loginSchema), asyncHandler(controller.login.bind(controller)));
authRoutes.post("/logout", validationMiddleware(refreshSchema), asyncHandler(controller.logout.bind(controller)));
authRoutes.post("/refresh", validationMiddleware(refreshSchema), asyncHandler(controller.refresh.bind(controller)));
authRoutes.post(
  "/forgot-password",
  validationMiddleware(forgotPasswordSchema),
  asyncHandler(controller.forgotPassword.bind(controller))
);
authRoutes.post(
  "/reset-password",
  validationMiddleware(resetPasswordSchema),
  asyncHandler(controller.resetPassword.bind(controller))
);
authRoutes.get("/verify-email", asyncHandler(controller.verifyEmail.bind(controller)));
authRoutes.post(
  "/resend-verification-email",
  validationMiddleware(resendVerificationEmailSchema),
  asyncHandler(controller.resendVerificationEmail.bind(controller))
);

// src/modules/users/routes/user.routes.ts
import { Router as Router2 } from "express";

// src/modules/users/service/user.service.ts
import bcrypt2 from "bcrypt";

// src/modules/common/service/pagination.service.ts
var parsePageQuery = (query) => {
  const page = Number.isFinite(query.page) && (query.page ?? 0) >= 0 ? Number(query.page) : 0;
  const size = Number.isFinite(query.size) && (query.size ?? 10) > 0 ? Math.min(Number(query.size), 100) : 10;
  return {
    page,
    size,
    skip: page * size,
    take: size
  };
};
var toPageResponse = (items, total, page, size) => ({
  content: items,
  pageable: { pageNumber: page, pageSize: size },
  totalElements: total,
  totalPages: Math.ceil(total / size),
  first: page === 0,
  last: page >= Math.ceil(total / size) - 1,
  number: page,
  size,
  numberOfElements: items.length,
  empty: items.length === 0
});

// src/modules/roles/repository/role.repository.ts
var RoleRepository = class {
  async findByNames(names) {
    return prisma.role.findMany({ where: { name: { in: names.map((n) => n.toUpperCase()) } } });
  }
  async findByName(name) {
    return prisma.role.findUnique({ where: { name: name.toUpperCase() } });
  }
  async create(data) {
    return prisma.role.create({ data });
  }
  async findById(id) {
    return prisma.role.findUnique({ where: { id } });
  }
  async list(recordStatus) {
    if (recordStatus === "ALL") return prisma.role.findMany({ orderBy: { name: "asc" } });
    return prisma.role.findMany({
      where: { deleted: recordStatus === "INACTIVE" },
      orderBy: { name: "asc" }
    });
  }
  async update(id, data) {
    return prisma.role.update({ where: { id }, data });
  }
};

// src/modules/statuses/repository/status.repository.ts
var StatusRepository = class {
  async create(data) {
    return prisma.status.create({ data });
  }
  async findById(id) {
    return prisma.status.findUnique({ where: { id } });
  }
  async findByCode(code) {
    return prisma.status.findUnique({ where: { code: code.toUpperCase() } });
  }
  async findMany(recordStatus) {
    if (recordStatus === "ALL") return prisma.status.findMany({ orderBy: { createdAt: "desc" } });
    return prisma.status.findMany({
      where: { deleted: recordStatus === "INACTIVE" },
      orderBy: { createdAt: "desc" }
    });
  }
  async update(id, data) {
    return prisma.status.update({ where: { id }, data });
  }
};

// src/modules/statuses/service/status.service.ts
var StatusService = class {
  constructor(repository2 = new StatusRepository()) {
    this.repository = repository2;
  }
  repository;
  async create(input) {
    return this.repository.create({
      code: input.code.toUpperCase(),
      name: input.name,
      description: input.description
    });
  }
  async list(recordStatus) {
    return this.repository.findMany(recordStatus);
  }
  async get(id) {
    const status = await this.repository.findById(id);
    if (!status) throw new AppError("Status not found", 404);
    return status;
  }
  async getByCode(code) {
    const found = await this.repository.findByCode(code);
    if (found && !found.deleted) return found;
    return this.repository.create({
      code: code.toUpperCase(),
      name: code.toUpperCase(),
      description: `Auto-created status ${code.toUpperCase()}`
    });
  }
  async update(id, input) {
    await this.get(id);
    return this.repository.update(id, {
      code: input.code.toUpperCase(),
      name: input.name,
      description: input.description
    });
  }
  async patch(id, input) {
    await this.get(id);
    return this.repository.update(id, {
      ...input.code ? { code: input.code.toUpperCase() } : {},
      ...input.name ? { name: input.name } : {},
      ...input.description !== void 0 ? { description: input.description } : {},
      ...input.active !== void 0 ? { deleted: !input.active } : {}
    });
  }
  async softDelete(id) {
    await this.get(id);
    await this.repository.update(id, { deleted: true });
  }
};

// src/modules/users/service/user.service.ts
import { ImageOwnerType } from "@prisma/client";

// src/modules/users/mapper/user.mapper.ts
var toUserOutput = (user, profileImage) => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  status: user.status?.code ?? null,
  emailVerified: user.emailVerified,
  roles: user.roles.map((r) => r.role.name),
  profileImage,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

// src/modules/users/repository/user.repository.ts
var UserRepository = class {
  include = { status: true, roles: { include: { role: true } } };
  async create(data) {
    return prisma.user.create({ data, include: this.include });
  }
  async findByEmail(email) {
    return prisma.user.findFirst({ where: { email: email.toLowerCase() }, include: this.include });
  }
  async findById(id) {
    return prisma.user.findUnique({ where: { id }, include: this.include });
  }
  async findMany(params) {
    const where = {
      ...params.statusId ? { statusId: params.statusId } : {},
      ...params.recordStatus === "ALL" ? {} : { deleted: params.recordStatus === "INACTIVE" }
    };
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { [params.sortBy]: params.direction },
        include: this.include
      }),
      prisma.user.count({ where })
    ]);
    return { items, total };
  }
  async update(id, data) {
    return prisma.user.update({ where: { id }, data, include: this.include });
  }
};

// src/modules/users/service/user.service.ts
var UserService = class {
  constructor(repository2 = new UserRepository(), roleRepository = new RoleRepository(), statusService = new StatusService(), audit = new AuditService()) {
    this.repository = repository2;
    this.roleRepository = roleRepository;
    this.statusService = statusService;
    this.audit = audit;
  }
  repository;
  roleRepository;
  statusService;
  audit;
  async toResponse(user) {
    if (!user) throw new AppError("User not found", 404);
    const profileImage = await prisma.imageAsset.findFirst({
      where: { ownerType: ImageOwnerType.USER, ownerId: user.id, primaryImage: true, deleted: false },
      orderBy: { createdAt: "asc" }
    });
    return toUserOutput(user, profileImage);
  }
  async create(input, actorId) {
    const existing = await this.repository.findByEmail(input.email);
    if (existing && !existing.deleted) throw new AppError("Email already registered", 409);
    const userRole = await this.roleRepository.findByName("USER");
    if (!userRole) throw new AppError("Default role not configured", 500);
    const status = input.statusId ? await this.statusService.get(input.statusId) : await this.statusService.getByCode("PENDING");
    const hashed = await bcrypt2.hash(input.password, 12);
    const user = await this.repository.create({
      fullName: input.fullName,
      email: input.email.toLowerCase(),
      password: hashed,
      phone: input.phone,
      status: { connect: { id: status.id } },
      roles: {
        create: [{ role: { connect: { id: userRole.id } } }]
      }
    });
    await this.audit.log({ userId: actorId, action: "CREATE", resource: "USER", resourceId: user.id });
    return this.toResponse(user);
  }
  async getById(id) {
    const user = await this.repository.findById(id);
    if (!user) throw new AppError("User not found", 404);
    return this.toResponse(user);
  }
  async me(userId) {
    const user = await this.repository.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    return this.toResponse(user);
  }
  async list(query) {
    const { page, size, skip, take } = parsePageQuery(query);
    const sortBy = ["fullName", "email", "createdAt", "updatedAt"].includes(query.sortBy ?? "") ? query.sortBy : "createdAt";
    const direction = query.direction === "asc" ? "asc" : "desc";
    const recordStatus = query.recordStatus ?? "ACTIVE";
    const { items, total } = await this.repository.findMany({
      skip,
      take,
      statusId: query.statusId,
      recordStatus,
      sortBy,
      direction
    });
    const mapped = await Promise.all(items.map((item) => this.toResponse(item)));
    return toPageResponse(mapped, total, page, size);
  }
  async patch(id, input, actorId) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new AppError("User not found", 404);
    const user = await this.repository.update(id, {
      ...input.fullName ? { fullName: input.fullName } : {},
      ...input.email ? { email: input.email.toLowerCase() } : {},
      ...input.phone !== void 0 ? { phone: input.phone } : {},
      ...input.statusId ? { status: { connect: { id: input.statusId } } } : {},
      ...input.active !== void 0 ? { deleted: !input.active } : {}
    });
    await this.audit.log({ userId: actorId, action: "PATCH", resource: "USER", resourceId: id });
    return this.toResponse(user);
  }
  async addRole(userId, roleName, actorId) {
    const user = await this.repository.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    const role = await this.roleRepository.findByName(roleName);
    if (!role) throw new AppError("Role not found", 400);
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId, roleId: role.id } },
      update: {},
      create: { userId, roleId: role.id }
    });
    await this.audit.log({ userId: actorId, action: "ADD_ROLE", resource: "USER", resourceId: userId });
    const updated = await this.repository.findById(userId);
    return this.toResponse(updated);
  }
  async softDelete(id, actorId) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new AppError("User not found", 404);
    const deletedStatus = await this.statusService.getByCode("DELETED");
    await this.repository.update(id, {
      deleted: true,
      deletedAt: /* @__PURE__ */ new Date(),
      status: { connect: { id: deletedStatus.id } }
    });
    await this.audit.log({ userId: actorId, action: "SOFT_DELETE", resource: "USER", resourceId: id });
  }
};

// src/modules/images/service/image.service.ts
import { ImageOwnerType as ImageOwnerType2 } from "@prisma/client";
var ImageService = class {
  async validateOwner(ownerType, ownerId) {
    if (ownerType === ImageOwnerType2.USER) {
      const user = await prisma.user.findUnique({ where: { id: ownerId } });
      if (!user || user.deleted) throw new AppError("Owner user not found", 404);
    }
  }
  async unsetCurrentPrimary(ownerType, ownerId) {
    await prisma.imageAsset.updateMany({
      where: { ownerType, ownerId, primaryImage: true, deleted: false },
      data: { primaryImage: false }
    });
  }
  async create(ownerTypeInput, ownerId, input) {
    const ownerType = ImageOwnerType2[ownerTypeInput];
    if (!ownerType) throw new AppError("Invalid owner type", 400);
    await this.validateOwner(ownerType, ownerId);
    if (input.primaryImage) {
      await this.unsetCurrentPrimary(ownerType, ownerId);
    }
    return prisma.imageAsset.create({
      data: {
        ownerType,
        ownerId,
        url: input.url,
        fileName: input.fileName,
        contentType: input.contentType,
        sizeBytes: BigInt(input.sizeBytes),
        primaryImage: input.primaryImage ?? false,
        sortOrder: input.sortOrder ?? 0
      }
    });
  }
  async list(ownerTypeInput, ownerId, recordStatus) {
    const ownerType = ImageOwnerType2[ownerTypeInput];
    if (!ownerType) throw new AppError("Invalid owner type", 400);
    return prisma.imageAsset.findMany({
      where: {
        ownerType,
        ownerId,
        ...recordStatus === "ALL" ? {} : { deleted: recordStatus === "INACTIVE" }
      },
      orderBy: [{ primaryImage: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }]
    });
  }
  async getPrimary(ownerTypeInput, ownerId) {
    const ownerType = ImageOwnerType2[ownerTypeInput];
    if (!ownerType) throw new AppError("Invalid owner type", 400);
    return prisma.imageAsset.findFirst({
      where: { ownerType, ownerId, primaryImage: true, deleted: false },
      orderBy: { createdAt: "asc" }
    });
  }
  async setPrimary(ownerTypeInput, ownerId, imageId) {
    const ownerType = ImageOwnerType2[ownerTypeInput];
    if (!ownerType) throw new AppError("Invalid owner type", 400);
    await this.validateOwner(ownerType, ownerId);
    await this.unsetCurrentPrimary(ownerType, ownerId);
    const image = await prisma.imageAsset.findUnique({ where: { id: imageId } });
    if (!image || image.deleted) throw new AppError("Image not found", 404);
    await prisma.imageAsset.update({ where: { id: imageId }, data: { primaryImage: true } });
  }
  async patchStatus(imageId, active) {
    const image = await prisma.imageAsset.findUnique({ where: { id: imageId } });
    if (!image) throw new AppError("Image not found", 404);
    return prisma.imageAsset.update({ where: { id: imageId }, data: { deleted: !active } });
  }
  async softDelete(imageId) {
    const image = await prisma.imageAsset.findUnique({ where: { id: imageId } });
    if (!image || image.deleted) throw new AppError("Image not found", 404);
    await prisma.imageAsset.update({ where: { id: imageId }, data: { deleted: true } });
  }
};

// src/modules/users/controller/user.controller.ts
var service2 = new UserService();
var imageService = new ImageService();
var hasRole = (req, role) => (req.user?.roles ?? []).includes(role);
var ensureSelfOrAdmin = (req, targetUserId) => {
  if (req.user?.sub === targetUserId || hasRole(req, "ADMIN")) return;
  throw new AppError("Forbidden", 403);
};
var UserController = class {
  async create(req, res) {
    const data = await service2.create(req.body, req.user?.sub);
    res.json(successResponse("User created successfully", data));
  }
  async list(req, res) {
    const data = await service2.list({
      page: req.query.page ? Number(req.query.page) : void 0,
      size: req.query.size ? Number(req.query.size) : void 0,
      sortBy: req.query.sortBy,
      direction: req.query.direction,
      statusId: req.query.statusId,
      recordStatus: req.query.recordStatus
    });
    res.json(successResponse("Users retrieved successfully", data));
  }
  async getById(req, res) {
    ensureSelfOrAdmin(req, req.params.id);
    const data = await service2.getById(req.params.id);
    res.json(successResponse("User retrieved successfully", data));
  }
  async me(req, res) {
    const data = await service2.me(req.user.sub);
    res.json(successResponse("Current user profile retrieved successfully", data));
  }
  async patch(req, res) {
    ensureSelfOrAdmin(req, req.params.id);
    const data = await service2.patch(req.params.id, req.body, req.user?.sub);
    res.json(successResponse("User updated successfully", data));
  }
  async addRole(req, res) {
    const data = await service2.addRole(req.params.id, req.body.roleName, req.user?.sub);
    res.json(successResponse("Role added successfully", data));
  }
  async remove(req, res) {
    await service2.softDelete(req.params.id, req.user?.sub);
    res.json(successResponse("User deleted successfully"));
  }
  async uploadProfileImage(req, res) {
    ensureSelfOrAdmin(req, req.params.id);
    const url = req.body.url;
    const fileName = req.body.fileName ?? "remote-file";
    const contentType = req.body.contentType ?? "application/octet-stream";
    const sizeBytes = req.body.sizeBytes ? Number(req.body.sizeBytes) : 1;
    const sortOrder = req.body.sortOrder ? Number(req.body.sortOrder) : void 0;
    if (!url) throw new AppError("Provide url", 400);
    const data = await imageService.create("USER", req.params.id, {
      url,
      fileName,
      contentType,
      sizeBytes,
      primaryImage: true,
      sortOrder
    });
    res.json(successResponse("Profile image updated successfully", data));
  }
  async getProfileImage(req, res) {
    ensureSelfOrAdmin(req, req.params.id);
    const data = await imageService.getPrimary("USER", req.params.id);
    res.json(successResponse("Profile image retrieved successfully", data));
  }
};

// src/middlewares/auth.middleware.ts
import jwt2 from "jsonwebtoken";
var authMiddleware = (req, _res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) throw new AppError("Missing authorization header", 401);
  const [type, token] = authorization.split(" ");
  if (type !== "Bearer" || !token) throw new AppError("Invalid authorization header", 401);
  try {
    const payload = jwt2.verify(token, env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    throw new AppError("Invalid token", 401);
  }
};

// src/middlewares/roles.middleware.ts
var rolesMiddleware = (roles) => {
  return (req, _res, next) => {
    const userRoles = req.user?.roles ?? [];
    const hasRole2 = userRoles.some((role) => roles.includes(role));
    if (!hasRole2) throw new AppError("Forbidden", 403);
    next();
  };
};

// src/modules/users/validator/user.validator.ts
import { z as z2 } from "zod";
var createUserSchema = z2.object({
  fullName: z2.string().min(3),
  email: z2.string().email(),
  password: z2.string().min(8),
  phone: z2.string().optional(),
  statusId: z2.string().uuid().optional()
});
var updateUserSchema = z2.object({
  fullName: z2.string().min(3).optional(),
  email: z2.string().email().optional(),
  phone: z2.string().optional(),
  statusId: z2.string().uuid().optional(),
  active: z2.boolean().optional()
}).refine((obj) => Object.keys(obj).length > 0, { message: "At least one field must be sent" });
var addUserRoleSchema = z2.object({
  roleName: z2.string().min(1)
});
var profileImageSchema = z2.object({
  url: z2.string().url(),
  fileName: z2.string().optional(),
  contentType: z2.string().optional(),
  sizeBytes: z2.number().int().positive().optional(),
  sortOrder: z2.number().int().optional()
});

// src/modules/users/routes/user.routes.ts
var controller2 = new UserController();
var userRoutes = Router2();
userRoutes.use(authMiddleware);
userRoutes.post("/", rolesMiddleware(["ADMIN"]), validationMiddleware(createUserSchema), asyncHandler(controller2.create.bind(controller2)));
userRoutes.get("/", rolesMiddleware(["ADMIN", "MANAGER"]), asyncHandler(controller2.list.bind(controller2)));
userRoutes.get("/me", asyncHandler(controller2.me.bind(controller2)));
userRoutes.get("/:id", asyncHandler(controller2.getById.bind(controller2)));
userRoutes.patch("/:id", validationMiddleware(updateUserSchema), asyncHandler(controller2.patch.bind(controller2)));
userRoutes.patch("/:id/roles", rolesMiddleware(["ADMIN"]), validationMiddleware(addUserRoleSchema), asyncHandler(controller2.addRole.bind(controller2)));
userRoutes.delete("/:id", rolesMiddleware(["ADMIN"]), asyncHandler(controller2.remove.bind(controller2)));
userRoutes.post("/:id/profile-image", validationMiddleware(profileImageSchema), asyncHandler(controller2.uploadProfileImage.bind(controller2)));
userRoutes.get("/:id/profile-image", asyncHandler(controller2.getProfileImage.bind(controller2)));

// src/modules/roles/routes/role.routes.ts
import { Router as Router3 } from "express";

// src/modules/roles/service/role.service.ts
var RoleService = class {
  constructor(repository2 = new RoleRepository()) {
    this.repository = repository2;
  }
  repository;
  async create(input) {
    return this.repository.create({
      name: input.name.toUpperCase(),
      description: input.description
    });
  }
  async list(recordStatus) {
    return this.repository.list(recordStatus);
  }
  async get(id) {
    const role = await this.repository.findById(id);
    if (!role) throw new AppError("Role not found", 404);
    return role;
  }
  async update(id, input) {
    await this.get(id);
    return this.repository.update(id, {
      name: input.name.toUpperCase(),
      description: input.description
    });
  }
  async patch(id, input) {
    await this.get(id);
    return this.repository.update(id, {
      ...input.name ? { name: input.name.toUpperCase() } : {},
      ...input.description !== void 0 ? { description: input.description } : {},
      ...input.active !== void 0 ? { deleted: !input.active } : {}
    });
  }
  async softDelete(id) {
    await this.get(id);
    await this.repository.update(id, { deleted: true });
  }
};

// src/modules/roles/controller/role.controller.ts
var service3 = new RoleService();
var RoleController = class {
  async create(req, res) {
    const data = await service3.create(req.body);
    res.json(successResponse("Role created successfully", data));
  }
  async list(req, res) {
    const recordStatus = req.query.recordStatus ?? "ACTIVE";
    const data = await service3.list(recordStatus);
    res.json(successResponse("Roles retrieved successfully", data));
  }
  async get(req, res) {
    const data = await service3.get(req.params.id);
    res.json(successResponse("Role retrieved successfully", data));
  }
  async update(req, res) {
    const data = await service3.update(req.params.id, req.body);
    res.json(successResponse("Role updated successfully", data));
  }
  async patch(req, res) {
    const data = await service3.patch(req.params.id, req.body);
    res.json(successResponse("Role patched successfully", data));
  }
  async delete(req, res) {
    await service3.softDelete(req.params.id);
    res.json(successResponse("Role deleted successfully"));
  }
};

// src/modules/roles/validator/role.validator.ts
import { z as z3 } from "zod";
var createRoleSchema = z3.object({
  name: z3.string().min(1),
  description: z3.string().optional()
});
var patchRoleSchema = z3.object({
  name: z3.string().min(1).optional(),
  description: z3.string().nullable().optional(),
  active: z3.boolean().optional()
}).refine((obj) => Object.keys(obj).length > 0, { message: "At least one field must be sent" });

// src/modules/roles/routes/role.routes.ts
var controller3 = new RoleController();
var roleRoutes = Router3();
roleRoutes.use(authMiddleware);
roleRoutes.post("/", rolesMiddleware(["ADMIN"]), validationMiddleware(createRoleSchema), asyncHandler(controller3.create.bind(controller3)));
roleRoutes.get("/", asyncHandler(controller3.list.bind(controller3)));
roleRoutes.get("/:id", asyncHandler(controller3.get.bind(controller3)));
roleRoutes.put("/:id", rolesMiddleware(["ADMIN"]), validationMiddleware(createRoleSchema), asyncHandler(controller3.update.bind(controller3)));
roleRoutes.patch("/:id", rolesMiddleware(["ADMIN"]), validationMiddleware(patchRoleSchema), asyncHandler(controller3.patch.bind(controller3)));
roleRoutes.delete("/:id", rolesMiddleware(["ADMIN"]), asyncHandler(controller3.delete.bind(controller3)));

// src/modules/statuses/routes/status.routes.ts
import { Router as Router4 } from "express";

// src/modules/statuses/controller/status.controller.ts
var service4 = new StatusService();
var StatusController = class {
  async create(req, res) {
    const data = await service4.create(req.body);
    res.json(successResponse("Status created successfully", data));
  }
  async list(req, res) {
    const recordStatus = req.query.recordStatus ?? "ACTIVE";
    const data = await service4.list(recordStatus);
    res.json(successResponse("Statuses retrieved successfully", data));
  }
  async get(req, res) {
    const data = await service4.get(req.params.id);
    res.json(successResponse("Status retrieved successfully", data));
  }
  async update(req, res) {
    const data = await service4.update(req.params.id, req.body);
    res.json(successResponse("Status updated successfully", data));
  }
  async patch(req, res) {
    const data = await service4.patch(req.params.id, req.body);
    res.json(successResponse("Status patched successfully", data));
  }
  async delete(req, res) {
    await service4.softDelete(req.params.id);
    res.json(successResponse("Status deleted successfully"));
  }
};

// src/modules/statuses/validator/status.validator.ts
import { z as z4 } from "zod";
var createStatusSchema = z4.object({
  code: z4.string().min(1),
  name: z4.string().min(1),
  description: z4.string().optional()
});
var patchStatusSchema = z4.object({
  code: z4.string().min(1).optional(),
  name: z4.string().min(1).optional(),
  description: z4.string().nullable().optional(),
  active: z4.boolean().optional()
}).refine((obj) => Object.keys(obj).length > 0, { message: "At least one field must be sent" });

// src/modules/statuses/routes/status.routes.ts
var controller4 = new StatusController();
var statusRoutes = Router4();
statusRoutes.use(authMiddleware);
statusRoutes.post("/", rolesMiddleware(["ADMIN"]), validationMiddleware(createStatusSchema), asyncHandler(controller4.create.bind(controller4)));
statusRoutes.get("/", asyncHandler(controller4.list.bind(controller4)));
statusRoutes.get("/:id", asyncHandler(controller4.get.bind(controller4)));
statusRoutes.put("/:id", rolesMiddleware(["ADMIN"]), validationMiddleware(createStatusSchema), asyncHandler(controller4.update.bind(controller4)));
statusRoutes.patch("/:id", rolesMiddleware(["ADMIN"]), validationMiddleware(patchStatusSchema), asyncHandler(controller4.patch.bind(controller4)));
statusRoutes.delete("/:id", rolesMiddleware(["ADMIN"]), asyncHandler(controller4.delete.bind(controller4)));

// src/modules/tickets/routes/ticket.routes.ts
import { Router as Router5 } from "express";

// src/modules/tickets/service/ticket.service.ts
import { TicketStatus } from "@prisma/client";
var TicketService = class {
  async create(userId, input) {
    return prisma.ticket.create({
      data: {
        subject: input.subject,
        description: input.description,
        status: TicketStatus.PENDENTE,
        requester: { connect: { id: userId } }
      },
      include: { requester: true }
    });
  }
  async list(actor, query) {
    const { page, size, skip, take } = parsePageQuery(query);
    const sortBy = ["subject", "status", "createdAt", "updatedAt"].includes(query.sortBy ?? "") ? query.sortBy : "createdAt";
    const direction = query.direction === "asc" ? "asc" : "desc";
    const recordStatus = query.recordStatus ?? "ACTIVE";
    const isAdmin = actor.roles.includes("ADMIN");
    const where = {
      ...query.status ? { status: query.status } : {},
      ...recordStatus === "ALL" ? {} : { deleted: recordStatus === "INACTIVE" },
      ...isAdmin ? {} : { requesterId: actor.id }
    };
    const [items, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: direction },
        include: { requester: true }
      }),
      prisma.ticket.count({ where })
    ]);
    return toPageResponse(
      items.map((ticket) => ({
        id: ticket.id,
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
        requesterId: ticket.requesterId,
        requesterEmail: ticket.requester.email,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt
      })),
      total,
      page,
      size
    );
  }
  async get(actor, id) {
    const ticket = await prisma.ticket.findUnique({ where: { id }, include: { requester: true } });
    if (!ticket) throw new AppError("Ticket not found", 404);
    if (!actor.roles.includes("ADMIN") && ticket.requesterId !== actor.id) {
      throw new AppError("You cannot access this ticket", 400);
    }
    return {
      id: ticket.id,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      requesterId: ticket.requesterId,
      requesterEmail: ticket.requester.email,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt
    };
  }
  async patch(actor, id, input) {
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new AppError("Ticket not found", 404);
    if (!actor.roles.includes("ADMIN")) {
      if (ticket.requesterId !== actor.id) throw new AppError("You cannot change this ticket", 400);
      if ([TicketStatus.RESOLVIDO, TicketStatus.FECHADO].includes(ticket.status)) {
        throw new AppError("Ticket is finalized and cannot be changed by requester", 400);
      }
    }
    const updated = await prisma.ticket.update({
      where: { id },
      data: {
        ...input.subject ? { subject: input.subject } : {},
        ...input.description ? { description: input.description } : {}
      },
      include: { requester: true }
    });
    return {
      id: updated.id,
      subject: updated.subject,
      description: updated.description,
      status: updated.status,
      requesterId: updated.requesterId,
      requesterEmail: updated.requester.email,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt
    };
  }
  async patchStatus(actor, id, status) {
    if (!actor.roles.includes("ADMIN")) throw new AppError("Only admin can update ticket status", 400);
    const ticket = await prisma.ticket.findUnique({ where: { id }, include: { requester: true } });
    if (!ticket || ticket.deleted) throw new AppError("Ticket not found", 404);
    const updated = await prisma.ticket.update({ where: { id }, data: { status }, include: { requester: true } });
    return {
      id: updated.id,
      subject: updated.subject,
      description: updated.description,
      status: updated.status,
      requesterId: updated.requesterId,
      requesterEmail: updated.requester.email,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt
    };
  }
  async softDelete(actor, id) {
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket || ticket.deleted) throw new AppError("Ticket not found", 404);
    if (!actor.roles.includes("ADMIN")) {
      if (ticket.requesterId !== actor.id) throw new AppError("You cannot change this ticket", 400);
      if ([TicketStatus.RESOLVIDO, TicketStatus.FECHADO].includes(ticket.status)) {
        throw new AppError("Ticket is finalized and cannot be changed by requester", 400);
      }
    }
    await prisma.ticket.update({ where: { id }, data: { deleted: true } });
  }
};

// src/modules/tickets/controller/ticket.controller.ts
var service5 = new TicketService();
var TicketController = class {
  async create(req, res) {
    const data = await service5.create(req.user.sub, req.body);
    res.json(successResponse("Ticket created successfully", data));
  }
  async list(req, res) {
    const data = await service5.list(
      { id: req.user.sub, roles: req.user.roles },
      {
        page: req.query.page ? Number(req.query.page) : void 0,
        size: req.query.size ? Number(req.query.size) : void 0,
        sortBy: req.query.sortBy,
        direction: req.query.direction,
        status: req.query.status,
        recordStatus: req.query.recordStatus
      }
    );
    res.json(successResponse("Tickets retrieved successfully", data));
  }
  async get(req, res) {
    const data = await service5.get({ id: req.user.sub, roles: req.user.roles }, req.params.id);
    res.json(successResponse("Ticket retrieved successfully", data));
  }
  async patch(req, res) {
    const data = await service5.patch({ id: req.user.sub, roles: req.user.roles }, req.params.id, req.body);
    res.json(successResponse("Ticket updated successfully", data));
  }
  async patchStatus(req, res) {
    const data = await service5.patchStatus({ roles: req.user.roles }, req.params.id, req.body.status);
    res.json(successResponse("Ticket status updated successfully", data));
  }
  async remove(req, res) {
    await service5.softDelete({ id: req.user.sub, roles: req.user.roles }, req.params.id);
    res.json(successResponse("Ticket deleted successfully"));
  }
};

// src/modules/tickets/validator/ticket.validator.ts
import { z as z5 } from "zod";
var createTicketSchema = z5.object({
  subject: z5.string().min(1),
  description: z5.string().min(1)
});
var patchTicketSchema = z5.object({
  subject: z5.string().min(1).optional(),
  description: z5.string().min(1).optional()
}).refine((obj) => Object.keys(obj).length > 0, { message: "At least one field must be sent" });
var patchTicketStatusSchema = z5.object({
  status: z5.enum(["PENDENTE", "PROCESSANDO", "RESOLVIDO", "FECHADO"])
});

// src/modules/tickets/routes/ticket.routes.ts
var controller5 = new TicketController();
var ticketRoutes = Router5();
ticketRoutes.use(authMiddleware);
ticketRoutes.post("/", validationMiddleware(createTicketSchema), asyncHandler(controller5.create.bind(controller5)));
ticketRoutes.get("/", asyncHandler(controller5.list.bind(controller5)));
ticketRoutes.get("/:id", asyncHandler(controller5.get.bind(controller5)));
ticketRoutes.patch("/:id", validationMiddleware(patchTicketSchema), asyncHandler(controller5.patch.bind(controller5)));
ticketRoutes.patch("/:id/status", validationMiddleware(patchTicketStatusSchema), asyncHandler(controller5.patchStatus.bind(controller5)));
ticketRoutes.delete("/:id", asyncHandler(controller5.remove.bind(controller5)));

// src/modules/images/routes/image.routes.ts
import { Router as Router6 } from "express";

// src/modules/images/controller/image.controller.ts
var service6 = new ImageService();
var ImageController = class {
  async create(req, res) {
    const data = await service6.create(req.params.ownerType, req.params.ownerId, req.body);
    res.json(successResponse("Image created successfully", data));
  }
  async list(req, res) {
    const recordStatus = req.query.recordStatus ?? "ACTIVE";
    const data = await service6.list(req.params.ownerType, req.params.ownerId, recordStatus);
    res.json(successResponse("Images retrieved successfully", data));
  }
  async setPrimary(req, res) {
    await service6.setPrimary(req.params.ownerType, req.params.ownerId, req.params.imageId);
    res.json(successResponse("Primary image updated successfully"));
  }
  async patchStatus(req, res) {
    const active = String(req.query.active) === "true";
    const data = await service6.patchStatus(req.params.imageId, active);
    res.json(successResponse("Image status updated successfully", data));
  }
  async remove(req, res) {
    await service6.softDelete(req.params.imageId);
    res.json(successResponse("Image deleted successfully"));
  }
};

// src/modules/images/validator/image.validator.ts
import { z as z6 } from "zod";
var createImageSchema = z6.object({
  url: z6.string().url(),
  fileName: z6.string().min(1),
  contentType: z6.string().min(1),
  sizeBytes: z6.number().int().positive(),
  primaryImage: z6.boolean().optional(),
  sortOrder: z6.number().int().optional()
});

// src/modules/images/routes/image.routes.ts
var controller6 = new ImageController();
var imageRoutes = Router6();
imageRoutes.use(authMiddleware);
imageRoutes.post("/:ownerType/:ownerId", rolesMiddleware(["ADMIN", "MANAGER"]), validationMiddleware(createImageSchema), asyncHandler(controller6.create.bind(controller6)));
imageRoutes.get("/:ownerType/:ownerId", asyncHandler(controller6.list.bind(controller6)));
imageRoutes.patch("/:ownerType/:ownerId/:imageId/primary", rolesMiddleware(["ADMIN", "MANAGER"]), asyncHandler(controller6.setPrimary.bind(controller6)));
imageRoutes.patch("/:imageId/status", rolesMiddleware(["ADMIN", "MANAGER"]), asyncHandler(controller6.patchStatus.bind(controller6)));
imageRoutes.delete("/:imageId", rolesMiddleware(["ADMIN", "MANAGER"]), asyncHandler(controller6.remove.bind(controller6)));

// src/modules/sites/routes/site.routes.ts
import { Router as Router7 } from "express";

// src/modules/sites/mapper/site.mapper.ts
var toSiteOutput = (site) => ({
  id: site.id,
  name: site.name,
  address: site.address,
  city: site.city,
  country: site.country,
  description: site.description,
  deleted: site.deleted,
  createdAt: site.createdAt,
  updatedAt: site.updatedAt
});

// src/modules/sites/repository/site.repository.ts
var SiteRepository = class {
  async create(data) {
    return prisma.site.create({ data });
  }
  async findById(id) {
    return prisma.site.findUnique({ where: { id } });
  }
  async findByName(name) {
    return prisma.site.findFirst({ where: { name, deleted: false } });
  }
  async findMany(params) {
    const where = {
      ...params.recordStatus === "ALL" ? {} : { deleted: params.recordStatus === "INACTIVE" },
      ...params.search ? {
        OR: [
          { name: { contains: params.search, mode: "insensitive" } },
          { city: { contains: params.search, mode: "insensitive" } },
          { country: { contains: params.search, mode: "insensitive" } }
        ]
      } : {}
    };
    const [items, total] = await Promise.all([
      prisma.site.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { [params.sortBy]: params.direction }
      }),
      prisma.site.count({ where })
    ]);
    return { items, total };
  }
  async update(id, data) {
    return prisma.site.update({ where: { id }, data });
  }
};

// src/modules/sites/controller/site.controller.ts
var SiteService = class {
  constructor(repository2 = new SiteRepository(), audit = new AuditService()) {
    this.repository = repository2;
    this.audit = audit;
  }
  repository;
  audit;
  async create(input, actorId) {
    const existing = await this.repository.findByName(input.name);
    if (existing) throw new AppError("A site with this name already exists", 409);
    const site = await this.repository.create({
      name: input.name.trim(),
      address: input.address ?? null,
      city: input.city ?? null,
      country: input.country ?? null,
      description: input.description ?? null
    });
    await this.audit.log({ userId: actorId, action: "CREATE", resource: "SITE", resourceId: site.id });
    return toSiteOutput(site);
  }
  async getById(id) {
    const site = await this.repository.findById(id);
    if (!site || site.deleted) throw new AppError("Site not found", 404);
    return toSiteOutput(site);
  }
  async list(query) {
    const { page, size, skip, take } = parsePageQuery(query);
    const allowedSortFields = ["name", "city", "country", "createdAt", "updatedAt"];
    const sortBy = allowedSortFields.includes(query.sortBy ?? "") ? query.sortBy : "createdAt";
    const direction = query.direction === "asc" ? "asc" : "desc";
    const recordStatus = query.recordStatus ?? "ACTIVE";
    const { items, total } = await this.repository.findMany({
      skip,
      take,
      sortBy,
      direction,
      recordStatus,
      search: query.search
    });
    return toPageResponse(items.map(toSiteOutput), total, page, size);
  }
  async update(id, input, actorId) {
    const existing = await this.repository.findById(id);
    if (!existing || existing.deleted) throw new AppError("Site not found", 404);
    if (input.name && input.name.trim() !== existing.name) {
      const nameConflict = await this.repository.findByName(input.name.trim());
      if (nameConflict) throw new AppError("A site with this name already exists", 409);
    }
    const site = await this.repository.update(id, {
      ...input.name ? { name: input.name.trim() } : {},
      ...input.address !== void 0 ? { address: input.address } : {},
      ...input.city !== void 0 ? { city: input.city } : {},
      ...input.country !== void 0 ? { country: input.country } : {},
      ...input.description !== void 0 ? { description: input.description } : {}
    });
    await this.audit.log({ userId: actorId, action: "UPDATE", resource: "SITE", resourceId: id });
    return toSiteOutput(site);
  }
  async softDelete(id, actorId) {
    const existing = await this.repository.findById(id);
    if (!existing || existing.deleted) throw new AppError("Site not found", 404);
    await this.repository.update(id, { deleted: true });
    await this.audit.log({ userId: actorId, action: "SOFT_DELETE", resource: "SITE", resourceId: id });
  }
  async restore(id, actorId) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new AppError("Site not found", 404);
    if (!existing.deleted) throw new AppError("Site is already active", 400);
    const site = await this.repository.update(id, { deleted: false });
    await this.audit.log({ userId: actorId, action: "RESTORE", resource: "SITE", resourceId: id });
    return toSiteOutput(site);
  }
};

// src/modules/sites/validator/site.validator.ts
import { z as z7 } from "zod";
var createSiteSchema = z7.object({
  name: z7.string().min(2, "Name must have at least 2 characters"),
  address: z7.string().optional(),
  city: z7.string().optional(),
  country: z7.string().optional(),
  description: z7.string().optional()
});
var updateSiteSchema = z7.object({
  name: z7.string().min(2).optional(),
  address: z7.string().optional(),
  city: z7.string().optional(),
  country: z7.string().optional(),
  description: z7.string().optional()
}).refine((obj) => Object.keys(obj).length > 0, {
  message: "At least one field must be sent"
});

// src/modules/sites/routes/site.routes.ts
var service7 = new SiteService();
var siteRoutes = Router7();
siteRoutes.use(authMiddleware);
siteRoutes.post(
  "/",
  rolesMiddleware(["ADMIN", "MANAGER"]),
  validationMiddleware(createSiteSchema),
  asyncHandler(async (req, res) => {
    const site = await service7.create(req.body, req.user?.id);
    res.status(201).json({ success: true, message: "Site created successfully", data: site });
  })
);
siteRoutes.get(
  "/",
  rolesMiddleware(["ADMIN", "MANAGER"]),
  asyncHandler(async (req, res) => {
    const page = await service7.list(req.query);
    res.status(200).json({ success: true, message: "Sites fetched successfully", data: page });
  })
);
siteRoutes.get(
  "/:id",
  rolesMiddleware(["ADMIN", "MANAGER"]),
  asyncHandler(async (req, res) => {
    const site = await service7.getById(req.params.id);
    res.status(200).json({ success: true, message: "Site fetched successfully", data: site });
  })
);
siteRoutes.patch(
  "/:id",
  rolesMiddleware(["ADMIN", "MANAGER"]),
  validationMiddleware(updateSiteSchema),
  asyncHandler(async (req, res) => {
    const site = await service7.update(req.params.id, req.body, req.user?.id);
    res.status(200).json({ success: true, message: "Site updated successfully", data: site });
  })
);
siteRoutes.delete(
  "/:id",
  rolesMiddleware(["ADMIN"]),
  asyncHandler(async (req, res) => {
    await service7.softDelete(req.params.id, req.user?.id);
    res.status(200).json({ success: true, message: "Site deleted successfully", data: null });
  })
);
siteRoutes.patch(
  "/:id/restore",
  rolesMiddleware(["ADMIN"]),
  asyncHandler(async (req, res) => {
    const site = await service7.restore(req.params.id, req.user?.id);
    res.status(200).json({ success: true, message: "Site restored successfully", data: site });
  })
);

// src/modules/devices/routes/device.routes.ts
import { Router as Router8 } from "express";

// src/modules/devices/service/device.service.ts
import { MonitoringStatus } from "@prisma/client";

// src/modules/devices/mapper/device.mapper.ts
var toDeviceOutput = (device) => ({
  id: device.id,
  name: device.name,
  hostname: device.hostname,
  ipAddress: device.ipAddress,
  macAddress: device.macAddress,
  type: device.type,
  description: device.description,
  currentStatus: device.currentStatus,
  active: device.active,
  deleted: device.deleted,
  site: device.site ? {
    id: device.site.id,
    name: device.site.name,
    city: device.site.city,
    country: device.site.country
  } : null,
  createdAt: device.createdAt,
  updatedAt: device.updatedAt
});

// src/modules/devices/repository/device.repository.ts
var siteSelect = {
  id: true,
  name: true,
  city: true,
  country: true
};
var DeviceRepository = class {
  include = { site: { select: siteSelect } };
  async create(data) {
    return prisma.device.create({ data, include: this.include });
  }
  async findById(id) {
    return prisma.device.findUnique({ where: { id }, include: this.include });
  }
  async findByIp(ipAddress) {
    return prisma.device.findFirst({ where: { ipAddress, deleted: false } });
  }
  async findByIpExcluding(ipAddress, excludeId) {
    return prisma.device.findFirst({
      where: { ipAddress, deleted: false, id: { not: excludeId } }
    });
  }
  async findMany(params) {
    const where = {
      ...params.recordStatus === "ALL" ? {} : { deleted: params.recordStatus === "INACTIVE" },
      ...params.siteId ? { siteId: params.siteId } : {},
      ...params.type ? { type: params.type } : {},
      ...params.currentStatus ? { currentStatus: params.currentStatus } : {},
      ...params.active !== void 0 ? { active: params.active } : {},
      ...params.search ? {
        OR: [
          { name: { contains: params.search, mode: "insensitive" } },
          { hostname: { contains: params.search, mode: "insensitive" } },
          { ipAddress: { contains: params.search, mode: "insensitive" } },
          { description: { contains: params.search, mode: "insensitive" } }
        ]
      } : {}
    };
    const [items, total] = await Promise.all([
      prisma.device.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { [params.sortBy]: params.direction },
        include: this.include
      }),
      prisma.device.count({ where })
    ]);
    return { items, total };
  }
  async update(id, data) {
    return prisma.device.update({ where: { id }, data, include: this.include });
  }
  async countBySite(siteId) {
    return prisma.device.count({ where: { siteId, deleted: false } });
  }
};

// src/modules/devices/service/device.service.ts
var VALID_SORT_FIELDS = ["name", "ipAddress", "type", "currentStatus", "createdAt", "updatedAt"];
var DeviceService = class {
  constructor(repository2 = new DeviceRepository(), audit = new AuditService()) {
    this.repository = repository2;
    this.audit = audit;
  }
  repository;
  audit;
  async assertSiteExists(siteId) {
    const site = await prisma.site.findUnique({ where: { id: siteId } });
    if (!site || site.deleted) throw new AppError("Site not found", 404);
  }
  async create(input, actorId) {
    const existing = await this.repository.findByIp(input.ipAddress);
    if (existing) throw new AppError("A device with this IP address already exists", 409);
    if (input.siteId) await this.assertSiteExists(input.siteId);
    const device = await this.repository.create({
      name: input.name.trim(),
      hostname: input.hostname ?? null,
      ipAddress: input.ipAddress.trim(),
      macAddress: input.macAddress ?? null,
      type: input.type,
      description: input.description ?? null,
      currentStatus: MonitoringStatus.OFFLINE,
      active: true,
      ...input.siteId ? { site: { connect: { id: input.siteId } } } : {}
    });
    await this.audit.log({ userId: actorId, action: "CREATE", resource: "DEVICE", resourceId: device.id });
    return toDeviceOutput(device);
  }
  async getById(id) {
    const device = await this.repository.findById(id);
    if (!device || device.deleted) throw new AppError("Device not found", 404);
    return toDeviceOutput(device);
  }
  async list(query) {
    const { page, size, skip, take } = parsePageQuery(query);
    const sortBy = VALID_SORT_FIELDS.includes(query.sortBy) ? query.sortBy : "createdAt";
    const direction = query.direction === "asc" ? "asc" : "desc";
    const recordStatus = query.recordStatus ?? "ACTIVE";
    const { items, total } = await this.repository.findMany({
      skip,
      take,
      sortBy,
      direction,
      recordStatus,
      search: query.search,
      siteId: query.siteId,
      type: query.type,
      currentStatus: query.currentStatus,
      active: query.active
    });
    return toPageResponse(items.map(toDeviceOutput), total, page, size);
  }
  async update(id, input, actorId) {
    const existing = await this.repository.findById(id);
    if (!existing || existing.deleted) throw new AppError("Device not found", 404);
    if (input.ipAddress && input.ipAddress.trim() !== existing.ipAddress) {
      const conflict = await this.repository.findByIpExcluding(input.ipAddress.trim(), id);
      if (conflict) throw new AppError("A device with this IP address already exists", 409);
    }
    if (input.siteId) await this.assertSiteExists(input.siteId);
    const device = await this.repository.update(id, {
      ...input.name ? { name: input.name.trim() } : {},
      ...input.hostname !== void 0 ? { hostname: input.hostname } : {},
      ...input.ipAddress ? { ipAddress: input.ipAddress.trim() } : {},
      ...input.macAddress !== void 0 ? { macAddress: input.macAddress } : {},
      ...input.type ? { type: input.type } : {},
      ...input.description !== void 0 ? { description: input.description } : {},
      ...input.active !== void 0 ? { active: input.active } : {},
      ...input.siteId !== void 0 ? input.siteId === null ? { site: { disconnect: true } } : { site: { connect: { id: input.siteId } } } : {}
    });
    await this.audit.log({ userId: actorId, action: "UPDATE", resource: "DEVICE", resourceId: id });
    return toDeviceOutput(device);
  }
  async softDelete(id, actorId) {
    const existing = await this.repository.findById(id);
    if (!existing || existing.deleted) throw new AppError("Device not found", 404);
    await this.repository.update(id, { deleted: true, active: false });
    await this.audit.log({ userId: actorId, action: "SOFT_DELETE", resource: "DEVICE", resourceId: id });
  }
  async restore(id, actorId) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new AppError("Device not found", 404);
    if (!existing.deleted) throw new AppError("Device is already active", 400);
    const device = await this.repository.update(id, { deleted: false, active: true });
    await this.audit.log({ userId: actorId, action: "RESTORE", resource: "DEVICE", resourceId: id });
    return toDeviceOutput(device);
  }
  // usado internamente pelo scheduler — não exposto via API directamente
  async updateStatus(id, status) {
    return this.repository.update(id, { currentStatus: status });
  }
};

// src/modules/devices/controller/device.controller.ts
var service8 = new DeviceService();
var DeviceController = class {
  async create(req, res) {
    const data = await service8.create(req.body, req.user?.sub);
    res.status(201).json(successResponse("Device created successfully", data));
  }
  async list(req, res) {
    const data = await service8.list({
      page: req.query.page ? Number(req.query.page) : void 0,
      size: req.query.size ? Number(req.query.size) : void 0,
      sortBy: req.query.sortBy,
      direction: req.query.direction,
      recordStatus: req.query.recordStatus,
      search: req.query.search,
      siteId: req.query.siteId,
      type: req.query.type,
      currentStatus: req.query.currentStatus,
      active: req.query.active !== void 0 ? req.query.active === "true" : void 0
    });
    res.json(successResponse("Devices retrieved successfully", data));
  }
  async getById(req, res) {
    const data = await service8.getById(req.params.id);
    res.json(successResponse("Device retrieved successfully", data));
  }
  async update(req, res) {
    const data = await service8.update(req.params.id, req.body, req.user?.sub);
    res.json(successResponse("Device updated successfully", data));
  }
  async remove(req, res) {
    await service8.softDelete(req.params.id, req.user?.sub);
    res.json(successResponse("Device deleted successfully"));
  }
  async restore(req, res) {
    const data = await service8.restore(req.params.id, req.user?.sub);
    res.json(successResponse("Device restored successfully", data));
  }
};

// src/modules/devices/validator/device.validator.ts
import { z as z8 } from "zod";
import { DeviceType as DeviceType2, MonitoringStatus as MonitoringStatus2 } from "@prisma/client";
var deviceTypeValues = Object.values(DeviceType2);
var monitoringStatusValues = Object.values(MonitoringStatus2);
var ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
var createDeviceSchema = z8.object({
  name: z8.string().min(2, "Name must have at least 2 characters"),
  hostname: z8.string().optional(),
  ipAddress: z8.string().regex(ipv4Regex, "Invalid IPv4 address"),
  macAddress: z8.string().optional(),
  type: z8.enum(deviceTypeValues, {
    errorMap: () => ({ message: `Type must be one of: ${deviceTypeValues.join(", ")}` })
  }),
  description: z8.string().optional(),
  siteId: z8.string().uuid("Invalid site ID").optional()
});
var updateDeviceSchema = z8.object({
  name: z8.string().min(2).optional(),
  hostname: z8.string().optional(),
  ipAddress: z8.string().regex(ipv4Regex, "Invalid IPv4 address").optional(),
  macAddress: z8.string().optional(),
  type: z8.enum(deviceTypeValues).optional(),
  description: z8.string().optional(),
  siteId: z8.string().uuid().optional().nullable(),
  active: z8.boolean().optional()
}).refine((obj) => Object.keys(obj).length > 0, {
  message: "At least one field must be sent"
});
var listDeviceSchema = z8.object({
  page: z8.coerce.number().int().min(0).optional(),
  size: z8.coerce.number().int().min(1).max(100).optional(),
  sortBy: z8.enum(["name", "ipAddress", "type", "currentStatus", "createdAt", "updatedAt"]).optional(),
  direction: z8.enum(["asc", "desc"]).optional(),
  recordStatus: z8.enum(["ACTIVE", "INACTIVE", "ALL"]).optional(),
  search: z8.string().optional(),
  siteId: z8.string().uuid().optional(),
  type: z8.enum(deviceTypeValues).optional(),
  currentStatus: z8.enum(monitoringStatusValues).optional(),
  active: z8.coerce.boolean().optional()
});

// src/modules/devices/routes/device.routes.ts
var controller7 = new DeviceController();
var deviceRoutes = Router8();
deviceRoutes.use(authMiddleware);
deviceRoutes.post(
  "/",
  rolesMiddleware(["ADMIN", "MANAGER"]),
  validationMiddleware(createDeviceSchema),
  asyncHandler(controller7.create.bind(controller7))
);
deviceRoutes.get(
  "/",
  rolesMiddleware(["ADMIN", "MANAGER"]),
  validationMiddleware(listDeviceSchema, "query"),
  asyncHandler(controller7.list.bind(controller7))
);
deviceRoutes.get(
  "/:id",
  rolesMiddleware(["ADMIN", "MANAGER"]),
  asyncHandler(controller7.getById.bind(controller7))
);
deviceRoutes.patch(
  "/:id",
  rolesMiddleware(["ADMIN", "MANAGER"]),
  validationMiddleware(updateDeviceSchema),
  asyncHandler(controller7.update.bind(controller7))
);
deviceRoutes.delete(
  "/:id",
  rolesMiddleware(["ADMIN"]),
  asyncHandler(controller7.remove.bind(controller7))
);
deviceRoutes.patch(
  "/:id/restore",
  rolesMiddleware(["ADMIN"]),
  asyncHandler(controller7.restore.bind(controller7))
);

// src/modules/service-monitors/routes/service-monitor.routes.ts
import { Router as Router9 } from "express";

// src/modules/service-monitors/mapper/service-monitor.mapper.ts
var toServiceMonitorOutput = (sm) => ({
  id: sm.id,
  name: sm.name,
  type: sm.type,
  port: sm.port,
  enabled: sm.enabled,
  timeoutSeconds: sm.timeoutSeconds,
  device: {
    id: sm.device.id,
    name: sm.device.name,
    ipAddress: sm.device.ipAddress
  },
  createdAt: sm.createdAt,
  updatedAt: sm.updatedAt
});

// src/modules/service-monitors/repository/service-monitor.repository.ts
var deviceSelect = {
  id: true,
  name: true,
  ipAddress: true
};
var ServiceMonitorRepository = class {
  include = { device: { select: deviceSelect } };
  async create(data) {
    return prisma.serviceMonitor.create({ data, include: this.include });
  }
  async findById(id) {
    return prisma.serviceMonitor.findUnique({ where: { id }, include: this.include });
  }
  async findByDeviceAndTypeAndPort(deviceId, type, port) {
    return prisma.serviceMonitor.findFirst({
      where: { deviceId, type, port }
    });
  }
  async findByDeviceAndTypeAndPortExcluding(deviceId, type, port, excludeId) {
    return prisma.serviceMonitor.findFirst({
      where: { deviceId, type, port, id: { not: excludeId } }
    });
  }
  async findMany(params) {
    const where = {
      ...params.deviceId ? { deviceId: params.deviceId } : {},
      ...params.type ? { type: params.type } : {},
      ...params.enabled !== void 0 ? { enabled: params.enabled } : {},
      ...params.search ? {
        OR: [
          { name: { contains: params.search, mode: "insensitive" } },
          { device: { name: { contains: params.search, mode: "insensitive" } } },
          { device: { ipAddress: { contains: params.search, mode: "insensitive" } } }
        ]
      } : {}
    };
    const [items, total] = await Promise.all([
      prisma.serviceMonitor.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { [params.sortBy]: params.direction },
        include: this.include
      }),
      prisma.serviceMonitor.count({ where })
    ]);
    return { items, total };
  }
  async findAllEnabledByDevice(deviceId) {
    return prisma.serviceMonitor.findMany({
      where: { deviceId, enabled: true },
      include: this.include
    });
  }
  async findAllEnabled() {
    return prisma.serviceMonitor.findMany({
      where: { enabled: true },
      include: this.include
    });
  }
  async update(id, data) {
    return prisma.serviceMonitor.update({ where: { id }, data, include: this.include });
  }
  async delete(id) {
    return prisma.serviceMonitor.delete({ where: { id } });
  }
};

// src/modules/service-monitors/service/service-monitor.service.ts
var VALID_SORT_FIELDS2 = ["name", "type", "port", "createdAt", "updatedAt"];
var ServiceMonitorService = class {
  constructor(repository2 = new ServiceMonitorRepository(), audit = new AuditService()) {
    this.repository = repository2;
    this.audit = audit;
  }
  repository;
  audit;
  async assertDeviceExists(deviceId) {
    const device = await prisma.device.findUnique({ where: { id: deviceId } });
    if (!device || device.deleted) throw new AppError("Device not found", 404);
    return device;
  }
  async create(input, actorId) {
    await this.assertDeviceExists(input.deviceId);
    const conflict = await this.repository.findByDeviceAndTypeAndPort(
      input.deviceId,
      input.type,
      input.port
    );
    if (conflict) {
      throw new AppError(
        `This device already has a ${input.type} service monitor on port ${input.port}`,
        409
      );
    }
    const sm = await this.repository.create({
      name: input.name.trim(),
      type: input.type,
      port: input.port,
      enabled: input.enabled ?? true,
      timeoutSeconds: input.timeoutSeconds ?? 5,
      device: { connect: { id: input.deviceId } }
    });
    await this.audit.log({
      userId: actorId,
      action: "CREATE",
      resource: "SERVICE_MONITOR",
      resourceId: sm.id
    });
    return toServiceMonitorOutput(sm);
  }
  async getById(id) {
    const sm = await this.repository.findById(id);
    if (!sm) throw new AppError("Service monitor not found", 404);
    return toServiceMonitorOutput(sm);
  }
  async list(query) {
    const { page, size, skip, take } = parsePageQuery(query);
    const sortBy = VALID_SORT_FIELDS2.includes(query.sortBy) ? query.sortBy : "createdAt";
    const direction = query.direction === "asc" ? "asc" : "desc";
    const { items, total } = await this.repository.findMany({
      skip,
      take,
      sortBy,
      direction,
      deviceId: query.deviceId,
      type: query.type,
      enabled: query.enabled,
      search: query.search
    });
    return toPageResponse(items.map(toServiceMonitorOutput), total, page, size);
  }
  async listByDevice(deviceId) {
    await this.assertDeviceExists(deviceId);
    const items = await this.repository.findAllEnabledByDevice(deviceId);
    return items.map(toServiceMonitorOutput);
  }
  async update(id, input, actorId) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new AppError("Service monitor not found", 404);
    const newType = input.type ?? existing.type;
    const newPort = input.port ?? existing.port;
    if (input.type || input.port) {
      const conflict = await this.repository.findByDeviceAndTypeAndPortExcluding(
        existing.deviceId,
        newType,
        newPort,
        id
      );
      if (conflict) {
        throw new AppError(
          `This device already has a ${newType} service monitor on port ${newPort}`,
          409
        );
      }
    }
    const sm = await this.repository.update(id, {
      ...input.name ? { name: input.name.trim() } : {},
      ...input.type ? { type: input.type } : {},
      ...input.port !== void 0 ? { port: input.port } : {},
      ...input.enabled !== void 0 ? { enabled: input.enabled } : {},
      ...input.timeoutSeconds !== void 0 ? { timeoutSeconds: input.timeoutSeconds } : {}
    });
    await this.audit.log({
      userId: actorId,
      action: "UPDATE",
      resource: "SERVICE_MONITOR",
      resourceId: id
    });
    return toServiceMonitorOutput(sm);
  }
  async remove(id, actorId) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new AppError("Service monitor not found", 404);
    await this.repository.delete(id);
    await this.audit.log({
      userId: actorId,
      action: "DELETE",
      resource: "SERVICE_MONITOR",
      resourceId: id
    });
  }
  async toggleEnabled(id, actorId) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new AppError("Service monitor not found", 404);
    const sm = await this.repository.update(id, { enabled: !existing.enabled });
    await this.audit.log({
      userId: actorId,
      action: existing.enabled ? "DISABLE" : "ENABLE",
      resource: "SERVICE_MONITOR",
      resourceId: id
    });
    return toServiceMonitorOutput(sm);
  }
};

// src/modules/service-monitors/controller/service-monitor.controller.ts
var service9 = new ServiceMonitorService();
var ServiceMonitorController = class {
  async create(req, res) {
    const data = await service9.create(req.body, req.user?.sub);
    res.status(201).json(successResponse("Service monitor created successfully", data));
  }
  async list(req, res) {
    const data = await service9.list({
      page: req.query.page ? Number(req.query.page) : void 0,
      size: req.query.size ? Number(req.query.size) : void 0,
      sortBy: req.query.sortBy,
      direction: req.query.direction,
      deviceId: req.query.deviceId,
      type: req.query.type,
      enabled: req.query.enabled !== void 0 ? req.query.enabled === "true" : void 0,
      search: req.query.search
    });
    res.json(successResponse("Service monitors retrieved successfully", data));
  }
  async getById(req, res) {
    const data = await service9.getById(req.params.id);
    res.json(successResponse("Service monitor retrieved successfully", data));
  }
  async listByDevice(req, res) {
    const data = await service9.listByDevice(req.params.deviceId);
    res.json(successResponse("Device service monitors retrieved successfully", data));
  }
  async update(req, res) {
    const data = await service9.update(req.params.id, req.body, req.user?.sub);
    res.json(successResponse("Service monitor updated successfully", data));
  }
  async remove(req, res) {
    await service9.remove(req.params.id, req.user?.sub);
    res.json(successResponse("Service monitor deleted successfully"));
  }
  async toggleEnabled(req, res) {
    const data = await service9.toggleEnabled(req.params.id, req.user?.sub);
    res.json(successResponse("Service monitor toggled successfully", data));
  }
};

// src/modules/service-monitors/validator/service-monitor.validator.ts
import { z as z9 } from "zod";
import { ServiceType } from "@prisma/client";
var serviceTypeValues = Object.values(ServiceType);
var createServiceMonitorSchema = z9.object({
  deviceId: z9.string().uuid("Invalid device ID"),
  name: z9.string().min(2, "Name must have at least 2 characters"),
  type: z9.enum(serviceTypeValues, {
    errorMap: () => ({ message: `Type must be one of: ${serviceTypeValues.join(", ")}` })
  }),
  port: z9.number({ invalid_type_error: "Port must be a number" }).int("Port must be an integer").min(1, "Port must be between 1 and 65535").max(65535, "Port must be between 1 and 65535"),
  enabled: z9.boolean().optional().default(true),
  timeoutSeconds: z9.number().int().min(1, "Timeout must be at least 1 second").max(60, "Timeout cannot exceed 60 seconds").optional().default(5)
});
var updateServiceMonitorSchema = z9.object({
  name: z9.string().min(2).optional(),
  type: z9.enum(serviceTypeValues).optional(),
  port: z9.number().int().min(1).max(65535).optional(),
  enabled: z9.boolean().optional(),
  timeoutSeconds: z9.number().int().min(1).max(60).optional()
}).refine((obj) => Object.keys(obj).length > 0, {
  message: "At least one field must be sent"
});
var listServiceMonitorSchema = z9.object({
  page: z9.coerce.number().int().min(0).optional(),
  size: z9.coerce.number().int().min(1).max(100).optional(),
  sortBy: z9.enum(["name", "type", "port", "createdAt", "updatedAt"]).optional(),
  direction: z9.enum(["asc", "desc"]).optional(),
  deviceId: z9.string().uuid().optional(),
  type: z9.enum(serviceTypeValues).optional(),
  enabled: z9.coerce.boolean().optional(),
  search: z9.string().optional()
});

// src/modules/service-monitors/routes/service-monitor.routes.ts
var controller8 = new ServiceMonitorController();
var serviceMonitorRoutes = Router9();
serviceMonitorRoutes.use(authMiddleware);
serviceMonitorRoutes.post(
  "/",
  rolesMiddleware(["ADMIN", "MANAGER"]),
  validationMiddleware(createServiceMonitorSchema),
  asyncHandler(controller8.create.bind(controller8))
);
serviceMonitorRoutes.get(
  "/",
  rolesMiddleware(["ADMIN", "MANAGER"]),
  validationMiddleware(listServiceMonitorSchema, "query"),
  asyncHandler(controller8.list.bind(controller8))
);
serviceMonitorRoutes.get(
  "/device/:deviceId",
  rolesMiddleware(["ADMIN", "MANAGER"]),
  asyncHandler(controller8.listByDevice.bind(controller8))
);
serviceMonitorRoutes.get(
  "/:id",
  rolesMiddleware(["ADMIN", "MANAGER"]),
  asyncHandler(controller8.getById.bind(controller8))
);
serviceMonitorRoutes.patch(
  "/:id",
  rolesMiddleware(["ADMIN", "MANAGER"]),
  validationMiddleware(updateServiceMonitorSchema),
  asyncHandler(controller8.update.bind(controller8))
);
serviceMonitorRoutes.patch(
  "/:id/toggle",
  rolesMiddleware(["ADMIN", "MANAGER"]),
  asyncHandler(controller8.toggleEnabled.bind(controller8))
);
serviceMonitorRoutes.delete(
  "/:id",
  rolesMiddleware(["ADMIN"]),
  asyncHandler(controller8.remove.bind(controller8))
);

// src/modules/alerts/routes/alert.routes.ts
import { Router as Router10 } from "express";

// src/modules/alerts/service/alert.service.ts
import { AlertLevel } from "@prisma/client";

// src/modules/alerts/mapper/alert.mapper.ts
var toAlertOutput = (alert) => ({
  id: alert.id,
  title: alert.title,
  message: alert.message,
  level: alert.level,
  acknowledged: alert.acknowledged,
  acknowledgedAt: alert.acknowledgedAt,
  acknowledgedBy: alert.acknowledgedBy,
  resolved: alert.resolved,
  resolvedAt: alert.resolvedAt,
  device: {
    id: alert.device.id,
    name: alert.device.name,
    ipAddress: alert.device.ipAddress
  },
  createdAt: alert.createdAt,
  updatedAt: alert.updatedAt
});

// src/modules/alerts/repository/alert.repository.ts
var deviceSelect2 = {
  id: true,
  name: true,
  ipAddress: true
};
var AlertRepository = class {
  include = { device: { select: deviceSelect2 } };
  async findById(id) {
    return prisma.alert.findUnique({ where: { id }, include: this.include });
  }
  async findMany(params) {
    const where = {
      ...params.deviceId ? { deviceId: params.deviceId } : {},
      ...params.level ? { level: params.level } : {},
      ...params.acknowledged !== void 0 ? { acknowledged: params.acknowledged } : {},
      ...params.resolved !== void 0 ? { resolved: params.resolved } : {},
      ...params.search ? {
        OR: [
          { title: { contains: params.search, mode: "insensitive" } },
          { message: { contains: params.search, mode: "insensitive" } },
          { device: { name: { contains: params.search, mode: "insensitive" } } }
        ]
      } : {}
    };
    const [items, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { [params.sortBy]: params.direction },
        include: this.include
      }),
      prisma.alert.count({ where })
    ]);
    return { items, total };
  }
  async update(id, data) {
    return prisma.alert.update({ where: { id }, data, include: this.include });
  }
  async countUnresolved() {
    return prisma.alert.count({ where: { resolved: false } });
  }
  async countByLevel(level) {
    return prisma.alert.count({ where: { level, resolved: false } });
  }
};

// src/modules/alerts/service/alert.service.ts
var VALID_SORT_FIELDS3 = ["level", "createdAt", "updatedAt"];
var AlertService = class {
  constructor(repository2 = new AlertRepository(), audit = new AuditService()) {
    this.repository = repository2;
    this.audit = audit;
  }
  repository;
  audit;
  async getById(id) {
    const alert = await this.repository.findById(id);
    if (!alert) throw new AppError("Alert not found", 404);
    return toAlertOutput(alert);
  }
  async list(query) {
    const { page, size, skip, take } = parsePageQuery(query);
    const sortBy = VALID_SORT_FIELDS3.includes(query.sortBy) ? query.sortBy : "createdAt";
    const direction = query.direction === "asc" ? "asc" : "desc";
    const { items, total } = await this.repository.findMany({
      skip,
      take,
      sortBy,
      direction,
      deviceId: query.deviceId,
      level: query.level,
      acknowledged: query.acknowledged,
      resolved: query.resolved,
      search: query.search
    });
    return toPageResponse(items.map(toAlertOutput), total, page, size);
  }
  async acknowledge(id, actorId) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new AppError("Alert not found", 404);
    if (existing.acknowledged) throw new AppError("Alert is already acknowledged", 400);
    const alert = await this.repository.update(id, {
      acknowledged: true,
      acknowledgedAt: /* @__PURE__ */ new Date(),
      acknowledgedBy: actorId ?? null
    });
    await this.audit.log({
      userId: actorId,
      action: "ACKNOWLEDGE",
      resource: "ALERT",
      resourceId: id
    });
    return toAlertOutput(alert);
  }
  async resolve(id, actorId) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new AppError("Alert not found", 404);
    if (existing.resolved) throw new AppError("Alert is already resolved", 400);
    const alert = await this.repository.update(id, {
      resolved: true,
      resolvedAt: /* @__PURE__ */ new Date(),
      // se ainda não foi acknowledged, acknowledger automaticamente ao resolver
      ...existing.acknowledged ? {} : { acknowledged: true, acknowledgedAt: /* @__PURE__ */ new Date(), acknowledgedBy: actorId ?? null }
    });
    await this.audit.log({
      userId: actorId,
      action: "RESOLVE",
      resource: "ALERT",
      resourceId: id
    });
    return toAlertOutput(alert);
  }
  async resolveAllByDevice(deviceId, actorId) {
    const { prisma: prisma2 } = await import("./prisma-LC2YR5VD.mjs");
    await prisma2.alert.updateMany({
      where: { deviceId, resolved: false },
      data: {
        resolved: true,
        resolvedAt: /* @__PURE__ */ new Date()
      }
    });
    await this.audit.log({
      userId: actorId,
      action: "RESOLVE_ALL",
      resource: "ALERT",
      resourceId: deviceId
    });
  }
  // Sumário para o dashboard
  async getSummary() {
    const [total, critical, warning, info] = await Promise.all([
      this.repository.countUnresolved(),
      this.repository.countByLevel(AlertLevel.CRITICAL),
      this.repository.countByLevel(AlertLevel.WARNING),
      this.repository.countByLevel(AlertLevel.INFO)
    ]);
    return { total, critical, warning, info };
  }
};

// src/modules/alerts/controller/alert.controller.ts
var service10 = new AlertService();
var AlertController = class {
  async list(req, res) {
    const data = await service10.list({
      page: req.query.page ? Number(req.query.page) : void 0,
      size: req.query.size ? Number(req.query.size) : void 0,
      sortBy: req.query.sortBy,
      direction: req.query.direction,
      deviceId: req.query.deviceId,
      level: req.query.level,
      acknowledged: req.query.acknowledged !== void 0 ? req.query.acknowledged === "true" : void 0,
      resolved: req.query.resolved !== void 0 ? req.query.resolved === "true" : void 0,
      search: req.query.search
    });
    res.json(successResponse("Alerts retrieved successfully", data));
  }
  async getById(req, res) {
    const data = await service10.getById(req.params.id);
    res.json(successResponse("Alert retrieved successfully", data));
  }
  async acknowledge(req, res) {
    const data = await service10.acknowledge(req.params.id, req.user?.sub);
    res.json(successResponse("Alert acknowledged successfully", data));
  }
  async resolve(req, res) {
    const data = await service10.resolve(req.params.id, req.user?.sub);
    res.json(successResponse("Alert resolved successfully", data));
  }
  async resolveAllByDevice(req, res) {
    await service10.resolveAllByDevice(req.params.deviceId, req.user?.sub);
    res.json(successResponse("All alerts for device resolved successfully"));
  }
  async getSummary(req, res) {
    const data = await service10.getSummary();
    res.json(successResponse("Alert summary retrieved successfully", data));
  }
};

// src/modules/alerts/validator/alert.validator.ts
import { z as z10 } from "zod";
import { AlertLevel as AlertLevel2 } from "@prisma/client";
var alertLevelValues = Object.values(AlertLevel2);
var listAlertSchema = z10.object({
  page: z10.coerce.number().int().min(0).optional(),
  size: z10.coerce.number().int().min(1).max(100).optional(),
  sortBy: z10.enum(["level", "createdAt", "updatedAt"]).optional(),
  direction: z10.enum(["asc", "desc"]).optional(),
  deviceId: z10.string().uuid().optional(),
  level: z10.enum(alertLevelValues).optional(),
  acknowledged: z10.coerce.boolean().optional(),
  resolved: z10.coerce.boolean().optional(),
  search: z10.string().optional()
});
var acknowledgeAlertSchema = z10.object({
  note: z10.string().max(500).optional()
});

// src/modules/alerts/routes/alert.routes.ts
var controller9 = new AlertController();
var alertRoutes = Router10();
alertRoutes.use(authMiddleware);
alertRoutes.get(
  "/summary",
  rolesMiddleware(["ADMIN", "MANAGER"]),
  asyncHandler(controller9.getSummary.bind(controller9))
);
alertRoutes.get(
  "/",
  rolesMiddleware(["ADMIN", "MANAGER"]),
  validationMiddleware(listAlertSchema, "query"),
  asyncHandler(controller9.list.bind(controller9))
);
alertRoutes.get(
  "/:id",
  rolesMiddleware(["ADMIN", "MANAGER"]),
  asyncHandler(controller9.getById.bind(controller9))
);
alertRoutes.patch(
  "/:id/acknowledge",
  rolesMiddleware(["ADMIN", "MANAGER"]),
  asyncHandler(controller9.acknowledge.bind(controller9))
);
alertRoutes.patch(
  "/:id/resolve",
  rolesMiddleware(["ADMIN"]),
  asyncHandler(controller9.resolve.bind(controller9))
);
alertRoutes.patch(
  "/device/:deviceId/resolve-all",
  rolesMiddleware(["ADMIN"]),
  asyncHandler(controller9.resolveAllByDevice.bind(controller9))
);

// src/modules/dashboard/routes/dashboard.routes.ts
import { Router as Router11 } from "express";

// src/modules/dashboard/repository/dashboard.repository.ts
import { MonitoringStatus as MonitoringStatus3 } from "@prisma/client";
var DashboardRepository = class {
  // -------------------------------------------------------------------------
  // Contagem de devices por status
  // -------------------------------------------------------------------------
  async getDeviceStatusCounts() {
    const [total, online, offline, warning] = await Promise.all([
      prisma.device.count({ where: { deleted: false } }),
      prisma.device.count({ where: { deleted: false, currentStatus: MonitoringStatus3.ONLINE } }),
      prisma.device.count({ where: { deleted: false, currentStatus: MonitoringStatus3.OFFLINE } }),
      prisma.device.count({ where: { deleted: false, currentStatus: MonitoringStatus3.WARNING } })
    ]);
    return { total, online, offline, warning };
  }
  // -------------------------------------------------------------------------
  // Contagem de alertas não resolvidos por nível
  // -------------------------------------------------------------------------
  async getAlertCounts() {
    const results = await prisma.alert.groupBy({
      by: ["level"],
      where: { resolved: false },
      _count: { id: true }
    });
    let critical = 0;
    let warning = 0;
    let info = 0;
    for (const row of results) {
      if (row.level === "CRITICAL") critical = row._count.id;
      if (row.level === "WARNING") warning = row._count.id;
      if (row.level === "INFO") info = row._count.id;
    }
    return { total: critical + warning + info, critical, warning, info };
  }
  // -------------------------------------------------------------------------
  // Distribuição de devices por tipo
  // -------------------------------------------------------------------------
  async getDevicesByType() {
    const results = await prisma.device.groupBy({
      by: ["type"],
      where: { deleted: false },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } }
    });
    return results.map((row) => ({
      type: row.type,
      total: row._count.id
    }));
  }
  // -------------------------------------------------------------------------
  // Últimos N alertas não resolvidos (mais recentes primeiro)
  // -------------------------------------------------------------------------
  async getRecentAlerts(limit = 10) {
    return prisma.alert.findMany({
      where: { resolved: false },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        title: true,
        level: true,
        acknowledged: true,
        resolved: true,
        createdAt: true,
        device: {
          select: { name: true, ipAddress: true }
        }
      }
    });
  }
  // -------------------------------------------------------------------------
  // Últimos N logs de monitoramento (verificações mais recentes)
  // -------------------------------------------------------------------------
  async getRecentLogs(limit = 20) {
    return prisma.monitoringLog.findMany({
      orderBy: { checkedAt: "desc" },
      take: limit,
      select: {
        id: true,
        deviceId: true,
        status: true,
        responseTime: true,
        packetLoss: true,
        message: true,
        checkedAt: true,
        device: {
          select: { name: true, ipAddress: true }
        }
      }
    });
  }
  // -------------------------------------------------------------------------
  // Top N devices com mais falhas nas últimas 24h
  // -------------------------------------------------------------------------
  async getTopUnreachable(limit = 5) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1e3);
    const results = await prisma.monitoringLog.groupBy({
      by: ["deviceId"],
      where: {
        status: MonitoringStatus3.OFFLINE,
        checkedAt: { gte: since }
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: limit
    });
    if (results.length === 0) return [];
    const deviceIds = results.map((r) => r.deviceId);
    const devices = await prisma.device.findMany({
      where: { id: { in: deviceIds } },
      select: { id: true, name: true, ipAddress: true }
    });
    const deviceMap = new Map(devices.map((d) => [d.id, d]));
    return results.map((row) => {
      const device = deviceMap.get(row.deviceId);
      if (!device) return null;
      return {
        deviceId: device.id,
        deviceName: device.name,
        deviceIp: device.ipAddress,
        failureCount: row._count.id
      };
    }).filter((item) => item !== null);
  }
};

// src/modules/dashboard/service/dashboard.service.ts
var DashboardService = class {
  constructor(repository2 = new DashboardRepository()) {
    this.repository = repository2;
  }
  repository;
  async getSummary() {
    const [
      deviceCounts,
      alertCounts,
      devicesByType,
      recentAlerts,
      recentLogs,
      topUnreachable
    ] = await Promise.all([
      this.repository.getDeviceStatusCounts(),
      this.repository.getAlertCounts(),
      this.repository.getDevicesByType(),
      this.repository.getRecentAlerts(10),
      this.repository.getRecentLogs(20),
      this.repository.getTopUnreachable(5)
    ]);
    return {
      devices: {
        total: deviceCounts.total,
        online: deviceCounts.online,
        offline: deviceCounts.offline,
        warning: deviceCounts.warning
      },
      alerts: {
        total: alertCounts.total,
        critical: alertCounts.critical,
        warning: alertCounts.warning,
        info: alertCounts.info
      },
      devicesByType,
      recentAlerts: recentAlerts.map((a) => ({
        id: a.id,
        title: a.title,
        level: a.level,
        acknowledged: a.acknowledged,
        resolved: a.resolved,
        deviceName: a.device.name,
        deviceIp: a.device.ipAddress,
        createdAt: a.createdAt
      })),
      recentLogs: recentLogs.map((l) => ({
        id: l.id,
        deviceId: l.deviceId,
        deviceName: l.device.name,
        deviceIp: l.device.ipAddress,
        status: l.status,
        responseTime: l.responseTime,
        packetLoss: l.packetLoss,
        message: l.message,
        checkedAt: l.checkedAt
      })),
      topUnreachable,
      generatedAt: /* @__PURE__ */ new Date()
    };
  }
  // -------------------------------------------------------------------------
  // Endpoint mais leve para polling frequente do frontend
  // Devolve apenas os contadores — sem logs nem alertas detalhados
  // -------------------------------------------------------------------------
  async getCounters() {
    const [deviceCounts, alertCounts] = await Promise.all([
      this.repository.getDeviceStatusCounts(),
      this.repository.getAlertCounts()
    ]);
    return {
      devices: deviceCounts,
      alerts: alertCounts,
      generatedAt: /* @__PURE__ */ new Date()
    };
  }
};

// src/modules/dashboard/controller/dashboard.controller.ts
var service11 = new DashboardService();
var DashboardController = class {
  async getSummary(req, res) {
    const data = await service11.getSummary();
    res.json(successResponse("Dashboard summary retrieved successfully", data));
  }
  async getCounters(req, res) {
    const data = await service11.getCounters();
    res.json(successResponse("Dashboard counters retrieved successfully", data));
  }
};

// src/modules/dashboard/routes/dashboard.routes.ts
var controller10 = new DashboardController();
var dashboardRoutes = Router11();
dashboardRoutes.use(authMiddleware);
dashboardRoutes.get(
  "/summary",
  rolesMiddleware(["ADMIN", "MANAGER"]),
  asyncHandler(controller10.getSummary.bind(controller10))
);
dashboardRoutes.get(
  "/counters",
  rolesMiddleware(["ADMIN", "MANAGER"]),
  asyncHandler(controller10.getCounters.bind(controller10))
);

// src/modules/monitoring-logs/routes/monitoring-log.routes.ts
import { Router as Router12 } from "express";

// src/modules/monitoring-logs/mapper/monitoring-log.mapper.ts
var toMonitoringLogOutput = (log) => ({
  id: log.id,
  status: log.status,
  responseTime: log.responseTime,
  packetLoss: log.packetLoss,
  message: log.message,
  checkedAt: log.checkedAt,
  device: {
    id: log.device.id,
    name: log.device.name,
    ipAddress: log.device.ipAddress,
    siteId: log.device.siteId,
    siteName: log.device.site?.name ?? null
  }
});

// src/modules/monitoring-logs/repository/monitoring-log.repository.ts
var deviceSelect3 = {
  id: true,
  name: true,
  ipAddress: true,
  siteId: true,
  site: { select: { name: true } }
};
var MonitoringLogRepository = class {
  include = { device: { select: deviceSelect3 } };
  async findMany(params) {
    const where = {
      ...params.deviceId ? { deviceId: params.deviceId } : {},
      ...params.status ? { status: params.status } : {},
      ...params.siteId ? { device: { siteId: params.siteId } } : {},
      ...params.from || params.to ? {
        checkedAt: {
          ...params.from ? { gte: params.from } : {},
          ...params.to ? { lte: params.to } : {}
        }
      } : {},
      ...params.search ? {
        OR: [
          { device: { name: { contains: params.search, mode: "insensitive" } } },
          { device: { ipAddress: { contains: params.search, mode: "insensitive" } } },
          { message: { contains: params.search, mode: "insensitive" } }
        ]
      } : {}
    };
    const [items, total] = await Promise.all([
      prisma.monitoringLog.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { [params.sortBy]: params.direction },
        include: this.include
      }),
      prisma.monitoringLog.count({ where })
    ]);
    return { items, total };
  }
  async findById(id) {
    return prisma.monitoringLog.findUnique({
      where: { id },
      include: this.include
    });
  }
  // -------------------------------------------------------------------------
  // Estatísticas agregadas por device num período
  // -------------------------------------------------------------------------
  async getStatsByDevice(deviceId, from, to) {
    const [counts, aggregates] = await Promise.all([
      prisma.monitoringLog.groupBy({
        by: ["status"],
        where: {
          deviceId,
          checkedAt: { gte: from, lte: to }
        },
        _count: { id: true }
      }),
      prisma.monitoringLog.aggregate({
        where: {
          deviceId,
          checkedAt: { gte: from, lte: to },
          responseTime: { not: null }
        },
        _avg: {
          responseTime: true,
          packetLoss: true
        }
      })
    ]);
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
      select: { name: true, ipAddress: true }
    });
    let onlineCount = 0;
    let offlineCount = 0;
    let warningCount = 0;
    for (const row of counts) {
      if (row.status === "ONLINE") onlineCount = row._count.id;
      if (row.status === "OFFLINE") offlineCount = row._count.id;
      if (row.status === "WARNING") warningCount = row._count.id;
    }
    const totalChecks = onlineCount + offlineCount + warningCount;
    const uptimePercent = totalChecks > 0 ? Math.round(onlineCount / totalChecks * 1e4) / 100 : 0;
    return {
      deviceId,
      deviceName: device?.name ?? "Unknown",
      deviceIp: device?.ipAddress ?? "",
      totalChecks,
      onlineCount,
      offlineCount,
      warningCount,
      uptimePercent,
      avgResponseTime: aggregates._avg.responseTime ? Math.round(aggregates._avg.responseTime) : null,
      avgPacketLoss: aggregates._avg.packetLoss ? Math.round(aggregates._avg.packetLoss * 100) / 100 : null,
      period: { from, to }
    };
  }
  // -------------------------------------------------------------------------
  // Últimas N verificações de um device específico — para mini-histórico
  // -------------------------------------------------------------------------
  async findLatestByDevice(deviceId, limit = 50) {
    return prisma.monitoringLog.findMany({
      where: { deviceId },
      orderBy: { checkedAt: "desc" },
      take: limit,
      include: this.include
    });
  }
  // -------------------------------------------------------------------------
  // Purge de logs antigos — útil para manutenção (chamado manualmente ou via cron)
  // -------------------------------------------------------------------------
  async deleteOlderThan(date) {
    return prisma.monitoringLog.deleteMany({
      where: { checkedAt: { lt: date } }
    });
  }
};

// src/modules/monitoring-logs/service/monitoring-log.service.ts
var VALID_SORT_FIELDS4 = ["checkedAt", "status", "responseTime"];
var defaultFrom = () => new Date(Date.now() - 24 * 60 * 60 * 1e3);
var defaultTo = () => /* @__PURE__ */ new Date();
var MonitoringLogService = class {
  constructor(repository2 = new MonitoringLogRepository()) {
    this.repository = repository2;
  }
  repository;
  async list(query) {
    const { page, size, skip, take } = parsePageQuery(query);
    const sortBy = VALID_SORT_FIELDS4.includes(query.sortBy) ? query.sortBy : "checkedAt";
    const direction = query.direction === "asc" ? "asc" : "desc";
    if (query.from && query.to && query.from > query.to) {
      throw new AppError('"from" must be earlier than "to"', 400);
    }
    const { items, total } = await this.repository.findMany({
      skip,
      take,
      sortBy,
      direction,
      deviceId: query.deviceId,
      siteId: query.siteId,
      status: query.status,
      from: query.from,
      to: query.to,
      search: query.search
    });
    return toPageResponse(items.map(toMonitoringLogOutput), total, page, size);
  }
  async getById(id) {
    const log = await this.repository.findById(id);
    if (!log) throw new AppError("Monitoring log not found", 404);
    return toMonitoringLogOutput(log);
  }
  async getStatsByDevice(deviceId, from, to) {
    const resolvedFrom = from ?? defaultFrom();
    const resolvedTo = to ?? defaultTo();
    if (resolvedFrom > resolvedTo) {
      throw new AppError('"from" must be earlier than "to"', 400);
    }
    return this.repository.getStatsByDevice(deviceId, resolvedFrom, resolvedTo);
  }
  async getLatestByDevice(deviceId, limit = 50) {
    const items = await this.repository.findLatestByDevice(deviceId, limit);
    return items.map(toMonitoringLogOutput);
  }
  // -------------------------------------------------------------------------
  // Purge manual — apenas ADMIN, máximo 90 dias de retenção por defeito
  // -------------------------------------------------------------------------
  async purgeOlderThan(days) {
    if (days < 1 || days > 365) {
      throw new AppError("Days must be between 1 and 365", 400);
    }
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1e3);
    const result = await this.repository.deleteOlderThan(cutoff);
    return { deleted: result.count, cutoffDate: cutoff };
  }
};

// src/modules/monitoring-logs/controller/monitoring-log.controller.ts
var service12 = new MonitoringLogService();
var MonitoringLogController = class {
  async list(req, res) {
    const data = await service12.list({
      page: req.query.page ? Number(req.query.page) : void 0,
      size: req.query.size ? Number(req.query.size) : void 0,
      sortBy: req.query.sortBy,
      direction: req.query.direction,
      deviceId: req.query.deviceId,
      siteId: req.query.siteId,
      status: req.query.status,
      from: req.query.from ? new Date(req.query.from) : void 0,
      to: req.query.to ? new Date(req.query.to) : void 0,
      search: req.query.search
    });
    res.json(successResponse("Monitoring logs retrieved successfully", data));
  }
  async getById(req, res) {
    const data = await service12.getById(req.params.id);
    res.json(successResponse("Monitoring log retrieved successfully", data));
  }
  async getStatsByDevice(req, res) {
    const data = await service12.getStatsByDevice(
      req.query.deviceId,
      req.query.from ? new Date(req.query.from) : void 0,
      req.query.to ? new Date(req.query.to) : void 0
    );
    res.json(successResponse("Device stats retrieved successfully", data));
  }
  async getLatestByDevice(req, res) {
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const data = await service12.getLatestByDevice(req.params.deviceId, limit);
    res.json(successResponse("Latest logs retrieved successfully", data));
  }
  async purge(req, res) {
    const days = req.body.days ? Number(req.body.days) : 90;
    const data = await service12.purgeOlderThan(days);
    res.json(successResponse(`Purged logs older than ${days} days`, data));
  }
};

// src/modules/monitoring-logs/validator/monitoring-log.validator.ts
import { z as z11 } from "zod";
import { MonitoringStatus as MonitoringStatus4 } from "@prisma/client";
var monitoringStatusValues2 = Object.values(MonitoringStatus4);
var listMonitoringLogSchema = z11.object({
  page: z11.coerce.number().int().min(0).optional(),
  size: z11.coerce.number().int().min(1).max(200).optional(),
  sortBy: z11.enum(["checkedAt", "status", "responseTime"]).optional(),
  direction: z11.enum(["asc", "desc"]).optional(),
  deviceId: z11.string().uuid().optional(),
  siteId: z11.string().uuid().optional(),
  status: z11.enum(monitoringStatusValues2).optional(),
  from: z11.coerce.date().optional(),
  to: z11.coerce.date().optional(),
  search: z11.string().optional()
});
var statsQuerySchema = z11.object({
  deviceId: z11.string().uuid("Invalid device ID"),
  from: z11.coerce.date().optional(),
  to: z11.coerce.date().optional()
});
var latestByDeviceSchema = z11.object({
  limit: z11.coerce.number().int().min(1).max(200).optional()
});

// src/modules/monitoring-logs/routes/monitoring-log.routes.ts
var controller11 = new MonitoringLogController();
var monitoringLogRoutes = Router12();
monitoringLogRoutes.use(authMiddleware);
monitoringLogRoutes.get(
  "/",
  rolesMiddleware(["ADMIN", "MANAGER"]),
  validationMiddleware(listMonitoringLogSchema, "query"),
  asyncHandler(controller11.list.bind(controller11))
);
monitoringLogRoutes.get(
  "/stats",
  rolesMiddleware(["ADMIN", "MANAGER"]),
  validationMiddleware(statsQuerySchema, "query"),
  asyncHandler(controller11.getStatsByDevice.bind(controller11))
);
monitoringLogRoutes.get(
  "/device/:deviceId/latest",
  rolesMiddleware(["ADMIN", "MANAGER"]),
  validationMiddleware(latestByDeviceSchema, "query"),
  asyncHandler(controller11.getLatestByDevice.bind(controller11))
);
monitoringLogRoutes.get(
  "/:id",
  rolesMiddleware(["ADMIN", "MANAGER"]),
  asyncHandler(controller11.getById.bind(controller11))
);
monitoringLogRoutes.delete(
  "/purge",
  rolesMiddleware(["ADMIN"]),
  asyncHandler(controller11.purge.bind(controller11))
);

// src/shared/router.ts
var router = Router13();
router.use("/public/auth", authRoutes);
router.use("/api/users", userRoutes);
router.use("/api/roles", roleRoutes);
router.use("/api/statuses", statusRoutes);
router.use("/api/tickets", ticketRoutes);
router.use("/api/images", imageRoutes);
router.use("/api/sites", siteRoutes);
router.use("/api/devices", deviceRoutes);
router.use("/api/service-monitors", serviceMonitorRoutes);
router.use("/api/alerts", alertRoutes);
router.use("/api/dashboard", dashboardRoutes);
router.use("/api/monitoring-logs", monitoringLogRoutes);

// src/infra/http/app.ts
var app = express();
var allowedOrigins = env.CORS_ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean);
var isLocalOrigin = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
var isWildcardLocalRule = (rule) => /^https?:\/\/(localhost|127\.0\.0\.1):\*$/i.test(rule);
var isWildcardRule = (rule) => rule === "*";
var isExactMatch = (origin, rule) => origin === rule;
var isOriginAllowed = (origin) => allowedOrigins.some((rule) => {
  if (isWildcardRule(rule)) return true;
  if (isWildcardLocalRule(rule) && isLocalOrigin(origin)) return true;
  return isExactMatch(origin, rule);
});
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (isOriginAllowed(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
  })
);
app.use(rateLimit({ windowMs: 15 * 60 * 1e3, limit: 300 }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeMiddleware);
app.use(requestContextMiddleware);
app.use(requestLoggerMiddleware);
app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "healthy", data: { uptime: process.uptime() } });
});
app.get("/actuator/health", (_req, res) => {
  res.status(200).json({ status: "UP" });
});
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(router);
app.use(errorMiddleware);

// src/modules/auth/service/bootstrap-admin.service.ts
import bcrypt3 from "bcrypt";
var bootstrapAdmin = async () => {
  const roles = ["ADMIN", "USER", "MANAGER"];
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role },
      update: { deleted: false },
      create: { name: role, description: `${role} system role`, deleted: false }
    });
  }
  const statuses = ["ACTIVE", "INACTIVE", "BLOCKED", "PENDING", "DELETED"];
  for (const code of statuses) {
    await prisma.status.upsert({
      where: { code },
      update: { deleted: false },
      create: { code, name: code, description: `Default status ${code}` }
    });
  }
  const adminRole = await prisma.role.findUnique({ where: { name: "ADMIN" } });
  const activeStatus = await prisma.status.findUnique({ where: { code: "ACTIVE" } });
  if (!adminRole || !activeStatus) return;
  const hashed = await bcrypt3.hash(env.DEFAULT_ADMIN_PASSWORD, 12);
  const admin = await prisma.user.upsert({
    where: { email: env.DEFAULT_ADMIN_EMAIL.toLowerCase() },
    update: {
      password: hashed,
      emailVerified: true,
      statusId: activeStatus.id,
      deleted: false,
      deletedAt: null
    },
    create: {
      fullName: "System Administrator",
      email: env.DEFAULT_ADMIN_EMAIL.toLowerCase(),
      password: hashed,
      emailVerified: true,
      statusId: activeStatus.id,
      deleted: false
    }
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: adminRole.id }
  });
  logger.info({ message: "Default admin checked/created successfully" });
};

// src/modules/monitoring/scheduler/monitoring.scheduler.ts
import cron from "node-cron";

// src/modules/monitoring/service/monitoring-check.service.ts
import { MonitoringStatus as MonitoringStatus6 } from "@prisma/client";

// src/modules/monitoring/utils/icmp-check.ts
import { exec } from "child_process";
import os from "os";
var icmpCheck = (host, timeoutSeconds = 5) => {
  return new Promise((resolve) => {
    const isWindows = os.platform() === "win32";
    const command = isWindows ? `ping -n 3 -w ${timeoutSeconds * 1e3} ${host}` : `ping -c 3 -W ${timeoutSeconds} ${host}`;
    const start = Date.now();
    exec(command, { timeout: (timeoutSeconds + 2) * 1e3 }, (error, stdout) => {
      const responseTime = Date.now() - start;
      if (error) {
        resolve({
          reachable: false,
          responseTime: null,
          packetLoss: 100,
          message: `Host unreachable: ${error.message}`
        });
        return;
      }
      const packetLossMatch = stdout.match(/(\d+)%\s+packet loss/i);
      const packetLoss = packetLossMatch ? parseInt(packetLossMatch[1], 10) : null;
      const rttMatch = stdout.match(/(?:avg|mean)[^=]*=\s*[\d.]+\/([\d.]+)/i) || stdout.match(/Average\s*=\s*([\d.]+)/i);
      const avgRtt = rttMatch ? Math.round(parseFloat(rttMatch[1])) : responseTime;
      const reachable = packetLoss !== null ? packetLoss < 100 : !error;
      resolve({
        reachable,
        responseTime: reachable ? avgRtt : null,
        packetLoss: packetLoss ?? (reachable ? 0 : 100),
        message: reachable ? null : `Packet loss: ${packetLoss}%`
      });
    });
  });
};

// src/modules/monitoring/utils/tcp-check.ts
import net from "net";
var tcpCheck = (host, port, timeoutMs = 5e3) => {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = new net.Socket();
    const cleanup = () => {
      socket.destroy();
    };
    socket.setTimeout(timeoutMs);
    socket.on("connect", () => {
      const responseTime = Date.now() - start;
      cleanup();
      resolve({ reachable: true, responseTime, message: null });
    });
    socket.on("timeout", () => {
      cleanup();
      resolve({
        reachable: false,
        responseTime: null,
        message: `Connection timed out after ${timeoutMs}ms`
      });
    });
    socket.on("error", (err) => {
      cleanup();
      resolve({
        reachable: false,
        responseTime: null,
        message: err.message
      });
    });
    socket.connect(port, host);
  });
};

// src/modules/monitoring/repository/monitoring.repository.ts
var MonitoringRepository = class {
  async createLog(data) {
    return prisma.monitoringLog.create({ data });
  }
  async updateDeviceStatus(deviceId, status) {
    return prisma.device.update({
      where: { id: deviceId },
      data: { currentStatus: status }
    });
  }
  async findActiveDevices() {
    return prisma.device.findMany({
      where: { deleted: false, active: true },
      select: {
        id: true,
        name: true,
        ipAddress: true,
        currentStatus: true
      }
    });
  }
  async findEnabledServiceMonitors() {
    return prisma.serviceMonitor.findMany({
      where: {
        enabled: true,
        device: { deleted: false, active: true }
      },
      select: {
        id: true,
        name: true,
        type: true,
        port: true,
        timeoutSeconds: true,
        deviceId: true,
        device: {
          select: { id: true, name: true, ipAddress: true }
        }
      }
    });
  }
  async findLatestLogByDevice(deviceId) {
    return prisma.monitoringLog.findFirst({
      where: { deviceId },
      orderBy: { checkedAt: "desc" }
    });
  }
};

// src/modules/monitoring/service/alert-engine.service.ts
import { MonitoringStatus as MonitoringStatus5 } from "@prisma/client";
var AlertEngineService = class {
  // -------------------------------------------------------------------------
  // Device mudou de status
  // -------------------------------------------------------------------------
  async handleDeviceStatusChange(device, newStatus) {
    try {
      if (newStatus === MonitoringStatus5.OFFLINE) {
        await prisma.alert.create({
          data: {
            deviceId: device.id,
            title: `Device offline: ${device.name}`,
            message: `Device ${device.name} (${device.ipAddress}) stopped responding to ping.`,
            level: "CRITICAL"
          }
        });
        logger.warn({
          message: `[Alert] Device went OFFLINE`,
          device: device.name,
          ip: device.ipAddress
        });
      }
      if (newStatus === MonitoringStatus5.ONLINE) {
        await prisma.alert.updateMany({
          where: {
            deviceId: device.id,
            resolved: false,
            level: "CRITICAL"
          },
          data: {
            resolved: true
          }
        });
        logger.info({
          message: `[Alert] Device back ONLINE \u2014 alerts resolved`,
          device: device.name
        });
      }
    } catch (err) {
      logger.error({
        message: `[AlertEngine] Failed to handle device status change`,
        error: err instanceof Error ? err.message : String(err)
      });
    }
  }
  // -------------------------------------------------------------------------
  // Serviço está down
  // -------------------------------------------------------------------------
  async handleServiceDown(sm, errorMessage) {
    try {
      const existingAlert = await prisma.alert.findFirst({
        where: {
          deviceId: sm.deviceId,
          resolved: false,
          title: { contains: sm.type }
        }
      });
      if (existingAlert) return;
      await prisma.alert.create({
        data: {
          deviceId: sm.deviceId,
          title: `Service down: ${sm.type} on ${sm.device.name}`,
          message: `Service ${sm.name} (${sm.type}:${sm.port}) on device ${sm.device.name} (${sm.device.ipAddress}) is not responding. ${errorMessage ?? ""}`.trim(),
          level: "WARNING"
        }
      });
      logger.warn({
        message: `[Alert] Service DOWN`,
        service: sm.name,
        type: sm.type,
        port: sm.port,
        device: sm.device.name
      });
    } catch (err) {
      logger.error({
        message: `[AlertEngine] Failed to handle service down`,
        error: err instanceof Error ? err.message : String(err)
      });
    }
  }
};

// src/modules/monitoring/service/monitoring-check.service.ts
var MonitoringCheckService = class {
  constructor(repository2 = new MonitoringRepository(), alertEngine = new AlertEngineService()) {
    this.repository = repository2;
    this.alertEngine = alertEngine;
  }
  repository;
  alertEngine;
  // -------------------------------------------------------------------------
  // Ciclo principal — chamado pelo scheduler
  // -------------------------------------------------------------------------
  async runCycle() {
    logger.info({ message: "[Monitor] Starting monitoring cycle" });
    const [devices, serviceMonitors] = await Promise.all([
      this.repository.findActiveDevices(),
      this.repository.findEnabledServiceMonitors()
    ]);
    logger.info({
      message: `[Monitor] Checking ${devices.length} devices and ${serviceMonitors.length} services`
    });
    await this.runWithConcurrencyLimit(
      devices.map((device) => () => this.checkDevice(device)),
      10
    );
    await this.runWithConcurrencyLimit(
      serviceMonitors.map((sm) => () => this.checkService(sm)),
      10
    );
    logger.info({ message: "[Monitor] Cycle completed" });
  }
  // -------------------------------------------------------------------------
  // Verificação ICMP de um device
  // -------------------------------------------------------------------------
  async checkDevice(device) {
    try {
      const result = await icmpCheck(device.ipAddress, 5);
      const newStatus = result.reachable ? MonitoringStatus6.ONLINE : MonitoringStatus6.OFFLINE;
      await this.repository.createLog({
        deviceId: device.id,
        status: newStatus,
        responseTime: result.responseTime,
        packetLoss: result.packetLoss,
        message: result.message
      });
      await this.repository.updateDeviceStatus(device.id, newStatus);
      if (device.currentStatus !== newStatus) {
        await this.alertEngine.handleDeviceStatusChange(device, newStatus);
      }
      logger.info({
        message: `[Monitor] Device checked`,
        device: device.name,
        ip: device.ipAddress,
        status: newStatus,
        responseTime: result.responseTime
      });
    } catch (err) {
      logger.error({
        message: `[Monitor] Failed to check device`,
        device: device.name,
        error: err instanceof Error ? err.message : String(err)
      });
    }
  }
  // -------------------------------------------------------------------------
  // Verificação TCP de um serviço
  // -------------------------------------------------------------------------
  async checkService(sm) {
    try {
      const result = await tcpCheck(
        sm.device.ipAddress,
        sm.port,
        sm.timeoutSeconds * 1e3
      );
      const newStatus = result.reachable ? MonitoringStatus6.ONLINE : MonitoringStatus6.OFFLINE;
      await this.repository.createLog({
        deviceId: sm.deviceId,
        status: newStatus,
        responseTime: result.responseTime,
        packetLoss: null,
        message: result.reachable ? `Service ${sm.type}:${sm.port} is up` : `Service ${sm.type}:${sm.port} is down \u2014 ${result.message}`
      });
      if (!result.reachable) {
        await this.alertEngine.handleServiceDown(sm, result.message);
      }
      logger.info({
        message: `[Monitor] Service checked`,
        service: sm.name,
        type: sm.type,
        port: sm.port,
        device: sm.device.name,
        reachable: result.reachable,
        responseTime: result.responseTime
      });
    } catch (err) {
      logger.error({
        message: `[Monitor] Failed to check service`,
        service: sm.name,
        error: err instanceof Error ? err.message : String(err)
      });
    }
  }
  // -------------------------------------------------------------------------
  // Controlo de concorrência — evita sobrecarregar a rede com 100 pings ao mesmo tempo
  // -------------------------------------------------------------------------
  async runWithConcurrencyLimit(tasks, limit) {
    const results = [];
    const executing = /* @__PURE__ */ new Set();
    for (const task of tasks) {
      const promise = task().finally(() => executing.delete(promise));
      results.push(promise);
      executing.add(promise);
      if (executing.size >= limit) {
        await Promise.race(executing);
      }
    }
    await Promise.all(results);
  }
};

// src/modules/monitoring/scheduler/monitoring.scheduler.ts
var schedulerTask = null;
var isRunning = false;
var checkService = new MonitoringCheckService();
var startMonitoringScheduler = () => {
  if (!env.MONITOR_ENABLED) {
    logger.info({ message: "[Scheduler] Monitoring is disabled via MONITOR_ENABLED=false" });
    return;
  }
  const expression = env.MONITOR_CRON_EXPRESSION;
  if (!cron.validate(expression)) {
    logger.error({
      message: `[Scheduler] Invalid cron expression: "${expression}". Monitoring will not start.`
    });
    return;
  }
  schedulerTask = cron.schedule(expression, async () => {
    if (isRunning) {
      logger.warn({ message: "[Scheduler] Previous cycle still running \u2014 skipping this tick" });
      return;
    }
    isRunning = true;
    try {
      await checkService.runCycle();
    } catch (err) {
      logger.error({
        message: "[Scheduler] Unhandled error in monitoring cycle",
        error: err instanceof Error ? err.message : String(err)
      });
    } finally {
      isRunning = false;
    }
  });
  logger.info({
    message: `[Scheduler] Monitoring scheduler started`,
    expression,
    description: "Runs on schedule defined by MONITOR_CRON_EXPRESSION"
  });
};
var stopMonitoringScheduler = () => {
  if (schedulerTask) {
    schedulerTask.stop();
    schedulerTask = null;
    logger.info({ message: "[Scheduler] Monitoring scheduler stopped" });
  }
};

// src/server.ts
var connectDatabaseIfAvailable = async () => {
  try {
    await prisma.$connect();
    await bootstrapAdmin();
    startMonitoringScheduler();
    logger.info({ message: "Database connected and bootstrap completed" });
  } catch (error) {
    logger.warn({
      message: "Database unavailable; API started without persistence-dependent bootstrap",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};
var server = app.listen(env.APP_PORT, async () => {
  logger.info({ message: `Startup: ${env.APP_NAME} on port ${env.APP_PORT}` });
  await connectDatabaseIfAvailable();
  logger.info({ message: "HTTP server ready" });
});
var shutdown = async (signal) => {
  logger.info({ message: `Graceful shutdown started`, signal });
  server.close(async () => {
    stopMonitoringScheduler();
    await prisma.$disconnect();
    logger.info({ message: "Server closed successfully" });
    process.exit(0);
  });
};
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
//# sourceMappingURL=server.mjs.map