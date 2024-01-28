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
import { sendMail } from '@util/mail'
import config from 'config'

export const post: Handler = async (req, res) => {

	if (req.bot) {
		res.status(403).json({
			status: 'ERROR',
			error: 'USER_ONLY',
			message: 'This endpoint is only available to users'
		})
		return
	}

	if (req.user) {
		res.status(403).json({
			status: 'ERROR',
			error: 'LOGGED_IN',
			message: 'You are already logged in'
		})
		return
	}

	if (!req.body.email || req.body.email.trim() == '') {
		res.status(403).json({
			status: 'ERROR',
			error: 'MISSING_EMAIL',
			message: 'Please provide an email address'
		})
		return
	}

	const email = req.body.email.toLowerCase()

	const user = <User | null> await mongo.queryOne('Users', {email, emailVerified: false})

	if (!user) {
		res.status(404).json({
			status: 'ERROR',
			error: 'NOT_FOUND',
			message: 'There is no un-verified user with this email address'
		})
		return
	}

	sendMail(email, 'verification', {
		username: user.username,
		link: config.get('client-url') + `/signup/verify-mail?code=${user.verificationCode}`
	})
	res.json({
		status: 'SUCCESS'
	})

}