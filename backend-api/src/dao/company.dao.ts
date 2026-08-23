import { Company } from '../models/company.model'
import { User } from '../models/user.model'
import { Subscription } from '../models/subscription.model'
import { Plan } from '../models/plan.model'
import workspaceDao from './workspace.dao'
import { Transaction } from 'sequelize'

export class CompanyDao {
  async onboardCompany(user: User, data: {
    name: string;
    website?: string;
    industry?: string;
    companySize?: string;
    country?: string;
    description?: string;
    supportEmail?: string;
    workspaceName?: string;
  }, options?: { transaction?: Transaction }): Promise<Company> {
    const t = options?.transaction;
    const existing = await Company.findOne({ where: { ownerUserId: user.id }, transaction: t })
    if (existing) {
      throw new Error('User already has an associated company')
    }

    const company = await Company.create({
      ownerUserId: user.id,
      name: data.name,
      website: data.website,
      industry: data.industry,
      companySize: data.companySize,
      country: data.country,
      description: data.description,
      supportEmail: data.supportEmail,
    }, { transaction: t })

    // Seed the free subscription
    const freePlan = await Plan.findOne({ where: { name: 'FREE' }, transaction: t })
    if (freePlan) {
      await Subscription.create({
        companyId: company.id,
        planId: freePlan.id,
        provider: 'none',
        status: 'active',
      }, { transaction: t })
    }

    // Provision default workspace
    await workspaceDao.createWorkspace({
      companyId: company.id,
      name: data.workspaceName || 'Main Workspace',
      description: 'Your default workspace',
    }, { transaction: t })

    return company
  }

  async findCompanyByUserId(userId: string): Promise<Company | null> {
    return Company.findOne({ where: { ownerUserId: userId } })
  }
  
  async findCompanyById(companyId: string): Promise<Company | null> {
    return Company.findByPk(companyId)
  }

  async updateCompany(
    id: string,
    data: {
      name?: string;
      website?: string;
      industry?: string;
      companySize?: string;
      country?: string;
      description?: string;
      supportEmail?: string;
    }
  ): Promise<Company | null> {
    const company = await this.findCompanyById(id)
    if (!company) return null

    return company.update(data)
  }
}

export default new CompanyDao()
