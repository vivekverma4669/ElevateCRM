import { Request, Response, NextFunction } from 'express';
import { Contact } from '../models/Contact';
import { Company } from '../models/Company';
import { sendSuccess, sendCreated } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { createContactSchema, updateContactSchema, createCompanySchema, updateCompanySchema } from '../validations/contactValidation';

export const contactController = {
  async getContacts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 10, search, company } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const filter: Record<string, unknown> = { createdBy: req.user!.userId };
      if (search) filter.$text = { $search: String(search) };
      if (company) filter.company = company;

      const [contacts, total] = await Promise.all([
        Contact.find(filter)
          .populate('company', 'name')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        Contact.countDocuments(filter),
      ]);

      sendSuccess(res, { contacts }, 'Contacts retrieved', 200, {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      });
    } catch (error) {
      next(error);
    }
  },

  async getContact(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const contact = await Contact.findOne({ _id: req.params.id, createdBy: req.user!.userId })
        .populate('company', 'name website industry')
        .populate('linkedLeads', 'name status value')
        .lean();

      if (!contact) throw new AppError('Contact not found', 404);
      sendSuccess(res, { contact });
    } catch (error) {
      next(error);
    }
  },

  async createContact(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createContactSchema.parse(req.body);
      const contact = await Contact.create({ ...data, createdBy: req.user!.userId });
      const populated = await contact.populate('company', 'name');
      sendCreated(res, { contact: populated }, 'Contact created');
    } catch (error) {
      next(error);
    }
  },

  async updateContact(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = updateContactSchema.parse(req.body);
      const contact = await Contact.findOneAndUpdate(
        { _id: req.params.id, createdBy: req.user!.userId },
        data,
        { new: true, runValidators: true }
      ).populate('company', 'name');

      if (!contact) throw new AppError('Contact not found', 404);
      sendSuccess(res, { contact }, 'Contact updated');
    } catch (error) {
      next(error);
    }
  },

  async deleteContact(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const contact = await Contact.findOneAndDelete({ _id: req.params.id, createdBy: req.user!.userId });
      if (!contact) throw new AppError('Contact not found', 404);
      sendSuccess(res, null, 'Contact deleted');
    } catch (error) {
      next(error);
    }
  },

  // Company endpoints
  async getCompanies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const filter: Record<string, unknown> = { createdBy: req.user!.userId };
      if (search) filter.$text = { $search: String(search) };

      const [companies, total] = await Promise.all([
        Company.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
        Company.countDocuments(filter),
      ]);

      sendSuccess(res, { companies }, 'Companies retrieved', 200, {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      });
    } catch (error) {
      next(error);
    }
  },

  async getCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const company = await Company.findOne({ _id: req.params.id, createdBy: req.user!.userId }).lean();
      if (!company) throw new AppError('Company not found', 404);

      const contacts = await Contact.find({ company: req.params.id }).select('name email position').lean();
      sendSuccess(res, { company, contacts });
    } catch (error) {
      next(error);
    }
  },

  async createCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createCompanySchema.parse(req.body);
      const company = await Company.create({ ...data, createdBy: req.user!.userId });
      sendCreated(res, { company }, 'Company created');
    } catch (error) {
      next(error);
    }
  },

  async updateCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = updateCompanySchema.parse(req.body);
      const company = await Company.findOneAndUpdate(
        { _id: req.params.id, createdBy: req.user!.userId },
        data,
        { new: true, runValidators: true }
      );

      if (!company) throw new AppError('Company not found', 404);
      sendSuccess(res, { company }, 'Company updated');
    } catch (error) {
      next(error);
    }
  },

  async deleteCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const company = await Company.findOneAndDelete({ _id: req.params.id, createdBy: req.user!.userId });
      if (!company) throw new AppError('Company not found', 404);
      // Unlink contacts from this company
      await Contact.updateMany({ company: req.params.id }, { $unset: { company: 1 } });
      sendSuccess(res, null, 'Company deleted');
    } catch (error) {
      next(error);
    }
  },
};
