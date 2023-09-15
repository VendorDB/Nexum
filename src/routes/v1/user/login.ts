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
import { generateJWT } from '@util/user'
import mongo from '@util/mongo'
import bcrypt from 'bcrypt'
import { getDefaultPicture } from '@util/misc'

export const post: Handler = async (req, res) => {

	if (req.bot) {
		res.status(403).json({
			status: 'ERROR',
			error: 'USER_ONLY',
			message: 'This endpoint is only available to users'
		})
		return
	}

	if (!req.body.email) {
		res.status(403).json({
			status: 'ERROR',
			error: 'MISSING_EMAIL',
			message: 'Please provide an email address'
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

	const user = <User> await mongo.queryOne('Users', { email: req.body.email })

	if (!user) {
		res.status(404).json({
			status: 'ERROR',
			error: 'USER_NOT_FOUND',
			message: 'A user with the provided email does not exist'
		})
		return
	}

	if (!user.emailVerified) {
		res.status(403).json({
			status: 'ERROR',
			error: 'EMAIL_NOT_VERIFIED',
			message: 'This email address has not yet been verified'
		})
		return
	}

	const passwordValid = await bcrypt.compare(req.body.password, user.passwordHash)

	if (!passwordValid) {
		res.status(403).json({
			status: 'ERROR',
			error: 'INCORRECT_PASSWORD',
			message: 'The provided password is incorrect'
		})
		return
	}

	const token = generateJWT(user._id.toString(), 'USER', { expiresIn: '3d' })

	if(!user.profile_picture){
		user.profile_picture = getDefaultPicture()
	}

	res.cookie('session', token, {
		httpOnly: true,
		secure: true
	}).json({
		status: 'SUCCESS',
		user: {
			_id: user._id.toString(),
			username: user.username,
			admin: user.admin,
			email: user.email,
			profile_picture: user.profile_picture
		}
	})

}
