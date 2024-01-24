// Copyright (C) 2024 Marcus Huber (xenorio) <dev@xenorio.xyz>
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
import { createHash } from 'crypto'
import { sendMail } from '@util/mail'

export const post: Handler = async (req, res) => {

	const id = req.body.id
	const reason = req.body.reason

	const user = <User> await mongo.queryOne('Users', {_id: new ObjectId(id)})

	mongo.remove('Users', {_id: new ObjectId(id)})

	const hashedEmail = createHash('sha256').update(user.email).digest('base64')

	mongo.insert('Bans', {
		email: hashedEmail,
		reason
	}).then((ban: any) => {
		sendMail(user.email, 'ban', {
			username: user.username,
			reason,
			banID: ban._id.toString()
		})

		res.json({
			status: 'SUCCESS'
		})

	})

}