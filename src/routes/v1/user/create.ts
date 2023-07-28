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

import { Handler } from 'express'
import mongo from '@util/mongo'
import config from 'config'
import { verifyMail, sendMail } from '@util/mail'
import { verifyUsername, verifyPassword } from '@util/user'
import bcrypt from 'bcrypt'
import hat from 'hat'
import { AgeFromDate } from 'age-calculator'

export const post: Handler = async (req, res) => {

	const email = req.body.email.trim()
	const username = req.body.username.trim()
	let password = req.body.password.trim()
	const dateOfBirth = req.body.dateOfBirth

	if ((new AgeFromDate(new Date(dateOfBirth))).age < 18) {
		res.status(403).json({
			status: 'ERROR',
			error: 'INVALID_DOB',
			message: 'The minimum allowed age is 18 years'
		})
		return
	}

	if (!verifyMail(email)) {
		res.status(403).json({
			status: 'ERROR',
			error: 'INVALID_EMAIL',
			message: 'The provided email address is blocked or invalid'
		})
		return
	}

	if (!verifyUsername(username)) {
		res.status(403).json({
			status: 'ERROR',
			error: 'INVALID_USERNAME',
			message: 'The provided username invalid'
		})
		return
	}

	if (!verifyPassword(password)) {
		res.status(403).json({
			status: 'ERROR',
			error: 'INVALID_PASSWORD',
			message: 'The provided password is invalid'
		})
		return
	}

	if (await mongo.queryOne('Users', { username: username })) {
		res.status(403).json({
			status: 'ERROR',
			error: 'USER_EXISTS',
			message: 'A user with the supplied username already exists'
		})
		return
	}

	if (await mongo.queryOne('Users', { email })) {
		res.status(403).json({
			status: 'ERROR',
			error: 'EMAIL_EXISTS',
			message: 'A user with the supplied email already exists'
		})
		return
	}

	// if (config.get('captcha.registration')) {
	// 	let captchaResult = await hcaptcha.verify(config.get('captcha.secret'), req.body.captchaToken)
	// 	if (captchaResult.success !== true) {
	// 		res.status(403).json({
	// 			status: 'ERROR',
	// 			error: 'INVALID_CAPTCHA',
	// 			message: 'The supplied captcha is invalid'
	// 		})
	// 		return
	// 	}
	// }

	bcrypt.hash(password, config.get('bcrypt.rounds'))
		.then(passwordHash => {

			password = '' // Possibly prevent some memory interception shenanigans, idk, may not do anything but doesn't hurt

			const verificationCode = hat()

			mongo.insert('Users', {
				username,
				email,
				emailVerified: false,
				verificationCode,
				passwordHash,
				admin: (email.toLowerCase() == (<string>config.get('registration.default-admin')).toLowerCase()),
				reputation: 0
			})
				.then(() => {

					sendMail(email, 'verification', {
						username,
						link: config.get('client-url') + `/verify-mail/${verificationCode}`
					})
					res.json({
						status: 'SUCCESS'
					})
				})

		})
		.catch(() => {
			res.status(500).json({
				status: 'ERROR',
				error: 'INVALID_PASSWORD',
				message: 'The provided password could not be processed'
			})
		})
}
