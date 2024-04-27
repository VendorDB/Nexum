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

import mongo from '@util/mongo'
import { Request, Response } from 'express'

module.exports = {
	async post(req: Request, res: Response) {

		if (req.bot) {
			res.status(403).json({
				status: 'ERROR',
				error: 'USER_ONLY',
				message: 'This endpoint is only available to users'
			})
			return
		}

		const code = req.body.code

		if (!code) {
			res.status(403).json({
				status: 'ERROR',
				error: 'MISSING_CODE',
				message: 'Please provide a verification code'
			})
			return
		}

		const user = await mongo.queryOne('Users', { verificationCode: code })

		if (!user) {
			res.status(403).json({
				status: 'ERROR',
				error: 'INVALID_CODE',
				message: 'The provided code is invalid'
			})
			return
		}

		mongo.update('Users', user, { emailVerified: true, created: Date.now() })
			.then(() => {
				res.json({
					status: 'SUCCESS'
				})
			})

	}
}