"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/infra/http/app.ts
var import_cors = __toESM(require("cors"));
var import_express8 = __toESM(require("express"));
var import_helmet = __toESM(require("helmet"));
var import_express_rate_limit = __toESM(require("express-rate-limit"));
var import_swagger_ui_express = __toESM(require("swagger-ui-express"));

// src/config/env.ts
var import_dotenv = __toESM(require("dotenv"));
var import_zod = require("zod");
import_dotenv.default.config();
var envSchema = import_zod.z.object({
  NODE_ENV: import_zod.z.enum(["development", "test", "production"]).default("development"),
  APP_NAME: import_zod.z.string().default("Mayongi Enterprise Backend"),
  APP_PORT: import_zod.z.coerce.number().int().positive().default(3e3),
  APP_VERSION: import_zod.z.string().default("1.0.0"),
  APP_PUBLIC_BASE_URL: import_zod.z.string().url().default("http://localhost:3000"),
  JWT_SECRET: import_zod.z.string().min(16),
  JWT_EXPIRATION: import_zod.z.string().default("3600000"),
  JWT_REFRESH_EXPIRATION: import_zod.z.string().default("86400000"),
  JWT_EMAIL_VERIFICATION_EXPIRATION: import_zod.z.string().default("1d"),
  JWT_RESET_PASSWORD_EXPIRATION: import_zod.z.string().default("1h"),
  DB_HOST: import_zod.z.string(),
  DB_PORT: import_zod.z.coerce.number().int().positive(),
  DB_NAME: import_zod.z.string(),
  DB_USER: import_zod.z.string(),
  DB_PASSWORD: import_zod.z.string(),
  REDIS_HOST: import_zod.z.string(),
  REDIS_PORT: import_zod.z.coerce.number().int().positive(),
  MAIL_HOST: import_zod.z.string(),
  MAIL_PORT: import_zod.z.coerce.number().int().positive(),
  MAIL_USERNAME: import_zod.z.string().default(""),
  MAIL_PASSWORD: import_zod.z.string().default(""),
  MAIL_FROM: import_zod.z.string().default("noreply@company.com"),
  CORS_ALLOWED_ORIGINS: import_zod.z.string().default("*"),
  DEFAULT_ADMIN_EMAIL: import_zod.z.string().email().default("admin@company.com"),
  DEFAULT_ADMIN_PASSWORD: import_zod.z.string().min(8).default("Admin123@")
});
var normalizedEnv = {
  ...process.env,
  MAIL_USERNAME: process.env.MAIL_USERNAME ?? process.env.MAIL_USER ?? ""
};
var parsed = envSchema.safeParse(normalizedEnv);
if (!parsed.success) {
  throw new Error(`Environment validation error: ${parsed.error.message}`);
}
var env = parsed.data;
var databaseUrl = `postgresql://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}?schema=public`;

