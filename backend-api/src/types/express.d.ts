import { User } from '../models/user.model'
import { Company } from '../models/company.model'
import 'express'

declare global {
  namespace Express {
    interface Request {
      user?: User
      company?: Company
    }
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: User
    company?: Company
  }
}
