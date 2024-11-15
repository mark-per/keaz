import { Contact, Tag } from '@prisma/client';
import { CreateContactDto } from '../dto/create-contact.dto';
import { UpdateContactDto } from '../dto/update-contact.dto';
import { UpsertContactDto } from '../dto/keaz-create-contact.dto';
import { FindAllParams } from '../serviceImplementaion/contacts.service';
import { ContactWithTags } from '../entities/keaz-contact.entity';

export interface IContactsService {
    create(dto: CreateContactDto, userID: string): Promise<Contact>;
    findAll(params: FindAllParams): Promise<Contact[]>;
    findAllByTags(tagIds: string[], exclusive?: boolean): Promise<Contact[]>;
    getCount(userID: string): Promise<number>;
    findOne(id: string): Promise<ContactWithTags>;
    findOneByFonAndUser(fon: string, userID: string): Promise<Contact | null>;
    getKpis(userID: string): Promise<{ contactsCount: number; activeCount: number }>;
    createOrUpdateContactWithTags(service: any, upsertContactDto: UpsertContactDto, userID: string): Promise<Contact>;
    update(contactID: string, updateContactDto: UpdateContactDto): Promise<ContactWithTags>;
    upsert(dto: UpsertContactDto, tags: Tag[], userID: string): Promise<Contact>;
    addTagToContact(tagID: string, contactID: string): Promise<void>;
    addTagToContacts(tagID: string, contactIDs: string[], index: number): Promise<void>;
    removeTagFromContact(tagID: string, contact: ContactWithTags): Promise<void>;
    removeMany(contactIDs: string[]): Promise<void>;
    remove(contactID: string): Promise<void>;
}
