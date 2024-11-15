import {forwardRef, Inject, Injectable} from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import {formatFon} from "../../common/utils/formatPhonenumber";

@Injectable()
export class ContactValidationService {
    constructor(
        @Inject(forwardRef(() => ContactsService))
        private readonly contactsService: ContactsService,    ) {}

    async validatePhoneNumber(fon: string): Promise<boolean> {
        const internationalFormat = formatFon(fon);

        if (!internationalFormat) {
            throw new ForbiddenException('Invalid phone number');
        }

        return true;
    }


    async checkExistingContact(fon: string, userID: string): Promise<void> {
        const existingContact = await this.contactsService.findOneByFonAndUser(fon, userID);
        if (existingContact !== null) {
            throw new ForbiddenException('Contact already exists');
        }
    }
}
