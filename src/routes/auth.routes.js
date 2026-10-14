import { Router } from 'express';

import {
  getCurrentUser,
  login,
  register,
} from '../controllers/auth.controller.js';

import {
  authorizeRoles,
  protect,
} from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a customer or seller
 *     description: Creates a new user account and returns a JWT.
 *     operationId: registerUser
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/RegisterRequest"
 *           examples:
 *             customer:
 *               summary: Register a customer
 *               value:
 *                 fullName: Aline Uwase
 *                 email: aline@example.com
 *                 phone: "0788000000"
 *                 password: Password123
 *                 role: customer
 *             seller:
 *               summary: Register a seller
 *               value:
 *                 fullName: Eric Mugisha
 *                 email: eric@example.com
 *                 phone: "0788111111"
 *                 password: Password123
 *                 role: seller
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/AuthenticationResponse"
 *             example:
 *               success: true
 *               message: Account created successfully
 *               data:
 *                 user:
 *                   id: 68cfa3e0daa8e03ad9c93e71
 *                   fullName: Aline Uwase
 *                   email: aline@example.com
 *                   phone: "0788000000"
 *                   role: customer
 *                   isActive: true
 *                   createdAt: "2026-09-21T11:30:00.000Z"
 *                 token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Missing fields, invalid role, or validation failure
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ValidationErrorResponse"
 *       409:
 *         description: An account with the email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             example:
 *               success: false
 *               message: An account with this email already exists
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.post('/register', register);

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Log in to an existing account
 *     description: Verifies the credentials and returns a JWT.
 *     operationId: loginUser
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/LoginRequest"
 *           example:
 *             email: aline@example.com
 *             password: Password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/AuthenticationResponse"
 *             example:
 *               success: true
 *               message: Login successful
 *               data:
 *                 user:
 *                   id: 68cfa3e0daa8e03ad9c93e71
 *                   fullName: Aline Uwase
 *                   email: aline@example.com
 *                   phone: "0788000000"
 *                   role: customer
 *                   isActive: true
 *                   createdAt: "2026-09-21T11:30:00.000Z"
 *                 token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Email or password was not provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             example:
 *               success: false
 *               message: Invalid email or password
 *       403:
 *         description: The account has been disabled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.post('/login', login);

/**
 * @openapi
 * /api/v1/auth/me:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get the authenticated user's profile
 *     description: Returns the user associated with the supplied JWT.
 *     operationId: getCurrentUser
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/CurrentUserResponse"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         description: The user account has been disabled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get('/me', protect, getCurrentUser);

/**
 * @openapi
 * /api/v1/auth/customer-area:
 *   get:
 *     tags:
 *       - Customers
 *     summary: Test customer authorization
 *     description: This endpoint can only be accessed by customers.
 *     operationId: accessCustomerArea
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer access granted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               success: true
 *               message: Welcome to the customer area
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get(
  '/customer-area',
  protect,
  authorizeRoles('customer'),
  (request, response) => {
    response.status(200).json({
      success: true,
      message: 'Welcome to the customer area',
    });
  },
);

/**
 * @openapi
 * /api/v1/auth/seller-area:
 *   get:
 *     tags:
 *       - Sellers
 *     summary: Test seller authorization
 *     description: This endpoint can only be accessed by sellers.
 *     operationId: accessSellerArea
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller access granted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               success: true
 *               message: Welcome to the seller area
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get(
  '/seller-area',
  protect,
  authorizeRoles('seller'),
  (request, response) => {
    response.status(200).json({
      success: true,
      message: 'Welcome to the seller area',
    });
  },
);

export default router;
