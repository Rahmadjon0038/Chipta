const { Router } = require('express');
const ticketController = require('../controllers/ticket.controller');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/', ticketController.listTickets);
router.get('/:id', ticketController.getTicketById);

router.post('/', authMiddleware, adminMiddleware, ticketController.createTicket);
router.patch('/:id', authMiddleware, adminMiddleware, ticketController.updateTicket);
router.delete('/:id', authMiddleware, adminMiddleware, ticketController.deleteTicket);

module.exports = router;