// src/config/swagger.ts
var import_swagger_jsdoc = __toESM(require("swagger-jsdoc"));
var bearerSecurity = [{ bearerAuth: [] }];
var json = (schema) => ({
  content: {
    "application/json": {
      schema
    }
  }
});
var swaggerSpec = (0, import_swagger_jsdoc.default)({
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
  apis: []
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
var import_node_fs = __toESM(require("fs"));
var import_node_path = __toESM(require("path"));
var import_winston = require("winston");
var logsDir = import_node_path.default.resolve(process.cwd(), "logs");
if (!import_node_fs.default.existsSync(logsDir)) import_node_fs.default.mkdirSync(logsDir, { recursive: true });
var logger = (0, import_winston.createLogger)({
  level: "info",
  format: import_winston.format.combine(import_winston.format.timestamp(), import_winston.format.errors({ stack: true }), import_winston.format.json()),
  transports: [
    new import_winston.transports.Console(),
    new import_winston.transports.File({ filename: import_node_path.default.join(logsDir, "combined.log") }),
    new import_winston.transports.File({ filename: import_node_path.default.join(logsDir, "error.log"), level: "error" })
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
var import_node_crypto = require("crypto");
var requestContextMiddleware = (req, _res, next) => {
  req.requestId = (0, import_node_crypto.randomUUID)();
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
var import_express7 = require("express");

// src/modules/auth/routes/auth.routes.ts
var import_express = require("express");

// src/modules/auth/service/auth.service.ts
var import_bcrypt = __toESM(require("bcrypt"));
var import_crypto = require("crypto");
var import_ms = __toESM(require("ms"));

// src/modules/email/service/email.service.ts
var import_nodemailer = __toESM(require("nodemailer"));
var transporter = import_nodemailer.default.createTransport({
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

// src/infra/database/prisma.ts
var import_client = require("@prisma/client");
var import_adapter_pg = require("@prisma/adapter-pg");
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = databaseUrl;
}
var adapter = new import_adapter_pg.PrismaPg({ connectionString: process.env.DATABASE_URL });
var prisma = new import_client.PrismaClient({
  adapter,
  log: ["warn", "error"]
});

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
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var TokenService = class {
  signAccess(payload) {
    return import_jsonwebtoken.default.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRATION });
  }
  signRefresh(payload) {
    return import_jsonwebtoken.default.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRATION });
  }
  signEmailVerification(payload) {
    return import_jsonwebtoken.default.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EMAIL_VERIFICATION_EXPIRATION });
  }
  signResetPassword(payload) {
    return import_jsonwebtoken.default.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_RESET_PASSWORD_EXPIRATION });
  }
  verify(token) {
    return import_jsonwebtoken.default.verify(token, env.JWT_SECRET);
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
    return (0, import_crypto.randomBytes)(48).toString("base64url");
  }
  async issueTokens(user) {
    await this.repository.revokeAllRefreshTokens(user.id);
    const payload = { sub: user.id, email: user.email, roles: user.roles.map((x) => x.role.name) };
    const accessToken = this.tokenService.signAccess(payload);
    const refreshToken = `${(0, import_crypto.randomUUID)()}.${(0, import_crypto.randomUUID)()}`;
    await this.repository.createRefreshToken({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + (0, import_ms.default)(env.JWT_REFRESH_EXPIRATION))
    });
    return { accessToken, refreshToken };
  }
  async register(input) {
    const existing = await this.repository.findUserByEmail(input.email);
    if (existing) throw new AppError("Email already in use", 400);
    const userRole = await this.repository.getRoleByName("USER");
    if (!userRole) throw new AppError("Default role not configured", 500);
    const pendingStatus = await this.getOrCreateStatus("PENDING");
    const hashed = await import_bcrypt.default.hash(input.password, 12);
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
    const valid = await import_bcrypt.default.compare(input.password, user.password);
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
    const hashed = await import_bcrypt.default.hash(password, 12);
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
var validationMiddleware = (schema) => {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw new AppError("Validation error", 422, result.error.issues);
    }
    req.body = result.data;
    next();
  };
};

// src/modules/auth/validator/auth.validator.ts
var import_zod2 = require("zod");
var registerSchema = import_zod2.z.object({
  fullName: import_zod2.z.string().min(3),
  email: import_zod2.z.string().email(),
  password: import_zod2.z.string().min(8),
  phone: import_zod2.z.string().optional()
});
var loginSchema = import_zod2.z.object({
  email: import_zod2.z.string().email(),
  password: import_zod2.z.string().min(8)
});
var refreshSchema = import_zod2.z.object({
  refreshToken: import_zod2.z.string().min(10)
});
var forgotPasswordSchema = import_zod2.z.object({
  email: import_zod2.z.string().email()
});
var resetPasswordSchema = import_zod2.z.object({
  token: import_zod2.z.string().min(10),
  newPassword: import_zod2.z.string().min(8)
});
var resendVerificationEmailSchema = import_zod2.z.object({
  email: import_zod2.z.string().email()
});

// src/utils/async-handler.ts
var asyncHandler = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};

// src/modules/auth/routes/auth.routes.ts
var controller = new AuthController();
var authRoutes = (0, import_express.Router)();
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
var import_express2 = require("express");

