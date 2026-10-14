import { Router } from 'express';

const router = Router();

/**
 * @openapi
 * /api/v1/health:
 *   get:
 *     tags:
 *       - System
 *     summary: Check whether the API is running
 *     description: Returns the current API status and server timestamp.
 *     operationId: checkApiHealth
 *     responses:
 *       200:
 *         description: The API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: FlashDeal API is running
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/', (request, response) => {
  response.status(200).json({
    success: true,
    message: 'FlashDeal API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
