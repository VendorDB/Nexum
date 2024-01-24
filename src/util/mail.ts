// Copyright (C) 2023 Marcus Huber (xenorio) <dev@xenorio.xyz>
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import config from 'config'
import pug from 'pug'
import nodemailer from 'nodemailer'
import mongo from './mongo'
import { createHash } from 'crypto'

const mailTransporter = nodemailer.createTransport(config.get('mail.smtp'))

export const verifyMail = async (email: string) => {

	// Check whether email is properly formatted
	if (
		email == '' ||
		(email.match(/@/g) || []).length != 1 || // Checks if "@" occurs exactly once
		email.split('@')[0] == '' ||
		email.split('@')[1] == '' ||
		!email.split('@')[1].includes('.')
	) {
		return false
	}

	const hashedEmail = createHash('sha256').update(email).digest('base64')
	if (await mongo.queryOne('Bans', { email: hashedEmail })) {
		return false
	}

	const provider = email.split('@')[1].toLowerCase()
	const list: string[] = config.get('registration.email-providers.list')
	const type = config.get('registration.email-providers.type')
	let accepted

	// Set up fallback response based on list type
	// 0 = blacklist | 1 = whitelist
	if (type === 0) {
		accepted = true
	} else {
		accepted = false
	}

	// Go through every list item and check if it matches with provided email
	list.forEach(item => {
		if (provider == item || provider.endsWith('.' + item)) { // Matches domains and subdomains
			if (type === 0) {
				accepted = false
			} else {
				accepted = true
			}
		}
	})

	return accepted
}

export const sendMail = (email: string, templateName: string, data: any) => {
	return new Promise<void>((resolve) => {

		const html = pug.renderFile(process.cwd() + `/templates/mail/${templateName}.pug`, {
			email,
			...data,
			cache: true
		})

		mailTransporter.sendMail({
			from: config.get('mail.from'),
			to: email,
			subject: data.subject || config.get(`mail.subjects.${templateName}`) || 'No Subject',
			html
		})

		resolve()

	})
}

export default {
	verifyMail,
	sendMail
}