// src/modules/users/service/user.service.ts
var import_bcrypt2 = __toESM(require("bcrypt"));

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
var import_client2 = require("@prisma/client");

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
      where: { ownerType: import_client2.ImageOwnerType.USER, ownerId: user.id, primaryImage: true, deleted: false },
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
    const hashed = await import_bcrypt2.default.hash(input.password, 12);
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
var import_client3 = require("@prisma/client");
var ImageService = class {
  async validateOwner(ownerType, ownerId) {
    if (ownerType === import_client3.ImageOwnerType.USER) {
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
    const ownerType = import_client3.ImageOwnerType[ownerTypeInput];
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
    const ownerType = import_client3.ImageOwnerType[ownerTypeInput];
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
    const ownerType = import_client3.ImageOwnerType[ownerTypeInput];
    if (!ownerType) throw new AppError("Invalid owner type", 400);
    return prisma.imageAsset.findFirst({
      where: { ownerType, ownerId, primaryImage: true, deleted: false },
      orderBy: { createdAt: "asc" }
    });
  }
  async setPrimary(ownerTypeInput, ownerId, imageId) {
    const ownerType = import_client3.ImageOwnerType[ownerTypeInput];
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
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"));
var authMiddleware = (req, _res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) throw new AppError("Missing authorization header", 401);
  const [type, token] = authorization.split(" ");
  if (type !== "Bearer" || !token) throw new AppError("Invalid authorization header", 401);
  try {
    const payload = import_jsonwebtoken2.default.verify(token, env.JWT_SECRET);
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
var import_zod3 = require("zod");
var createUserSchema = import_zod3.z.object({
  fullName: import_zod3.z.string().min(3),
  email: import_zod3.z.string().email(),
  password: import_zod3.z.string().min(8),
  phone: import_zod3.z.string().optional(),
  statusId: import_zod3.z.string().uuid().optional()
});
var updateUserSchema = import_zod3.z.object({
  fullName: import_zod3.z.string().min(3).optional(),
  email: import_zod3.z.string().email().optional(),
  phone: import_zod3.z.string().optional(),
  statusId: import_zod3.z.string().uuid().optional(),
  active: import_zod3.z.boolean().optional()
}).refine((obj) => Object.keys(obj).length > 0, { message: "At least one field must be sent" });
var addUserRoleSchema = import_zod3.z.object({
  roleName: import_zod3.z.string().min(1)
});
var profileImageSchema = import_zod3.z.object({
  url: import_zod3.z.string().url(),
  fileName: import_zod3.z.string().optional(),
  contentType: import_zod3.z.string().optional(),
  sizeBytes: import_zod3.z.number().int().positive().optional(),
  sortOrder: import_zod3.z.number().int().optional()
});

// src/modules/users/routes/user.routes.ts
var controller2 = new UserController();
var userRoutes = (0, import_express2.Router)();
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
var import_express3 = require("express");

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
var import_zod4 = require("zod");
var createRoleSchema = import_zod4.z.object({
  name: import_zod4.z.string().min(1),
  description: import_zod4.z.string().optional()
});
var patchRoleSchema = import_zod4.z.object({
  name: import_zod4.z.string().min(1).optional(),
  description: import_zod4.z.string().nullable().optional(),
  active: import_zod4.z.boolean().optional()
}).refine((obj) => Object.keys(obj).length > 0, { message: "At least one field must be sent" });

// src/modules/roles/routes/role.routes.ts
var controller3 = new RoleController();
var roleRoutes = (0, import_express3.Router)();
roleRoutes.use(authMiddleware);
roleRoutes.post("/", rolesMiddleware(["ADMIN"]), validationMiddleware(createRoleSchema), asyncHandler(controller3.create.bind(controller3)));
roleRoutes.get("/", asyncHandler(controller3.list.bind(controller3)));
roleRoutes.get("/:id", asyncHandler(controller3.get.bind(controller3)));
roleRoutes.put("/:id", rolesMiddleware(["ADMIN"]), validationMiddleware(createRoleSchema), asyncHandler(controller3.update.bind(controller3)));
roleRoutes.patch("/:id", rolesMiddleware(["ADMIN"]), validationMiddleware(patchRoleSchema), asyncHandler(controller3.patch.bind(controller3)));
roleRoutes.delete("/:id", rolesMiddleware(["ADMIN"]), asyncHandler(controller3.delete.bind(controller3)));

// src/modules/statuses/routes/status.routes.ts
var import_express4 = require("express");

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
var import_zod5 = require("zod");
var createStatusSchema = import_zod5.z.object({
  code: import_zod5.z.string().min(1),
  name: import_zod5.z.string().min(1),
  description: import_zod5.z.string().optional()
});
var patchStatusSchema = import_zod5.z.object({
  code: import_zod5.z.string().min(1).optional(),
  name: import_zod5.z.string().min(1).optional(),
  description: import_zod5.z.string().nullable().optional(),
  active: import_zod5.z.boolean().optional()
}).refine((obj) => Object.keys(obj).length > 0, { message: "At least one field must be sent" });

// src/modules/statuses/routes/status.routes.ts
var controller4 = new StatusController();
var statusRoutes = (0, import_express4.Router)();
statusRoutes.use(authMiddleware);
statusRoutes.post("/", rolesMiddleware(["ADMIN"]), validationMiddleware(createStatusSchema), asyncHandler(controller4.create.bind(controller4)));
statusRoutes.get("/", asyncHandler(controller4.list.bind(controller4)));
statusRoutes.get("/:id", asyncHandler(controller4.get.bind(controller4)));
statusRoutes.put("/:id", rolesMiddleware(["ADMIN"]), validationMiddleware(createStatusSchema), asyncHandler(controller4.update.bind(controller4)));
statusRoutes.patch("/:id", rolesMiddleware(["ADMIN"]), validationMiddleware(patchStatusSchema), asyncHandler(controller4.patch.bind(controller4)));
statusRoutes.delete("/:id", rolesMiddleware(["ADMIN"]), asyncHandler(controller4.delete.bind(controller4)));

// src/modules/tickets/routes/ticket.routes.ts
var import_express5 = require("express");

// src/modules/tickets/service/ticket.service.ts
var import_client4 = require("@prisma/client");
var TicketService = class {
  async create(userId, input) {
    return prisma.ticket.create({
      data: {
        subject: input.subject,
        description: input.description,
        status: import_client4.TicketStatus.PENDENTE,
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
      if ([import_client4.TicketStatus.RESOLVIDO, import_client4.TicketStatus.FECHADO].includes(ticket.status)) {
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
      if ([import_client4.TicketStatus.RESOLVIDO, import_client4.TicketStatus.FECHADO].includes(ticket.status)) {
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
var import_zod6 = require("zod");
var createTicketSchema = import_zod6.z.object({
  subject: import_zod6.z.string().min(1),
  description: import_zod6.z.string().min(1)
});
var patchTicketSchema = import_zod6.z.object({
  subject: import_zod6.z.string().min(1).optional(),
  description: import_zod6.z.string().min(1).optional()
}).refine((obj) => Object.keys(obj).length > 0, { message: "At least one field must be sent" });
var patchTicketStatusSchema = import_zod6.z.object({
  status: import_zod6.z.enum(["PENDENTE", "PROCESSANDO", "RESOLVIDO", "FECHADO"])
});

// src/modules/tickets/routes/ticket.routes.ts
var controller5 = new TicketController();
var ticketRoutes = (0, import_express5.Router)();
ticketRoutes.use(authMiddleware);
ticketRoutes.post("/", validationMiddleware(createTicketSchema), asyncHandler(controller5.create.bind(controller5)));
ticketRoutes.get("/", asyncHandler(controller5.list.bind(controller5)));
ticketRoutes.get("/:id", asyncHandler(controller5.get.bind(controller5)));
ticketRoutes.patch("/:id", validationMiddleware(patchTicketSchema), asyncHandler(controller5.patch.bind(controller5)));
ticketRoutes.patch("/:id/status", validationMiddleware(patchTicketStatusSchema), asyncHandler(controller5.patchStatus.bind(controller5)));
ticketRoutes.delete("/:id", asyncHandler(controller5.remove.bind(controller5)));

// src/modules/images/routes/image.routes.ts
var import_express6 = require("express");

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
var import_zod7 = require("zod");
var createImageSchema = import_zod7.z.object({
  url: import_zod7.z.string().url(),
  fileName: import_zod7.z.string().min(1),
  contentType: import_zod7.z.string().min(1),
  sizeBytes: import_zod7.z.number().int().positive(),
  primaryImage: import_zod7.z.boolean().optional(),
  sortOrder: import_zod7.z.number().int().optional()
});

// src/modules/images/routes/image.routes.ts
var controller6 = new ImageController();
var imageRoutes = (0, import_express6.Router)();
imageRoutes.use(authMiddleware);
imageRoutes.post("/:ownerType/:ownerId", rolesMiddleware(["ADMIN", "MANAGER"]), validationMiddleware(createImageSchema), asyncHandler(controller6.create.bind(controller6)));
imageRoutes.get("/:ownerType/:ownerId", asyncHandler(controller6.list.bind(controller6)));
imageRoutes.patch("/:ownerType/:ownerId/:imageId/primary", rolesMiddleware(["ADMIN", "MANAGER"]), asyncHandler(controller6.setPrimary.bind(controller6)));
imageRoutes.patch("/:imageId/status", rolesMiddleware(["ADMIN", "MANAGER"]), asyncHandler(controller6.patchStatus.bind(controller6)));
imageRoutes.delete("/:imageId", rolesMiddleware(["ADMIN", "MANAGER"]), asyncHandler(controller6.remove.bind(controller6)));

// src/shared/router.ts
var router = (0, import_express7.Router)();
router.use("/public/auth", authRoutes);
router.use("/api/users", userRoutes);
router.use("/api/roles", roleRoutes);
router.use("/api/statuses", statusRoutes);
router.use("/api/tickets", ticketRoutes);
router.use("/api/images", imageRoutes);

// src/infra/http/app.ts
var app = (0, import_express8.default)();
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
app.use((0, import_helmet.default)());
app.use(
  (0, import_cors.default)({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (isOriginAllowed(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
  })
);
app.use((0, import_express_rate_limit.default)({ windowMs: 15 * 60 * 1e3, limit: 300 }));
app.use(import_express8.default.json({ limit: "1mb" }));
app.use(import_express8.default.urlencoded({ extended: true }));
app.use(sanitizeMiddleware);
app.use(requestContextMiddleware);
app.use(requestLoggerMiddleware);
app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "healthy", data: { uptime: process.uptime() } });
});
app.get("/actuator/health", (_req, res) => {
  res.status(200).json({ status: "UP" });
});
app.use("/docs", import_swagger_ui_express.default.serve, import_swagger_ui_express.default.setup(swaggerSpec));
app.use(router);
app.use(errorMiddleware);

// src/infra/cache/redis.ts
var import_redis = require("redis");
var redisClient = (0, import_redis.createClient)({
  socket: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT
  }
});
redisClient.on("error", (error) => {
  logger.error({ message: "Redis client error", error: error.message });
});

// src/modules/auth/service/bootstrap-admin.service.ts
var import_bcrypt3 = __toESM(require("bcrypt"));
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
  const hashed = await import_bcrypt3.default.hash(env.DEFAULT_ADMIN_PASSWORD, 12);
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

// src/server.ts
var server = app.listen(env.APP_PORT, async () => {
  try {
    logger.info({ message: `Startup: ${env.APP_NAME} on port ${env.APP_PORT}` });
    await prisma.$connect();
    await redisClient.connect();
    await bootstrapAdmin();
    logger.info({ message: "Dependencies connected successfully" });
  } catch (error) {
    logger.error({
      message: "Startup failed while connecting dependencies",
      error: error instanceof Error ? error.message : String(error)
    });
    server.close(async () => {
      try {
        await prisma.$disconnect();
      } catch {
      }
      if (redisClient.isOpen) {
        try {
          await redisClient.disconnect();
        } catch {
        }
      }
      process.exit(1);
    });
  }
});
var shutdown = async (signal) => {
  logger.info({ message: `Graceful shutdown started`, signal });
  server.close(async () => {
    await prisma.$disconnect();
    if (redisClient.isOpen) await redisClient.disconnect();
    logger.info({ message: "Server closed successfully" });
    process.exit(0);
  });
};
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
//# sourceMappingURL=server.js.map