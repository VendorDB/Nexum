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
import { ObjectId } from 'mongodb'
import config from 'config'
import ms from 'ms'
import hat from 'hat'
import { sendMail } from '@util/mail'

export const post: Handler = async (req, res) => {
	const user: User = req.user
	const email: string = req.body.email

	if (!user) {
		res.status(401).json({
			status: 'ERROR',
			error: 'UNAUTHORIZED',
			message: 'Please log in first'
		})
		return
	}

	if (!email) {
		res.status(403).json({
			status: 'ERROR',
			error: 'MISSING_EMAIL',
			message: 'Please provide an e-mail address'
		})
		return
	}

	const vendor = <Vendor>await mongo.queryOne('Vendors', { _id: req.params.id })

	if (!vendor) {
		res.status(404).json({
			status: 'ERROR',
			error: 'NOT_FOUND',
			message: 'There is no vendor with the provided ID'
		})
		return
	}

	const url = new URL(vendor.url)

	if (!email.endsWith(`@${url.hostname}`)) {
		res.status(401).json({
			status: 'ERROR',
			error: 'INVALID_EMAIL',
			message: 'E-mail provider did not match'
		})
		return
	}

	const verificationCode = hat()

	mongo.insert('OwnershipRequests', {
		vendor: vendor._id,
		author: user._id,
		code: verificationCode,
		email,
		created: Date.now()
	})
		.then(() => {
			sendMail(email, 'ownership_verification', {
				username: user.username,
				vendor: vendor.name,
				link: config.get('client-url') + `/vendor/${vendor._id.toString()}/ownership/verify?code=${verificationCode}`
			})
				.then(() => {
					res.json({
						status: 'SUCCESS'
					})
				})
		})

}
