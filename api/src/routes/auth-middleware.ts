import { Router, Request, Response } from 'express';
import { authenticate } from '../middlewares/middleware-auth';

const router = Router();

router.get('/', authenticate, (req: Request, res: Response) => {
    res.json({
      message: 'Acesso autorizado!',
      user: req.user, 
    });
  });
export default router;