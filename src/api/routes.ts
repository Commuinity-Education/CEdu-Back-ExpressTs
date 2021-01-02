import {Router} from 'express'
import v1 from './v1/routes'
import swaggerUi from 'swagger-ui-express'
import swaggerDoc from '../swagger.json'

const router = Router()

router.use('/v1', v1)
router.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerDoc))

export default router