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
import { sendMail } from '@util/mail'
import { verifyPassword } from '@util/user'
import hat from 'hat'
import config from 'config'
import bcrypt from 'bcrypt'
import mongo from '@util/mongo'

export const post: Handler = async (req, res) => {

	if (!req.body.email) {
		res.status(403).json({
			status: 'ERROR',
			error: 'MISSING_EMAIL',
			message: 'Please provide an email address'
		})
		return
	}

	const user = <User> await mongo.queryOne('Users', { email: req.body.email })

	if (!user) {
		res.status(404).json({
			status: 'ERROR',
			error: 'USER_NOT_FOUND',
			message: 'A user with the provided email does not exist'
		})
		return
	}

	if (req.body.sendMail) {
		const recoveryCode = hat()
		await mongo.update('Users', user, { recoveryCode })
		sendMail(user.email, 'recovery', {
			link: config.get('client-url') + `/recover-password/${recoveryCode}`,
			username: user.username
		})
		res.json({
			status: 'SUCCESS'
		})
		return
	}

	if (!req.body.recoveryCode) {
		res.status(403).json({
			status: 'ERROR',
			error: 'MISSING_CODE',
			message: 'Please provide a recovery code'
		})
		return
	}

	if (req.body.recoveryCode !== user.recoveryCode) {
		res.status(403).json({
			status: 'ERROR',
			error: 'INVALID_CODE',
			message: 'The recovery code is invalid'
		})
		return
	}

	if (!req.body.password) {
		res.status(403).json({
			status: 'ERROR',
			error: 'MISSING_PASSWORD',
			message: 'Please provide a password'
		})
		return
	}

	if (!verifyPassword(req.body.password)) {
		res.status(403).json({
			status: 'ERROR',
			error: 'INVALID_PASSWORD',
			message: 'The supplied password is invalid'
		})
		return
	}

	const passwordHash = await bcrypt.hash(req.body.password, config.get('bcrypt.rounds'))

	await mongo.update('Users', user, { passwordHash })

	res.json({
		status: 'SUCCESS'
	})

}
